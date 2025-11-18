export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_credentials: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          categoria: string | null
          criado_em: string | null
          criado_por: string | null
          empresa_id: string | null
          id: string
          nome: string
          servico: string
          tipo: string | null
          valor: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          categoria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          servico: string
          tipo?: string | null
          valor?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          categoria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          servico?: string
          tipo?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_credentials_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credentials_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credentials_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credentials_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "api_credentials_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credentials_audit: {
        Row: {
          acao: string
          credential_id: string | null
          criado_em: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          credential_id?: string | null
          criado_em?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          credential_id?: string | null
          criado_em?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_credentials_audit_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "api_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credentials_audit_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      api_endpoints: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          auth_config: Json | null
          auth_tipo: string | null
          cache_enabled: boolean | null
          cache_ttl: number | null
          circuit_breaker_enabled: boolean | null
          criado_em: string | null
          criticidade: string | null
          descricao: string | null
          id: string
          metodo: string
          nome: string
          rate_limit_requests: number | null
          rate_limit_window: number | null
          retry_backoff_ms: number | null
          retry_enabled: boolean | null
          retry_max_attempts: number | null
          servico: string
          timeout_ms: number | null
          url_base: string
          url_path: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          auth_config?: Json | null
          auth_tipo?: string | null
          cache_enabled?: boolean | null
          cache_ttl?: number | null
          circuit_breaker_enabled?: boolean | null
          criado_em?: string | null
          criticidade?: string | null
          descricao?: string | null
          id?: string
          metodo: string
          nome: string
          rate_limit_requests?: number | null
          rate_limit_window?: number | null
          retry_backoff_ms?: number | null
          retry_enabled?: boolean | null
          retry_max_attempts?: number | null
          servico: string
          timeout_ms?: number | null
          url_base: string
          url_path: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          auth_config?: Json | null
          auth_tipo?: string | null
          cache_enabled?: boolean | null
          cache_ttl?: number | null
          circuit_breaker_enabled?: boolean | null
          criado_em?: string | null
          criticidade?: string | null
          descricao?: string | null
          id?: string
          metodo?: string
          nome?: string
          rate_limit_requests?: number | null
          rate_limit_window?: number | null
          retry_backoff_ms?: number | null
          retry_enabled?: boolean | null
          retry_max_attempts?: number | null
          servico?: string
          timeout_ms?: number | null
          url_base?: string
          url_path?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          acao: string
          criado_em: string | null
          dados_antes: Json | null
          dados_depois: Json | null
          empresa_id: string | null
          hash_anterior: string | null
          hash_atual: string
          id: string
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          empresa_id?: string | null
          hash_anterior?: string | null
          hash_atual: string
          id?: string
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          empresa_id?: string | null
          hash_anterior?: string | null
          hash_atual?: string
          id?: string
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "audit_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          metadata: Json | null
          satisfacao_usuario: number | null
          status: string | null
          total_mensagens: number | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          metadata?: Json | null
          satisfacao_usuario?: number | null
          status?: string | null
          total_mensagens?: number | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          metadata?: Json | null
          satisfacao_usuario?: number | null
          status?: string | null
          total_mensagens?: number | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_conversas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_faqs: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          id: string
          palavras_chave: string[] | null
          pergunta: string
          resposta: string
          total_acessos: number | null
          ultima_atualizacao: string | null
          variacoes: string[] | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          palavras_chave?: string[] | null
          pergunta: string
          resposta: string
          total_acessos?: number | null
          ultima_atualizacao?: string | null
          variacoes?: string[] | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          palavras_chave?: string[] | null
          pergunta?: string
          resposta?: string
          total_acessos?: number | null
          ultima_atualizacao?: string | null
          variacoes?: string[] | null
        }
        Relationships: []
      }
      chatbot_intencoes: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          id: string
          nome: string
          padroes: string[] | null
          palavras_chave: string[] | null
          resposta_padrao: string | null
          updated_at: string | null
          variacoes: string[] | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome: string
          padroes?: string[] | null
          palavras_chave?: string[] | null
          resposta_padrao?: string | null
          updated_at?: string | null
          variacoes?: string[] | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          padroes?: string[] | null
          palavras_chave?: string[] | null
          resposta_padrao?: string | null
          updated_at?: string | null
          variacoes?: string[] | null
        }
        Relationships: []
      }
      chatbot_mensagens: {
        Row: {
          conteudo: string
          conversa_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          timestamp: string | null
          tipo: string
        }
        Insert: {
          conteudo: string
          conversa_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          tipo: string
        }
        Update: {
          conteudo?: string
          conversa_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      cirurgia_materiais: {
        Row: {
          cirurgia_id: string | null
          created_at: string | null
          id: string
          material_id: string | null
          quantidade: number
          valor_unitario: number | null
        }
        Insert: {
          cirurgia_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          quantidade?: number
          valor_unitario?: number | null
        }
        Update: {
          cirurgia_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          quantidade?: number
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cirurgia_materiais_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cirurgia_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      cirurgias: {
        Row: {
          atualizado_em: string | null
          codigo_interno: string | null
          criado_em: string | null
          data_cirurgia: string
          empresa_id: string
          excluido_em: string | null
          hora_cirurgia: string
          hospital_id: string | null
          id: string
          medico_id: string | null
          observacoes: string | null
          paciente_iniciais: string
          prioridade: string | null
          procedimento: string
          sala: string | null
          status: string | null
          valor_estimado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          codigo_interno?: string | null
          criado_em?: string | null
          data_cirurgia: string
          empresa_id: string
          excluido_em?: string | null
          hora_cirurgia: string
          hospital_id?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          paciente_iniciais: string
          prioridade?: string | null
          procedimento: string
          sala?: string | null
          status?: string | null
          valor_estimado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          codigo_interno?: string | null
          criado_em?: string | null
          data_cirurgia?: string
          empresa_id?: string
          excluido_em?: string | null
          hora_cirurgia?: string
          hospital_id?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          paciente_iniciais?: string
          prioridade?: string | null
          procedimento?: string
          sala?: string | null
          status?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cirurgias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cirurgias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "cirurgias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cirurgias_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cirurgias_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cirurgias_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "view_medicos_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_consignacao: {
        Row: {
          condicoes_pagamento: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          hospital_cnpj: string
          hospital_endereco: string | null
          hospital_id: string | null
          hospital_nome: string
          id: string
          numero_contrato: string
          observacoes: string | null
          percentual_comissao: number | null
          prazo_vencimento: string | null
          responsavel_hospital: string | null
          status: string | null
          updated_at: string | null
          valor_minimo_faturamento: number | null
        }
        Insert: {
          condicoes_pagamento?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          hospital_cnpj: string
          hospital_endereco?: string | null
          hospital_id?: string | null
          hospital_nome: string
          id?: string
          numero_contrato: string
          observacoes?: string | null
          percentual_comissao?: number | null
          prazo_vencimento?: string | null
          responsavel_hospital?: string | null
          status?: string | null
          updated_at?: string | null
          valor_minimo_faturamento?: number | null
        }
        Update: {
          condicoes_pagamento?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          hospital_cnpj?: string
          hospital_endereco?: string | null
          hospital_id?: string | null
          hospital_nome?: string
          id?: string
          numero_contrato?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          prazo_vencimento?: string | null
          responsavel_hospital?: string | null
          status?: string | null
          updated_at?: string | null
          valor_minimo_faturamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios: {
        Row: {
          atualizado_em: string | null
          cnpj: string | null
          contato: string | null
          criado_em: string | null
          id: string
          nome: string
          tipo: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cnpj?: string | null
          contato?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          tipo?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cnpj?: string | null
          contato?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          atualizado_em: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string
          complemento: string | null
          criado_em: string | null
          dpo_cpf: string | null
          dpo_email: string | null
          dpo_nome: string | null
          dpo_nomeado_em: string | null
          dpo_telefone: string | null
          dpo_tipo: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          excluido_em: string | null
          id: string
          inscricao_estadual: string | null
          licenca_anvisa: string | null
          nome: string
          numero: string | null
          razao_social: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj: string
          complemento?: string | null
          criado_em?: string | null
          dpo_cpf?: string | null
          dpo_email?: string | null
          dpo_nome?: string | null
          dpo_nomeado_em?: string | null
          dpo_telefone?: string | null
          dpo_tipo?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          excluido_em?: string | null
          id?: string
          inscricao_estadual?: string | null
          licenca_anvisa?: string | null
          nome: string
          numero?: string | null
          razao_social?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          complemento?: string | null
          criado_em?: string | null
          dpo_cpf?: string | null
          dpo_email?: string | null
          dpo_nome?: string | null
          dpo_nomeado_em?: string | null
          dpo_telefone?: string | null
          dpo_tipo?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          excluido_em?: string | null
          id?: string
          inscricao_estadual?: string | null
          licenca_anvisa?: string | null
          nome?: string
          numero?: string | null
          razao_social?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      estoque: {
        Row: {
          armazem_id: string | null
          atualizado_em: string | null
          criado_em: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          localizacao_id: string | null
          produto_id: string
          quantidade_disponivel: number | null
          quantidade_reservada: number | null
          status: string | null
        }
        Insert: {
          armazem_id?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          localizacao_id?: string | null
          produto_id: string
          quantidade_disponivel?: number | null
          quantidade_reservada?: number | null
          status?: string | null
        }
        Update: {
          armazem_id?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          localizacao_id?: string | null
          produto_id?: string
          quantidade_disponivel?: number | null
          quantidade_reservada?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_armazem_id_fkey"
            columns: ["armazem_id"]
            isOneToOne: false
            referencedRelation: "estoque_armazens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_localizacao_id_fkey"
            columns: ["localizacao_id"]
            isOneToOne: false
            referencedRelation: "estoque_localizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_alertas: {
        Row: {
          criado_em: string | null
          data_leitura: string | null
          empresa_id: string
          id: string
          lido: boolean | null
          mensagem: string
          prioridade: string | null
          produto_id: string
          tipo: string | null
        }
        Insert: {
          criado_em?: string | null
          data_leitura?: string | null
          empresa_id: string
          id?: string
          lido?: boolean | null
          mensagem: string
          prioridade?: string | null
          produto_id: string
          tipo?: string | null
        }
        Update: {
          criado_em?: string | null
          data_leitura?: string | null
          empresa_id?: string
          id?: string
          lido?: boolean | null
          mensagem?: string
          prioridade?: string | null
          produto_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_alertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_alertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_alertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_alertas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_armazens: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          empresa_id: string
          endereco: string | null
          excluido_em: string | null
          id: string
          nome: string
          responsavel_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          empresa_id: string
          endereco?: string | null
          excluido_em?: string | null
          id?: string
          nome: string
          responsavel_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          empresa_id?: string
          endereco?: string | null
          excluido_em?: string | null
          id?: string
          nome?: string
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_armazens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_armazens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_armazens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_inventarios: {
        Row: {
          armazem_id: string
          criado_em: string | null
          data_fim: string | null
          data_inicio: string
          empresa_id: string
          id: string
          observacoes: string | null
          responsavel_id: string | null
          status: string | null
        }
        Insert: {
          armazem_id: string
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          empresa_id: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string | null
        }
        Update: {
          armazem_id?: string
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          empresa_id?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_inventarios_armazem_id_fkey"
            columns: ["armazem_id"]
            isOneToOne: false
            referencedRelation: "estoque_armazens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_inventarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_inventarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_inventarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_inventarios_itens: {
        Row: {
          criado_em: string | null
          divergencia: number | null
          empresa_id: string
          id: string
          inventario_id: string
          observacoes: string | null
          produto_id: string
          quantidade_contada: number | null
          quantidade_sistema: number | null
        }
        Insert: {
          criado_em?: string | null
          divergencia?: number | null
          empresa_id: string
          id?: string
          inventario_id: string
          observacoes?: string | null
          produto_id: string
          quantidade_contada?: number | null
          quantidade_sistema?: number | null
        }
        Update: {
          criado_em?: string | null
          divergencia?: number | null
          empresa_id?: string
          id?: string
          inventario_id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade_contada?: number | null
          quantidade_sistema?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_inventarios_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_inventarios_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_inventarios_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_inventarios_itens_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "estoque_inventarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_inventarios_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_localizacoes: {
        Row: {
          armazem_id: string
          ativo: boolean | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          tipo: string | null
        }
        Insert: {
          armazem_id: string
          ativo?: boolean | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          tipo?: string | null
        }
        Update: {
          armazem_id?: string
          ativo?: boolean | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_localizacoes_armazem_id_fkey"
            columns: ["armazem_id"]
            isOneToOne: false
            referencedRelation: "estoque_armazens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_localizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_localizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_localizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_lotes: {
        Row: {
          criado_em: string | null
          data_fabricacao: string | null
          data_validade: string
          empresa_id: string
          excluido_em: string | null
          id: string
          numero_lote: string
          produto_id: string
          quantidade: number | null
          status: string | null
        }
        Insert: {
          criado_em?: string | null
          data_fabricacao?: string | null
          data_validade: string
          empresa_id: string
          excluido_em?: string | null
          id?: string
          numero_lote: string
          produto_id: string
          quantidade?: number | null
          status?: string | null
        }
        Update: {
          criado_em?: string | null
          data_fabricacao?: string | null
          data_validade?: string
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          numero_lote?: string
          produto_id?: string
          quantidade?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_lotes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_lotes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_lotes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_lotes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentacoes: {
        Row: {
          criado_em: string | null
          destino: string | null
          empresa_id: string
          id: string
          observacao: string | null
          origem: string | null
          produto_id: string
          quantidade: number
          responsavel_id: string | null
          tipo: string | null
        }
        Insert: {
          criado_em?: string | null
          destino?: string | null
          empresa_id: string
          id?: string
          observacao?: string | null
          origem?: string | null
          produto_id: string
          quantidade: number
          responsavel_id?: string | null
          tipo?: string | null
        }
        Update: {
          criado_em?: string | null
          destino?: string | null
          empresa_id?: string
          id?: string
          observacao?: string | null
          origem?: string | null
          produto_id?: string
          quantidade?: number
          responsavel_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_reservas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_expiracao: string | null
          empresa_id: string
          estoque_id: string
          id: string
          motivo: string | null
          produto_id: string
          quantidade: number
          responsavel_id: string | null
          status: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_expiracao?: string | null
          empresa_id: string
          estoque_id: string
          id?: string
          motivo?: string | null
          produto_id: string
          quantidade: number
          responsavel_id?: string | null
          status?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_expiracao?: string | null
          empresa_id?: string
          estoque_id?: string
          id?: string
          motivo?: string | null
          produto_id?: string
          quantidade?: number
          responsavel_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_reservas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_reservas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "estoque_reservas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_reservas_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_reservas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          atualizado_em: string | null
          cancelada_por: string | null
          cfop: string | null
          chave_acesso: string | null
          cirurgia_id: string | null
          cliente_cpf_cnpj: string
          cliente_id: string | null
          cliente_nome: string
          cliente_tipo: string | null
          criado_em: string | null
          data_cancelamento: string | null
          data_emissao: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          emitida_por: string | null
          empresa_id: string
          excluido_em: string | null
          forma_pagamento: string | null
          id: string
          motivo_cancelamento: string | null
          natureza_operacao: string | null
          numero_nfe: string
          observacoes: string | null
          observacoes_internas: string | null
          pdf_url: string | null
          pedido_id: string | null
          protocolo_autorizacao: string | null
          serie: string
          status: string
          status_sefaz: string | null
          tipo: string
          valor_desconto: number | null
          valor_frete: number | null
          valor_impostos: number | null
          valor_produtos: number
          valor_total: number
          xml_nfe: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cancelada_por?: string | null
          cfop?: string | null
          chave_acesso?: string | null
          cirurgia_id?: string | null
          cliente_cpf_cnpj: string
          cliente_id?: string | null
          cliente_nome: string
          cliente_tipo?: string | null
          criado_em?: string | null
          data_cancelamento?: string | null
          data_emissao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          emitida_por?: string | null
          empresa_id: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          id?: string
          motivo_cancelamento?: string | null
          natureza_operacao?: string | null
          numero_nfe: string
          observacoes?: string | null
          observacoes_internas?: string | null
          pdf_url?: string | null
          pedido_id?: string | null
          protocolo_autorizacao?: string | null
          serie: string
          status?: string
          status_sefaz?: string | null
          tipo: string
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_impostos?: number | null
          valor_produtos?: number
          valor_total: number
          xml_nfe?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cancelada_por?: string | null
          cfop?: string | null
          chave_acesso?: string | null
          cirurgia_id?: string | null
          cliente_cpf_cnpj?: string
          cliente_id?: string | null
          cliente_nome?: string
          cliente_tipo?: string | null
          criado_em?: string | null
          data_cancelamento?: string | null
          data_emissao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          emitida_por?: string | null
          empresa_id?: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          id?: string
          motivo_cancelamento?: string | null
          natureza_operacao?: string | null
          numero_nfe?: string
          observacoes?: string | null
          observacoes_internas?: string | null
          pdf_url?: string | null
          pedido_id?: string | null
          protocolo_autorizacao?: string | null
          serie?: string
          status?: string
          status_sefaz?: string | null
          tipo?: string
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_impostos?: number | null
          valor_produtos?: number
          valor_total?: number
          xml_nfe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cancelada_por_fkey"
            columns: ["cancelada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_emitida_por_fkey"
            columns: ["emitida_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "faturas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          cnpj: string | null
          criado_em: string | null
          email: string | null
          empresa_id: string
          endereco: string | null
          excluido_em: string | null
          id: string
          nome: string
          rating: number | null
          status: string | null
          telefone: string | null
          volume_compras: number | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          empresa_id: string
          endereco?: string | null
          excluido_em?: string | null
          id?: string
          nome: string
          rating?: number | null
          status?: string | null
          telefone?: string | null
          volume_compras?: number | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          excluido_em?: string | null
          id?: string
          nome?: string
          rating?: number | null
          status?: string | null
          telefone?: string | null
          volume_compras?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitais: {
        Row: {
          atualizado_em: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          criado_em: string | null
          email: string | null
          empresa_id: string
          endereco: string | null
          estado: string | null
          excluido_em: string | null
          id: string
          nome: string
          status: string | null
          telefone: string | null
          tipo: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          excluido_em?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone?: string | null
          tipo?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          excluido_em?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospitais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospitais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "hospitais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_kit: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          kit_id: string
          lote_id: string | null
          produto_id: string
          quantidade: number
          quantidade_consumida: number | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          kit_id: string
          lote_id?: string | null
          produto_id: string
          quantidade?: number
          quantidade_consumida?: number | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          kit_id?: string
          lote_id?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_consumida?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_kit_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_kit_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_kit_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          atualizado_em: string | null
          cirurgia_id: string | null
          criado_em: string | null
          data_consumo: string | null
          data_montagem: string | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          nome: string
          status: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cirurgia_id?: string | null
          criado_em?: string | null
          data_consumo?: string | null
          data_montagem?: string | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          nome: string
          status?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cirurgia_id?: string | null
          criado_em?: string | null
          data_consumo?: string | null
          data_montagem?: string | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          nome?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kits_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kits_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kits_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "kits_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          atualizado_em: string | null
          cargo: string | null
          criado_em: string | null
          data_ultimo_contato: string | null
          email: string | null
          empresa_id: string
          empresa_origem: string | null
          estagio: string | null
          excluido_em: string | null
          id: string
          nome: string
          probabilidade: number | null
          proxima_acao: string | null
          rating: number | null
          responsavel_id: string | null
          telefone: string | null
          valor_estimado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          cargo?: string | null
          criado_em?: string | null
          data_ultimo_contato?: string | null
          email?: string | null
          empresa_id: string
          empresa_origem?: string | null
          estagio?: string | null
          excluido_em?: string | null
          id?: string
          nome: string
          probabilidade?: number | null
          proxima_acao?: string | null
          rating?: number | null
          responsavel_id?: string | null
          telefone?: string | null
          valor_estimado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          cargo?: string | null
          criado_em?: string | null
          data_ultimo_contato?: string | null
          email?: string | null
          empresa_id?: string
          empresa_origem?: string | null
          estagio?: string | null
          excluido_em?: string | null
          id?: string
          nome?: string
          probabilidade?: number | null
          proxima_acao?: string | null
          rating?: number | null
          responsavel_id?: string | null
          telefone?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_abertura: string
          data_encerramento: string | null
          data_publicacao: string
          data_resultado: string | null
          descricao: string | null
          id: string
          modalidade: string
          motivo_perda: string | null
          nossa_classificacao: number | null
          numero_edital: string
          observacoes: string | null
          orgao_comprador_cidade: string | null
          orgao_comprador_cnpj: string | null
          orgao_comprador_nome: string
          orgao_comprador_tipo: string
          orgao_comprador_uf: string | null
          portal: string | null
          prazo_vigencia_fim: string | null
          prazo_vigencia_inicio: string | null
          produtos: Json | null
          responsavel_id: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string | null
          url_portal: string | null
          valor_estimado: number | null
          valor_vencedor: number | null
          vencedor_cnpj: string | null
          vencedor_nome: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_abertura: string
          data_encerramento?: string | null
          data_publicacao: string
          data_resultado?: string | null
          descricao?: string | null
          id?: string
          modalidade: string
          motivo_perda?: string | null
          nossa_classificacao?: number | null
          numero_edital: string
          observacoes?: string | null
          orgao_comprador_cidade?: string | null
          orgao_comprador_cnpj?: string | null
          orgao_comprador_nome: string
          orgao_comprador_tipo: string
          orgao_comprador_uf?: string | null
          portal?: string | null
          prazo_vigencia_fim?: string | null
          prazo_vigencia_inicio?: string | null
          produtos?: Json | null
          responsavel_id?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string | null
          url_portal?: string | null
          valor_estimado?: number | null
          valor_vencedor?: number | null
          vencedor_cnpj?: string | null
          vencedor_nome?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_abertura?: string
          data_encerramento?: string | null
          data_publicacao?: string
          data_resultado?: string | null
          descricao?: string | null
          id?: string
          modalidade?: string
          motivo_perda?: string | null
          nossa_classificacao?: number | null
          numero_edital?: string
          observacoes?: string | null
          orgao_comprador_cidade?: string | null
          orgao_comprador_cnpj?: string | null
          orgao_comprador_nome?: string
          orgao_comprador_tipo?: string
          orgao_comprador_uf?: string | null
          portal?: string | null
          prazo_vigencia_fim?: string | null
          prazo_vigencia_inicio?: string | null
          produtos?: Json | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          url_portal?: string | null
          valor_estimado?: number | null
          valor_vencedor?: number | null
          vencedor_cnpj?: string | null
          vencedor_nome?: string | null
        }
        Relationships: []
      }
      lotes: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_fabricacao: string | null
          data_validade: string
          excluido_em: string | null
          id: string
          numero_lote: string
          numero_serie: string | null
          produto_id: string
          quantidade_disponivel: number
          quantidade_inicial: number
          registro_anvisa: string | null
          status: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_fabricacao?: string | null
          data_validade: string
          excluido_em?: string | null
          id?: string
          numero_lote: string
          numero_serie?: string | null
          produto_id: string
          quantidade_disponivel?: number
          quantidade_inicial?: number
          registro_anvisa?: string | null
          status?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_fabricacao?: string | null
          data_validade?: string
          excluido_em?: string | null
          id?: string
          numero_lote?: string
          numero_serie?: string | null
          produto_id?: string
          quantidade_disponivel?: number
          quantidade_inicial?: number
          registro_anvisa?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lotes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_consignados: {
        Row: {
          categoria: string | null
          codigo_interno: string
          contrato_id: string | null
          created_at: string | null
          custo_carregamento: number | null
          data_recebimento: string
          dias_estoque: number | null
          fabricante: string | null
          fornecedor: string | null
          hospital_id: string | null
          hospital_nome: string
          id: string
          lote: string | null
          nome: string
          observacoes: string | null
          produto_id: string | null
          quantidade: number
          rotatividade: string | null
          serie: string | null
          status: string | null
          ultima_movimentacao_data: string | null
          ultima_movimentacao_responsavel: string | null
          ultima_movimentacao_tipo: string | null
          updated_at: string | null
          validade: string | null
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          categoria?: string | null
          codigo_interno: string
          contrato_id?: string | null
          created_at?: string | null
          custo_carregamento?: number | null
          data_recebimento: string
          dias_estoque?: number | null
          fabricante?: string | null
          fornecedor?: string | null
          hospital_id?: string | null
          hospital_nome: string
          id?: string
          lote?: string | null
          nome: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          rotatividade?: string | null
          serie?: string | null
          status?: string | null
          ultima_movimentacao_data?: string | null
          ultima_movimentacao_responsavel?: string | null
          ultima_movimentacao_tipo?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_total?: number | null
          valor_unitario: number
        }
        Update: {
          categoria?: string | null
          codigo_interno?: string
          contrato_id?: string | null
          created_at?: string | null
          custo_carregamento?: number | null
          data_recebimento?: string
          dias_estoque?: number | null
          fabricante?: string | null
          fornecedor?: string | null
          hospital_id?: string | null
          hospital_nome?: string
          id?: string
          lote?: string | null
          nome?: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          rotatividade?: string | null
          serie?: string | null
          status?: string | null
          ultima_movimentacao_data?: string | null
          ultima_movimentacao_responsavel?: string | null
          ultima_movimentacao_tipo?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "materiais_consignados_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_consignados_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_consignados_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_opme: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string | null
          descricao: string | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fabricante: string | null
          id: string
          nome: string
          status: string | null
          unidade_medida: string | null
          updated_at: string | null
          valor_unitario: number | null
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fabricante?: string | null
          id?: string
          nome: string
          status?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_unitario?: number | null
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fabricante?: string | null
          id?: string
          nome?: string
          status?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      medicos: {
        Row: {
          atualizado_em: string | null
          cep: string | null
          cirurgias_realizadas: number | null
          criado_em: string | null
          crm: string
          crm_uf: string
          email: string | null
          empresa_id: string
          endereco: string | null
          especialidade: string
          excluido_em: string | null
          hospital_principal: string | null
          id: string
          nome: string
          status: string | null
          telefone: string | null
          usuario_id: string | null
          volume_anual_estimado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          cep?: string | null
          cirurgias_realizadas?: number | null
          criado_em?: string | null
          crm: string
          crm_uf: string
          email?: string | null
          empresa_id: string
          endereco?: string | null
          especialidade: string
          excluido_em?: string | null
          hospital_principal?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone?: string | null
          usuario_id?: string | null
          volume_anual_estimado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          cep?: string | null
          cirurgias_realizadas?: number | null
          criado_em?: string | null
          crm?: string
          crm_uf?: string
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          especialidade?: string
          excluido_em?: string | null
          hospital_principal?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          usuario_id?: string | null
          volume_anual_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "medicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_vectors: {
        Row: {
          created_at: string
          dimension: number
          embedding: string
          external_id: string
          id: string
          metadata: Json | null
          module: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dimension: number
          embedding: string
          external_id: string
          id?: string
          metadata?: Json | null
          module: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dimension?: number
          embedding?: string
          external_id?: string
          id?: string
          metadata?: Json | null
          module?: string
          updated_at?: string
        }
        Relationships: []
      }
      nfe_produtos: {
        Row: {
          anvisa_registro: string | null
          cfop: string
          codigo: string
          cofins_aliquota: number
          cofins_valor: number
          created_at: string
          data_fabricacao: string | null
          data_validade: string | null
          icms_aliquota: number
          icms_valor: number
          id: string
          ipi_aliquota: number | null
          ipi_valor: number | null
          lote: string | null
          ncm: string
          nfe_id: string
          nome: string
          numero_serie: string | null
          pis_aliquota: number
          pis_valor: number
          produto_id: string
          quantidade: number
          unidade: string
          updated_at: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          anvisa_registro?: string | null
          cfop: string
          codigo: string
          cofins_aliquota?: number
          cofins_valor?: number
          created_at?: string
          data_fabricacao?: string | null
          data_validade?: string | null
          icms_aliquota?: number
          icms_valor?: number
          id?: string
          ipi_aliquota?: number | null
          ipi_valor?: number | null
          lote?: string | null
          ncm: string
          nfe_id: string
          nome: string
          numero_serie?: string | null
          pis_aliquota?: number
          pis_valor?: number
          produto_id: string
          quantidade: number
          unidade: string
          updated_at?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          anvisa_registro?: string | null
          cfop?: string
          codigo?: string
          cofins_aliquota?: number
          cofins_valor?: number
          created_at?: string
          data_fabricacao?: string | null
          data_validade?: string | null
          icms_aliquota?: number
          icms_valor?: number
          id?: string
          ipi_aliquota?: number | null
          ipi_valor?: number | null
          lote?: string | null
          ncm?: string
          nfe_id?: string
          nome?: string
          numero_serie?: string | null
          pis_aliquota?: number
          pis_valor?: number
          produto_id?: string
          quantidade?: number
          unidade?: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "nfe_produtos_nfe_id_fkey"
            columns: ["nfe_id"]
            isOneToOne: false
            referencedRelation: "nfes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfe_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      nfes: {
        Row: {
          chave_acesso: string | null
          danfe_url: string | null
          data_autorizacao: string | null
          data_criacao: string
          data_emissao: string
          data_saida: string | null
          data_ultima_alteracao: string | null
          destinatario_bairro: string | null
          destinatario_cep: string | null
          destinatario_cnpj_cpf: string
          destinatario_email: string
          destinatario_id: string
          destinatario_ie: string | null
          destinatario_logradouro: string | null
          destinatario_municipio: string | null
          destinatario_nome_fantasia: string | null
          destinatario_numero: string | null
          destinatario_razao_social: string
          destinatario_tipo: string | null
          destinatario_uf: string | null
          id: string
          informacoes_complementares: string | null
          modalidade_frete: string | null
          motivo_cancelamento: string | null
          motivo_rejeicao: string | null
          numero: number
          protocolo_autorizacao: string | null
          rastreabilidade_produtos_rastreados: number
          rastreabilidade_total_produtos: number
          serie: number
          status: string
          transportadora_cnpj: string | null
          transportadora_razao_social: string | null
          usuario_autorizacao: string | null
          usuario_criacao: string
          valor_desconto: number
          valor_frete: number
          valor_produtos: number
          valor_total: number
          valor_total_tributos: number
          xml_autorizacao: string | null
          xml_nfe: string | null
        }
        Insert: {
          chave_acesso?: string | null
          danfe_url?: string | null
          data_autorizacao?: string | null
          data_criacao?: string
          data_emissao?: string
          data_saida?: string | null
          data_ultima_alteracao?: string | null
          destinatario_bairro?: string | null
          destinatario_cep?: string | null
          destinatario_cnpj_cpf: string
          destinatario_email: string
          destinatario_id: string
          destinatario_ie?: string | null
          destinatario_logradouro?: string | null
          destinatario_municipio?: string | null
          destinatario_nome_fantasia?: string | null
          destinatario_numero?: string | null
          destinatario_razao_social: string
          destinatario_tipo?: string | null
          destinatario_uf?: string | null
          id?: string
          informacoes_complementares?: string | null
          modalidade_frete?: string | null
          motivo_cancelamento?: string | null
          motivo_rejeicao?: string | null
          numero: number
          protocolo_autorizacao?: string | null
          rastreabilidade_produtos_rastreados?: number
          rastreabilidade_total_produtos?: number
          serie?: number
          status: string
          transportadora_cnpj?: string | null
          transportadora_razao_social?: string | null
          usuario_autorizacao?: string | null
          usuario_criacao: string
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_total?: number
          valor_total_tributos?: number
          xml_autorizacao?: string | null
          xml_nfe?: string | null
        }
        Update: {
          chave_acesso?: string | null
          danfe_url?: string | null
          data_autorizacao?: string | null
          data_criacao?: string
          data_emissao?: string
          data_saida?: string | null
          data_ultima_alteracao?: string | null
          destinatario_bairro?: string | null
          destinatario_cep?: string | null
          destinatario_cnpj_cpf?: string
          destinatario_email?: string
          destinatario_id?: string
          destinatario_ie?: string | null
          destinatario_logradouro?: string | null
          destinatario_municipio?: string | null
          destinatario_nome_fantasia?: string | null
          destinatario_numero?: string | null
          destinatario_razao_social?: string
          destinatario_tipo?: string | null
          destinatario_uf?: string | null
          id?: string
          informacoes_complementares?: string | null
          modalidade_frete?: string | null
          motivo_cancelamento?: string | null
          motivo_rejeicao?: string | null
          numero?: number
          protocolo_autorizacao?: string | null
          rastreabilidade_produtos_rastreados?: number
          rastreabilidade_total_produtos?: number
          serie?: number
          status?: string
          transportadora_cnpj?: string | null
          transportadora_razao_social?: string | null
          usuario_autorizacao?: string | null
          usuario_criacao?: string
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_total?: number
          valor_total_tributos?: number
          xml_autorizacao?: string | null
          xml_nfe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          alergias: string | null
          ativo: boolean | null
          celular: string | null
          consentimento_lgpd: boolean | null
          consentimento_lgpd_data: string | null
          convenio_id: string | null
          cpf: string | null
          created_at: string | null
          created_by: string | null
          data_nascimento: string
          email: string | null
          empresa_id: string
          endereco: Json | null
          estado_civil: string | null
          grupo_sanguineo: string | null
          id: string
          medicamentos_uso: string | null
          nome_completo: string
          nome_mae: string
          nome_pai: string | null
          numero_carteirinha: string | null
          observacoes: string | null
          observacoes_saude: string | null
          plano: string | null
          rg: string | null
          sexo: string | null
          telefone: string | null
          tipo_atendimento: string | null
          updated_at: string | null
          updated_by: string | null
          validade_plano: string | null
        }
        Insert: {
          alergias?: string | null
          ativo?: boolean | null
          celular?: string | null
          consentimento_lgpd?: boolean | null
          consentimento_lgpd_data?: string | null
          convenio_id?: string | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          data_nascimento: string
          email?: string | null
          empresa_id: string
          endereco?: Json | null
          estado_civil?: string | null
          grupo_sanguineo?: string | null
          id?: string
          medicamentos_uso?: string | null
          nome_completo: string
          nome_mae: string
          nome_pai?: string | null
          numero_carteirinha?: string | null
          observacoes?: string | null
          observacoes_saude?: string | null
          plano?: string | null
          rg?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_atendimento?: string | null
          updated_at?: string | null
          updated_by?: string | null
          validade_plano?: string | null
        }
        Update: {
          alergias?: string | null
          ativo?: boolean | null
          celular?: string | null
          consentimento_lgpd?: boolean | null
          consentimento_lgpd_data?: string | null
          convenio_id?: string | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          data_nascimento?: string
          email?: string | null
          empresa_id?: string
          endereco?: Json | null
          estado_civil?: string | null
          grupo_sanguineo?: string | null
          id?: string
          medicamentos_uso?: string | null
          nome_completo?: string
          nome_mae?: string
          nome_pai?: string | null
          numero_carteirinha?: string | null
          observacoes?: string | null
          observacoes_saude?: string | null
          plano?: string | null
          rg?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_atendimento?: string | null
          updated_at?: string | null
          updated_by?: string | null
          validade_plano?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "pacientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_entrega_prevista: string | null
          data_pedido: string | null
          empresa_id: string
          excluido_em: string | null
          fornecedor_id: string | null
          id: string
          numero: string
          observacoes: string | null
          status: string | null
          urgencia: string | null
          valor_total: number
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_entrega_prevista?: string | null
          data_pedido?: string | null
          empresa_id: string
          excluido_em?: string | null
          fornecedor_id?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          status?: string | null
          urgencia?: string | null
          valor_total: number
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_entrega_prevista?: string | null
          data_pedido?: string | null
          empresa_id?: string
          excluido_em?: string | null
          fornecedor_id?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          status?: string | null
          urgencia?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "pedidos_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_groups: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          permissions_ids: string[] | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          permissions_ids?: string[] | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          permissions_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_groups_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permission_groups_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "permission_groups_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          acao: string
          codigo: string
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          recurso: string
          sistema: boolean | null
        }
        Insert: {
          acao: string
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          recurso: string
          sistema?: boolean | null
        }
        Update: {
          acao?: string
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          recurso?: string
          sistema?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "permissions_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      portais_opme_cache: {
        Row: {
          created_at: string | null
          expira_em: string
          id: string
          palavra_chave: string
          portal: string
          quantidade: number
          resultado: Json
        }
        Insert: {
          created_at?: string | null
          expira_em: string
          id?: string
          palavra_chave: string
          portal: string
          quantidade: number
          resultado: Json
        }
        Update: {
          created_at?: string | null
          expira_em?: string
          id?: string
          palavra_chave?: string
          portal?: string
          quantidade?: number
          resultado?: Json
        }
        Relationships: []
      }
      portais_opme_config: {
        Row: {
          api_endpoint: string | null
          api_key: string | null
          api_secret: string | null
          ativo: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          nome_exibicao: string
          portal: string
          proxy_enabled: boolean | null
          rate_limit_por_minuto: number | null
          requisicoes_erro: number | null
          requisicoes_sucesso: number | null
          retry_max: number | null
          scraping_enabled: boolean | null
          timeout_segundos: number | null
          tipo_integracao: string
          total_requisicoes: number | null
          ultima_requisicao: string | null
          updated_at: string | null
          url_base: string
          user_agent: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome_exibicao: string
          portal: string
          proxy_enabled?: boolean | null
          rate_limit_por_minuto?: number | null
          requisicoes_erro?: number | null
          requisicoes_sucesso?: number | null
          retry_max?: number | null
          scraping_enabled?: boolean | null
          timeout_segundos?: number | null
          tipo_integracao: string
          total_requisicoes?: number | null
          ultima_requisicao?: string | null
          updated_at?: string | null
          url_base: string
          user_agent?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome_exibicao?: string
          portal?: string
          proxy_enabled?: boolean | null
          rate_limit_por_minuto?: number | null
          requisicoes_erro?: number | null
          requisicoes_sucesso?: number | null
          retry_max?: number | null
          scraping_enabled?: boolean | null
          timeout_segundos?: number | null
          tipo_integracao?: string
          total_requisicoes?: number | null
          ultima_requisicao?: string | null
          updated_at?: string | null
          url_base?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      portais_opme_cotacoes: {
        Row: {
          cirurgia_id: string | null
          created_at: string | null
          data_cotacao: string | null
          economia_estimada: number | null
          id: string
          melhor_preco: number | null
          palavra_chave: string
          percentual_economia: number | null
          portal_melhor_preco: string | null
          produto_id: string | null
          quantidade: number
          realizado_por: string | null
          status: string | null
          tempo_execucao_ms: number | null
          total_ofertas_encontradas: number | null
          total_portais_consultados: number | null
        }
        Insert: {
          cirurgia_id?: string | null
          created_at?: string | null
          data_cotacao?: string | null
          economia_estimada?: number | null
          id?: string
          melhor_preco?: number | null
          palavra_chave: string
          percentual_economia?: number | null
          portal_melhor_preco?: string | null
          produto_id?: string | null
          quantidade: number
          realizado_por?: string | null
          status?: string | null
          tempo_execucao_ms?: number | null
          total_ofertas_encontradas?: number | null
          total_portais_consultados?: number | null
        }
        Update: {
          cirurgia_id?: string | null
          created_at?: string | null
          data_cotacao?: string | null
          economia_estimada?: number | null
          id?: string
          melhor_preco?: number | null
          palavra_chave?: string
          percentual_economia?: number | null
          portal_melhor_preco?: string | null
          produto_id?: string | null
          quantidade?: number
          realizado_por?: string | null
          status?: string | null
          tempo_execucao_ms?: number | null
          total_ofertas_encontradas?: number | null
          total_portais_consultados?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_cotacoes_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_cotacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_cotacoes_realizado_por_fkey"
            columns: ["realizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      portais_opme_historico: {
        Row: {
          cotacao_id: string | null
          created_at: string | null
          data_consulta: string | null
          erro_mensagem: string | null
          id: string
          melhor_oferta: Json | null
          ofertas: Json | null
          portal: string
          segunda_melhor: Json | null
          sucesso: boolean | null
          tempo_resposta_ms: number | null
          terceira_melhor: Json | null
          total_ofertas: number | null
        }
        Insert: {
          cotacao_id?: string | null
          created_at?: string | null
          data_consulta?: string | null
          erro_mensagem?: string | null
          id?: string
          melhor_oferta?: Json | null
          ofertas?: Json | null
          portal: string
          segunda_melhor?: Json | null
          sucesso?: boolean | null
          tempo_resposta_ms?: number | null
          terceira_melhor?: Json | null
          total_ofertas?: number | null
        }
        Update: {
          cotacao_id?: string | null
          created_at?: string | null
          data_consulta?: string | null
          erro_mensagem?: string | null
          id?: string
          melhor_oferta?: Json | null
          ofertas?: Json | null
          portal?: string
          segunda_melhor?: Json | null
          sucesso?: boolean | null
          tempo_resposta_ms?: number | null
          terceira_melhor?: Json | null
          total_ofertas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_historico_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "portais_opme_cotacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      portais_opme_palavras_chave: {
        Row: {
          ativo: boolean | null
          confianca_ia: number | null
          created_at: string | null
          created_by: string | null
          id: string
          palavra_chave: string
          portal: string | null
          prioridade: number | null
          produto_id: string | null
          sugerida_por_ia: boolean | null
          taxa_sucesso: number | null
          tipo: string | null
          total_buscas: number | null
          total_resultados: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          confianca_ia?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          palavra_chave: string
          portal?: string | null
          prioridade?: number | null
          produto_id?: string | null
          sugerida_por_ia?: boolean | null
          taxa_sucesso?: number | null
          tipo?: string | null
          total_buscas?: number | null
          total_resultados?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          confianca_ia?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          palavra_chave?: string
          portal?: string | null
          prioridade?: number | null
          produto_id?: string | null
          sugerida_por_ia?: boolean | null
          taxa_sucesso?: number | null
          tipo?: string | null
          total_buscas?: number | null
          total_resultados?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_palavras_chave_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_palavras_chave_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          codigo_sku: string
          criado_em: string | null
          descricao: string
          empresa_id: string
          excluido_em: string | null
          fabricante: string | null
          id: string
          registro_anvisa: string | null
          status: string | null
          subcategoria: string | null
          unidade_medida: string | null
          valor_unitario: number | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          codigo_sku: string
          criado_em?: string | null
          descricao: string
          empresa_id: string
          excluido_em?: string | null
          fabricante?: string | null
          id?: string
          registro_anvisa?: string | null
          status?: string | null
          subcategoria?: string | null
          unidade_medida?: string | null
          valor_unitario?: number | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          codigo_sku?: string
          criado_em?: string | null
          descricao?: string
          empresa_id?: string
          excluido_em?: string | null
          fabricante?: string | null
          id?: string
          registro_anvisa?: string | null
          status?: string | null
          subcategoria?: string | null
          unidade_medida?: string | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_opme: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          fabricante: string | null
          id: string
          nome: string
          ponto_reposicao: number | null
          registro_anvisa: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          fabricante?: string | null
          id?: string
          nome: string
          ponto_reposicao?: number | null
          registro_anvisa?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          fabricante?: string | null
          id?: string
          nome?: string
          ponto_reposicao?: number | null
          registro_anvisa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_opme_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_opme_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "produtos_opme_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      propostas_comerciais: {
        Row: {
          analise_viabilidade: string | null
          aprovada_comercial: boolean | null
          aprovada_diretoria: boolean | null
          aprovada_financeiro: boolean | null
          condicoes_pagamento: string | null
          created_at: string | null
          created_by: string | null
          desconto_percentual: number | null
          documentos_anexos: Json | null
          enviada_em: string | null
          enviada_por: string | null
          garantia_percentual: number | null
          garantia_tipo: string | null
          garantia_valor: number | null
          id: string
          licitacao_id: string
          margem_bruta_percentual: number | null
          margem_liquida_percentual: number | null
          numero_proposta: string
          observacoes: string | null
          prazo_entrega: number | null
          prazo_pagamento: number | null
          status: string
          updated_at: string | null
          valor_total: number
          versao: number | null
        }
        Insert: {
          analise_viabilidade?: string | null
          aprovada_comercial?: boolean | null
          aprovada_diretoria?: boolean | null
          aprovada_financeiro?: boolean | null
          condicoes_pagamento?: string | null
          created_at?: string | null
          created_by?: string | null
          desconto_percentual?: number | null
          documentos_anexos?: Json | null
          enviada_em?: string | null
          enviada_por?: string | null
          garantia_percentual?: number | null
          garantia_tipo?: string | null
          garantia_valor?: number | null
          id?: string
          licitacao_id: string
          margem_bruta_percentual?: number | null
          margem_liquida_percentual?: number | null
          numero_proposta: string
          observacoes?: string | null
          prazo_entrega?: number | null
          prazo_pagamento?: number | null
          status?: string
          updated_at?: string | null
          valor_total: number
          versao?: number | null
        }
        Update: {
          analise_viabilidade?: string | null
          aprovada_comercial?: boolean | null
          aprovada_diretoria?: boolean | null
          aprovada_financeiro?: boolean | null
          condicoes_pagamento?: string | null
          created_at?: string | null
          created_by?: string | null
          desconto_percentual?: number | null
          documentos_anexos?: Json | null
          enviada_em?: string | null
          enviada_por?: string | null
          garantia_percentual?: number | null
          garantia_tipo?: string | null
          garantia_valor?: number | null
          id?: string
          licitacao_id?: string
          margem_bruta_percentual?: number | null
          margem_liquida_percentual?: number | null
          numero_proposta?: string
          observacoes?: string | null
          prazo_entrega?: number | null
          prazo_pagamento?: number | null
          status?: string
          updated_at?: string | null
          valor_total?: number
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_comerciais_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          concedido_em: string | null
          concedido_por_id: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          concedido_em?: string | null
          concedido_por_id?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          concedido_em?: string | null
          concedido_por_id?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_concedido_por_id_fkey"
            columns: ["concedido_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nivel: number | null
          nome: string
          sistema: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nivel?: number | null
          nome: string
          sistema?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nivel?: number | null
          nome?: string
          sistema?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "roles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
        Row: {
          atualizado_em: string | null
          categoria: string
          convenio_id: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em: string | null
          forma_pagamento: string | null
          id: string
          medico_id: string | null
          observacoes: string | null
          status: string | null
          tipo: string
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          categoria: string
          convenio_id?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          status?: string | null
          tipo: string
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string
          convenio_id?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          empresa_id?: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "transacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "view_medicos_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          ativo: boolean | null
          atribuido_em: string | null
          atribuido_por_id: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          role_id: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          atribuido_em?: string | null
          atribuido_por_id?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          role_id: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          atribuido_em?: string | null
          atribuido_por_id?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          role_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_atribuido_por_id_fkey"
            columns: ["atribuido_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          atualizado_em: string | null
          avatar_url: string | null
          criado_em: string | null
          email: string
          empresa_id: string
          excluido_em: string | null
          id: string
          nome_completo: string | null
          perfil: string | null
          role: string | null
        }
        Insert: {
          atualizado_em?: string | null
          avatar_url?: string | null
          criado_em?: string | null
          email: string
          empresa_id: string
          excluido_em?: string | null
          id: string
          nome_completo?: string | null
          perfil?: string | null
          role?: string | null
        }
        Update: {
          atualizado_em?: string | null
          avatar_url?: string | null
          criado_em?: string | null
          email?: string
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          nome_completo?: string | null
          perfil?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_aprovacoes: {
        Row: {
          created_at: string | null
          dados_contexto: Json | null
          expira_em: string | null
          id: string
          mensagem: string | null
          respondido_em: string | null
          resposta: string | null
          solicitado_em: string | null
          solicitado_para: string
          status: string
          workflow_execucao_id: string
        }
        Insert: {
          created_at?: string | null
          dados_contexto?: Json | null
          expira_em?: string | null
          id?: string
          mensagem?: string | null
          respondido_em?: string | null
          resposta?: string | null
          solicitado_em?: string | null
          solicitado_para: string
          status?: string
          workflow_execucao_id: string
        }
        Update: {
          created_at?: string | null
          dados_contexto?: Json | null
          expira_em?: string | null
          id?: string
          mensagem?: string | null
          respondido_em?: string | null
          resposta?: string | null
          solicitado_em?: string | null
          solicitado_para?: string
          status?: string
          workflow_execucao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_aprovacoes_workflow_execucao_id_fkey"
            columns: ["workflow_execucao_id"]
            isOneToOne: false
            referencedRelation: "workflow_execucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execucoes: {
        Row: {
          aguardando_aprovacao_de: string | null
          aprovado_em: string | null
          aprovado_por: string | null
          duracao_ms: number | null
          erro_mensagem: string | null
          erro_step_id: string | null
          finished_at: string | null
          id: string
          started_at: string | null
          status: string
          steps_log: Json | null
          trigger_data: Json | null
          workflow_id: string
        }
        Insert: {
          aguardando_aprovacao_de?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          duracao_ms?: number | null
          erro_mensagem?: string | null
          erro_step_id?: string | null
          finished_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          steps_log?: Json | null
          trigger_data?: Json | null
          workflow_id: string
        }
        Update: {
          aguardando_aprovacao_de?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          duracao_ms?: number | null
          erro_mensagem?: string | null
          erro_step_id?: string | null
          finished_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          steps_log?: Json | null
          trigger_data?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execucoes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          categoria: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          is_ativo: boolean | null
          is_template: boolean | null
          nome: string
          proxima_execucao: string | null
          steps: Json
          total_execucoes: number | null
          trigger_config: Json | null
          trigger_tipo: string
          ultima_execucao: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          is_ativo?: boolean | null
          is_template?: boolean | null
          nome: string
          proxima_execucao?: string | null
          steps: Json
          total_execucoes?: number | null
          trigger_config?: Json | null
          trigger_tipo: string
          ultima_execucao?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          is_ativo?: boolean | null
          is_template?: boolean | null
          nome?: string
          proxima_execucao?: string | null
          steps?: Json
          total_execucoes?: number | null
          trigger_config?: Json | null
          trigger_tipo?: string
          ultima_execucao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mv_kpis_empresa: {
        Row: {
          atualizado_em: string | null
          cirurgias_agendadas: number | null
          cirurgias_concluidas: number | null
          despesas_pagas: number | null
          empresa_id: string | null
          empresa_nome: string | null
          estoque_disponivel: number | null
          leads_fechamento: number | null
          receitas_pagas: number | null
          receitas_pendentes: number | null
          total_cirurgias: number | null
          total_leads: number | null
          total_produtos: number | null
        }
        Relationships: []
      }
      view_dashboard_financeiro: {
        Row: {
          despesas_pagas: number | null
          despesas_pendentes: number | null
          receitas_pendentes: number | null
          receitas_recebidas: number | null
        }
        Relationships: []
      }
      view_empresas_sem_dpo: {
        Row: {
          alerta: string | null
          cnpj: string | null
          criado_em: string | null
          dias_desde_criacao: number | null
          email: string | null
          id: string | null
          nome: string | null
        }
        Insert: {
          alerta?: never
          cnpj?: string | null
          criado_em?: string | null
          dias_desde_criacao?: never
          email?: string | null
          id?: string | null
          nome?: string | null
        }
        Update: {
          alerta?: never
          cnpj?: string | null
          criado_em?: string | null
          dias_desde_criacao?: never
          email?: string | null
          id?: string | null
          nome?: string | null
        }
        Relationships: []
      }
      view_medicos_stats: {
        Row: {
          especialidade: string | null
          faturamento_total: number | null
          id: string | null
          nome: string | null
          ticket_medio: number | null
          total_cirurgias: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonimizar_dados_usuario: {
        Args: { p_usuario_id: string }
        Returns: undefined
      }
      atualizar_estatisticas_palavra_chave: {
        Args: { p_palavra_chave_id: string; p_total_resultados: number }
        Returns: undefined
      }
      atualizar_estatisticas_portal: {
        Args: { p_portal: string; p_sucesso: boolean }
        Returns: undefined
      }
      atualizar_estoque_material: {
        Args: { p_material_id: string; p_quantidade: number }
        Returns: undefined
      }
      bloquear_lotes_vencidos: { Args: never; Returns: number }
      calcular_taxa_sucesso_medico: {
        Args: { p_medico_id: string }
        Returns: number
      }
      compute_audit_hash: {
        Args: {
          p_acao: string
          p_dados_antes: Json
          p_dados_depois: Json
          p_empresa_id: string
          p_hash_anterior: string
          p_registro_id: string
          p_tabela: string
          p_usuario_id: string
        }
        Returns: string
      }
      consumir_kit: {
        Args: { p_kit_id: string; p_quantidades_consumidas: Json }
        Returns: boolean
      }
      current_empresa: { Args: never; Returns: string }
      current_empresa_id: { Args: never; Returns: string }
      current_perfil: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      exportar_dados_usuario: { Args: { p_usuario_id: string }; Returns: Json }
      gerar_caminho_storage: {
        Args: {
          p_empresa_id: string
          p_entidade: string
          p_extensao: string
          p_registro_id: string
        }
        Returns: string
      }
      insert_audit_log: {
        Args: {
          p_acao: string
          p_dados_antes: Json
          p_dados_depois: Json
          p_empresa_id: string
          p_registro_id: string
          p_tabela: string
          p_usuario_id: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      limpar_cache_expirado: { Args: never; Returns: number }
      refresh_mv_kpis: { Args: never; Returns: undefined }
      reservar_kit: { Args: { p_kit_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      validar_dpo_configurado: {
        Args: { p_empresa_id: string }
        Returns: {
          configurado: boolean
          dias_desde_nomeacao: number
          dpo_email: string
          dpo_nome: string
          mensagem: string
        }[]
      }
      validar_lote: {
        Args: { p_lote_id: string }
        Returns: {
          data_validade: string
          lote_id: string
          motivo: string
          numero_lote: string
          produto_descricao: string
          registro_anvisa: string
          valido: boolean
        }[]
      }
      validar_upload_arquivo: {
        Args: {
          p_bucket: string
          p_mime_type: string
          p_nome_arquivo: string
          p_tamanho: number
        }
        Returns: boolean
      }
      verificar_integridade_audit_log: {
        Args: never
        Returns: {
          hash_esperado: string
          hash_registrado: string
          integro: boolean
          registro_id: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
