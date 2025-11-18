// src/lib/database.types.ts
// Tipos TypeScript gerados do schema Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nome: string
          razao_social: string | null
          cnpj: string
          inscricao_estadual: string | null
          licenca_anvisa: string | null
          telefone: string | null
          email: string | null
          cep: string | null
          endereco: string | null
          numero: string | null
          complemento: string | null
          bairro: string | null
          cidade: string | null
          estado: string | null
          status: string | null
          criado_em: string | null
          atualizado_em: string | null
          excluido_em: string | null
        }
        Insert: {
          id?: string
          nome: string
          razao_social?: string | null
          cnpj: string
          inscricao_estadual?: string | null
          licenca_anvisa?: string | null
          telefone?: string | null
          email?: string | null
          cep?: string | null
          endereco?: string | null
          numero?: string | null
          complemento?: string | null
          bairro?: string | null
          cidade?: string | null
          estado?: string | null
          status?: string | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Update: {
          id?: string
          nome?: string
          razao_social?: string | null
          cnpj?: string
          inscricao_estadual?: string | null
          licenca_anvisa?: string | null
          telefone?: string | null
          email?: string | null
          cep?: string | null
          endereco?: string | null
          numero?: string | null
          complemento?: string | null
          bairro?: string | null
          cidade?: string | null
          estado?: string | null
          status?: string | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Relationships: []
      }
      produtos_opme: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          descricao: string | null
          registro_anvisa: string | null
          fabricante: string | null
          categoria: string | null
          ativo: boolean | null
          ponto_reposicao: number | null
          criado_em: string | null
          atualizado_em: string | null
          excluido_em: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          descricao?: string | null
          registro_anvisa?: string | null
          fabricante?: string | null
          categoria?: string | null
          ativo?: boolean | null
          ponto_reposicao?: number | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          descricao?: string | null
          registro_anvisa?: string | null
          fabricante?: string | null
          categoria?: string | null
          ativo?: boolean | null
          ponto_reposicao?: number | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'produtos_opme_empresa_id_fkey'
            columns: ['empresa_id']
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          }
        ]
      }
      estoque_armazens: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          endereco: string | null
          responsavel_id: string | null
          ativo: boolean | null
          criado_em: string | null
          atualizado_em: string | null
          excluido_em: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          endereco?: string | null
          responsavel_id?: string | null
          ativo?: boolean | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          endereco?: string | null
          responsavel_id?: string | null
          ativo?: boolean | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'estoque_armazens_empresa_id_fkey'
            columns: ['empresa_id']
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          }
        ]
      }
      estoque: {
        Row: {
          id: string
          empresa_id: string
          produto_id: string
          armazem_id: string | null
          localizacao_id: string | null
          quantidade_disponivel: number | null
          quantidade_reservada: number | null
          status: string | null
          criado_em: string | null
          atualizado_em: string | null
          excluido_em: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          produto_id: string
          armazem_id?: string | null
          localizacao_id?: string | null
          quantidade_disponivel?: number | null
          quantidade_reservada?: number | null
          status?: string | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          produto_id?: string
          armazem_id?: string | null
          localizacao_id?: string | null
          quantidade_disponivel?: number | null
          quantidade_reservada?: number | null
          status?: string | null
          criado_em?: string | null
          atualizado_em?: string | null
          excluido_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'estoque_empresa_id_fkey'
            columns: ['empresa_id']
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'estoque_produto_id_fkey'
            columns: ['produto_id']
            referencedRelation: 'produtos_opme'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'estoque_armazem_id_fkey'
            columns: ['armazem_id']
            referencedRelation: 'estoque_armazens'
            referencedColumns: ['id']
          }
        ]
      }
      estoque_lotes: {
        Row: {
          id: string
          empresa_id: string
          produto_id: string
          numero_lote: string
          data_fabricacao: string | null
          data_validade: string
          quantidade: number | null
          status: string | null
          criado_em: string | null
          excluido_em: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          produto_id: string
          numero_lote: string
          data_fabricacao?: string | null
          data_validade: string
          quantidade?: number | null
          status?: string | null
          criado_em?: string | null
          excluido_em?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          produto_id?: string
          numero_lote?: string
          data_fabricacao?: string | null
          data_validade?: string
          quantidade?: number | null
          status?: string | null
          criado_em?: string | null
          excluido_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'estoque_lotes_empresa_id_fkey'
            columns: ['empresa_id']
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'estoque_lotes_produto_id_fkey'
            columns: ['produto_id']
            referencedRelation: 'produtos_opme'
            referencedColumns: ['id']
          }
        ]
      }
      estoque_alertas: {
        Row: {
          id: string
          empresa_id: string
          produto_id: string
          tipo: string | null
          prioridade: string | null
          mensagem: string
          lido: boolean | null
          data_leitura: string | null
          criado_em: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          produto_id: string
          tipo?: string | null
          prioridade?: string | null
          mensagem: string
          lido?: boolean | null
          data_leitura?: string | null
          criado_em?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          produto_id?: string
          tipo?: string | null
          prioridade?: string | null
          mensagem?: string
          lido?: boolean | null
          data_leitura?: string | null
          criado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'estoque_alertas_empresa_id_fkey'
            columns: ['empresa_id']
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'estoque_alertas_produto_id_fkey'
            columns: ['produto_id']
            referencedRelation: 'produtos_opme'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_empresa_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

