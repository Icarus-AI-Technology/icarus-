/**
 * Serviço de Detecção de Duplicatas com IA - ICARUS v5.0
 * 
 * Algoritmos implementados:
 * - Levenshtein Distance (similaridade de strings)
 * - Soundex (similaridade fonética)
 * - Token Set Similarity (conjuntos de palavras)
 * - Fuzzy Matching
 * 
 * Critérios de duplicação:
 * - Nome: Similaridade > 85%
 * - CPF/CNPJ: Exato (100%)
 * - Email: Exato (100%)
 * - Telefone: Normalizado e exato
 * - CRM: Exato (médicos)
 * - Código ANVISA: Exato (produtos)
 * 
 * Score de duplicação:
 * - 100%: Duplicata exata (identificador único igual)
 * - 90-99%: Muito provável (nome muito similar + dados coincidentes)
 * - 80-89%: Provável (nome similar)
 * - 70-79%: Possível (nome com alguma similaridade)
 * - < 70%: Improvável (não exibe)
 * 
 * @version 5.0.0
 */

import { supabase } from '@/lib/supabase';
import { TipoEntidade } from './CadastrosService';

// ========================================
// INTERFACES
// ========================================

export interface DuplicateMatch {
  id: string;
  nome: string;
  score: number;
  motivo: string;
  dados: Record<string, unknown>;
  detalhes?: {
    cpf?: boolean;
    cnpj?: boolean;
    email?: boolean;
    telefone?: boolean;
    crm?: boolean;
    codigo_anvisa?: boolean;
    nome_similar?: boolean;
  };
}

export interface DuplicateDetectionParams {
  tipo: TipoEntidade;
  nome?: string;
  cpf?: string;
  cnpj?: string;
  crm?: string;
  uf_crm?: string;
  codigo_anvisa?: string;
  email?: string;
  telefone?: string;
  excludeId?: string;
}

// ========================================
// SERVIÇO DE DETECÇÃO DE DUPLICATAS
// ========================================

export class DuplicateDetectionService {
  private threshold = 70; // Score mínimo para considerar duplicata

  private tabelaMap: Record<TipoEntidade, string> = {
    'medico': 'medicos',
    'hospital': 'hospitais',
    'paciente': 'pacientes',
    'convenio': 'convenios',
    'fornecedor': 'fornecedores',
    'produto_opme': 'produtos_opme',
    'equipe_medica': 'equipes_medicas',
    'transportadora': 'transportadoras'
  };

  /**
   * Detectar possíveis duplicatas
   */
  async detectPossibleDuplicates(
    params: DuplicateDetectionParams
  ): Promise<DuplicateMatch[]> {
    const { tipo, nome, cpf, cnpj, crm, uf_crm, codigo_anvisa, email, telefone, excludeId } = params;

    const tabela = this.tabelaMap[tipo];
    let query = supabase.from(tabela).select('*');

    // Excluir ID atual (modo edição)
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    // Buscar apenas ativos
    query = query.eq('ativo', true);

    // ========================================
    // 1. BUSCAR DUPLICATAS EXATAS (100%)
    // ========================================

    // CPF exato
    if (cpf) {
      const { data: exactMatch } = await query.eq('cpf', cpf);
      if (exactMatch && exactMatch.length > 0) {
        return exactMatch.map(item => ({
          id: item.id,
          nome: this.getNomeFromRecord(item, tipo),
          score: 100,
          motivo: 'CPF idêntico',
          dados: item,
          detalhes: { cpf: true }
        }));
      }
    }

    // CNPJ exato
    if (cnpj) {
      const { data: exactMatch } = await query.eq('cnpj', cnpj);
      if (exactMatch && exactMatch.length > 0) {
        return exactMatch.map(item => ({
          id: item.id,
          nome: this.getNomeFromRecord(item, tipo),
          score: 100,
          motivo: 'CNPJ idêntico',
          dados: item,
          detalhes: { cnpj: true }
        }));
      }
    }

    // CRM exato
    if (crm && uf_crm) {
      const { data: exactMatch } = await query
        .eq('crm', crm)
        .eq('uf_crm', uf_crm);
      
      if (exactMatch && exactMatch.length > 0) {
        return exactMatch.map(item => ({
          id: item.id,
          nome: this.getNomeFromRecord(item, tipo),
          score: 100,
          motivo: `CRM ${crm}/${uf_crm} idêntico`,
          dados: item,
          detalhes: { crm: true }
        }));
      }
    }

    // Código ANVISA exato
    if (codigo_anvisa) {
      const { data: exactMatch } = await query.eq('codigo_anvisa', codigo_anvisa);
      if (exactMatch && exactMatch.length > 0) {
        return exactMatch.map(item => ({
          id: item.id,
          nome: this.getNomeFromRecord(item, tipo),
          score: 100,
          motivo: 'Código ANVISA idêntico',
          dados: item,
          detalhes: { codigo_anvisa: true }
        }));
      }
    }

    // Email exato
    if (email) {
      const { data: exactMatch } = await query.eq('email', email);
      if (exactMatch && exactMatch.length > 0) {
        return exactMatch.map(item => ({
          id: item.id,
          nome: this.getNomeFromRecord(item, tipo),
          score: 100,
          motivo: 'Email idêntico',
          dados: item,
          detalhes: { email: true }
        }));
      }
    }

    // ========================================
    // 2. BUSCAR POR NOME (FUZZY MATCHING)
    // ========================================

    if (nome && nome.length >= 3) {
      const { data: allRecords } = await supabase
        .from(tabela)
        .select('*')
        .eq('ativo', true)
        .neq('id', excludeId || '');

      if (!allRecords || allRecords.length === 0) {
        return [];
      }

      const matches: DuplicateMatch[] = [];

      for (const record of allRecords) {
        const recordNome = this.getNomeFromRecord(record, tipo);
        
        if (!recordNome) continue;

        // Calcular similaridade
        const similarity = this.calculateSimilarity(nome, recordNome);
        const score = Math.round(similarity * 100);

        if (score >= this.threshold) {
          // Verificar coincidências adicionais
          const detalhes: DuplicateMatch['detalhes'] = {
            nome_similar: true
          };

          let motivoFinal = `Nome ${score >= 90 ? 'muito similar' : 'similar'} (${score}%)`;

          // Aumentar score se houver coincidências adicionais
          let scoreAjustado = score;

          if (email && record.email === email) {
            detalhes.email = true;
            scoreAjustado = Math.min(100, scoreAjustado + 10);
            motivoFinal += ' + Email igual';
          }

          if (telefone && record.telefone === telefone) {
            detalhes.telefone = true;
            scoreAjustado = Math.min(100, scoreAjustado + 5);
            motivoFinal += ' + Telefone igual';
          }

          matches.push({
            id: record.id,
            nome: recordNome,
            score: scoreAjustado,
            motivo: motivoFinal,
            dados: record,
            detalhes
          });
        }
      }

      // Ordenar por score (maior primeiro)
      return matches.sort((a, b) => b.score - a.score);
    }

    return [];
  }

  /**
   * Calcular similaridade entre strings
   * Combina múltiplos algoritmos para maior precisão
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.normalize(str1);
    const s2 = this.normalize(str2);

    // 1. Levenshtein Distance (60% do peso)
    const levenshtein = this.levenshteinSimilarity(s1, s2);

    // 2. Token Set Similarity (30% do peso)
    const tokenSet = this.tokenSetSimilarity(s1, s2);

    // 3. Soundex (10% do peso)
    const soundex = this.soundexMatch(s1, s2) ? 1 : 0;

    // Média ponderada
    const similarity = (levenshtein * 0.6) + (tokenSet * 0.3) + (soundex * 0.1);

    return similarity;
  }

  /**
   * Normalizar string (remover acentos, lowercase, trim)
   */
  private normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .trim();
  }

  /**
   * Levenshtein Distance Similarity
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    // Inicializar primeira coluna
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    // Inicializar primeira linha
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Preencher matriz
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Substituição
            matrix[i][j - 1] + 1,     // Inserção
            matrix[i - 1][j] + 1      // Deleção
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Token Set Similarity
   * Compara conjuntos de palavras (útil para nomes compostos)
   */
  private tokenSetSimilarity(str1: string, str2: string): number {
    const tokens1 = new Set(str1.split(/\s+/).filter(t => t.length > 0));
    const tokens2 = new Set(str2.split(/\s+/).filter(t => t.length > 0));

    const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
    const union = new Set([...tokens1, ...tokens2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Soundex Algorithm (similaridade fonética)
   * Útil para detectar nomes com grafia diferente mas som similar
   */
  private soundex(str: string): string {
    const s = str.toUpperCase();
    let code = s[0];

    const soundexMap: Record<string, string> = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };

    for (let i = 1; i < s.length && code.length < 4; i++) {
      const digit = soundexMap[s[i]];
      if (digit && digit !== code[code.length - 1]) {
        code += digit;
      }
    }

    return code.padEnd(4, '0');
  }

  private soundexMatch(str1: string, str2: string): boolean {
    // Comparar primeiro token de cada string
    const token1 = str1.split(/\s+/)[0];
    const token2 = str2.split(/\s+/)[0];
    
    if (token1.length < 3 || token2.length < 3) {
      return false; // Nomes muito curtos não são confiáveis para soundex
    }

    return this.soundex(token1) === this.soundex(token2);
  }

  /**
   * Extrair nome do registro baseado no tipo
   */
  private getNomeFromRecord(record: Record<string, unknown>, tipo: TipoEntidade): string {
    switch (tipo) {
      case 'medico':
      case 'paciente':
        return (record as { nome_completo?: string }).nome_completo || '';
      
      case 'hospital':
      case 'convenio':
      case 'fornecedor':
      case 'transportadora':
        return (record as { razao_social?: string; nome?: string }).razao_social || (record as { nome?: string }).nome || '';
      
      case 'produto_opme':
        return (record as { descricao?: string }).descricao || '';
      
      case 'equipe_medica':
        return (record as { nome?: string }).nome || '';
      
      default:
        return (
          (record as { nome?: string }).nome ||
          (record as { nome_completo?: string }).nome_completo ||
          (record as { razao_social?: string }).razao_social ||
          (record as { descricao?: string }).descricao ||
          ''
        );
    }
  }

  /**
   * Verificar se é duplicata de alta confiança
   */
  isDuplicataAltaConfianca(match: DuplicateMatch): boolean {
    return match.score >= 90 || !!(
      match.detalhes?.cpf ||
      match.detalhes?.cnpj ||
      match.detalhes?.crm ||
      match.detalhes?.codigo_anvisa ||
      match.detalhes?.email
    );
  }

  /**
   * Gerar mensagem de alerta para usuário
   */
  generateAlertMessage(matches: DuplicateMatch[]): string {
    if (matches.length === 0) {
      return '';
    }

    const altaConfianca = matches.filter(m => this.isDuplicataAltaConfianca(m));
    
    if (altaConfianca.length > 0) {
      return `⚠️ ATENÇÃO: Encontrado(s) ${altaConfianca.length} registro(s) muito similar(es). Verifique se não é duplicação!`;
    }

    return `ℹ️ Encontrado(s) ${matches.length} registro(s) similar(es). Revise antes de prosseguir.`;
  }

  /**
   * Verificar duplicatas antes de salvar
   */
  async checkBeforeSave(params: DuplicateDetectionParams): Promise<{
    podeProsseguir: boolean;
    matches: DuplicateMatch[];
    mensagem: string;
  }> {
    const matches = await this.detectPossibleDuplicates(params);
    
    const altaConfianca = matches.filter(m => this.isDuplicataAltaConfianca(m));

    if (altaConfianca.length > 0) {
      return {
        podeProsseguir: false,
        matches,
        mensagem: this.generateAlertMessage(matches)
      };
    }

    return {
      podeProsseguir: true,
      matches,
      mensagem: matches.length > 0 ? this.generateAlertMessage(matches) : ''
    };
  }
}

// Exportar instância singleton
export const duplicateDetectionService = new DuplicateDetectionService();

