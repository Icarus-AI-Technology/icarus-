-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📚 SEED ESPECIALIZADO — CONHECIMENTO OPME
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Base de conhecimento para Tutor IA especializado em OPME
-- Data: 2025-10-20
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. DOCUMENTAÇÃO OPME — CONCEITOS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-001',
  'OPME - Órteses, Próteses e Materiais Especiais. São dispositivos médicos implantáveis ou de uso único utilizados em procedimentos cirúrgicos. Incluem: placas, parafusos, pinos, stents, válvulas cardíacas, próteses articulares, malhas cirúrgicas, entre outros. A ANS regula o fornecimento de OPME através do Rol de Procedimentos.',
  'documentacao',
  'opme',
  ARRAY['conceito', 'ans', 'definicao', 'dispositivos-medicos']
),
(
  'opme-002',
  'Rastreabilidade OPME - ANVISA RDC 36/2013. Todo material OPME deve ter: número de lote, data de validade, número de série (quando aplicável), registro ANVISA, nome do fabricante. A rastreabilidade é obrigatória e deve ser mantida por no mínimo 5 anos após o uso. Etiquetas devem ser coladas no prontuário do paciente.',
  'compliance',
  'opme',
  ARRAY['rastreabilidade', 'anvisa', 'rdc-36', 'lote', 'validade']
),
(
  'opme-003',
  'Classificação de Risco OPME - ANVISA. Classe I (baixo risco): não invasivos. Classe II (médio risco): invasivos temporários. Classe III (alto risco): invasivos de longo prazo. Classe IV (altíssimo risco): implantáveis ativos ou que sustentam vida. Cada classe tem requisitos regulatórios específicos.',
  'compliance',
  'opme',
  ARRAY['classificacao', 'risco', 'anvisa', 'regulatorio']
);

-- ============================================
-- 2. JUSTIFICATIVA MÉDICA — TEMPLATES
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-just-001',
  'Justificativa Médica para OPME - Estrutura obrigatória: 1) Identificação do paciente (nome, idade, convênio, carteirinha). 2) Diagnóstico CID-10 completo e detalhado. 3) Indicação cirúrgica clara. 4) Descrição dos materiais solicitados com marca, modelo e quantidade. 5) Justificativa técnica para cada material. 6) Alternativas consideradas e por que foram descartadas. 7) Riscos caso material não seja fornecido. 8) Data, carimbo e assinatura do médico responsável com CRM.',
  'documentacao',
  'opme',
  ARRAY['justificativa', 'template', 'estrutura', 'obrigatorio']
),
(
  'opme-just-002',
  'Justificativa para Prótese de Joelho - Exemplo: "Paciente com 65 anos, portador de gonartrose grave bilateral (CID M17.0), com falha no tratamento conservador (fisioterapia, AINEs, infiltrações). Limitação funcional importante (EVA 8/10). Indicado artroplastia total de joelho. Materiais: Prótese Total de Joelho com Cimentação, componente femoral, tibial e patelar. Marca/Modelo necessários devido compatibilidade com instrumental disponível e experiência da equipe. Sem o material, paciente permanecerá com dor incapacitante e perda de qualidade de vida."',
  'exemplo',
  'opme',
  ARRAY['justificativa', 'joelho', 'protese', 'ortopedia']
),
(
  'opme-just-003',
  'Justificativa para Material de Síntese - Exemplo: "Paciente vítima de trauma, fratura exposta de tíbia Gustilo IIIB (CID S82.2). Indicado RAFI (Redução Aberta e Fixação Interna). Materiais: Placa bloqueada de tíbia, parafusos corticais e esponjosos. Justificativa: Fratura instável que requer estabilização rígida para consolidação óssea. Placa bloqueada indicada devido ao traço de fratura e qualidade óssea. Alternativas como hastes intramedulares não aplicáveis neste caso devido localização e complexidade da fratura."',
  'exemplo',
  'opme',
  ARRAY['justificativa', 'sintese', 'trauma', 'fratura']
);

-- ============================================
-- 3. GLOSAS — PREVENÇÃO E MOTIVOS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-glosa-001',
  'Glosas em OPME - Principais motivos: 1) Justificativa médica ausente ou incompleta. 2) Material não previsto no Rol ANS. 3) Falta de orçamentos (mínimo 3 fornecedores). 4) Preço acima da tabela Simpro/Brasíndice. 5) Falta de autorização prévia. 6) Documentação incompleta (nota fiscal, etiquetas). 7) CID incompatível com procedimento. 8) Material usado sem necessidade comprovada.',
  'documentacao',
  'opme',
  ARRAY['glosa', 'prevencao', 'motivos', 'auditoria']
),
(
  'opme-glosa-002',
  'Como evitar glosas OPME: 1) Sempre solicitar pré-autorização com antecedência. 2) Justificativa médica detalhada e personalizada (não usar templates genéricos). 3) Anexar exames que comprovem necessidade (RX, RM, TC). 4) Cotação de no mínimo 3 fornecedores. 5) Verificar se material está no Rol ANS. 6) Conferir validade, lote e registro ANVISA. 7) Fotografar etiquetas e colar no prontuário. 8) Documentar todo o processo cirúrgico.',
  'procedimento',
  'opme',
  ARRAY['glosa', 'prevencao', 'checklist', 'boas-praticas']
),
(
  'opme-glosa-003',
  'Recurso de Glosa OPME - Passos: 1) Identificar motivo da glosa na negativa. 2) Reunir documentação: justificativa original, exames, relatório cirúrgico, nota fiscal, etiquetas. 3) Elaborar contra-argumentação técnica com literatura científica. 4) Reforçar CID e correlação com material. 5) Demonstrar que material é essencial e sem alternativa. 6) Anexar guidelines ou protocolos médicos. 7) Enviar recurso dentro do prazo (geralmente 30 dias). 8) Acompanhar via ANS se negado novamente.',
  'procedimento',
  'opme',
  ARRAY['glosa', 'recurso', 'contestacao', 'ans']
);

-- ============================================
-- 4. TABELAS DE PREÇOS — REFERÊNCIA
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-preco-001',
  'Tabelas de Preço OPME - Referências: 1) Simpro (Sistema Integrado de Processos): tabela oficial governo federal, atualizada mensalmente. 2) Brasíndice: índice de preços de medicamentos e materiais médicos. 3) Banco de Preços em Saúde (BPS): comparativo de preços praticados. Operadoras usam essas tabelas como teto para autorização. Preços acima requerem justificativa adicional.',
  'documentacao',
  'opme',
  ARRAY['preco', 'tabela', 'simpro', 'brasindice']
),
(
  'opme-preco-002',
  'Negociação de Preços OPME - Boas práticas: 1) Solicitar múltiplos orçamentos (mínimo 3). 2) Verificar se fornecedor é credenciado pela operadora. 3) Conferir preço na tabela Simpro/Brasíndice. 4) Negociar descontos para materiais de alto custo. 5) Considerar pacotes (kit cirúrgico) quando vantajoso. 6) Documentar negociação para auditoria. 7) Atentar para prazo de entrega e validade.',
  'procedimento',
  'opme',
  ARRAY['preco', 'negociacao', 'orcamento', 'fornecedor']
);

-- ============================================
-- 5. TIPOS DE MATERIAIS — CATÁLOGO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-cat-001',
  'Materiais de Síntese Óssea: Placas (retas, em T, em L, bloqueadas, não bloqueadas), parafusos (corticais 3.5mm, 4.5mm; esponjosos 4.0mm, 6.5mm; canulados), fios de Kirschner, pinos intramedulares, hastes bloqueadas, fixadores externos, âncoras. Indicações: fraturas, osteotomias, artrodeses. Materiais mais comuns: titânio, aço inoxidável, PEEK.',
  'catalogo',
  'opme',
  ARRAY['sintese-ossea', 'trauma', 'ortopedia', 'materiais']
),
(
  'opme-cat-002',
  'Próteses Articulares: Quadril (total, parcial, revisão), Joelho (total, unicompartimental, revisão), Ombro (total, reversa), Tornozelo, Cotovelo. Componentes: acetábulo, cabeça femoral, haste femoral (cimentada/não cimentada), bandeja tibial, componente femoral, polietileno. Indicações: artrose avançada, necrose óssea, fraturas complexas em idosos.',
  'catalogo',
  'opme',
  ARRAY['protese', 'articular', 'quadril', 'joelho', 'ortopedia']
),
(
  'opme-cat-003',
  'Materiais para Coluna: Parafusos pediculares, hastes, cages intersomáticos (PEEK, titânio), placas cervicais, ganchos, conectores, enxerto ósseo (autólogo, homólogo, sintético - BMP). Indicações: fraturas vertebrais, hérnias discais com instabilidade, espondilolistese, escoliose, tumores. Sistemas: posterior, anterior, minimamente invasivo.',
  'catalogo',
  'opme',
  ARRAY['coluna', 'pedicular', 'cage', 'artrodese']
),
(
  'opme-cat-004',
  'Materiais Cardiovasculares: Stents coronarianos (farmacológicos, convencionais), stents periféricos, válvulas cardíacas (mecânicas, biológicas, TAVI), marcapassos, CDI (cardiodesfibrilador implantável), cateteres, introdutores, guias, balões. Indicações: DAC, valvopatias, arritmias. Alta regulação ANS.',
  'catalogo',
  'opme',
  ARRAY['cardiovascular', 'stent', 'valvula', 'marcapasso']
),
(
  'opme-cat-005',
  'Materiais para Videolaparoscopia/Cirurgia Geral: Grampeadores lineares, circulares, trocateres, clipes de titânio, malhas (polipropileno, compostas), telas para hérnia, dispositivos de sutura mecânica, bisturi harmônico, LigaSure. Indicações: colecistectomia, herniorrafia, bariátrica, colectomia.',
  'catalogo',
  'opme',
  ARRAY['videolaparoscopia', 'grampeador', 'malha', 'hernia']
);

-- ============================================
-- 6. ROL ANS — COBERTURA OBRIGATÓRIA
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-ans-001',
  'Rol de Procedimentos ANS - OPME: Lista taxativa de materiais de cobertura obrigatória pelos planos de saúde. Atualizado periodicamente. Inclui: próteses articulares, síntese óssea, stents, válvulas, marcapassos, malhas, grampeadores. Materiais fora do Rol podem ser negados, mas há jurisprudência favorável ao paciente em casos de urgência ou única alternativa.',
  'regulatorio',
  'opme',
  ARRAY['ans', 'rol', 'cobertura', 'obrigatoriedade']
),
(
  'opme-ans-002',
  'Negativa de OPME pelo Plano - Direitos: Se material está no Rol ANS e há justificativa médica adequada, a negativa é ilegal. Passos: 1) Solicitar negativa por escrito com motivo. 2) Apresentar recurso administrativo. 3) Acionar ouvidoria da operadora. 4) Registrar reclamação na ANS (0800 701 9656 ou site). 5) Em urgências, buscar tutela judicial (liminar geralmente concedida em 24h).',
  'regulatorio',
  'opme',
  ARRAY['ans', 'negativa', 'direitos', 'recurso']
);

-- ============================================
-- 7. CONSIGNAÇÃO OPME
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-consig-001',
  'Consignação de OPME - Conceito: Material cedido temporariamente pelo fornecedor ao hospital/clínica sem custo inicial. Cobrança ocorre apenas após uso efetivo em cirurgia. Vantagens: não imobiliza capital, evita estoque parado, reduz perdas por validade. Controle rigoroso necessário: entrada, saída, devoluções, faturamento.',
  'procedimento',
  'opme',
  ARRAY['consignacao', 'estoque', 'fornecedor', 'gestao']
),
(
  'opme-consig-002',
  'Gestão de Consignação OPME - Fluxo: 1) Contrato com fornecedor (prazos, devolução, reposição). 2) Entrada com conferência (nota de remessa, validade, lote). 3) Armazenamento adequado (temperatura, umidade). 4) Reserva para cirurgia (kit cirúrgico). 5) Confirmação de uso (etiquetas, relatório cirúrgico). 6) Faturamento (nota fiscal de venda). 7) Devolução de não usados. 8) Auditoria mensal (físico x sistema).',
  'procedimento',
  'opme',
  ARRAY['consignacao', 'fluxo', 'controle', 'auditoria']
);

-- ============================================
-- 8. LEGISLAÇÃO E COMPLIANCE
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-leg-001',
  'RDC 185/2001 ANVISA - Registro de Produtos Médicos: Todo OPME deve ter registro na ANVISA antes da comercialização. Produtos importados requerem petição de empresa brasileira. Registro válido por 5 anos (renováveis). Uso de material sem registro é crime. Sempre verificar status do registro no site da ANVISA antes de usar.',
  'regulatorio',
  'opme',
  ARRAY['anvisa', 'rdc-185', 'registro', 'legislacao']
),
(
  'opme-leg-002',
  'Lei 12.842/2013 - Ato Médico: Indicação de OPME é ato privativo do médico. Apenas o médico pode prescrever, indicar e decidir sobre materiais a serem utilizados. Fornecedores, representantes e hospitais não podem influenciar ou determinar a escolha. Ética médica proíbe recebimento de vantagens por indicação de produtos.',
  'regulatorio',
  'opme',
  ARRAY['ato-medico', 'etica', 'prescricao', 'legislacao']
);

-- ============================================
-- 9. RECONHECIMENTO DE DOCUMENTOS (OCR)
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-ocr-001',
  'Documentos OPME para OCR - Tipos: 1) Pedido médico (receituário, justificativa). 2) Nota fiscal (DANFE, NFe). 3) Etiquetas de material (lote, validade, código de barras). 4) Embalagens (descritivos, instruções de uso). 5) Certificados (registro ANVISA, ISO). 6) Orçamentos (fornecedores). 7) Laudos de auditoria. Sistema deve extrair: texto, datas, valores, códigos, CID.',
  'documentacao',
  'opme',
  ARRAY['ocr', 'documentos', 'digitalizacao', 'automacao']
),
(
  'opme-ocr-002',
  'Extração de Dados de Etiquetas OPME - Campos obrigatórios: Nome do produto, Fabricante, Registro ANVISA (número), Lote, Validade, Código de barras (EAN/DUN), REF (referência do fabricante), Número de série (quando aplicável). OCR deve ser capaz de ler mesmo com qualidade baixa (foto de celular, etiqueta amassada). Validação cruzada com banco de dados de produtos.',
  'tecnico',
  'opme',
  ARRAY['ocr', 'etiqueta', 'extracao', 'rastreabilidade']
);

-- ============================================
-- 10. BOAS PRÁTICAS E DICAS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-dicas-001',
  'Checklist Pré-Cirúrgico OPME: ✓ Pré-autorização aprovada. ✓ Justificativa médica completa. ✓ Material entregue e conferido (validade, lote, integridade). ✓ Etiquetas prontas para colar no prontuário. ✓ Notas fiscais conferidas. ✓ Kit cirúrgico completo e esterilizado. ✓ Representante do fornecedor confirmado (se necessário). ✓ Backup de material disponível. ✓ Documentação fotográfica das embalagens.',
  'procedimento',
  'opme',
  ARRAY['checklist', 'pre-operatorio', 'boas-praticas', 'seguranca']
),
(
  'opme-dicas-002',
  'Documentação Pós-Cirúrgica OPME: 1) Colar todas as etiquetas no prontuário. 2) Preencher relatório cirúrgico detalhando materiais usados. 3) Fotografar campo cirúrgico com material implantado. 4) Anotar intercorrências ou trocas de material. 5) Conferir que material cobrado = material usado. 6) Enviar documentação para faturamento em até 24h. 7) Arquivar cópia de segurança (escaneado) por no mínimo 20 anos.',
  'procedimento',
  'opme',
  ARRAY['pos-operatorio', 'documentacao', 'prontuario', 'faturamento']
);

-- ============================================
-- 11. ATUALIZAR CACHE
-- ============================================

REFRESH MATERIALIZED VIEW mv_busca_rapida;

-- ============================================
-- ✅ SEED OPME CONCLUÍDO
-- ============================================

DO $$
DECLARE
  total_opme INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_opme 
  FROM conhecimento_base 
  WHERE modulo = 'opme';
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SEED OPME CONCLUÍDO!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Documentos OPME criados: %', total_opme;
  RAISE NOTICE '';
  RAISE NOTICE 'Categorias:';
  RAISE NOTICE '  • Conceitos e definições';
  RAISE NOTICE '  • Justificativas médicas (templates e exemplos)';
  RAISE NOTICE '  • Prevenção e recurso de glosas';
  RAISE NOTICE '  • Tabelas de preços';
  RAISE NOTICE '  • Catálogo de materiais';
  RAISE NOTICE '  • Rol ANS e cobertura';
  RAISE NOTICE '  • Consignação e gestão';
  RAISE NOTICE '  • Legislação e compliance';
  RAISE NOTICE '  • OCR e reconhecimento de documentos';
  RAISE NOTICE '  • Boas práticas e checklists';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Pronto para Tutor IA especializado!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

