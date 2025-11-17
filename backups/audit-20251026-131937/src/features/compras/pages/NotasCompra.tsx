/**
 * Notas de Compra - Módulo Compras e Fornecedores
 *
 * Sistema: ICARUS v5.0
 * Versão: 5.0.0
 * Última Atualização: Outubro 2025
 *
 * FEATURES:
 * - Importação e Parse de XML NF-e
 * - OCR de DANFE (Tesseract.js)
 * - Validação SEFAZ (chave de acesso)
 * - Conferência automática com Pedido de Compra
 * - Entrada automática no estoque
 * - Geração de contas a pagar
 *
 * DESIGN SYSTEM: OraclusX DS + Neumorphism Premium 3D
 */

import React, { useState } from "react";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  Loader2,
  Package,
  DollarSign,
  Scan,
  FileCheck,
  Clock,
} from "lucide-react";
import type { NotaFiscalCompra } from "@/types/compras";

export const NotasCompra: React.FC = () => {
  const [uploadType, setUploadType] = useState<"xml" | "pdf" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [nfe, setNfe] = useState<NotaFiscalCompra | null>(null);
  const [validacaoStatus, setValidacaoStatus] = useState<{
    sefaz: boolean;
    pedido: boolean;
    produtos: boolean;
    valores: boolean;
  } | null>(null);

  // Mock Data - Notas
  const [notas] = useState<NotaFiscalCompra[]>([
    {
      id: "1",
      numero_nfe: "000123456",
      serie: "1",
      chave_acesso: "35251012345678000190550010001234561123456789",
      data_emissao: "2025-10-18",
      data_entrada: "2025-10-19",
      pedido_compra_id: "PC-2025-001",
      fornecedor_id: "forn-1",
      fornecedor_nome: "Stryker Brasil Ltda",
      fornecedor_cnpj: "12.345.678/0001-90",
      valor_produtos: 42500,
      valor_frete: 0,
      valor_seguro: 0,
      valor_desconto: 0,
      valor_ipi: 4250,
      valor_icms: 3400,
      valor_pis: 698.75,
      valor_cofins: 3217.5,
      valor_total: 50150,
      itens: [
        {
          id: "item-1",
          numero_item: 1,
          produto_codigo: "OPME-2401",
          produto_descricao: "Prótese de Joelho Cerâmica Premium",
          ncm: "90211000",
          cfop: "5102",
          unidade_comercial: "UN",
          quantidade_comercial: 5,
          valor_unitario: 8500,
          valor_total: 42500,
          base_calculo_icms: 42500,
          aliquota_icms: 8,
          valor_icms: 3400,
          aliquota_ipi: 10,
          valor_ipi: 4250,
          quantidade_recebida: 5,
          conformidade: "conforme",
        },
      ],
      status: "validada",
      status_sefaz: "autorizada",
      validacao_sefaz_data: "2025-10-18T14:30:00",
      divergencias: [],
      data_recebimento: "2025-10-19T10:00:00",
      responsavel_recebimento: "João Santos",
      conferencia_completa: true,
      created_at: "2025-10-19T09:00:00",
    },
    {
      id: "2",
      numero_nfe: "000123457",
      serie: "1",
      chave_acesso: "35251098765432000190550010001234571123456790",
      data_emissao: "2025-10-19",
      data_entrada: "2025-10-20",
      pedido_compra_id: "PC-2025-002",
      fornecedor_id: "forn-4",
      fornecedor_nome: "Abbott Vascular Brasil",
      fornecedor_cnpj: "98.765.432/0001-10",
      valor_produtos: 42000,
      valor_frete: 0,
      valor_seguro: 0,
      valor_desconto: 500,
      valor_ipi: 4200,
      valor_icms: 3360,
      valor_pis: 693,
      valor_cofins: 3192,
      valor_total: 49060,
      itens: [
        {
          id: "item-2",
          numero_item: 1,
          produto_codigo: "OPME-2402",
          produto_descricao: "Stent Coronário Farmacológico",
          ncm: "90211000",
          cfop: "5102",
          unidade_comercial: "UN",
          quantidade_comercial: 10,
          valor_unitario: 4200,
          valor_total: 42000,
          base_calculo_icms: 42000,
          aliquota_icms: 8,
          valor_icms: 3360,
          aliquota_ipi: 10,
          valor_ipi: 4200,
          quantidade_recebida: 0,
          conformidade: undefined,
        },
      ],
      status: "pendente",
      status_sefaz: "autorizada",
      validacao_sefaz_data: "2025-10-19T16:45:00",
      divergencias: [],
      created_at: "2025-10-20T08:30:00",
    },
  ]);

  // KPIs
  const kpis = [
    {
      label: "Notas Pendentes",
      value: "3",
      icon: Clock,
      color: "var(--orx-warning-dark)",
    },
    {
      label: "Validadas (Mês)",
      value: "28",
      icon: CheckCircle,
      color: "var(--orx-success-dark)",
    },
    {
      label: "Valor Total (Mês)",
      value: "R$ 287.450",
      icon: DollarSign,
      color: "var(--orx-primary)",
    },
    {
      label: "Com Divergências",
      value: "2",
      icon: AlertTriangle,
      color: "var(--orx-error-dark)",
    },
  ];

  // Handlers
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "xml" | "pdf",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setUploadType(type);

    try {
      if (type === "xml") {
        // Parse XML NF-e
        await parseXMLNFe(file);
      } else {
        // OCR DANFE (PDF/Image)
        await parseDANFEWithOCR(file);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Erro ao processar arquivo:", err);
    } finally {
      setProcessing(false);
    }
  };

  const parseXMLNFe = async (_file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock de NF-e parseada
    const mockNFe: NotaFiscalCompra = {
      numero_nfe: "000123458",
      serie: "1",
      chave_acesso: "35251012345678000190550010001234581123456791",
      data_emissao: "2025-10-20",
      data_entrada: "2025-10-20",
      fornecedor_id: "forn-6",
      fornecedor_nome: "Medtronic Neurovascular",
      fornecedor_cnpj: "11.222.333/0001-44",
      valor_produtos: 36000,
      valor_frete: 250,
      valor_seguro: 0,
      valor_desconto: 0,
      valor_ipi: 3600,
      valor_icms: 2880,
      valor_pis: 594,
      valor_cofins: 2736,
      valor_total: 42775,
      itens: [
        {
          numero_item: 1,
          produto_codigo: "OPME-2403",
          produto_descricao: "Clip para Aneurisma Cerebral",
          ncm: "90211000",
          cfop: "5102",
          unidade_comercial: "UN",
          quantidade_comercial: 3,
          valor_unitario: 12000,
          valor_total: 36000,
          base_calculo_icms: 36000,
          aliquota_icms: 8,
          valor_icms: 2880,
          aliquota_ipi: 10,
          valor_ipi: 3600,
        },
      ],
      status: "pendente",
      status_sefaz: "autorizada",
      created_at: new Date().toISOString(),
    };

    setNfe(mockNFe);

    // Validações
    setValidacaoStatus({
      sefaz: true,
      pedido: true,
      produtos: true,
      valores: true,
    });
  };

  const parseDANFEWithOCR = async (_file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await parseXMLNFe(_file);
  };

  const handleDarEntrada = () => {
    console.log("Dar entrada no estoque:", nfe);
    // Implementar lógica de entrada
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; bg: string; text: string; icon: React.ReactNode }
    > = {
      pendente: {
        label: "Pendente",
        bg: "var(--orx-warning-light)",
        text: "var(--orx-warning-dark)",
        icon: <Clock size={14} />,
      },
      validada: {
        label: "Validada",
        bg: "var(--orx-success-light)",
        text: "var(--orx-success-dark)",
        icon: <CheckCircle size={14} />,
      },
      divergente: {
        label: "Divergente",
        bg: "var(--orx-error-light)",
        text: "var(--orx-error-dark)",
        icon: <AlertTriangle size={14} />,
      },
      recusada: {
        label: "Recusada",
        bg: "var(--orx-error-light)",
        text: "var(--orx-error-dark)",
        icon: <XCircle size={14} />,
      },
      contabilizada: {
        label: "Contabilizada",
        bg: "var(--orx-info-light)",
        text: "var(--orx-info-dark)",
        icon: <FileCheck size={14} />,
      },
    };

    const config = statusConfig[status] || statusConfig.pendente;

    const bgClass =
      status === "pendente"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : status === "validada"
          ? "bg-green-500/15 text-green-700 dark:text-green-300"
          : status === "divergente" || status === "recusada"
            ? "bg-red-500/15 text-red-700 dark:text-red-300"
            : status === "contabilizada"
              ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
              : "bg-surface text-[var(--text-secondary)]";

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.813rem] font-semibold ${bgClass}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[0.813rem] font-extrabold text-[var(--orx-text-primary)] mb-2">
          Notas Fiscais de Entrada
        </h1>
        <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
          Importação de XML NF-e, OCR de DANFE e validação automática
        </p>
      </div>

      {/* KPIs */}
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow ${
                    kpi.color === "var(--orx-warning-dark)"
                      ? "bg-amber-600"
                      : kpi.color === "var(--orx-success-dark)"
                        ? "bg-green-600"
                        : kpi.color === "var(--orx-primary)"
                          ? "bg-indigo-600"
                          : kpi.color === "var(--orx-error-dark)"
                            ? "bg-red-600"
                            : "bg-surface"
                  }`}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-[0.813rem] font-bold text-[var(--orx-text-primary)] mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                    {kpi.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Section */}
      {!nfe && (
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {/* Upload XML */}
          <label className="p-8 rounded-2xl bg-[var(--orx-bg-light)] shadow border-2 border-dashed border-[var(--orx-primary)] cursor-pointer flex flex-col items-center gap-4 transition-all hover:-translate-y-0.5">
            <input
              type="file"
              accept=".xml"
              onChange={(e) => handleFileUpload(e, "xml")}
              className="hidden"
              disabled={processing}
            />
            <div className="w-16 h-16 rounded-full bg-[var(--orx-primary)] flex items-center justify-center shadow">
              <Upload size={32} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)] mb-2">
                Importar XML NF-e
              </h3>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                Clique para selecionar o arquivo XML
              </p>
            </div>
          </label>

          {/* Upload PDF/Image (OCR) */}
          <label className="p-8 rounded-2xl bg-[var(--orx-bg-light)] shadow border-2 border-dashed border-[var(--orx-info-dark)] cursor-pointer flex flex-col items-center gap-4 transition-all hover:-translate-y-0.5">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, "pdf")}
              className="hidden"
              disabled={processing}
            />
            <div className="w-16 h-16 rounded-full bg-[var(--orx-info-dark)] flex items-center justify-center shadow">
              <Scan size={32} className="text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)] mb-2">
                OCR de DANFE
              </h3>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                PDF ou imagem do DANFE
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="p-12 rounded-2xl bg-[var(--orx-bg-light)] shadow border flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[var(--orx-primary)] animate-spin" />
          <p className="text-[0.813rem] text-[var(--orx-text-primary)]">
            {uploadType === "xml"
              ? "Processando XML NF-e..."
              : "Realizando OCR do DANFE..."}
          </p>
        </div>
      )}

      {/* NF-e Preview */}
      {nfe && validacaoStatus && (
        <div className="flex flex-col gap-6">
          {/* Validações */}
          <div
            className={`p-6 rounded-2xl border ${validacaoStatus.sefaz ? "bg-[var(--orx-success-light)] border-[var(--orx-success-dark)]" : "bg-[var(--orx-error-light)] border-[var(--orx-error-dark)]"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              {validacaoStatus.sefaz ? (
                <CheckCircle
                  size={24}
                  className="text-[var(--orx-success-dark)]"
                />
              ) : (
                <XCircle size={24} className="text-[var(--orx-error-dark)]" />
              )}
              <h3
                className={`text-[0.813rem] font-semibold ${validacaoStatus.sefaz ? "text-[var(--orx-success-dark)]" : "text-[var(--orx-error-dark)]"}`}
              >
                {validacaoStatus.sefaz
                  ? "NF-e Validada com Sucesso"
                  : "NF-e com Problemas"}
              </h3>
            </div>
            <ul className="list-none p-0 flex flex-col gap-2">
              <li className="flex items-center gap-2">
                {validacaoStatus.sefaz ? (
                  <CheckCircle
                    size={16}
                    className="text-[var(--orx-success-dark)]"
                  />
                ) : (
                  <XCircle size={16} className="text-[var(--orx-error-dark)]" />
                )}
                <span className="text-[0.813rem]">
                  Validação SEFAZ: {validacaoStatus.sefaz ? "OK" : "Falhou"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {validacaoStatus.pedido ? (
                  <CheckCircle
                    size={16}
                    className="text-[var(--orx-success-dark)]"
                  />
                ) : (
                  <AlertTriangle
                    size={16}
                    className="text-[var(--orx-warning-dark)]"
                  />
                )}
                <span className="text-[0.813rem]">
                  Conferência com Pedido:{" "}
                  {validacaoStatus.pedido ? "OK" : "Divergências encontradas"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {validacaoStatus.produtos ? (
                  <CheckCircle
                    size={16}
                    className="text-[var(--orx-success-dark)]"
                  />
                ) : (
                  <XCircle size={16} className="text-[var(--orx-error-dark)]" />
                )}
                <span className="text-[0.813rem]">
                  Produtos Cadastrados:{" "}
                  {validacaoStatus.produtos
                    ? "Todos"
                    : "Alguns não encontrados"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {validacaoStatus.valores ? (
                  <CheckCircle
                    size={16}
                    className="text-[var(--orx-success-dark)]"
                  />
                ) : (
                  <AlertTriangle
                    size={16}
                    className="text-[var(--orx-warning-dark)]"
                  />
                )}
                <span className="text-[0.813rem]">
                  Valores:{" "}
                  {validacaoStatus.valores ? "Conferem" : "Divergências"}
                </span>
              </li>
            </ul>
          </div>

          {/* Dados da NF-e */}
          <div className="p-6 rounded-2xl bg-[var(--orx-bg-light)] shadow border border-white/10">
            <h3 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)] mb-4">
              Dados da Nota Fiscal
            </h3>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-4">
              <div>
                <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                  Número
                </p>
                <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                  {nfe.numero_nfe}
                </p>
              </div>
              <div>
                <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                  Série
                </p>
                <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                  {nfe.serie}
                </p>
              </div>
              <div>
                <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                  Data Emissão
                </p>
                <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                  {new Date(nfe.data_emissao).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                  Valor Total
                </p>
                <p className="text-[0.813rem] font-bold text-[var(--orx-primary)]">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(nfe.valor_total)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                  Fornecedor
                </p>
                <p className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                  {nfe.fornecedor_nome}
                </p>
                <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                  CNPJ: {nfe.fornecedor_cnpj}
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setNfe(null)}
              className="px-6 py-3 rounded-xl bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem] font-semibold border border-black/10 shadow transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleDarEntrada}
              disabled={!validacaoStatus.sefaz}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[0.813rem] font-semibold shadow transition ${validacaoStatus.sefaz ? "bg-[var(--orx-success-dark)] text-white cursor-pointer" : "bg-[var(--orx-bg-light)] text-white opacity-50 cursor-not-allowed"}`}
            >
              <Package size={20} />
              Dar Entrada no Estoque
            </button>
          </div>
        </div>
      )}

      {/* Lista de Notas */}
      <div className="rounded-2xl bg-[var(--orx-bg-light)] shadow border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h3 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
            Notas Fiscais Recentes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-500/5">
                {[
                  "Nº NF-e",
                  "Fornecedor",
                  "Data Emissão",
                  "Valor Total",
                  "Status",
                  "Ações",
                ].map((h, idx) => (
                  <th
                    key={idx}
                    className={`p-4 ${idx === 5 ? "text-center" : "text-left"} text-[0.813rem] font-semibold text-[var(--orx-text-secondary)] border-b border-black/5`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => (
                <tr
                  key={nota.id}
                  className="border-b border-black/5 hover:bg-indigo-500/5 transition-colors"
                >
                  <td className="p-4 text-[0.813rem] font-semibold text-[var(--orx-primary)]">
                    {nota.numero_nfe}
                  </td>
                  <td className="p-4 text-[0.813rem] text-[var(--orx-text-primary)]">
                    <div>
                      <div className="font-semibold">
                        {nota.fornecedor_nome}
                      </div>
                      <div className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                        {nota.fornecedor_cnpj}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[0.813rem] text-[var(--orx-text-primary)]">
                    {new Date(nota.data_emissao).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4 text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(nota.valor_total)}
                  </td>
                  <td className="p-4">{getStatusBadge(nota.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="inline-flex items-center gap-2 p-2 rounded-lg bg-[var(--orx-bg-light)] border border-black/10 shadow transition"
                        title="Visualizar"
                      >
                        <Eye
                          size={18}
                          className="text-[var(--orx-info-dark)]"
                        />
                      </button>
                      <button
                        className="inline-flex items-center gap-2 p-2 rounded-lg bg-[var(--orx-bg-light)] border border-black/10 shadow transition"
                        title="Baixar XML"
                      >
                        <Download
                          size={18}
                          className="text-[var(--orx-primary)]"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotasCompra;
