import asyncio
import functools
import io
import json
import logging
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional, TypedDict

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, StateGraph
from markdown_pdf import MarkdownPdf, Section
from pypdf import PdfReader
from supabase import Client, create_client

from llama_index.core import Document as LlamaDocument, Settings, SummaryIndex
from llama_index.llms.openai import OpenAI as LlamaOpenAI


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("icarus-orchestrator")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
INTERNAL_WEBHOOK_KEY = os.getenv("INTERNAL_WEBHOOK_KEY")
DOCUMENTS_BUCKET = os.getenv("DOCUMENTS_BUCKET", "documents")
NFE_BUCKET = os.getenv("NFE_BUCKET", "nfe")
REPORTS_BUCKET = os.getenv("REPORTS_BUCKET", "reports")
DEFAULT_AUDIT_SCOPE = os.getenv("DEFAULT_AUDIT_SCOPE", "full")
MAX_PARALLEL_AGENTS = int(os.getenv("MAX_PARALLEL_AGENTS", "4"))

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase credentials are mandatory.")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required for LangGraph checkpoints.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Configura LlamaIndex para sumarizar documentos dos buckets
llama_llm = LlamaOpenAI(model="gpt-4o-mini")
Settings.llm = llama_llm

checkpointer = PostgresSaver.from_conn_string(DATABASE_URL)


class OrquestradorState(TypedDict, total=False):
    task_id: str
    empresa_id: Optional[str]
    organization_id: Optional[str]
    user_id: Optional[str]
    query: str
    metadata: Dict[str, Any]
    next_agents: List[str]
    erp_dados: Dict[str, Any]
    documentos_contexto: Dict[str, Any]
    benchmark_contexto: Dict[str, Any]
    compliance_resultados: Dict[str, Any]
    auditoria_resultados: Dict[str, Any]
    relatorio_markdown: str
    report_url: str
    report_id: Optional[str]


app = FastAPI(title="ICARUS AI Orchestrator", version="5.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_in_thread(func, *args, **kwargs):
    return await asyncio.to_thread(functools.partial(func, *args, **kwargs))


async def fetch_task(task_id: str) -> Dict[str, Any]:
    def _run():
        return supabase.table("agent_tasks").select("*").eq("task_id", task_id).execute()

    response = await run_in_thread(_run)
    if response.error:
        raise HTTPException(status_code=500, detail=response.error.message)
    if not response.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return response.data[0]


async def update_task(task_id: str, payload: Dict[str, Any]) -> None:
    def _run():
        return (
            supabase.table("agent_tasks")
            .update(payload)
            .eq("task_id", task_id)
            .execute()
        )

    response = await run_in_thread(_run)
    if response.error:
        logger.error("Erro ao atualizar agent_tasks: %s", response.error.message)


async def log_agent_event(task_id: str, agent_name: str, event_type: str, action: str, details: Dict[str, Any]) -> None:
    payload = {
        "task_id": task_id,
        "agent_name": agent_name,
        "event_type": event_type,
        "action": action,
        "details": details,
    }

    def _run():
        return supabase.table("agent_logs").insert(payload).execute()

    response = await run_in_thread(_run)
    if response.error:
        logger.warning("Falha ao gravar log do agente %s: %s", agent_name, response.error.message)


async def merge_task_metadata(task_id: str, new_metadata: Dict[str, Any]) -> None:
    task = await fetch_task(task_id)
    metadata = task.get("metadata") or {}
    metadata.update(new_metadata)
    await update_task(task_id, {"metadata": metadata})


async def roteador(state: OrquestradorState) -> OrquestradorState:
    query_lower = state["query"].lower()
    agents = ["agente_erp"]

    if any(k in query_lower for k in ["nfe", "xml", "document", "nota fiscal"]):
        agents.append("agente_documentos")
    if any(k in query_lower for k in ["preço", "benchmark", "mercado", "cotação"]):
        agents.append("agente_benchmark")
    if any(k in query_lower for k in ["compliance", "lgpd", "anvisa", "udi"]):
        agents.append("agente_compliance")
    if any(k in query_lower for k in ["auditoria", "auditoria completa", "varredura"]):
        agents.append("agente_auditoria")

    agents.append("agente_sintese")
    deduped = []
    for agent in agents:
        if agent not in deduped:
            deduped.append(agent)

    logger.info("Roteador selecionou agentes: %s", deduped)
    return {**state, "next_agents": deduped}


async def agente_erp(state: OrquestradorState) -> Dict[str, Any]:
    async def _cirurgias():
        def _run():
            return (
                supabase.table("cirurgias")
                .select("id, procedimento, status, data_cirurgia")
                .order("data_cirurgia", desc=True)
                .limit(5)
                .execute()
            )

        return await run_in_thread(_run)

    async def _estoque():
        def _run():
            return (
                supabase.table("estoque_alertas")
                .select("id, tipo, mensagem, prioridade")
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )

        return await run_in_thread(_run)

    cirurgias_resp, estoque_resp = await asyncio.gather(_cirurgias(), _estoque())
    erp_dados = {
        "cirurgias": cirurgias_resp.data if not cirurgias_resp.error else [],
        "estoque_alertas": estoque_resp.data if not estoque_resp.error else [],
    }
    await log_agent_event(state["task_id"], "agente_erp", "task_completed", "Consultas ERP concluídas", {"records": len(erp_dados["cirurgias"])})
    return {"erp_dados": erp_dados}


async def _download_storage_files(bucket: str, limit: int = 2) -> List[Dict[str, Any]]:
    def _list():
        return supabase.storage.from_(bucket).list("", {"limit": limit})

    listing = await run_in_thread(_list)
    files = listing.get("data") or []
    result = []
    for file_obj in files[:limit]:
        path = file_obj["name"]

        def _download():
            return supabase.storage.from_(bucket).download(path)

        download_resp = await run_in_thread(_download)
        if isinstance(download_resp, bytes):
            result.append({"name": path, "data": download_resp})
    return result


async def agente_documentos(state: OrquestradorState) -> Dict[str, Any]:
    buckets = [DOCUMENTS_BUCKET, NFE_BUCKET]
    tasks = [asyncio.create_task(_download_storage_files(bucket)) for bucket in buckets]
    downloads = await asyncio.gather(*tasks)

    llama_docs: List[LlamaDocument] = []
    context_snippets: List[Dict[str, Any]] = []

    for bucket, files in zip(buckets, downloads):
        for file_entry in files:
            raw = file_entry["data"]
            text = ""
            try:
                reader = PdfReader(io.BytesIO(raw))
                text = "\n".join(
                    [page.extract_text() or "" for page in reader.pages]
                )
            except Exception:
                text = raw.decode("utf-8", errors="ignore")

            if not text:
                continue

            llama_docs.append(
                LlamaDocument(
                    text=text[:6000],
                    metadata={"bucket": bucket, "path": file_entry["name"]},
                )
            )
            context_snippets.append(
                {
                    "bucket": bucket,
                    "path": file_entry["name"],
                    "preview": text[:500],
                }
            )

    summary = None
    if llama_docs:
        try:
            summary_index = SummaryIndex.from_documents(llama_docs)
            summary_response = summary_index.as_query_engine().query(
                f"Resuma os achados relevantes para: {state['query']}"
            )
            summary = str(summary_response)
        except Exception as exc:
            logger.warning("Falha ao sintetizar via LlamaIndex: %s", exc)

    await log_agent_event(
        state["task_id"],
        "agente_documentos",
        "task_completed",
        "Documentos analisados",
        {"docs": len(llama_docs)},
    )

    return {
        "documentos_contexto": {
            "preview": context_snippets,
            "summary": summary,
        }
    }


async def agente_benchmark(state: OrquestradorState) -> Dict[str, Any]:
    embedding_vector = await embeddings.aembed_query(state["query"])

    def _rpc():
        payload = {
            "query_embedding": embedding_vector,
            "match_threshold": 0.25,
            "match_count": 5,
            "filter": {"empresa_id": state.get("empresa_id")},
        }
        return supabase.rpc("match_documentos", payload).execute()

    rpc_response = await run_in_thread(_rpc)
    vector_hits = rpc_response.data if not rpc_response.error else []

    tavily_data = []
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key:
        tavily_data = await fetch_tavily_results(state["query"], tavily_key)

    await log_agent_event(
        state["task_id"],
        "agente_benchmark",
        "task_completed",
        "Benchmark coletado",
        {"vector_hits": len(vector_hits), "web_hits": len(tavily_data)},
    )

    return {
        "benchmark_contexto": {
            "vetores": vector_hits,
            "mercado": tavily_data,
        }
    }


async def fetch_tavily_results(query: str, api_key: str) -> List[Dict[str, Any]]:
    import urllib.request

    payload = json.dumps({"query": query, "topic": "general", "max_results": 5}).encode()
    req = urllib.request.Request(
        "https://api.tavily.com/search",
        data=payload,
        headers={"Content-Type": "application/json", "Tavily-Api-Key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("results", [])
    except Exception as exc:
        logger.warning("Falha ao consultar Tavily: %s", exc)
        return []


async def agente_compliance(state: OrquestradorState) -> Dict[str, Any]:
    def _run():
        query = (
            supabase.table("compliance_requisitos")
            .select("codigo, descricao, status, categoria")
            .neq("status", "conforme")
            .limit(10)
        )
        if state.get("empresa_id"):
            query = query.eq("empresa_id", state["empresa_id"])
        return query.execute()

    response = await run_in_thread(_run)
    findings = response.data if not response.error else []

    await log_agent_event(
        state["task_id"],
        "agente_compliance",
        "task_completed",
        "Compliance auditado",
        {"pendencias": len(findings)},
    )
    return {"compliance_resultados": {"pendencias": findings}}


async def agente_auditoria(state: OrquestradorState) -> Dict[str, Any]:
    audit_scope = state.get("metadata", {}).get("audit_scope", DEFAULT_AUDIT_SCOPE)

    def _rpc():
        payload = {
            "p_scope": audit_scope,
            "p_empresa": state.get("empresa_id"),
            "p_user": state.get("user_id"),
        }
        return supabase.rpc("fn_executar_auditoria", payload).execute()

    response = await run_in_thread(_rpc)
    run_id = None
    if response.error:
        logger.error("Erro ao disparar auditoria: %s", response.error.message)
    elif response.data:
        run_id = response.data[0]

    insights = []
    if run_id:
        def _insights():
            return (
                supabase.table("audit_insights")
                .select("categoria, referencia, severidade, insight, recomendacao, detalhes")
                .eq("run_id", run_id)
                .limit(100)
                .execute()
            )

        insights_resp = await run_in_thread(_insights)
        insights = insights_resp.data if not insights_resp.error else []

    await log_agent_event(
        state["task_id"],
        "agente_auditoria",
        "task_completed",
        "Auditoria Supabase executada",
        {"run_id": run_id, "insights": len(insights)},
    )

    return {"auditoria_resultados": {"run_id": run_id, "insights": insights}}


async def executar_agentes(state: OrquestradorState) -> OrquestradorState:
    selected_agents = [a for a in state.get("next_agents", []) if a != "agente_sintese"]
    agent_map = {
        "agente_erp": agente_erp,
        "agente_documentos": agente_documentos,
        "agente_benchmark": agente_benchmark,
        "agente_compliance": agente_compliance,
        "agente_auditoria": agente_auditoria,
    }

    concurrency = min(MAX_PARALLEL_AGENTS, len(selected_agents))
    semaphore = asyncio.Semaphore(concurrency)

    async def run_agent(name: str):
        async with semaphore:
            fn = agent_map[name]
            return await fn(state)

    tasks = [asyncio.create_task(run_agent(agent)) for agent in selected_agents if agent in agent_map]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    merged: Dict[str, Any] = {}
    for result in results:
        if isinstance(result, Exception):
            logger.error("Erro no agente: %s", result)
            continue
        merged.update(result)

    return {**state, **merged}


async def agente_sintese(state: OrquestradorState) -> OrquestradorState:
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Você é o agente síntese do ERP ICARUS v5.0. Gere relatórios executivos em markdown, com KPIs e próximos passos.",
            ),
            (
                "human",
                "Query do usuário: {query}\n\n"
                "Dados ERP: {erp}\n\n"
                "Documentos: {docs}\n\n"
                "Benchmark: {benchmark}\n\n"
                "Compliance: {compliance}\n\n"
                "Auditoria: {auditoria}\n\n"
                "Gere um relatório com seções claras (Resumo Executivo, KPIs, Alertas, Recomendações) em português.",
            ),
        ]
    )

    chain = prompt | llm
    ai_message = await chain.ainvoke(
        {
            "query": state["query"],
            "erp": json.dumps(state.get("erp_dados", {}), ensure_ascii=False),
            "docs": json.dumps(state.get("documentos_contexto", {}), ensure_ascii=False),
            "benchmark": json.dumps(state.get("benchmark_contexto", {}), ensure_ascii=False),
            "compliance": json.dumps(state.get("compliance_resultados", {}), ensure_ascii=False),
            "auditoria": json.dumps(state.get("auditoria_resultados", {}), ensure_ascii=False),
        }
    )

    markdown_report = ai_message.content if isinstance(ai_message, AIMessage) else str(ai_message)
    pdf_url, report_id = await gerar_relatorio(state, markdown_report)

    return {**state, "relatorio_markdown": markdown_report, "report_url": pdf_url, "report_id": report_id}


async def gerar_relatorio(state: OrquestradorState, markdown_text: str):
    pdf = MarkdownPdf()
    pdf.add_section(Section(markdown_text))
    tmp_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(tmp_dir, f"{state['task_id']}.pdf")
    pdf.save(pdf_path)

    with open(pdf_path, "rb") as fp:
        pdf_bytes = fp.read()

    storage_path = f"{state['task_id']}/{datetime.utcnow().isoformat()}.pdf"

    def _upload():
        return supabase.storage.from_(REPORTS_BUCKET).upload(
            storage_path,
            pdf_bytes,
            {"content-type": "application/pdf", "cache-control": "3600", "upsert": True},
        )

    upload_resp = await run_in_thread(_upload)
    if upload_resp.get("error"):
        logger.error("Erro ao subir PDF: %s", upload_resp["error"]["message"])

    public_url = supabase.storage.from_(REPORTS_BUCKET).get_public_url(storage_path)
    await log_agent_event(state["task_id"], "agente_sintese", "task_completed", "Relatório publicado", {"url": public_url})

    report_payload = {
        "task_id": state["task_id"],
        "organization_id": state.get("organization_id"),
        "report_type": "custom",
        "title": f"Relatório IA - {state['query'][:80]}",
        "summary": markdown_text.split("\n")[0][:200],
        "content": markdown_text,
        "content_format": "markdown",
        "pdf_url": public_url,
        "report_url": public_url,
        "status": "published",
        "metadata": {
            "empresa_id": state.get("empresa_id"),
            "auditoria": state.get("auditoria_resultados", {}),
        },
    }

    def _insert():
        return supabase.table("agent_reports").insert(report_payload).execute()

    report_resp = await run_in_thread(_insert)
    report_id = None
    if report_resp.error:
        logger.error("Erro ao inserir agent_reports: %s", report_resp.error.message)
    elif report_resp.data:
        report_id = report_resp.data[0]["report_id"]

    return public_url, report_id


workflow = StateGraph(OrquestradorState)
workflow.add_node("roteador", roteador)
workflow.add_node("executar_agentes", executar_agentes)
workflow.add_node("agente_sintese", agente_sintese)
workflow.set_entry_point("roteador")
workflow.add_edge("roteador", "executar_agentes")
workflow.add_edge("executar_agentes", "agente_sintese")
workflow.add_edge("agente_sintese", END)

graph = workflow.compile(checkpointer=checkpointer)


async def sync_checkpoint_to_metadata(task_id: str):
    checkpoint = await checkpointer.aget({"configurable": {"thread_id": task_id}})
    if checkpoint:
        await merge_task_metadata(task_id, {"checkpoint": checkpoint})


@app.post("/run")
async def run_agent_task(payload: Dict[str, Any], internal_key: str = Header(..., alias="X-Internal-Key")):
    if internal_key != INTERNAL_WEBHOOK_KEY:
        raise HTTPException(status_code=403, detail="Chave interna inválida")

    task_id = payload.get("task_id")
    if not task_id:
        raise HTTPException(status_code=400, detail="task_id é obrigatório")

    task = await fetch_task(task_id)
    await update_task(task_id, {"status": "running", "started_at": datetime.utcnow().isoformat()})

    initial_state: OrquestradorState = {
        "task_id": task_id,
        "empresa_id": task.get("empresa_id"),
        "organization_id": task.get("organization_id"),
        "user_id": task.get("created_by") or task.get("user_id"),
        "query": task.get("query_text", task.get("query", "")),
        "metadata": task.get("metadata") or {},
    }

    try:
        result_state = await graph.ainvoke(initial_state, config={"configurable": {"thread_id": task_id}})
        await update_task(
            task_id,
            {
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "result_data": {
                    "report_url": result_state.get("report_url"),
                    "report_id": result_state.get("report_id"),
                    "audit": result_state.get("auditoria_resultados"),
                },
            },
        )
        await sync_checkpoint_to_metadata(task_id)
        return JSONResponse(
            {
                "task_id": task_id,
                "status": "completed",
                "report_url": result_state.get("report_url"),
                "report_id": result_state.get("report_id"),
            }
        )
    except Exception as exc:
        logger.exception("Falha ao executar task %s", task_id)
        await update_task(
            task_id,
            {
                "status": "failed",
                "error_message": str(exc),
            },
        )
        raise HTTPException(status_code=500, detail=f"Erro ao processar task: {exc}") from exc

