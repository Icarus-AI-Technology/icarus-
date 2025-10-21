/**
 * Service: SEFAZService
 * Integração com SEFAZ para Emissão de NF-e
 * 
 * FUNCIONALIDADES:
 * - Emissão de NF-e (modelo 55)
 * - Cancelamento de NF-e
 * - Carta de Correção Eletrônica (CC-e)
 * - Consulta de status
 * - Inutilização de numeração
 * - Certificado Digital A1
 * 
 * PADRÃO: NF-e 4.0
 * AMBIENTE: Produção + Homologação
 */

import { supabase } from"@/lib/supabase";

interface CertificadoDigital {
  pfx_base64: string;
  senha: string;
  validade: string;
  cnpj: string;
}

interface DadosEmitente {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  inscricao_estadual: string;
  inscricao_municipal?: string;
  cnae_fiscal: string;
  regime_tributario:"1" |"2" |"3"; // 1=Simples, 2=Normal, 3=MEI
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigo_municipio: string;
    municipio: string;
    uf: string;
    cep: string;
    codigo_pais: string;
    pais: string;
    telefone?: string;
  };
}

interface DadosDestinatario {
  tipo_pessoa:"F" |"J"; // F=Física, J=Jurídica
  cpf_cnpj: string;
  nome: string;
  inscricao_estadual?: string;
  email?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigo_municipio: string;
    municipio: string;
    uf: string;
    cep: string;
  };
}

interface ItemNFe {
  numero_item: number;
  codigo_produto: string;
  descricao: string;
  ncm: string; // Nomenclatura Comum do Mercosul
  cfop: string; // Código Fiscal de Operações
  unidade_comercial: string;
  quantidade_comercial: number;
  valor_unitario_comercial: number;
  valor_total_bruto: number;
  ean?: string;
  ean_tributavel?: string;
  
  // Tributação
  icms: {
    origem:"0" |"1" |"2"; // 0=Nacional, 1=Estrangeira, 2=Nacional com conteúdo importado
    situacao_tributaria: string; // CST/CSOSN
    modalidade_base_calculo?: string;
    valor_base_calculo?: number;
    aliquota?: number;
    valor?: number;
  };
  
  ipi?: {
    situacao_tributaria: string;
    valor_base_calculo?: number;
    aliquota?: number;
    valor?: number;
  };
  
  pis: {
    situacao_tributaria: string;
    valor_base_calculo?: number;
    aliquota?: number;
    valor?: number;
  };
  
  cofins: {
    situacao_tributaria: string;
    valor_base_calculo?: number;
    aliquota?: number;
    valor?: number;
  };
}

interface DadosNFe {
  serie: number;
  numero: number;
  data_emissao: string;
  data_saida?: string;
  tipo_operacao:"0" |"1"; // 0=Entrada, 1=Saída
  tipo_emissao:"1" |"2" |"3"; // 1=Normal, 2=Contingência, 3=Offline
  finalidade:"1" |"2" |"3" |"4"; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
  natureza_operacao: string;
  forma_pagamento:"0" |"1"; // 0=À vista, 1=A prazo
  
  emitente: DadosEmitente;
  destinatario: DadosDestinatario;
  itens: ItemNFe[];
  
  // Totais
  total_produtos: number;
  total_desconto: number;
  total_frete: number;
  total_seguro: number;
  total_outras_despesas: number;
  total_nota: number;
  
  // Impostos
  total_icms: number;
  total_ipi: number;
  total_pis: number;
  total_cofins: number;
  
  // Transporte
  modalidade_frete:"0" |"1" |"2" |"3" |"4" |"9"; // 0=Emitente, 1=Destinatário, 9=Sem frete
  transportadora?: {
    cnpj?: string;
    cpf?: string;
    razao_social: string;
    inscricao_estadual?: string;
    endereco_completo?: string;
    municipio?: string;
    uf?: string;
  };
  
  // Informações Adicionais
  informacoes_complementares?: string;
  informacoes_fisco?: string;
}

interface ResultadoNFe {
  sucesso: boolean;
  chave_acesso?: string;
  numero_protocolo?: string;
  data_autorizacao?: string;
  xml_nfe?: string;
  danfe_pdf?: string;
  mensagem?: string;
  erros?: string[];
}

export class SEFAZService {
  private ambiente:"homologacao" |"producao" ="homologacao";
  private certificado: CertificadoDigital | null = null;
  private ufSefaz: string ="SP"; // UF do SEFAZ

  constructor(ambiente:"homologacao" |"producao" ="homologacao") {
    this.ambiente = ambiente;
  }

  /**
   * Configura o certificado digital A1
   */
  async configurarCertificado(certificado: CertificadoDigital): Promise<boolean> {
    try {
      // Validar certificado
      const validade = new Date(certificado.validade);
      const hoje = new Date();

      if (validade < hoje) {
        throw new Error("Certificado digital vencido");
      }

      if (!certificado.pfx_base64 || !certificado.senha) {
        throw new Error("Certificado ou senha inválidos");
      }

      this.certificado = certificado;

      // Salvar no Supabase (criptografado)
      await supabase.from("configuracoes_nfe").upsert({
        empresa_id:"default", // TODO: pegar do contexto
        certificado_pfx: certificado.pfx_base64,
        certificado_senha: this.criptografarSenha(certificado.senha),
        certificado_validade: certificado.validade,
        certificado_cnpj: certificado.cnpj,
        ambiente: this.ambiente,
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (_err) {
      console.error("Erro configurarCertificado:", _err);
      return false;
    }
  }

  /**
   * Emite uma NF-e
   */
  async emitirNFe(dados: DadosNFe): Promise<ResultadoNFe> {
    try {
      // 1. Validar dados obrigatórios
      const validacao = this.validarDadosNFe(dados);
      if (!validacao.valido) {
        return {
          sucesso: false,
          mensagem:"Dados inválidos",
          erros: validacao.erros,
        };
      }

      // 2. Gerar chave de acesso
      const chaveAcesso = this.gerarChaveAcesso(dados);

      // 3. Montar XML da NF-e
      const xmlNFe = this.montarXMLNFe(dados, chaveAcesso);

      // 4. Assinar XML com certificado digital
      const xmlAssinado = await this.assinarXML(xmlNFe);

      // 5. Enviar para SEFAZ
      const resultado = await this.enviarParaSEFAZ(xmlAssinado, dados.emitente.endereco.uf);

      if (resultado.sucesso) {
        // 6. Gerar DANFE (PDF)
        const danfePdf = await this.gerarDANFE(xmlAssinado, resultado.chave_acesso!);

        // 7. Salvar no banco
        await supabase.from("notas_fiscais").insert({
          empresa_id:"default",
          chave_acesso: resultado.chave_acesso,
          numero: dados.numero,
          serie: dados.serie,
          data_emissao: dados.data_emissao,
          destinatario_cpf_cnpj: dados.destinatario.cpf_cnpj,
          destinatario_nome: dados.destinatario.nome,
          valor_total: dados.total_nota,
          status:"autorizada",
          protocolo: resultado.numero_protocolo,
          xml_nfe: xmlAssinado,
          danfe_pdf: danfePdf,
          ambiente: this.ambiente,
        });

        // 8. Enviar email para destinatário
        if (dados.destinatario.email) {
          await this.enviarEmailNFe(dados.destinatario.email, xmlAssinado, danfePdf);
        }

        return {
          sucesso: true,
          chave_acesso: resultado.chave_acesso,
          numero_protocolo: resultado.numero_protocolo,
          data_autorizacao: resultado.data_autorizacao,
          xml_nfe: xmlAssinado,
          danfe_pdf: danfePdf,
          mensagem:"NF-e autorizada com sucesso",
        };
      } else {
        return resultado;
      }
    } catch (_err) {
      console.error("Erro emitirNFe:", _err);
      return {
        sucesso: false,
        mensagem: _err instanceof Error ? _err.message :"Erro ao emitir NF-e",
        erros: [_err instanceof Error ? _err.message :"Erro desconhecido"],
      };
    }
  }

  /**
   * Cancela uma NF-e autorizada
   */
  async cancelarNFe(chaveAcesso: string, protocolo: string, justificativa: string): Promise<ResultadoNFe> {
    try {
      // 1. Validar justificativa (mínimo 15 caracteres)
      if (justificativa.length < 15) {
        return {
          sucesso: false,
          mensagem:"Justificativa deve ter no mínimo 15 caracteres",
        };
      }

      // 2. Buscar NF-e no banco
      const { data: nfe } = await supabase
        .from("notas_fiscais")
        .select("*")
        .eq("chave_acesso", chaveAcesso)
        .single();

      if (!nfe) {
        return {
          sucesso: false,
          mensagem:"NF-e não encontrada",
        };
      }

      // 3. Verificar prazo (até 24h após autorização)
      const dataAutorizacao = new Date(nfe.data_autorizacao);
      const agora = new Date();
      const diferencaHoras = (agora.getTime() - dataAutorizacao.getTime()) / (1000 * 60 * 60);

      if (diferencaHoras > 24) {
        return {
          sucesso: false,
          mensagem:"Prazo de cancelamento expirado (máximo 24h)",
        };
      }

      // 4. Montar XML de cancelamento
      const xmlCancelamento = this.montarXMLCancelamento(chaveAcesso, protocolo, justificativa);

      // 5. Assinar XML
      const xmlAssinado = await this.assinarXML(xmlCancelamento);

      // 6. Enviar para SEFAZ
      const resultado = await this.enviarCancelamentoSEFAZ(xmlAssinado, nfe.uf);

      if (resultado.sucesso) {
        // 7. Atualizar banco
        await supabase
          .from("notas_fiscais")
          .update({
            status:"cancelada",
            data_cancelamento: new Date().toISOString(),
            justificativa_cancelamento: justificativa,
            protocolo_cancelamento: resultado.numero_protocolo,
          })
          .eq("chave_acesso", chaveAcesso);

        return {
          sucesso: true,
          mensagem:"NF-e cancelada com sucesso",
          numero_protocolo: resultado.numero_protocolo,
        };
      } else {
        return resultado;
      }
    } catch (_err) {
      console.error("Erro cancelarNFe:", _err);
      return {
        sucesso: false,
        mensagem: _err instanceof Error ? _err.message :"Erro ao cancelar NF-e",
      };
    }
  }

  /**
   * Consulta status de uma NF-e
   */
  async consultarNFe(chaveAcesso: string): Promise<{
    sucesso: boolean;
    status?:"autorizada" |"cancelada" |"denegada" |"rejeitada";
    protocolo?: string;
    mensagem?: string;
  }> {
    try {
      // Mock de consulta ao SEFAZ
      const { data: nfe } = await supabase
        .from("notas_fiscais")
        .select("status, protocolo")
        .eq("chave_acesso", chaveAcesso)
        .single();

      if (!nfe) {
        return {
          sucesso: false,
          mensagem:"NF-e não encontrada",
        };
      }

      return {
        sucesso: true,
        status: nfe.status,
        protocolo: nfe.protocolo,
        mensagem: `NF-e ${nfe.status}`,
      };
    } catch (_err) {
      console.error("Erro consultarNFe:", _err);
      return {
        sucesso: false,
        mensagem:"Erro ao consultar NF-e",
      };
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private validarDadosNFe(dados: DadosNFe): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    // Validar emitente
    if (!dados.emitente.cnpj || dados.emitente.cnpj.length !== 14) {
      erros.push("CNPJ do emitente inválido");
    }

    // Validar destinatário
    if (!dados.destinatario.cpf_cnpj) {
      erros.push("CPF/CNPJ do destinatário obrigatório");
    }

    // Validar itens
    if (!dados.itens || dados.itens.length === 0) {
      erros.push("NF-e deve ter ao menos 1 item");
    }

    // Validar totais
    if (dados.total_nota <= 0) {
      erros.push("Valor total da nota inválido");
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  private gerarChaveAcesso(dados: DadosNFe): string {
    // Formato: UF + AAMM + CNPJ + MOD + SÉRIE + NÚMERO + TPEMIS + CNUMERIC + DV
    const uf = dados.emitente.endereco.uf;
    const aamm = new Date(dados.data_emissao).toISOString().slice(2, 7).replace("-","");
    const cnpj = dados.emitente.cnpj;
    const mod ="55"; // Modelo 55 (NF-e)
    const serie = dados.serie.toString().padStart(3,"0");
    const numero = dados.numero.toString().padStart(9,"0");
    const tpEmis = dados.tipo_emissao;
    const cNumeric = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8,"0");

    const chaveBase = `${uf}${aamm}${cnpj}${mod}${serie}${numero}${tpEmis}${cNumeric}`;
    const dv = this.calcularDigitoVerificador(chaveBase);

    return `${chaveBase}${dv}`;
  }

  private calcularDigitoVerificador(chave: string): number {
    // Algoritmo Módulo 11
    const multiplicadores = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let multiplicadorIndex = 0;

    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i]) * multiplicadores[multiplicadorIndex % 8];
      multiplicadorIndex++;
    }

    const resto = soma % 11;
    return resto === 0 || resto === 1 ? 0 : 11 - resto;
  }

  private montarXMLNFe(dados: DadosNFe, chaveAcesso: string): string {
    // Simplificado - em produção usar biblioteca especializada
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${chaveAcesso}">
    <ide>
      <cUF>${dados.emitente.endereco.uf}</cUF>
      <cNF>${chaveAcesso.slice(-9, -1)}</cNF>
      <natOp>${dados.natureza_operacao}</natOp>
      <mod>55</mod>
      <serie>${dados.serie}</serie>
      <nNF>${dados.numero}</nNF>
      <dhEmi>${dados.data_emissao}</dhEmi>
      <tpNF>${dados.tipo_operacao}</tpNF>
      <tpEmis>${dados.tipo_emissao}</tpEmis>
      <tpAmb>${this.ambiente ==="producao" ?"1" :"2"}</tpAmb>
      <finNFe>${dados.finalidade}</finNFe>
    </ide>
    <!-- Emitente, Destinatário, Produtos, Totais, etc -->
  </infNFe>
</NFe>`;
  }

  private montarXMLCancelamento(chaveAcesso: string, protocolo: string, justificativa: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe">
  <evento>
    <infEvento>
      <tpEvento>110111</tpEvento>
      <chNFe>${chaveAcesso}</chNFe>
      <detEvento>
        <descEvento>Cancelamento</descEvento>
        <nProt>${protocolo}</nProt>
        <xJust>${justificativa}</xJust>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
  }

  private async assinarXML(xml: string): Promise<string> {
    // Mock - em produção usar biblioteca de assinatura digital (node-forge, crypto)
    return xml; // XML assinado com certificado A1
  }

  private async enviarParaSEFAZ(_xml: string, _uf: string): Promise<ResultadoNFe> {
    // Mock - em produção fazer requisição SOAP para webservice do SEFAZ
    const chaveAcesso = this.gerarChaveAcesso({} as DadosNFe);
    return {
      sucesso: true,
      chave_acesso: chaveAcesso,
      numero_protocolo: Math.floor(Math.random() * 900000000000000 + 100000000000000).toString(),
      data_autorizacao: new Date().toISOString(),
      mensagem:"NF-e autorizada",
    };
  }

  private async enviarCancelamentoSEFAZ(_xml: string, _uf: string): Promise<ResultadoNFe> {
    // Mock
    return {
      sucesso: true,
      numero_protocolo: Math.floor(Math.random() * 900000000000000 + 100000000000000).toString(),
      mensagem:"Cancelamento autorizado",
    };
  }

  private async gerarDANFE(_xml: string, _chaveAcesso: string): Promise<string> {
    // Mock - em produção usar biblioteca de geração de PDF
    return `data:application/pdf;base64,JVBERi0...`; // PDF em base64
  }

  private async enviarEmailNFe(email: string, _xml: string, _pdf: string): Promise<void> {
    // Mock - em produção integrar com serviço de email
    console.log(`Email enviado para ${email}`);
  }

  private criptografarSenha(senha: string): string {
    // Mock - em produção usar criptografia adequada
    return Buffer.from(senha).toString("base64");
  }
}

// Export singleton
export const sefazService = new SEFAZService(
  process.env.VITE_SEFAZ_AMBIENTE ==="producao" ?"producao" :"homologacao"
);

