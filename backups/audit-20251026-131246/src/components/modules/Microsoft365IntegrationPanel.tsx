/**
 * Componente React: Microsoft 365 Integration Panel
 *
 * Interface para gerenciar integrações Microsoft 365
 * no contexto de distribuidoras OPME
 *
 * ENTIDADES:
 * - Hospitais (clientes, apresentações de produtos)
 * - Planos de Saúde (credenciamento, negociação de tabelas)
 * - Indústrias (fornecedores, negociação de compras)
 */

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/oraclusx-ds";
import {
  Calendar,
  Video,
  Mail,
  Users,
  FolderOpen,
  Plus,
  Send,
  Download,
  AlertCircle,
  Clock,
  Building2,
  Heart,
  Factory,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks";
import { useToast } from "@/contexts/ToastContext";
import {
  Microsoft365Integration,
  type TeamsReuniao,
} from "@/lib/microsoft365/Microsoft365Service";

type TeamsEventoResumo = {
  id?: string;
  subject: string;
  start: { dateTime: string };
  end: { dateTime: string };
  isOnlineMeeting?: boolean;
  onlineMeeting?: { joinUrl?: string };
};

export default function Microsoft365IntegrationPanel() {
  useDocumentTitle("Integração Microsoft 365");
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "teams" | "outlook" | "contatos" | "onedrive"
  >("teams");
  const [conectado, setConectado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proximasReunioes, setProximasReunioes] = useState<TeamsEventoResumo[]>(
    [],
  );
  const [novaReuniao, setNovaReuniao] = useState({
    assunto: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    participantes: [] as Array<{
      email: string;
      nome: string;
      tipo: "required" | "optional";
    }>,
    entidade_tipo: "" as "hospital" | "plano_saude" | "industria" | "",
    entidade_nome: "",
    tipo_reuniao: "",
  });
  const [showFormularioReuniao, setShowFormularioReuniao] = useState(false);

  // Verificar se está conectado
  const verificarConexao = useCallback(async () => {
    try {
      await Microsoft365Integration.getToken();
      setConectado(true);
      carregarProximasReunioes();
    } catch {
      setConectado(false);
    }
  }, [carregarProximasReunioes]);

  useEffect(() => {
    verificarConexao();
  }, [verificarConexao]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await Microsoft365Integration.login();
      setConectado(true);
      addToast("Conectado ao Microsoft 365 com sucesso!", "success");
      carregarProximasReunioes();
    } catch {
      addToast("Erro ao conectar Microsoft 365", "error");
    } finally {
      setLoading(false);
    }
  };

  const carregarProximasReunioes = useCallback(async () => {
    if (!conectado) return;

    setLoading(true);
    try {
      const reunioes =
        await Microsoft365Integration.teams.listarProximasReunioes(7);
      setProximasReunioes(reunioes);
    } catch {
      addToast("Erro ao carregar reuniões", "error");
    } finally {
      setLoading(false);
    }
  }, [conectado, addToast]);

  const handleCriarReuniao = async () => {
    if (
      !novaReuniao.assunto ||
      !novaReuniao.data_inicio ||
      !novaReuniao.data_fim
    ) {
      addToast("Preencha todos os campos obrigatórios", "warning");
      return;
    }

    setLoading(true);
    try {
      const reuniaoCompleta: TeamsReuniao = {
        assunto: novaReuniao.assunto,
        descricao: novaReuniao.descricao,
        data_inicio: novaReuniao.data_inicio,
        data_fim: novaReuniao.data_fim,
        participantes:
          novaReuniao.participantes.length > 0
            ? novaReuniao.participantes
            : [
                {
                  email: "exemplo@email.com",
                  nome: "Participante",
                  tipo: "required",
                },
              ],
        lembrete_minutos: 15,
        ...(novaReuniao.entidade_tipo && {
          entidade_tipo: novaReuniao.entidade_tipo,
          entidade_nome: novaReuniao.entidade_nome,
          tipo_reuniao: novaReuniao.tipo_reuniao,
        }),
      };

      await Microsoft365Integration.teams.criarReuniao(reuniaoCompleta);
      addToast("Reunião criada com sucesso!", "success");
      setShowFormularioReuniao(false);
      setNovaReuniao({
        assunto: "",
        descricao: "",
        data_inicio: "",
        data_fim: "",
        participantes: [],
        entidade_tipo: "",
        entidade_nome: "",
        tipo_reuniao: "",
      });
      carregarProximasReunioes();
    } catch {
      addToast("Erro ao criar reunião", "error");
      console.error("[Microsoft365] Erro ao criar reunião");
    } finally {
      setLoading(false);
    }
  };

  const criarReuniaoExemplo = async () => {
    const reuniao: TeamsReuniao = {
      assunto: "Apresentação de Produtos OPME - Hospital XYZ",
      descricao: `
        <h3>Agenda:</h3>
        <ul>
          <li>Apresentação de novos implantes ortopédicos</li>
          <li>Demonstração de rastreabilidade ANVISA</li>
          <li>Negociação de preços e condições</li>
          <li>Q&A</li>
        </ul>
        <p><strong>Preparar:</strong> Catálogo de produtos, tabela de preços, certificados ANVISA</p>
      `,
      data_inicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      data_fim: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      ).toISOString(),
      participantes: [
        {
          email: "compras@hospitalxyz.com.br",
          nome: "Gerente de Compras",
          tipo: "required",
        },
        {
          email: "medico@hospitalxyz.com.br",
          nome: "Dr. João Silva",
          tipo: "optional",
        },
      ],
      lembrete_minutos: 30,
      entidade_tipo: "hospital",
      entidade_nome: "Hospital XYZ",
      tipo_reuniao: "apresentacao_produto",
    };

    setLoading(true);
    try {
      await Microsoft365Integration.teams.criarReuniao(reuniao);
      addToast("Reunião de exemplo criada!", "success");
      carregarProximasReunioes();
    } catch {
      addToast("Erro ao criar reunião de exemplo", "error");
    } finally {
      setLoading(false);
    }
  };

  const _adicionarParticipante = () => {
    setNovaReuniao({
      ...novaReuniao,
      participantes: [
        ...novaReuniao.participantes,
        { email: "", nome: "", tipo: "required" },
      ],
    });
  };

  const _removerParticipante = (index: number) => {
    setNovaReuniao({
      ...novaReuniao,
      participantes: novaReuniao.participantes.filter((_, i) => i !== index),
    });
  };

  const _atualizarParticipante = (
    index: number,
    campo: "email" | "nome" | "tipo",
    valor: string,
  ) => {
    const novosParticipantes = [...novaReuniao.participantes];
    novosParticipantes[index] = {
      ...novosParticipantes[index],
      [campo]: valor,
    };
    setNovaReuniao({ ...novaReuniao, participantes: novosParticipantes });
  };

  // Renderizar tela de login
  if (!conectado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]">
        <Card className="max-w-md w-full p-8 neuro-raised text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full neuro-raised flex items-center justify-center">
              <Building2 size={32} className="text-[var(--orx-primary)]" />
            </div>
          </div>
          <h1 className="mb-2 text-[0.813rem] font-bold">
            Integração Microsoft 365
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Conecte sua conta Microsoft 365 para acessar Teams, Outlook e
            OneDrive diretamente do ICARUS.
          </p>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full px-6 py-3 bg-[var(--orx-primary)] text-white rounded-lg neuro-raised hover:bg-[var(--orx-primary-hover)] transition-all disabled:opacity-50"
          >
            {loading ? "Conectando..." : "Conectar Microsoft 365"}
          </button>
        </Card>
      </div>
    );
  }

  // Renderizar interface principal
  return (
    <div className="min-h-screen p-6 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-[0.813rem] font-bold">Microsoft 365</h1>
              <p className="text-[var(--text-secondary)]">
                Gerencie reuniões, emails e contatos integrados ao Microsoft 365
              </p>
            </div>
            <div className="flex items-center gap-2 neuro-raised px-4 py-2 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[0.813rem] font-medium">Conectado</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-2 neuro-inset rounded-2xl w-fit">
          {[
            { id: "teams", label: "Teams", icon: Video },
            { id: "outlook", label: "Outlook", icon: Mail },
            { id: "contatos", label: "Contatos", icon: Users },
            { id: "onedrive", label: "OneDrive", icon: FolderOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "neuro-raised text-[var(--orx-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Teams */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[0.813rem] font-semibold">
                  Próximas Reuniões
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={carregarProximasReunioes}
                    className="px-4 py-2 rounded-lg neuro-flat hover:neuro-raised transition-all"
                    title="Atualizar reuniões"
                    aria-label="Atualizar reuniões"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={criarReuniaoExemplo}
                    className="px-4 py-2 rounded-lg bg-[var(--orx-primary)] text-white hover:bg-[var(--orx-primary-hover)] transition-all flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Reunião de Exemplo
                  </button>
                  <button
                    onClick={() =>
                      setShowFormularioReuniao(!showFormularioReuniao)
                    }
                    className="px-4 py-2 rounded-lg bg-[var(--orx-primary)] text-white hover:bg-[var(--orx-primary-hover)] transition-all flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Nova Reunião
                  </button>
                </div>
              </div>

              {showFormularioReuniao && (
                <div className="mb-6 p-6 neuro-inset rounded-xl space-y-4">
                  <h3 className="mb-4 text-[0.813rem] font-semibold">
                    Criar Nova Reunião
                  </h3>

                  <input
                    type="text"
                    placeholder="Assunto da reunião"
                    value={novaReuniao.assunto}
                    onChange={(e) =>
                      setNovaReuniao({
                        ...novaReuniao,
                        assunto: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg neuro-flat bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)]"
                  />

                  <textarea
                    placeholder="Descrição (suporta HTML)"
                    value={novaReuniao.descricao}
                    onChange={(e) =>
                      setNovaReuniao({
                        ...novaReuniao,
                        descricao: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg neuro-flat bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)]"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-[0.813rem] font-medium">
                        Data/Hora Início
                      </label>
                      <input
                        type="datetime-local"
                        value={novaReuniao.data_inicio}
                        onChange={(e) =>
                          setNovaReuniao({
                            ...novaReuniao,
                            data_inicio: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg neuro-flat bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[0.813rem] font-medium">
                        Data/Hora Fim
                      </label>
                      <input
                        type="datetime-local"
                        value={novaReuniao.data_fim}
                        onChange={(e) =>
                          setNovaReuniao({
                            ...novaReuniao,
                            data_fim: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg neuro-flat bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)]"
                      />
                    </div>
                  </div>

                  {/* Tipo de Entidade */}
                  <div>
                    <label className="block mb-3 text-[0.813rem] font-medium">
                      Tipo de Entidade
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setNovaReuniao({
                            ...novaReuniao,
                            entidade_tipo: "hospital",
                            tipo_reuniao: "",
                          })
                        }
                        className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${
                          novaReuniao.entidade_tipo === "hospital"
                            ? "neuro-raised bg-[var(--orx-primary)]/10 border-2 border-[var(--orx-primary)]"
                            : "neuro-flat hover:neuro-raised"
                        }`}
                      >
                        <Building2 className="w-6 h-6 text-[var(--orx-primary)]" />
                        <span className="text-[0.813rem] font-medium">
                          Hospital
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNovaReuniao({
                            ...novaReuniao,
                            entidade_tipo: "plano_saude",
                            tipo_reuniao: "",
                          })
                        }
                        className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${
                          novaReuniao.entidade_tipo === "plano_saude"
                            ? "neuro-raised bg-emerald-500/10 border-2 border-emerald-500"
                            : "neuro-flat hover:neuro-raised"
                        }`}
                      >
                        <Heart className="w-6 h-6 text-emerald-500" />
                        <span className="text-[0.813rem] font-medium">
                          Plano de Saúde
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNovaReuniao({
                            ...novaReuniao,
                            entidade_tipo: "industria",
                            tipo_reuniao: "",
                          })
                        }
                        className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${
                          novaReuniao.entidade_tipo === "industria"
                            ? "neuro-raised bg-orange-500/10 border-2 border-orange-500"
                            : "neuro-flat hover:neuro-raised"
                        }`}
                      >
                        <Factory className="w-6 h-6 text-orange-500" />
                        <span className="text-[0.813rem] font-medium">
                          Indústria
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Nome da Entidade */}
                  {novaReuniao.entidade_tipo && (
                    <input
                      type="text"
                      placeholder={`Nome ${
                        novaReuniao.entidade_tipo === "hospital"
                          ? "do Hospital (ex: Hospital São Lucas)"
                          : novaReuniao.entidade_tipo === "plano_saude"
                            ? "do Plano de Saúde (ex: Unimed São Paulo)"
                            : "da Indústria (ex: Medtronic Brasil)"
                      }`}
                      value={novaReuniao.entidade_nome}
                      onChange={(e) =>
                        setNovaReuniao({
                          ...novaReuniao,
                          entidade_nome: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg neuro-flat bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)]"
                    />
                  )}

                  {/* Finalidade da Reunião */}
                  {novaReuniao.entidade_tipo && (
                    <div>
                      <label className="block mb-2 text-[0.813rem] font-medium">
                        Finalidade da Reunião
                      </label>
                      <select
                        value={novaReuniao.tipo_reuniao}
                        onChange={(e) =>
                          setNovaReuniao({
                            ...novaReuniao,
                            tipo_reuniao: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg neuro-inset bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)]"
                      >
                        <option value="">Selecione a finalidade</option>
                        {novaReuniao.entidade_tipo === "hospital" && (
                          <>
                            <option value="apresentacao_produto">
                              Apresentação de Produto
                            </option>
                            <option value="negociacao">
                              Negociação Comercial
                            </option>
                            <option value="treinamento">Treinamento</option>
                            <option value="pos_venda">Pós-Venda</option>
                            <option value="licitacao">Licitação</option>
                            <option value="auditoria">Auditoria OPME</option>
                          </>
                        )}
                        {novaReuniao.entidade_tipo === "plano_saude" && (
                          <>
                            <option value="negociacao">
                              Negociação de Tabela
                            </option>
                            <option value="credenciamento">
                              Credenciamento
                            </option>
                            <option value="auditoria">
                              Auditoria de Contas
                            </option>
                            <option value="comercial">
                              Apresentação Comercial
                            </option>
                          </>
                        )}
                        {novaReuniao.entidade_tipo === "industria" && (
                          <>
                            <option value="negociacao">
                              Negociação de Compra
                            </option>
                            <option value="apresentacao_produto">
                              Apresentação de Linha
                            </option>
                            <option value="treinamento">
                              Treinamento Técnico
                            </option>
                            <option value="comercial">
                              Proposta de Distribuição
                            </option>
                            <option value="qualidade">
                              Qualidade/Certificações
                            </option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--text-secondary)]/20">
                    <button
                      onClick={() => setShowFormularioReuniao(false)}
                      className="px-6 py-2 rounded-lg neuro-flat hover:neuro-raised transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCriarReuniao}
                      disabled={loading}
                      className="px-6 py-2 rounded-lg bg-[var(--orx-primary)] text-white hover:bg-[var(--orx-primary-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send size={18} />
                      {loading ? "Criando..." : "Criar Reunião"}
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Reuniões */}
              <div className="space-y-3">
                {proximasReunioes.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)] neuro-flat rounded-lg">
                    <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Nenhuma reunião agendada nos próximos 7 dias</p>
                  </div>
                ) : (
                  proximasReunioes.map((reuniao) => (
                    <div
                      key={reuniao.id}
                      className="p-4 neuro-flat rounded-lg hover:neuro-raised transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold">
                            {reuniao.subject}
                          </h3>
                          <div className="flex items-center gap-4 text-[var(--text-secondary)] text-[0.813rem]">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(reuniao.start.dateTime).toLocaleString(
                                "pt-BR",
                              )}
                            </div>
                            {reuniao.isOnlineMeeting && (
                              <div className="flex items-center gap-1 text-[var(--orx-primary)]">
                                <Video size={14} />
                                Teams
                              </div>
                            )}
                          </div>
                        </div>
                        {reuniao.onlineMeeting && (
                          <a
                            href={reuniao.onlineMeeting.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-[var(--orx-primary)] text-white hover:bg-[var(--orx-primary-hover)] transition-all flex items-center gap-2 text-[0.813rem]"
                          >
                            <Video size={16} />
                            Entrar
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Outros tabs (placeholder) */}
        {activeTab !== "teams" && (
          <Card className="p-8 text-center">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-[var(--text-secondary)]"
            />
            <h3 className="mb-2 text-[0.813rem] font-semibold">
              Em Desenvolvimento
            </h3>
            <p className="text-[var(--text-secondary)]">
              Esta funcionalidade estará disponível em breve.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
