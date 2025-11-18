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
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
        ]
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
            foreignKeyName: "leads_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
            foreignKeyName: "medicos_usuario_id_fkey"
            columns: ["usuario_id"]
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
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
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
        ]
      }
      transacoes: {
        Row: {
          atualizado_em: string | null
          categoria: string
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          status: string | null
          tipo: string
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          categoria: string
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          empresa_id: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tipo: string
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          empresa_id?: string
          excluido_em?: string | null
          forma_pagamento?: string | null
          id?: string
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
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_empresa: { Args: never; Returns: string }
      current_perfil: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
