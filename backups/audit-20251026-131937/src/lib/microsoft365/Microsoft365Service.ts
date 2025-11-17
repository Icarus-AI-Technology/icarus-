/**
 * Microsoft Graph API Integration
 *
 * OBJETIVO:
 * Integrar ICARUS com Microsoft 365 para distribuidoras OPME
 * que utilizam Teams, Outlook e outras ferramentas Microsoft
 *
 * FUNCIONALIDADES:
 * 1. Agendamento de reuniões no Microsoft Teams
 * 2. Sincronização com Outlook Calendar
 * 3. Envio de emails via Outlook
 * 4. Gestão de contatos (hospitais, planos de saúde, indústrias)
 * 5. Compartilhamento de arquivos (OneDrive/SharePoint)
 *
 * AUTENTICAÇÃO:
 * - OAuth 2.0 (MSAL - Microsoft Authentication Library)
 * - Permissões: Calendars.ReadWrite, OnlineMeetings.ReadWrite, Mail.Send
 *
 * CONTEXTO:
 * - Distribuidoras OPME fazem muitas reuniões com:
 *   * Hospitais (apresentação de produtos, vendas)
 *   * Planos de Saúde (credenciamento, negociação de tabelas)
 *   * Indústrias (negociação de compras, distribuição)
 */

import { Client } from "@microsoft/microsoft-graph-client";
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";

// Configuração MSAL (Microsoft Authentication Library)
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

// Scopes necessários
const loginRequest = {
  scopes: [
    "User.Read",
    "Calendars.ReadWrite",
    "OnlineMeetings.ReadWrite",
    "Mail.Send",
    "Contacts.ReadWrite",
    "Files.ReadWrite.All", // OneDrive/SharePoint
  ],
};

const msalInstance = new PublicClientApplication(msalConfig);

// Tipos
export interface TeamsReuniao {
  assunto: string;
  descricao: string;
  data_inicio: string; // ISO 8601
  data_fim: string; // ISO 8601
  participantes: Array<{
    email: string;
    nome: string;
    tipo: "required" | "optional";
  }>;
  lembrete_minutos?: number;
  entidade_tipo?: "hospital" | "plano_saude" | "industria"; // Tipo de entidade da reunião
  entidade_nome?: string; // Nome da entidade (ex:"Hospital São Lucas","Unimed","Medtronic")
  tipo_reuniao?: string; // Ex:"apresentacao_produto","negociacao","comercial", etc
  recorrencia?: {
    tipo: "daily" | "weekly" | "monthly";
    intervalo: number; // A cada X dias/semanas/meses
    data_fim: string; // ISO 8601
  };
}

export interface EmailOutlook {
  para: string[];
  cc?: string[];
  cco?: string[];
  assunto: string;
  corpo: string;
  corpo_html?: string;
  anexos?: Array<{
    nome: string;
    conteudo_base64: string;
    tipo_mime: string;
  }>;
  importancia?: "low" | "normal" | "high";
}

export interface ContatoOutlook {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  categoria: "hospital" | "plano_saude" | "industria";
}

// Classes de serviço
class MicrosoftTeamsService {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Criar reunião no Teams
   */
  async criarReuniao(reuniao: TeamsReuniao): Promise<{ id: string }> {
    try {
      const evento = {
        subject: reuniao.assunto,
        body: {
          contentType: "HTML",
          content: reuniao.descricao,
        },
        start: {
          dateTime: reuniao.data_inicio,
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: reuniao.data_fim,
          timeZone: "America/Sao_Paulo",
        },
        attendees: reuniao.participantes.map((p) => ({
          emailAddress: {
            address: p.email,
            name: p.nome,
          },
          type: p.tipo,
        })),
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness",
        reminderMinutesBeforeStart: reuniao.lembrete_minutos || 15,
        ...(reuniao.recorrencia && {
          recurrence: {
            pattern: {
              type: reuniao.recorrencia.tipo,
              interval: reuniao.recorrencia.intervalo,
            },
            range: {
              type: "endDate",
              startDate: new Date(reuniao.data_inicio)
                .toISOString()
                .split("T")[0],
              endDate: new Date(reuniao.recorrencia.data_fim)
                .toISOString()
                .split("T")[0],
            },
          },
        }),
      };

      const novoEvento = (await this.graphClient
        .api("/me/events")
        .post(evento)) as { id: string };

      console.log("[MicrosoftTeams] Reunião criada:", novoEvento);
      return novoEvento;
    } catch (error) {
      const err = error as Error;
      console.error("[MicrosoftTeams] Erro ao criar reunião:", err);
      throw error;
    }
  }

  /**
   * Listar próximas reuniões
   */
  async listarProximasReunioes(
    dias: number = 7,
  ): Promise<
    Array<{
      id?: string;
      subject: string;
      start: { dateTime: string };
      end: { dateTime: string };
      isOnlineMeeting?: boolean;
      onlineMeeting?: { joinUrl?: string };
    }>
  > {
    try {
      const dataInicio = new Date().toISOString();
      const dataFim = new Date(
        Date.now() + dias * 24 * 60 * 60 * 1000,
      ).toISOString();

      const eventos = (await this.graphClient
        .api("/me/calendar/events")
        .filter(
          `start/dateTime ge '${dataInicio}' and end/dateTime le '${dataFim}'`,
        )
        .select("subject,start,end,isOnlineMeeting,onlineMeeting")
        .orderby("start/dateTime")
        .get()) as {
        value: Array<{
          id?: string;
          subject: string;
          start: { dateTime: string };
          end: { dateTime: string };
          isOnlineMeeting?: boolean;
          onlineMeeting?: { joinUrl?: string };
        }>;
      };

      return eventos.value;
    } catch (error) {
      const err = error as Error;
      console.error("[MicrosoftTeams] Erro ao listar reuniões:", err);
      throw error;
    }
  }

  /**
   * Cancelar reunião
   */
  async cancelarReuniao(eventoId: string, mensagem: string): Promise<void> {
    try {
      await this.graphClient.api(`/me/events/${eventoId}/cancel`).post({
        comment: mensagem,
      });

      console.log("[MicrosoftTeams] Reunião cancelada:", eventoId);
    } catch (error) {
      const err = error as Error;
      console.error("[MicrosoftTeams] Erro ao cancelar reunião:", err);
      throw error;
    }
  }
}

class OutlookEmailService {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Enviar email
   */
  async enviarEmail(email: EmailOutlook): Promise<void> {
    try {
      const mensagem = {
        message: {
          subject: email.assunto,
          body: {
            contentType: email.corpo_html ? "HTML" : "Text",
            content: email.corpo_html || email.corpo,
          },
          toRecipients: email.para.map((e) => ({
            emailAddress: { address: e },
          })),
          ...(email.cc && {
            ccRecipients: email.cc.map((e) => ({
              emailAddress: { address: e },
            })),
          }),
          ...(email.cco && {
            bccRecipients: email.cco.map((e) => ({
              emailAddress: { address: e },
            })),
          }),
          importance: email.importancia || "normal",
          ...(email.anexos && {
            attachments: email.anexos.map((a) => ({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: a.nome,
              contentType: a.tipo_mime,
              contentBytes: a.conteudo_base64,
            })),
          }),
        },
        saveToSentItems: true,
      };

      await this.graphClient.api("/me/sendMail").post(mensagem);
      console.log("[OutlookEmail] Email enviado com sucesso");
    } catch (error) {
      const err = error as Error;
      console.error("[OutlookEmail] Erro ao enviar email:", err);
      throw error;
    }
  }

  /**
   * Enviar NF-e por email (atalho)
   */
  async enviarNFeEmail(
    destinatario: string,
    numeroNFe: number,
    urlDanfe: string,
    urlXml: string,
  ): Promise<void> {
    const corpo_html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { background-color: var(--orx-primary); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; }
            .button { background-color: var(--orx-primary); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Nota Fiscal Eletrônica - NF-e ${numeroNFe}</h2>
          </div>
          <div class="content">
            <p>Prezado(a),</p>
            <p>Segue em anexo a Nota Fiscal Eletrônica referente à operação realizada.</p>
            <p>
              <a href="${urlDanfe}" class="button">Baixar DANFE (PDF)</a>
              <a href="${urlXml}" class="button">Baixar XML</a>
            </p>
            <p>Atenciosamente,<br>Equipe ICARUS</p>
          </div>
        </body>
      </html>
    `;

    await this.enviarEmail({
      para: [destinatario],
      assunto: `NF-e ${numeroNFe} - Nota Fiscal Eletrônica`,
      corpo: `Segue NF-e ${numeroNFe}`,
      corpo_html,
      importancia: "high",
    });
  }
}

class OutlookContatosService {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Sincronizar contato
   */
  async sincronizarContato(contato: ContatoOutlook): Promise<void> {
    try {
      const contatoOutlook = {
        givenName: contato.nome.split(" ")[0],
        surname: contato.nome.split(" ").slice(1).join(" "),
        emailAddresses: [
          {
            address: contato.email,
            name: contato.nome,
          },
        ],
        ...(contato.telefone && {
          businessPhones: [contato.telefone],
        }),
        ...(contato.empresa && {
          companyName: contato.empresa,
        }),
        ...(contato.cargo && {
          jobTitle: contato.cargo,
        }),
        categories: [
          `ICARUS - ${contato.categoria === "hospital" ? "Hospital" : contato.categoria === "plano_saude" ? "Plano de Saúde" : "Indústria"}`,
        ],
      };

      await this.graphClient.api("/me/contacts").post(contatoOutlook);
      console.log("[OutlookContatos] Contato sincronizado:", contato.nome);
    } catch (error) {
      const err = error as Error;
      console.error("[OutlookContatos] Erro ao sincronizar contato:", err);
      throw error;
    }
  }

  /**
   * Sincronizar múltiplos contatos
   */
  async sincronizarContatos(
    contatos: ContatoOutlook[],
  ): Promise<{ sucesso: number; erro: number }> {
    let sucesso = 0;
    let erro = 0;

    for (const contato of contatos) {
      try {
        await this.sincronizarContato(contato);
        sucesso++;
      } catch (error) {
        const err = error as Error;
        erro++;
      }
    }

    return { sucesso, erro };
  }
}

class OneDriveService {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Upload de arquivo
   */
  async uploadArquivo(
    nomeArquivo: string,
    conteudo: ArrayBuffer,
    pasta: string = "ICARUS",
  ): Promise<{ id: string }> {
    try {
      const resultado = (await this.graphClient
        .api(`/me/drive/root:/${pasta}/${nomeArquivo}:/content`)
        .put(conteudo)) as { id: string };

      console.log("[OneDrive] Arquivo enviado:", nomeArquivo);
      return resultado;
    } catch (error) {
      const err = error as Error;
      console.error("[OneDrive] Erro ao enviar arquivo:", err);
      throw error;
    }
  }

  /**
   * Criar link de compartilhamento
   */
  async criarLinkCompartilhamento(itemId: string): Promise<string> {
    try {
      const link = (await this.graphClient
        .api(`/me/drive/items/${itemId}/createLink`)
        .post({
          type: "view",
          scope: "anonymous",
        })) as { link: { webUrl: string } };

      return link.link.webUrl;
    } catch (error) {
      const err = error as Error;
      console.error("[OneDrive] Erro ao criar link:", err);
      throw error;
    }
  }
}

// Classe principal de integração
export class Microsoft365Integration {
  private static graphClient: Client | null = null;
  public static teams: MicrosoftTeamsService;
  public static email: OutlookEmailService;
  public static contatos: OutlookContatosService;
  public static onedrive: OneDriveService;

  /**
   * Login Microsoft 365
   */
  static async login(): Promise<void> {
    try {
      await msalInstance.initialize();
      const response = await msalInstance.loginPopup(loginRequest);

      // Inicializar Graph Client
      this.graphClient = Client.init({
        authProvider: async (done) => {
          done(null, response.accessToken);
        },
      });

      // Inicializar serviços
      this.teams = new MicrosoftTeamsService(this.graphClient);
      this.email = new OutlookEmailService(this.graphClient);
      this.contatos = new OutlookContatosService(this.graphClient);
      this.onedrive = new OneDriveService(this.graphClient);

      console.log("[Microsoft365] Login realizado com sucesso");
    } catch (error) {
      const err = error as Error;
      console.error("[Microsoft365] Erro no login:", err);
      throw error;
    }
  }

  /**
   * Obter token de acesso (silencioso)
   */
  static async getToken(): Promise<string> {
    try {
      await msalInstance.initialize();
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length === 0) {
        throw new Error("Nenhuma conta Microsoft conectada");
      }

      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // Inicializar Graph Client se necessário
      if (!this.graphClient) {
        this.graphClient = Client.init({
          authProvider: async (done) => {
            done(null, response.accessToken);
          },
        });

        // Inicializar serviços
        this.teams = new MicrosoftTeamsService(this.graphClient);
        this.email = new OutlookEmailService(this.graphClient);
        this.contatos = new OutlookContatosService(this.graphClient);
        this.onedrive = new OneDriveService(this.graphClient);
      }

      return response.accessToken;
    } catch (error) {
      const err = error as Error;
      if (error instanceof InteractionRequiredAuthError) {
        // Token expirado, fazer login novamente
        await this.login();
        return this.getToken();
      }
      throw error;
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    try {
      await msalInstance.initialize();
      await msalInstance.logoutPopup();
      this.graphClient = null;
      console.log("[Microsoft365] Logout realizado");
    } catch (error) {
      const err = error as Error;
      console.error("[Microsoft365] Erro no logout:", err);
      throw error;
    }
  }
}
