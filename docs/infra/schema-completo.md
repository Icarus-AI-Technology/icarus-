# 📊 Schema Completo - ICARUS v5.0

**Data:** 2025-10-20
**Tabelas:** 103
**ENUMs:** 1
**Functions:** 59
**Views:** 3
**Triggers:** 101
**Indexes:** 531

---

## 📋 TABELAS (103)

### acoes_corretivas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nao_conformidade_id | uuid | Não | - |
| numero | text | Não | - |
| tipo | text | Não | - |
| descricao | text | Não | - |
| categoria | text | Não | - |
| plano_acao | text | Não | - |
| recursos_necessarios | text | Sim | - |
| custo_estimado | numeric | Sim | - |
| responsavel_id | uuid | Não | - |
| participantes | ARRAY | Sim | - |
| data_planejamento | date | Sim | CURRENT_DATE |
| data_inicio_prevista | date | Não | - |
| data_inicio_real | date | Sim | - |
| data_conclusao_prevista | date | Não | - |
| data_conclusao_real | date | Sim | - |
| status | text | Sim | 'planejada'::text |
| progresso | integer | Sim | 0 |
| atividades_realizadas | text | Sim | - |
| dificuldades_encontradas | text | Sim | - |
| data_verificacao_eficacia | date | Sim | - |
| verificada_por_id | uuid | Sim | - |
| metodo_verificacao | text | Sim | - |
| resultado_verificacao | text | Sim | - |
| eficaz | boolean | Sim | - |
| evidencias_urls | ARRAY | Sim | - |
| observacoes | text | Sim | - |
| licoes_aprendidas | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### api_endpoints

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| versao | text | Sim | 'v1'::text |
| metodo | text | Não | - |
| path | text | Não | - |
| path_parametros | ARRAY | Sim | - |
| categoria | text | Sim | 'privado'::text |
| requer_autenticacao | boolean | Sim | true |
| tipo_autenticacao | text | Sim | 'api_key'::text |
| permissoes_requeridas | ARRAY | Sim | - |
| roles_permitidos | ARRAY | Sim | - |
| rate_limit_habilitado | boolean | Sim | true |
| rate_limit_requests | integer | Sim | 100 |
| rate_limit_janela_segundos | integer | Sim | 60 |
| valida_input | boolean | Sim | true |
| input_schema_json | jsonb | Sim | - |
| valida_output | boolean | Sim | false |
| output_schema_json | jsonb | Sim | - |
| timeout_segundos | integer | Sim | 30 |
| cache_habilitado | boolean | Sim | false |
| cache_ttl_segundos | integer | Sim | 300 |
| webhook_url | text | Sim | - |
| webhook_headers_json | jsonb | Sim | - |
| webhook_retry_count | integer | Sim | 3 |
| documentacao_markdown | text | Sim | - |
| exemplos_json | jsonb | Sim | - |
| ativo | boolean | Sim | true |
| manutencao | boolean | Sim | false |
| deprecated | boolean | Sim | false |
| data_depreciacao | date | Sim | - |
| total_chamadas | integer | Sim | 0 |
| total_sucesso | integer | Sim | 0 |
| total_erro | integer | Sim | 0 |
| tempo_medio_ms | integer | Sim | - |
| ultima_chamada | timestamp with time zone | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |

### api_keys

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| chave | text | Não | - |
| prefixo | text | Não | - |
| tipo | text | Sim | 'teste'::text |
| escopo | text | Sim | 'limitado'::text |
| permissoes | ARRAY | Sim | - |
| endpoints_permitidos | ARRAY | Sim | - |
| usuario_id | uuid | Sim | - |
| aplicacao | text | Sim | - |
| ips_permitidos | ARRAY | Sim | - |
| dominios_permitidos | ARRAY | Sim | - |
| rate_limit_override | boolean | Sim | false |
| rate_limit_custom | integer | Sim | - |
| rate_limit_janela_segundos | integer | Sim | - |
| data_expiracao | timestamp with time zone | Sim | - |
| expira | boolean | Sim | false |
| ativa | boolean | Sim | true |
| bloqueada | boolean | Sim | false |
| motivo_bloqueio | text | Sim | - |
| total_requisicoes | integer | Sim | 0 |
| ultima_requisicao | timestamp with time zone | Sim | - |
| ultima_requisicao_ip | inet | Sim | - |
| rotacionada_de_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |

### api_logs

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| endpoint_id | uuid | Sim | - |
| api_key_id | uuid | Sim | - |
| request_id | text | Não | - |
| metodo | text | Não | - |
| path | text | Não | - |
| query_params_json | jsonb | Sim | - |
| request_headers_json | jsonb | Sim | - |
| request_body_json | jsonb | Sim | - |
| request_size_bytes | integer | Sim | - |
| ip_origem | inet | Não | - |
| user_agent | text | Sim | - |
| referer | text | Sim | - |
| usuario_id | uuid | Sim | - |
| response_status_code | integer | Sim | - |
| response_headers_json | jsonb | Sim | - |
| response_body_json | jsonb | Sim | - |
| response_size_bytes | integer | Sim | - |
| response_time_ms | integer | Sim | - |
| sucesso | boolean | Sim | - |
| erro_mensagem | text | Sim | - |
| erro_tipo | text | Sim | - |
| erro_stack_trace | text | Sim | - |
| rate_limit_hit | boolean | Sim | false |
| rate_limit_remaining | integer | Sim | - |
| cache_hit | boolean | Sim | false |
| timestamp | timestamp with time zone | Sim | now() |
| pais | text | Sim | - |
| regiao | text | Sim | - |
| cidade | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### api_rate_limits

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| chave_limite | text | Não | - |
| api_key_id | uuid | Sim | - |
| endpoint_id | uuid | Sim | - |
| ip_origem | inet | Sim | - |
| janela_inicio | timestamp with time zone | Não | - |
| janela_fim | timestamp with time zone | Não | - |
| janela_duracao_segundos | integer | Não | - |
| limite_requests | integer | Não | - |
| requests_consumidos | integer | Sim | 0 |
| requests_restantes | integer | Sim | - |
| limite_atingido | boolean | Sim | false |
| data_limite_atingido | timestamp with time zone | Sim | - |
| proxima_janela | timestamp with time zone | Não | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### atividades_crm

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| tipo | text | Não | - |
| prioridade | text | Sim | 'media'::text |
| titulo | text | Não | - |
| descricao | text | Sim | - |
| oportunidade_id | uuid | Sim | - |
| lead_id | uuid | Sim | - |
| proposta_id | uuid | Sim | - |
| responsavel_id | uuid | Não | - |
| criada_por_id | uuid | Sim | - |
| data_vencimento | timestamp with time zone | Sim | - |
| data_conclusao | timestamp with time zone | Sim | - |
| data_lembrete | timestamp with time zone | Sim | - |
| status | text | Sim | 'pendente'::text |
| resultado | text | Sim | - |
| tempo_gasto_minutos | integer | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### audit_log

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Sim | - |
| usuario_id | uuid | Sim | - |
| tabela | text | Não | - |
| registro_id | uuid | Não | - |
| acao | text | Não | - |
| dados_antes | jsonb | Sim | - |
| dados_depois | jsonb | Sim | - |
| hash_anterior | text | Sim | - |
| hash_atual | text | Não | - |
| criado_em | timestamp with time zone | Sim | now() |

### auditorias

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| titulo | text | Não | - |
| objetivo | text | Sim | - |
| tipo | text | Não | - |
| escopo | text | Não | - |
| normas_aplicaveis | ARRAY | Sim | - |
| data_planejamento | date | Sim | CURRENT_DATE |
| data_inicio | date | Não | - |
| data_fim | date | Não | - |
| duracao_horas | integer | Sim | - |
| auditor_lider_id | uuid | Sim | - |
| auditores | ARRAY | Sim | - |
| entidade_auditora | text | Sim | - |
| departamentos_auditados | ARRAY | Sim | - |
| processos_auditados | ARRAY | Sim | - |
| pontuacao_geral | numeric | Sim | - |
| percentual_conformidade | numeric | Sim | - |
| total_conformidades | integer | Sim | 0 |
| total_nao_conformidades | integer | Sim | 0 |
| total_observacoes | integer | Sim | 0 |
| status | text | Sim | 'planejada'::text |
| relatorio_url | text | Sim | - |
| data_relatorio | date | Sim | - |
| conclusao | text | Sim | - |
| recomendacoes | text | Sim | - |
| pontos_fortes | text | Sim | - |
| oportunidades_melhoria | text | Sim | - |
| certificado_emitido | boolean | Sim | false |
| certificado_url | text | Sim | - |
| certificado_validade | date | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### auditorias_itens

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| auditoria_id | uuid | Não | - |
| requisito_id | uuid | Sim | - |
| numero_item | text | Não | - |
| clausula | text | Sim | - |
| descricao | text | Não | - |
| departamento | text | Sim | - |
| processo | text | Sim | - |
| data_verificacao | timestamp with time zone | Sim | now() |
| metodo_verificacao | text | Sim | - |
| resultado | text | Não | - |
| evidencias | text | Sim | - |
| evidencias_urls | ARRAY | Sim | - |
| criticidade | text | Sim | - |
| impacto | text | Sim | - |
| nao_conformidade_id | uuid | Sim | - |
| responsavel_area | text | Sim | - |
| observacoes | text | Sim | - |
| comentarios_auditor | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### bancos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo_banco | text | Não | - |
| nome_banco | text | Não | - |
| agencia | text | Não | - |
| agencia_digito | text | Sim | - |
| conta | text | Não | - |
| conta_digito | text | Sim | - |
| tipo_conta | text | Sim | 'corrente'::text |
| apelido | text | Não | - |
| saldo_inicial | numeric | Sim | 0 |
| saldo_atual | numeric | Sim | 0 |
| data_saldo | date | Sim | CURRENT_DATE |
| limite_cheque_especial | numeric | Sim | 0 |
| limite_usado | numeric | Sim | 0 |
| chave_pix | text | Sim | - |
| tipo_chave_pix | text | Sim | - |
| pluggy_item_id | text | Sim | - |
| pluggy_account_id | text | Sim | - |
| sincronizacao_automatica | boolean | Sim | false |
| ultima_sincronizacao | timestamp with time zone | Sim | - |
| ativo | boolean | Sim | true |
| conta_principal | boolean | Sim | false |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### bi_dimensao_produto

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| produto_id | uuid | Não | - |
| empresa_id | uuid | Não | - |
| codigo_sku | text | Sim | - |
| descricao | text | Sim | - |
| categoria | text | Sim | - |
| subcategoria | text | Sim | - |
| fabricante | text | Sim | - |
| valor_medio | numeric | Sim | - |
| ativo | boolean | Sim | - |
| atualizado_em | timestamp with time zone | Sim | now() |

### bi_dimensao_tempo

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| data | date | Não | - |
| ano | integer | Não | - |
| trimestre | integer | Sim | - |
| mes | integer | Sim | - |
| semana | integer | Sim | - |
| dia | integer | Sim | - |
| dia_semana | integer | Sim | - |
| dia_ano | integer | Sim | - |
| nome_mes | text | Sim | - |
| nome_dia_semana | text | Sim | - |
| fim_semana | boolean | Sim | - |
| feriado | boolean | Sim | false |
| nome_feriado | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### bi_fato_estoque

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| data_id | uuid | Sim | - |
| produto_id | uuid | Sim | - |
| quantidade_inicial | integer | Sim | - |
| entradas | integer | Sim | 0 |
| saidas | integer | Sim | 0 |
| quantidade_final | integer | Sim | - |
| valor_medio | numeric | Sim | - |
| valor_total | numeric | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### bi_fato_vendas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| data_id | uuid | Sim | - |
| produto_id | uuid | Sim | - |
| cliente_nome | text | Sim | - |
| quantidade | numeric | Sim | - |
| valor_unitario | numeric | Sim | - |
| valor_total | numeric | Sim | - |
| valor_custo | numeric | Sim | - |
| margem | numeric | Sim | - |
| origem | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### centros_custo

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| centro_custo_pai_id | uuid | Sim | - |
| nivel | integer | Sim | 1 |
| caminho | text | Sim | - |
| tipo | text | Sim | 'despesa'::text |
| orcamento_mensal | numeric | Sim | - |
| orcamento_anual | numeric | Sim | - |
| responsavel_id | uuid | Sim | - |
| ativo | boolean | Sim | true |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### chatbot_conversas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| sessao_id | uuid | Não | - |
| titulo | text | Sim | - |
| topico | text | Sim | - |
| conversa_pai_id | uuid | Sim | - |
| ordem | integer | Sim | 0 |
| status | text | Sim | 'ativa'::text |
| resumo_automatico | text | Sim | - |
| tags | ARRAY | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### chatbot_mensagens

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| sessao_id | uuid | Não | - |
| conversa_id | uuid | Sim | - |
| tipo_remetente | text | Não | - |
| usuario_id | uuid | Sim | - |
| mensagem | text | Não | - |
| mensagem_formatada | text | Sim | - |
| anexos_urls | ARRAY | Sim | - |
| imagens_urls | ARRAY | Sim | - |
| intencao | text | Sim | - |
| entidades_json | jsonb | Sim | - |
| sentimento | text | Sim | - |
| confianca | numeric | Sim | - |
| modelo_usado | text | Sim | - |
| tokens_prompt | integer | Sim | - |
| tokens_completion | integer | Sim | - |
| tokens_total | integer | Sim | - |
| tempo_resposta_ms | integer | Sim | - |
| util | boolean | Sim | - |
| motivo_nao_util | text | Sim | - |
| acoes_sugeridas_json | jsonb | Sim | - |
| acao_executada | boolean | Sim | false |
| acao_resultado_json | jsonb | Sim | - |
| fontes_json | jsonb | Sim | - |
| erro | boolean | Sim | false |
| erro_mensagem | text | Sim | - |
| requer_atencao_humana | boolean | Sim | false |
| criado_em | timestamp with time zone | Sim | now() |

### chatbot_sessoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| usuario_id | uuid | Não | - |
| titulo | text | Sim | - |
| descricao | text | Sim | - |
| contexto_tipo | text | Sim | 'geral'::text |
| contexto_id | uuid | Sim | - |
| modelo_ia | text | Sim | 'gpt-4'::text |
| temperatura | numeric | Sim | 0.7 |
| max_tokens | integer | Sim | 2000 |
| idioma | text | Sim | 'pt-BR'::text |
| modo | text | Sim | 'assistente'::text |
| total_mensagens | integer | Sim | 0 |
| total_tokens_usados | integer | Sim | 0 |
| total_pesquisas | integer | Sim | 0 |
| avaliacao | integer | Sim | - |
| feedback | text | Sim | - |
| ativa | boolean | Sim | true |
| ultima_interacao | timestamp with time zone | Sim | now() |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| encerrado_em | timestamp with time zone | Sim | - |

### cirurgia_eventos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| cirurgia_id | uuid | Não | - |
| tipo | text | Não | - |
| titulo | text | Não | - |
| descricao | text | Sim | - |
| dados_json | jsonb | Sim | - |
| usuario_id | uuid | Sim | - |
| usuario_nome | text | Sim | - |
| ocorrido_em | timestamp with time zone | Sim | now() |
| criado_em | timestamp with time zone | Sim | now() |

### cirurgia_materiais

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| cirurgia_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| lote_id | uuid | Sim | - |
| quantidade_prevista | integer | Não | 1 |
| quantidade_utilizada | integer | Sim | 0 |
| quantidade_devolvida | integer | Sim | 0 |
| valor_unitario | numeric | Sim | - |
| valor_total | numeric | Sim | - |
| desconto_percentual | numeric | Sim | 0 |
| desconto_valor | numeric | Sim | 0 |
| status | text | Sim | 'solicitado'::text |
| tipo_origem | text | Sim | 'estoque'::text |
| numero_serie | text | Sim | - |
| data_uso | timestamp with time zone | Sim | - |
| responsavel_uso | uuid | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### cirurgias

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo_interno | text | Sim | - |
| medico_id | uuid | Sim | - |
| hospital_id | uuid | Sim | - |
| paciente_iniciais | text | Não | - |
| procedimento | text | Não | - |
| data_cirurgia | date | Não | - |
| hora_cirurgia | time without time zone | Não | - |
| sala | text | Sim | - |
| status | text | Sim | 'agendada'::text |
| prioridade | text | Sim | 'media'::text |
| observacoes | text | Sim | - |
| valor_estimado | numeric | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### comentarios

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| entidade_tipo | text | Não | - |
| entidade_id | uuid | Não | - |
| usuario_id | uuid | Não | - |
| comentario | text | Não | - |
| comentario_pai_id | uuid | Sim | - |
| mencoes_ids | ARRAY | Sim | - |
| anexos_urls | ARRAY | Sim | - |
| editado | boolean | Sim | false |
| editado_em | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### compliance_evidencias

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| requisito_id | uuid | Não | - |
| titulo | text | Não | - |
| descricao | text | Sim | - |
| tipo | text | Não | - |
| arquivo_url | text | Não | - |
| arquivo_nome | text | Sim | - |
| arquivo_tamanho | integer | Sim | - |
| arquivo_hash | text | Sim | - |
| data_documento | date | Sim | - |
| data_validade | date | Sim | - |
| valido | boolean | Sim | true |
| auditoria_id | uuid | Sim | - |
| nao_conformidade_id | uuid | Sim | - |
| categoria | text | Sim | - |
| tags | ARRAY | Sim | - |
| aprovado | boolean | Sim | false |
| aprovado_por_id | uuid | Sim | - |
| data_aprovacao | timestamp with time zone | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |

### compliance_requisitos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| titulo | text | Não | - |
| descricao | text | Não | - |
| tipo | text | Não | - |
| categoria | text | Sim | - |
| norma_base | text | Sim | - |
| artigo_clausula | text | Sim | - |
| versao | text | Sim | - |
| criticidade | text | Sim | 'media'::text |
| obrigatorio | boolean | Sim | true |
| frequencia_verificacao | text | Sim | - |
| proxima_verificacao | date | Sim | - |
| responsavel_id | uuid | Sim | - |
| departamento | text | Sim | - |
| status | text | Sim | 'ativo'::text |
| documentos_urls | ARRAY | Sim | - |
| checklist_json | jsonb | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### contas_pagar

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| descricao | text | Não | - |
| tipo | text | Sim | 'fornecedor'::text |
| fornecedor_id | uuid | Sim | - |
| fornecedor_nome | text | Sim | - |
| fornecedor_cnpj | text | Sim | - |
| nota_fiscal_id | uuid | Sim | - |
| pedido_compra_id | uuid | Sim | - |
| numero_documento | text | Sim | - |
| valor_original | numeric | Não | - |
| valor_juros | numeric | Sim | 0 |
| valor_multa | numeric | Sim | 0 |
| valor_desconto | numeric | Sim | 0 |
| valor_pago | numeric | Sim | 0 |
| valor_saldo | numeric | Sim | - |
| data_emissao | date | Não | - |
| data_vencimento | date | Não | - |
| data_pagamento | date | Sim | - |
| centro_custo_id | uuid | Sim | - |
| categoria | text | Sim | - |
| plano_contas_id | uuid | Sim | - |
| forma_pagamento | text | Sim | 'transferencia'::text |
| banco_id | uuid | Sim | - |
| numero_parcela | integer | Sim | - |
| total_parcelas | integer | Sim | - |
| status | text | Sim | 'pendente'::text |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### contas_receber

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| descricao | text | Não | - |
| tipo | text | Sim | 'venda'::text |
| cliente_nome | text | Não | - |
| cliente_cnpj | text | Sim | - |
| cliente_id | uuid | Sim | - |
| nota_fiscal_id | uuid | Sim | - |
| fatura_id | uuid | Sim | - |
| numero_documento | text | Sim | - |
| valor_original | numeric | Não | - |
| valor_juros | numeric | Sim | 0 |
| valor_desconto | numeric | Sim | 0 |
| valor_recebido | numeric | Sim | 0 |
| valor_saldo | numeric | Sim | - |
| data_emissao | date | Não | - |
| data_vencimento | date | Não | - |
| data_recebimento | date | Sim | - |
| centro_custo_id | uuid | Sim | - |
| categoria | text | Sim | - |
| plano_contas_id | uuid | Sim | - |
| forma_recebimento | text | Sim | 'transferencia'::text |
| banco_id | uuid | Sim | - |
| numero_parcela | integer | Sim | - |
| total_parcelas | integer | Sim | - |
| status | text | Sim | 'pendente'::text |
| boleto_url | text | Sim | - |
| boleto_nosso_numero | text | Sim | - |
| data_protesto | date | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### contratos_consignacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| fornecedor_id | uuid | Não | - |
| numero_contrato | text | Não | - |
| descricao | text | Sim | - |
| tipo | text | Sim | 'consignacao_pura'::text |
| data_inicio | date | Não | - |
| data_fim | date | Sim | - |
| prazo_meses | integer | Sim | - |
| renovacao_automatica | boolean | Sim | false |
| prazo_pagamento_dias | integer | Sim | 30 |
| percentual_desconto | numeric | Sim | 0 |
| prazo_devolucao_dias | integer | Sim | 7 |
| valor_minimo_faturamento | numeric | Sim | - |
| responsavel_estoque | text | Sim | - |
| responsavel_contrato_id | uuid | Sim | - |
| observacoes | text | Sim | - |
| anexo_url | text | Sim | - |
| status | text | Sim | 'rascunho'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### convenios

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| razao_social | text | Sim | - |
| cnpj | text | Sim | - |
| ans_registro | text | Sim | - |
| tipo | text | Sim | 'plano_saude'::text |
| telefone | text | Sim | - |
| email | text | Sim | - |
| site | text | Sim | - |
| cep | text | Sim | - |
| endereco | text | Sim | - |
| numero | text | Sim | - |
| complemento | text | Sim | - |
| bairro | text | Sim | - |
| cidade | text | Sim | - |
| estado | text | Sim | - |
| prazo_pagamento_dias | integer | Sim | 30 |
| percentual_desconto | numeric | Sim | 0 |
| observacoes | text | Sim | - |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### cotacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| descricao | text | Sim | - |
| tipo | text | Sim | 'preco'::text |
| solicitacao_compra_id | uuid | Sim | - |
| comprador_id | uuid | Não | - |
| data_abertura | date | Sim | CURRENT_DATE |
| data_fechamento | date | Não | - |
| data_limite_resposta | date | Sim | - |
| condicoes_pagamento | text | Sim | - |
| prazo_entrega_dias | integer | Sim | - |
| local_entrega | text | Sim | - |
| observacoes | text | Sim | - |
| status | text | Sim | 'rascunho'::text |
| fornecedor_vencedor_id | uuid | Sim | - |
| valor_total_vencedor | numeric | Sim | - |
| motivo_escolha | text | Sim | - |
| data_decisao | date | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### dashboards

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| tipo | text | Sim | - |
| layout_json | jsonb | Sim | - |
| publico | boolean | Sim | false |
| criado_por_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### devolucoes_consignacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| remessa_consignacao_id | uuid | Não | - |
| fornecedor_id | uuid | Não | - |
| data_devolucao | date | Sim | CURRENT_DATE |
| data_coleta_prevista | date | Sim | - |
| data_coleta_realizada | date | Sim | - |
| responsavel_devolucao_id | uuid | Sim | - |
| recebido_por | text | Sim | - |
| valor_total_devolvido | numeric | Sim | 0 |
| valor_desconto_avaria | numeric | Sim | 0 |
| valor_liquido | numeric | Sim | - |
| transportadora | text | Sim | - |
| rastreamento | text | Sim | - |
| nota_fiscal_devolucao_id | uuid | Sim | - |
| motivo | text | Não | - |
| motivo_detalhado | text | Sim | - |
| status | text | Sim | 'rascunho'::text |
| conferido | boolean | Sim | false |
| data_conferencia | date | Sim | - |
| conferido_por | text | Sim | - |
| divergencias | text | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### documentos_licitacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| licitacao_id | uuid | Não | - |
| proposta_id | uuid | Sim | - |
| tipo | text | Não | - |
| titulo | text | Não | - |
| descricao | text | Sim | - |
| numero_documento | text | Sim | - |
| arquivo_url | text | Não | - |
| arquivo_nome | text | Sim | - |
| arquivo_tamanho | integer | Sim | - |
| arquivo_hash | text | Sim | - |
| origem | text | Sim | 'empresa'::text |
| emitido_por | text | Sim | - |
| data_emissao | date | Sim | - |
| data_validade | date | Sim | - |
| valido | boolean | Sim | true |
| obrigatorio | boolean | Sim | false |
| exigido_edital | boolean | Sim | false |
| enviado_portal | boolean | Sim | false |
| data_envio_portal | timestamp with time zone | Sim | - |
| analisado | boolean | Sim | false |
| aprovado | boolean | Sim | - |
| data_analise | timestamp with time zone | Sim | - |
| parecer | text | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |

### emails_enviados

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | uuid_generate_v4() |
| para | ARRAY | Não | - |
| cc | ARRAY | Sim | - |
| cco | ARRAY | Sim | - |
| assunto | character varying(500) | Não | - |
| corpo_resumo | text | Sim | - |
| tipo | character varying(50) | Sim | - |
| entidade_tipo | character varying(50) | Sim | - |
| entidade_id | uuid | Sim | - |
| anexos_nomes | ARRAY | Sim | - |
| status | character varying(20) | Sim | 'enviado'::character varying |
| erro_mensagem | text | Sim | - |
| usuario_id | uuid | Não | - |
| data_envio | timestamp with time zone | Não | now() |
| ip_address | inet | Sim | - |
| user_agent | text | Sim | - |

### empresas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| nome | text | Não | - |
| razao_social | text | Sim | - |
| cnpj | text | Não | - |
| inscricao_estadual | text | Sim | - |
| licenca_anvisa | text | Sim | - |
| telefone | text | Sim | - |
| email | text | Sim | - |
| cep | text | Sim | - |
| endereco | text | Sim | - |
| numero | text | Sim | - |
| complemento | text | Sim | - |
| bairro | text | Sim | - |
| cidade | text | Sim | - |
| estado | text | Sim | - |
| status | text | Sim | 'ativa'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| dpo_nome | text | Sim | - |
| dpo_email | text | Sim | - |
| dpo_telefone | text | Sim | - |
| dpo_cpf | text | Sim | - |
| dpo_nomeado_em | timestamp with time zone | Sim | - |
| dpo_tipo | text | Sim | 'interno'::text |

### entregas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| tipo | text | Não | - |
| documento_origem_tipo | text | Sim | - |
| documento_origem_id | uuid | Sim | - |
| documento_numero | text | Sim | - |
| remessa_consignacao_id | uuid | Sim | - |
| nota_fiscal_id | uuid | Sim | - |
| cirurgia_id | uuid | Sim | - |
| remetente_tipo | text | Sim | - |
| remetente_nome | text | Não | - |
| remetente_cnpj | text | Sim | - |
| remetente_endereco | text | Sim | - |
| remetente_cidade | text | Sim | - |
| remetente_estado | text | Sim | - |
| destinatario_tipo | text | Sim | - |
| destinatario_nome | text | Não | - |
| destinatario_cnpj | text | Sim | - |
| destinatario_contato | text | Sim | - |
| destinatario_telefone | text | Sim | - |
| destinatario_endereco | text | Não | - |
| destinatario_cidade | text | Não | - |
| destinatario_estado | text | Não | - |
| destinatario_cep | text | Sim | - |
| destinatario_referencia | text | Sim | - |
| data_programada | date | Não | - |
| hora_programada | time without time zone | Sim | - |
| data_saida | date | Sim | - |
| hora_saida | time without time zone | Sim | - |
| data_entrega_prevista | date | Não | - |
| data_entrega_realizada | date | Sim | - |
| hora_entrega | time without time zone | Sim | - |
| tipo_transporte | text | Sim | 'transportadora'::text |
| transportadora_id | uuid | Sim | - |
| transportadora_nome | text | Sim | - |
| transportadora_cnpj | text | Sim | - |
| motorista_nome | text | Sim | - |
| motorista_cpf | text | Sim | - |
| motorista_telefone | text | Sim | - |
| veiculo_placa | text | Sim | - |
| veiculo_tipo | text | Sim | - |
| codigo_rastreamento | text | Sim | - |
| url_rastreamento | text | Sim | - |
| quantidade_volumes | integer | Sim | 1 |
| peso_total | numeric | Sim | - |
| valor_declarado | numeric | Sim | - |
| temperatura_controlada | boolean | Sim | false |
| temperatura_min | numeric | Sim | - |
| temperatura_max | numeric | Sim | - |
| fragil | boolean | Sim | false |
| perigoso | boolean | Sim | false |
| materiais_json | jsonb | Sim | - |
| recebido_por_nome | text | Sim | - |
| recebido_por_cpf | text | Sim | - |
| recebido_por_funcao | text | Sim | - |
| assinatura_url | text | Sim | - |
| foto_entrega_url | text | Sim | - |
| status | text | Sim | 'agendada'::text |
| tentativas_entrega | integer | Sim | 0 |
| motivo_nao_entrega | text | Sim | - |
| ocorrencias | text | Sim | - |
| valor_frete | numeric | Sim | - |
| valor_seguro | numeric | Sim | - |
| outras_despesas | numeric | Sim | - |
| valor_total_entrega | numeric | Sim | - |
| canhoto_url | text | Sim | - |
| danfe_url | text | Sim | - |
| outros_documentos_urls | ARRAY | Sim | - |
| latitude_origem | numeric | Sim | - |
| longitude_origem | numeric | Sim | - |
| latitude_destino | numeric | Sim | - |
| longitude_destino | numeric | Sim | - |
| distancia_km | numeric | Sim | - |
| rota_planejada_json | jsonb | Sim | - |
| rota_realizada_json | jsonb | Sim | - |
| urgente | boolean | Sim | false |
| prioridade | text | Sim | 'media'::text |
| observacoes | text | Sim | - |
| instrucoes_especiais | text | Sim | - |
| avaliacao_entrega | integer | Sim | - |
| comentario_avaliacao | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### estoque

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| lote_id | uuid | Sim | - |
| localizacao | text | Sim | - |
| secao | text | Sim | - |
| corredor | text | Sim | - |
| prateleira | text | Sim | - |
| quantidade_disponivel | integer | Não | 0 |
| quantidade_reservada | integer | Não | 0 |
| quantidade_minima | integer | Sim | 10 |
| quantidade_maxima | integer | Sim | - |
| custo_unitario | numeric | Sim | - |
| custo_medio | numeric | Sim | - |
| valor_total | numeric | Sim | - |
| ultima_movimentacao | timestamp with time zone | Sim | - |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### estoque_movimentacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| estoque_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| lote_id | uuid | Sim | - |
| tipo | text | Não | - |
| quantidade | integer | Não | - |
| quantidade_anterior | integer | Sim | - |
| quantidade_posterior | integer | Sim | - |
| valor_unitario | numeric | Sim | - |
| valor_total | numeric | Sim | - |
| documento_tipo | text | Sim | - |
| documento_id | uuid | Sim | - |
| documento_numero | text | Sim | - |
| motivo | text | Sim | - |
| observacoes | text | Sim | - |
| data_movimentacao | timestamp with time zone | Sim | now() |
| usuario_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### estoque_reservas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| estoque_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| lote_id | uuid | Sim | - |
| quantidade | integer | Não | - |
| quantidade_consumida | integer | Sim | 0 |
| quantidade_disponivel | integer | Sim | - |
| tipo_reserva | text | Não | - |
| referencia_tipo | text | Sim | - |
| referencia_id | uuid | Sim | - |
| cirurgia_id | uuid | Sim | - |
| responsavel_id | uuid | Não | - |
| data_reserva | timestamp with time zone | Sim | now() |
| data_validade_reserva | timestamp with time zone | Não | - |
| data_liberacao | timestamp with time zone | Sim | - |
| status | text | Sim | 'ativa'::text |
| motivo_liberacao | text | Sim | - |
| observacoes | text | Sim | - |
| prioridade | text | Sim | 'media'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| liberado_por | uuid | Sim | - |

### faturas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero_nfe | text | Não | - |
| serie | text | Não | - |
| tipo | text | Não | - |
| cliente_tipo | text | Sim | - |
| cliente_id | uuid | Sim | - |
| cliente_nome | text | Não | - |
| cliente_cpf_cnpj | text | Não | - |
| data_emissao | timestamp with time zone | Sim | now() |
| data_vencimento | date | Sim | - |
| data_pagamento | timestamp with time zone | Sim | - |
| valor_produtos | numeric | Não | 0 |
| valor_desconto | numeric | Sim | 0 |
| valor_frete | numeric | Sim | 0 |
| valor_impostos | numeric | Sim | 0 |
| valor_total | numeric | Não | - |
| status | text | Não | 'pendente'::text |
| status_sefaz | text | Sim | - |
| chave_acesso | text | Sim | - |
| protocolo_autorizacao | text | Sim | - |
| pedido_id | uuid | Sim | - |
| cirurgia_id | uuid | Sim | - |
| natureza_operacao | text | Sim | - |
| cfop | text | Sim | - |
| forma_pagamento | text | Sim | - |
| xml_nfe | text | Sim | - |
| pdf_url | text | Sim | - |
| observacoes | text | Sim | - |
| observacoes_internas | text | Sim | - |
| emitida_por | uuid | Sim | - |
| cancelada_por | uuid | Sim | - |
| motivo_cancelamento | text | Sim | - |
| data_cancelamento | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### favoritos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| usuario_id | uuid | Não | - |
| entidade_tipo | text | Não | - |
| entidade_id | uuid | Não | - |
| entidade_nome | text | Sim | - |
| ordem | integer | Sim | 0 |
| pasta | text | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### fluxo_caixa

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| tipo | text | Não | - |
| categoria | text | Não | - |
| descricao | text | Não | - |
| observacoes | text | Sim | - |
| banco_id | uuid | Sim | - |
| banco_nome | text | Sim | - |
| valor | numeric | Não | - |
| saldo_anterior | numeric | Sim | - |
| saldo_atual | numeric | Sim | - |
| origem_tipo | text | Sim | - |
| origem_id | uuid | Sim | - |
| documento_numero | text | Sim | - |
| centro_custo_id | uuid | Sim | - |
| plano_contas_id | uuid | Sim | - |
| forma | text | Sim | - |
| data_movimentacao | date | Não | CURRENT_DATE |
| data_compensacao | date | Sim | - |
| status | text | Sim | 'confirmado'::text |
| conciliado | boolean | Sim | false |
| data_conciliacao | date | Sim | - |
| conta_destino_id | uuid | Sim | - |
| usuario_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### fornecedores

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| cnpj | text | Sim | - |
| email | text | Sim | - |
| telefone | text | Sim | - |
| endereco | text | Sim | - |
| categoria | text | Sim | - |
| rating | numeric | Sim | - |
| volume_compras | numeric | Sim | 0 |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### fornecedores_produtos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| fornecedor_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| codigo_fornecedor | text | Sim | - |
| descricao_fornecedor | text | Sim | - |
| marca | text | Sim | - |
| modelo | text | Sim | - |
| preco_unitario | numeric | Sim | - |
| preco_ultima_compra | numeric | Sim | - |
| data_ultima_compra | date | Sim | - |
| prazo_entrega_dias | integer | Sim | - |
| quantidade_minima | integer | Sim | 1 |
| quantidade_multiplo | integer | Sim | 1 |
| desconto_percentual | numeric | Sim | 0 |
| fornecedor_preferencial | boolean | Sim | false |
| ultima_avaliacao | integer | Sim | - |
| observacoes | text | Sim | - |
| ativo | boolean | Sim | true |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### hospitais

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| cnpj | text | Sim | - |
| telefone | text | Sim | - |
| email | text | Sim | - |
| cep | text | Sim | - |
| endereco | text | Sim | - |
| cidade | text | Sim | - |
| estado | text | Sim | - |
| tipo | text | Sim | 'hospital'::text |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### itens_consignacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| remessa_consignacao_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| lote_id | uuid | Sim | - |
| numero_item | integer | Não | - |
| numero_serie | text | Sim | - |
| quantidade_enviada | integer | Não | - |
| quantidade_utilizada | integer | Sim | 0 |
| quantidade_devolvida | integer | Sim | 0 |
| quantidade_pendente | integer | Sim | - |
| valor_unitario | numeric | Não | - |
| valor_total | numeric | Não | - |
| data_validade | date | Sim | - |
| registro_anvisa | text | Sim | - |
| cirurgia_material_id | uuid | Sim | - |
| data_utilizacao | timestamp with time zone | Sim | - |
| responsavel_utilizacao | uuid | Sim | - |
| data_devolucao | timestamp with time zone | Sim | - |
| motivo_devolucao | text | Sim | - |
| condicao_devolucao | text | Sim | - |
| status | text | Sim | 'disponivel'::text |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### itens_cotacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| cotacao_id | uuid | Não | - |
| fornecedor_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| quantidade | integer | Não | - |
| especificacao_solicitada | text | Sim | - |
| valor_unitario | numeric | Sim | - |
| desconto_percentual | numeric | Sim | 0 |
| valor_total | numeric | Sim | - |
| prazo_entrega_dias | integer | Sim | - |
| marca_oferecida | text | Sim | - |
| modelo_oferecido | text | Sim | - |
| observacoes_fornecedor | text | Sim | - |
| aliquota_ipi | numeric | Sim | - |
| aliquota_icms | numeric | Sim | - |
| pontuacao_qualidade | integer | Sim | - |
| pontuacao_preco | integer | Sim | - |
| pontuacao_prazo | integer | Sim | - |
| pontuacao_total | numeric | Sim | - |
| status | text | Sim | 'aguardando'::text |
| data_resposta | timestamp with time zone | Sim | - |
| selecionado | boolean | Sim | false |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### itens_kit

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| kit_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| lote_id | uuid | Sim | - |
| quantidade | integer | Não | 1 |
| quantidade_consumida | integer | Sim | 0 |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### itens_pedido_compra

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| pedido_compra_id | uuid | Não | - |
| produto_id | uuid | Não | - |
| quantidade | integer | Não | - |
| quantidade_recebida | integer | Sim | 0 |
| quantidade_pendente | integer | Sim | - |
| valor_unitario | numeric | Não | - |
| desconto_percentual | numeric | Sim | 0 |
| desconto_valor | numeric | Sim | 0 |
| valor_total | numeric | Não | - |
| aliquota_ipi | numeric | Sim | 0 |
| valor_ipi | numeric | Sim | 0 |
| aliquota_icms | numeric | Sim | 0 |
| valor_icms | numeric | Sim | 0 |
| data_entrega_prevista | date | Sim | - |
| data_entrega_realizada | date | Sim | - |
| solicitacao_compra_id | uuid | Sim | - |
| numero_item | integer | Sim | - |
| observacoes | text | Sim | - |
| especificacoes_tecnicas | text | Sim | - |
| status | text | Sim | 'pendente'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### itens_proposta

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| proposta_id | uuid | Não | - |
| produto_id | uuid | Sim | - |
| numero_item | integer | Não | - |
| tipo | text | Sim | 'produto'::text |
| codigo | text | Sim | - |
| descricao | text | Não | - |
| especificacoes | text | Sim | - |
| quantidade | numeric | Não | 1 |
| unidade | text | Sim | 'UN'::text |
| valor_unitario | numeric | Não | - |
| desconto_percentual | numeric | Sim | 0 |
| desconto_valor | numeric | Sim | 0 |
| valor_total | numeric | Não | - |
| aliquota_imposto | numeric | Sim | 0 |
| valor_imposto | numeric | Sim | 0 |
| observacoes | text | Sim | - |
| imagem_url | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### kits

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| cirurgia_id | uuid | Sim | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| status | text | Sim | 'planejamento'::text |
| data_montagem | timestamp with time zone | Sim | - |
| data_consumo | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### kpi_metas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| categoria | text | Sim | - |
| tipo_metrica | text | Sim | - |
| unidade | text | Sim | - |
| periodicidade | text | Sim | - |
| meta_valor | numeric | Não | - |
| meta_minima | numeric | Sim | - |
| meta_ideal | numeric | Sim | - |
| sentido | text | Sim | 'crescente'::text |
| formula | text | Sim | - |
| responsavel_id | uuid | Sim | - |
| ativo | boolean | Sim | true |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### kpi_realizacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| kpi_meta_id | uuid | Não | - |
| empresa_id | uuid | Não | - |
| periodo_inicio | date | Não | - |
| periodo_fim | date | Não | - |
| valor_realizado | numeric | Não | - |
| valor_meta | numeric | Sim | - |
| percentual_atingido | numeric | Sim | - |
| status | text | Sim | - |
| tendencia | text | Sim | - |
| observacoes | text | Sim | - |
| calculado_em | timestamp with time zone | Sim | now() |
| criado_em | timestamp with time zone | Sim | now() |

### lancamentos_contabeis

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero_lancamento | text | Não | - |
| tipo | text | Não | - |
| plano_contas_codigo | text | Não | - |
| plano_contas_nome | text | Sim | - |
| historico | text | Não | - |
| complemento | text | Sim | - |
| valor | numeric | Não | - |
| centro_custo_id | uuid | Sim | - |
| documento_tipo | text | Sim | - |
| documento_id | uuid | Sim | - |
| documento_numero | text | Sim | - |
| data_lancamento | date | Não | - |
| data_competencia | date | Sim | - |
| lote_id | uuid | Sim | - |
| status | text | Sim | 'definitivo'::text |
| conciliado | boolean | Sim | false |
| data_conciliacao | date | Sim | - |
| usuario_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### leads

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| empresa_origem | text | Sim | - |
| cargo | text | Sim | - |
| email | text | Sim | - |
| telefone | text | Sim | - |
| valor_estimado | numeric | Sim | - |
| estagio | text | Sim | 'prospeccao'::text |
| probabilidade | integer | Sim | 50 |
| rating | integer | Sim | - |
| proxima_acao | text | Sim | - |
| data_ultimo_contato | date | Sim | - |
| responsavel_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### licitacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero_processo | text | Não | - |
| numero_edital | text | Sim | - |
| objeto | text | Não | - |
| descricao | text | Sim | - |
| modalidade | text | Não | - |
| tipo_contratacao | text | Sim | 'menor_preco'::text |
| orgao_nome | text | Não | - |
| orgao_cnpj | text | Sim | - |
| orgao_esfera | text | Sim | - |
| orgao_cidade | text | Sim | - |
| orgao_estado | text | Sim | - |
| uasg | text | Sim | - |
| portal | text | Sim | - |
| url_portal | text | Sim | - |
| data_publicacao | date | Sim | - |
| data_abertura | timestamp with time zone | Não | - |
| data_encerramento | timestamp with time zone | Sim | - |
| data_julgamento | date | Sim | - |
| data_homologacao | date | Sim | - |
| data_adjudicacao | date | Sim | - |
| valor_estimado | numeric | Sim | - |
| valor_referencia | numeric | Sim | - |
| permite_consorcio | boolean | Sim | false |
| permite_subcontratacao | boolean | Sim | false |
| exclusiva_mepps | boolean | Sim | false |
| cota_mepps | numeric | Sim | - |
| exige_garantia | boolean | Sim | false |
| percentual_garantia | numeric | Sim | - |
| documentos_habilitacao | ARRAY | Sim | - |
| exige_amostra | boolean | Sim | false |
| exige_visita_tecnica | boolean | Sim | false |
| status_participacao | text | Sim | 'identificada'::text |
| vencedora | boolean | Sim | false |
| valor_vencedor | numeric | Sim | - |
| empresa_vencedora | text | Sim | - |
| contrato_id | uuid | Sim | - |
| numero_contrato | text | Sim | - |
| responsavel_id | uuid | Sim | - |
| edital_url | text | Sim | - |
| documentos_urls | ARRAY | Sim | - |
| observacoes | text | Sim | - |
| estrategia_participacao | text | Sim | - |
| motivo_nao_participacao | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### licitacoes_itens

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| licitacao_id | uuid | Não | - |
| numero_item | integer | Não | - |
| lote | integer | Sim | - |
| grupo | integer | Sim | - |
| descricao | text | Não | - |
| especificacao_tecnica | text | Sim | - |
| unidade_medida | text | Sim | 'UN'::text |
| produto_id | uuid | Sim | - |
| quantidade | numeric | Não | - |
| quantidade_minima | numeric | Sim | - |
| quantidade_maxima | numeric | Sim | - |
| valor_unitario_referencia | numeric | Sim | - |
| valor_total_referencia | numeric | Sim | - |
| marca_referencia | text | Sim | - |
| aceita_similar | boolean | Sim | true |
| codigo_catmat | text | Sim | - |
| ncm | text | Sim | - |
| prazo_entrega_dias | integer | Sim | - |
| local_entrega | text | Sim | - |
| exige_amostra | boolean | Sim | false |
| prazo_amostra_dias | integer | Sim | - |
| observacoes | text | Sim | - |
| criterios_aceitacao | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### lotes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| produto_id | uuid | Não | - |
| numero_lote | text | Não | - |
| numero_serie | text | Sim | - |
| data_fabricacao | date | Sim | - |
| data_validade | date | Não | - |
| quantidade_inicial | integer | Não | 0 |
| quantidade_disponivel | integer | Não | 0 |
| registro_anvisa | text | Sim | - |
| status | text | Sim | 'disponivel'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### medicos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| usuario_id | uuid | Sim | - |
| nome | text | Não | - |
| crm | text | Não | - |
| crm_uf | text | Não | - |
| especialidade | text | Não | - |
| telefone | text | Sim | - |
| email | text | Sim | - |
| cep | text | Sim | - |
| endereco | text | Sim | - |
| hospital_principal | text | Sim | - |
| volume_anual_estimado | numeric | Sim | - |
| cirurgias_realizadas | integer | Sim | 0 |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### microsoft_contatos_sync

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | uuid_generate_v4() |
| user_id | uuid | Não | - |
| total_contatos_sincronizados | integer | Sim | 0 |
| hospitais_sincronizados | integer | Sim | 0 |
| fornecedores_sincronizados | integer | Sim | 0 |
| medicos_sincronizados | integer | Sim | 0 |
| status | character varying(20) | Sim | 'concluida'::character varying |
| erro_mensagem | text | Sim | - |
| data_inicio | timestamp with time zone | Não | now() |
| data_fim | timestamp with time zone | Sim | - |

### microsoft_onedrive_files

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | uuid_generate_v4() |
| item_id | character varying(200) | Não | - |
| web_url | text | Não | - |
| nome_arquivo | character varying(500) | Não | - |
| tipo_arquivo | character varying(100) | Sim | - |
| tamanho_bytes | bigint | Sim | - |
| pasta | character varying(500) | Sim | - |
| tipo_documento | character varying(50) | Sim | - |
| entidade_tipo | character varying(50) | Sim | - |
| entidade_id | uuid | Sim | - |
| link_compartilhamento | text | Sim | - |
| compartilhado_com | ARRAY | Sim | - |
| usuario_upload | uuid | Não | - |
| data_upload | timestamp with time zone | Não | now() |

### microsoft_tokens

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | uuid_generate_v4() |
| user_id | uuid | Não | - |
| access_token | text | Não | - |
| refresh_token | text | Sim | - |
| id_token | text | Sim | - |
| account_email | character varying(200) | Não | - |
| expires_at | timestamp with time zone | Não | - |
| scopes | ARRAY | Sim | - |
| created_at | timestamp with time zone | Não | now() |
| last_used_at | timestamp with time zone | Sim | - |

### nao_conformidades

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| titulo | text | Não | - |
| descricao | text | Não | - |
| origem | text | Não | - |
| auditoria_id | uuid | Sim | - |
| auditoria_item_id | uuid | Sim | - |
| tipo | text | Não | - |
| categoria | text | Sim | - |
| requisito_id | uuid | Sim | - |
| norma_clausula | text | Sim | - |
| departamento | text | Sim | - |
| processo | text | Sim | - |
| criticidade | text | Não | - |
| impacto | text | Sim | - |
| risco_potencial | text | Sim | - |
| data_identificacao | date | Sim | CURRENT_DATE |
| data_limite_resposta | date | Não | - |
| data_resposta | date | Sim | - |
| identificada_por_id | uuid | Sim | - |
| responsavel_tratamento_id | uuid | Sim | - |
| causa_raiz | text | Sim | - |
| metodo_analise | text | Sim | - |
| status | text | Sim | 'aberta'::text |
| recorrente | boolean | Sim | false |
| nc_relacionada_id | uuid | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### negociacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| oportunidade_id | uuid | Não | - |
| proposta_id | uuid | Sim | - |
| tipo | text | Não | - |
| assunto | text | Não | - |
| descricao | text | Sim | - |
| responsavel_id | uuid | Não | - |
| participantes_internos | ARRAY | Sim | - |
| participantes_cliente | ARRAY | Sim | - |
| resultado | text | Sim | 'pendente'::text |
| proxima_acao | text | Sim | - |
| data_proxima_acao | date | Sim | - |
| valor_inicial | numeric | Sim | - |
| valor_proposto | numeric | Sim | - |
| valor_contraproposta | numeric | Sim | - |
| anexos_urls | ARRAY | Sim | - |
| gravacao_url | text | Sim | - |
| data_negociacao | timestamp with time zone | Sim | now() |
| duracao_minutos | integer | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### notas_fiscais

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| tipo | text | Não | - |
| modelo | text | Sim | - |
| serie | text | Sim | - |
| numero | text | Não | - |
| chave_acesso | text | Sim | - |
| fornecedor_id | uuid | Sim | - |
| fornecedor_cnpj | text | Sim | - |
| fornecedor_nome | text | Sim | - |
| destinatario_cnpj | text | Sim | - |
| destinatario_nome | text | Sim | - |
| data_emissao | date | Não | - |
| data_entrada_saida | date | Sim | - |
| data_vencimento | date | Sim | - |
| valor_produtos | numeric | Não | 0 |
| valor_frete | numeric | Sim | 0 |
| valor_seguro | numeric | Sim | 0 |
| valor_desconto | numeric | Sim | 0 |
| valor_outras_despesas | numeric | Sim | 0 |
| valor_icms | numeric | Sim | 0 |
| valor_ipi | numeric | Sim | 0 |
| valor_pis | numeric | Sim | 0 |
| valor_cofins | numeric | Sim | 0 |
| valor_total | numeric | Não | 0 |
| documento_origem_tipo | text | Sim | - |
| documento_origem_id | uuid | Sim | - |
| xml_url | text | Sim | - |
| pdf_url | text | Sim | - |
| danfe_url | text | Sim | - |
| status_sefaz | text | Sim | 'pendente'::text |
| protocolo_autorizacao | text | Sim | - |
| data_autorizacao | timestamp with time zone | Sim | - |
| observacoes | text | Sim | - |
| natureza_operacao | text | Sim | - |
| cfop | text | Sim | - |
| status | text | Sim | 'rascunho'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### notificacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| usuario_id | uuid | Não | - |
| tipo | text | Não | 'info'::text |
| prioridade | text | Sim | 'media'::text |
| titulo | text | Não | - |
| mensagem | text | Sim | - |
| icone | text | Sim | - |
| cor | text | Sim | - |
| entidade_tipo | text | Sim | - |
| entidade_id | uuid | Sim | - |
| url | text | Sim | - |
| acoes_json | jsonb | Sim | - |
| lida | boolean | Sim | false |
| lida_em | timestamp with time zone | Sim | - |
| arquivada | boolean | Sim | false |
| arquivada_em | timestamp with time zone | Sim | - |
| expira_em | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### oportunidades

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| lead_id | uuid | Sim | - |
| cliente_nome | text | Não | - |
| cliente_cnpj | text | Sim | - |
| cliente_email | text | Sim | - |
| cliente_telefone | text | Sim | - |
| vendedor_id | uuid | Não | - |
| origem | text | Sim | 'inbound'::text |
| tipo | text | Sim | 'nova_venda'::text |
| segmento | text | Sim | - |
| estagio | text | Sim | 'qualificacao'::text |
| probabilidade | integer | Sim | 50 |
| valor_estimado | numeric | Sim | - |
| valor_fechado | numeric | Sim | - |
| desconto_percentual | numeric | Sim | 0 |
| data_abertura | date | Sim | CURRENT_DATE |
| data_fechamento_prevista | date | Sim | - |
| data_fechamento_real | date | Sim | - |
| motivo_ganho | text | Sim | - |
| motivo_perda | text | Sim | - |
| concorrente | text | Sim | - |
| observacoes | text | Sim | - |
| proximos_passos | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### pacientes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome_completo | text | Não | - |
| cpf | text | Sim | - |
| rg | text | Sim | - |
| data_nascimento | date | Sim | - |
| sexo | text | Sim | - |
| telefone | text | Sim | - |
| celular | text | Sim | - |
| email | text | Sim | - |
| cep | text | Sim | - |
| endereco | text | Sim | - |
| numero | text | Sim | - |
| complemento | text | Sim | - |
| bairro | text | Sim | - |
| cidade | text | Sim | - |
| estado | text | Sim | - |
| peso | numeric | Sim | - |
| altura | numeric | Sim | - |
| tipo_sanguineo | text | Sim | - |
| alergias | text | Sim | - |
| comorbidades | text | Sim | - |
| medicamentos_uso | text | Sim | - |
| observacoes_medicas | text | Sim | - |
| consentimento_lgpd | boolean | Sim | false |
| data_consentimento | timestamp with time zone | Sim | - |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### pedidos_compra

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| fornecedor_id | uuid | Sim | - |
| valor_total | numeric | Não | - |
| status | text | Sim | 'rascunho'::text |
| urgencia | text | Sim | 'normal'::text |
| data_pedido | date | Sim | CURRENT_DATE |
| data_entrega_prevista | date | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### permission_groups

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| permissions_ids | ARRAY | Sim | - |
| ativo | boolean | Sim | true |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### permissions

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| recurso | text | Não | - |
| acao | text | Não | - |
| sistema | boolean | Sim | false |
| criado_em | timestamp with time zone | Sim | now() |

### pesquisas_gpt

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| usuario_id | uuid | Não | - |
| sessao_id | uuid | Sim | - |
| mensagem_id | uuid | Sim | - |
| query | text | Não | - |
| query_refinada | text | Sim | - |
| tipo | text | Sim | 'hibrida'::text |
| profundidade | text | Sim | 'normal'::text |
| max_resultados | integer | Sim | 10 |
| idiomas | ARRAY | Sim | ARRAY['pt'::text, 'en'::text] |
| fontes | ARRAY | Sim | - |
| urls_visitadas | ARRAY | Sim | - |
| total_fontes_consultadas | integer | Sim | 0 |
| status | text | Sim | 'pendente'::text |
| progresso | integer | Sim | 0 |
| relatorio_markdown | text | Sim | - |
| relatorio_html | text | Sim | - |
| resumo | text | Sim | - |
| referencias_json | jsonb | Sim | - |
| fontes_primarias | ARRAY | Sim | - |
| fontes_secundarias | ARRAY | Sim | - |
| palavras_chave | ARRAY | Sim | - |
| topicos_identificados | ARRAY | Sim | - |
| entidades_mencionadas | ARRAY | Sim | - |
| score_relevancia | numeric | Sim | - |
| score_confiabilidade | numeric | Sim | - |
| score_atualidade | numeric | Sim | - |
| tempo_execucao_segundos | integer | Sim | - |
| tokens_usados | integer | Sim | - |
| custo_estimado | numeric | Sim | - |
| pdf_url | text | Sim | - |
| docx_url | text | Sim | - |
| publico | boolean | Sim | false |
| compartilhado_com | ARRAY | Sim | - |
| avaliacao | integer | Sim | - |
| feedback | text | Sim | - |
| iniciado_em | timestamp with time zone | Sim | - |
| concluido_em | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### pluggy_accounts

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| connection_id | uuid | Não | - |
| banco_id | uuid | Sim | - |
| pluggy_account_id | text | Não | - |
| tipo | text | Sim | - |
| subtipo | text | Sim | - |
| nome | text | Sim | - |
| numero | text | Sim | - |
| saldo | numeric | Sim | - |
| moeda | text | Sim | 'BRL'::text |
| disponibilizado_em | timestamp with time zone | Sim | - |
| ultima_atualizacao | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### pluggy_connections

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| banco_id | uuid | Sim | - |
| pluggy_item_id | text | Não | - |
| instituicao_nome | text | Não | - |
| instituicao_tipo | text | Sim | - |
| status | text | Sim | 'ativa'::text |
| ultima_sincronizacao | timestamp with time zone | Sim | - |
| proxima_sincronizacao | timestamp with time zone | Sim | - |
| erro_mensagem | text | Sim | - |
| consentimento_expira_em | timestamp with time zone | Sim | - |
| webhook_url | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### pluggy_transactions

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| account_id | uuid | Não | - |
| pluggy_transaction_id | text | Não | - |
| data | date | Não | - |
| descricao | text | Sim | - |
| valor | numeric | Não | - |
| tipo | text | Não | - |
| categoria | text | Sim | - |
| merchant | text | Sim | - |
| payment_method | text | Sim | - |
| saldo_apos | numeric | Sim | - |
| provisionado | boolean | Sim | false |
| metadata_json | jsonb | Sim | - |
| sincronizado_fluxo_caixa | boolean | Sim | false |
| fluxo_caixa_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### portais_opme_config

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| codigo | text | Não | - |
| tipo | text | Não | - |
| hospital_id | uuid | Sim | - |
| convenio_id | uuid | Sim | - |
| entidade_nome | text | Não | - |
| entidade_cnpj | text | Sim | - |
| url_portal | text | Não | - |
| url_api | text | Sim | - |
| metodo_integracao | text | Sim | 'portal_web'::text |
| usuario | text | Sim | - |
| senha_hash | text | Sim | - |
| token_api | text | Sim | - |
| certificado_digital_url | text | Sim | - |
| api_versao | text | Sim | - |
| api_timeout | integer | Sim | 30 |
| api_retry_count | integer | Sim | 3 |
| api_headers_json | jsonb | Sim | - |
| requer_pre_aprovacao | boolean | Sim | true |
| prazo_resposta_horas | integer | Sim | 48 |
| permite_fracionamento | boolean | Sim | false |
| exige_laudo_medico | boolean | Sim | true |
| campos_obrigatorios | ARRAY | Sim | - |
| validacoes_json | jsonb | Sim | - |
| sincronizacao_automatica | boolean | Sim | false |
| intervalo_sincronizacao_minutos | integer | Sim | 60 |
| ultima_sincronizacao | timestamp with time zone | Sim | - |
| ativo | boolean | Sim | true |
| homologacao | boolean | Sim | false |
| contato_nome | text | Sim | - |
| contato_email | text | Sim | - |
| contato_telefone | text | Sim | - |
| suporte_email | text | Sim | - |
| suporte_telefone | text | Sim | - |
| observacoes | text | Sim | - |
| documentacao_url | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### portais_opme_logs

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| portal_config_id | uuid | Não | - |
| solicitacao_id | uuid | Sim | - |
| operacao | text | Não | - |
| metodo_http | text | Sim | - |
| url_chamada | text | Sim | - |
| request_headers_json | jsonb | Sim | - |
| request_body_json | jsonb | Sim | - |
| request_timestamp | timestamp with time zone | Sim | now() |
| response_status_code | integer | Sim | - |
| response_headers_json | jsonb | Sim | - |
| response_body_json | jsonb | Sim | - |
| response_timestamp | timestamp with time zone | Sim | - |
| response_time_ms | integer | Sim | - |
| sucesso | boolean | Não | - |
| mensagem_erro | text | Sim | - |
| erro_codigo | text | Sim | - |
| erro_detalhes | text | Sim | - |
| tentativa | integer | Sim | 1 |
| max_tentativas | integer | Sim | - |
| ip_origem | inet | Sim | - |
| user_agent | text | Sim | - |
| usuario_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### portais_opme_respostas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| solicitacao_id | uuid | Não | - |
| numero_resposta | text | Sim | - |
| tipo_resposta | text | Não | - |
| data_resposta | timestamp with time zone | Sim | now() |
| origem | text | Sim | 'portal'::text |
| aprovado | boolean | Sim | - |
| parcialmente_aprovado | boolean | Sim | false |
| itens_aprovados_json | jsonb | Sim | - |
| itens_negados_json | jsonb | Sim | - |
| valor_aprovado | numeric | Sim | - |
| valor_negado | numeric | Sim | - |
| valor_glosa | numeric | Sim | 0 |
| motivo_negacao | text | Sim | - |
| motivo_glosa | text | Sim | - |
| observacoes_portal | text | Sim | - |
| pendencias | ARRAY | Sim | - |
| documentos_pendentes | ARRAY | Sim | - |
| prazo_regularizacao | date | Sim | - |
| numero_autorizacao | text | Sim | - |
| codigo_autorizacao | text | Sim | - |
| validade_autorizacao | date | Sim | - |
| responsavel_portal | text | Sim | - |
| auditor_portal | text | Sim | - |
| documentos_urls | ARRAY | Sim | - |
| payload_resposta_json | jsonb | Sim | - |
| processada | boolean | Sim | false |
| data_processamento | timestamp with time zone | Sim | - |
| processada_por_id | uuid | Sim | - |
| observacoes_internas | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### portais_opme_solicitacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| portal_config_id | uuid | Não | - |
| numero_interno | text | Não | - |
| numero_portal | text | Sim | - |
| protocolo_portal | text | Sim | - |
| cirurgia_id | uuid | Não | - |
| paciente_id | uuid | Sim | - |
| paciente_nome | text | Não | - |
| paciente_carteirinha | text | Sim | - |
| medico_id | uuid | Sim | - |
| medico_nome | text | Não | - |
| medico_crm | text | Sim | - |
| hospital_id | uuid | Sim | - |
| convenio_id | uuid | Sim | - |
| procedimento | text | Não | - |
| data_cirurgia_prevista | date | Não | - |
| urgencia | text | Sim | 'eletiva'::text |
| materiais_json | jsonb | Não | - |
| valor_total_solicitado | numeric | Não | - |
| laudo_medico_url | text | Sim | - |
| pedido_medico_url | text | Sim | - |
| orcamento_url | text | Sim | - |
| outros_documentos_urls | ARRAY | Sim | - |
| data_envio | timestamp with time zone | Sim | - |
| enviado_por_id | uuid | Sim | - |
| metodo_envio | text | Sim | - |
| status | text | Sim | 'rascunho'::text |
| data_prazo_resposta | timestamp with time zone | Sim | - |
| data_resposta | timestamp with time zone | Sim | - |
| observacoes | text | Sim | - |
| motivo_cancelamento | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### produtos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo_sku | text | Não | - |
| descricao | text | Não | - |
| fabricante | text | Sim | - |
| registro_anvisa | text | Sim | - |
| categoria | text | Sim | - |
| subcategoria | text | Sim | - |
| valor_unitario | numeric | Sim | - |
| unidade_medida | text | Sim | 'UN'::text |
| status | text | Sim | 'ativo'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### profiles

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome_completo | text | Sim | - |
| avatar_url | text | Sim | - |
| telefone | text | Sim | - |
| celular | text | Sim | - |
| tema | text | Sim | 'auto'::text |
| idioma | text | Sim | 'pt-BR'::text |
| timezone | text | Sim | 'America/Sao_Paulo'::text |
| notificacoes_email | boolean | Sim | true |
| notificacoes_push | boolean | Sim | true |
| notificacoes_sms | boolean | Sim | false |
| ultimo_acesso | timestamp with time zone | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### propostas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| titulo | text | Não | - |
| descricao | text | Sim | - |
| versao | integer | Sim | 1 |
| oportunidade_id | uuid | Sim | - |
| cliente_nome | text | Não | - |
| cliente_cnpj | text | Sim | - |
| cliente_contato | text | Sim | - |
| elaborada_por_id | uuid | Não | - |
| aprovada_por_id | uuid | Sim | - |
| validade_dias | integer | Sim | 30 |
| data_validade | date | Sim | - |
| condicoes_pagamento | text | Sim | - |
| prazo_entrega | text | Sim | - |
| garantia | text | Sim | - |
| valor_produtos | numeric | Sim | 0 |
| valor_servicos | numeric | Sim | 0 |
| valor_frete | numeric | Sim | 0 |
| valor_desconto | numeric | Sim | 0 |
| valor_total | numeric | Não | - |
| valor_impostos | numeric | Sim | 0 |
| valor_liquido | numeric | Sim | - |
| status | text | Sim | 'rascunho'::text |
| data_envio | timestamp with time zone | Sim | - |
| data_resposta | timestamp with time zone | Sim | - |
| pdf_url | text | Sim | - |
| template_usado | text | Sim | - |
| observacoes_internas | text | Sim | - |
| observacoes_cliente | text | Sim | - |
| motivo_rejeicao | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### propostas_licitacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| licitacao_id | uuid | Não | - |
| numero_proposta | text | Não | - |
| versao | integer | Sim | 1 |
| tipo | text | Não | - |
| fase | text | Sim | - |
| elaborada_por_id | uuid | Não | - |
| data_elaboracao | date | Sim | CURRENT_DATE |
| data_envio | timestamp with time zone | Sim | - |
| metodo_envio | text | Sim | - |
| protocolo_envio | text | Sim | - |
| valor_total_proposta | numeric | Não | - |
| desconto_percentual | numeric | Sim | - |
| itens_propostos_json | jsonb | Não | - |
| prazo_entrega_dias | integer | Sim | - |
| condicoes_pagamento | text | Sim | - |
| validade_proposta_dias | integer | Sim | 60 |
| percentual_garantia | numeric | Sim | - |
| proposta_comercial_url | text | Sim | - |
| proposta_tecnica_url | text | Sim | - |
| documentos_habilitacao_urls | ARRAY | Sim | - |
| amostras_urls | ARRAY | Sim | - |
| classificacao | integer | Sim | - |
| pontuacao_tecnica | numeric | Sim | - |
| pontuacao_comercial | numeric | Sim | - |
| pontuacao_final | numeric | Sim | - |
| status | text | Sim | 'rascunho'::text |
| motivo_inabilitacao | text | Sim | - |
| motivo_desclassificacao | text | Sim | - |
| lance_inicial | numeric | Sim | - |
| lance_final | numeric | Sim | - |
| total_lances | integer | Sim | 0 |
| observacoes | text | Sim | - |
| estrategia | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### relatorios_agendamentos

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| template_id | uuid | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| cron_expressao | text | Não | - |
| timezone | text | Sim | 'America/Sao_Paulo'::text |
| destinatarios_emails | ARRAY | Sim | - |
| destinatarios_ids | ARRAY | Sim | - |
| parametros_json | jsonb | Sim | - |
| ativo | boolean | Sim | true |
| ultima_execucao | timestamp with time zone | Sim | - |
| proxima_execucao | timestamp with time zone | Sim | - |
| total_execucoes | integer | Sim | 0 |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### relatorios_regulatorios

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| template_id | uuid | Sim | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| tipo | text | Não | - |
| periodicidade | text | Sim | - |
| periodo_inicio | date | Não | - |
| periodo_fim | date | Não | - |
| status | text | Sim | 'rascunho'::text |
| dados_json | jsonb | Sim | - |
| arquivo_url | text | Sim | - |
| arquivo_hash | text | Sim | - |
| gerado_por_id | uuid | Sim | - |
| gerado_em | timestamp with time zone | Sim | - |
| enviado_em | timestamp with time zone | Sim | - |
| protocolo_envio | text | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### relatorios_templates

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| tipo | text | Não | - |
| formato | text | Sim | 'pdf'::text |
| template_conteudo | text | Sim | - |
| query_sql | text | Sim | - |
| configuracao_json | jsonb | Sim | - |
| ativo | boolean | Sim | true |
| sistema | boolean | Sim | false |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### remessas_consignacao

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| tipo | text | Sim | 'envio'::text |
| contrato_consignacao_id | uuid | Não | - |
| fornecedor_id | uuid | Não | - |
| hospital_id | uuid | Sim | - |
| local_destino | text | Não | - |
| endereco_entrega | text | Sim | - |
| cirurgia_id | uuid | Sim | - |
| medico_id | uuid | Sim | - |
| data_remessa | date | Sim | CURRENT_DATE |
| data_entrega_prevista | date | Não | - |
| data_entrega_realizada | date | Sim | - |
| data_vencimento_devolucao | date | Sim | - |
| responsavel_envio_id | uuid | Sim | - |
| responsavel_recebimento | text | Sim | - |
| valor_total_materiais | numeric | Sim | 0 |
| valor_frete | numeric | Sim | 0 |
| valor_total | numeric | Sim | - |
| transportadora | text | Sim | - |
| rastreamento | text | Sim | - |
| nota_fiscal_id | uuid | Sim | - |
| status | text | Sim | 'preparacao'::text |
| observacoes | text | Sim | - |
| condicoes_especiais | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### reunioes_teams

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | uuid_generate_v4() |
| evento_id | character varying(200) | Não | - |
| assunto | character varying(500) | Não | - |
| descricao | text | Sim | - |
| data_inicio | timestamp with time zone | Não | - |
| data_fim | timestamp with time zone | Não | - |
| link_reuniao | text | Sim | - |
| organizador | character varying(200) | Sim | - |
| participantes | jsonb | Sim | - |
| status | character varying(20) | Sim | 'agendada'::character varying |
| motivo_cancelamento | text | Sim | - |
| entidade_tipo | character varying(20) | Sim | - |
| entidade_id | uuid | Sim | - |
| entidade_nome | character varying(200) | Sim | - |
| tipo_reuniao | character varying(50) | Sim | - |
| usuario_criacao | uuid | Não | - |
| created_at | timestamp with time zone | Não | now() |
| updated_at | timestamp with time zone | Sim | - |

### role_permissions

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| role_id | uuid | Não | - |
| permission_id | uuid | Não | - |
| concedido_em | timestamp with time zone | Sim | now() |
| concedido_por_id | uuid | Sim | - |

### roles

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| nivel | integer | Sim | 1 |
| sistema | boolean | Sim | false |
| ativo | boolean | Sim | true |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### schema_migrations

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| version | text | Não | - |
| applied_at | timestamp with time zone | Sim | now() |

### solicitacoes_compra

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| numero | text | Não | - |
| descricao | text | Sim | - |
| tipo | text | Sim | 'normal'::text |
| solicitante_id | uuid | Não | - |
| departamento | text | Sim | - |
| centro_custo | text | Sim | - |
| justificativa | text | Não | - |
| observacoes | text | Sim | - |
| data_solicitacao | date | Sim | CURRENT_DATE |
| data_necessidade | date | Não | - |
| data_aprovacao | date | Sim | - |
| aprovador_id | uuid | Sim | - |
| status | text | Sim | 'rascunho'::text |
| motivo_rejeicao | text | Sim | - |
| valor_estimado | numeric | Sim | - |
| valor_aprovado | numeric | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| criado_por | uuid | Sim | - |
| atualizado_por | uuid | Sim | - |

### system_alerts

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| titulo | text | Não | - |
| mensagem | text | Não | - |
| tipo | text | Não | - |
| categoria | text | Sim | - |
| origem | text | Sim | - |
| metrica_relacionada | text | Sim | - |
| valor_atual | numeric | Sim | - |
| valor_esperado | numeric | Sim | - |
| acao_sugerida | text | Sim | - |
| notificado | boolean | Sim | false |
| notificados_ids | ARRAY | Sim | - |
| resolvido | boolean | Sim | false |
| resolvido_em | timestamp with time zone | Sim | - |
| resolvido_por_id | uuid | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### system_health_metrics

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| metrica | text | Não | - |
| categoria | text | Não | - |
| valor | numeric | Não | - |
| unidade | text | Sim | - |
| status | text | Sim | 'ok'::text |
| threshold_warning | numeric | Sim | - |
| threshold_critical | numeric | Sim | - |
| detalhes_json | jsonb | Sim | - |
| coletado_em | timestamp with time zone | Sim | now() |
| criado_em | timestamp with time zone | Sim | now() |

### system_logs

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| nivel | text | Não | - |
| categoria | text | Sim | - |
| mensagem | text | Não | - |
| contexto_json | jsonb | Sim | - |
| stack_trace | text | Sim | - |
| usuario_id | uuid | Sim | - |
| ip_address | inet | Sim | - |
| user_agent | text | Sim | - |
| request_id | text | Sim | - |
| url | text | Sim | - |
| metodo | text | Sim | - |
| duracao_ms | integer | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### tags

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| nome | text | Não | - |
| cor | text | Sim | '#808080'::text |
| descricao | text | Sim | - |
| categoria | text | Sim | - |
| entidade_tipo | text | Sim | - |
| entidade_id | uuid | Sim | - |
| uso_count | integer | Sim | 0 |
| criado_por_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

### transacoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| tipo | text | Não | - |
| categoria | text | Não | - |
| descricao | text | Não | - |
| valor | numeric | Não | - |
| data_vencimento | date | Não | - |
| data_pagamento | date | Sim | - |
| status | text | Sim | 'pendente'::text |
| forma_pagamento | text | Sim | - |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### user_roles

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| usuario_id | uuid | Não | - |
| role_id | uuid | Não | - |
| data_inicio | date | Sim | CURRENT_DATE |
| data_fim | date | Sim | - |
| ativo | boolean | Sim | true |
| atribuido_por_id | uuid | Sim | - |
| atribuido_em | timestamp with time zone | Sim | now() |

### usuarios

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| email | text | Não | - |
| nome_completo | text | Sim | - |
| avatar_url | text | Sim | - |
| perfil | text | Sim | 'operador'::text |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |
| email_verificado | boolean | Sim | false |
| senha_hash | text | Sim | - |
| ultimo_login | timestamp with time zone | Sim | - |
| ativo | boolean | Sim | true |
| cargo | text | Sim | - |

### widgets

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| dashboard_id | uuid | Sim | - |
| titulo | text | Não | - |
| tipo | text | Não | - |
| query_sql | text | Sim | - |
| configuracao_json | jsonb | Sim | - |
| posicao_x | integer | Sim | - |
| posicao_y | integer | Sim | - |
| largura | integer | Sim | - |
| altura | integer | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### workflows

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| categoria | text | Sim | - |
| trigger_tipo | text | Não | - |
| trigger_evento | text | Sim | - |
| trigger_condicao_json | jsonb | Sim | - |
| cron_expressao | text | Sim | - |
| timezone | text | Sim | 'America/Sao_Paulo'::text |
| versao | integer | Sim | 1 |
| ativo | boolean | Sim | false |
| modo_teste | boolean | Sim | false |
| prioridade | integer | Sim | 5 |
| timeout_segundos | integer | Sim | 300 |
| max_tentativas | integer | Sim | 3 |
| intervalo_retry_segundos | integer | Sim | 60 |
| variaveis_json | jsonb | Sim | - |
| total_execucoes | integer | Sim | 0 |
| total_sucesso | integer | Sim | 0 |
| total_erro | integer | Sim | 0 |
| taxa_sucesso | numeric | Sim | - |
| tempo_medio_execucao_segundos | integer | Sim | - |
| criado_por_id | uuid | Sim | - |
| modificado_por_id | uuid | Sim | - |
| ultima_execucao | timestamp with time zone | Sim | - |
| proxima_execucao | timestamp with time zone | Sim | - |
| observacoes | text | Sim | - |
| documentacao_url | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |
| excluido_em | timestamp with time zone | Sim | - |

### workflows_etapas

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| workflow_id | uuid | Não | - |
| codigo | text | Não | - |
| nome | text | Não | - |
| descricao | text | Sim | - |
| ordem | integer | Não | - |
| etapa_pai_id | uuid | Sim | - |
| nivel | integer | Sim | 1 |
| tipo_acao | text | Não | - |
| configuracao_json | jsonb | Não | - |
| input_schema_json | jsonb | Sim | - |
| output_schema_json | jsonb | Sim | - |
| mapear_output | boolean | Sim | true |
| condicao_execucao_json | jsonb | Sim | - |
| executar_se | text | Sim | - |
| requer_aprovacao | boolean | Sim | false |
| aprovadores_ids | ARRAY | Sim | - |
| aprovacao_minima | integer | Sim | 1 |
| timeout_segundos | integer | Sim | - |
| tentativas_maximas | integer | Sim | 3 |
| acao_erro | text | Sim | - |
| etapa_erro_id | uuid | Sim | - |
| ativa | boolean | Sim | true |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### workflows_execucoes

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| empresa_id | uuid | Não | - |
| workflow_id | uuid | Não | - |
| numero_execucao | integer | Não | - |
| disparado_por | text | Sim | - |
| disparado_por_usuario_id | uuid | Sim | - |
| evento_origem | text | Sim | - |
| contexto_tipo | text | Sim | - |
| contexto_id | uuid | Sim | - |
| contexto_dados_json | jsonb | Sim | - |
| input_json | jsonb | Sim | - |
| status | text | Sim | 'iniciando'::text |
| etapa_atual_id | uuid | Sim | - |
| etapa_atual_numero | integer | Sim | - |
| total_etapas | integer | Sim | - |
| progresso_percentual | integer | Sim | 0 |
| sucesso | boolean | Sim | - |
| output_json | jsonb | Sim | - |
| erro_mensagem | text | Sim | - |
| erro_etapa_id | uuid | Sim | - |
| iniciado_em | timestamp with time zone | Sim | now() |
| concluido_em | timestamp with time zone | Sim | - |
| duracao_segundos | integer | Sim | - |
| tentativa | integer | Sim | 1 |
| execucao_original_id | uuid | Sim | - |
| aprovacoes_pendentes | integer | Sim | 0 |
| aprovacoes_concedidas | integer | Sim | 0 |
| aprovacoes_negadas | integer | Sim | 0 |
| observacoes | text | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |
| atualizado_em | timestamp with time zone | Sim | now() |

### workflows_logs

| Coluna | Tipo | Nulo | Default |
|--------|------|------|--------|
| id | uuid | Não | gen_random_uuid() |
| execucao_id | uuid | Não | - |
| etapa_id | uuid | Sim | - |
| ocorrido_em | timestamp with time zone | Sim | now() |
| tipo | text | Não | - |
| severidade | integer | Sim | 1 |
| mensagem | text | Não | - |
| detalhes | text | Sim | - |
| dados_json | jsonb | Sim | - |
| request_json | jsonb | Sim | - |
| response_json | jsonb | Sim | - |
| response_status_code | integer | Sim | - |
| response_time_ms | integer | Sim | - |
| erro_stack_trace | text | Sim | - |
| erro_codigo | text | Sim | - |
| usuario_id | uuid | Sim | - |
| criado_em | timestamp with time zone | Sim | now() |

## 🏷️  ENUMS (1)

### status_item_cirurgia
```
{pendente,separado,entregue,utilizado,devolvido,perdido}
```

## ⚙️  FUNCTIONS (59)

- **anonimizar_dados_usuario**(p_usuario_id uuid) → void
- **bloquear_lotes_vencidos**() → integer
- **check_dpo_on_insert**() → trigger
- **compute_audit_hash**(p_empresa_id uuid, p_usuario_id uuid, p_tabela text, p_registro_id uuid, p_acao text, p_dados_antes jsonb, p_dados_depois jsonb, p_hash_anterior text) → text
- **consumir_kit**(p_kit_id uuid, p_quantidades_consumidas jsonb) → boolean
- **current_empresa**() → uuid
- **current_perfil**() → text
- **current_user_id**() → uuid
- **exportar_dados_usuario**(p_usuario_id uuid) → jsonb
- **get_agenda_cirurgias**(p_empresa_id uuid, p_data_inicio date DEFAULT CURRENT_DATE, p_data_fim date DEFAULT (CURRENT_DATE + 7)) → TABLE(id uuid, data_agendada timestamp with time zone, status_cirurgia character varying, sala character varying, paciente_nome character varying, medico_nome character varying, medico_crm character varying, hospital_nome character varying, total_materiais bigint, materiais_separados bigint)
- **get_dashboard_kpis**(p_empresa_id uuid, p_periodo text DEFAULT 'month'::text) → json
- **gin_extract_query_trgm**(text, internal, smallint, internal, internal, internal, internal) → internal
- **gin_extract_value_trgm**(text, internal) → internal
- **gin_trgm_consistent**(internal, smallint, text, integer, internal, internal, internal, internal) → boolean
- **gin_trgm_triconsistent**(internal, smallint, text, integer, internal, internal, internal) → "char"
- **gtrgm_compress**(internal) → internal
- **gtrgm_consistent**(internal, text, smallint, oid, internal) → boolean
- **gtrgm_decompress**(internal) → internal
- **gtrgm_distance**(internal, text, smallint, oid, internal) → double precision
- **gtrgm_in**(cstring) → gtrgm
- **gtrgm_options**(internal) → void
- **gtrgm_out**(gtrgm) → cstring
- **gtrgm_penalty**(internal, internal, internal) → internal
- **gtrgm_picksplit**(internal, internal) → internal
- **gtrgm_same**(gtrgm, gtrgm, internal) → internal
- **gtrgm_union**(internal, internal) → gtrgm
- **handle_new_user**() → trigger
- **insert_audit_log**(p_empresa_id uuid, p_usuario_id uuid, p_tabela text, p_registro_id uuid, p_acao text, p_dados_antes jsonb, p_dados_depois jsonb) → void
- **limpar_tokens_expirados**() → integer
- **obter_permissoes_usuario**(p_usuario_id uuid) → TABLE(codigo text, nome text, recurso text, acao text)
- **refresh_dashboard_kpis**() → void
- **reservar_kit**(p_kit_id uuid) → boolean
- **set_atualizado_em**() → trigger
- **set_limit**(real) → real
- **show_limit**() → real
- **show_trgm**(text) → text[]
- **similarity**(text, text) → real
- **similarity_dist**(text, text) → real
- **similarity_op**(text, text) → boolean
- **strict_word_similarity**(text, text) → real
- **strict_word_similarity_commutator_op**(text, text) → boolean
- **strict_word_similarity_dist_commutator_op**(text, text) → real
- **strict_word_similarity_dist_op**(text, text) → real
- **strict_word_similarity_op**(text, text) → boolean
- **trigger_audit**() → trigger
- **update_reuniao_teams_timestamp**() → trigger
- **update_updated_at_column**() → trigger
- **usuario_tem_microsoft365**(p_user_id uuid) → boolean
- **usuario_tem_permissao**(p_usuario_id uuid, p_permissao_codigo text) → boolean
- **validar_cirurgia**() → trigger
- **validar_dpo_configurado**(p_empresa_id uuid) → TABLE(configurado boolean, mensagem text, dpo_nome text, dpo_email text, dias_desde_nomeacao integer)
- **validar_login**(p_email text, p_senha text) → TABLE(usuario_id uuid, nome_completo text, email text, cargo text, empresa_id uuid, empresa_nome text, sucesso boolean, mensagem text)
- **validar_lote**(p_lote_id uuid) → TABLE(valido boolean, motivo text, lote_id uuid, produto_descricao text, numero_lote text, data_validade date, registro_anvisa text)
- **verificar_integridade_audit_log**() → TABLE(registro_id uuid, hash_esperado text, hash_registrado text, integro boolean)
- **word_similarity**(text, text) → real
- **word_similarity_commutator_op**(text, text) → boolean
- **word_similarity_dist_commutator_op**(text, text) → real
- **word_similarity_dist_op**(text, text) → real
- **word_similarity_op**(text, text) → boolean

## 👁️  VIEWS (3)

- view_empresas_sem_dpo
- vw_estatisticas_emails_30d
- vw_proximas_reunioes_teams

## 🔔 TRIGGERS (101)

### acoes_corretivas
- **trg_acoes_corretivas_updated**: BEFORE UPDATE

### api_endpoints
- **trg_api_endpoints_updated**: BEFORE UPDATE

### api_keys
- **trg_api_keys_updated**: BEFORE UPDATE

### api_rate_limits
- **trg_api_rate_limits_updated**: BEFORE UPDATE

### atividades_crm
- **trg_atividades_crm_updated**: BEFORE UPDATE

### auditorias
- **trg_auditorias_updated**: BEFORE UPDATE

### auditorias_itens
- **trg_auditorias_itens_updated**: BEFORE UPDATE

### bancos
- **trg_bancos_updated**: BEFORE UPDATE

### centros_custo
- **trg_centros_custo_updated**: BEFORE UPDATE

### chatbot_conversas
- **trg_chatbot_conversas_updated**: BEFORE UPDATE

### chatbot_sessoes
- **trg_chatbot_sessoes_updated**: BEFORE UPDATE

### cirurgia_materiais
- **trg_cirurgia_materiais_updated**: BEFORE UPDATE

### cirurgias
- **trg_audit_cirurgias**: AFTER INSERT
- **trg_audit_cirurgias**: AFTER UPDATE
- **trg_audit_cirurgias**: AFTER DELETE
- **trg_cirurgias_atualizado**: BEFORE UPDATE
- **trg_validar_cirurgia**: BEFORE UPDATE
- **trg_validar_cirurgia**: BEFORE INSERT

### comentarios
- **trg_comentarios_updated**: BEFORE UPDATE

### compliance_evidencias
- **trg_compliance_evidencias_updated**: BEFORE UPDATE

### compliance_requisitos
- **trg_compliance_requisitos_updated**: BEFORE UPDATE

### contas_pagar
- **trg_contas_pagar_updated**: BEFORE UPDATE

### contas_receber
- **trg_contas_receber_updated**: BEFORE UPDATE

### contratos_consignacao
- **trg_contratos_consignacao_updated**: BEFORE UPDATE

### convenios
- **trg_convenios_updated**: BEFORE UPDATE

### cotacoes
- **trg_cotacoes_updated**: BEFORE UPDATE

### dashboards
- **trg_dashboards_updated**: BEFORE UPDATE

### devolucoes_consignacao
- **trg_devolucoes_consignacao_updated**: BEFORE UPDATE

### documentos_licitacao
- **trg_documentos_licitacao_updated**: BEFORE UPDATE

### empresas
- **trg_check_dpo_empresas**: AFTER INSERT
- **trg_empresas_atualizado**: BEFORE UPDATE

### entregas
- **trg_entregas_updated**: BEFORE UPDATE

### estoque
- **trg_estoque_updated**: BEFORE UPDATE

### estoque_reservas
- **trg_estoque_reservas_updated**: BEFORE UPDATE

### faturas
- **trg_audit_faturas**: AFTER DELETE
- **trg_audit_faturas**: AFTER INSERT
- **trg_audit_faturas**: AFTER UPDATE
- **trg_faturas_atualizado**: BEFORE UPDATE

### fluxo_caixa
- **trg_fluxo_caixa_updated**: BEFORE UPDATE

### fornecedores
- **trg_fornecedores_atualizado**: BEFORE UPDATE

### fornecedores_produtos
- **trg_fornecedores_produtos_updated**: BEFORE UPDATE

### hospitais
- **trg_hospitais_atualizado**: BEFORE UPDATE

### itens_consignacao
- **trg_itens_consignacao_updated**: BEFORE UPDATE

### itens_cotacao
- **trg_itens_cotacao_updated**: BEFORE UPDATE

### itens_kit
- **trg_audit_itens_kit**: AFTER DELETE
- **trg_audit_itens_kit**: AFTER UPDATE
- **trg_audit_itens_kit**: AFTER INSERT
- **trg_itens_kit_atualizado**: BEFORE UPDATE

### itens_pedido_compra
- **trg_itens_pedido_compra_updated**: BEFORE UPDATE

### itens_proposta
- **trg_itens_proposta_updated**: BEFORE UPDATE

### kits
- **trg_audit_kits**: AFTER DELETE
- **trg_audit_kits**: AFTER INSERT
- **trg_audit_kits**: AFTER UPDATE
- **trg_kits_atualizado**: BEFORE UPDATE

### kpi_metas
- **trg_kpi_metas_updated**: BEFORE UPDATE

### lancamentos_contabeis
- **trg_lancamentos_contabeis_updated**: BEFORE UPDATE

### leads
- **trg_leads_atualizado**: BEFORE UPDATE

### licitacoes
- **trg_licitacoes_updated**: BEFORE UPDATE

### licitacoes_itens
- **trg_licitacoes_itens_updated**: BEFORE UPDATE

### lotes
- **trg_audit_lotes**: AFTER UPDATE
- **trg_audit_lotes**: AFTER DELETE
- **trg_audit_lotes**: AFTER INSERT
- **trg_lotes_atualizado**: BEFORE UPDATE

### medicos
- **trg_medicos_atualizado**: BEFORE UPDATE

### nao_conformidades
- **trg_nao_conformidades_updated**: BEFORE UPDATE

### negociacoes
- **trg_negociacoes_updated**: BEFORE UPDATE

### notas_fiscais
- **trg_notas_fiscais_updated**: BEFORE UPDATE

### oportunidades
- **trg_oportunidades_updated**: BEFORE UPDATE

### pacientes
- **trg_pacientes_updated**: BEFORE UPDATE

### pedidos_compra
- **trg_pedidos_atualizado**: BEFORE UPDATE

### permission_groups
- **trg_permission_groups_updated**: BEFORE UPDATE

### pesquisas_gpt
- **trg_pesquisas_gpt_updated**: BEFORE UPDATE

### pluggy_accounts
- **trg_pluggy_accounts_updated**: BEFORE UPDATE

### pluggy_connections
- **trg_pluggy_connections_updated**: BEFORE UPDATE

### portais_opme_config
- **trg_portais_opme_config_updated**: BEFORE UPDATE

### portais_opme_respostas
- **trg_portais_opme_respostas_updated**: BEFORE UPDATE

### portais_opme_solicitacoes
- **trg_portais_opme_solicitacoes_updated**: BEFORE UPDATE

### produtos
- **trg_audit_produtos**: AFTER DELETE
- **trg_audit_produtos**: AFTER UPDATE
- **trg_audit_produtos**: AFTER INSERT
- **trg_produtos_atualizado**: BEFORE UPDATE

### profiles
- **trg_profiles_updated**: BEFORE UPDATE

### propostas
- **trg_propostas_updated**: BEFORE UPDATE

### propostas_licitacao
- **trg_propostas_licitacao_updated**: BEFORE UPDATE

### relatorios_agendamentos
- **trg_relatorios_agendamentos_updated**: BEFORE UPDATE

### relatorios_regulatorios
- **trg_relatorios_regulatorios_updated**: BEFORE UPDATE

### relatorios_templates
- **trg_relatorios_templates_updated**: BEFORE UPDATE

### remessas_consignacao
- **trg_remessas_consignacao_updated**: BEFORE UPDATE

### reunioes_teams
- **trigger_update_reuniao_teams_timestamp**: BEFORE UPDATE

### roles
- **trg_roles_updated**: BEFORE UPDATE

### solicitacoes_compra
- **trg_solicitacoes_compra_updated**: BEFORE UPDATE

### system_alerts
- **trg_system_alerts_updated**: BEFORE UPDATE

### transacoes
- **trg_audit_transacoes**: AFTER UPDATE
- **trg_audit_transacoes**: AFTER DELETE
- **trg_audit_transacoes**: AFTER INSERT
- **trg_transacoes_atualizado**: BEFORE UPDATE

### usuarios
- **trg_usuarios_atualizado**: BEFORE UPDATE

### widgets
- **trg_widgets_updated**: BEFORE UPDATE

### workflows
- **trg_workflows_updated**: BEFORE UPDATE

### workflows_etapas
- **trg_workflows_etapas_updated**: BEFORE UPDATE

### workflows_execucoes
- **trg_workflows_execucoes_updated**: BEFORE UPDATE

## 🔍 INDEXES (531)

### acoes_corretivas
- acoes_corretivas_empresa_id_numero_key
- acoes_corretivas_pkey
- idx_acoes_corretivas_empresa
- idx_acoes_corretivas_nc
- idx_acoes_corretivas_responsavel
- idx_acoes_corretivas_status
- idx_acoes_corretivas_tipo

### api_endpoints
- api_endpoints_empresa_id_codigo_versao_key
- api_endpoints_pkey
- idx_api_endpoints_ativo
- idx_api_endpoints_categoria
- idx_api_endpoints_empresa
- idx_api_endpoints_path

### api_keys
- api_keys_chave_key
- api_keys_pkey
- idx_api_keys_ativa
- idx_api_keys_chave
- idx_api_keys_empresa
- idx_api_keys_expiracao
- idx_api_keys_usuario

### api_logs
- api_logs_pkey
- api_logs_request_id_key
- idx_api_logs_api_key
- idx_api_logs_empresa
- idx_api_logs_endpoint
- idx_api_logs_erro
- idx_api_logs_ip
- idx_api_logs_request_id
- idx_api_logs_status
- idx_api_logs_timestamp

### api_rate_limits
- api_rate_limits_chave_limite_janela_inicio_key
- api_rate_limits_pkey
- idx_api_rate_limits_api_key
- idx_api_rate_limits_atingido
- idx_api_rate_limits_chave
- idx_api_rate_limits_endpoint
- idx_api_rate_limits_ip

### atividades_crm
- atividades_crm_pkey
- idx_atividades_crm_empresa
- idx_atividades_crm_lembrete
- idx_atividades_crm_oportunidade
- idx_atividades_crm_responsavel
- idx_atividades_crm_vencimento

### audit_log
- audit_log_pkey

### auditorias
- auditorias_empresa_id_numero_key
- auditorias_pkey
- idx_auditorias_auditor
- idx_auditorias_datas
- idx_auditorias_empresa
- idx_auditorias_status
- idx_auditorias_tipo

### auditorias_itens
- auditorias_itens_pkey
- idx_auditorias_itens_auditoria
- idx_auditorias_itens_nc
- idx_auditorias_itens_requisito
- idx_auditorias_itens_resultado

### bancos
- bancos_empresa_id_codigo_banco_agencia_conta_key
- bancos_pkey
- idx_bancos_ativo
- idx_bancos_empresa
- idx_bancos_principal

### bi_dimensao_produto
- bi_dimensao_produto_pkey
- bi_dimensao_produto_produto_id_key
- idx_bi_dimensao_produto_empresa

### bi_dimensao_tempo
- bi_dimensao_tempo_data_key
- bi_dimensao_tempo_pkey
- idx_bi_dimensao_tempo_ano_mes
- idx_bi_dimensao_tempo_data

### bi_fato_estoque
- bi_fato_estoque_pkey
- idx_bi_fato_estoque_data
- idx_bi_fato_estoque_empresa

### bi_fato_vendas
- bi_fato_vendas_pkey
- idx_bi_fato_vendas_data
- idx_bi_fato_vendas_empresa

### centros_custo
- centros_custo_empresa_id_codigo_key
- centros_custo_pkey
- idx_centros_custo_ativo
- idx_centros_custo_empresa
- idx_centros_custo_pai

### chatbot_conversas
- chatbot_conversas_pkey
- idx_chatbot_conversas_pai
- idx_chatbot_conversas_sessao

### chatbot_mensagens
- chatbot_mensagens_pkey
- idx_chatbot_mensagens_atencao
- idx_chatbot_mensagens_conversa
- idx_chatbot_mensagens_sessao
- idx_chatbot_mensagens_tipo
- idx_chatbot_mensagens_usuario

### chatbot_sessoes
- chatbot_sessoes_pkey
- idx_chatbot_sessoes_ativa
- idx_chatbot_sessoes_contexto
- idx_chatbot_sessoes_empresa
- idx_chatbot_sessoes_usuario

### cirurgia_eventos
- cirurgia_eventos_pkey
- idx_cirurgia_eventos_cirurgia
- idx_cirurgia_eventos_tipo
- idx_cirurgia_eventos_usuario

### cirurgia_materiais
- cirurgia_materiais_pkey
- idx_cirurgia_materiais_cirurgia
- idx_cirurgia_materiais_lote
- idx_cirurgia_materiais_produto
- idx_cirurgia_materiais_status

### cirurgias
- cirurgias_empresa_id_codigo_interno_key
- cirurgias_pkey
- idx_cirurgias_data
- idx_cirurgias_empresa
- idx_cirurgias_empresa_data
- idx_cirurgias_hospital
- idx_cirurgias_status

### comentarios
- comentarios_pkey
- idx_comentarios_empresa
- idx_comentarios_entidade
- idx_comentarios_pai
- idx_comentarios_usuario

### compliance_evidencias
- compliance_evidencias_pkey
- idx_compliance_evidencias_auditoria
- idx_compliance_evidencias_empresa
- idx_compliance_evidencias_requisito
- idx_compliance_evidencias_tipo
- idx_compliance_evidencias_validade

### compliance_requisitos
- compliance_requisitos_empresa_id_codigo_key
- compliance_requisitos_pkey
- idx_compliance_requisitos_empresa
- idx_compliance_requisitos_responsavel
- idx_compliance_requisitos_status
- idx_compliance_requisitos_tipo
- idx_compliance_requisitos_verificacao

### contas_pagar
- contas_pagar_empresa_id_numero_key
- contas_pagar_pkey
- idx_contas_pagar_centro_custo
- idx_contas_pagar_empresa
- idx_contas_pagar_fornecedor
- idx_contas_pagar_status
- idx_contas_pagar_vencimento

### contas_receber
- contas_receber_empresa_id_numero_key
- contas_receber_pkey
- idx_contas_receber_centro_custo
- idx_contas_receber_cliente
- idx_contas_receber_empresa
- idx_contas_receber_status
- idx_contas_receber_vencimento

### contratos_consignacao
- contratos_consignacao_empresa_id_numero_contrato_key
- contratos_consignacao_pkey
- idx_contratos_consignacao_empresa
- idx_contratos_consignacao_fornecedor
- idx_contratos_consignacao_status
- idx_contratos_consignacao_vigencia

### convenios
- convenios_empresa_id_cnpj_key
- convenios_pkey
- idx_convenios_empresa
- idx_convenios_nome

### cotacoes
- cotacoes_empresa_id_numero_key
- cotacoes_pkey
- idx_cotacoes_comprador
- idx_cotacoes_empresa
- idx_cotacoes_fechamento
- idx_cotacoes_status

### dashboards
- dashboards_pkey
- idx_dashboards_empresa

### devolucoes_consignacao
- devolucoes_consignacao_empresa_id_numero_key
- devolucoes_consignacao_pkey
- idx_devolucoes_consignacao_empresa
- idx_devolucoes_consignacao_fornecedor
- idx_devolucoes_consignacao_remessa
- idx_devolucoes_consignacao_status

### documentos_licitacao
- documentos_licitacao_pkey
- idx_documentos_licitacao_empresa
- idx_documentos_licitacao_licitacao
- idx_documentos_licitacao_proposta
- idx_documentos_licitacao_tipo
- idx_documentos_licitacao_validade

### emails_enviados
- emails_enviados_pkey
- idx_emails_enviados_data_envio
- idx_emails_enviados_tipo
- idx_emails_enviados_usuario_id

### empresas
- empresas_cnpj_key
- empresas_pkey
- idx_empresas_dpo_email

### entregas
- entregas_empresa_id_numero_key
- entregas_pkey
- idx_entregas_cirurgia
- idx_entregas_data_prevista
- idx_entregas_data_programada
- idx_entregas_destinatario
- idx_entregas_empresa
- idx_entregas_rastreamento
- idx_entregas_remessa
- idx_entregas_status
- idx_entregas_tipo
- idx_entregas_transportadora
- idx_entregas_urgente

### estoque
- estoque_empresa_id_produto_id_lote_id_localizacao_key
- estoque_pkey
- idx_estoque_empresa
- idx_estoque_lote
- idx_estoque_produto
- idx_estoque_quantidade

### estoque_movimentacoes
- estoque_movimentacoes_pkey
- idx_estoque_mov_documento
- idx_estoque_mov_empresa
- idx_estoque_mov_estoque
- idx_estoque_mov_produto
- idx_estoque_mov_tipo

### estoque_reservas
- estoque_reservas_pkey
- idx_estoque_reservas_cirurgia
- idx_estoque_reservas_empresa
- idx_estoque_reservas_estoque
- idx_estoque_reservas_produto
- idx_estoque_reservas_referencia
- idx_estoque_reservas_responsavel
- idx_estoque_reservas_status

### faturas
- faturas_empresa_id_numero_nfe_serie_key
- faturas_pkey
- idx_faturas_chave_acesso
- idx_faturas_cliente_cpf_cnpj
- idx_faturas_data_emissao
- idx_faturas_empresa
- idx_faturas_pedido_id
- idx_faturas_status

### favoritos
- favoritos_pkey
- favoritos_usuario_id_entidade_tipo_entidade_id_key
- idx_favoritos_entidade
- idx_favoritos_pasta
- idx_favoritos_usuario

### fluxo_caixa
- fluxo_caixa_pkey
- idx_fluxo_caixa_banco
- idx_fluxo_caixa_conciliacao
- idx_fluxo_caixa_data
- idx_fluxo_caixa_empresa
- idx_fluxo_caixa_origem
- idx_fluxo_caixa_tipo

### fornecedores
- fornecedores_empresa_id_cnpj_key
- fornecedores_pkey
- idx_fornecedores_empresa

### fornecedores_produtos
- fornecedores_produtos_empresa_id_fornecedor_id_produto_id_key
- fornecedores_produtos_pkey
- idx_fornecedores_produtos_empresa
- idx_fornecedores_produtos_fornecedor
- idx_fornecedores_produtos_preferencial
- idx_fornecedores_produtos_produto

### hospitais
- hospitais_empresa_id_cnpj_key
- hospitais_pkey
- idx_hospitais_empresa

### itens_consignacao
- idx_itens_consignacao_lote
- idx_itens_consignacao_produto
- idx_itens_consignacao_remessa
- idx_itens_consignacao_serie
- idx_itens_consignacao_status
- itens_consignacao_pkey

### itens_cotacao
- idx_itens_cotacao_cotacao
- idx_itens_cotacao_fornecedor
- idx_itens_cotacao_produto
- idx_itens_cotacao_selecionados
- itens_cotacao_cotacao_id_fornecedor_id_produto_id_key
- itens_cotacao_pkey

### itens_kit
- itens_kit_kit_id_produto_id_lote_id_key
- itens_kit_pkey

### itens_pedido_compra
- idx_itens_pedido_compra_entrega
- idx_itens_pedido_compra_pedido
- idx_itens_pedido_compra_produto
- idx_itens_pedido_compra_status
- itens_pedido_compra_pkey

### itens_proposta
- idx_itens_proposta_produto
- idx_itens_proposta_proposta
- itens_proposta_pkey
- itens_proposta_proposta_id_numero_item_key

### kits
- idx_kits_empresa
- kits_pkey

### kpi_metas
- idx_kpi_metas_categoria
- idx_kpi_metas_empresa
- kpi_metas_empresa_id_codigo_key
- kpi_metas_pkey

### kpi_realizacoes
- idx_kpi_realizacoes_empresa
- idx_kpi_realizacoes_meta
- idx_kpi_realizacoes_periodo
- kpi_realizacoes_pkey

### lancamentos_contabeis
- idx_lancamentos_contabeis_conta
- idx_lancamentos_contabeis_data
- idx_lancamentos_contabeis_documento
- idx_lancamentos_contabeis_empresa
- idx_lancamentos_contabeis_lote
- idx_lancamentos_contabeis_tipo
- lancamentos_contabeis_pkey

### leads
- idx_leads_empresa
- leads_pkey

### licitacoes
- idx_licitacoes_abertura
- idx_licitacoes_empresa
- idx_licitacoes_modalidade
- idx_licitacoes_orgao
- idx_licitacoes_responsavel
- idx_licitacoes_status
- licitacoes_empresa_id_numero_processo_key
- licitacoes_pkey

### licitacoes_itens
- idx_licitacoes_itens_licitacao
- idx_licitacoes_itens_lote
- idx_licitacoes_itens_produto
- licitacoes_itens_pkey

### lotes
- idx_lotes_numero
- idx_lotes_produto
- idx_lotes_validade
- lotes_pkey
- lotes_produto_id_numero_lote_numero_serie_key

### medicos
- idx_medicos_crm
- idx_medicos_empresa
- idx_medicos_especialidade
- idx_medicos_nome_gin
- idx_medicos_status
- medicos_empresa_id_crm_crm_uf_key
- medicos_pkey

### microsoft_contatos_sync
- idx_microsoft_contatos_sync_user_id
- microsoft_contatos_sync_pkey

### microsoft_onedrive_files
- idx_microsoft_onedrive_files_tipo_documento
- idx_microsoft_onedrive_files_usuario_upload
- microsoft_onedrive_files_item_id_key
- microsoft_onedrive_files_pkey

### microsoft_tokens
- idx_microsoft_tokens_expires_at
- idx_microsoft_tokens_user_id
- microsoft_tokens_pkey
- microsoft_tokens_user_id_key

### nao_conformidades
- idx_nao_conformidades_auditoria
- idx_nao_conformidades_empresa
- idx_nao_conformidades_responsavel
- idx_nao_conformidades_status
- idx_nao_conformidades_tipo
- nao_conformidades_empresa_id_numero_key
- nao_conformidades_pkey

### negociacoes
- idx_negociacoes_data
- idx_negociacoes_empresa
- idx_negociacoes_oportunidade
- idx_negociacoes_proposta
- idx_negociacoes_responsavel
- negociacoes_pkey

### notas_fiscais
- idx_notas_fiscais_chave
- idx_notas_fiscais_data
- idx_notas_fiscais_empresa
- idx_notas_fiscais_fornecedor
- idx_notas_fiscais_numero
- idx_notas_fiscais_status
- notas_fiscais_empresa_id_tipo_numero_serie_key
- notas_fiscais_pkey

### notificacoes
- idx_notificacoes_criado
- idx_notificacoes_empresa
- idx_notificacoes_entidade
- idx_notificacoes_tipo
- idx_notificacoes_usuario
- notificacoes_pkey

### oportunidades
- idx_oportunidades_empresa
- idx_oportunidades_estagio
- idx_oportunidades_fechamento
- idx_oportunidades_lead
- idx_oportunidades_vendedor
- oportunidades_empresa_id_numero_key
- oportunidades_pkey

### pacientes
- idx_pacientes_cpf
- idx_pacientes_empresa
- idx_pacientes_nome
- pacientes_pkey

### pedidos_compra
- idx_pedidos_empresa
- pedidos_compra_empresa_id_numero_key
- pedidos_compra_pkey

### permission_groups
- idx_permission_groups_empresa
- permission_groups_empresa_id_codigo_key
- permission_groups_pkey

### permissions
- idx_permissions_empresa
- idx_permissions_recurso
- permissions_empresa_id_codigo_key
- permissions_pkey

### pesquisas_gpt
- idx_pesquisas_gpt_empresa
- idx_pesquisas_gpt_publico
- idx_pesquisas_gpt_sessao
- idx_pesquisas_gpt_status
- idx_pesquisas_gpt_tipo
- idx_pesquisas_gpt_usuario
- pesquisas_gpt_pkey

### pluggy_accounts
- idx_pluggy_accounts_banco
- idx_pluggy_accounts_connection
- idx_pluggy_accounts_pluggy_id
- pluggy_accounts_pkey
- pluggy_accounts_pluggy_account_id_key

### pluggy_connections
- idx_pluggy_connections_banco
- idx_pluggy_connections_empresa
- idx_pluggy_connections_pluggy_id
- pluggy_connections_pkey
- pluggy_connections_pluggy_item_id_key

### pluggy_transactions
- idx_pluggy_transactions_account
- idx_pluggy_transactions_data
- idx_pluggy_transactions_pluggy_id
- idx_pluggy_transactions_sync
- pluggy_transactions_pkey
- pluggy_transactions_pluggy_transaction_id_key

### portais_opme_config
- idx_portais_opme_config_ativo
- idx_portais_opme_config_convenio
- idx_portais_opme_config_empresa
- idx_portais_opme_config_hospital
- portais_opme_config_empresa_id_codigo_key
- portais_opme_config_pkey

### portais_opme_logs
- idx_portais_opme_logs_data
- idx_portais_opme_logs_empresa
- idx_portais_opme_logs_operacao
- idx_portais_opme_logs_portal
- idx_portais_opme_logs_solicitacao
- idx_portais_opme_logs_sucesso
- portais_opme_logs_pkey

### portais_opme_respostas
- idx_portais_opme_respostas_autorizacao
- idx_portais_opme_respostas_processada
- idx_portais_opme_respostas_solicitacao
- idx_portais_opme_respostas_tipo
- portais_opme_respostas_pkey

### portais_opme_solicitacoes
- idx_portais_opme_solicitacoes_cirurgia
- idx_portais_opme_solicitacoes_empresa
- idx_portais_opme_solicitacoes_portal
- idx_portais_opme_solicitacoes_prazo
- idx_portais_opme_solicitacoes_protocolo
- idx_portais_opme_solicitacoes_status
- portais_opme_solicitacoes_empresa_id_numero_interno_key
- portais_opme_solicitacoes_pkey

### produtos
- idx_produtos_anvisa
- idx_produtos_desc_gin
- idx_produtos_empresa
- idx_produtos_empresa_status
- idx_produtos_sku
- produtos_empresa_id_codigo_sku_key
- produtos_pkey

### profiles
- idx_profiles_empresa
- profiles_pkey

### propostas
- idx_propostas_elaborada_por
- idx_propostas_empresa
- idx_propostas_oportunidade
- idx_propostas_status
- idx_propostas_validade
- propostas_empresa_id_numero_versao_key
- propostas_pkey

### propostas_licitacao
- idx_propostas_licitacao_elaborada_por
- idx_propostas_licitacao_empresa
- idx_propostas_licitacao_licitacao
- idx_propostas_licitacao_status
- propostas_licitacao_empresa_id_licitacao_id_numero_proposta_key
- propostas_licitacao_pkey

### relatorios_agendamentos
- idx_relatorios_agendamentos_empresa
- idx_relatorios_agendamentos_proxima
- relatorios_agendamentos_pkey

### relatorios_regulatorios
- idx_relatorios_regulatorios_empresa
- idx_relatorios_regulatorios_status
- idx_relatorios_regulatorios_tipo
- relatorios_regulatorios_empresa_id_codigo_key
- relatorios_regulatorios_pkey

### relatorios_templates
- idx_relatorios_templates_empresa
- idx_relatorios_templates_tipo
- relatorios_templates_empresa_id_codigo_key
- relatorios_templates_pkey

### remessas_consignacao
- idx_remessas_consignacao_cirurgia
- idx_remessas_consignacao_contrato
- idx_remessas_consignacao_empresa
- idx_remessas_consignacao_fornecedor
- idx_remessas_consignacao_hospital
- idx_remessas_consignacao_status
- remessas_consignacao_empresa_id_numero_key
- remessas_consignacao_pkey

### reunioes_teams
- idx_reunioes_teams_data_inicio
- idx_reunioes_teams_evento_id
- idx_reunioes_teams_status
- idx_reunioes_teams_usuario_criacao
- reunioes_teams_evento_id_key
- reunioes_teams_pkey

### role_permissions
- idx_role_permissions_permission
- idx_role_permissions_role
- role_permissions_pkey
- role_permissions_role_id_permission_id_key

### roles
- idx_roles_empresa
- roles_empresa_id_codigo_key
- roles_pkey

### schema_migrations
- schema_migrations_pkey

### solicitacoes_compra
- idx_solicitacoes_compra_empresa
- idx_solicitacoes_compra_necessidade
- idx_solicitacoes_compra_solicitante
- idx_solicitacoes_compra_status
- solicitacoes_compra_empresa_id_numero_key
- solicitacoes_compra_pkey

### system_alerts
- idx_system_alerts_categoria
- idx_system_alerts_resolvido
- idx_system_alerts_tipo
- system_alerts_pkey

### system_health_metrics
- idx_system_health_metrics_categoria
- idx_system_health_metrics_metrica
- idx_system_health_metrics_status
- system_health_metrics_pkey

### system_logs
- idx_system_logs_categoria
- idx_system_logs_erro
- idx_system_logs_nivel
- idx_system_logs_request
- idx_system_logs_usuario
- system_logs_pkey

### tags
- idx_tags_categoria
- idx_tags_empresa
- idx_tags_entidade
- idx_tags_nome
- tags_empresa_id_nome_entidade_tipo_key
- tags_pkey

### transacoes
- idx_transacoes_empresa
- transacoes_pkey

### user_roles
- idx_user_roles_role
- idx_user_roles_usuario
- user_roles_pkey
- user_roles_usuario_id_role_id_key

### usuarios
- idx_usuarios_empresa
- usuarios_email_key
- usuarios_pkey

### widgets
- idx_widgets_dashboard
- widgets_pkey

### workflows
- idx_workflows_agendado
- idx_workflows_ativo
- idx_workflows_empresa
- idx_workflows_trigger
- workflows_empresa_id_codigo_key
- workflows_pkey

### workflows_etapas
- idx_workflows_etapas_pai
- idx_workflows_etapas_tipo
- idx_workflows_etapas_workflow
- workflows_etapas_pkey

### workflows_execucoes
- idx_workflows_execucoes_aguardando
- idx_workflows_execucoes_contexto
- idx_workflows_execucoes_empresa
- idx_workflows_execucoes_status
- idx_workflows_execucoes_usuario
- idx_workflows_execucoes_workflow
- workflows_execucoes_pkey

### workflows_logs
- idx_workflows_logs_erro
- idx_workflows_logs_etapa
- idx_workflows_logs_execucao
- idx_workflows_logs_tipo
- workflows_logs_pkey

