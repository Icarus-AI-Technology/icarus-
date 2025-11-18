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
  public: {
    Tables: {
      acoes_corretivas: {
        Row: {
          atividades_realizadas: string | null
          atualizado_em: string | null
          atualizado_por: string | null
          categoria: string
          criado_em: string | null
          criado_por: string | null
          custo_estimado: number | null
          data_conclusao_prevista: string
          data_conclusao_real: string | null
          data_inicio_prevista: string
          data_inicio_real: string | null
          data_planejamento: string | null
          data_verificacao_eficacia: string | null
          descricao: string
          dificuldades_encontradas: string | null
          eficaz: boolean | null
          empresa_id: string
          evidencias_urls: string[] | null
          excluido_em: string | null
          id: string
          licoes_aprendidas: string | null
          metodo_verificacao: string | null
          nao_conformidade_id: string
          numero: string
          observacoes: string | null
          participantes: string[] | null
          plano_acao: string
          progresso: number | null
          recursos_necessarios: string | null
          responsavel_id: string
          resultado_verificacao: string | null
          status: string | null
          tipo: string
          verificada_por_id: string | null
        }
        Insert: {
          atividades_realizadas?: string | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          categoria: string
          criado_em?: string | null
          criado_por?: string | null
          custo_estimado?: number | null
          data_conclusao_prevista: string
          data_conclusao_real?: string | null
          data_inicio_prevista: string
          data_inicio_real?: string | null
          data_planejamento?: string | null
          data_verificacao_eficacia?: string | null
          descricao: string
          dificuldades_encontradas?: string | null
          eficaz?: boolean | null
          empresa_id: string
          evidencias_urls?: string[] | null
          excluido_em?: string | null
          id?: string
          licoes_aprendidas?: string | null
          metodo_verificacao?: string | null
          nao_conformidade_id: string
          numero: string
          observacoes?: string | null
          participantes?: string[] | null
          plano_acao: string
          progresso?: number | null
          recursos_necessarios?: string | null
          responsavel_id: string
          resultado_verificacao?: string | null
          status?: string | null
          tipo: string
          verificada_por_id?: string | null
        }
        Update: {
          atividades_realizadas?: string | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          categoria?: string
          criado_em?: string | null
          criado_por?: string | null
          custo_estimado?: number | null
          data_conclusao_prevista?: string
          data_conclusao_real?: string | null
          data_inicio_prevista?: string
          data_inicio_real?: string | null
          data_planejamento?: string | null
          data_verificacao_eficacia?: string | null
          descricao?: string
          dificuldades_encontradas?: string | null
          eficaz?: boolean | null
          empresa_id?: string
          evidencias_urls?: string[] | null
          excluido_em?: string | null
          id?: string
          licoes_aprendidas?: string | null
          metodo_verificacao?: string | null
          nao_conformidade_id?: string
          numero?: string
          observacoes?: string | null
          participantes?: string[] | null
          plano_acao?: string
          progresso?: number | null
          recursos_necessarios?: string | null
          responsavel_id?: string
          resultado_verificacao?: string | null
          status?: string | null
          tipo?: string
          verificada_por_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_corretivas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "acoes_corretivas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_nao_conformidade_id_fkey"
            columns: ["nao_conformidade_id"]
            isOneToOne: false
            referencedRelation: "nao_conformidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_corretivas_verificada_por_id_fkey"
            columns: ["verificada_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      agentes_ia_compliance: {
        Row: {
          acoes_sugeridas: number | null
          alertas_gerados: number | null
          auto_correcao_habilitada: boolean | null
          codigo: string
          created_at: string | null
          falsos_negativos: number | null
          falsos_positivos: number | null
          frequencia_analise: string | null
          id: string
          integracao_externa: boolean | null
          modelo: string | null
          nivel_sensibilidade: string | null
          nome: string
          notificacoes_habilitadas: boolean | null
          proxima_execucao: string | null
          status: string | null
          taxa_acerto: number | null
          tipo: string
          ultima_atualizacao_modelo: string | null
          ultima_execucao: string | null
          updated_at: string | null
          versao_modelo: string | null
        }
        Insert: {
          acoes_sugeridas?: number | null
          alertas_gerados?: number | null
          auto_correcao_habilitada?: boolean | null
          codigo: string
          created_at?: string | null
          falsos_negativos?: number | null
          falsos_positivos?: number | null
          frequencia_analise?: string | null
          id?: string
          integracao_externa?: boolean | null
          modelo?: string | null
          nivel_sensibilidade?: string | null
          nome: string
          notificacoes_habilitadas?: boolean | null
          proxima_execucao?: string | null
          status?: string | null
          taxa_acerto?: number | null
          tipo: string
          ultima_atualizacao_modelo?: string | null
          ultima_execucao?: string | null
          updated_at?: string | null
          versao_modelo?: string | null
        }
        Update: {
          acoes_sugeridas?: number | null
          alertas_gerados?: number | null
          auto_correcao_habilitada?: boolean | null
          codigo?: string
          created_at?: string | null
          falsos_negativos?: number | null
          falsos_positivos?: number | null
          frequencia_analise?: string | null
          id?: string
          integracao_externa?: boolean | null
          modelo?: string | null
          nivel_sensibilidade?: string | null
          nome?: string
          notificacoes_habilitadas?: boolean | null
          proxima_execucao?: string | null
          status?: string | null
          taxa_acerto?: number | null
          tipo?: string
          ultima_atualizacao_modelo?: string | null
          ultima_execucao?: string | null
          updated_at?: string | null
          versao_modelo?: string | null
        }
        Relationships: []
      }
      alertas_compliance: {
        Row: {
          acao_sugerida: string | null
          agente_id: string | null
          analise_ia: string | null
          auditoria_id: string | null
          created_at: string | null
          data_geracao: string | null
          data_resolucao: string | null
          data_visualizacao: string | null
          descricao: string
          id: string
          nc_id: string | null
          prazo: string | null
          prioridade: number | null
          requisito_id: string | null
          responsavel: string | null
          responsavel_cargo: string | null
          severidade: string | null
          status: string | null
          tipo: string
          titulo: string
          treinamento_id: string | null
          updated_at: string | null
        }
        Insert: {
          acao_sugerida?: string | null
          agente_id?: string | null
          analise_ia?: string | null
          auditoria_id?: string | null
          created_at?: string | null
          data_geracao?: string | null
          data_resolucao?: string | null
          data_visualizacao?: string | null
          descricao: string
          id?: string
          nc_id?: string | null
          prazo?: string | null
          prioridade?: number | null
          requisito_id?: string | null
          responsavel?: string | null
          responsavel_cargo?: string | null
          severidade?: string | null
          status?: string | null
          tipo: string
          titulo: string
          treinamento_id?: string | null
          updated_at?: string | null
        }
        Update: {
          acao_sugerida?: string | null
          agente_id?: string | null
          analise_ia?: string | null
          auditoria_id?: string | null
          created_at?: string | null
          data_geracao?: string | null
          data_resolucao?: string | null
          data_visualizacao?: string | null
          descricao?: string
          id?: string
          nc_id?: string | null
          prazo?: string | null
          prioridade?: number | null
          requisito_id?: string | null
          responsavel?: string | null
          responsavel_cargo?: string | null
          severidade?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          treinamento_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_compliance_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "agentes_ia_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_compliance_auditoria_id_fkey"
            columns: ["auditoria_id"]
            isOneToOne: false
            referencedRelation: "auditorias_internas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_compliance_nc_id_fkey"
            columns: ["nc_id"]
            isOneToOne: false
            referencedRelation: "nao_conformidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_compliance_requisito_id_fkey"
            columns: ["requisito_id"]
            isOneToOne: false
            referencedRelation: "compliance_requisitos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_compliance_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos_certificacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_consignacao: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          data_geracao: string | null
          data_leitura: string | null
          data_resolucao: string | null
          descricao: string
          destinatario_cargo: string | null
          destinatario_email: string | null
          destinatario_nome: string | null
          hospital_id: string | null
          id: string
          material_id: string | null
          severidade: string | null
          status: string | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          data_geracao?: string | null
          data_leitura?: string | null
          data_resolucao?: string | null
          descricao: string
          destinatario_cargo?: string | null
          destinatario_email?: string | null
          destinatario_nome?: string | null
          hospital_id?: string | null
          id?: string
          material_id?: string | null
          severidade?: string | null
          status?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          data_geracao?: string | null
          data_leitura?: string | null
          data_resolucao?: string | null
          descricao?: string
          destinatario_cargo?: string | null
          destinatario_email?: string | null
          destinatario_nome?: string | null
          hospital_id?: string | null
          id?: string
          material_id?: string | null
          severidade?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_consignacao_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "alertas_consignacao_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_consignados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_consignacao_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "vw_materiais_criticos_consignacao"
            referencedColumns: ["id"]
          },
        ]
      }
      anvisa_movimentacoes: {
        Row: {
          armazem_id: string | null
          armazem_nome: string | null
          codigo_rastreamento: string | null
          condicoes_transporte: string | null
          created_at: string | null
          created_by: string | null
          data_fabricacao: string | null
          data_movimentacao: string
          data_validade: string
          destino_cnpj: string | null
          destino_razao_social: string | null
          id: string
          lote: string
          lote_origem: string | null
          nfe_id: string | null
          nfe_item_id: string | null
          numero_serie: string | null
          origem_cnpj: string | null
          origem_razao_social: string | null
          produto_codigo: string
          produto_descricao: string
          quantidade: number
          registro_anvisa: string
          responsavel_tecnico_crm: string | null
          responsavel_tecnico_nome: string | null
          temperatura_armazenamento: string | null
          tipo_movimentacao: string
          unidade: string
        }
        Insert: {
          armazem_id?: string | null
          armazem_nome?: string | null
          codigo_rastreamento?: string | null
          condicoes_transporte?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fabricacao?: string | null
          data_movimentacao: string
          data_validade: string
          destino_cnpj?: string | null
          destino_razao_social?: string | null
          id?: string
          lote: string
          lote_origem?: string | null
          nfe_id?: string | null
          nfe_item_id?: string | null
          numero_serie?: string | null
          origem_cnpj?: string | null
          origem_razao_social?: string | null
          produto_codigo: string
          produto_descricao: string
          quantidade: number
          registro_anvisa: string
          responsavel_tecnico_crm?: string | null
          responsavel_tecnico_nome?: string | null
          temperatura_armazenamento?: string | null
          tipo_movimentacao: string
          unidade: string
        }
        Update: {
          armazem_id?: string | null
          armazem_nome?: string | null
          codigo_rastreamento?: string | null
          condicoes_transporte?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fabricacao?: string | null
          data_movimentacao?: string
          data_validade?: string
          destino_cnpj?: string | null
          destino_razao_social?: string | null
          id?: string
          lote?: string
          lote_origem?: string | null
          nfe_id?: string | null
          nfe_item_id?: string | null
          numero_serie?: string | null
          origem_cnpj?: string | null
          origem_razao_social?: string | null
          produto_codigo?: string
          produto_descricao?: string
          quantidade?: number
          registro_anvisa?: string
          responsavel_tecnico_crm?: string | null
          responsavel_tecnico_nome?: string | null
          temperatura_armazenamento?: string | null
          tipo_movimentacao?: string
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "anvisa_movimentacoes_nfe_id_fkey"
            columns: ["nfe_id"]
            isOneToOne: false
            referencedRelation: "nfes"
            referencedColumns: ["id"]
          },
        ]
      }
      api_alerts: {
        Row: {
          created_at: string
          detalhes: Json | null
          endpoint_id: string | null
          endpoint_nome: string | null
          id: string
          is_resolved: boolean | null
          mensagem: string
          notification_channels: string[] | null
          notified_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          severidade: string
          tipo: string
        }
        Insert: {
          created_at?: string
          detalhes?: Json | null
          endpoint_id?: string | null
          endpoint_nome?: string | null
          id?: string
          is_resolved?: boolean | null
          mensagem: string
          notification_channels?: string[] | null
          notified_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severidade: string
          tipo: string
        }
        Update: {
          created_at?: string
          detalhes?: Json | null
          endpoint_id?: string | null
          endpoint_nome?: string | null
          id?: string
          is_resolved?: boolean | null
          mensagem?: string
          notification_channels?: string[] | null
          notified_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severidade?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_alerts_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_alerts_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
        ]
      }
      api_cache: {
        Row: {
          cache_key: string
          created_at: string
          endpoint_id: string
          expires_at: string
          hit_count: number | null
          id: string
          last_hit_at: string | null
          response_body: Json
          response_headers: Json | null
          response_status: number
        }
        Insert: {
          cache_key: string
          created_at?: string
          endpoint_id: string
          expires_at: string
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          response_body: Json
          response_headers?: Json | null
          response_status: number
        }
        Update: {
          cache_key?: string
          created_at?: string
          endpoint_id?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          response_body?: Json
          response_headers?: Json | null
          response_status?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_cache_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_cache_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
        ]
      }
      api_circuit_breaker: {
        Row: {
          endpoint_id: string
          failure_count: number | null
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          next_attempt_at: string | null
          opened_at: string | null
          state: string
          success_count: number | null
          updated_at: string | null
        }
        Insert: {
          endpoint_id: string
          failure_count?: number | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          next_attempt_at?: string | null
          opened_at?: string | null
          state?: string
          success_count?: number | null
          updated_at?: string | null
        }
        Update: {
          endpoint_id?: string
          failure_count?: number | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          next_attempt_at?: string | null
          opened_at?: string | null
          state?: string
          success_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_circuit_breaker_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: true
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_circuit_breaker_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: true
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
        ]
      }
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
            foreignKeyName: "api_credentials_audit_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "api_credentials_list"
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
      api_health_checks: {
        Row: {
          checked_at: string
          endpoint_id: string
          error_message: string | null
          id: string
          is_healthy: boolean
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          endpoint_id: string
          error_message?: string | null
          id?: string
          is_healthy: boolean
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          endpoint_id?: string
          error_message?: string | null
          id?: string
          is_healthy?: boolean
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_health_checks_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_health_checks_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
        ]
      }
      api_keys: {
        Row: {
          aplicacao: string | null
          ativa: boolean | null
          atualizado_em: string | null
          bloqueada: boolean | null
          chave: string
          criado_em: string | null
          criado_por: string | null
          data_expiracao: string | null
          descricao: string | null
          dominios_permitidos: string[] | null
          empresa_id: string
          endpoints_permitidos: string[] | null
          escopo: string | null
          excluido_em: string | null
          expira: boolean | null
          id: string
          ips_permitidos: unknown[] | null
          motivo_bloqueio: string | null
          nome: string
          permissoes: string[] | null
          prefixo: string
          rate_limit_custom: number | null
          rate_limit_janela_segundos: number | null
          rate_limit_override: boolean | null
          rotacionada_de_id: string | null
          tipo: string | null
          total_requisicoes: number | null
          ultima_requisicao: string | null
          ultima_requisicao_ip: unknown
          usuario_id: string | null
        }
        Insert: {
          aplicacao?: string | null
          ativa?: boolean | null
          atualizado_em?: string | null
          bloqueada?: boolean | null
          chave: string
          criado_em?: string | null
          criado_por?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          dominios_permitidos?: string[] | null
          empresa_id: string
          endpoints_permitidos?: string[] | null
          escopo?: string | null
          excluido_em?: string | null
          expira?: boolean | null
          id?: string
          ips_permitidos?: unknown[] | null
          motivo_bloqueio?: string | null
          nome: string
          permissoes?: string[] | null
          prefixo: string
          rate_limit_custom?: number | null
          rate_limit_janela_segundos?: number | null
          rate_limit_override?: boolean | null
          rotacionada_de_id?: string | null
          tipo?: string | null
          total_requisicoes?: number | null
          ultima_requisicao?: string | null
          ultima_requisicao_ip?: unknown
          usuario_id?: string | null
        }
        Update: {
          aplicacao?: string | null
          ativa?: boolean | null
          atualizado_em?: string | null
          bloqueada?: boolean | null
          chave?: string
          criado_em?: string | null
          criado_por?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          dominios_permitidos?: string[] | null
          empresa_id?: string
          endpoints_permitidos?: string[] | null
          escopo?: string | null
          excluido_em?: string | null
          expira?: boolean | null
          id?: string
          ips_permitidos?: unknown[] | null
          motivo_bloqueio?: string | null
          nome?: string
          permissoes?: string[] | null
          prefixo?: string
          rate_limit_custom?: number | null
          rate_limit_janela_segundos?: number | null
          rate_limit_override?: boolean | null
          rotacionada_de_id?: string | null
          tipo?: string | null
          total_requisicoes?: number | null
          ultima_requisicao?: string | null
          ultima_requisicao_ip?: unknown
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "api_keys_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_rotacionada_de_id_fkey"
            columns: ["rotacionada_de_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          cache_hit: boolean | null
          cidade: string | null
          criado_em: string | null
          empresa_id: string
          endpoint_id: string | null
          erro_mensagem: string | null
          erro_stack_trace: string | null
          erro_tipo: string | null
          id: string
          ip_origem: unknown
          metodo: string
          pais: string | null
          path: string
          query_params_json: Json | null
          rate_limit_hit: boolean | null
          rate_limit_remaining: number | null
          referer: string | null
          regiao: string | null
          request_body_json: Json | null
          request_headers_json: Json | null
          request_id: string
          request_size_bytes: number | null
          response_body_json: Json | null
          response_headers_json: Json | null
          response_size_bytes: number | null
          response_status_code: number | null
          response_time_ms: number | null
          sucesso: boolean | null
          timestamp: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          cache_hit?: boolean | null
          cidade?: string | null
          criado_em?: string | null
          empresa_id: string
          endpoint_id?: string | null
          erro_mensagem?: string | null
          erro_stack_trace?: string | null
          erro_tipo?: string | null
          id?: string
          ip_origem: unknown
          metodo: string
          pais?: string | null
          path: string
          query_params_json?: Json | null
          rate_limit_hit?: boolean | null
          rate_limit_remaining?: number | null
          referer?: string | null
          regiao?: string | null
          request_body_json?: Json | null
          request_headers_json?: Json | null
          request_id: string
          request_size_bytes?: number | null
          response_body_json?: Json | null
          response_headers_json?: Json | null
          response_size_bytes?: number | null
          response_status_code?: number | null
          response_time_ms?: number | null
          sucesso?: boolean | null
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          cache_hit?: boolean | null
          cidade?: string | null
          criado_em?: string | null
          empresa_id?: string
          endpoint_id?: string | null
          erro_mensagem?: string | null
          erro_stack_trace?: string | null
          erro_tipo?: string | null
          id?: string
          ip_origem?: unknown
          metodo?: string
          pais?: string | null
          path?: string
          query_params_json?: Json | null
          rate_limit_hit?: boolean | null
          rate_limit_remaining?: number | null
          referer?: string | null
          regiao?: string | null
          request_body_json?: Json | null
          request_headers_json?: Json | null
          request_id?: string
          request_size_bytes?: number | null
          response_body_json?: Json | null
          response_headers_json?: Json | null
          response_size_bytes?: number | null
          response_status_code?: number | null
          response_time_ms?: number | null
          sucesso?: boolean | null
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "api_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
          {
            foreignKeyName: "api_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          api_key_id: string | null
          atualizado_em: string | null
          chave_limite: string
          criado_em: string | null
          data_limite_atingido: string | null
          empresa_id: string
          endpoint_id: string | null
          id: string
          ip_origem: unknown
          janela_duracao_segundos: number
          janela_fim: string
          janela_inicio: string
          limite_atingido: boolean | null
          limite_requests: number
          proxima_janela: string
          requests_consumidos: number | null
          requests_restantes: number | null
        }
        Insert: {
          api_key_id?: string | null
          atualizado_em?: string | null
          chave_limite: string
          criado_em?: string | null
          data_limite_atingido?: string | null
          empresa_id: string
          endpoint_id?: string | null
          id?: string
          ip_origem?: unknown
          janela_duracao_segundos: number
          janela_fim: string
          janela_inicio: string
          limite_atingido?: boolean | null
          limite_requests: number
          proxima_janela: string
          requests_consumidos?: number | null
          requests_restantes?: number | null
        }
        Update: {
          api_key_id?: string | null
          atualizado_em?: string | null
          chave_limite?: string
          criado_em?: string | null
          data_limite_atingido?: string | null
          empresa_id?: string
          endpoint_id?: string | null
          id?: string
          ip_origem?: unknown
          janela_duracao_segundos?: number
          janela_fim?: string
          janela_inicio?: string
          limite_atingido?: boolean | null
          limite_requests?: number
          proxima_janela?: string
          requests_consumidos?: number | null
          requests_restantes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "api_rate_limits_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
        ]
      }
      api_requests_log: {
        Row: {
          circuit_breaker_state: string | null
          created_at: string
          endpoint_id: string | null
          endpoint_nome: string | null
          error_message: string | null
          error_stack: string | null
          from_cache: boolean | null
          id: string
          ip_address: unknown
          request_body: Json | null
          request_headers: Json | null
          request_method: string | null
          request_params: Json | null
          request_url: string | null
          response_body: Json | null
          response_headers: Json | null
          response_status: number | null
          response_time_ms: number | null
          retry_attempt: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          circuit_breaker_state?: string | null
          created_at?: string
          endpoint_id?: string | null
          endpoint_nome?: string | null
          error_message?: string | null
          error_stack?: string | null
          from_cache?: boolean | null
          id?: string
          ip_address?: unknown
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          request_params?: Json | null
          request_url?: string | null
          response_body?: Json | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          retry_attempt?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          circuit_breaker_state?: string | null
          created_at?: string
          endpoint_id?: string | null
          endpoint_nome?: string | null
          error_message?: string | null
          error_stack?: string | null
          from_cache?: boolean | null
          id?: string
          ip_address?: unknown
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          request_params?: Json | null
          request_url?: string | null
          response_body?: Json | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          retry_attempt?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_log_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_log_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "vw_api_metrics"
            referencedColumns: ["endpoint_id"]
          },
        ]
      }
      atividades_crm: {
        Row: {
          atualizado_em: string | null
          criada_por_id: string | null
          criado_em: string | null
          data_conclusao: string | null
          data_lembrete: string | null
          data_vencimento: string | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          lead_id: string | null
          oportunidade_id: string | null
          prioridade: string | null
          proposta_id: string | null
          responsavel_id: string
          resultado: string | null
          status: string | null
          tempo_gasto_minutos: number | null
          tipo: string
          titulo: string
        }
        Insert: {
          atualizado_em?: string | null
          criada_por_id?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_lembrete?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          lead_id?: string | null
          oportunidade_id?: string | null
          prioridade?: string | null
          proposta_id?: string | null
          responsavel_id: string
          resultado?: string | null
          status?: string | null
          tempo_gasto_minutos?: number | null
          tipo: string
          titulo: string
        }
        Update: {
          atualizado_em?: string | null
          criada_por_id?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_lembrete?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          lead_id?: string | null
          oportunidade_id?: string | null
          prioridade?: string | null
          proposta_id?: string | null
          responsavel_id?: string
          resultado?: string | null
          status?: string | null
          tempo_gasto_minutos?: number | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_crm_criada_por_id_fkey"
            columns: ["criada_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_crm_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_crm_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "atividades_crm_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_crm_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_crm_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_crm_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_crm_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
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
      audit_logs_advanced: {
        Row: {
          action: string
          changes: Json | null
          data_retention_until: string | null
          error_message: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          request_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          status: string
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip_address: unknown
        }
        Insert: {
          action: string
          changes?: Json | null
          data_retention_until?: string | null
          error_message?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          status: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Update: {
          action?: string
          changes?: Json | null
          data_retention_until?: string | null
          error_message?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          status?: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Relationships: []
      }
      auditorias: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          auditor_lider_id: string | null
          auditores: string[] | null
          certificado_emitido: boolean | null
          certificado_url: string | null
          certificado_validade: string | null
          conclusao: string | null
          criado_em: string | null
          criado_por: string | null
          data_fim: string
          data_inicio: string
          data_planejamento: string | null
          data_relatorio: string | null
          departamentos_auditados: string[] | null
          duracao_horas: number | null
          empresa_id: string
          entidade_auditora: string | null
          escopo: string
          excluido_em: string | null
          id: string
          normas_aplicaveis: string[] | null
          numero: string
          objetivo: string | null
          observacoes: string | null
          oportunidades_melhoria: string | null
          percentual_conformidade: number | null
          pontos_fortes: string | null
          pontuacao_geral: number | null
          processos_auditados: string[] | null
          recomendacoes: string | null
          relatorio_url: string | null
          status: string | null
          tipo: string
          titulo: string
          total_conformidades: number | null
          total_nao_conformidades: number | null
          total_observacoes: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          auditor_lider_id?: string | null
          auditores?: string[] | null
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          certificado_validade?: string | null
          conclusao?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_fim: string
          data_inicio: string
          data_planejamento?: string | null
          data_relatorio?: string | null
          departamentos_auditados?: string[] | null
          duracao_horas?: number | null
          empresa_id: string
          entidade_auditora?: string | null
          escopo: string
          excluido_em?: string | null
          id?: string
          normas_aplicaveis?: string[] | null
          numero: string
          objetivo?: string | null
          observacoes?: string | null
          oportunidades_melhoria?: string | null
          percentual_conformidade?: number | null
          pontos_fortes?: string | null
          pontuacao_geral?: number | null
          processos_auditados?: string[] | null
          recomendacoes?: string | null
          relatorio_url?: string | null
          status?: string | null
          tipo: string
          titulo: string
          total_conformidades?: number | null
          total_nao_conformidades?: number | null
          total_observacoes?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          auditor_lider_id?: string | null
          auditores?: string[] | null
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          certificado_validade?: string | null
          conclusao?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string
          data_inicio?: string
          data_planejamento?: string | null
          data_relatorio?: string | null
          departamentos_auditados?: string[] | null
          duracao_horas?: number | null
          empresa_id?: string
          entidade_auditora?: string | null
          escopo?: string
          excluido_em?: string | null
          id?: string
          normas_aplicaveis?: string[] | null
          numero?: string
          objetivo?: string | null
          observacoes?: string | null
          oportunidades_melhoria?: string | null
          percentual_conformidade?: number | null
          pontos_fortes?: string | null
          pontuacao_geral?: number | null
          processos_auditados?: string[] | null
          recomendacoes?: string | null
          relatorio_url?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          total_conformidades?: number | null
          total_nao_conformidades?: number | null
          total_observacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auditorias_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_auditor_lider_id_fkey"
            columns: ["auditor_lider_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "auditorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      auditorias_internas: {
        Row: {
          areas_auditadas: string[] | null
          auditor_lider: string | null
          codigo: string
          created_at: string | null
          data_conclusao: string | null
          data_execucao: string | null
          data_planejamento: string | null
          equipe_auditoria: string[] | null
          fabricante_alvo: string | null
          id: string
          nao_conformidades_criticas: number | null
          nao_conformidades_maiores: number | null
          nao_conformidades_menores: number | null
          observacoes: string | null
          observacoes_positivas: string[] | null
          plano_acao_gerado: boolean | null
          relatorio_pdf: string | null
          score_global: number | null
          status: string | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          areas_auditadas?: string[] | null
          auditor_lider?: string | null
          codigo: string
          created_at?: string | null
          data_conclusao?: string | null
          data_execucao?: string | null
          data_planejamento?: string | null
          equipe_auditoria?: string[] | null
          fabricante_alvo?: string | null
          id?: string
          nao_conformidades_criticas?: number | null
          nao_conformidades_maiores?: number | null
          nao_conformidades_menores?: number | null
          observacoes?: string | null
          observacoes_positivas?: string[] | null
          plano_acao_gerado?: boolean | null
          relatorio_pdf?: string | null
          score_global?: number | null
          status?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          areas_auditadas?: string[] | null
          auditor_lider?: string | null
          codigo?: string
          created_at?: string | null
          data_conclusao?: string | null
          data_execucao?: string | null
          data_planejamento?: string | null
          equipe_auditoria?: string[] | null
          fabricante_alvo?: string | null
          id?: string
          nao_conformidades_criticas?: number | null
          nao_conformidades_maiores?: number | null
          nao_conformidades_menores?: number | null
          observacoes?: string | null
          observacoes_positivas?: string[] | null
          plano_acao_gerado?: boolean | null
          relatorio_pdf?: string | null
          score_global?: number | null
          status?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      auditorias_itens: {
        Row: {
          atualizado_em: string | null
          auditoria_id: string
          clausula: string | null
          comentarios_auditor: string | null
          criado_em: string | null
          criticidade: string | null
          data_verificacao: string | null
          departamento: string | null
          descricao: string
          evidencias: string | null
          evidencias_urls: string[] | null
          id: string
          impacto: string | null
          metodo_verificacao: string | null
          nao_conformidade_id: string | null
          numero_item: string
          observacoes: string | null
          processo: string | null
          requisito_id: string | null
          responsavel_area: string | null
          resultado: string
        }
        Insert: {
          atualizado_em?: string | null
          auditoria_id: string
          clausula?: string | null
          comentarios_auditor?: string | null
          criado_em?: string | null
          criticidade?: string | null
          data_verificacao?: string | null
          departamento?: string | null
          descricao: string
          evidencias?: string | null
          evidencias_urls?: string[] | null
          id?: string
          impacto?: string | null
          metodo_verificacao?: string | null
          nao_conformidade_id?: string | null
          numero_item: string
          observacoes?: string | null
          processo?: string | null
          requisito_id?: string | null
          responsavel_area?: string | null
          resultado: string
        }
        Update: {
          atualizado_em?: string | null
          auditoria_id?: string
          clausula?: string | null
          comentarios_auditor?: string | null
          criado_em?: string | null
          criticidade?: string | null
          data_verificacao?: string | null
          departamento?: string | null
          descricao?: string
          evidencias?: string | null
          evidencias_urls?: string[] | null
          id?: string
          impacto?: string | null
          metodo_verificacao?: string | null
          nao_conformidade_id?: string | null
          numero_item?: string
          observacoes?: string | null
          processo?: string | null
          requisito_id?: string | null
          responsavel_area?: string | null
          resultado?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditorias_itens_auditoria_id_fkey"
            columns: ["auditoria_id"]
            isOneToOne: false
            referencedRelation: "auditorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_itens_requisito_id_fkey"
            columns: ["requisito_id"]
            isOneToOne: false
            referencedRelation: "compliance_requisitos"
            referencedColumns: ["id"]
          },
        ]
      }
      backups: {
        Row: {
          concluido_em: string | null
          created_by: string | null
          duracao_segundos: number | null
          expires_at: string | null
          id: string
          iniciado_em: string | null
          nome: string
          status: string
          storage_hash: string | null
          storage_url: string
          tabelas: string[] | null
          tamanho_bytes: number | null
          tipo: string
          total_registros: number | null
        }
        Insert: {
          concluido_em?: string | null
          created_by?: string | null
          duracao_segundos?: number | null
          expires_at?: string | null
          id?: string
          iniciado_em?: string | null
          nome: string
          status?: string
          storage_hash?: string | null
          storage_url: string
          tabelas?: string[] | null
          tamanho_bytes?: number | null
          tipo: string
          total_registros?: number | null
        }
        Update: {
          concluido_em?: string | null
          created_by?: string | null
          duracao_segundos?: number | null
          expires_at?: string | null
          id?: string
          iniciado_em?: string | null
          nome?: string
          status?: string
          storage_hash?: string | null
          storage_url?: string
          tabelas?: string[] | null
          tamanho_bytes?: number | null
          tipo?: string
          total_registros?: number | null
        }
        Relationships: []
      }
      bancos: {
        Row: {
          agencia: string
          agencia_digito: string | null
          apelido: string
          ativo: boolean | null
          atualizado_em: string | null
          chave_pix: string | null
          codigo_banco: string
          conta: string
          conta_digito: string | null
          conta_principal: boolean | null
          criado_em: string | null
          data_saldo: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          limite_cheque_especial: number | null
          limite_usado: number | null
          nome_banco: string
          observacoes: string | null
          pluggy_account_id: string | null
          pluggy_item_id: string | null
          saldo_atual: number | null
          saldo_inicial: number | null
          sincronizacao_automatica: boolean | null
          tipo_chave_pix: string | null
          tipo_conta: string | null
          ultima_sincronizacao: string | null
        }
        Insert: {
          agencia: string
          agencia_digito?: string | null
          apelido: string
          ativo?: boolean | null
          atualizado_em?: string | null
          chave_pix?: string | null
          codigo_banco: string
          conta: string
          conta_digito?: string | null
          conta_principal?: boolean | null
          criado_em?: string | null
          data_saldo?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          limite_cheque_especial?: number | null
          limite_usado?: number | null
          nome_banco: string
          observacoes?: string | null
          pluggy_account_id?: string | null
          pluggy_item_id?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          sincronizacao_automatica?: boolean | null
          tipo_chave_pix?: string | null
          tipo_conta?: string | null
          ultima_sincronizacao?: string | null
        }
        Update: {
          agencia?: string
          agencia_digito?: string | null
          apelido?: string
          ativo?: boolean | null
          atualizado_em?: string | null
          chave_pix?: string | null
          codigo_banco?: string
          conta?: string
          conta_digito?: string | null
          conta_principal?: boolean | null
          criado_em?: string | null
          data_saldo?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          limite_cheque_especial?: number | null
          limite_usado?: number | null
          nome_banco?: string
          observacoes?: string | null
          pluggy_account_id?: string | null
          pluggy_item_id?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          sincronizacao_automatica?: boolean | null
          tipo_chave_pix?: string | null
          tipo_conta?: string | null
          ultima_sincronizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bancos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bancos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bancos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboards: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          auto_refresh: boolean | null
          categoria: string | null
          compartilhado_com: string[] | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          favorito: boolean | null
          filtros_globais: Json | null
          id: string
          layout_config: Json | null
          nome: string
          ordem: number | null
          proprietario_id: string
          publico: boolean | null
          refresh_interval: number | null
          ultimo_acesso: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          auto_refresh?: boolean | null
          categoria?: string | null
          compartilhado_com?: string[] | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          favorito?: boolean | null
          filtros_globais?: Json | null
          id?: string
          layout_config?: Json | null
          nome: string
          ordem?: number | null
          proprietario_id: string
          publico?: boolean | null
          refresh_interval?: number | null
          ultimo_acesso?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          auto_refresh?: boolean | null
          categoria?: string | null
          compartilhado_com?: string[] | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          favorito?: boolean | null
          filtros_globais?: Json | null
          id?: string
          layout_config?: Json | null
          nome?: string
          ordem?: number | null
          proprietario_id?: string
          publico?: boolean | null
          refresh_interval?: number | null
          ultimo_acesso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_dashboards_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboards_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_dashboards_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboards_proprietario_id_fkey"
            columns: ["proprietario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboards_personalizados: {
        Row: {
          auto_refresh_seconds: number | null
          created_at: string | null
          descricao: string | null
          filtros_padrao: Json | null
          id: string
          is_compartilhado: boolean | null
          is_padrao: boolean | null
          layout: Json
          nome: string
          updated_at: string | null
          user_id: string | null
          widgets: Json
        }
        Insert: {
          auto_refresh_seconds?: number | null
          created_at?: string | null
          descricao?: string | null
          filtros_padrao?: Json | null
          id?: string
          is_compartilhado?: boolean | null
          is_padrao?: boolean | null
          layout: Json
          nome: string
          updated_at?: string | null
          user_id?: string | null
          widgets: Json
        }
        Update: {
          auto_refresh_seconds?: number | null
          created_at?: string | null
          descricao?: string | null
          filtros_padrao?: Json | null
          id?: string
          is_compartilhado?: boolean | null
          is_padrao?: boolean | null
          layout?: Json
          nome?: string
          updated_at?: string | null
          user_id?: string | null
          widgets?: Json
        }
        Relationships: []
      }
      bi_dimensao_cliente: {
        Row: {
          cidade: string | null
          cliente_id: string
          cnpj: string
          created_at: string | null
          data_cadastro: string | null
          data_ultimo_pedido: string | null
          especialidade: string | null
          estado: string | null
          inadimplencia_percentual: number | null
          is_ativo: boolean | null
          nome_fantasia: string | null
          porte: string | null
          razao_social: string
          regiao: string | null
          score_credito: number | null
          segmento: string | null
          tempo_cliente_dias: number | null
          ticket_medio: number | null
          tipo: string
          total_faturado: number | null
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          cliente_id?: string
          cnpj: string
          created_at?: string | null
          data_cadastro?: string | null
          data_ultimo_pedido?: string | null
          especialidade?: string | null
          estado?: string | null
          inadimplencia_percentual?: number | null
          is_ativo?: boolean | null
          nome_fantasia?: string | null
          porte?: string | null
          razao_social: string
          regiao?: string | null
          score_credito?: number | null
          segmento?: string | null
          tempo_cliente_dias?: number | null
          ticket_medio?: number | null
          tipo: string
          total_faturado?: number | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          cliente_id?: string
          cnpj?: string
          created_at?: string | null
          data_cadastro?: string | null
          data_ultimo_pedido?: string | null
          especialidade?: string | null
          estado?: string | null
          inadimplencia_percentual?: number | null
          is_ativo?: boolean | null
          nome_fantasia?: string | null
          porte?: string | null
          razao_social?: string
          regiao?: string | null
          score_credito?: number | null
          segmento?: string | null
          tempo_cliente_dias?: number | null
          ticket_medio?: number | null
          tipo?: string
          total_faturado?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bi_dimensao_produto: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          codigo_sku: string | null
          descricao: string | null
          empresa_id: string
          fabricante: string | null
          id: string
          produto_id: string
          subcategoria: string | null
          valor_medio: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo_sku?: string | null
          descricao?: string | null
          empresa_id: string
          fabricante?: string | null
          id?: string
          produto_id: string
          subcategoria?: string | null
          valor_medio?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo_sku?: string | null
          descricao?: string | null
          empresa_id?: string
          fabricante?: string | null
          id?: string
          produto_id?: string
          subcategoria?: string | null
          valor_medio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_dimensao_produto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dimensao_produto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_dimensao_produto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dimensao_produto_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: true
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dimensao_tempo: {
        Row: {
          ano: number
          criado_em: string | null
          data: string
          dia: number | null
          dia_ano: number | null
          dia_semana: number | null
          feriado: boolean | null
          fim_semana: boolean | null
          id: string
          mes: number | null
          nome_dia_semana: string | null
          nome_feriado: string | null
          nome_mes: string | null
          semana: number | null
          trimestre: number | null
        }
        Insert: {
          ano: number
          criado_em?: string | null
          data: string
          dia?: number | null
          dia_ano?: number | null
          dia_semana?: number | null
          feriado?: boolean | null
          fim_semana?: boolean | null
          id?: string
          mes?: number | null
          nome_dia_semana?: string | null
          nome_feriado?: string | null
          nome_mes?: string | null
          semana?: number | null
          trimestre?: number | null
        }
        Update: {
          ano?: number
          criado_em?: string | null
          data?: string
          dia?: number | null
          dia_ano?: number | null
          dia_semana?: number | null
          feriado?: boolean | null
          fim_semana?: boolean | null
          id?: string
          mes?: number | null
          nome_dia_semana?: string | null
          nome_feriado?: string | null
          nome_mes?: string | null
          semana?: number | null
          trimestre?: number | null
        }
        Relationships: []
      }
      bi_dimensao_vendedor: {
        Row: {
          comissao_percentual: number | null
          created_at: string | null
          data_admissao: string | null
          email: string | null
          equipe: string | null
          gerente_id: string | null
          is_ativo: boolean | null
          meta_mensal: number | null
          nome: string
          total_clientes_ativos: number | null
          total_vendido: number | null
          updated_at: string | null
          user_id: string | null
          vendedor_id: string
        }
        Insert: {
          comissao_percentual?: number | null
          created_at?: string | null
          data_admissao?: string | null
          email?: string | null
          equipe?: string | null
          gerente_id?: string | null
          is_ativo?: boolean | null
          meta_mensal?: number | null
          nome: string
          total_clientes_ativos?: number | null
          total_vendido?: number | null
          updated_at?: string | null
          user_id?: string | null
          vendedor_id?: string
        }
        Update: {
          comissao_percentual?: number | null
          created_at?: string | null
          data_admissao?: string | null
          email?: string | null
          equipe?: string | null
          gerente_id?: string | null
          is_ativo?: boolean | null
          meta_mensal?: number | null
          nome?: string
          total_clientes_ativos?: number | null
          total_vendido?: number | null
          updated_at?: string | null
          user_id?: string | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_dimensao_vendedor_gerente_id_fkey"
            columns: ["gerente_id"]
            isOneToOne: false
            referencedRelation: "bi_dimensao_vendedor"
            referencedColumns: ["vendedor_id"]
          },
        ]
      }
      bi_dimensoes: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          campos_mapeados: Json | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          hierarquia: string[] | null
          id: string
          nome: string
          tabela_origem: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          campos_mapeados?: Json | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          hierarquia?: string[] | null
          id?: string
          nome: string
          tabela_origem?: string | null
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          campos_mapeados?: Json | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          hierarquia?: string[] | null
          id?: string
          nome?: string
          tabela_origem?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_dimensoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dimensoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_dimensoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_fato_estoque: {
        Row: {
          criado_em: string | null
          data_id: string | null
          empresa_id: string
          entradas: number | null
          id: string
          produto_id: string | null
          quantidade_final: number | null
          quantidade_inicial: number | null
          saidas: number | null
          valor_medio: number | null
          valor_total: number | null
        }
        Insert: {
          criado_em?: string | null
          data_id?: string | null
          empresa_id: string
          entradas?: number | null
          id?: string
          produto_id?: string | null
          quantidade_final?: number | null
          quantidade_inicial?: number | null
          saidas?: number | null
          valor_medio?: number | null
          valor_total?: number | null
        }
        Update: {
          criado_em?: string | null
          data_id?: string | null
          empresa_id?: string
          entradas?: number | null
          id?: string
          produto_id?: string | null
          quantidade_final?: number | null
          quantidade_inicial?: number | null
          saidas?: number | null
          valor_medio?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_fato_estoque_data_id_fkey"
            columns: ["data_id"]
            isOneToOne: false
            referencedRelation: "bi_dimensao_tempo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fato_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fato_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_fato_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fato_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "bi_dimensao_produto"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_fato_vendas: {
        Row: {
          cliente_nome: string | null
          criado_em: string | null
          data_id: string | null
          empresa_id: string
          id: string
          margem: number | null
          origem: string | null
          produto_id: string | null
          quantidade: number | null
          valor_custo: number | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          cliente_nome?: string | null
          criado_em?: string | null
          data_id?: string | null
          empresa_id: string
          id?: string
          margem?: number | null
          origem?: string | null
          produto_id?: string | null
          quantidade?: number | null
          valor_custo?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          cliente_nome?: string | null
          criado_em?: string | null
          data_id?: string | null
          empresa_id?: string
          id?: string
          margem?: number | null
          origem?: string | null
          produto_id?: string | null
          quantidade?: number | null
          valor_custo?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_fato_vendas_data_id_fkey"
            columns: ["data_id"]
            isOneToOne: false
            referencedRelation: "bi_dimensao_tempo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fato_vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fato_vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_fato_vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fato_vendas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "bi_dimensao_produto"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_fatos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          descricao: string | null
          dimensoes_relacionadas: string[] | null
          empresa_id: string
          grao: string | null
          id: string
          metricas: Json
          nome: string
          periodicidade_atualizacao: string | null
          query_sql: string | null
          tabela_origem: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          dimensoes_relacionadas?: string[] | null
          empresa_id: string
          grao?: string | null
          id?: string
          metricas: Json
          nome: string
          periodicidade_atualizacao?: string | null
          query_sql?: string | null
          tabela_origem?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          dimensoes_relacionadas?: string[] | null
          empresa_id?: string
          grao?: string | null
          id?: string
          metricas?: Json
          nome?: string
          periodicidade_atualizacao?: string | null
          query_sql?: string | null
          tabela_origem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_fatos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fatos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_fatos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_fontes_dados: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          configuracao: Json | null
          connection_string: string | null
          credenciais_encrypted: string | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          erro_mensagem: string | null
          headers: Json | null
          id: string
          intervalo_sincronizacao: number | null
          nome: string
          proxima_sincronizacao: string | null
          sincronizacao_automatica: boolean | null
          status: string | null
          tipo: string
          ultima_sincronizacao: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          configuracao?: Json | null
          connection_string?: string | null
          credenciais_encrypted?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          erro_mensagem?: string | null
          headers?: Json | null
          id?: string
          intervalo_sincronizacao?: number | null
          nome: string
          proxima_sincronizacao?: string | null
          sincronizacao_automatica?: boolean | null
          status?: string | null
          tipo: string
          ultima_sincronizacao?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          configuracao?: Json | null
          connection_string?: string | null
          credenciais_encrypted?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          erro_mensagem?: string | null
          headers?: Json | null
          id?: string
          intervalo_sincronizacao?: number | null
          nome?: string
          proxima_sincronizacao?: string | null
          sincronizacao_automatica?: boolean | null
          status?: string | null
          tipo?: string
          ultima_sincronizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_fontes_dados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_fontes_dados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_fontes_dados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_metricas_agregadas: {
        Row: {
          calculated_at: string | null
          crescimento_percentual: number | null
          dimensoes: Json | null
          expires_at: string | null
          granularidade: string
          id: string
          margem_percentual: number
          periodo_fim: string
          periodo_inicio: string
          quantidade_nfes: number
          quantidade_vendida: number
          ticket_medio: number
          total_custo: number
          total_margem: number
          total_vendas: number
        }
        Insert: {
          calculated_at?: string | null
          crescimento_percentual?: number | null
          dimensoes?: Json | null
          expires_at?: string | null
          granularidade: string
          id?: string
          margem_percentual: number
          periodo_fim: string
          periodo_inicio: string
          quantidade_nfes: number
          quantidade_vendida: number
          ticket_medio: number
          total_custo: number
          total_margem: number
          total_vendas: number
        }
        Update: {
          calculated_at?: string | null
          crescimento_percentual?: number | null
          dimensoes?: Json | null
          expires_at?: string | null
          granularidade?: string
          id?: string
          margem_percentual?: number
          periodo_fim?: string
          periodo_inicio?: string
          quantidade_nfes?: number
          quantidade_vendida?: number
          ticket_medio?: number
          total_custo?: number
          total_margem?: number
          total_vendas?: number
        }
        Relationships: []
      }
      bi_previsao_demanda: {
        Row: {
          acuracia_percentual: number | null
          ano: number
          calculated_at: string | null
          confianca_percentual: number | null
          id: string
          media_vendas_12m: number | null
          media_vendas_6m: number | null
          mes: number
          modelo_usado: string | null
          produto_id: string | null
          quantidade_prevista: number
          quantidade_real: number | null
          sazonalidade_fator: number | null
          tendencia: string | null
          valor_previsto: number
          valor_real: number | null
        }
        Insert: {
          acuracia_percentual?: number | null
          ano: number
          calculated_at?: string | null
          confianca_percentual?: number | null
          id?: string
          media_vendas_12m?: number | null
          media_vendas_6m?: number | null
          mes: number
          modelo_usado?: string | null
          produto_id?: string | null
          quantidade_prevista: number
          quantidade_real?: number | null
          sazonalidade_fator?: number | null
          tendencia?: string | null
          valor_previsto: number
          valor_real?: number | null
        }
        Update: {
          acuracia_percentual?: number | null
          ano?: number
          calculated_at?: string | null
          confianca_percentual?: number | null
          id?: string
          media_vendas_12m?: number | null
          media_vendas_6m?: number | null
          mes?: number
          modelo_usado?: string | null
          produto_id?: string | null
          quantidade_prevista?: number
          quantidade_real?: number | null
          sazonalidade_fator?: number | null
          tendencia?: string | null
          valor_previsto?: number
          valor_real?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_previsao_demanda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "bi_dimensao_produto"
            referencedColumns: ["produto_id"]
          },
        ]
      }
      bi_relatorios: {
        Row: {
          agendamento_ativo: boolean | null
          agendamento_cron: string | null
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          destinatarios_email: string[] | null
          destinatarios_ids: string[] | null
          empresa_id: string
          formato: string | null
          id: string
          nome: string
          parametros: Json | null
          proprietario_id: string
          proxima_execucao: string | null
          publico: boolean | null
          query_sql: string
          total_execucoes: number | null
          ultima_execucao: string | null
        }
        Insert: {
          agendamento_ativo?: boolean | null
          agendamento_cron?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          destinatarios_email?: string[] | null
          destinatarios_ids?: string[] | null
          empresa_id: string
          formato?: string | null
          id?: string
          nome: string
          parametros?: Json | null
          proprietario_id: string
          proxima_execucao?: string | null
          publico?: boolean | null
          query_sql: string
          total_execucoes?: number | null
          ultima_execucao?: string | null
        }
        Update: {
          agendamento_ativo?: boolean | null
          agendamento_cron?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          destinatarios_email?: string[] | null
          destinatarios_ids?: string[] | null
          empresa_id?: string
          formato?: string | null
          id?: string
          nome?: string
          parametros?: Json | null
          proprietario_id?: string
          proxima_execucao?: string | null
          publico?: boolean | null
          query_sql?: string
          total_execucoes?: number | null
          ultima_execucao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_relatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_relatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "bi_relatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_relatorios_proprietario_id_fkey"
            columns: ["proprietario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_relatorios_agendados: {
        Row: {
          created_at: string | null
          destinatarios: string[] | null
          dia_mes: number | null
          dia_semana: number | null
          filtros: Json | null
          formato: string
          frequencia: string
          hora: number | null
          id: string
          is_ativo: boolean | null
          nome: string
          proxima_execucao: string | null
          tipo: string
          ultima_execucao: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          destinatarios?: string[] | null
          dia_mes?: number | null
          dia_semana?: number | null
          filtros?: Json | null
          formato: string
          frequencia: string
          hora?: number | null
          id?: string
          is_ativo?: boolean | null
          nome: string
          proxima_execucao?: string | null
          tipo: string
          ultima_execucao?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          destinatarios?: string[] | null
          dia_mes?: number | null
          dia_semana?: number | null
          filtros?: Json | null
          formato?: string
          frequencia?: string
          hora?: number | null
          id?: string
          is_ativo?: boolean | null
          nome?: string
          proxima_execucao?: string | null
          tipo?: string
          ultima_execucao?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bi_widgets: {
        Row: {
          altura: number
          atualizado_em: string | null
          cache_valido_ate: string | null
          configuracao_visual: Json | null
          criado_em: string | null
          dados_cache: Json | null
          dashboard_id: string
          drilldown_enabled: boolean | null
          fato_id: string | null
          filtros: Json | null
          id: string
          largura: number
          posicao_x: number
          posicao_y: number
          query_sql: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          altura: number
          atualizado_em?: string | null
          cache_valido_ate?: string | null
          configuracao_visual?: Json | null
          criado_em?: string | null
          dados_cache?: Json | null
          dashboard_id: string
          drilldown_enabled?: boolean | null
          fato_id?: string | null
          filtros?: Json | null
          id?: string
          largura: number
          posicao_x: number
          posicao_y: number
          query_sql?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          altura?: number
          atualizado_em?: string | null
          cache_valido_ate?: string | null
          configuracao_visual?: Json | null
          criado_em?: string | null
          dados_cache?: Json | null
          dashboard_id?: string
          drilldown_enabled?: boolean | null
          fato_id?: string | null
          filtros?: Json | null
          id?: string
          largura?: number
          posicao_x?: number
          posicao_y?: number
          query_sql?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bi_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_widgets_fato_id_fkey"
            columns: ["fato_id"]
            isOneToOne: false
            referencedRelation: "bi_fatos"
            referencedColumns: ["id"]
          },
        ]
      }
      centros_custo: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          caminho: string | null
          centro_custo_pai_id: string | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          nivel: number | null
          nome: string
          orcamento_anual: number | null
          orcamento_mensal: number | null
          responsavel_id: string | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          caminho?: string | null
          centro_custo_pai_id?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          nivel?: number | null
          nome: string
          orcamento_anual?: number | null
          orcamento_mensal?: number | null
          responsavel_id?: string | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          caminho?: string | null
          centro_custo_pai_id?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          nivel?: number | null
          nome?: string
          orcamento_anual?: number | null
          orcamento_mensal?: number | null
          responsavel_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_centro_custo_pai_id_fkey"
            columns: ["centro_custo_pai_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "centros_custo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      certificacoes_usuario: {
        Row: {
          criado_em: string | null
          data_certificacao: string | null
          data_validade: string | null
          evidencia_url: string | null
          id: string
          papel: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_certificacao?: string | null
          data_validade?: string | null
          evidencia_url?: string | null
          id?: string
          papel: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_certificacao?: string | null
          data_validade?: string | null
          evidencia_url?: string | null
          id?: string
          papel?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      chatbot_anexos: {
        Row: {
          created_at: string | null
          id: string
          mensagem_id: string | null
          nome_arquivo: string
          tamanho: number
          tipo_mime: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mensagem_id?: string | null
          nome_arquivo: string
          tamanho: number
          tipo_mime?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mensagem_id?: string | null
          nome_arquivo?: string
          tamanho?: number
          tipo_mime?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_anexos_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "chatbot_mensagens"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_audit_log: {
        Row: {
          anonimizado: boolean | null
          confianca_intencao: number | null
          confianca_resposta: number | null
          data_retencao_ate: string | null
          id: string
          intencao_detectada: string | null
          mensagem_id: string | null
          modelo_usado: string | null
          score_sentimento: number | null
          tempo_processamento_ms: number | null
          texto_mensagem: string | null
          texto_resposta: string | null
          timestamp: string | null
          tipo_mensagem: string | null
          tokens_usados: number | null
          usuario_id: string | null
        }
        Insert: {
          anonimizado?: boolean | null
          confianca_intencao?: number | null
          confianca_resposta?: number | null
          data_retencao_ate?: string | null
          id?: string
          intencao_detectada?: string | null
          mensagem_id?: string | null
          modelo_usado?: string | null
          score_sentimento?: number | null
          tempo_processamento_ms?: number | null
          texto_mensagem?: string | null
          texto_resposta?: string | null
          timestamp?: string | null
          tipo_mensagem?: string | null
          tokens_usados?: number | null
          usuario_id?: string | null
        }
        Update: {
          anonimizado?: boolean | null
          confianca_intencao?: number | null
          confianca_resposta?: number | null
          data_retencao_ate?: string | null
          id?: string
          intencao_detectada?: string | null
          mensagem_id?: string | null
          modelo_usado?: string | null
          score_sentimento?: number | null
          tempo_processamento_ms?: number | null
          texto_mensagem?: string | null
          texto_resposta?: string | null
          timestamp?: string | null
          tipo_mensagem?: string | null
          tokens_usados?: number | null
          usuario_id?: string | null
        }
        Relationships: []
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
      chatbot_feedback: {
        Row: {
          comentario: string | null
          id: string
          mensagem_id: string | null
          timestamp: string | null
          tipo_feedback: string
        }
        Insert: {
          comentario?: string | null
          id?: string
          mensagem_id?: string | null
          timestamp?: string | null
          tipo_feedback: string
        }
        Update: {
          comentario?: string | null
          id?: string
          mensagem_id?: string | null
          timestamp?: string | null
          tipo_feedback?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_feedback_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "chatbot_mensagens"
            referencedColumns: ["id"]
          },
        ]
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
      chatbot_metricas: {
        Row: {
          created_at: string | null
          data: string
          id: string
          intencoes_mais_comuns: Json | null
          satisfacao_media: number | null
          sentimento_medio: number | null
          taxa_resolucao: number | null
          tempo_medio_resposta_ms: number | null
          total_conversas: number | null
          total_mensagens: number | null
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          intencoes_mais_comuns?: Json | null
          satisfacao_media?: number | null
          sentimento_medio?: number | null
          taxa_resolucao?: number | null
          tempo_medio_resposta_ms?: number | null
          total_conversas?: number | null
          total_mensagens?: number | null
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          intencoes_mais_comuns?: Json | null
          satisfacao_media?: number | null
          sentimento_medio?: number | null
          taxa_resolucao?: number | null
          tempo_medio_resposta_ms?: number | null
          total_conversas?: number | null
          total_mensagens?: number | null
        }
        Relationships: []
      }
      chatbot_pesquisas_gpt: {
        Row: {
          arquivos_gerados: string[] | null
          conversa_id: string | null
          criado_em: string | null
          custo_estimado: number | null
          erro_mensagem: string | null
          fontes_consultadas: Json | null
          id: string
          query: string
          resultado: string | null
          sucesso: boolean | null
          tempo_execucao_ms: number | null
          tokens_utilizados: number | null
          usuario_id: string
        }
        Insert: {
          arquivos_gerados?: string[] | null
          conversa_id?: string | null
          criado_em?: string | null
          custo_estimado?: number | null
          erro_mensagem?: string | null
          fontes_consultadas?: Json | null
          id?: string
          query: string
          resultado?: string | null
          sucesso?: boolean | null
          tempo_execucao_ms?: number | null
          tokens_utilizados?: number | null
          usuario_id: string
        }
        Update: {
          arquivos_gerados?: string[] | null
          conversa_id?: string | null
          criado_em?: string | null
          custo_estimado?: number | null
          erro_mensagem?: string | null
          fontes_consultadas?: Json | null
          id?: string
          query?: string
          resultado?: string | null
          sucesso?: boolean | null
          tempo_execucao_ms?: number | null
          tokens_utilizados?: number | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_pesquisas_gpt_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_pesquisas_gpt_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_sessoes: {
        Row: {
          ativa: boolean | null
          atualizado_em: string | null
          avaliacao: number | null
          contexto_id: string | null
          contexto_tipo: string | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          encerrado_em: string | null
          feedback: string | null
          id: string
          idioma: string | null
          max_tokens: number | null
          modelo_ia: string | null
          modo: string | null
          temperatura: number | null
          titulo: string | null
          total_mensagens: number | null
          total_pesquisas: number | null
          total_tokens_usados: number | null
          ultima_interacao: string | null
          usuario_id: string
        }
        Insert: {
          ativa?: boolean | null
          atualizado_em?: string | null
          avaliacao?: number | null
          contexto_id?: string | null
          contexto_tipo?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          encerrado_em?: string | null
          feedback?: string | null
          id?: string
          idioma?: string | null
          max_tokens?: number | null
          modelo_ia?: string | null
          modo?: string | null
          temperatura?: number | null
          titulo?: string | null
          total_mensagens?: number | null
          total_pesquisas?: number | null
          total_tokens_usados?: number | null
          ultima_interacao?: string | null
          usuario_id: string
        }
        Update: {
          ativa?: boolean | null
          atualizado_em?: string | null
          avaliacao?: number | null
          contexto_id?: string | null
          contexto_tipo?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          encerrado_em?: string | null
          feedback?: string | null
          id?: string
          idioma?: string | null
          max_tokens?: number | null
          modelo_ia?: string | null
          modo?: string | null
          temperatura?: number | null
          titulo?: string | null
          total_mensagens?: number | null
          total_pesquisas?: number | null
          total_tokens_usados?: number | null
          ultima_interacao?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_sessoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_sessoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "chatbot_sessoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_sessoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_treinamento: {
        Row: {
          created_at: string | null
          data_treino: string | null
          entidades: Json | null
          id: string
          input: string
          intencao: string | null
          output_esperado: string
          usado_em_treino: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_treino?: string | null
          entidades?: Json | null
          id?: string
          input: string
          intencao?: string | null
          output_esperado: string
          usado_em_treino?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_treino?: string | null
          entidades?: Json | null
          id?: string
          input?: string
          intencao?: string | null
          output_esperado?: string
          usado_em_treino?: boolean | null
        }
        Relationships: []
      }
      checklist_auditoria: {
        Row: {
          auditoria_id: string | null
          categoria: string
          conforme: boolean | null
          created_at: string | null
          criticidade: string | null
          descricao: string | null
          evidencia: string | null
          id: string
          observacoes: string | null
          requisito: string
        }
        Insert: {
          auditoria_id?: string | null
          categoria: string
          conforme?: boolean | null
          created_at?: string | null
          criticidade?: string | null
          descricao?: string | null
          evidencia?: string | null
          id?: string
          observacoes?: string | null
          requisito: string
        }
        Update: {
          auditoria_id?: string | null
          categoria?: string
          conforme?: boolean | null
          created_at?: string | null
          criticidade?: string | null
          descricao?: string | null
          evidencia?: string | null
          id?: string
          observacoes?: string | null
          requisito?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_auditoria_auditoria_id_fkey"
            columns: ["auditoria_id"]
            isOneToOne: false
            referencedRelation: "auditorias_internas"
            referencedColumns: ["id"]
          },
        ]
      }
      cirurgia_eventos: {
        Row: {
          cirurgia_id: string
          data_hora: string | null
          descricao: string | null
          id: string
          metadados: Json | null
          tipo_evento: string
          usuario_id: string | null
        }
        Insert: {
          cirurgia_id: string
          data_hora?: string | null
          descricao?: string | null
          id?: string
          metadados?: Json | null
          tipo_evento: string
          usuario_id?: string | null
        }
        Update: {
          cirurgia_id?: string
          data_hora?: string | null
          descricao?: string | null
          id?: string
          metadados?: Json | null
          tipo_evento?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cirurgia_eventos_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cirurgia_eventos_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
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
            foreignKeyName: "cirurgia_materiais_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
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
            foreignKeyName: "cirurgias_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
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
      comentarios: {
        Row: {
          anexos_urls: string[] | null
          atualizado_em: string | null
          comentario: string
          comentario_pai_id: string | null
          criado_em: string | null
          editado: boolean | null
          editado_em: string | null
          empresa_id: string
          entidade_id: string
          entidade_tipo: string
          excluido_em: string | null
          id: string
          mencoes_ids: string[] | null
          usuario_id: string
        }
        Insert: {
          anexos_urls?: string[] | null
          atualizado_em?: string | null
          comentario: string
          comentario_pai_id?: string | null
          criado_em?: string | null
          editado?: boolean | null
          editado_em?: string | null
          empresa_id: string
          entidade_id: string
          entidade_tipo: string
          excluido_em?: string | null
          id?: string
          mencoes_ids?: string[] | null
          usuario_id: string
        }
        Update: {
          anexos_urls?: string[] | null
          atualizado_em?: string | null
          comentario?: string
          comentario_pai_id?: string | null
          criado_em?: string | null
          editado?: boolean | null
          editado_em?: string | null
          empresa_id?: string
          entidade_id?: string
          entidade_tipo?: string
          excluido_em?: string | null
          id?: string
          mencoes_ids?: string[] | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_comentario_pai_id_fkey"
            columns: ["comentario_pai_id"]
            isOneToOne: false
            referencedRelation: "comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "comentarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidencias: {
        Row: {
          aprovado: boolean | null
          aprovado_por_id: string | null
          arquivo_hash: string | null
          arquivo_nome: string | null
          arquivo_tamanho: number | null
          arquivo_url: string
          atualizado_em: string | null
          auditoria_id: string | null
          categoria: string | null
          criado_em: string | null
          criado_por: string | null
          data_aprovacao: string | null
          data_documento: string | null
          data_validade: string | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          id: string
          nao_conformidade_id: string | null
          observacoes: string | null
          requisito_id: string
          tags: string[] | null
          tipo: string
          titulo: string
          valido: boolean | null
        }
        Insert: {
          aprovado?: boolean | null
          aprovado_por_id?: string | null
          arquivo_hash?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url: string
          atualizado_em?: string | null
          auditoria_id?: string | null
          categoria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_aprovacao?: string | null
          data_documento?: string | null
          data_validade?: string | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          nao_conformidade_id?: string | null
          observacoes?: string | null
          requisito_id: string
          tags?: string[] | null
          tipo: string
          titulo: string
          valido?: boolean | null
        }
        Update: {
          aprovado?: boolean | null
          aprovado_por_id?: string | null
          arquivo_hash?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string
          atualizado_em?: string | null
          auditoria_id?: string | null
          categoria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_aprovacao?: string | null
          data_documento?: string | null
          data_validade?: string | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          nao_conformidade_id?: string | null
          observacoes?: string | null
          requisito_id?: string
          tags?: string[] | null
          tipo?: string
          titulo?: string
          valido?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_evidencias_aprovado_por_id_fkey"
            columns: ["aprovado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidencias_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidencias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidencias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "compliance_evidencias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidencias_requisito_id_fkey"
            columns: ["requisito_id"]
            isOneToOne: false
            referencedRelation: "compliance_requisitos"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requisitos: {
        Row: {
          acoes_corretivas: string[] | null
          categoria: string
          codigo: string
          created_at: string | null
          data_ultima_auditoria: string | null
          descricao: string | null
          documentos_anexados: string[] | null
          evidencias: string[] | null
          fabricante: string | null
          id: string
          proxima_auditoria: string | null
          responsavel: string | null
          responsavel_cargo: string | null
          responsavel_email: string | null
          score_conformidade: number | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          acoes_corretivas?: string[] | null
          categoria: string
          codigo: string
          created_at?: string | null
          data_ultima_auditoria?: string | null
          descricao?: string | null
          documentos_anexados?: string[] | null
          evidencias?: string[] | null
          fabricante?: string | null
          id?: string
          proxima_auditoria?: string | null
          responsavel?: string | null
          responsavel_cargo?: string | null
          responsavel_email?: string | null
          score_conformidade?: number | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          acoes_corretivas?: string[] | null
          categoria?: string
          codigo?: string
          created_at?: string | null
          data_ultima_auditoria?: string | null
          descricao?: string | null
          documentos_anexados?: string[] | null
          evidencias?: string[] | null
          fabricante?: string | null
          id?: string
          proxima_auditoria?: string | null
          responsavel?: string | null
          responsavel_cargo?: string | null
          responsavel_email?: string | null
          score_conformidade?: number | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_requisitos_abbott: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          auditor_abbott_id: string | null
          categoria: string
          clausula_norma: string | null
          codigo_documento_abbott: string | null
          codigo_requisito: string
          criado_em: string
          criado_por: string | null
          data_fim_vigencia: string | null
          data_inicio_vigencia: string
          data_primeira_nao_conformidade: string | null
          data_proxima_avaliacao: string | null
          data_ultima_avaliacao: string | null
          data_ultima_nao_conformidade: string | null
          descricao: string | null
          dispensado: boolean | null
          empresa_id: string
          evidencias_anexadas: Json | null
          frequencia_dias: number | null
          historico_avaliacoes: Json | null
          id: string
          legislacao_aplicavel: string | null
          link_documento: string | null
          motivo_dispensa: string | null
          nivel_criticidade: string
          nome_requisito: string
          norma_referencia: string | null
          numero_nao_conformidades: number | null
          obrigatorio: boolean
          observacoes_auditoria: string | null
          percentual_conformidade: number | null
          peso_calculo: number
          plano_acao: string | null
          pontos_fortes: string | null
          pontos_melhoria: string | null
          pontos_obtidos: number | null
          pontos_possiveis: number
          possui_plano_acao: boolean | null
          prazo_adequacao: string | null
          recomendacoes: string | null
          requer_evidencia: boolean | null
          responsavel_id: string | null
          status: string
          status_adequacao: string | null
          tipo_evidencia: string | null
          tipo_periodo: string | null
          versao_documento: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          auditor_abbott_id?: string | null
          categoria: string
          clausula_norma?: string | null
          codigo_documento_abbott?: string | null
          codigo_requisito: string
          criado_em?: string
          criado_por?: string | null
          data_fim_vigencia?: string | null
          data_inicio_vigencia: string
          data_primeira_nao_conformidade?: string | null
          data_proxima_avaliacao?: string | null
          data_ultima_avaliacao?: string | null
          data_ultima_nao_conformidade?: string | null
          descricao?: string | null
          dispensado?: boolean | null
          empresa_id: string
          evidencias_anexadas?: Json | null
          frequencia_dias?: number | null
          historico_avaliacoes?: Json | null
          id?: string
          legislacao_aplicavel?: string | null
          link_documento?: string | null
          motivo_dispensa?: string | null
          nivel_criticidade?: string
          nome_requisito: string
          norma_referencia?: string | null
          numero_nao_conformidades?: number | null
          obrigatorio?: boolean
          observacoes_auditoria?: string | null
          percentual_conformidade?: number | null
          peso_calculo?: number
          plano_acao?: string | null
          pontos_fortes?: string | null
          pontos_melhoria?: string | null
          pontos_obtidos?: number | null
          pontos_possiveis?: number
          possui_plano_acao?: boolean | null
          prazo_adequacao?: string | null
          recomendacoes?: string | null
          requer_evidencia?: boolean | null
          responsavel_id?: string | null
          status?: string
          status_adequacao?: string | null
          tipo_evidencia?: string | null
          tipo_periodo?: string | null
          versao_documento?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          auditor_abbott_id?: string | null
          categoria?: string
          clausula_norma?: string | null
          codigo_documento_abbott?: string | null
          codigo_requisito?: string
          criado_em?: string
          criado_por?: string | null
          data_fim_vigencia?: string | null
          data_inicio_vigencia?: string
          data_primeira_nao_conformidade?: string | null
          data_proxima_avaliacao?: string | null
          data_ultima_avaliacao?: string | null
          data_ultima_nao_conformidade?: string | null
          descricao?: string | null
          dispensado?: boolean | null
          empresa_id?: string
          evidencias_anexadas?: Json | null
          frequencia_dias?: number | null
          historico_avaliacoes?: Json | null
          id?: string
          legislacao_aplicavel?: string | null
          link_documento?: string | null
          motivo_dispensa?: string | null
          nivel_criticidade?: string
          nome_requisito?: string
          norma_referencia?: string | null
          numero_nao_conformidades?: number | null
          obrigatorio?: boolean
          observacoes_auditoria?: string | null
          percentual_conformidade?: number | null
          peso_calculo?: number
          plano_acao?: string | null
          pontos_fortes?: string | null
          pontos_melhoria?: string | null
          pontos_obtidos?: number | null
          pontos_possiveis?: number
          possui_plano_acao?: boolean | null
          prazo_adequacao?: string | null
          recomendacoes?: string | null
          requer_evidencia?: boolean | null
          responsavel_id?: string | null
          status?: string
          status_adequacao?: string | null
          tipo_evidencia?: string | null
          tipo_periodo?: string | null
          versao_documento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_requisitos_abbott_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_requisitos_abbott_auditor_abbott_id_fkey"
            columns: ["auditor_abbott_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_requisitos_abbott_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_requisitos_abbott_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_requisitos_abbott_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "compliance_requisitos_abbott_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_requisitos_abbott_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_internacionais: {
        Row: {
          cofins: number | null
          created_at: string | null
          created_by: string | null
          data_desembaraco: string | null
          data_embarque: string | null
          empresa_id: string
          fornecedor_id: string | null
          fornecedor_internacional: string | null
          icms: number | null
          id: string
          imposto_importacao: number | null
          ipi: number | null
          licenca_importacao: string | null
          numero: string
          numero_di: string | null
          observacoes: string | null
          pais_origem: string | null
          pis: number | null
          previsao_chegada: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          valor_fob: number | null
          valor_frete_internacional: number | null
          valor_seguro: number | null
        }
        Insert: {
          cofins?: number | null
          created_at?: string | null
          created_by?: string | null
          data_desembaraco?: string | null
          data_embarque?: string | null
          empresa_id: string
          fornecedor_id?: string | null
          fornecedor_internacional?: string | null
          icms?: number | null
          id?: string
          imposto_importacao?: number | null
          ipi?: number | null
          licenca_importacao?: string | null
          numero: string
          numero_di?: string | null
          observacoes?: string | null
          pais_origem?: string | null
          pis?: number | null
          previsao_chegada?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_fob?: number | null
          valor_frete_internacional?: number | null
          valor_seguro?: number | null
        }
        Update: {
          cofins?: number | null
          created_at?: string | null
          created_by?: string | null
          data_desembaraco?: string | null
          data_embarque?: string | null
          empresa_id?: string
          fornecedor_id?: string | null
          fornecedor_internacional?: string | null
          icms?: number | null
          id?: string
          imposto_importacao?: number | null
          ipi?: number | null
          licenca_importacao?: string | null
          numero?: string
          numero_di?: string | null
          observacoes?: string | null
          pais_origem?: string | null
          pis?: number | null
          previsao_chegada?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_fob?: number | null
          valor_frete_internacional?: number | null
          valor_seguro?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_internacionais_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_internacionais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_internacionais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "compras_internacionais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_internacionais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_internacionais_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      conferencias_consignacao: {
        Row: {
          created_at: string | null
          data_conferencia: string
          data_ultima_conferencia: string | null
          dias_sem_conferencia: number | null
          divergencias: string | null
          hospital_id: string | null
          hospital_nome: string
          id: string
          numero_conferencia: string
          observacoes: string | null
          responsavel: string | null
          status: string | null
          status_conferencia: string | null
          supervisor_logistico: string | null
          total_materiais: number | null
          updated_at: string | null
          valor_total_conferido: number | null
        }
        Insert: {
          created_at?: string | null
          data_conferencia: string
          data_ultima_conferencia?: string | null
          dias_sem_conferencia?: number | null
          divergencias?: string | null
          hospital_id?: string | null
          hospital_nome: string
          id?: string
          numero_conferencia: string
          observacoes?: string | null
          responsavel?: string | null
          status?: string | null
          status_conferencia?: string | null
          supervisor_logistico?: string | null
          total_materiais?: number | null
          updated_at?: string | null
          valor_total_conferido?: number | null
        }
        Update: {
          created_at?: string | null
          data_conferencia?: string
          data_ultima_conferencia?: string | null
          dias_sem_conferencia?: number | null
          divergencias?: string | null
          hospital_id?: string | null
          hospital_nome?: string
          id?: string
          numero_conferencia?: string
          observacoes?: string | null
          responsavel?: string | null
          status?: string | null
          status_conferencia?: string | null
          supervisor_logistico?: string | null
          total_materiais?: number | null
          updated_at?: string | null
          valor_total_conferido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conferencias_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conferencias_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
        ]
      }
      conhecimento_base: {
        Row: {
          atualizado_em: string | null
          categoria: string
          conteudo_texto: string
          criado_em: string | null
          documento_id: string
          embedding: string | null
          id: string
          modulo: string | null
          tags: string[] | null
          url_origem: string | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria: string
          conteudo_texto: string
          criado_em?: string | null
          documento_id: string
          embedding?: string | null
          id?: string
          modulo?: string | null
          tags?: string[] | null
          url_origem?: string | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string
          conteudo_texto?: string
          criado_em?: string | null
          documento_id?: string
          embedding?: string | null
          id?: string
          modulo?: string | null
          tags?: string[] | null
          url_origem?: string | null
        }
        Relationships: []
      }
      consignacao_materiais: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          cirurgia_id: string | null
          criado_em: string
          criado_por: string | null
          data_consignacao: string
          data_prevista_retorno: string | null
          data_retorno: string | null
          data_utilizacao: string | null
          empresa_id: string
          fornecedor_id: string | null
          hospital_id: string | null
          id: string
          lote_id: string | null
          motivo_rejeicao: string | null
          numero_consignacao: string
          numero_nota_fiscal: string | null
          numero_serie_produto: string | null
          observacoes: string | null
          produto_id: string
          quantidade: number
          quantidade_utilizada: number | null
          responsavel_envio_id: string | null
          responsavel_recebimento_id: string | null
          serie_nota_fiscal: string | null
          status: string
          tipo_consignacao: string
          unidade_medida: string
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          cirurgia_id?: string | null
          criado_em?: string
          criado_por?: string | null
          data_consignacao?: string
          data_prevista_retorno?: string | null
          data_retorno?: string | null
          data_utilizacao?: string | null
          empresa_id: string
          fornecedor_id?: string | null
          hospital_id?: string | null
          id?: string
          lote_id?: string | null
          motivo_rejeicao?: string | null
          numero_consignacao: string
          numero_nota_fiscal?: string | null
          numero_serie_produto?: string | null
          observacoes?: string | null
          produto_id: string
          quantidade: number
          quantidade_utilizada?: number | null
          responsavel_envio_id?: string | null
          responsavel_recebimento_id?: string | null
          serie_nota_fiscal?: string | null
          status?: string
          tipo_consignacao: string
          unidade_medida?: string
          valor_total?: number | null
          valor_unitario: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          cirurgia_id?: string | null
          criado_em?: string
          criado_por?: string | null
          data_consignacao?: string
          data_prevista_retorno?: string | null
          data_retorno?: string | null
          data_utilizacao?: string | null
          empresa_id?: string
          fornecedor_id?: string | null
          hospital_id?: string | null
          id?: string
          lote_id?: string | null
          motivo_rejeicao?: string | null
          numero_consignacao?: string
          numero_nota_fiscal?: string | null
          numero_serie_produto?: string | null
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_utilizada?: number | null
          responsavel_envio_id?: string | null
          responsavel_recebimento_id?: string | null
          serie_nota_fiscal?: string | null
          status?: string
          tipo_consignacao?: string
          unidade_medida?: string
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "consignacao_materiais_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "consignacao_materiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "consignacao_materiais_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_responsavel_envio_id_fkey"
            columns: ["responsavel_envio_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacao_materiais_responsavel_recebimento_id_fkey"
            columns: ["responsavel_recebimento_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          aprovacao_nivel1: Json | null
          aprovacao_nivel2: Json | null
          aprovacao_nivel3: Json | null
          atualizado_em: string | null
          atualizado_por: string | null
          banco_id: string | null
          banco_pagamento: string | null
          categoria: string | null
          centro_custo_id: string | null
          centro_custo_nome: string | null
          comprovante_url: string | null
          created_at: string | null
          criado_em: string | null
          criado_por: string | null
          data_agendamento: string | null
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em: string | null
          forma_pagamento: string | null
          fornecedor_cnpj: string | null
          fornecedor_cpf_cnpj: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          historico_pagamentos: Json | null
          id: string
          nota_fiscal_id: string | null
          numero: string
          numero_documento: string | null
          numero_parcela: number | null
          observacoes: string | null
          pedido_compra_id: string | null
          plano_contas_id: string | null
          requer_aprovacao: boolean | null
          status: string | null
          tipo: string | null
          tipo_despesa: string | null
          total_parcelas: number | null
          updated_at: string | null
          valor_desconto: number | null
          valor_juros: number | null
          valor_liquido: number | null
          valor_multa: number | null
          valor_original: number
          valor_pago: number | null
          valor_saldo: number | null
        }
        Insert: {
          aprovacao_nivel1?: Json | null
          aprovacao_nivel2?: Json | null
          aprovacao_nivel3?: Json | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          banco_id?: string | null
          banco_pagamento?: string | null
          categoria?: string | null
          centro_custo_id?: string | null
          centro_custo_nome?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_agendamento?: string | null
          data_emissao: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          fornecedor_cnpj?: string | null
          fornecedor_cpf_cnpj?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          historico_pagamentos?: Json | null
          id?: string
          nota_fiscal_id?: string | null
          numero: string
          numero_documento?: string | null
          numero_parcela?: number | null
          observacoes?: string | null
          pedido_compra_id?: string | null
          plano_contas_id?: string | null
          requer_aprovacao?: boolean | null
          status?: string | null
          tipo?: string | null
          tipo_despesa?: string | null
          total_parcelas?: number | null
          updated_at?: string | null
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_liquido?: number | null
          valor_multa?: number | null
          valor_original: number
          valor_pago?: number | null
          valor_saldo?: number | null
        }
        Update: {
          aprovacao_nivel1?: Json | null
          aprovacao_nivel2?: Json | null
          aprovacao_nivel3?: Json | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          banco_id?: string | null
          banco_pagamento?: string | null
          categoria?: string | null
          centro_custo_id?: string | null
          centro_custo_nome?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_agendamento?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          empresa_id?: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          fornecedor_cnpj?: string | null
          fornecedor_cpf_cnpj?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          historico_pagamentos?: Json | null
          id?: string
          nota_fiscal_id?: string | null
          numero?: string
          numero_documento?: string | null
          numero_parcela?: number | null
          observacoes?: string | null
          pedido_compra_id?: string | null
          plano_contas_id?: string | null
          requer_aprovacao?: boolean | null
          status?: string | null
          tipo?: string | null
          tipo_despesa?: string | null
          total_parcelas?: number | null
          updated_at?: string | null
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_liquido?: number | null
          valor_multa?: number | null
          valor_original?: number
          valor_pago?: number | null
          valor_saldo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_pedido_compra_id_fkey"
            columns: ["pedido_compra_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          banco_id: string | null
          banco_recebimento: string | null
          boleto_nosso_numero: string | null
          boleto_url: string | null
          categoria: string | null
          centro_custo_id: string | null
          cliente_cnpj: string | null
          cliente_cpf_cnpj: string | null
          cliente_id: string | null
          cliente_nome: string
          comprovante_url: string | null
          created_at: string | null
          criado_em: string | null
          criado_por: string | null
          data_emissao: string
          data_protesto: string | null
          data_recebimento: string | null
          data_vencimento: string
          descricao: string
          dias_atraso: number | null
          empresa_id: string
          excluido_em: string | null
          fatura_id: string | null
          forma_recebimento: string | null
          historico_pagamentos: Json | null
          id: string
          nota_fiscal_id: string | null
          numero: string
          numero_documento: string | null
          numero_parcela: number | null
          observacoes: string | null
          plano_contas_id: string | null
          risco_inadimplencia: string | null
          score_inadimplencia: number | null
          status: string | null
          tipo: string | null
          tipo_receita: string | null
          total_parcelas: number | null
          updated_at: string | null
          valor_desconto: number | null
          valor_juros: number | null
          valor_liquido: number | null
          valor_original: number
          valor_recebido: number | null
          valor_saldo: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          banco_id?: string | null
          banco_recebimento?: string | null
          boleto_nosso_numero?: string | null
          boleto_url?: string | null
          categoria?: string | null
          centro_custo_id?: string | null
          cliente_cnpj?: string | null
          cliente_cpf_cnpj?: string | null
          cliente_id?: string | null
          cliente_nome: string
          comprovante_url?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_emissao: string
          data_protesto?: string | null
          data_recebimento?: string | null
          data_vencimento: string
          descricao: string
          dias_atraso?: number | null
          empresa_id: string
          excluido_em?: string | null
          fatura_id?: string | null
          forma_recebimento?: string | null
          historico_pagamentos?: Json | null
          id?: string
          nota_fiscal_id?: string | null
          numero: string
          numero_documento?: string | null
          numero_parcela?: number | null
          observacoes?: string | null
          plano_contas_id?: string | null
          risco_inadimplencia?: string | null
          score_inadimplencia?: number | null
          status?: string | null
          tipo?: string | null
          tipo_receita?: string | null
          total_parcelas?: number | null
          updated_at?: string | null
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_liquido?: number | null
          valor_original: number
          valor_recebido?: number | null
          valor_saldo?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          banco_id?: string | null
          banco_recebimento?: string | null
          boleto_nosso_numero?: string | null
          boleto_url?: string | null
          categoria?: string | null
          centro_custo_id?: string | null
          cliente_cnpj?: string | null
          cliente_cpf_cnpj?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          comprovante_url?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_emissao?: string
          data_protesto?: string | null
          data_recebimento?: string | null
          data_vencimento?: string
          descricao?: string
          dias_atraso?: number | null
          empresa_id?: string
          excluido_em?: string | null
          fatura_id?: string | null
          forma_recebimento?: string | null
          historico_pagamentos?: Json | null
          id?: string
          nota_fiscal_id?: string | null
          numero?: string
          numero_documento?: string | null
          numero_parcela?: number | null
          observacoes?: string | null
          plano_contas_id?: string | null
          risco_inadimplencia?: string | null
          score_inadimplencia?: number | null
          status?: string | null
          tipo?: string | null
          tipo_receita?: string | null
          total_parcelas?: number | null
          updated_at?: string | null
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_liquido?: number | null
          valor_original?: number
          valor_recebido?: number | null
          valor_saldo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "contas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
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
          {
            foreignKeyName: "contratos_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
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
      cotacoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_conclusao: string | null
          data_envio: string | null
          empresa_id: string
          especificacoes: string | null
          id: string
          numero: string
          observacoes: string | null
          prazo_resposta: number | null
          responsavel_id: string
          solicitacao_id: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          validade_cotacao: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_conclusao?: string | null
          data_envio?: string | null
          empresa_id: string
          especificacoes?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          prazo_resposta?: number | null
          responsavel_id: string
          solicitacao_id?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          validade_cotacao?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_conclusao?: string | null
          data_envio?: string | null
          empresa_id?: string
          especificacoes?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          prazo_resposta?: number | null
          responsavel_id?: string
          solicitacao_id?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          validade_cotacao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "cotacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacoes_fornecedores: {
        Row: {
          cotacao_id: string
          created_at: string | null
          data_envio: string | null
          data_resposta: string | null
          fornecedor_id: string
          id: string
          observacoes_fornecedor: string | null
          status: string | null
        }
        Insert: {
          cotacao_id: string
          created_at?: string | null
          data_envio?: string | null
          data_resposta?: string | null
          fornecedor_id: string
          id?: string
          observacoes_fornecedor?: string | null
          status?: string | null
        }
        Update: {
          cotacao_id?: string
          created_at?: string | null
          data_envio?: string | null
          data_resposta?: string | null
          fornecedor_id?: string
          id?: string
          observacoes_fornecedor?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_fornecedores_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          criado_por_id: string | null
          descricao: string | null
          empresa_id: string
          id: string
          layout_json: Json | null
          nome: string
          publico: boolean | null
          tipo: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por_id?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          layout_json?: Json | null
          nome: string
          publico?: boolean | null
          tipo?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por_id?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          layout_json?: Json | null
          nome?: string
          publico?: boolean | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "dashboards_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      devolucoes_consignacao: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          conferido: boolean | null
          conferido_por: string | null
          criado_em: string | null
          criado_por: string | null
          data_coleta_prevista: string | null
          data_coleta_realizada: string | null
          data_conferencia: string | null
          data_devolucao: string | null
          divergencias: string | null
          empresa_id: string
          excluido_em: string | null
          fornecedor_id: string
          id: string
          motivo: string
          motivo_detalhado: string | null
          nota_fiscal_devolucao_id: string | null
          numero: string
          observacoes: string | null
          rastreamento: string | null
          recebido_por: string | null
          remessa_consignacao_id: string
          responsavel_devolucao_id: string | null
          status: string | null
          transportadora: string | null
          valor_desconto_avaria: number | null
          valor_liquido: number | null
          valor_total_devolvido: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          conferido?: boolean | null
          conferido_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_coleta_prevista?: string | null
          data_coleta_realizada?: string | null
          data_conferencia?: string | null
          data_devolucao?: string | null
          divergencias?: string | null
          empresa_id: string
          excluido_em?: string | null
          fornecedor_id: string
          id?: string
          motivo: string
          motivo_detalhado?: string | null
          nota_fiscal_devolucao_id?: string | null
          numero: string
          observacoes?: string | null
          rastreamento?: string | null
          recebido_por?: string | null
          remessa_consignacao_id: string
          responsavel_devolucao_id?: string | null
          status?: string | null
          transportadora?: string | null
          valor_desconto_avaria?: number | null
          valor_liquido?: number | null
          valor_total_devolvido?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          conferido?: boolean | null
          conferido_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_coleta_prevista?: string | null
          data_coleta_realizada?: string | null
          data_conferencia?: string | null
          data_devolucao?: string | null
          divergencias?: string | null
          empresa_id?: string
          excluido_em?: string | null
          fornecedor_id?: string
          id?: string
          motivo?: string
          motivo_detalhado?: string | null
          nota_fiscal_devolucao_id?: string | null
          numero?: string
          observacoes?: string | null
          rastreamento?: string | null
          recebido_por?: string | null
          remessa_consignacao_id?: string
          responsavel_devolucao_id?: string | null
          status?: string | null
          transportadora?: string | null
          valor_desconto_avaria?: number | null
          valor_liquido?: number | null
          valor_total_devolvido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "devolucoes_consignacao_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_nota_fiscal_devolucao_id_fkey"
            columns: ["nota_fiscal_devolucao_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_remessa_consignacao_id_fkey"
            columns: ["remessa_consignacao_id"]
            isOneToOne: false
            referencedRelation: "remessas_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_consignacao_responsavel_devolucao_id_fkey"
            columns: ["responsavel_devolucao_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      documentacao_tecnica: {
        Row: {
          anvisa_rdc_16: boolean | null
          aprovado_por: string | null
          caminho_arquivo: string | null
          codigo: string
          created_at: string | null
          data_aprovacao: string | null
          data_proxima_revisao: string | null
          data_versao: string
          descricao: string | null
          elaborado_por: string | null
          fabricante_requisito: boolean | null
          hash_md5: string | null
          id: string
          iso_13485: boolean | null
          numero_paginas: number | null
          palavras_chave: string[] | null
          revisado_por: string | null
          status: string | null
          tamanho_bytes: number | null
          tipo: string
          titulo: string
          updated_at: string | null
          versao: string
        }
        Insert: {
          anvisa_rdc_16?: boolean | null
          aprovado_por?: string | null
          caminho_arquivo?: string | null
          codigo: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_proxima_revisao?: string | null
          data_versao: string
          descricao?: string | null
          elaborado_por?: string | null
          fabricante_requisito?: boolean | null
          hash_md5?: string | null
          id?: string
          iso_13485?: boolean | null
          numero_paginas?: number | null
          palavras_chave?: string[] | null
          revisado_por?: string | null
          status?: string | null
          tamanho_bytes?: number | null
          tipo: string
          titulo: string
          updated_at?: string | null
          versao: string
        }
        Update: {
          anvisa_rdc_16?: boolean | null
          aprovado_por?: string | null
          caminho_arquivo?: string | null
          codigo?: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_proxima_revisao?: string | null
          data_versao?: string
          descricao?: string | null
          elaborado_por?: string | null
          fabricante_requisito?: boolean | null
          hash_md5?: string | null
          id?: string
          iso_13485?: boolean | null
          numero_paginas?: number | null
          palavras_chave?: string[] | null
          revisado_por?: string | null
          status?: string | null
          tamanho_bytes?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          versao?: string
        }
        Relationships: []
      }
      documentos_licitacao: {
        Row: {
          analisado: boolean | null
          aprovado: boolean | null
          arquivo_hash: string | null
          arquivo_nome: string | null
          arquivo_tamanho: number | null
          arquivo_url: string
          atualizado_em: string | null
          criado_em: string | null
          criado_por: string | null
          data_analise: string | null
          data_emissao: string | null
          data_envio_portal: string | null
          data_validade: string | null
          descricao: string | null
          emitido_por: string | null
          empresa_id: string
          enviado_portal: boolean | null
          excluido_em: string | null
          exigido_edital: boolean | null
          id: string
          licitacao_id: string
          numero_documento: string | null
          obrigatorio: boolean | null
          observacoes: string | null
          origem: string | null
          parecer: string | null
          proposta_id: string | null
          tipo: string
          titulo: string
          valido: boolean | null
        }
        Insert: {
          analisado?: boolean | null
          aprovado?: boolean | null
          arquivo_hash?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url: string
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_analise?: string | null
          data_emissao?: string | null
          data_envio_portal?: string | null
          data_validade?: string | null
          descricao?: string | null
          emitido_por?: string | null
          empresa_id: string
          enviado_portal?: boolean | null
          excluido_em?: string | null
          exigido_edital?: boolean | null
          id?: string
          licitacao_id: string
          numero_documento?: string | null
          obrigatorio?: boolean | null
          observacoes?: string | null
          origem?: string | null
          parecer?: string | null
          proposta_id?: string | null
          tipo: string
          titulo: string
          valido?: boolean | null
        }
        Update: {
          analisado?: boolean | null
          aprovado?: boolean | null
          arquivo_hash?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_analise?: string | null
          data_emissao?: string | null
          data_envio_portal?: string | null
          data_validade?: string | null
          descricao?: string | null
          emitido_por?: string | null
          empresa_id?: string
          enviado_portal?: boolean | null
          excluido_em?: string | null
          exigido_edital?: boolean | null
          id?: string
          licitacao_id?: string
          numero_documento?: string | null
          obrigatorio?: boolean | null
          observacoes?: string | null
          origem?: string | null
          parecer?: string | null
          proposta_id?: string | null
          tipo?: string
          titulo?: string
          valido?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_licitacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_licitacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_licitacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "documentos_licitacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_licitacao_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_licitacao_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_licitacoes_ativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_licitacao_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas_licitacao"
            referencedColumns: ["id"]
          },
        ]
      }
      emails_enviados: {
        Row: {
          anexos_nomes: string[] | null
          assunto: string
          cc: string[] | null
          cco: string[] | null
          corpo_resumo: string | null
          data_envio: string
          entidade_id: string | null
          entidade_tipo: string | null
          erro_mensagem: string | null
          id: string
          ip_address: unknown
          para: string[]
          status: string | null
          tipo: string | null
          user_agent: string | null
          usuario_id: string
        }
        Insert: {
          anexos_nomes?: string[] | null
          assunto: string
          cc?: string[] | null
          cco?: string[] | null
          corpo_resumo?: string | null
          data_envio?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          erro_mensagem?: string | null
          id?: string
          ip_address?: unknown
          para: string[]
          status?: string | null
          tipo?: string | null
          user_agent?: string | null
          usuario_id: string
        }
        Update: {
          anexos_nomes?: string[] | null
          assunto?: string
          cc?: string[] | null
          cco?: string[] | null
          corpo_resumo?: string | null
          data_envio?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          erro_mensagem?: string | null
          id?: string
          ip_address?: unknown
          para?: string[]
          status?: string | null
          tipo?: string | null
          user_agent?: string | null
          usuario_id?: string
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
      entrega_historico: {
        Row: {
          cidade: string | null
          created_at: string | null
          entrega_id: string | null
          estado: string | null
          id: string
          localizacao: string | null
          observacao: string | null
          status: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          entrega_id?: string | null
          estado?: string | null
          id?: string
          localizacao?: string | null
          observacao?: string | null
          status: string
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          entrega_id?: string | null
          estado?: string | null
          id?: string
          localizacao?: string | null
          observacao?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "entrega_historico_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "entregas"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          assinado_em: string | null
          assinado_por: string | null
          cirurgia_id: string | null
          codigo_rastreio: string
          created_at: string | null
          created_by: string | null
          data_coleta: string | null
          data_entrega: string | null
          data_previsao: string | null
          destino_cep: string | null
          destino_cidade: string | null
          destino_endereco: string
          destino_estado: string | null
          destino_id: string | null
          destino_nome: string
          destino_tipo: string | null
          documento_assinante: string | null
          id: string
          motorista: string | null
          nota_fiscal: string | null
          observacoes: string | null
          ocorrencias: string | null
          origem_cep: string | null
          origem_cidade: string | null
          origem_endereco: string
          origem_estado: string | null
          origem_id: string | null
          origem_nome: string
          origem_tipo: string | null
          pedido_id: string | null
          peso_kg: number | null
          status: string
          telefone_contato: string | null
          tipo_entrega: string | null
          transportadora: string | null
          updated_at: string | null
          valor_frete: number | null
          veiculo_placa: string | null
          volumes: number | null
        }
        Insert: {
          assinado_em?: string | null
          assinado_por?: string | null
          cirurgia_id?: string | null
          codigo_rastreio: string
          created_at?: string | null
          created_by?: string | null
          data_coleta?: string | null
          data_entrega?: string | null
          data_previsao?: string | null
          destino_cep?: string | null
          destino_cidade?: string | null
          destino_endereco: string
          destino_estado?: string | null
          destino_id?: string | null
          destino_nome: string
          destino_tipo?: string | null
          documento_assinante?: string | null
          id?: string
          motorista?: string | null
          nota_fiscal?: string | null
          observacoes?: string | null
          ocorrencias?: string | null
          origem_cep?: string | null
          origem_cidade?: string | null
          origem_endereco: string
          origem_estado?: string | null
          origem_id?: string | null
          origem_nome: string
          origem_tipo?: string | null
          pedido_id?: string | null
          peso_kg?: number | null
          status?: string
          telefone_contato?: string | null
          tipo_entrega?: string | null
          transportadora?: string | null
          updated_at?: string | null
          valor_frete?: number | null
          veiculo_placa?: string | null
          volumes?: number | null
        }
        Update: {
          assinado_em?: string | null
          assinado_por?: string | null
          cirurgia_id?: string | null
          codigo_rastreio?: string
          created_at?: string | null
          created_by?: string | null
          data_coleta?: string | null
          data_entrega?: string | null
          data_previsao?: string | null
          destino_cep?: string | null
          destino_cidade?: string | null
          destino_endereco?: string
          destino_estado?: string | null
          destino_id?: string | null
          destino_nome?: string
          destino_tipo?: string | null
          documento_assinante?: string | null
          id?: string
          motorista?: string | null
          nota_fiscal?: string | null
          observacoes?: string | null
          ocorrencias?: string | null
          origem_cep?: string | null
          origem_cidade?: string | null
          origem_endereco?: string
          origem_estado?: string | null
          origem_id?: string | null
          origem_nome?: string
          origem_tipo?: string | null
          pedido_id?: string | null
          peso_kg?: number | null
          status?: string
          telefone_contato?: string | null
          tipo_entrega?: string | null
          transportadora?: string | null
          updated_at?: string | null
          valor_frete?: number | null
          veiculo_placa?: string | null
          volumes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes_medicas: {
        Row: {
          ativo: boolean | null
          cirurgias_semana_media: number | null
          created_at: string | null
          created_by: string | null
          dias_atuacao: string[] | null
          empresa_id: string
          especialidade: string | null
          horarios_preferencia: string | null
          hospital_id: string | null
          id: string
          medico_responsavel_id: string
          nome: string
          observacoes: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          cirurgias_semana_media?: number | null
          created_at?: string | null
          created_by?: string | null
          dias_atuacao?: string[] | null
          empresa_id: string
          especialidade?: string | null
          horarios_preferencia?: string | null
          hospital_id?: string | null
          id?: string
          medico_responsavel_id: string
          nome: string
          observacoes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          cirurgias_semana_media?: number | null
          created_at?: string | null
          created_by?: string | null
          dias_atuacao?: string[] | null
          empresa_id?: string
          especialidade?: string | null
          horarios_preferencia?: string | null
          hospital_id?: string | null
          id?: string
          medico_responsavel_id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipes_medicas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_medicas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_medicas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "equipes_medicas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_medicas_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_medicas_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "equipes_medicas_medico_responsavel_id_fkey"
            columns: ["medico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_medicas_medico_responsavel_id_fkey"
            columns: ["medico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_medicos_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_medicas_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
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
      failed_login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: unknown
          motivo_falha: string | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address: unknown
          motivo_falha?: string | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          motivo_falha?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      faturamento_consignacao: {
        Row: {
          chave_nf: string | null
          created_at: string | null
          data_emissao: string | null
          data_pagamento: string | null
          data_vencimento: string
          desconto: number | null
          hospital_id: string | null
          hospital_nome: string
          id: string
          impostos: number | null
          numero_fatura: string
          numero_nf: string | null
          observacoes: string | null
          periodo: string
          status: string | null
          updated_at: string | null
          valor_bruto: number
          valor_liquido: number
        }
        Insert: {
          chave_nf?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number | null
          hospital_id?: string | null
          hospital_nome: string
          id?: string
          impostos?: number | null
          numero_fatura: string
          numero_nf?: string | null
          observacoes?: string | null
          periodo: string
          status?: string | null
          updated_at?: string | null
          valor_bruto: number
          valor_liquido: number
        }
        Update: {
          chave_nf?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number | null
          hospital_id?: string | null
          hospital_nome?: string
          id?: string
          impostos?: number | null
          numero_fatura?: string
          numero_nf?: string | null
          observacoes?: string | null
          periodo?: string
          status?: string | null
          updated_at?: string | null
          valor_bruto?: number
          valor_liquido?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
        ]
      }
      faturamento_consignacao_itens: {
        Row: {
          cirurgia_id: string | null
          created_at: string | null
          fatura_id: string | null
          id: string
          lote: string | null
          material_consignado_id: string | null
          produto_nome: string
          quantidade: number
          serie: string | null
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          cirurgia_id?: string | null
          created_at?: string | null
          fatura_id?: string | null
          id?: string
          lote?: string | null
          material_consignado_id?: string | null
          produto_nome: string
          quantidade: number
          serie?: string | null
          valor_total?: number | null
          valor_unitario: number
        }
        Update: {
          cirurgia_id?: string | null
          created_at?: string | null
          fatura_id?: string | null
          id?: string
          lote?: string | null
          material_consignado_id?: string | null
          produto_nome?: string
          quantidade?: number
          serie?: string | null
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_consignacao_itens_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_consignacao_itens_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_consignacao_itens_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturamento_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_consignacao_itens_material_consignado_id_fkey"
            columns: ["material_consignado_id"]
            isOneToOne: false
            referencedRelation: "materiais_consignados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamento_consignacao_itens_material_consignado_id_fkey"
            columns: ["material_consignado_id"]
            isOneToOne: false
            referencedRelation: "vw_materiais_criticos_consignacao"
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
            foreignKeyName: "faturas_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
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
      favoritos: {
        Row: {
          criado_em: string | null
          empresa_id: string
          entidade_id: string
          entidade_nome: string | null
          entidade_tipo: string
          id: string
          observacoes: string | null
          ordem: number | null
          pasta: string | null
          usuario_id: string
        }
        Insert: {
          criado_em?: string | null
          empresa_id: string
          entidade_id: string
          entidade_nome?: string | null
          entidade_tipo: string
          id?: string
          observacoes?: string | null
          ordem?: number | null
          pasta?: string | null
          usuario_id: string
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string
          entidade_id?: string
          entidade_nome?: string | null
          entidade_tipo?: string
          id?: string
          observacoes?: string | null
          ordem?: number | null
          pasta?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "favoritos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          rollout_percentage: number | null
          user_segments: string[] | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          rollout_percentage?: number | null
          user_segments?: string[] | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          rollout_percentage?: number | null
          user_segments?: string[] | null
        }
        Relationships: []
      }
      fluxo_caixa: {
        Row: {
          atualizado_em: string | null
          banco_id: string | null
          banco_nome: string | null
          categoria: string
          centro_custo_id: string | null
          conciliado: boolean | null
          conta_destino_id: string | null
          criado_em: string | null
          data_compensacao: string | null
          data_conciliacao: string | null
          data_movimentacao: string
          descricao: string
          documento_numero: string | null
          empresa_id: string
          forma: string | null
          id: string
          observacoes: string | null
          origem_id: string | null
          origem_tipo: string | null
          plano_contas_id: string | null
          saldo_anterior: number | null
          saldo_atual: number | null
          status: string | null
          tipo: string
          usuario_id: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          banco_id?: string | null
          banco_nome?: string | null
          categoria: string
          centro_custo_id?: string | null
          conciliado?: boolean | null
          conta_destino_id?: string | null
          criado_em?: string | null
          data_compensacao?: string | null
          data_conciliacao?: string | null
          data_movimentacao?: string
          descricao: string
          documento_numero?: string | null
          empresa_id: string
          forma?: string | null
          id?: string
          observacoes?: string | null
          origem_id?: string | null
          origem_tipo?: string | null
          plano_contas_id?: string | null
          saldo_anterior?: number | null
          saldo_atual?: number | null
          status?: string | null
          tipo: string
          usuario_id?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          banco_id?: string | null
          banco_nome?: string | null
          categoria?: string
          centro_custo_id?: string | null
          conciliado?: boolean | null
          conta_destino_id?: string | null
          criado_em?: string | null
          data_compensacao?: string | null
          data_conciliacao?: string | null
          data_movimentacao?: string
          descricao?: string
          documento_numero?: string | null
          empresa_id?: string
          forma?: string | null
          id?: string
          observacoes?: string | null
          origem_id?: string | null
          origem_tipo?: string | null
          plano_contas_id?: string | null
          saldo_anterior?: number | null
          saldo_atual?: number | null
          status?: string | null
          tipo?: string
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_caixa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxo_caixa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "fluxo_caixa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxo_caixa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      fornecedores_produtos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo_fornecedor: string | null
          criado_em: string | null
          data_ultima_compra: string | null
          desconto_percentual: number | null
          descricao_fornecedor: string | null
          empresa_id: string
          excluido_em: string | null
          fornecedor_id: string
          fornecedor_preferencial: boolean | null
          id: string
          marca: string | null
          modelo: string | null
          observacoes: string | null
          prazo_entrega_dias: number | null
          preco_ultima_compra: number | null
          preco_unitario: number | null
          produto_id: string
          quantidade_minima: number | null
          quantidade_multiplo: number | null
          ultima_avaliacao: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo_fornecedor?: string | null
          criado_em?: string | null
          data_ultima_compra?: string | null
          desconto_percentual?: number | null
          descricao_fornecedor?: string | null
          empresa_id: string
          excluido_em?: string | null
          fornecedor_id: string
          fornecedor_preferencial?: boolean | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          prazo_entrega_dias?: number | null
          preco_ultima_compra?: number | null
          preco_unitario?: number | null
          produto_id: string
          quantidade_minima?: number | null
          quantidade_multiplo?: number | null
          ultima_avaliacao?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo_fornecedor?: string | null
          criado_em?: string | null
          data_ultima_compra?: string | null
          desconto_percentual?: number | null
          descricao_fornecedor?: string | null
          empresa_id?: string
          excluido_em?: string | null
          fornecedor_id?: string
          fornecedor_preferencial?: boolean | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          prazo_entrega_dias?: number | null
          preco_ultima_compra?: number | null
          preco_unitario?: number | null
          produto_id?: string
          quantidade_minima?: number | null
          quantidade_multiplo?: number | null
          ultima_avaliacao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedores_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "fornecedores_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedores_produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedores_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "grupos_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_precos: {
        Row: {
          alterado_por: string | null
          criado_em: string | null
          data_alteracao: string | null
          descricao: string | null
          id: string
          motivo: string | null
          preco_anterior: number | null
          preco_novo: number
          produto_id: string
          tabela_preco_id: string | null
          variacao_percentual: number | null
          variacao_valor: number | null
        }
        Insert: {
          alterado_por?: string | null
          criado_em?: string | null
          data_alteracao?: string | null
          descricao?: string | null
          id?: string
          motivo?: string | null
          preco_anterior?: number | null
          preco_novo: number
          produto_id: string
          tabela_preco_id?: string | null
          variacao_percentual?: number | null
          variacao_valor?: number | null
        }
        Update: {
          alterado_por?: string | null
          criado_em?: string | null
          data_alteracao?: string | null
          descricao?: string | null
          id?: string
          motivo?: string | null
          preco_anterior?: number | null
          preco_novo?: number
          produto_id?: string
          tabela_preco_id?: string | null
          variacao_percentual?: number | null
          variacao_valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_precos_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_precos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_precos_tabela_preco_id_fkey"
            columns: ["tabela_preco_id"]
            isOneToOne: false
            referencedRelation: "tabelas_precos"
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
      ip_whitelist: {
        Row: {
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          ip_address: unknown
          is_ativo: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          ip_address: unknown
          is_ativo?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          ip_address?: unknown
          is_ativo?: boolean | null
        }
        Relationships: []
      }
      itens_consignacao: {
        Row: {
          atualizado_em: string | null
          cirurgia_material_id: string | null
          condicao_devolucao: string | null
          criado_em: string | null
          data_devolucao: string | null
          data_utilizacao: string | null
          data_validade: string | null
          excluido_em: string | null
          id: string
          lote_id: string | null
          motivo_devolucao: string | null
          numero_item: number
          numero_serie: string | null
          observacoes: string | null
          produto_id: string
          quantidade_devolvida: number | null
          quantidade_enviada: number
          quantidade_pendente: number | null
          quantidade_utilizada: number | null
          registro_anvisa: string | null
          remessa_consignacao_id: string
          responsavel_utilizacao: string | null
          status: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          atualizado_em?: string | null
          cirurgia_material_id?: string | null
          condicao_devolucao?: string | null
          criado_em?: string | null
          data_devolucao?: string | null
          data_utilizacao?: string | null
          data_validade?: string | null
          excluido_em?: string | null
          id?: string
          lote_id?: string | null
          motivo_devolucao?: string | null
          numero_item: number
          numero_serie?: string | null
          observacoes?: string | null
          produto_id: string
          quantidade_devolvida?: number | null
          quantidade_enviada: number
          quantidade_pendente?: number | null
          quantidade_utilizada?: number | null
          registro_anvisa?: string | null
          remessa_consignacao_id: string
          responsavel_utilizacao?: string | null
          status?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          atualizado_em?: string | null
          cirurgia_material_id?: string | null
          condicao_devolucao?: string | null
          criado_em?: string | null
          data_devolucao?: string | null
          data_utilizacao?: string | null
          data_validade?: string | null
          excluido_em?: string | null
          id?: string
          lote_id?: string | null
          motivo_devolucao?: string | null
          numero_item?: number
          numero_serie?: string | null
          observacoes?: string | null
          produto_id?: string
          quantidade_devolvida?: number | null
          quantidade_enviada?: number
          quantidade_pendente?: number | null
          quantidade_utilizada?: number | null
          registro_anvisa?: string | null
          remessa_consignacao_id?: string
          responsavel_utilizacao?: string | null
          status?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_consignacao_cirurgia_material_id_fkey"
            columns: ["cirurgia_material_id"]
            isOneToOne: false
            referencedRelation: "cirurgia_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_consignacao_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_consignacao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_consignacao_remessa_consignacao_id_fkey"
            columns: ["remessa_consignacao_id"]
            isOneToOne: false
            referencedRelation: "remessas_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_consignacao_responsavel_utilizacao_fkey"
            columns: ["responsavel_utilizacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_cotacao: {
        Row: {
          cotacao_id: string
          created_at: string | null
          descricao: string
          id: string
          observacoes: string | null
          preco_referencia: number | null
          produto_id: string | null
          quantidade: number
          unidade_medida: string | null
        }
        Insert: {
          cotacao_id: string
          created_at?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          preco_referencia?: number | null
          produto_id?: string | null
          quantidade: number
          unidade_medida?: string | null
        }
        Update: {
          cotacao_id?: string
          created_at?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          preco_referencia?: number | null
          produto_id?: string | null
          quantidade?: number
          unidade_medida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_cotacao_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_cotacao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
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
      itens_nota_compra: {
        Row: {
          codigo_produto: string | null
          created_at: string | null
          descricao: string
          entrada_efetuada: boolean | null
          id: string
          lote: string | null
          nota_compra_id: string
          numero_serie: string | null
          produto_encontrado: boolean | null
          produto_id: string | null
          quantidade: number
          unidade_medida: string | null
          validade: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          codigo_produto?: string | null
          created_at?: string | null
          descricao: string
          entrada_efetuada?: boolean | null
          id?: string
          lote?: string | null
          nota_compra_id: string
          numero_serie?: string | null
          produto_encontrado?: boolean | null
          produto_id?: string | null
          quantidade: number
          unidade_medida?: string | null
          validade?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          codigo_produto?: string | null
          created_at?: string | null
          descricao?: string
          entrada_efetuada?: boolean | null
          id?: string
          lote?: string | null
          nota_compra_id?: string
          numero_serie?: string | null
          produto_encontrado?: boolean | null
          produto_id?: string | null
          quantidade?: number
          unidade_medida?: string | null
          validade?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_nota_compra_nota_compra_id_fkey"
            columns: ["nota_compra_id"]
            isOneToOne: false
            referencedRelation: "notas_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_nota_compra_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido_compra: {
        Row: {
          aliquota_icms: number | null
          aliquota_ipi: number | null
          atualizado_em: string | null
          criado_em: string | null
          data_entrega_prevista: string | null
          data_entrega_realizada: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          especificacoes_tecnicas: string | null
          excluido_em: string | null
          id: string
          numero_item: number | null
          observacoes: string | null
          pedido_compra_id: string
          produto_id: string
          quantidade: number
          quantidade_pendente: number | null
          quantidade_recebida: number | null
          solicitacao_compra_id: string | null
          status: string | null
          valor_icms: number | null
          valor_ipi: number | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          aliquota_icms?: number | null
          aliquota_ipi?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_entrega_prevista?: string | null
          data_entrega_realizada?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          especificacoes_tecnicas?: string | null
          excluido_em?: string | null
          id?: string
          numero_item?: number | null
          observacoes?: string | null
          pedido_compra_id: string
          produto_id: string
          quantidade: number
          quantidade_pendente?: number | null
          quantidade_recebida?: number | null
          solicitacao_compra_id?: string | null
          status?: string | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          aliquota_icms?: number | null
          aliquota_ipi?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_entrega_prevista?: string | null
          data_entrega_realizada?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          especificacoes_tecnicas?: string | null
          excluido_em?: string | null
          id?: string
          numero_item?: number | null
          observacoes?: string | null
          pedido_compra_id?: string
          produto_id?: string
          quantidade?: number
          quantidade_pendente?: number | null
          quantidade_recebida?: number | null
          solicitacao_compra_id?: string | null
          status?: string | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_compra_pedido_compra_id_fkey"
            columns: ["pedido_compra_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_compra_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_compra_solicitacao_compra_id_fkey"
            columns: ["solicitacao_compra_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_proposta: {
        Row: {
          aliquota_imposto: number | null
          atualizado_em: string | null
          codigo: string | null
          criado_em: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          descricao: string
          especificacoes: string | null
          excluido_em: string | null
          id: string
          imagem_url: string | null
          numero_item: number
          observacoes: string | null
          produto_id: string | null
          proposta_id: string
          quantidade: number
          tipo: string | null
          unidade: string | null
          valor_imposto: number | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          aliquota_imposto?: number | null
          atualizado_em?: string | null
          codigo?: string | null
          criado_em?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao: string
          especificacoes?: string | null
          excluido_em?: string | null
          id?: string
          imagem_url?: string | null
          numero_item: number
          observacoes?: string | null
          produto_id?: string | null
          proposta_id: string
          quantidade?: number
          tipo?: string | null
          unidade?: string | null
          valor_imposto?: number | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          aliquota_imposto?: number | null
          atualizado_em?: string | null
          codigo?: string | null
          criado_em?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string
          especificacoes?: string | null
          excluido_em?: string | null
          id?: string
          imagem_url?: string | null
          numero_item?: number
          observacoes?: string | null
          produto_id?: string | null
          proposta_id?: string
          quantidade?: number
          tipo?: string | null
          unidade?: string | null
          valor_imposto?: number | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_proposta_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_proposta_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_remessa_consignacao: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          descricao: string
          id: string
          lote: string | null
          material_id: string | null
          observacoes: string | null
          quantidade: number
          quantidade_devolvida: number | null
          quantidade_utilizada: number | null
          remessa_id: string
          status: string | null
          validade: string | null
          valor_unitario: number
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          descricao: string
          id?: string
          lote?: string | null
          material_id?: string | null
          observacoes?: string | null
          quantidade: number
          quantidade_devolvida?: number | null
          quantidade_utilizada?: number | null
          remessa_id: string
          status?: string | null
          validade?: string | null
          valor_unitario: number
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string
          id?: string
          lote?: string | null
          material_id?: string | null
          observacoes?: string | null
          quantidade?: number
          quantidade_devolvida?: number | null
          quantidade_utilizada?: number | null
          remessa_id?: string
          status?: string | null
          validade?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_remessa_consignacao_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_remessa_consignacao_remessa_id_fkey"
            columns: ["remessa_id"]
            isOneToOne: false
            referencedRelation: "remessas_consignacao"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_solicitacao_compra: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          observacoes: string | null
          preco_referencia: number | null
          produto_id: string | null
          quantidade: number
          solicitacao_id: string
          unidade_medida: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          preco_referencia?: number | null
          produto_id?: string | null
          quantidade: number
          solicitacao_id: string
          unidade_medida?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          preco_referencia?: number | null
          produto_id?: string | null
          quantidade?: number
          solicitacao_id?: string
          unidade_medida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_solicitacao_compra_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_solicitacao_compra_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_compra"
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
            foreignKeyName: "kits_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
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
      kpi_alertas: {
        Row: {
          acao_recomendada: string | null
          created_at: string | null
          detalhes: Json | null
          id: string
          is_resolvido: boolean | null
          kpi_meta_id: string
          kpi_valor_historico_id: string | null
          mensagem: string
          notas_resolucao: string | null
          notificado: boolean | null
          notificado_em: string | null
          notificados: string[] | null
          resolvido_em: string | null
          resolvido_por: string | null
          severidade: string
          tipo: string
        }
        Insert: {
          acao_recomendada?: string | null
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          is_resolvido?: boolean | null
          kpi_meta_id: string
          kpi_valor_historico_id?: string | null
          mensagem: string
          notas_resolucao?: string | null
          notificado?: boolean | null
          notificado_em?: string | null
          notificados?: string[] | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade: string
          tipo: string
        }
        Update: {
          acao_recomendada?: string | null
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          is_resolvido?: boolean | null
          kpi_meta_id?: string
          kpi_valor_historico_id?: string | null
          mensagem?: string
          notas_resolucao?: string | null
          notificado?: boolean | null
          notificado_em?: string | null
          notificados?: string[] | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_alertas_kpi_meta_id_fkey"
            columns: ["kpi_meta_id"]
            isOneToOne: false
            referencedRelation: "kpi_metas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_alertas_kpi_valor_historico_id_fkey"
            columns: ["kpi_valor_historico_id"]
            isOneToOne: false
            referencedRelation: "kpi_valores_historico"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_dashboard_widgets: {
        Row: {
          altura: number | null
          config: Json
          created_at: string | null
          id: string
          is_visivel: boolean | null
          kpi_meta_ids: string[] | null
          largura: number | null
          ordem: number | null
          posicao_x: number | null
          posicao_y: number | null
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          altura?: number | null
          config: Json
          created_at?: string | null
          id?: string
          is_visivel?: boolean | null
          kpi_meta_ids?: string[] | null
          largura?: number | null
          ordem?: number | null
          posicao_x?: number | null
          posicao_y?: number | null
          tipo: string
          titulo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          altura?: number | null
          config?: Json
          created_at?: string | null
          id?: string
          is_visivel?: boolean | null
          kpi_meta_ids?: string[] | null
          largura?: number | null
          ordem?: number | null
          posicao_x?: number | null
          posicao_y?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      kpi_metas: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          formula: string | null
          id: string
          meta_ideal: number | null
          meta_minima: number | null
          meta_valor: number
          nome: string
          periodicidade: string | null
          responsavel_id: string | null
          sentido: string | null
          tipo_metrica: string | null
          unidade: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          formula?: string | null
          id?: string
          meta_ideal?: number | null
          meta_minima?: number | null
          meta_valor: number
          nome: string
          periodicidade?: string | null
          responsavel_id?: string | null
          sentido?: string | null
          tipo_metrica?: string | null
          unidade?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          formula?: string | null
          id?: string
          meta_ideal?: number | null
          meta_minima?: number | null
          meta_valor?: number
          nome?: string
          periodicidade?: string | null
          responsavel_id?: string | null
          sentido?: string | null
          tipo_metrica?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_metas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "kpi_metas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_metas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_realizacoes: {
        Row: {
          calculado_em: string | null
          criado_em: string | null
          empresa_id: string
          id: string
          kpi_meta_id: string
          observacoes: string | null
          percentual_atingido: number | null
          periodo_fim: string
          periodo_inicio: string
          status: string | null
          tendencia: string | null
          valor_meta: number | null
          valor_realizado: number
        }
        Insert: {
          calculado_em?: string | null
          criado_em?: string | null
          empresa_id: string
          id?: string
          kpi_meta_id: string
          observacoes?: string | null
          percentual_atingido?: number | null
          periodo_fim: string
          periodo_inicio: string
          status?: string | null
          tendencia?: string | null
          valor_meta?: number | null
          valor_realizado: number
        }
        Update: {
          calculado_em?: string | null
          criado_em?: string | null
          empresa_id?: string
          id?: string
          kpi_meta_id?: string
          observacoes?: string | null
          percentual_atingido?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          status?: string | null
          tendencia?: string | null
          valor_meta?: number | null
          valor_realizado?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_realizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_realizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "kpi_realizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_realizacoes_kpi_meta_id_fkey"
            columns: ["kpi_meta_id"]
            isOneToOne: false
            referencedRelation: "kpi_metas"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_valores_historico: {
        Row: {
          atingimento_percentual: number
          calculado_em: string | null
          calculado_por: string | null
          data_referencia: string
          id: string
          kpi_meta_id: string
          periodo: string
          status: string
          tendencia: string | null
          valor_meta: number
          valor_periodo_anterior: number | null
          valor_real: number
          variacao_percentual: number | null
        }
        Insert: {
          atingimento_percentual: number
          calculado_em?: string | null
          calculado_por?: string | null
          data_referencia: string
          id?: string
          kpi_meta_id: string
          periodo: string
          status: string
          tendencia?: string | null
          valor_meta: number
          valor_periodo_anterior?: number | null
          valor_real: number
          variacao_percentual?: number | null
        }
        Update: {
          atingimento_percentual?: number
          calculado_em?: string | null
          calculado_por?: string | null
          data_referencia?: string
          id?: string
          kpi_meta_id?: string
          periodo?: string
          status?: string
          tendencia?: string | null
          valor_meta?: number
          valor_periodo_anterior?: number | null
          valor_real?: number
          variacao_percentual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_valores_historico_kpi_meta_id_fkey"
            columns: ["kpi_meta_id"]
            isOneToOne: false
            referencedRelation: "kpi_metas"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_contabeis: {
        Row: {
          atualizado_em: string | null
          centro_custo_id: string | null
          complemento: string | null
          conciliado: boolean | null
          criado_em: string | null
          data_competencia: string | null
          data_conciliacao: string | null
          data_lancamento: string
          documento_id: string | null
          documento_numero: string | null
          documento_tipo: string | null
          empresa_id: string
          historico: string
          id: string
          lote_id: string | null
          numero_lancamento: string
          plano_contas_codigo: string
          plano_contas_nome: string | null
          status: string | null
          tipo: string
          usuario_id: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          centro_custo_id?: string | null
          complemento?: string | null
          conciliado?: boolean | null
          criado_em?: string | null
          data_competencia?: string | null
          data_conciliacao?: string | null
          data_lancamento: string
          documento_id?: string | null
          documento_numero?: string | null
          documento_tipo?: string | null
          empresa_id: string
          historico: string
          id?: string
          lote_id?: string | null
          numero_lancamento: string
          plano_contas_codigo: string
          plano_contas_nome?: string | null
          status?: string | null
          tipo: string
          usuario_id?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          centro_custo_id?: string | null
          complemento?: string | null
          conciliado?: boolean | null
          criado_em?: string | null
          data_competencia?: string | null
          data_conciliacao?: string | null
          data_lancamento?: string
          documento_id?: string | null
          documento_numero?: string | null
          documento_tipo?: string | null
          empresa_id?: string
          historico?: string
          id?: string
          lote_id?: string | null
          numero_lancamento?: string
          plano_contas_codigo?: string
          plano_contas_nome?: string | null
          status?: string | null
          tipo?: string
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_contabeis_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_contabeis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_contabeis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "lancamentos_contabeis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_contabeis_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      legislacao_updates: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_publicacao: string | null
          descricao: string | null
          id: string
          impacto_modulos: string[] | null
          link_oficial: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          impacto_modulos?: string[] | null
          link_oficial?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          impacto_modulos?: string[] | null
          link_oficial?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: []
      }
      licitacao_documentos: {
        Row: {
          id: string
          licitacao_id: string
          mime_type: string | null
          nome: string
          tamanho_bytes: number | null
          tipo: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          id?: string
          licitacao_id: string
          mime_type?: string | null
          nome: string
          tamanho_bytes?: number | null
          tipo: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          id?: string
          licitacao_id?: string
          mime_type?: string | null
          nome?: string
          tamanho_bytes?: number | null
          tipo?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "licitacao_documentos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licitacao_documentos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_licitacoes_ativas"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacao_eventos: {
        Row: {
          anexos: Json | null
          created_at: string | null
          created_by: string | null
          data_evento: string
          descricao: string | null
          id: string
          licitacao_id: string
          responsavel_interno_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          anexos?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_evento: string
          descricao?: string | null
          id?: string
          licitacao_id: string
          responsavel_interno_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          anexos?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_evento?: string
          descricao?: string | null
          id?: string
          licitacao_id?: string
          responsavel_interno_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "licitacao_eventos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licitacao_eventos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_licitacoes_ativas"
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
      licitacoes_itens: {
        Row: {
          aceita_similar: boolean | null
          atualizado_em: string | null
          codigo_catmat: string | null
          criado_em: string | null
          criterios_aceitacao: string | null
          descricao: string
          especificacao_tecnica: string | null
          excluido_em: string | null
          exige_amostra: boolean | null
          grupo: number | null
          id: string
          licitacao_id: string
          local_entrega: string | null
          lote: number | null
          marca_referencia: string | null
          ncm: string | null
          numero_item: number
          observacoes: string | null
          prazo_amostra_dias: number | null
          prazo_entrega_dias: number | null
          produto_id: string | null
          quantidade: number
          quantidade_maxima: number | null
          quantidade_minima: number | null
          unidade_medida: string | null
          valor_total_referencia: number | null
          valor_unitario_referencia: number | null
        }
        Insert: {
          aceita_similar?: boolean | null
          atualizado_em?: string | null
          codigo_catmat?: string | null
          criado_em?: string | null
          criterios_aceitacao?: string | null
          descricao: string
          especificacao_tecnica?: string | null
          excluido_em?: string | null
          exige_amostra?: boolean | null
          grupo?: number | null
          id?: string
          licitacao_id: string
          local_entrega?: string | null
          lote?: number | null
          marca_referencia?: string | null
          ncm?: string | null
          numero_item: number
          observacoes?: string | null
          prazo_amostra_dias?: number | null
          prazo_entrega_dias?: number | null
          produto_id?: string | null
          quantidade: number
          quantidade_maxima?: number | null
          quantidade_minima?: number | null
          unidade_medida?: string | null
          valor_total_referencia?: number | null
          valor_unitario_referencia?: number | null
        }
        Update: {
          aceita_similar?: boolean | null
          atualizado_em?: string | null
          codigo_catmat?: string | null
          criado_em?: string | null
          criterios_aceitacao?: string | null
          descricao?: string
          especificacao_tecnica?: string | null
          excluido_em?: string | null
          exige_amostra?: boolean | null
          grupo?: number | null
          id?: string
          licitacao_id?: string
          local_entrega?: string | null
          lote?: number | null
          marca_referencia?: string | null
          ncm?: string | null
          numero_item?: number
          observacoes?: string | null
          prazo_amostra_dias?: number | null
          prazo_entrega_dias?: number | null
          produto_id?: string | null
          quantidade?: number
          quantidade_maxima?: number | null
          quantidade_minima?: number | null
          unidade_medida?: string | null
          valor_total_referencia?: number | null
          valor_unitario_referencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "licitacoes_itens_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licitacoes_itens_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_licitacoes_ativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licitacoes_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
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
      materiais: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          codigo: string
          consignado: boolean | null
          controlado_anvisa: boolean | null
          criado_em: string | null
          descricao: string
          empresa_id: string
          excluido_em: string | null
          fabricante: string | null
          id: string
          lote_obrigatorio: boolean | null
          registro_anvisa: string | null
          subcategoria: string | null
          unidade_medida: string | null
          validade_obrigatoria: boolean | null
          valor_unitario: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo: string
          consignado?: boolean | null
          controlado_anvisa?: boolean | null
          criado_em?: string | null
          descricao: string
          empresa_id: string
          excluido_em?: string | null
          fabricante?: string | null
          id?: string
          lote_obrigatorio?: boolean | null
          registro_anvisa?: string | null
          subcategoria?: string | null
          unidade_medida?: string | null
          validade_obrigatoria?: boolean | null
          valor_unitario?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo?: string
          consignado?: boolean | null
          controlado_anvisa?: boolean | null
          criado_em?: string | null
          descricao?: string
          empresa_id?: string
          excluido_em?: string | null
          fabricante?: string | null
          id?: string
          lote_obrigatorio?: boolean | null
          registro_anvisa?: string | null
          subcategoria?: string | null
          unidade_medida?: string | null
          validade_obrigatoria?: boolean | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "materiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
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
            foreignKeyName: "materiais_consignados_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
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
          fornecedor_id: string | null
          id: string
          localizacao: string | null
          lote: string | null
          nome: string
          observacoes: string | null
          quantidade_estoque: number | null
          quantidade_minima: number | null
          registro_anvisa: string | null
          status: string | null
          tipo: string | null
          unidade_medida: string | null
          updated_at: string | null
          validade: string | null
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
          fornecedor_id?: string | null
          id?: string
          localizacao?: string | null
          lote?: string | null
          nome: string
          observacoes?: string | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          registro_anvisa?: string | null
          status?: string | null
          tipo?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          validade?: string | null
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
          fornecedor_id?: string | null
          id?: string
          localizacao?: string | null
          lote?: string | null
          nome?: string
          observacoes?: string | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          registro_anvisa?: string | null
          status?: string | null
          tipo?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      medicos: {
        Row: {
          atualizado_em: string | null
          cep: string | null
          cirurgias_realizadas: number | null
          created_at: string | null
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
          taxa_sucesso: number | null
          telefone: string
          updated_at: string | null
          usuario_id: string | null
          volume_anual_estimado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          cep?: string | null
          cirurgias_realizadas?: number | null
          created_at?: string | null
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
          taxa_sucesso?: number | null
          telefone?: string
          updated_at?: string | null
          usuario_id?: string | null
          volume_anual_estimado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          cep?: string | null
          cirurgias_realizadas?: number | null
          created_at?: string | null
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
          taxa_sucesso?: number | null
          telefone?: string
          updated_at?: string | null
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
      membros_equipe: {
        Row: {
          created_at: string | null
          equipe_id: string
          funcao: string | null
          id: string
          medico_id: string
        }
        Insert: {
          created_at?: string | null
          equipe_id: string
          funcao?: string | null
          id?: string
          medico_id: string
        }
        Update: {
          created_at?: string | null
          equipe_id?: string
          funcao?: string | null
          id?: string
          medico_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_equipe_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_medicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_equipe_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_equipe_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "view_medicos_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      microsoft_contatos_sync: {
        Row: {
          data_fim: string | null
          data_inicio: string
          erro_mensagem: string | null
          fornecedores_sincronizados: number | null
          hospitais_sincronizados: number | null
          id: string
          medicos_sincronizados: number | null
          status: string | null
          total_contatos_sincronizados: number | null
          user_id: string
        }
        Insert: {
          data_fim?: string | null
          data_inicio?: string
          erro_mensagem?: string | null
          fornecedores_sincronizados?: number | null
          hospitais_sincronizados?: number | null
          id?: string
          medicos_sincronizados?: number | null
          status?: string | null
          total_contatos_sincronizados?: number | null
          user_id: string
        }
        Update: {
          data_fim?: string | null
          data_inicio?: string
          erro_mensagem?: string | null
          fornecedores_sincronizados?: number | null
          hospitais_sincronizados?: number | null
          id?: string
          medicos_sincronizados?: number | null
          status?: string | null
          total_contatos_sincronizados?: number | null
          user_id?: string
        }
        Relationships: []
      }
      microsoft_onedrive_files: {
        Row: {
          compartilhado_com: string[] | null
          data_upload: string
          entidade_id: string | null
          entidade_tipo: string | null
          id: string
          item_id: string
          link_compartilhamento: string | null
          nome_arquivo: string
          pasta: string | null
          tamanho_bytes: number | null
          tipo_arquivo: string | null
          tipo_documento: string | null
          usuario_upload: string
          web_url: string
        }
        Insert: {
          compartilhado_com?: string[] | null
          data_upload?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          item_id: string
          link_compartilhamento?: string | null
          nome_arquivo: string
          pasta?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo?: string | null
          tipo_documento?: string | null
          usuario_upload: string
          web_url: string
        }
        Update: {
          compartilhado_com?: string[] | null
          data_upload?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          item_id?: string
          link_compartilhamento?: string | null
          nome_arquivo?: string
          pasta?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo?: string | null
          tipo_documento?: string | null
          usuario_upload?: string
          web_url?: string
        }
        Relationships: []
      }
      microsoft_tokens: {
        Row: {
          access_token: string
          account_email: string
          created_at: string
          expires_at: string
          id: string
          id_token: string | null
          last_used_at: string | null
          refresh_token: string | null
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_email: string
          created_at?: string
          expires_at: string
          id?: string
          id_token?: string | null
          last_used_at?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_email?: string
          created_at?: string
          expires_at?: string
          id?: string
          id_token?: string | null
          last_used_at?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: []
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
      movimentacoes_consignacao: {
        Row: {
          cirurgia_id: string | null
          created_at: string | null
          data_movimentacao: string
          documento_numero: string | null
          documento_tipo: string | null
          hospital_destino_id: string | null
          hospital_origem_id: string | null
          id: string
          material_consignado_id: string | null
          motivo: string | null
          observacoes: string | null
          quantidade: number
          responsavel: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          cirurgia_id?: string | null
          created_at?: string | null
          data_movimentacao?: string
          documento_numero?: string | null
          documento_tipo?: string | null
          hospital_destino_id?: string | null
          hospital_origem_id?: string | null
          id?: string
          material_consignado_id?: string | null
          motivo?: string | null
          observacoes?: string | null
          quantidade: number
          responsavel: string
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          cirurgia_id?: string | null
          created_at?: string | null
          data_movimentacao?: string
          documento_numero?: string | null
          documento_tipo?: string | null
          hospital_destino_id?: string | null
          hospital_origem_id?: string | null
          id?: string
          material_consignado_id?: string | null
          motivo?: string | null
          observacoes?: string | null
          quantidade?: number
          responsavel?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_consignacao_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_hospital_destino_id_fkey"
            columns: ["hospital_destino_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_hospital_destino_id_fkey"
            columns: ["hospital_destino_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_hospital_origem_id_fkey"
            columns: ["hospital_origem_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_hospital_origem_id_fkey"
            columns: ["hospital_origem_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_material_consignado_id_fkey"
            columns: ["material_consignado_id"]
            isOneToOne: false
            referencedRelation: "materiais_consignados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_material_consignado_id_fkey"
            columns: ["material_consignado_id"]
            isOneToOne: false
            referencedRelation: "vw_materiais_criticos_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_consignacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      nao_conformidades: {
        Row: {
          acao_corretiva: string | null
          acao_imediata: string | null
          acao_preventiva: string | null
          auditoria_id: string | null
          categoria: string | null
          causa_raiz: string | null
          codigo_nc: string
          created_at: string | null
          custo_estimado: number | null
          custo_real: number | null
          data_correcao_efetiva: string | null
          data_identificacao: string
          data_prazo_correcao: string
          descricao_completa: string | null
          evidencias_correcao: string[] | null
          id: string
          impacto_cliente: string | null
          impacto_negocio: string | null
          origem: string
          reincidencia: boolean | null
          responsavel_analise: string | null
          responsavel_correcao: string | null
          severidade: string
          status: string | null
          titulo: string
          updated_at: string | null
          verificacao_eficacia: boolean | null
        }
        Insert: {
          acao_corretiva?: string | null
          acao_imediata?: string | null
          acao_preventiva?: string | null
          auditoria_id?: string | null
          categoria?: string | null
          causa_raiz?: string | null
          codigo_nc: string
          created_at?: string | null
          custo_estimado?: number | null
          custo_real?: number | null
          data_correcao_efetiva?: string | null
          data_identificacao: string
          data_prazo_correcao: string
          descricao_completa?: string | null
          evidencias_correcao?: string[] | null
          id?: string
          impacto_cliente?: string | null
          impacto_negocio?: string | null
          origem: string
          reincidencia?: boolean | null
          responsavel_analise?: string | null
          responsavel_correcao?: string | null
          severidade: string
          status?: string | null
          titulo: string
          updated_at?: string | null
          verificacao_eficacia?: boolean | null
        }
        Update: {
          acao_corretiva?: string | null
          acao_imediata?: string | null
          acao_preventiva?: string | null
          auditoria_id?: string | null
          categoria?: string | null
          causa_raiz?: string | null
          codigo_nc?: string
          created_at?: string | null
          custo_estimado?: number | null
          custo_real?: number | null
          data_correcao_efetiva?: string | null
          data_identificacao?: string
          data_prazo_correcao?: string
          descricao_completa?: string | null
          evidencias_correcao?: string[] | null
          id?: string
          impacto_cliente?: string | null
          impacto_negocio?: string | null
          origem?: string
          reincidencia?: boolean | null
          responsavel_analise?: string | null
          responsavel_correcao?: string | null
          severidade?: string
          status?: string | null
          titulo?: string
          updated_at?: string | null
          verificacao_eficacia?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "nao_conformidades_auditoria_id_fkey"
            columns: ["auditoria_id"]
            isOneToOne: false
            referencedRelation: "auditorias_internas"
            referencedColumns: ["id"]
          },
        ]
      }
      negociacoes: {
        Row: {
          anexos_urls: string[] | null
          assunto: string
          atualizado_em: string | null
          criado_em: string | null
          data_negociacao: string | null
          data_proxima_acao: string | null
          descricao: string | null
          duracao_minutos: number | null
          empresa_id: string
          gravacao_url: string | null
          id: string
          oportunidade_id: string
          participantes_cliente: string[] | null
          participantes_internos: string[] | null
          proposta_id: string | null
          proxima_acao: string | null
          responsavel_id: string
          resultado: string | null
          tipo: string
          valor_contraproposta: number | null
          valor_inicial: number | null
          valor_proposto: number | null
        }
        Insert: {
          anexos_urls?: string[] | null
          assunto: string
          atualizado_em?: string | null
          criado_em?: string | null
          data_negociacao?: string | null
          data_proxima_acao?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          empresa_id: string
          gravacao_url?: string | null
          id?: string
          oportunidade_id: string
          participantes_cliente?: string[] | null
          participantes_internos?: string[] | null
          proposta_id?: string | null
          proxima_acao?: string | null
          responsavel_id: string
          resultado?: string | null
          tipo: string
          valor_contraproposta?: number | null
          valor_inicial?: number | null
          valor_proposto?: number | null
        }
        Update: {
          anexos_urls?: string[] | null
          assunto?: string
          atualizado_em?: string | null
          criado_em?: string | null
          data_negociacao?: string | null
          data_proxima_acao?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          empresa_id?: string
          gravacao_url?: string | null
          id?: string
          oportunidade_id?: string
          participantes_cliente?: string[] | null
          participantes_internos?: string[] | null
          proposta_id?: string | null
          proxima_acao?: string | null
          responsavel_id?: string
          resultado?: string | null
          tipo?: string
          valor_contraproposta?: number | null
          valor_inicial?: number | null
          valor_proposto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "negociacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "negociacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "nfes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
        ]
      }
      nfes_audit_log: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          data_acao: string
          id: string
          ip_address: unknown
          nfe_id: string
          user_agent: string | null
          usuario_id: string
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_acao?: string
          id?: string
          ip_address?: unknown
          nfe_id: string
          user_agent?: string | null
          usuario_id: string
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_acao?: string
          id?: string
          ip_address?: unknown
          nfe_id?: string
          user_agent?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      notas_compra: {
        Row: {
          chave_acesso: string | null
          created_at: string | null
          created_by: string | null
          data_emissao: string
          data_entrada: string | null
          empresa_id: string
          fornecedor_id: string
          id: string
          numero_nota: string
          observacoes: string | null
          pedido_compra_id: string | null
          serie: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          valor_cofins: number | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_icms: number | null
          valor_ipi: number | null
          valor_outros: number | null
          valor_pis: number | null
          valor_produtos: number
          valor_seguro: number | null
          valor_total: number
          xml_nfe: string | null
        }
        Insert: {
          chave_acesso?: string | null
          created_at?: string | null
          created_by?: string | null
          data_emissao: string
          data_entrada?: string | null
          empresa_id: string
          fornecedor_id: string
          id?: string
          numero_nota: string
          observacoes?: string | null
          pedido_compra_id?: string | null
          serie?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_cofins?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_outros?: number | null
          valor_pis?: number | null
          valor_produtos: number
          valor_seguro?: number | null
          valor_total: number
          xml_nfe?: string | null
        }
        Update: {
          chave_acesso?: string | null
          created_at?: string | null
          created_by?: string | null
          data_emissao?: string
          data_entrada?: string | null
          empresa_id?: string
          fornecedor_id?: string
          id?: string
          numero_nota?: string
          observacoes?: string | null
          pedido_compra_id?: string | null
          serie?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_cofins?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_outros?: number | null
          valor_pis?: number | null
          valor_produtos?: number
          valor_seguro?: number | null
          valor_total?: number
          xml_nfe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_compra_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "notas_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_compra_pedido_compra_id_fkey"
            columns: ["pedido_compra_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_compra_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          cfop: string | null
          chave_acesso: string | null
          criado_em: string | null
          criado_por: string | null
          danfe_url: string | null
          data_autorizacao: string | null
          data_emissao: string
          data_entrada_saida: string | null
          data_vencimento: string | null
          destinatario_cnpj: string | null
          destinatario_nome: string | null
          documento_origem_id: string | null
          documento_origem_tipo: string | null
          empresa_id: string
          excluido_em: string | null
          fornecedor_cnpj: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string
          modelo: string | null
          natureza_operacao: string | null
          numero: string
          observacoes: string | null
          pdf_url: string | null
          protocolo_autorizacao: string | null
          serie: string | null
          status: string | null
          status_sefaz: string | null
          tipo: string
          valor_cofins: number | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_icms: number | null
          valor_ipi: number | null
          valor_outras_despesas: number | null
          valor_pis: number | null
          valor_produtos: number
          valor_seguro: number | null
          valor_total: number
          xml_url: string | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cfop?: string | null
          chave_acesso?: string | null
          criado_em?: string | null
          criado_por?: string | null
          danfe_url?: string | null
          data_autorizacao?: string | null
          data_emissao: string
          data_entrada_saida?: string | null
          data_vencimento?: string | null
          destinatario_cnpj?: string | null
          destinatario_nome?: string | null
          documento_origem_id?: string | null
          documento_origem_tipo?: string | null
          empresa_id: string
          excluido_em?: string | null
          fornecedor_cnpj?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          modelo?: string | null
          natureza_operacao?: string | null
          numero: string
          observacoes?: string | null
          pdf_url?: string | null
          protocolo_autorizacao?: string | null
          serie?: string | null
          status?: string | null
          status_sefaz?: string | null
          tipo: string
          valor_cofins?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_outras_despesas?: number | null
          valor_pis?: number | null
          valor_produtos?: number
          valor_seguro?: number | null
          valor_total?: number
          xml_url?: string | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cfop?: string | null
          chave_acesso?: string | null
          criado_em?: string | null
          criado_por?: string | null
          danfe_url?: string | null
          data_autorizacao?: string | null
          data_emissao?: string
          data_entrada_saida?: string | null
          data_vencimento?: string | null
          destinatario_cnpj?: string | null
          destinatario_nome?: string | null
          documento_origem_id?: string | null
          documento_origem_tipo?: string | null
          empresa_id?: string
          excluido_em?: string | null
          fornecedor_cnpj?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          modelo?: string | null
          natureza_operacao?: string | null
          numero?: string
          observacoes?: string | null
          pdf_url?: string | null
          protocolo_autorizacao?: string | null
          serie?: string | null
          status?: string | null
          status_sefaz?: string | null
          tipo?: string
          valor_cofins?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_outras_despesas?: number | null
          valor_pis?: number | null
          valor_produtos?: number
          valor_seguro?: number | null
          valor_total?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "notas_fiscais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          acoes_json: Json | null
          arquivada: boolean | null
          arquivada_em: string | null
          cor: string | null
          criado_em: string | null
          empresa_id: string
          entidade_id: string | null
          entidade_tipo: string | null
          expira_em: string | null
          icone: string | null
          id: string
          lida: boolean | null
          lida_em: string | null
          mensagem: string | null
          prioridade: string | null
          tipo: string
          titulo: string
          url: string | null
          usuario_id: string
        }
        Insert: {
          acoes_json?: Json | null
          arquivada?: boolean | null
          arquivada_em?: string | null
          cor?: string | null
          criado_em?: string | null
          empresa_id: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          expira_em?: string | null
          icone?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          prioridade?: string | null
          tipo?: string
          titulo: string
          url?: string | null
          usuario_id: string
        }
        Update: {
          acoes_json?: Json | null
          arquivada?: boolean | null
          arquivada_em?: string | null
          cor?: string | null
          criado_em?: string | null
          empresa_id?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          expira_em?: string | null
          icone?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          prioridade?: string | null
          tipo?: string
          titulo?: string
          url?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "notificacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_legislacao: {
        Row: {
          criado_em: string | null
          id: string
          legislacao_id: string | null
          lida: boolean | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          legislacao_id?: string | null
          lida?: boolean | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          legislacao_id?: string | null
          lida?: boolean | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_legislacao_legislacao_id_fkey"
            columns: ["legislacao_id"]
            isOneToOne: false
            referencedRelation: "legislacao_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidade_interacoes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          metadata: Json | null
          ocorreu_em: string
          oportunidade_id: string
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          metadata?: Json | null
          ocorreu_em?: string
          oportunidade_id: string
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          metadata?: Json | null
          ocorreu_em?: string
          oportunidade_id?: string
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidade_interacoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_interacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidade_propostas: {
        Row: {
          atualizada_em: string
          criada_em: string
          id: string
          numero: string | null
          oportunidade_id: string
          status: string
          url_pdf: string | null
          valor: number
        }
        Insert: {
          atualizada_em?: string
          criada_em?: string
          id?: string
          numero?: string | null
          oportunidade_id: string
          status?: string
          url_pdf?: string | null
          valor?: number
        }
        Update: {
          atualizada_em?: string
          criada_em?: string
          id?: string
          numero?: string | null
          oportunidade_id?: string
          status?: string
          url_pdf?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "oportunidade_propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidade_tarefas: {
        Row: {
          concluido_em: string | null
          created_at: string
          due_date: string | null
          id: string
          oportunidade_id: string
          responsavel_id: string | null
          status: string
          titulo: string
        }
        Insert: {
          concluido_em?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          oportunidade_id: string
          responsavel_id?: string | null
          status?: string
          titulo: string
        }
        Update: {
          concluido_em?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          oportunidade_id?: string
          responsavel_id?: string | null
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "oportunidade_tarefas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_cnpj: string | null
          cliente_email: string | null
          cliente_nome: string
          cliente_segmento: string | null
          cliente_telefone: string | null
          concorrente: string | null
          created_at: string | null
          criado_em: string | null
          criado_por: string | null
          data_abertura: string | null
          data_fechamento_prevista: string | null
          data_fechamento_real: string | null
          desconto_percentual: number | null
          descricao: string | null
          empresa_id: string
          estagio: string | null
          etapa: string | null
          excluido_em: string | null
          id: string
          lead_id: string | null
          motivo_ganho: string | null
          motivo_perda: string | null
          nome: string
          nota: string | null
          numero: string
          observacoes: string | null
          origem: string | null
          probabilidade: number | null
          proximos_passos: string | null
          responsavel_id: string | null
          segmento: string | null
          status: string | null
          tipo: string | null
          titulo: string | null
          updated_at: string | null
          valor: number | null
          valor_estimado: number | null
          valor_fechado: number | null
          vendedor_id: string
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_cnpj?: string | null
          cliente_email?: string | null
          cliente_nome: string
          cliente_segmento?: string | null
          cliente_telefone?: string | null
          concorrente?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_abertura?: string | null
          data_fechamento_prevista?: string | null
          data_fechamento_real?: string | null
          desconto_percentual?: number | null
          descricao?: string | null
          empresa_id: string
          estagio?: string | null
          etapa?: string | null
          excluido_em?: string | null
          id?: string
          lead_id?: string | null
          motivo_ganho?: string | null
          motivo_perda?: string | null
          nome: string
          nota?: string | null
          numero: string
          observacoes?: string | null
          origem?: string | null
          probabilidade?: number | null
          proximos_passos?: string | null
          responsavel_id?: string | null
          segmento?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
          valor?: number | null
          valor_estimado?: number | null
          valor_fechado?: number | null
          vendedor_id: string
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_cnpj?: string | null
          cliente_email?: string | null
          cliente_nome?: string
          cliente_segmento?: string | null
          cliente_telefone?: string | null
          concorrente?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_abertura?: string | null
          data_fechamento_prevista?: string | null
          data_fechamento_real?: string | null
          desconto_percentual?: number | null
          descricao?: string | null
          empresa_id?: string
          estagio?: string | null
          etapa?: string | null
          excluido_em?: string | null
          id?: string
          lead_id?: string | null
          motivo_ganho?: string | null
          motivo_perda?: string | null
          nome?: string
          nota?: string | null
          numero?: string
          observacoes?: string | null
          origem?: string | null
          probabilidade?: number | null
          proximos_passos?: string | null
          responsavel_id?: string | null
          segmento?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
          valor?: number | null
          valor_estimado?: number | null
          valor_fechado?: number | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      participantes_treinamento: {
        Row: {
          aprovado: boolean | null
          cargo: string | null
          certificado_numero: string | null
          created_at: string | null
          data_emissao_certificado: string | null
          data_validade_certificado: string | null
          departamento: string | null
          id: string
          nome: string
          nota_final: number | null
          presenca_percentual: number | null
          treinamento_id: string | null
          usuario_id: string | null
        }
        Insert: {
          aprovado?: boolean | null
          cargo?: string | null
          certificado_numero?: string | null
          created_at?: string | null
          data_emissao_certificado?: string | null
          data_validade_certificado?: string | null
          departamento?: string | null
          id?: string
          nome: string
          nota_final?: number | null
          presenca_percentual?: number | null
          treinamento_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          aprovado?: boolean | null
          cargo?: string | null
          certificado_numero?: string | null
          created_at?: string | null
          data_emissao_certificado?: string | null
          data_validade_certificado?: string | null
          departamento?: string | null
          id?: string
          nome?: string
          nota_final?: number | null
          presenca_percentual?: number | null
          treinamento_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participantes_treinamento_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos_certificacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_treinamento_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      partidas_contabeis: {
        Row: {
          centro_custo_id: string | null
          conta_id: string
          created_at: string | null
          historico: string | null
          id: string
          lancamento_id: string
          tipo_partida: string
          valor: number
        }
        Insert: {
          centro_custo_id?: string | null
          conta_id: string
          created_at?: string | null
          historico?: string | null
          id?: string
          lancamento_id: string
          tipo_partida: string
          valor: number
        }
        Update: {
          centro_custo_id?: string | null
          conta_id?: string
          created_at?: string | null
          historico?: string | null
          id?: string
          lancamento_id?: string
          tipo_partida?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "partidas_contabeis_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_contabeis_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_contabeis_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos_contabeis"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra: {
        Row: {
          aprovado_por: string | null
          atualizado_em: string | null
          created_at: string | null
          criado_em: string | null
          data_aprovacao: string | null
          data_entrega_prevista: string | null
          data_entrega_real: string | null
          data_pedido: string | null
          desconto: number | null
          empresa_id: string
          excluido_em: string | null
          fornecedor_id: string | null
          id: string
          numero: string
          numero_pedido: string | null
          observacoes: string | null
          status: string | null
          status_en: string | null
          updated_at: string | null
          urgencia: string | null
          valor_frete: number | null
          valor_total: number
        }
        Insert: {
          aprovado_por?: string | null
          atualizado_em?: string | null
          created_at?: string | null
          criado_em?: string | null
          data_aprovacao?: string | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pedido?: string | null
          desconto?: number | null
          empresa_id: string
          excluido_em?: string | null
          fornecedor_id?: string | null
          id?: string
          numero: string
          numero_pedido?: string | null
          observacoes?: string | null
          status?: string | null
          status_en?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_frete?: number | null
          valor_total: number
        }
        Update: {
          aprovado_por?: string | null
          atualizado_em?: string | null
          created_at?: string | null
          criado_em?: string | null
          data_aprovacao?: string | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pedido?: string | null
          desconto?: number | null
          empresa_id?: string
          excluido_em?: string | null
          fornecedor_id?: string | null
          id?: string
          numero?: string
          numero_pedido?: string | null
          observacoes?: string | null
          status?: string | null
          status_en?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_frete?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
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
      performance_metrics: {
        Row: {
          db_query_time_ms: number | null
          error_message: string | null
          error_stack: string | null
          external_api_time_ms: number | null
          id: string
          method: string
          response_time_ms: number
          route: string
          status_code: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          db_query_time_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          external_api_time_ms?: number | null
          id?: string
          method: string
          response_time_ms: number
          route: string
          status_code: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          db_query_time_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          external_api_time_ms?: number | null
          id?: string
          method?: string
          response_time_ms?: number
          route?: string
          status_code?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          modulo: string | null
          nivel_criticidade: string | null
          nome: string
          recurso: string
          requer_2fa: boolean | null
          sistema: boolean | null
        }
        Insert: {
          acao: string
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          modulo?: string | null
          nivel_criticidade?: string | null
          nome: string
          recurso: string
          requer_2fa?: boolean | null
          sistema?: boolean | null
        }
        Update: {
          acao?: string
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          modulo?: string | null
          nivel_criticidade?: string | null
          nome?: string
          recurso?: string
          requer_2fa?: boolean | null
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
      pesquisas_gpt: {
        Row: {
          atualizado_em: string | null
          avaliacao: number | null
          compartilhado_com: string[] | null
          concluido_em: string | null
          criado_em: string | null
          custo_estimado: number | null
          docx_url: string | null
          empresa_id: string
          entidades_mencionadas: string[] | null
          excluido_em: string | null
          feedback: string | null
          fontes: string[] | null
          fontes_primarias: string[] | null
          fontes_secundarias: string[] | null
          id: string
          idiomas: string[] | null
          iniciado_em: string | null
          max_resultados: number | null
          mensagem_id: string | null
          palavras_chave: string[] | null
          pdf_url: string | null
          profundidade: string | null
          progresso: number | null
          publico: boolean | null
          query: string
          query_refinada: string | null
          referencias_json: Json | null
          relatorio_html: string | null
          relatorio_markdown: string | null
          resumo: string | null
          score_atualidade: number | null
          score_confiabilidade: number | null
          score_relevancia: number | null
          sessao_id: string | null
          status: string | null
          tempo_execucao_segundos: number | null
          tipo: string | null
          tokens_usados: number | null
          topicos_identificados: string[] | null
          total_fontes_consultadas: number | null
          urls_visitadas: string[] | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string | null
          avaliacao?: number | null
          compartilhado_com?: string[] | null
          concluido_em?: string | null
          criado_em?: string | null
          custo_estimado?: number | null
          docx_url?: string | null
          empresa_id: string
          entidades_mencionadas?: string[] | null
          excluido_em?: string | null
          feedback?: string | null
          fontes?: string[] | null
          fontes_primarias?: string[] | null
          fontes_secundarias?: string[] | null
          id?: string
          idiomas?: string[] | null
          iniciado_em?: string | null
          max_resultados?: number | null
          mensagem_id?: string | null
          palavras_chave?: string[] | null
          pdf_url?: string | null
          profundidade?: string | null
          progresso?: number | null
          publico?: boolean | null
          query: string
          query_refinada?: string | null
          referencias_json?: Json | null
          relatorio_html?: string | null
          relatorio_markdown?: string | null
          resumo?: string | null
          score_atualidade?: number | null
          score_confiabilidade?: number | null
          score_relevancia?: number | null
          sessao_id?: string | null
          status?: string | null
          tempo_execucao_segundos?: number | null
          tipo?: string | null
          tokens_usados?: number | null
          topicos_identificados?: string[] | null
          total_fontes_consultadas?: number | null
          urls_visitadas?: string[] | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string | null
          avaliacao?: number | null
          compartilhado_com?: string[] | null
          concluido_em?: string | null
          criado_em?: string | null
          custo_estimado?: number | null
          docx_url?: string | null
          empresa_id?: string
          entidades_mencionadas?: string[] | null
          excluido_em?: string | null
          feedback?: string | null
          fontes?: string[] | null
          fontes_primarias?: string[] | null
          fontes_secundarias?: string[] | null
          id?: string
          idiomas?: string[] | null
          iniciado_em?: string | null
          max_resultados?: number | null
          mensagem_id?: string | null
          palavras_chave?: string[] | null
          pdf_url?: string | null
          profundidade?: string | null
          progresso?: number | null
          publico?: boolean | null
          query?: string
          query_refinada?: string | null
          referencias_json?: Json | null
          relatorio_html?: string | null
          relatorio_markdown?: string | null
          resumo?: string | null
          score_atualidade?: number | null
          score_confiabilidade?: number | null
          score_relevancia?: number | null
          sessao_id?: string | null
          status?: string | null
          tempo_execucao_segundos?: number | null
          tipo?: string | null
          tokens_usados?: number | null
          topicos_identificados?: string[] | null
          total_fontes_consultadas?: number | null
          urls_visitadas?: string[] | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesquisas_gpt_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_gpt_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "pesquisas_gpt_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_gpt_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "chatbot_mensagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_gpt_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "chatbot_sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_gpt_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_contas: {
        Row: {
          aceita_lancamento: boolean | null
          codigo: string
          conta_pai_id: string | null
          created_at: string | null
          descricao: string | null
          exige_centro_custo: boolean | null
          grau: number
          id: string
          integracao_tipo: string | null
          is_ativa: boolean | null
          is_sintetica: boolean | null
          natureza: string
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          aceita_lancamento?: boolean | null
          codigo: string
          conta_pai_id?: string | null
          created_at?: string | null
          descricao?: string | null
          exige_centro_custo?: boolean | null
          grau: number
          id?: string
          integracao_tipo?: string | null
          is_ativa?: boolean | null
          is_sintetica?: boolean | null
          natureza: string
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          aceita_lancamento?: boolean | null
          codigo?: string
          conta_pai_id?: string | null
          created_at?: string | null
          descricao?: string | null
          exige_centro_custo?: boolean | null
          grau?: number
          id?: string
          integracao_tipo?: string | null
          is_ativa?: boolean | null
          is_sintetica?: boolean | null
          natureza?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_contas_conta_pai_id_fkey"
            columns: ["conta_pai_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      pluggy_accounts: {
        Row: {
          atualizado_em: string | null
          banco_id: string | null
          connection_id: string
          criado_em: string | null
          disponibilizado_em: string | null
          id: string
          moeda: string | null
          nome: string | null
          numero: string | null
          pluggy_account_id: string
          saldo: number | null
          subtipo: string | null
          tipo: string | null
          ultima_atualizacao: string | null
        }
        Insert: {
          atualizado_em?: string | null
          banco_id?: string | null
          connection_id: string
          criado_em?: string | null
          disponibilizado_em?: string | null
          id?: string
          moeda?: string | null
          nome?: string | null
          numero?: string | null
          pluggy_account_id: string
          saldo?: number | null
          subtipo?: string | null
          tipo?: string | null
          ultima_atualizacao?: string | null
        }
        Update: {
          atualizado_em?: string | null
          banco_id?: string | null
          connection_id?: string
          criado_em?: string | null
          disponibilizado_em?: string | null
          id?: string
          moeda?: string | null
          nome?: string | null
          numero?: string | null
          pluggy_account_id?: string
          saldo?: number | null
          subtipo?: string | null
          tipo?: string | null
          ultima_atualizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pluggy_accounts_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pluggy_accounts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "pluggy_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      pluggy_connections: {
        Row: {
          atualizado_em: string | null
          banco_id: string | null
          consentimento_expira_em: string | null
          criado_em: string | null
          empresa_id: string
          erro_mensagem: string | null
          id: string
          instituicao_nome: string
          instituicao_tipo: string | null
          pluggy_item_id: string
          proxima_sincronizacao: string | null
          status: string | null
          ultima_sincronizacao: string | null
          webhook_url: string | null
        }
        Insert: {
          atualizado_em?: string | null
          banco_id?: string | null
          consentimento_expira_em?: string | null
          criado_em?: string | null
          empresa_id: string
          erro_mensagem?: string | null
          id?: string
          instituicao_nome: string
          instituicao_tipo?: string | null
          pluggy_item_id: string
          proxima_sincronizacao?: string | null
          status?: string | null
          ultima_sincronizacao?: string | null
          webhook_url?: string | null
        }
        Update: {
          atualizado_em?: string | null
          banco_id?: string | null
          consentimento_expira_em?: string | null
          criado_em?: string | null
          empresa_id?: string
          erro_mensagem?: string | null
          id?: string
          instituicao_nome?: string
          instituicao_tipo?: string | null
          pluggy_item_id?: string
          proxima_sincronizacao?: string | null
          status?: string | null
          ultima_sincronizacao?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pluggy_connections_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pluggy_connections_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pluggy_connections_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "pluggy_connections_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      pluggy_transactions: {
        Row: {
          account_id: string
          categoria: string | null
          criado_em: string | null
          data: string
          descricao: string | null
          fluxo_caixa_id: string | null
          id: string
          merchant: string | null
          metadata_json: Json | null
          payment_method: string | null
          pluggy_transaction_id: string
          provisionado: boolean | null
          saldo_apos: number | null
          sincronizado_fluxo_caixa: boolean | null
          tipo: string
          valor: number
        }
        Insert: {
          account_id: string
          categoria?: string | null
          criado_em?: string | null
          data: string
          descricao?: string | null
          fluxo_caixa_id?: string | null
          id?: string
          merchant?: string | null
          metadata_json?: Json | null
          payment_method?: string | null
          pluggy_transaction_id: string
          provisionado?: boolean | null
          saldo_apos?: number | null
          sincronizado_fluxo_caixa?: boolean | null
          tipo: string
          valor: number
        }
        Update: {
          account_id?: string
          categoria?: string | null
          criado_em?: string | null
          data?: string
          descricao?: string | null
          fluxo_caixa_id?: string | null
          id?: string
          merchant?: string | null
          metadata_json?: Json | null
          payment_method?: string | null
          pluggy_transaction_id?: string
          provisionado?: boolean | null
          saldo_apos?: number | null
          sincronizado_fluxo_caixa?: boolean | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pluggy_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pluggy_accounts"
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
            foreignKeyName: "portais_opme_cotacoes_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
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
      portais_opme_logs: {
        Row: {
          criado_em: string | null
          empresa_id: string
          erro_codigo: string | null
          erro_detalhes: string | null
          id: string
          ip_origem: unknown
          max_tentativas: number | null
          mensagem_erro: string | null
          metodo_http: string | null
          operacao: string
          portal_config_id: string
          request_body_json: Json | null
          request_headers_json: Json | null
          request_timestamp: string | null
          response_body_json: Json | null
          response_headers_json: Json | null
          response_status_code: number | null
          response_time_ms: number | null
          response_timestamp: string | null
          solicitacao_id: string | null
          sucesso: boolean
          tentativa: number | null
          url_chamada: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          empresa_id: string
          erro_codigo?: string | null
          erro_detalhes?: string | null
          id?: string
          ip_origem?: unknown
          max_tentativas?: number | null
          mensagem_erro?: string | null
          metodo_http?: string | null
          operacao: string
          portal_config_id: string
          request_body_json?: Json | null
          request_headers_json?: Json | null
          request_timestamp?: string | null
          response_body_json?: Json | null
          response_headers_json?: Json | null
          response_status_code?: number | null
          response_time_ms?: number | null
          response_timestamp?: string | null
          solicitacao_id?: string | null
          sucesso: boolean
          tentativa?: number | null
          url_chamada?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string
          erro_codigo?: string | null
          erro_detalhes?: string | null
          id?: string
          ip_origem?: unknown
          max_tentativas?: number | null
          mensagem_erro?: string | null
          metodo_http?: string | null
          operacao?: string
          portal_config_id?: string
          request_body_json?: Json | null
          request_headers_json?: Json | null
          request_timestamp?: string | null
          response_body_json?: Json | null
          response_headers_json?: Json | null
          response_status_code?: number | null
          response_time_ms?: number | null
          response_timestamp?: string | null
          solicitacao_id?: string | null
          sucesso?: boolean
          tentativa?: number | null
          url_chamada?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "portais_opme_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_logs_portal_config_id_fkey"
            columns: ["portal_config_id"]
            isOneToOne: false
            referencedRelation: "portais_opme_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_logs_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "portais_opme_solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      portais_opme_respostas: {
        Row: {
          aprovado: boolean | null
          atualizado_em: string | null
          auditor_portal: string | null
          codigo_autorizacao: string | null
          criado_em: string | null
          data_processamento: string | null
          data_resposta: string | null
          documentos_pendentes: string[] | null
          documentos_urls: string[] | null
          id: string
          itens_aprovados_json: Json | null
          itens_negados_json: Json | null
          motivo_glosa: string | null
          motivo_negacao: string | null
          numero_autorizacao: string | null
          numero_resposta: string | null
          observacoes_internas: string | null
          observacoes_portal: string | null
          origem: string | null
          parcialmente_aprovado: boolean | null
          payload_resposta_json: Json | null
          pendencias: string[] | null
          prazo_regularizacao: string | null
          processada: boolean | null
          processada_por_id: string | null
          responsavel_portal: string | null
          solicitacao_id: string
          tipo_resposta: string
          validade_autorizacao: string | null
          valor_aprovado: number | null
          valor_glosa: number | null
          valor_negado: number | null
        }
        Insert: {
          aprovado?: boolean | null
          atualizado_em?: string | null
          auditor_portal?: string | null
          codigo_autorizacao?: string | null
          criado_em?: string | null
          data_processamento?: string | null
          data_resposta?: string | null
          documentos_pendentes?: string[] | null
          documentos_urls?: string[] | null
          id?: string
          itens_aprovados_json?: Json | null
          itens_negados_json?: Json | null
          motivo_glosa?: string | null
          motivo_negacao?: string | null
          numero_autorizacao?: string | null
          numero_resposta?: string | null
          observacoes_internas?: string | null
          observacoes_portal?: string | null
          origem?: string | null
          parcialmente_aprovado?: boolean | null
          payload_resposta_json?: Json | null
          pendencias?: string[] | null
          prazo_regularizacao?: string | null
          processada?: boolean | null
          processada_por_id?: string | null
          responsavel_portal?: string | null
          solicitacao_id: string
          tipo_resposta: string
          validade_autorizacao?: string | null
          valor_aprovado?: number | null
          valor_glosa?: number | null
          valor_negado?: number | null
        }
        Update: {
          aprovado?: boolean | null
          atualizado_em?: string | null
          auditor_portal?: string | null
          codigo_autorizacao?: string | null
          criado_em?: string | null
          data_processamento?: string | null
          data_resposta?: string | null
          documentos_pendentes?: string[] | null
          documentos_urls?: string[] | null
          id?: string
          itens_aprovados_json?: Json | null
          itens_negados_json?: Json | null
          motivo_glosa?: string | null
          motivo_negacao?: string | null
          numero_autorizacao?: string | null
          numero_resposta?: string | null
          observacoes_internas?: string | null
          observacoes_portal?: string | null
          origem?: string | null
          parcialmente_aprovado?: boolean | null
          payload_resposta_json?: Json | null
          pendencias?: string[] | null
          prazo_regularizacao?: string | null
          processada?: boolean | null
          processada_por_id?: string | null
          responsavel_portal?: string | null
          solicitacao_id?: string
          tipo_resposta?: string
          validade_autorizacao?: string | null
          valor_aprovado?: number | null
          valor_glosa?: number | null
          valor_negado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_respostas_processada_por_id_fkey"
            columns: ["processada_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_respostas_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "portais_opme_solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      portais_opme_solicitacoes: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          cirurgia_id: string
          convenio_id: string | null
          criado_em: string | null
          criado_por: string | null
          data_cirurgia_prevista: string
          data_envio: string | null
          data_prazo_resposta: string | null
          data_resposta: string | null
          empresa_id: string
          enviado_por_id: string | null
          excluido_em: string | null
          hospital_id: string | null
          id: string
          laudo_medico_url: string | null
          materiais_json: Json
          medico_crm: string | null
          medico_id: string | null
          medico_nome: string
          metodo_envio: string | null
          motivo_cancelamento: string | null
          numero_interno: string
          numero_portal: string | null
          observacoes: string | null
          orcamento_url: string | null
          outros_documentos_urls: string[] | null
          paciente_carteirinha: string | null
          paciente_id: string | null
          paciente_nome: string
          pedido_medico_url: string | null
          portal_config_id: string
          procedimento: string
          protocolo_portal: string | null
          status: string | null
          urgencia: string | null
          valor_total_solicitado: number
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cirurgia_id: string
          convenio_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_cirurgia_prevista: string
          data_envio?: string | null
          data_prazo_resposta?: string | null
          data_resposta?: string | null
          empresa_id: string
          enviado_por_id?: string | null
          excluido_em?: string | null
          hospital_id?: string | null
          id?: string
          laudo_medico_url?: string | null
          materiais_json: Json
          medico_crm?: string | null
          medico_id?: string | null
          medico_nome: string
          metodo_envio?: string | null
          motivo_cancelamento?: string | null
          numero_interno: string
          numero_portal?: string | null
          observacoes?: string | null
          orcamento_url?: string | null
          outros_documentos_urls?: string[] | null
          paciente_carteirinha?: string | null
          paciente_id?: string | null
          paciente_nome: string
          pedido_medico_url?: string | null
          portal_config_id: string
          procedimento: string
          protocolo_portal?: string | null
          status?: string | null
          urgencia?: string | null
          valor_total_solicitado: number
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cirurgia_id?: string
          convenio_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_cirurgia_prevista?: string
          data_envio?: string | null
          data_prazo_resposta?: string | null
          data_resposta?: string | null
          empresa_id?: string
          enviado_por_id?: string | null
          excluido_em?: string | null
          hospital_id?: string | null
          id?: string
          laudo_medico_url?: string | null
          materiais_json?: Json
          medico_crm?: string | null
          medico_id?: string | null
          medico_nome?: string
          metodo_envio?: string | null
          motivo_cancelamento?: string | null
          numero_interno?: string
          numero_portal?: string | null
          observacoes?: string | null
          orcamento_url?: string | null
          outros_documentos_urls?: string[] | null
          paciente_carteirinha?: string | null
          paciente_id?: string | null
          paciente_nome?: string
          pedido_medico_url?: string | null
          portal_config_id?: string
          procedimento?: string
          protocolo_portal?: string | null
          status?: string | null
          urgencia?: string | null
          valor_total_solicitado?: number
        }
        Relationships: [
          {
            foreignKeyName: "portais_opme_solicitacoes_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_enviado_por_id_fkey"
            columns: ["enviado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "view_medicos_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portais_opme_solicitacoes_portal_config_id_fkey"
            columns: ["portal_config_id"]
            isOneToOne: false
            referencedRelation: "portais_opme_config"
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
          id?: string
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
      proposta_itens: {
        Row: {
          created_at: string | null
          custo_unitario: number | null
          fabricante: string | null
          id: string
          margem_unitaria_percentual: number | null
          origem: string | null
          preco_total: number
          preco_unitario: number
          produto_codigo: string
          produto_descricao: string
          proposta_id: string
          quantidade: number
          registro_anvisa: string | null
          unidade: string
        }
        Insert: {
          created_at?: string | null
          custo_unitario?: number | null
          fabricante?: string | null
          id?: string
          margem_unitaria_percentual?: number | null
          origem?: string | null
          preco_total: number
          preco_unitario: number
          produto_codigo: string
          produto_descricao: string
          proposta_id: string
          quantidade: number
          registro_anvisa?: string | null
          unidade: string
        }
        Update: {
          created_at?: string | null
          custo_unitario?: number | null
          fabricante?: string | null
          id?: string
          margem_unitaria_percentual?: number | null
          origem?: string | null
          preco_total?: number
          preco_unitario?: number
          produto_codigo?: string
          produto_descricao?: string
          proposta_id?: string
          quantidade?: number
          registro_anvisa?: string | null
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas_comerciais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "vw_propostas_pendentes"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          aprovada_por_id: string | null
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_cnpj: string | null
          cliente_contato: string | null
          cliente_nome: string
          condicoes_pagamento: string | null
          criado_em: string | null
          criado_por: string | null
          data_envio: string | null
          data_resposta: string | null
          data_validade: string | null
          descricao: string | null
          elaborada_por_id: string
          empresa_id: string
          excluido_em: string | null
          garantia: string | null
          id: string
          motivo_rejeicao: string | null
          numero: string
          observacoes_cliente: string | null
          observacoes_internas: string | null
          oportunidade_id: string | null
          pdf_url: string | null
          prazo_entrega: string | null
          status: string | null
          template_usado: string | null
          titulo: string
          validade_dias: number | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_impostos: number | null
          valor_liquido: number | null
          valor_produtos: number | null
          valor_servicos: number | null
          valor_total: number
          versao: number | null
        }
        Insert: {
          aprovada_por_id?: string | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_cnpj?: string | null
          cliente_contato?: string | null
          cliente_nome: string
          condicoes_pagamento?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_envio?: string | null
          data_resposta?: string | null
          data_validade?: string | null
          descricao?: string | null
          elaborada_por_id: string
          empresa_id: string
          excluido_em?: string | null
          garantia?: string | null
          id?: string
          motivo_rejeicao?: string | null
          numero: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          oportunidade_id?: string | null
          pdf_url?: string | null
          prazo_entrega?: string | null
          status?: string | null
          template_usado?: string | null
          titulo: string
          validade_dias?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_impostos?: number | null
          valor_liquido?: number | null
          valor_produtos?: number | null
          valor_servicos?: number | null
          valor_total: number
          versao?: number | null
        }
        Update: {
          aprovada_por_id?: string | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_cnpj?: string | null
          cliente_contato?: string | null
          cliente_nome?: string
          condicoes_pagamento?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_envio?: string | null
          data_resposta?: string | null
          data_validade?: string | null
          descricao?: string | null
          elaborada_por_id?: string
          empresa_id?: string
          excluido_em?: string | null
          garantia?: string | null
          id?: string
          motivo_rejeicao?: string | null
          numero?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          oportunidade_id?: string | null
          pdf_url?: string | null
          prazo_entrega?: string | null
          status?: string | null
          template_usado?: string | null
          titulo?: string
          validade_dias?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_impostos?: number | null
          valor_liquido?: number | null
          valor_produtos?: number | null
          valor_servicos?: number | null
          valor_total?: number
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_aprovada_por_id_fkey"
            columns: ["aprovada_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_elaborada_por_id_fkey"
            columns: ["elaborada_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "propostas_comerciais_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_licitacoes_ativas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_cotacao: {
        Row: {
          condicoes_pagamento: string | null
          cotacao_fornecedor_id: string
          created_at: string | null
          id: string
          item_cotacao_id: string
          observacoes: string | null
          prazo_entrega: number | null
          preco_unitario: number
          quantidade_disponivel: number | null
          validade_proposta: string | null
        }
        Insert: {
          condicoes_pagamento?: string | null
          cotacao_fornecedor_id: string
          created_at?: string | null
          id?: string
          item_cotacao_id: string
          observacoes?: string | null
          prazo_entrega?: number | null
          preco_unitario: number
          quantidade_disponivel?: number | null
          validade_proposta?: string | null
        }
        Update: {
          condicoes_pagamento?: string | null
          cotacao_fornecedor_id?: string
          created_at?: string | null
          id?: string
          item_cotacao_id?: string
          observacoes?: string | null
          prazo_entrega?: number | null
          preco_unitario?: number
          quantidade_disponivel?: number | null
          validade_proposta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cotacao_cotacao_fornecedor_id_fkey"
            columns: ["cotacao_fornecedor_id"]
            isOneToOne: false
            referencedRelation: "cotacoes_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cotacao_item_cotacao_id_fkey"
            columns: ["item_cotacao_id"]
            isOneToOne: false
            referencedRelation: "itens_cotacao"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_licitacao: {
        Row: {
          amostras_urls: string[] | null
          atualizado_em: string | null
          atualizado_por: string | null
          classificacao: number | null
          condicoes_pagamento: string | null
          criado_em: string | null
          criado_por: string | null
          data_elaboracao: string | null
          data_envio: string | null
          desconto_percentual: number | null
          documentos_habilitacao_urls: string[] | null
          elaborada_por_id: string
          empresa_id: string
          estrategia: string | null
          excluido_em: string | null
          fase: string | null
          id: string
          itens_propostos_json: Json
          lance_final: number | null
          lance_inicial: number | null
          licitacao_id: string
          metodo_envio: string | null
          motivo_desclassificacao: string | null
          motivo_inabilitacao: string | null
          numero_proposta: string
          observacoes: string | null
          percentual_garantia: number | null
          pontuacao_comercial: number | null
          pontuacao_final: number | null
          pontuacao_tecnica: number | null
          prazo_entrega_dias: number | null
          proposta_comercial_url: string | null
          proposta_tecnica_url: string | null
          protocolo_envio: string | null
          status: string | null
          tipo: string
          total_lances: number | null
          validade_proposta_dias: number | null
          valor_total_proposta: number
          versao: number | null
        }
        Insert: {
          amostras_urls?: string[] | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          classificacao?: number | null
          condicoes_pagamento?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_elaboracao?: string | null
          data_envio?: string | null
          desconto_percentual?: number | null
          documentos_habilitacao_urls?: string[] | null
          elaborada_por_id: string
          empresa_id: string
          estrategia?: string | null
          excluido_em?: string | null
          fase?: string | null
          id?: string
          itens_propostos_json: Json
          lance_final?: number | null
          lance_inicial?: number | null
          licitacao_id: string
          metodo_envio?: string | null
          motivo_desclassificacao?: string | null
          motivo_inabilitacao?: string | null
          numero_proposta: string
          observacoes?: string | null
          percentual_garantia?: number | null
          pontuacao_comercial?: number | null
          pontuacao_final?: number | null
          pontuacao_tecnica?: number | null
          prazo_entrega_dias?: number | null
          proposta_comercial_url?: string | null
          proposta_tecnica_url?: string | null
          protocolo_envio?: string | null
          status?: string | null
          tipo: string
          total_lances?: number | null
          validade_proposta_dias?: number | null
          valor_total_proposta: number
          versao?: number | null
        }
        Update: {
          amostras_urls?: string[] | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          classificacao?: number | null
          condicoes_pagamento?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_elaboracao?: string | null
          data_envio?: string | null
          desconto_percentual?: number | null
          documentos_habilitacao_urls?: string[] | null
          elaborada_por_id?: string
          empresa_id?: string
          estrategia?: string | null
          excluido_em?: string | null
          fase?: string | null
          id?: string
          itens_propostos_json?: Json
          lance_final?: number | null
          lance_inicial?: number | null
          licitacao_id?: string
          metodo_envio?: string | null
          motivo_desclassificacao?: string | null
          motivo_inabilitacao?: string | null
          numero_proposta?: string
          observacoes?: string | null
          percentual_garantia?: number | null
          pontuacao_comercial?: number | null
          pontuacao_final?: number | null
          pontuacao_tecnica?: number | null
          prazo_entrega_dias?: number | null
          proposta_comercial_url?: string | null
          proposta_tecnica_url?: string | null
          protocolo_envio?: string | null
          status?: string | null
          tipo?: string
          total_lances?: number | null
          validade_proposta_dias?: number | null
          valor_total_proposta?: number
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_licitacao_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_licitacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_licitacao_elaborada_por_id_fkey"
            columns: ["elaborada_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_licitacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_licitacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "propostas_licitacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_licitacao_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_licitacao_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_licitacoes_ativas"
            referencedColumns: ["id"]
          },
        ]
      }
      rastreabilidade_opme_compliance: {
        Row: {
          certificado_transporte: string | null
          cirurgia_id: string | null
          codigo_anvisa: string | null
          compliance_abbott: boolean | null
          compliance_anvisa: boolean | null
          created_at: string | null
          data_entrada: string
          data_saida: string | null
          datalogger_numero: string | null
          fabricante: string
          hospital_destino: string | null
          hospital_destino_id: string | null
          id: string
          lote: string
          notificacao_anvisa_enviada: boolean | null
          notificacao_fabricante_enviada: boolean | null
          numero_serie: string | null
          paciente_id: string | null
          produto_id: string | null
          produto_nome: string
          rastreamento_completo: boolean | null
          responsavel_armazenamento: string | null
          status: string
          temperatura_armazenamento: number | null
          umidade_armazenamento: number | null
          updated_at: string | null
          validade: string
        }
        Insert: {
          certificado_transporte?: string | null
          cirurgia_id?: string | null
          codigo_anvisa?: string | null
          compliance_abbott?: boolean | null
          compliance_anvisa?: boolean | null
          created_at?: string | null
          data_entrada: string
          data_saida?: string | null
          datalogger_numero?: string | null
          fabricante: string
          hospital_destino?: string | null
          hospital_destino_id?: string | null
          id?: string
          lote: string
          notificacao_anvisa_enviada?: boolean | null
          notificacao_fabricante_enviada?: boolean | null
          numero_serie?: string | null
          paciente_id?: string | null
          produto_id?: string | null
          produto_nome: string
          rastreamento_completo?: boolean | null
          responsavel_armazenamento?: string | null
          status: string
          temperatura_armazenamento?: number | null
          umidade_armazenamento?: number | null
          updated_at?: string | null
          validade: string
        }
        Update: {
          certificado_transporte?: string | null
          cirurgia_id?: string | null
          codigo_anvisa?: string | null
          compliance_abbott?: boolean | null
          compliance_anvisa?: boolean | null
          created_at?: string | null
          data_entrada?: string
          data_saida?: string | null
          datalogger_numero?: string | null
          fabricante?: string
          hospital_destino?: string | null
          hospital_destino_id?: string | null
          id?: string
          lote?: string
          notificacao_anvisa_enviada?: boolean | null
          notificacao_fabricante_enviada?: boolean | null
          numero_serie?: string | null
          paciente_id?: string | null
          produto_id?: string | null
          produto_nome?: string
          rastreamento_completo?: boolean | null
          responsavel_armazenamento?: string | null
          status?: string
          temperatura_armazenamento?: number | null
          umidade_armazenamento?: number | null
          updated_at?: string | null
          validade?: string
        }
        Relationships: [
          {
            foreignKeyName: "rastreabilidade_opme_compliance_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreabilidade_opme_compliance_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreabilidade_opme_compliance_hospital_destino_id_fkey"
            columns: ["hospital_destino_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreabilidade_opme_compliance_hospital_destino_id_fkey"
            columns: ["hospital_destino_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "rastreabilidade_opme_compliance_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_opme"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          blocked_until: string | null
          id: string
          ip_address: unknown
          is_blocked: boolean | null
          max_requests_per_minute: number | null
          request_count: number | null
          route: string
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          id?: string
          ip_address?: unknown
          is_blocked?: boolean | null
          max_requests_per_minute?: number | null
          request_count?: number | null
          route: string
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          id?: string
          ip_address?: unknown
          is_blocked?: boolean | null
          max_requests_per_minute?: number | null
          request_count?: number | null
          route?: string
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      relatorios_agendamentos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          cron_expressao: string
          descricao: string | null
          destinatarios_emails: string[] | null
          destinatarios_ids: string[] | null
          empresa_id: string
          id: string
          nome: string
          parametros_json: Json | null
          proxima_execucao: string | null
          template_id: string
          timezone: string | null
          total_execucoes: number | null
          ultima_execucao: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          cron_expressao: string
          descricao?: string | null
          destinatarios_emails?: string[] | null
          destinatarios_ids?: string[] | null
          empresa_id: string
          id?: string
          nome: string
          parametros_json?: Json | null
          proxima_execucao?: string | null
          template_id: string
          timezone?: string | null
          total_execucoes?: number | null
          ultima_execucao?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          cron_expressao?: string
          descricao?: string | null
          destinatarios_emails?: string[] | null
          destinatarios_ids?: string[] | null
          empresa_id?: string
          id?: string
          nome?: string
          parametros_json?: Json | null
          proxima_execucao?: string | null
          template_id?: string
          timezone?: string | null
          total_execucoes?: number | null
          ultima_execucao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_agendamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_agendamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "relatorios_agendamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_regulatorios: {
        Row: {
          arquivo_hash: string | null
          arquivo_url: string | null
          atualizado_em: string | null
          codigo: string
          criado_em: string | null
          dados_json: Json | null
          empresa_id: string
          enviado_em: string | null
          gerado_em: string | null
          gerado_por_id: string | null
          id: string
          nome: string
          observacoes: string | null
          periodicidade: string | null
          periodo_fim: string
          periodo_inicio: string
          protocolo_envio: string | null
          status: string | null
          template_id: string | null
          tipo: string
        }
        Insert: {
          arquivo_hash?: string | null
          arquivo_url?: string | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          dados_json?: Json | null
          empresa_id: string
          enviado_em?: string | null
          gerado_em?: string | null
          gerado_por_id?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          periodicidade?: string | null
          periodo_fim: string
          periodo_inicio: string
          protocolo_envio?: string | null
          status?: string | null
          template_id?: string | null
          tipo: string
        }
        Update: {
          arquivo_hash?: string | null
          arquivo_url?: string | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          dados_json?: Json | null
          empresa_id?: string
          enviado_em?: string | null
          gerado_em?: string | null
          gerado_por_id?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          periodicidade?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          protocolo_envio?: string | null
          status?: string | null
          template_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_regulatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_regulatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "relatorios_regulatorios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_regulatorios_gerado_por_id_fkey"
            columns: ["gerado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_templates: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string
          configuracao_json: Json | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          formato: string | null
          id: string
          nome: string
          query_sql: string | null
          sistema: boolean | null
          template_conteudo: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          configuracao_json?: Json | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          formato?: string | null
          id?: string
          nome: string
          query_sql?: string | null
          sistema?: boolean | null
          template_conteudo?: string | null
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          configuracao_json?: Json | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          formato?: string | null
          id?: string
          nome?: string
          query_sql?: string | null
          sistema?: boolean | null
          template_conteudo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_templates_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_templates_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "relatorios_templates_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      remessas_consignacao: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          cirurgia_id: string | null
          condicoes_especiais: string | null
          contrato_consignacao_id: string
          criado_em: string | null
          criado_por: string | null
          data_entrega_prevista: string
          data_entrega_realizada: string | null
          data_remessa: string | null
          data_vencimento_devolucao: string | null
          empresa_id: string
          endereco_entrega: string | null
          excluido_em: string | null
          fornecedor_id: string
          hospital_id: string | null
          id: string
          local_destino: string
          medico_id: string | null
          nota_fiscal_id: string | null
          numero: string
          observacoes: string | null
          rastreamento: string | null
          responsavel_envio_id: string | null
          responsavel_recebimento: string | null
          status: string | null
          tipo: string | null
          transportadora: string | null
          valor_frete: number | null
          valor_total: number | null
          valor_total_materiais: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cirurgia_id?: string | null
          condicoes_especiais?: string | null
          contrato_consignacao_id: string
          criado_em?: string | null
          criado_por?: string | null
          data_entrega_prevista: string
          data_entrega_realizada?: string | null
          data_remessa?: string | null
          data_vencimento_devolucao?: string | null
          empresa_id: string
          endereco_entrega?: string | null
          excluido_em?: string | null
          fornecedor_id: string
          hospital_id?: string | null
          id?: string
          local_destino: string
          medico_id?: string | null
          nota_fiscal_id?: string | null
          numero: string
          observacoes?: string | null
          rastreamento?: string | null
          responsavel_envio_id?: string | null
          responsavel_recebimento?: string | null
          status?: string | null
          tipo?: string | null
          transportadora?: string | null
          valor_frete?: number | null
          valor_total?: number | null
          valor_total_materiais?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cirurgia_id?: string | null
          condicoes_especiais?: string | null
          contrato_consignacao_id?: string
          criado_em?: string | null
          criado_por?: string | null
          data_entrega_prevista?: string
          data_entrega_realizada?: string | null
          data_remessa?: string | null
          data_vencimento_devolucao?: string | null
          empresa_id?: string
          endereco_entrega?: string | null
          excluido_em?: string | null
          fornecedor_id?: string
          hospital_id?: string | null
          id?: string
          local_destino?: string
          medico_id?: string | null
          nota_fiscal_id?: string | null
          numero?: string
          observacoes?: string | null
          rastreamento?: string | null
          responsavel_envio_id?: string | null
          responsavel_recebimento?: string | null
          status?: string | null
          tipo?: string | null
          transportadora?: string | null
          valor_frete?: number | null
          valor_total?: number | null
          valor_total_materiais?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "remessas_consignacao_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_contrato_consignacao_id_fkey"
            columns: ["contrato_consignacao_id"]
            isOneToOne: false
            referencedRelation: "contratos_consignacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "remessas_consignacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "remessas_consignacao_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "view_medicos_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remessas_consignacao_responsavel_envio_id_fkey"
            columns: ["responsavel_envio_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      reunioes_teams: {
        Row: {
          assunto: string
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          entidade_id: string | null
          entidade_nome: string | null
          entidade_tipo: string | null
          evento_id: string
          id: string
          link_reuniao: string | null
          motivo_cancelamento: string | null
          organizador: string | null
          participantes: Json | null
          status: string | null
          tipo_reuniao: string | null
          updated_at: string | null
          usuario_criacao: string
        }
        Insert: {
          assunto: string
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          entidade_id?: string | null
          entidade_nome?: string | null
          entidade_tipo?: string | null
          evento_id: string
          id?: string
          link_reuniao?: string | null
          motivo_cancelamento?: string | null
          organizador?: string | null
          participantes?: Json | null
          status?: string | null
          tipo_reuniao?: string | null
          updated_at?: string | null
          usuario_criacao: string
        }
        Update: {
          assunto?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          entidade_id?: string | null
          entidade_nome?: string | null
          entidade_tipo?: string | null
          evento_id?: string
          id?: string
          link_reuniao?: string | null
          motivo_cancelamento?: string | null
          organizador?: string | null
          participantes?: Json | null
          status?: string | null
          tipo_reuniao?: string | null
          updated_at?: string | null
          usuario_criacao?: string
        }
        Relationships: []
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
          is_active: boolean | null
          nivel: number | null
          nivel_hierarquia: number | null
          nome: string
          sistema: boolean | null
          tipo_role: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          is_active?: boolean | null
          nivel?: number | null
          nivel_hierarquia?: number | null
          nome: string
          sistema?: boolean | null
          tipo_role?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          is_active?: boolean | null
          nivel?: number | null
          nivel_hierarquia?: number | null
          nome?: string
          sistema?: boolean | null
          tipo_role?: string | null
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
      solicitacoes_compra: {
        Row: {
          aprovador_id: string | null
          created_at: string | null
          created_by: string | null
          data_aprovacao: string | null
          departamento: string | null
          empresa_id: string
          id: string
          justificativa: string | null
          motivo_rejeicao: string | null
          numero: string
          observacoes: string | null
          solicitante_id: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
          urgencia: string | null
        }
        Insert: {
          aprovador_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          departamento?: string | null
          empresa_id: string
          id?: string
          justificativa?: string | null
          motivo_rejeicao?: string | null
          numero: string
          observacoes?: string | null
          solicitante_id: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          urgencia?: string | null
        }
        Update: {
          aprovador_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          departamento?: string | null
          empresa_id?: string
          id?: string
          justificativa?: string | null
          motivo_rejeicao?: string | null
          numero?: string
          observacoes?: string | null
          solicitante_id?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_compra_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_compra_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "solicitacoes_compra_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_compra_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_compra_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          acao_sugerida: string | null
          criado_em: string | null
          dados: Json | null
          descricao: string
          destinatarios: string[] | null
          id: string
          lido: boolean | null
          modulo: string | null
          notificado: boolean | null
          resolvido: boolean | null
          severidade: string
          tipo: string
          titulo: string
          usuario_afetado_id: string | null
        }
        Insert: {
          acao_sugerida?: string | null
          criado_em?: string | null
          dados?: Json | null
          descricao: string
          destinatarios?: string[] | null
          id?: string
          lido?: boolean | null
          modulo?: string | null
          notificado?: boolean | null
          resolvido?: boolean | null
          severidade: string
          tipo: string
          titulo: string
          usuario_afetado_id?: string | null
        }
        Update: {
          acao_sugerida?: string | null
          criado_em?: string | null
          dados?: Json | null
          descricao?: string
          destinatarios?: string[] | null
          id?: string
          lido?: boolean | null
          modulo?: string | null
          notificado?: boolean | null
          resolvido?: boolean | null
          severidade?: string
          tipo?: string
          titulo?: string
          usuario_afetado_id?: string | null
        }
        Relationships: []
      }
      system_errors: {
        Row: {
          contexto: Json | null
          criado_em: string | null
          id: string
          impacto: string | null
          mensagem: string
          modulo: string
          notas_resolucao: string | null
          notificado_admin: boolean | null
          notificado_ceo: boolean | null
          resolvido: boolean | null
          resolvido_em: string | null
          resolvido_por: string | null
          severidade: string
          solucao_sugerida: string | null
          stack_trace: string | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          contexto?: Json | null
          criado_em?: string | null
          id?: string
          impacto?: string | null
          mensagem: string
          modulo: string
          notas_resolucao?: string | null
          notificado_admin?: boolean | null
          notificado_ceo?: boolean | null
          resolvido?: boolean | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade: string
          solucao_sugerida?: string | null
          stack_trace?: string | null
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          contexto?: Json | null
          criado_em?: string | null
          id?: string
          impacto?: string | null
          mensagem?: string
          modulo?: string
          notas_resolucao?: string | null
          notificado_admin?: boolean | null
          notificado_ceo?: boolean | null
          resolvido?: boolean | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade?: string
          solucao_sugerida?: string | null
          stack_trace?: string | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          categoria: string
          coletado_em: string | null
          criado_em: string | null
          detalhes_json: Json | null
          id: string
          metrica: string
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
          unidade: string | null
          valor: number
        }
        Insert: {
          categoria: string
          coletado_em?: string | null
          criado_em?: string | null
          detalhes_json?: Json | null
          id?: string
          metrica: string
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          unidade?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          coletado_em?: string | null
          criado_em?: string | null
          detalhes_json?: Json | null
          id?: string
          metrica?: string
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          unidade?: string | null
          valor?: number
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          categoria: string | null
          contexto_json: Json | null
          criado_em: string | null
          duracao_ms: number | null
          id: string
          ip_address: unknown
          mensagem: string
          metodo: string | null
          nivel: string
          request_id: string | null
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          categoria?: string | null
          contexto_json?: Json | null
          criado_em?: string | null
          duracao_ms?: number | null
          id?: string
          ip_address?: unknown
          mensagem: string
          metodo?: string | null
          nivel: string
          request_id?: string | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          categoria?: string | null
          contexto_json?: Json | null
          criado_em?: string | null
          duracao_ms?: number | null
          id?: string
          ip_address?: unknown
          mensagem?: string
          metodo?: string | null
          nivel?: string
          request_id?: string | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tabelas_precos: {
        Row: {
          aplicar_automatico: boolean | null
          aprovado_por: string | null
          atualizado_em: string | null
          codigo: string | null
          contrato_numero: string | null
          convenio_id: string | null
          criado_em: string | null
          criado_por: string | null
          data_aprovacao: string | null
          data_fim: string | null
          data_inicio: string
          desconto_percentual: number | null
          descricao: string | null
          empresa_id: string
          excluido_em: string | null
          fornecedor_id: string | null
          hospital_id: string | null
          id: string
          margem_percentual: number | null
          nome: string
          prioridade: number | null
          status: string | null
          tipo: string
          total_itens: number | null
          valor_total_estimado: number | null
        }
        Insert: {
          aplicar_automatico?: boolean | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          codigo?: string | null
          contrato_numero?: string | null
          convenio_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_aprovacao?: string | null
          data_fim?: string | null
          data_inicio: string
          desconto_percentual?: number | null
          descricao?: string | null
          empresa_id: string
          excluido_em?: string | null
          fornecedor_id?: string | null
          hospital_id?: string | null
          id?: string
          margem_percentual?: number | null
          nome: string
          prioridade?: number | null
          status?: string | null
          tipo?: string
          total_itens?: number | null
          valor_total_estimado?: number | null
        }
        Update: {
          aplicar_automatico?: boolean | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          codigo?: string | null
          contrato_numero?: string | null
          convenio_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_aprovacao?: string | null
          data_fim?: string | null
          data_inicio?: string
          desconto_percentual?: number | null
          descricao?: string | null
          empresa_id?: string
          excluido_em?: string | null
          fornecedor_id?: string | null
          hospital_id?: string | null
          id?: string
          margem_percentual?: number | null
          nome?: string
          prioridade?: number | null
          status?: string | null
          tipo?: string
          total_itens?: number | null
          valor_total_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tabelas_precos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "tabelas_precos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
          },
        ]
      }
      tabelas_precos_itens: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          id: string
          margem_percentual: number | null
          margem_valor: number | null
          observacoes: string | null
          preco_base: number
          preco_custo: number | null
          preco_final: number
          produto_id: string
          quantidade_maxima: number | null
          quantidade_minima: number | null
          tabela_preco_id: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          id?: string
          margem_percentual?: number | null
          margem_valor?: number | null
          observacoes?: string | null
          preco_base: number
          preco_custo?: number | null
          preco_final: number
          produto_id: string
          quantidade_maxima?: number | null
          quantidade_minima?: number | null
          tabela_preco_id: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          id?: string
          margem_percentual?: number | null
          margem_valor?: number | null
          observacoes?: string | null
          preco_base?: number
          preco_custo?: number | null
          preco_final?: number
          produto_id?: string
          quantidade_maxima?: number | null
          quantidade_minima?: number | null
          tabela_preco_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tabelas_precos_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tabelas_precos_itens_tabela_preco_id_fkey"
            columns: ["tabela_preco_id"]
            isOneToOne: false
            referencedRelation: "tabelas_precos"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          categoria: string | null
          cor: string | null
          criado_em: string | null
          criado_por_id: string | null
          descricao: string | null
          empresa_id: string
          entidade_id: string | null
          entidade_tipo: string | null
          id: string
          nome: string
          uso_count: number | null
        }
        Insert: {
          categoria?: string | null
          cor?: string | null
          criado_em?: string | null
          criado_por_id?: string | null
          descricao?: string | null
          empresa_id: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          nome: string
          uso_count?: number | null
        }
        Update: {
          categoria?: string | null
          cor?: string | null
          criado_em?: string | null
          criado_por_id?: string | null
          descricao?: string | null
          empresa_id?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          nome?: string
          uso_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "tags_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
        Row: {
          anexo_url: string | null
          atualizado_em: string | null
          categoria: string
          cirurgia_id: string | null
          convenio_id: string | null
          created_at: string | null
          criado_em: string | null
          data: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em: string | null
          forma_pagamento: string | null
          hospital_id: string | null
          id: string
          medico_id: string | null
          observacoes: string | null
          status: string | null
          status_en: string | null
          tipo: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          anexo_url?: string | null
          atualizado_em?: string | null
          categoria: string
          cirurgia_id?: string | null
          convenio_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          data?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          hospital_id?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          status?: string | null
          status_en?: string | null
          tipo: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          anexo_url?: string | null
          atualizado_em?: string | null
          categoria?: string
          cirurgia_id?: string | null
          convenio_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          data?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          empresa_id?: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          hospital_id?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          status?: string | null
          status_en?: string | null
          tipo?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "cirurgias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_cirurgia_id_fkey"
            columns: ["cirurgia_id"]
            isOneToOne: false
            referencedRelation: "vw_cirurgias_segura"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "transacoes_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
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
      transportadoras: {
        Row: {
          api_auth_type: string | null
          api_token: string | null
          api_url: string | null
          ativo: boolean | null
          avaliacao: number | null
          cnpj: string | null
          created_at: string | null
          created_by: string | null
          custo_km: number | null
          email: string | null
          empresa_id: string
          endereco: Json | null
          horario_coleta: string | null
          id: string
          nome: string
          observacoes: string | null
          possui_api: boolean | null
          prazo_entrega_medio: number | null
          raio_atendimento: number | null
          site: string | null
          telefone: string | null
          tipo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          api_auth_type?: string | null
          api_token?: string | null
          api_url?: string | null
          ativo?: boolean | null
          avaliacao?: number | null
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          custo_km?: number | null
          email?: string | null
          empresa_id: string
          endereco?: Json | null
          horario_coleta?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          possui_api?: boolean | null
          prazo_entrega_medio?: number | null
          raio_atendimento?: number | null
          site?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          api_auth_type?: string | null
          api_token?: string | null
          api_url?: string | null
          ativo?: boolean | null
          avaliacao?: number | null
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          custo_km?: number | null
          email?: string | null
          empresa_id?: string
          endereco?: Json | null
          horario_coleta?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          possui_api?: boolean | null
          prazo_entrega_medio?: number | null
          raio_atendimento?: number | null
          site?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportadoras_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportadoras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportadoras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "transportadoras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportadoras_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamentos_certificacoes: {
        Row: {
          avaliacao_final: boolean | null
          categoria: string
          certificado_emitido: boolean | null
          codigo: string
          conteudo_programatico: string[] | null
          created_at: string | null
          data_realizacao: string
          duracao_horas: number
          fabricante: string | null
          id: string
          instrutor: string | null
          modalidade: string
          nota_minima_aprovacao: number | null
          status: string | null
          tipo: string
          titulo: string
          total_aprovados: number | null
          total_participantes: number | null
          total_reprovados: number | null
          updated_at: string | null
          validade_certificado_meses: number | null
        }
        Insert: {
          avaliacao_final?: boolean | null
          categoria: string
          certificado_emitido?: boolean | null
          codigo: string
          conteudo_programatico?: string[] | null
          created_at?: string | null
          data_realizacao: string
          duracao_horas: number
          fabricante?: string | null
          id?: string
          instrutor?: string | null
          modalidade: string
          nota_minima_aprovacao?: number | null
          status?: string | null
          tipo: string
          titulo: string
          total_aprovados?: number | null
          total_participantes?: number | null
          total_reprovados?: number | null
          updated_at?: string | null
          validade_certificado_meses?: number | null
        }
        Update: {
          avaliacao_final?: boolean | null
          categoria?: string
          certificado_emitido?: boolean | null
          codigo?: string
          conteudo_programatico?: string[] | null
          created_at?: string | null
          data_realizacao?: string
          duracao_horas?: number
          fabricante?: string | null
          id?: string
          instrutor?: string | null
          modalidade?: string
          nota_minima_aprovacao?: number | null
          status?: string | null
          tipo?: string
          titulo?: string
          total_aprovados?: number | null
          total_participantes?: number | null
          total_reprovados?: number | null
          updated_at?: string | null
          validade_certificado_meses?: number | null
        }
        Relationships: []
      }
      tutor_logs: {
        Row: {
          criado_em: string | null
          feedback: number | null
          id: string
          modulo: string
          pergunta: string
          resposta: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          feedback?: number | null
          id?: string
          modulo: string
          pergunta: string
          resposta: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          feedback?: number | null
          id?: string
          modulo?: string
          pergunta?: string
          resposta?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          enabled_at: string | null
          is_enabled: boolean | null
          last_used_at: string | null
          secret: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          enabled_at?: string | null
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          enabled_at?: string | null
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          acao: string
          criado_em: string | null
          dados_entrada: Json | null
          dados_saida: Json | null
          dispositivo: string | null
          erro_mensagem: string | null
          erro_stack: string | null
          id: string
          ip_address: unknown
          localizacao: string | null
          metodo: string | null
          modulo: string
          rota: string | null
          sub_modulo: string | null
          sucesso: boolean | null
          tempo_execucao: number | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          dados_entrada?: Json | null
          dados_saida?: Json | null
          dispositivo?: string | null
          erro_mensagem?: string | null
          erro_stack?: string | null
          id?: string
          ip_address?: unknown
          localizacao?: string | null
          metodo?: string | null
          modulo: string
          rota?: string | null
          sub_modulo?: string | null
          sucesso?: boolean | null
          tempo_execucao?: number | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          dados_entrada?: Json | null
          dados_saida?: Json | null
          dispositivo?: string | null
          erro_mensagem?: string | null
          erro_stack?: string | null
          id?: string
          ip_address?: unknown
          localizacao?: string | null
          metodo?: string | null
          modulo?: string
          rota?: string | null
          sub_modulo?: string | null
          sucesso?: boolean | null
          tempo_execucao?: number | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      user_behavior_profile: {
        Row: {
          acoes_mais_frequentes: Json | null
          atualizado_em: string | null
          criado_em: string | null
          dias_semana_ativos: Json | null
          funcionalidades_com_dificuldade: string[] | null
          funcionalidades_dominadas: string[] | null
          horarios_ativos: Json | null
          id: string
          modulos_mais_usados: Json | null
          taxa_erro_geral: number | null
          tempo_medio_por_modulo: Json | null
          total_atividades: number | null
          total_erros: number | null
          ultima_atividade: string | null
          usuario_id: string | null
        }
        Insert: {
          acoes_mais_frequentes?: Json | null
          atualizado_em?: string | null
          criado_em?: string | null
          dias_semana_ativos?: Json | null
          funcionalidades_com_dificuldade?: string[] | null
          funcionalidades_dominadas?: string[] | null
          horarios_ativos?: Json | null
          id?: string
          modulos_mais_usados?: Json | null
          taxa_erro_geral?: number | null
          tempo_medio_por_modulo?: Json | null
          total_atividades?: number | null
          total_erros?: number | null
          ultima_atividade?: string | null
          usuario_id?: string | null
        }
        Update: {
          acoes_mais_frequentes?: Json | null
          atualizado_em?: string | null
          criado_em?: string | null
          dias_semana_ativos?: Json | null
          funcionalidades_com_dificuldade?: string[] | null
          funcionalidades_dominadas?: string[] | null
          horarios_ativos?: Json | null
          id?: string
          modulos_mais_usados?: Json | null
          taxa_erro_geral?: number | null
          tempo_medio_por_modulo?: Json | null
          total_atividades?: number | null
          total_erros?: number | null
          ultima_atividade?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      user_handovers: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string
          documentacao_gerada_url: string | null
          id: string
          instrucoes_especiais: string | null
          modulos_transferidos: string[] | null
          motivo: string
          responsabilidades_transferidas: string[] | null
          status: string | null
          usuario_sainte_id: string | null
          usuario_substituto_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio: string
          documentacao_gerada_url?: string | null
          id?: string
          instrucoes_especiais?: string | null
          modulos_transferidos?: string[] | null
          motivo: string
          responsabilidades_transferidas?: string[] | null
          status?: string | null
          usuario_sainte_id?: string | null
          usuario_substituto_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          documentacao_gerada_url?: string | null
          id?: string
          instrucoes_especiais?: string | null
          modulos_transferidos?: string[] | null
          motivo?: string
          responsabilidades_transferidas?: string[] | null
          status?: string | null
          usuario_sainte_id?: string | null
          usuario_substituto_id?: string | null
        }
        Relationships: []
      }
      user_permissions_override: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          motivo: string
          permission_id: string
          tipo_override: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          motivo: string
          permission_id: string
          tipo_override: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          motivo?: string
          permission_id?: string
          tipo_override?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_override_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          ativo: boolean | null
          atribuido_em: string | null
          atribuido_por_id: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          is_active: boolean | null
          role_id: string
          updated_at: string | null
          user_id: string | null
          usuario_id: string
          valid_until: string | null
        }
        Insert: {
          assigned_by?: string | null
          ativo?: boolean | null
          atribuido_em?: string | null
          atribuido_por_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          is_active?: boolean | null
          role_id: string
          updated_at?: string | null
          user_id?: string | null
          usuario_id: string
          valid_until?: string | null
        }
        Update: {
          assigned_by?: string | null
          ativo?: boolean | null
          atribuido_em?: string | null
          atribuido_por_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string
          updated_at?: string | null
          user_id?: string | null
          usuario_id?: string
          valid_until?: string | null
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
      user_sessions: {
        Row: {
          acoes_realizadas: number | null
          dispositivo: string | null
          duracao: number | null
          id: string
          inicio_em: string | null
          ip_address: unknown
          localizacao: string | null
          navegador: string | null
          paginas_visitadas: number | null
          session_token: string | null
          sistema_operacional: string | null
          termino_em: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acoes_realizadas?: number | null
          dispositivo?: string | null
          duracao?: number | null
          id?: string
          inicio_em?: string | null
          ip_address?: unknown
          localizacao?: string | null
          navegador?: string | null
          paginas_visitadas?: number | null
          session_token?: string | null
          sistema_operacional?: string | null
          termino_em?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acoes_realizadas?: number | null
          dispositivo?: string | null
          duracao?: number | null
          id?: string
          inicio_em?: string | null
          ip_address?: unknown
          localizacao?: string | null
          navegador?: string | null
          paginas_visitadas?: number | null
          session_token?: string | null
          sistema_operacional?: string | null
          termino_em?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      user_training: {
        Row: {
          concluido: boolean | null
          concluido_em: string | null
          criado_em: string | null
          id: string
          licao: string
          modulo: string
          pontuacao: number | null
          tempo_gasto: number | null
          tentativas: number | null
          tipo: string | null
          ultima_tentativa: string | null
          usuario_id: string | null
        }
        Insert: {
          concluido?: boolean | null
          concluido_em?: string | null
          criado_em?: string | null
          id?: string
          licao: string
          modulo: string
          pontuacao?: number | null
          tempo_gasto?: number | null
          tentativas?: number | null
          tipo?: string | null
          ultima_tentativa?: string | null
          usuario_id?: string | null
        }
        Update: {
          concluido?: boolean | null
          concluido_em?: string | null
          criado_em?: string | null
          id?: string
          licao?: string
          modulo?: string
          pontuacao?: number | null
          tempo_gasto?: number | null
          tentativas?: number | null
          tipo?: string | null
          ultima_tentativa?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          avatar_url: string | null
          cargo: string | null
          criado_em: string | null
          email: string
          email_verificado: boolean | null
          empresa_id: string
          excluido_em: string | null
          id: string
          nome_completo: string | null
          perfil: string | null
          role: string | null
          senha_hash: string | null
          ultimo_login: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          email: string
          email_verificado?: boolean | null
          empresa_id: string
          excluido_em?: string | null
          id?: string
          nome_completo?: string | null
          perfil?: string | null
          role?: string | null
          senha_hash?: string | null
          ultimo_login?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          email?: string
          email_verificado?: boolean | null
          empresa_id?: string
          excluido_em?: string | null
          id?: string
          nome_completo?: string | null
          perfil?: string | null
          role?: string | null
          senha_hash?: string | null
          ultimo_login?: string | null
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
      validacoes_cache: {
        Row: {
          access_count: number | null
          accessed_at: string | null
          chave: string
          created_at: string | null
          dados: Json
          expires_at: string
          fonte: string
          id: string
          sucesso: boolean
          tipo: string
        }
        Insert: {
          access_count?: number | null
          accessed_at?: string | null
          chave: string
          created_at?: string | null
          dados: Json
          expires_at: string
          fonte: string
          id?: string
          sucesso?: boolean
          tipo: string
        }
        Update: {
          access_count?: number | null
          accessed_at?: string | null
          chave?: string
          created_at?: string | null
          dados?: Json
          expires_at?: string
          fonte?: string
          id?: string
          sucesso?: boolean
          tipo?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          event_type: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          payload_schema: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          payload_schema?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          payload_schema?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      widgets: {
        Row: {
          altura: number | null
          atualizado_em: string | null
          configuracao_json: Json | null
          criado_em: string | null
          dashboard_id: string | null
          id: string
          largura: number | null
          posicao_x: number | null
          posicao_y: number | null
          query_sql: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          altura?: number | null
          atualizado_em?: string | null
          configuracao_json?: Json | null
          criado_em?: string | null
          dashboard_id?: string | null
          id?: string
          largura?: number | null
          posicao_x?: number | null
          posicao_y?: number | null
          query_sql?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          altura?: number | null
          atualizado_em?: string | null
          configuracao_json?: Json | null
          criado_em?: string | null
          dashboard_id?: string | null
          id?: string
          largura?: number | null
          posicao_x?: number | null
          posicao_y?: number | null
          query_sql?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
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
      workflow_etapas: {
        Row: {
          atualizado_em: string | null
          automatica: boolean | null
          condicao_execucao: string | null
          configuracao_acao: Json | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number
          prazo_sla: number | null
          responsavel_id: string | null
          responsavel_role_id: string | null
          tipo_acao: string
          workflow_id: string
        }
        Insert: {
          atualizado_em?: string | null
          automatica?: boolean | null
          condicao_execucao?: string | null
          configuracao_acao?: Json | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem: number
          prazo_sla?: number | null
          responsavel_id?: string | null
          responsavel_role_id?: string | null
          tipo_acao: string
          workflow_id: string
        }
        Update: {
          atualizado_em?: string | null
          automatica?: boolean | null
          condicao_execucao?: string | null
          configuracao_acao?: Json | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          prazo_sla?: number | null
          responsavel_id?: string | null
          responsavel_role_id?: string | null
          tipo_acao?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_etapas_responsavel_role_id_fkey"
            columns: ["responsavel_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_etapas_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "vw_workflows_ativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_etapas_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
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
            referencedRelation: "vw_workflows_ativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_execucoes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_logs: {
        Row: {
          acao: string
          criado_em: string | null
          dados_json: Json | null
          etapa_id: string | null
          execucao_id: string
          id: string
          observacoes: string | null
          resultado: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          dados_json?: Json | null
          etapa_id?: string | null
          execucao_id: string
          id?: string
          observacoes?: string | null
          resultado?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          dados_json?: Json | null
          etapa_id?: string | null
          execucao_id?: string
          id?: string
          observacoes?: string | null
          resultado?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "workflow_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_logs_execucao_id_fkey"
            columns: ["execucao_id"]
            isOneToOne: false
            referencedRelation: "workflow_execucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      workflows_etapas: {
        Row: {
          acao_erro: string | null
          aprovacao_minima: number | null
          aprovadores_ids: string[] | null
          ativa: boolean | null
          atualizado_em: string | null
          codigo: string
          condicao_execucao_json: Json | null
          configuracao_json: Json
          criado_em: string | null
          descricao: string | null
          etapa_erro_id: string | null
          etapa_pai_id: string | null
          executar_se: string | null
          id: string
          input_schema_json: Json | null
          mapear_output: boolean | null
          nivel: number | null
          nome: string
          observacoes: string | null
          ordem: number
          output_schema_json: Json | null
          requer_aprovacao: boolean | null
          tentativas_maximas: number | null
          timeout_segundos: number | null
          tipo_acao: string
          workflow_id: string
        }
        Insert: {
          acao_erro?: string | null
          aprovacao_minima?: number | null
          aprovadores_ids?: string[] | null
          ativa?: boolean | null
          atualizado_em?: string | null
          codigo: string
          condicao_execucao_json?: Json | null
          configuracao_json: Json
          criado_em?: string | null
          descricao?: string | null
          etapa_erro_id?: string | null
          etapa_pai_id?: string | null
          executar_se?: string | null
          id?: string
          input_schema_json?: Json | null
          mapear_output?: boolean | null
          nivel?: number | null
          nome: string
          observacoes?: string | null
          ordem: number
          output_schema_json?: Json | null
          requer_aprovacao?: boolean | null
          tentativas_maximas?: number | null
          timeout_segundos?: number | null
          tipo_acao: string
          workflow_id: string
        }
        Update: {
          acao_erro?: string | null
          aprovacao_minima?: number | null
          aprovadores_ids?: string[] | null
          ativa?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          condicao_execucao_json?: Json | null
          configuracao_json?: Json
          criado_em?: string | null
          descricao?: string | null
          etapa_erro_id?: string | null
          etapa_pai_id?: string | null
          executar_se?: string | null
          id?: string
          input_schema_json?: Json | null
          mapear_output?: boolean | null
          nivel?: number | null
          nome?: string
          observacoes?: string | null
          ordem?: number
          output_schema_json?: Json | null
          requer_aprovacao?: boolean | null
          tentativas_maximas?: number | null
          timeout_segundos?: number | null
          tipo_acao?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_etapas_etapa_erro_id_fkey"
            columns: ["etapa_erro_id"]
            isOneToOne: false
            referencedRelation: "workflows_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_etapas_etapa_pai_id_fkey"
            columns: ["etapa_pai_id"]
            isOneToOne: false
            referencedRelation: "workflows_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_etapas_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "vw_workflows_ativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_etapas_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows_execucoes: {
        Row: {
          aprovacoes_concedidas: number | null
          aprovacoes_negadas: number | null
          aprovacoes_pendentes: number | null
          atualizado_em: string | null
          concluido_em: string | null
          contexto_dados_json: Json | null
          contexto_id: string | null
          contexto_tipo: string | null
          criado_em: string | null
          disparado_por: string | null
          disparado_por_usuario_id: string | null
          duracao_segundos: number | null
          empresa_id: string
          erro_etapa_id: string | null
          erro_mensagem: string | null
          etapa_atual_id: string | null
          etapa_atual_numero: number | null
          evento_origem: string | null
          execucao_original_id: string | null
          id: string
          iniciado_em: string | null
          input_json: Json | null
          numero_execucao: number
          observacoes: string | null
          output_json: Json | null
          progresso_percentual: number | null
          status: string | null
          sucesso: boolean | null
          tentativa: number | null
          total_etapas: number | null
          workflow_id: string
        }
        Insert: {
          aprovacoes_concedidas?: number | null
          aprovacoes_negadas?: number | null
          aprovacoes_pendentes?: number | null
          atualizado_em?: string | null
          concluido_em?: string | null
          contexto_dados_json?: Json | null
          contexto_id?: string | null
          contexto_tipo?: string | null
          criado_em?: string | null
          disparado_por?: string | null
          disparado_por_usuario_id?: string | null
          duracao_segundos?: number | null
          empresa_id: string
          erro_etapa_id?: string | null
          erro_mensagem?: string | null
          etapa_atual_id?: string | null
          etapa_atual_numero?: number | null
          evento_origem?: string | null
          execucao_original_id?: string | null
          id?: string
          iniciado_em?: string | null
          input_json?: Json | null
          numero_execucao: number
          observacoes?: string | null
          output_json?: Json | null
          progresso_percentual?: number | null
          status?: string | null
          sucesso?: boolean | null
          tentativa?: number | null
          total_etapas?: number | null
          workflow_id: string
        }
        Update: {
          aprovacoes_concedidas?: number | null
          aprovacoes_negadas?: number | null
          aprovacoes_pendentes?: number | null
          atualizado_em?: string | null
          concluido_em?: string | null
          contexto_dados_json?: Json | null
          contexto_id?: string | null
          contexto_tipo?: string | null
          criado_em?: string | null
          disparado_por?: string | null
          disparado_por_usuario_id?: string | null
          duracao_segundos?: number | null
          empresa_id?: string
          erro_etapa_id?: string | null
          erro_mensagem?: string | null
          etapa_atual_id?: string | null
          etapa_atual_numero?: number | null
          evento_origem?: string | null
          execucao_original_id?: string | null
          id?: string
          iniciado_em?: string | null
          input_json?: Json | null
          numero_execucao?: number
          observacoes?: string | null
          output_json?: Json | null
          progresso_percentual?: number | null
          status?: string | null
          sucesso?: boolean | null
          tentativa?: number | null
          total_etapas?: number | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_execucoes_disparado_por_usuario_id_fkey"
            columns: ["disparado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "workflows_execucoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_erro_etapa_id_fkey"
            columns: ["erro_etapa_id"]
            isOneToOne: false
            referencedRelation: "workflows_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_etapa_atual_id_fkey"
            columns: ["etapa_atual_id"]
            isOneToOne: false
            referencedRelation: "workflows_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_execucao_original_id_fkey"
            columns: ["execucao_original_id"]
            isOneToOne: false
            referencedRelation: "workflows_execucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "vw_workflows_ativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_execucoes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows_logs: {
        Row: {
          criado_em: string | null
          dados_json: Json | null
          detalhes: string | null
          erro_codigo: string | null
          erro_stack_trace: string | null
          etapa_id: string | null
          execucao_id: string
          id: string
          mensagem: string
          ocorrido_em: string | null
          request_json: Json | null
          response_json: Json | null
          response_status_code: number | null
          response_time_ms: number | null
          severidade: number | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          dados_json?: Json | null
          detalhes?: string | null
          erro_codigo?: string | null
          erro_stack_trace?: string | null
          etapa_id?: string | null
          execucao_id: string
          id?: string
          mensagem: string
          ocorrido_em?: string | null
          request_json?: Json | null
          response_json?: Json | null
          response_status_code?: number | null
          response_time_ms?: number | null
          severidade?: number | null
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          dados_json?: Json | null
          detalhes?: string | null
          erro_codigo?: string | null
          erro_stack_trace?: string | null
          etapa_id?: string | null
          execucao_id?: string
          id?: string
          mensagem?: string
          ocorrido_em?: string | null
          request_json?: Json | null
          response_json?: Json | null
          response_status_code?: number | null
          response_time_ms?: number | null
          severidade?: number | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_logs_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "workflows_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_logs_execucao_id_fkey"
            columns: ["execucao_id"]
            isOneToOne: false
            referencedRelation: "workflows_execucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      api_credentials_list: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          criado_em: string | null
          empresa_id: string | null
          id: string | null
          nome: string | null
          servico: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          id?: string | null
          nome?: string | null
          servico?: string | null
          status?: never
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          id?: string | null
          nome?: string | null
          servico?: string | null
          status?: never
          tipo?: string | null
        }
        Relationships: [
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
      mv_busca_rapida: {
        Row: {
          categoria: string | null
          conteudo_texto: string | null
          documento_id: string | null
          id: string | null
          modulo: string | null
          tsv: unknown
        }
        Relationships: []
      }
      mv_cirurgias_kpis: {
        Row: {
          agendadas: number | null
          alta_prioridade: number | null
          atualizado_em: string | null
          canceladas: number | null
          concluidas: number | null
          confirmadas: number | null
          empresa_id: string | null
          total_mes: number | null
          urgentes: number | null
          valor_estimado_total: number | null
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
        ]
      }
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
      view_crm_funil: {
        Row: {
          empresa_id: string | null
          etapa: string | null
          total: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
      }
      view_crm_pipeline_resumo: {
        Row: {
          empresa_id: string | null
          probabilidade_media: number | null
          total_oportunidades: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "mv_kpis_empresa"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_empresas_sem_dpo"
            referencedColumns: ["id"]
          },
        ]
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
      vw_active_sessions: {
        Row: {
          dispositivo: string | null
          id: string | null
          inicio_em: string | null
          ip_address: unknown
          navegador: string | null
          session_token: string | null
          termino_em: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          dispositivo?: string | null
          id?: string | null
          inicio_em?: string | null
          ip_address?: unknown
          navegador?: string | null
          session_token?: string | null
          termino_em?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          dispositivo?: string | null
          id?: string | null
          inicio_em?: string | null
          ip_address?: unknown
          navegador?: string | null
          session_token?: string | null
          termino_em?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      vw_api_metrics: {
        Row: {
          active_alerts: number | null
          avg_response_time_ms: number | null
          cache_hit_rate_percent: number | null
          cache_hits: number | null
          circuit_breaker_failures: number | null
          circuit_breaker_state: string | null
          criticidade: string | null
          endpoint_id: string | null
          endpoint_nome: string | null
          error_count: number | null
          max_response_time_ms: number | null
          min_response_time_ms: number | null
          servico: string | null
          success_count: number | null
          total_requests: number | null
        }
        Relationships: []
      }
      vw_balancete: {
        Row: {
          conta_codigo: string | null
          conta_grau: number | null
          conta_natureza: string | null
          conta_nome: string | null
          conta_tipo: string | null
          saldo_atual: number | null
          tipo_saldo: string | null
          total_credito: number | null
          total_debito: number | null
        }
        Relationships: []
      }
      vw_cirurgias_segura: {
        Row: {
          atualizado_em: string | null
          codigo_interno: string | null
          criado_em: string | null
          data_cirurgia: string | null
          empresa_id: string | null
          hora_cirurgia: string | null
          hospital_id: string | null
          id: string | null
          medico_id: string | null
          observacoes: string | null
          paciente_iniciais: string | null
          prioridade: string | null
          procedimento: string | null
          sala: string | null
          status: string | null
          valor_estimado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          codigo_interno?: string | null
          criado_em?: string | null
          data_cirurgia?: string | null
          empresa_id?: string | null
          hora_cirurgia?: string | null
          hospital_id?: string | null
          id?: string | null
          medico_id?: string | null
          observacoes?: string | null
          paciente_iniciais?: string | null
          prioridade?: string | null
          procedimento?: string | null
          sala?: string | null
          status?: string | null
          valor_estimado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          codigo_interno?: string | null
          criado_em?: string | null
          data_cirurgia?: string | null
          empresa_id?: string | null
          hora_cirurgia?: string | null
          hospital_id?: string | null
          id?: string | null
          medico_id?: string | null
          observacoes?: string | null
          paciente_iniciais?: string | null
          prioridade?: string | null
          procedimento?: string | null
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
            foreignKeyName: "cirurgias_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
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
      vw_consignacao_por_hospital: {
        Row: {
          custo_carregamento_total: number | null
          dias_medio_estoque: number | null
          hospital_id: string | null
          hospital_nome: string | null
          total_materiais: number | null
          valor_devolvido: number | null
          valor_disponivel: number | null
          valor_total_consignado: number | null
          valor_utilizado: number | null
        }
        Relationships: []
      }
      vw_estatisticas_auditorias: {
        Row: {
          auditorias_concluidas: number | null
          score_medio: number | null
          total_auditorias: number | null
          total_nc_criticas: number | null
          total_nc_maiores: number | null
          total_nc_menores: number | null
        }
        Relationships: []
      }
      vw_estatisticas_emails_30d: {
        Row: {
          bounce: number | null
          dia: string | null
          enviados_erro: number | null
          enviados_sucesso: number | null
          tipo: string | null
          total_enviados: number | null
        }
        Relationships: []
      }
      vw_licitacoes_ativas: {
        Row: {
          data_abertura: string | null
          dias_para_abertura: number | null
          id: string | null
          modalidade: string | null
          numero_edital: string | null
          orgao_comprador_nome: string | null
          orgao_comprador_uf: string | null
          responsavel_email: string | null
          responsavel_id: string | null
          status: string | null
          status_ultima_proposta: string | null
          tipo: string | null
          titulo: string | null
          total_propostas: number | null
          valor_estimado: number | null
        }
        Relationships: []
      }
      vw_materiais_criticos_consignacao: {
        Row: {
          categoria: string | null
          codigo_interno: string | null
          contrato_id: string | null
          created_at: string | null
          criticidade: string | null
          custo_carregamento: number | null
          data_recebimento: string | null
          dias_ate_vencimento: number | null
          dias_estoque: number | null
          fabricante: string | null
          fornecedor: string | null
          hospital_id: string | null
          hospital_nome: string | null
          id: string | null
          lote: string | null
          nome: string | null
          observacoes: string | null
          produto_id: string | null
          quantidade: number | null
          rotatividade: string | null
          serie: string | null
          status: string | null
          ultima_movimentacao_data: string | null
          ultima_movimentacao_responsavel: string | null
          ultima_movimentacao_tipo: string | null
          updated_at: string | null
          validade: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          categoria?: string | null
          codigo_interno?: string | null
          contrato_id?: string | null
          created_at?: string | null
          criticidade?: never
          custo_carregamento?: number | null
          data_recebimento?: string | null
          dias_ate_vencimento?: never
          dias_estoque?: number | null
          fabricante?: string | null
          fornecedor?: string | null
          hospital_id?: string | null
          hospital_nome?: string | null
          id?: string | null
          lote?: string | null
          nome?: string | null
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number | null
          rotatividade?: string | null
          serie?: string | null
          status?: string | null
          ultima_movimentacao_data?: string | null
          ultima_movimentacao_responsavel?: string | null
          ultima_movimentacao_tipo?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          categoria?: string | null
          codigo_interno?: string | null
          contrato_id?: string | null
          created_at?: string | null
          criticidade?: never
          custo_carregamento?: number | null
          data_recebimento?: string | null
          dias_ate_vencimento?: never
          dias_estoque?: number | null
          fabricante?: string | null
          fornecedor?: string | null
          hospital_id?: string | null
          hospital_nome?: string | null
          id?: string | null
          lote?: string | null
          nome?: string | null
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number | null
          rotatividade?: string | null
          serie?: string | null
          status?: string | null
          ultima_movimentacao_data?: string | null
          ultima_movimentacao_responsavel?: string | null
          ultima_movimentacao_tipo?: string | null
          updated_at?: string | null
          validade?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
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
            foreignKeyName: "materiais_consignados_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "vw_consignacao_por_hospital"
            referencedColumns: ["hospital_id"]
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
      vw_propostas_pendentes: {
        Row: {
          aprovada_comercial: boolean | null
          aprovada_diretoria: boolean | null
          aprovada_financeiro: boolean | null
          data_abertura: string | null
          dias_para_abertura: number | null
          id: string | null
          licitacao_titulo: string | null
          margem_bruta_percentual: number | null
          margem_liquida_percentual: number | null
          numero_edital: string | null
          numero_proposta: string | null
          orgao_comprador_nome: string | null
          status: string | null
          valor_total: number | null
        }
        Relationships: []
      }
      vw_proximas_reunioes_teams: {
        Row: {
          assunto: string | null
          data_fim: string | null
          data_inicio: string | null
          entidade_nome: string | null
          entidade_tipo: string | null
          evento_id: string | null
          horas_ate_reuniao: number | null
          id: string | null
          link_reuniao: string | null
          organizador: string | null
          participantes: Json | null
          status: string | null
          tipo_reuniao: string | null
          usuario_criador_email: string | null
        }
        Relationships: []
      }
      vw_razao_contabil: {
        Row: {
          centro_custo_nome: string | null
          conta_codigo: string | null
          conta_nome: string | null
          conta_tipo: string | null
          credito: number | null
          data_competencia: string | null
          data_lancamento: string | null
          debito: number | null
          documento_numero: string | null
          documento_tipo: string | null
          historico: string | null
          numero_lancamento: string | null
          tipo_partida: string | null
          valor: number | null
        }
        Relationships: []
      }
      vw_score_abbott: {
        Row: {
          requisitos_conformes: number | null
          requisitos_nao_conformes: number | null
          requisitos_parciais: number | null
          score_global: number | null
          total_requisitos: number | null
        }
        Relationships: []
      }
      vw_slow_queries: {
        Row: {
          avg_response_time: number | null
          max_response_time: number | null
          method: string | null
          route: string | null
          total_requests: number | null
        }
        Relationships: []
      }
      vw_treinamentos_vencendo: {
        Row: {
          cargo: string | null
          data_validade_certificado: string | null
          dias_ate_vencimento: number | null
          fabricante: string | null
          nome: string | null
          treinamento: string | null
        }
        Relationships: []
      }
      vw_user_permissions: {
        Row: {
          acao: string | null
          codigo: string | null
          modulo: string | null
          nivel_criticidade: string | null
          nome: string | null
          permission_id: string | null
          requer_2fa: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_workflows_ativos: {
        Row: {
          categoria: string | null
          descricao: string | null
          id: string | null
          nome: string | null
          proxima_execucao: string | null
          total_erros: number | null
          total_execucoes: number | null
          total_sucesso: number | null
          trigger_tipo: string | null
          ultima_execucao: string | null
        }
        Insert: {
          categoria?: string | null
          descricao?: string | null
          id?: string | null
          nome?: string | null
          proxima_execucao?: string | null
          total_erros?: never
          total_execucoes?: number | null
          total_sucesso?: never
          trigger_tipo?: string | null
          ultima_execucao?: string | null
        }
        Update: {
          categoria?: string | null
          descricao?: string | null
          id?: string | null
          nome?: string | null
          proxima_execucao?: string | null
          total_erros?: never
          total_execucoes?: number | null
          total_sucesso?: never
          trigger_tipo?: string | null
          ultima_execucao?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_steering_command: {
        Args: {
          p_command_text?: string
          p_command_type: string
          p_parameters?: Json
          p_session_id: string
        }
        Returns: string
      }
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
      atualizar_metricas_consignacao: { Args: never; Returns: undefined }
      atualizar_scores_compliance: { Args: never; Returns: undefined }
      atualizar_status_cirurgia: {
        Args: { p_cirurgia_id: string; p_novo_status: string }
        Returns: Json
      }
      bloquear_lotes_vencidos: { Args: never; Returns: number }
      buscar_atividades_usuario: {
        Args: { p_dias_historico?: number; p_usuario_email: string }
        Returns: {
          acoes_unicas: string[]
          modulo: string
          periodo: string
          taxa_sucesso: number
          tempo_medio_ms: number
          total_acoes: number
        }[]
      }
      buscar_conhecimento: {
        Args: { limit_results?: number; min_rank?: number; query_text: string }
        Returns: {
          categoria: string
          conteudo_texto: string
          documento_id: string
          id: string
          modulo: string
          rank: number
          relevancia: string
        }[]
      }
      buscar_legislacao: {
        Args: { limit_results?: number; query_text: string }
        Returns: {
          data_publicacao: string
          descricao: string
          id: string
          impacto_modulos: string[]
          link_oficial: string
          rank: number
          titulo: string
        }[]
      }
      buscar_similar: {
        Args: {
          limit_results?: number
          min_similarity?: number
          query_text: string
        }
        Returns: {
          categoria: string
          conteudo_texto: string
          documento_id: string
          id: string
          modulo: string
          similarity: number
        }[]
      }
      calcular_abbott_score: { Args: { p_empresa_id: string }; Returns: Json }
      calcular_abc_xyz: {
        Args: never
        Returns: {
          classe_abc: string
          coeficiente_variacao: number
          demanda_media: number
          descricao: string
          percentual_acumulado: number
          produto_id: string
          tipo_xyz: string
          valor_total: number
        }[]
      }
      calcular_comissao: { Args: { p_cirurgia_id: string }; Returns: Json }
      calcular_custo_importacao: {
        Args: {
          p_aliquota_cofins?: number
          p_aliquota_icms?: number
          p_aliquota_ii?: number
          p_aliquota_ipi?: number
          p_aliquota_pis?: number
          p_valor_fob: number
          p_valor_frete: number
          p_valor_seguro: number
        }
        Returns: Json
      }
      calcular_kpi: {
        Args: {
          p_data_referencia: string
          p_kpi_nome: string
          p_periodo: string
        }
        Returns: string
      }
      calcular_metricas_agregadas: {
        Args: {
          p_dimensoes?: Json
          p_granularidade: string
          p_periodo_fim: string
          p_periodo_inicio: string
        }
        Returns: string
      }
      calcular_score_global_abbott: {
        Args: never
        Returns: {
          atualizado_em: string
          detalhes: Json
          empresa_id: string
          nivel: string
          score: number
        }[]
      }
      calcular_taxa_sucesso_licitacoes: {
        Args: { p_data_fim?: string; p_data_inicio?: string }
        Returns: {
          taxa_sucesso: number
          total_participadas: number
          total_perdidas: number
          total_vencidas: number
          valor_total_perdido: number
          valor_total_vencido: number
        }[]
      }
      calcular_taxa_sucesso_medico: {
        Args: { p_medico_id: string }
        Returns: number
      }
      calcular_todos_kpis_mes: {
        Args: { p_data_referencia?: string }
        Returns: number
      }
      calculate_sync_hash: { Args: { p_data: Json }; Returns: string }
      check_failed_login_attempts: {
        Args: {
          p_email: string
          p_ip_address: unknown
          p_max_attempts?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_endpoint_id: string; p_user_id?: string }
        Returns: boolean
      }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_validacoes_cache: { Args: never; Returns: number }
      comparar_usuarios_handover: {
        Args: {
          p_usuario_sainte_email: string
          p_usuario_substituto_email: string
        }
        Returns: {
          diferenca_experiencia: number
          experiencia_sainte: number
          experiencia_substituto: number
          modulo: string
          precisa_treinamento: boolean
        }[]
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
      create_agent_task: {
        Args: {
          p_organization_id: string
          p_parameters?: Json
          p_priority?: number
          p_query_text: string
          p_task_type: string
        }
        Returns: string
      }
      create_edr_session: {
        Args: {
          p_llm_provider?: string
          p_max_loops?: number
          p_query: string
          p_steering_enabled?: boolean
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      criar_backup: {
        Args: { p_nome: string; p_tabelas: string[]; p_tipo: string }
        Returns: string
      }
      criar_evento_licitacao: {
        Args: {
          p_data_evento?: string
          p_descricao?: string
          p_licitacao_id: string
          p_tipo: string
          p_titulo: string
        }
        Returns: string
      }
      criar_notificacao: {
        Args: {
          p_canal: string
          p_contexto?: string
          p_contexto_id?: string
          p_mensagem: string
          p_prioridade?: string
          p_tipo: string
          p_titulo: string
          p_user_id: string
        }
        Returns: string
      }
      current_empresa: { Args: never; Returns: string }
      current_empresa_id: { Args: never; Returns: string }
      current_perfil: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      decrypt_credential: { Args: { encrypted_value: string }; Returns: string }
      detectar_comportamento_anomalo: {
        Args: never
        Returns: {
          anomalia: string
          detalhes: string
          severidade: string
          usuario_id: string
        }[]
      }
      dispatch_webhook: {
        Args: {
          p_event_data: Json
          p_event_type: string
          p_organization_id: string
        }
        Returns: undefined
      }
      edr_get_consolidated_results: {
        Args: { session_uuid: string }
        Returns: Json
      }
      edr_get_session_metrics: { Args: { session_uuid: string }; Returns: Json }
      executar_workflow: {
        Args: { p_trigger_data?: Json; p_workflow_id: string }
        Returns: string
      }
      exportar_dados_usuario: { Args: { p_usuario_id: string }; Returns: Json }
      gerar_alertas_conferencia_semanal: { Args: never; Returns: undefined }
      gerar_alertas_ia: { Args: never; Returns: undefined }
      gerar_caminho_storage: {
        Args: {
          p_empresa_id: string
          p_entidade: string
          p_extensao: string
          p_registro_id: string
        }
        Returns: string
      }
      gerar_dre: {
        Args: { p_data_fim: string; p_data_inicio: string }
        Returns: {
          descricao: string
          grupo: string
          percentual: number
          valor: number
        }[]
      }
      gerar_relatorio_anvisa_rastreabilidade: {
        Args: { p_data_fim: string; p_data_inicio: string; p_formato?: string }
        Returns: string
      }
      gerar_sped_fiscal: {
        Args: { p_ano: number; p_mes: number }
        Returns: string
      }
      get_agenda_cirurgias: {
        Args: {
          p_data_fim?: string
          p_data_inicio?: string
          p_empresa_id: string
        }
        Returns: {
          data_agendada: string
          hospital_nome: string
          id: string
          materiais_separados: number
          medico_crm: string
          medico_nome: string
          paciente_nome: string
          sala: string
          status_cirurgia: string
          total_materiais: number
        }[]
      }
      get_agent_report_status: { Args: { p_report_id: string }; Returns: Json }
      get_agent_task_metrics: { Args: { p_task_id: string }; Returns: Json }
      get_alertas_criticos: { Args: { p_empresa_id: string }; Returns: Json }
      get_cirurgias_mes: {
        Args: { p_ano: number; p_empresa_id: string; p_mes: number }
        Returns: {
          data_cirurgia: string
          hospital_nome: string
          id: string
          medico_nome: string
          numero_cirurgia: string
          paciente_nome: string
          status: string
          valor_total: number
        }[]
      }
      get_compliance_status: { Args: { p_empresa_id: string }; Returns: Json }
      get_dashboard_kpis:
        | { Args: never; Returns: Json }
        | { Args: { p_empresa_id: string; p_periodo?: string }; Returns: Json }
      get_decrypted_credential: {
        Args: { p_empresa_id?: string; p_nome: string }
        Returns: string
      }
      get_estoque_baixo: {
        Args: { p_empresa_id: string }
        Returns: {
          codigo: string
          criticidade: string
          diferenca: number
          estoque_atual: number
          estoque_minimo: number
          nome: string
          produto_id: string
        }[]
      }
      get_fluxo_caixa_projecao: {
        Args: { p_dias?: number; p_empresa_id: string }
        Returns: {
          data: string
          entradas: number
          saidas: number
          saldo_acumulado: number
          saldo_dia: number
        }[]
      }
      get_from_cache: {
        Args: { p_cache_key: string; p_endpoint_id: string }
        Returns: Json
      }
      get_metricas_financeiras: {
        Args: { p_empresa_id: string; p_periodo?: string }
        Returns: Json
      }
      get_proximo_numero_nfe: { Args: { p_serie?: number }; Returns: number }
      get_rastreabilidade: { Args: { p_produto_id: string }; Returns: Json }
      get_top_produtos: {
        Args: { p_empresa_id: string; p_limit?: number }
        Returns: {
          codigo: string
          nome: string
          numero_cirurgias: number
          produto_id: string
          quantidade_total: number
          valor_total: number
        }[]
      }
      get_validacao_cache: {
        Args: { p_chave: string; p_tipo: string }
        Returns: Json
      }
      get_validacoes_cache_stats: {
        Args: { p_periodo_dias?: number; p_tipo?: string }
        Returns: {
          consultas_por_dia: number
          fonte: string
          hit_rate: number
          mais_consultado: string
          tipo: string
          total_consultas: number
        }[]
      }
      get_workflow_metrics: {
        Args: { p_workflow_id: string }
        Returns: {
          active_instances: number
          avg_completion_time: unknown
          completed_instances: number
          states_distribution: Json
          total_instances: number
        }[]
      }
      hybrid_vector_search: {
        Args: {
          match_count?: number
          match_threshold?: number
          metadata_filter?: Json
          query_embedding: string
        }
        Returns: {
          external_id: string
          id: string
          metadata: Json
          module: string
          similarity: number
        }[]
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
      is_feature_enabled: {
        Args: { p_flag_key: string; p_org_id?: string; p_user_id?: string }
        Returns: boolean
      }
      limpar_cache_expirado: { Args: never; Returns: number }
      limpar_tokens_expirados: { Args: never; Returns: number }
      log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource: string
          p_resource_id?: string
        }
        Returns: string
      }
      log_audit:
        | {
            Args: {
              p_action: string
              p_new_data?: Json
              p_old_data?: Json
              p_resource_id: string
              p_resource_type: string
            }
            Returns: string
          }
        | {
            Args: {
              p_acao: string
              p_dados_antes?: Json
              p_dados_depois?: Json
              p_descricao?: string
              p_entidade_id?: string
              p_entidade_tipo?: string
              p_modulo: string
              p_nivel_sensibilidade?: string
              p_sucesso?: boolean
              p_user_id: string
            }
            Returns: string
          }
      marcar_notificacao_lida: {
        Args: { p_notificacao_id: string }
        Returns: undefined
      }
      obter_melhor_preco: {
        Args: {
          p_convenio_id?: string
          p_data?: string
          p_empresa_id: string
          p_hospital_id?: string
          p_produto_id: string
          p_quantidade?: number
        }
        Returns: {
          preco_final: number
          quantidade_maxima: number
          quantidade_minima: number
          tabela_id: string
          tabela_nome: string
          tabela_tipo: string
        }[]
      }
      obter_permissoes_usuario: {
        Args: { p_usuario_id: string }
        Returns: {
          acao: string
          codigo: string
          nome: string
          recurso: string
        }[]
      }
      otimizar_rota: {
        Args: { p_destino: string; p_origem: string }
        Returns: Json
      }
      populate_dimensao_tempo: {
        Args: { p_ano_inicio: number; p_anos: number }
        Returns: number
      }
      process_webhook_queue: {
        Args: { p_batch_size?: number }
        Returns: {
          delivery_id: string
          endpoint_id: string
          status: string
        }[]
      }
      processar_webhook: { Args: { p_webhook_event_id: string }; Returns: Json }
      produtos_abaixo_ponto_reposicao: {
        Args: never
        Returns: {
          descricao: string
          estoque_maximo: number
          estoque_minimo: number
          id: string
          quantidade_atual: number
        }[]
      }
      produtos_sem_movimento: {
        Args: { dias: number }
        Returns: {
          descricao: string
          dias_parado: number
          id: string
        }[]
      }
      refresh_all_materialized_views: { Args: never; Returns: string }
      refresh_busca_cache: { Args: never; Returns: undefined }
      refresh_dashboard_kpis: { Args: never; Returns: undefined }
      refresh_materialized_views: { Args: never; Returns: undefined }
      refresh_mv_kpis: { Args: never; Returns: undefined }
      refresh_mv_with_log: { Args: { p_view_name: string }; Returns: string }
      register_iot_reading: {
        Args: {
          p_device_uid: string
          p_raw_data?: Json
          p_reading_type: string
          p_tag_uid?: string
          p_value?: number
        }
        Returns: string
      }
      registrar_webhook_recebido: {
        Args: {
          p_empresa_id: string
          p_event_type: string
          p_headers?: Json
          p_payload: Json
          p_signature?: string
          p_source_ip?: unknown
        }
        Returns: string
      }
      reservar_kit: { Args: { p_kit_id: string }; Returns: boolean }
      responder_aprovacao_workflow: {
        Args: {
          p_aprovacao_id: string
          p_aprovado: boolean
          p_resposta?: string
        }
        Returns: undefined
      }
      save_to_cache: {
        Args: {
          p_cache_key: string
          p_endpoint_id: string
          p_response_body: Json
          p_response_headers: Json
          p_response_status: number
          p_ttl: number
        }
        Returns: undefined
      }
      search_cirurgias: {
        Args: { p_empresa_id: string; p_query: string }
        Returns: {
          data_cirurgia: string
          hospital_nome: string
          id: string
          medico_nome: string
          numero_cirurgia: string
          paciente_nome: string
          relevancia: number
          status: string
        }[]
      }
      search_similar_vectors: {
        Args: {
          filter_module?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          external_id: string
          id: string
          metadata: Json
          module: string
          similarity: number
        }[]
      }
      set_config: { Args: { setting: string; value: string }; Returns: boolean }
      set_validacao_cache: {
        Args: {
          p_chave: string
          p_dados: Json
          p_fonte: string
          p_sucesso?: boolean
          p_tipo: string
          p_ttl_seconds?: number
        }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sugerir_termos: {
        Args: { limit_results?: number; prefix_text: string }
        Returns: {
          frequencia: number
          sugestao: string
        }[]
      }
      test_api_credential: {
        Args: { p_nome: string; p_servico: string; p_valor: string }
        Returns: Json
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_circuit_breaker: {
        Args: { p_endpoint_id: string; p_success: boolean }
        Returns: string
      }
      user_has_permission:
        | {
            Args: { p_permission_code: string; p_user_id: string }
            Returns: boolean
          }
        | {
            Args: { p_permission_code: string; p_user_id: string }
            Returns: boolean
          }
      usuario_tem_microsoft365: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      usuario_tem_permissao: {
        Args: { p_permissao_codigo: string; p_usuario_id: string }
        Returns: boolean
      }
      validar_cnpj: { Args: { p_cnpj: string }; Returns: boolean }
      validar_cnpjs_existentes: {
        Args: never
        Returns: {
          cnpj: string
          id: string
          mensagem: string
          tabela: string
          valido: boolean
        }[]
      }
      validar_consignacao: { Args: { p_consignacao_id: string }; Returns: Json }
      validar_crm: { Args: { p_crm: string; p_uf: string }; Returns: boolean }
      validar_crms_existentes: {
        Args: never
        Returns: {
          crm: string
          crm_uf: string
          id: string
          mensagem: string
          nome: string
          valido: boolean
        }[]
      }
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
      validar_login: {
        Args: { p_email: string; p_senha: string }
        Returns: {
          cargo: string
          email: string
          empresa_id: string
          empresa_nome: string
          mensagem: string
          nome_completo: string
          sucesso: boolean
          usuario_id: string
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
      validar_rastreabilidade_anvisa: {
        Args: { p_nfe_id: string }
        Returns: boolean
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
      validate_anvisa_registration: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_organization_id: string
          p_registration_number: string
        }
        Returns: string
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
      status_cirurgia:
        | "agendada"
        | "confirmada"
        | "em_andamento"
        | "concluida"
        | "cancelada"
      status_item_cirurgia:
        | "pendente"
        | "separado"
        | "entregue"
        | "utilizado"
        | "devolvido"
        | "perdido"
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
  public: {
    Enums: {
      status_cirurgia: [
        "agendada",
        "confirmada",
        "em_andamento",
        "concluida",
        "cancelada",
      ],
      status_item_cirurgia: [
        "pendente",
        "separado",
        "entregue",
        "utilizado",
        "devolvido",
        "perdido",
      ],
    },
  },
} as const
