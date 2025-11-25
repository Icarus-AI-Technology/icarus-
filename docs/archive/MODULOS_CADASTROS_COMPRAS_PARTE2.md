# 📋 MÓDULOS CADASTROS E COMPRAS - PARTE 2 (CONTINUAÇÃO)

**Sistema**: ICARUS v5.0  
**Versão**: 5.0.0  
**Última Atualização**: Outubro 2025  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 CONTINUAÇÃO - PARTE I: CADASTROS INTELIGENTES

## 7. CADASTRO DE PACIENTES

### 7.1. Formulário de Paciente

**Arquivo**: `/components/formularios/FormularioPaciente.tsx`

```typescript
/**
 * Formulário de Paciente
 * 
 * SEÇÕES:
 * 1. Dados Pessoais
 *    - Nome Completo (obrigatório)
 *    - CPF (opcional, validação se preenchido)
 *    - RG
 *    - Data de Nascimento (obrigatório)
 *    - Sexo (obrigatório)
 *    - Estado Civil
 * 
 * 2. Filiação
 *    - Nome da Mãe (obrigatório)
 *    - Nome do Pai
 * 
 * 3. Contato
 *    - Telefone Residencial
 *    - Celular (WhatsApp)
 *    - Email
 * 
 * 4. Endereço
 *    - CEP (busca automática)
 *    - Endereço completo
 * 
 * 5. Dados do Convênio
 *    - Convênio (select)
 *    - Número da Carteirinha
 *    - Validade
 *    - Plano
 *    - Tipo de Atendimento (ambulatorial, hospitalar, etc)
 * 
 * 6. Informações Médicas (Opcional)
 *    - Grupo Sanguíneo
 *    - Alergias
 *    - Medicamentos em Uso
 *    - Observações de Saúde
 * 
 * VALIDAÇÕES:
 * - CPF: Opcional, mas se preenchido deve ser válido
 * - Data de Nascimento: Não pode ser futura
 * - Email: Formato válido
 * - CEP: Formato + busca automática
 * - Número Carteirinha: Único por convênio
 * 
 * INTEGRAÇÕES:
 * - ViaCEP (endereço)
 * - Receita Federal (CPF - opcional)
 * - FHIR HL7 (sincronização)
 * 
 * LGPD:
 * - Consentimento para tratamento de dados
 * - Consentimento para compartilhamento com médicos
 * - Direito ao esquecimento
 * - Anonimização para relatórios
 */

export const FormularioPaciente: React.FC<FormularioPacienteProps> = ({
  pacienteId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<PacienteFormData>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [consentimentoLGPD, setConsentimentoLGPD] = useState(false);

  return (
    <FormularioContainer
      title={pacienteId ? 'Editar Paciente' : 'Novo Paciente'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* LGPD - Consentimento */}
      {!pacienteId && (
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>Consentimento LGPD</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consentimento-lgpd"
                  checked={consentimentoLGPD}
                  onCheckedChange={(checked) => setConsentimentoLGPD(checked)}
                />
                <label htmlFor="consentimento-lgpd" className="text-sm cursor-pointer">
                  Declaro que obtive consentimento do paciente para coleta, armazenamento e 
                  tratamento de seus dados pessoais, conforme Lei Geral de Proteção de Dados (LGPD).
                </label>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Seção 1: Dados Pessoais */}
      <Card title="Dados Pessoais" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            value={formData.nome_completo}
            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
            required
            error={validationErrors.nome_completo}
          />

          <ValidationInput
            label="CPF (Opcional)"
            value={formData.cpf}
            onChange={(value) => setFormData({ ...formData, cpf: value })}
            mask="999.999.999-99"
            validationType="cpf"
            error={validationErrors.cpf}
          />

          <Input
            label="RG"
            value={formData.rg}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
          />

          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            required
            error={validationErrors.data_nascimento}
          />

          <Select
            label="Sexo"
            value={formData.sexo}
            onChange={(value) => setFormData({ ...formData, sexo: value })}
            options={[
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Feminino' },
              { value: 'Outro', label: 'Outro' }
            ]}
            required
          />

          <Select
            label="Estado Civil"
            value={formData.estado_civil}
            onChange={(value) => setFormData({ ...formData, estado_civil: value })}
            options={[
              { value: 'solteiro', label: 'Solteiro(a)' },
              { value: 'casado', label: 'Casado(a)' },
              { value: 'divorciado', label: 'Divorciado(a)' },
              { value: 'viuvo', label: 'Viúvo(a)' },
              { value: 'uniao_estavel', label: 'União Estável' }
            ]}
          />
        </div>
      </Card>

      {/* Seção 2: Filiação */}
      <Card title="Filiação" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome da Mãe"
            value={formData.nome_mae}
            onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
            required
            error={validationErrors.nome_mae}
          />

          <Input
            label="Nome do Pai"
            value={formData.nome_pai}
            onChange={(e) => setFormData({ ...formData, nome_pai: e.target.value })}
          />
        </div>
      </Card>

      {/* Seção 3: Contato */}
      <Card title="Contato" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Telefone Residencial"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            mask="(99) 9999-9999"
            placeholder="(11) 3456-7890"
          />

          <Input
            label="Celular (WhatsApp)"
            value={formData.celular}
            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
            mask="(99) 99999-9999"
            placeholder="(11) 98765-4321"
          />

          <ValidationInput
            label="Email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            validationType="email"
            error={validationErrors.email}
          />
        </div>
      </Card>

      {/* Seção 4: Endereço */}
      <Card title="Endereço" padding="lg">
        <EnderecoFields
          endereco={formData.endereco}
          onChange={(endereco) => setFormData({ ...formData, endereco })}
        />
      </Card>

      {/* Seção 5: Dados do Convênio */}
      <Card title="Dados do Convênio" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Convênio"
            value={formData.convenio_id}
            onChange={(value) => setFormData({ ...formData, convenio_id: value })}
            options={CONVENIOS_DISPONIVEIS}
            required
          />

          <Input
            label="Número da Carteirinha"
            value={formData.numero_carteirinha}
            onChange={(e) => setFormData({ ...formData, numero_carteirinha: e.target.value })}
            required
            error={validationErrors.numero_carteirinha}
          />

          <Input
            label="Validade do Plano"
            type="date"
            value={formData.validade_plano}
            onChange={(e) => setFormData({ ...formData, validade_plano: e.target.value })}
          />

          <Input
            label="Nome do Plano"
            value={formData.plano}
            onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
            placeholder="Ex: Executivo Plus"
          />

          <Select
            label="Tipo de Atendimento"
            value={formData.tipo_atendimento}
            onChange={(value) => setFormData({ ...formData, tipo_atendimento: value })}
            options={[
              { value: 'ambulatorial', label: 'Ambulatorial' },
              { value: 'hospitalar', label: 'Hospitalar' },
              { value: 'completo', label: 'Completo' }
            ]}
          />
        </div>
      </Card>

      {/* Seção 6: Informações Médicas */}
      <Card title="Informações Médicas (Opcional)" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Grupo Sanguíneo"
            value={formData.grupo_sanguineo}
            onChange={(value) => setFormData({ ...formData, grupo_sanguineo: value })}
            options={[
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' }
            ]}
          />

          <Textarea
            label="Alergias"
            value={formData.alergias}
            onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
            rows={2}
            placeholder="Liste alergias conhecidas..."
          />

          <Textarea
            label="Medicamentos em Uso"
            value={formData.medicamentos_uso}
            onChange={(e) => setFormData({ ...formData, medicamentos_uso: e.target.value })}
            rows={2}
            placeholder="Liste medicamentos em uso contínuo..."
          />

          <Textarea
            label="Observações de Saúde"
            value={formData.observacoes_saude}
            onChange={(e) => setFormData({ ...formData, observacoes_saude: e.target.value })}
            rows={2}
            placeholder="Informações relevantes sobre a saúde do paciente..."
          />
        </div>
      </Card>

      {/* Observações Gerais */}
      <Card title="Observações" padding="lg">
        <Textarea
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
          placeholder="Informações adicionais sobre o paciente..."
        />
      </Card>

      {/* Botões */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading || !consentimentoLGPD || Object.keys(validationErrors).length > 0}
          icon={loading ? <Loader2 className="animate-spin" /> : <Check />}
        >
          {loading ? 'Salvando...' : pacienteId ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </FormularioContainer>
  );
};
```

---

## 8. CADASTRO DE CONVÊNIOS

### 8.1. Formulário de Convênio

**Arquivo**: `/components/formularios/FormularioConvenio.tsx`

```typescript
/**
 * Formulário de Convênio
 * 
 * SEÇÕES:
 * 1. Dados Institucionais
 *    - Nome do Convênio (obrigatório)
 *    - CNPJ (validação Receita Federal)
 *    - Registro ANS (validação ANS)
 *    - Tipo (Plano de Saúde, Seguro, Público)
 * 
 * 2. Contato
 *    - Telefone
 *    - Email
 *    - Site
 *    - WhatsApp (SAC)
 * 
 * 3. Dados Financeiros
 *    - Prazo de Pagamento (dias)
 *    - Taxa Administrativa (%)
 *    - Forma de Pagamento (TED, Boleto, etc)
 *    - Dia de Fechamento
 *    - Dia de Pagamento
 * 
 * 4. Dados Bancários
 *    - Banco
 *    - Agência
 *    - Conta
 *    - Responsável Financeiro
 * 
 * 5. Configurações de Faturamento
 *    - Aceita Faturamento Eletrônico
 *    - Portal de Faturamento (URL)
 *    - Login Portal
 *    - Exige Autorização Prévia
 *    - Prazo Máximo para Autorização
 * 
 * VALIDAÇÕES:
 * - CNPJ: Receita Federal
 * - Registro ANS: Validação no portal ANS
 * - Email: Formato
 * 
 * INTEGRAÇÕES:
 * - Receita Federal (CNPJ)
 * - ANS (validação registro)
 */

export const FormularioConvenio: React.FC<FormularioConvenioProps> = ({
  convenioId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<ConvenioFormData>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  // Validação de Registro ANS
  const handleRegistroANSChange = async (registro: string) => {
    setFormData({ ...formData, ans_registro: registro });

    if (registro.length >= 6) {
      try {
        const resultado = await consultarANS(registro);
        
        if (!resultado.encontrado) {
          setValidationErrors({
            ...validationErrors,
            ans_registro: 'Registro ANS não encontrado'
          });
          return;
        }

        // Enriquecer dados
        setFormData({
          ...formData,
          ans_registro: registro,
          nome: resultado.razaoSocial || formData.nome,
          cnpj: resultado.cnpj || formData.cnpj
        });

        // Limpar erro
        const { ans_registro: _, ...rest } = validationErrors;
        setValidationErrors(rest);

      } catch (error) {
        console.warn('Erro ao validar registro ANS:', error);
      }
    }
  };

  return (
    <FormularioContainer
      title={convenioId ? 'Editar Convênio' : 'Novo Convênio'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* Dados Institucionais */}
      <Card title="Dados Institucionais" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Convênio"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            error={validationErrors.nome}
          />

          <CNPJValidationInput
            label="CNPJ"
            value={formData.cnpj}
            onChange={(value) => setFormData({ ...formData, cnpj: value })}
            error={validationErrors.cnpj}
          />

          <Input
            label="Registro ANS"
            value={formData.ans_registro}
            onChange={(e) => handleRegistroANSChange(e.target.value)}
            placeholder="123456"
            error={validationErrors.ans_registro}
          />

          <Select
            label="Tipo de Convênio"
            value={formData.tipo}
            onChange={(value) => setFormData({ ...formData, tipo: value })}
            options={[
              { value: 'plano_saude', label: 'Plano de Saúde' },
              { value: 'seguros', label: 'Seguradora' },
              { value: 'publico', label: 'Público (SUS, etc)' }
            ]}
            required
          />
        </div>
      </Card>

      {/* Contato */}
      <Card title="Contato" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Telefone Principal"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            mask="(99) 9999-9999"
          />

          <Input
            label="WhatsApp (SAC)"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            mask="(99) 99999-9999"
          />

          <ValidationInput
            label="Email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            validationType="email"
            required
            error={validationErrors.email}
          />

          <Input
            label="Site"
            value={formData.site}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </Card>

      {/* Dados Financeiros */}
      <Card title="Dados Financeiros" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Prazo de Pagamento (dias)"
            type="number"
            value={formData.prazo_pagamento}
            onChange={(e) => setFormData({ ...formData, prazo_pagamento: parseInt(e.target.value) })}
            min="0"
            max="180"
            placeholder="Ex: 30"
          />

          <Input
            label="Taxa Administrativa (%)"
            type="number"
            value={formData.taxa_administrativa}
            onChange={(e) => setFormData({ ...formData, taxa_administrativa: parseFloat(e.target.value) })}
            min="0"
            max="100"
            step="0.01"
            placeholder="Ex: 5.5"
          />

          <Select
            label="Forma de Pagamento"
            value={formData.forma_pagamento}
            onChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
            options={[
              { value: 'ted', label: 'TED' },
              { value: 'boleto', label: 'Boleto' },
              { value: 'pix', label: 'PIX' },
              { value: 'cheque', label: 'Cheque' }
            ]}
          />

          <Input
            label="Dia de Fechamento"
            type="number"
            value={formData.dia_fechamento}
            onChange={(e) => setFormData({ ...formData, dia_fechamento: parseInt(e.target.value) })}
            min="1"
            max="31"
            placeholder="Ex: 5"
          />

          <Input
            label="Dia de Pagamento"
            type="number"
            value={formData.dia_pagamento}
            onChange={(e) => setFormData({ ...formData, dia_pagamento: parseInt(e.target.value) })}
            min="1"
            max="31"
            placeholder="Ex: 15"
          />
        </div>
      </Card>

      {/* Configurações de Faturamento */}
      <Card title="Configurações de Faturamento" padding="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="faturamento_eletronico"
              checked={formData.faturamento_eletronico}
              onCheckedChange={(checked) => setFormData({ ...formData, faturamento_eletronico: checked })}
            />
            <label htmlFor="faturamento_eletronico">
              Aceita Faturamento Eletrônico
            </label>
          </div>

          {formData.faturamento_eletronico && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Portal de Faturamento (URL)"
                value={formData.portal_faturamento}
                onChange={(e) => setFormData({ ...formData, portal_faturamento: e.target.value })}
                placeholder="https://portal.convenio.com.br"
              />

              <Input
                label="Login Portal"
                value={formData.login_portal}
                onChange={(e) => setFormData({ ...formData, login_portal: e.target.value })}
                placeholder="usuario.distribuidora"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="exige_autorizacao"
              checked={formData.exige_autorizacao}
              onCheckedChange={(checked) => setFormData({ ...formData, exige_autorizacao: checked })}
            />
            <label htmlFor="exige_autorizacao">
              Exige Autorização Prévia
            </label>
          </div>

          {formData.exige_autorizacao && (
            <Input
              label="Prazo Máximo para Autorização (horas)"
              type="number"
              value={formData.prazo_autorizacao}
              onChange={(e) => setFormData({ ...formData, prazo_autorizacao: parseInt(e.target.value) })}
              min="1"
              max="240"
              placeholder="Ex: 48"
            />
          )}
        </div>
      </Card>

      {/* Observações */}
      <Card title="Observações" padding="lg">
        <Textarea
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
          placeholder="Informações adicionais sobre o convênio..."
        />
      </Card>

      {/* Botões */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          icon={loading ? <Loader2 className="animate-spin" /> : <Check />}
        >
          {loading ? 'Salvando...' : convenioId ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </FormularioContainer>
  );
};
```

---

## 9. CADASTRO DE FORNECEDORES

### 9.1. Formulário Avançado de Fornecedor

**Arquivo**: `/components/formularios/FormularioFornecedorAvancado.tsx`

```typescript
/**
 * Formulário Avançado de Fornecedor
 * 
 * SEÇÕES:
 * 1. Dados Institucionais
 *    - Razão Social (obrigatório)
 *    - Nome Fantasia
 *    - CNPJ (validação Receita Federal)
 *    - Tipo (Fabricante, Distribuidor, Importador, Prestador de Serviços)
 *    - Inscrição Estadual
 * 
 * 2. Contato
 *    - Telefone
 *    - Email
 *    - Site
 *    - Contato Comercial (nome, telefone, email)
 *    - Contato Financeiro (nome, telefone, email)
 * 
 * 3. Endereço
 *    - CEP (busca automática)
 *    - Endereço completo
 * 
 * 4. Dados Financeiros
 *    - Banco
 *    - Agência
 *    - Conta
 *    - PIX
 *    - Prazo de Entrega Médio (dias)
 *    - Prazo de Pagamento Padrão (dias)
 *    - Condições de Pagamento
 * 
 * 5. Dados Operacionais
 *    - Horário de Atendimento
 *    - Pedido Mínimo
 *    - Tempo de Resposta de Cotação (horas)
 *    - Aceita Consignação
 *    - Faz Entrega
 *    - Raio de Entrega (km)
 * 
 * 6. Avaliação e Performance
 *    - Avaliação Geral (0-5 estrelas)
 *    - Qualidade dos Produtos (0-5)
 *    - Pontualidade (0-5)
 *    - Atendimento (0-5)
 *    - Preço (0-5)
 * 
 * 7. Certificações
 *    - ISO 9001
 *    - ISO 13485
 *    - Certificado ANVISA
 *    - Outras Certificações
 * 
 * VALIDAÇÕES:
 * - CNPJ: Receita Federal
 * - Email: Formato
 * - CEP: Formato + busca
 * 
 * INTEGRAÇÕES:
 * - Receita Federal (CNPJ)
 * - ViaCEP (endereço)
 */

export const FormularioFornecedorAvancado: React.FC<FormularioFornecedorProps> = ({
  fornecedorId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FornecedorFormData>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  return (
    <FormularioContainer
      title={fornecedorId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* Dados Institucionais */}
      <Card title="Dados Institucionais" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Razão Social"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            required
            error={validationErrors.razao_social}
          />

          <Input
            label="Nome Fantasia"
            value={formData.nome_fantasia}
            onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
          />

          <CNPJValidationInput
            label="CNPJ"
            value={formData.cnpj}
            onChange={(value) => setFormData({ ...formData, cnpj: value })}
            required
            error={validationErrors.cnpj}
          />

          <Select
            label="Tipo de Fornecedor"
            value={formData.tipo}
            onChange={(value) => setFormData({ ...formData, tipo: value })}
            options={[
              { value: 'fabricante', label: 'Fabricante' },
              { value: 'distribuidor', label: 'Distribuidor' },
              { value: 'importador', label: 'Importador' },
              { value: 'prestador_servicos', label: 'Prestador de Serviços' }
            ]}
            required
          />

          <Input
            label="Inscrição Estadual"
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
          />
        </div>
      </Card>

      {/* Contato */}
      <Card title="Contato" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Telefone Principal"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            mask="(99) 9999-9999"
            required
          />

          <ValidationInput
            label="Email Principal"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            validationType="email"
            required
            error={validationErrors.email}
          />

          <Input
            label="Site"
            value={formData.site}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Contato Comercial */}
        <div className="mt-4">
          <h4 className="font-semibold mb-3">Contato Comercial</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nome"
              value={formData.contato_comercial_nome}
              onChange={(e) => setFormData({ ...formData, contato_comercial_nome: e.target.value })}
            />
            <Input
              label="Telefone"
              value={formData.contato_comercial_telefone}
              onChange={(e) => setFormData({ ...formData, contato_comercial_telefone: e.target.value })}
              mask="(99) 99999-9999"
            />
            <ValidationInput
              label="Email"
              value={formData.contato_comercial_email}
              onChange={(value) => setFormData({ ...formData, contato_comercial_email: value })}
              validationType="email"
            />
          </div>
        </div>

        {/* Contato Financeiro */}
        <div className="mt-4">
          <h4 className="font-semibold mb-3">Contato Financeiro</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nome"
              value={formData.contato_financeiro_nome}
              onChange={(e) => setFormData({ ...formData, contato_financeiro_nome: e.target.value })}
            />
            <Input
              label="Telefone"
              value={formData.contato_financeiro_telefone}
              onChange={(e) => setFormData({ ...formData, contato_financeiro_telefone: e.target.value })}
              mask="(99) 99999-9999"
            />
            <ValidationInput
              label="Email"
              value={formData.contato_financeiro_email}
              onChange={(value) => setFormData({ ...formData, contato_financeiro_email: value })}
              validationType="email"
            />
          </div>
        </div>
      </Card>

      {/* Endereço */}
      <Card title="Endereço" padding="lg">
        <EnderecoFields
          endereco={formData.endereco}
          onChange={(endereco) => setFormData({ ...formData, endereco })}
        />
      </Card>

      {/* Dados Financeiros */}
      <Card title="Dados Bancários" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Banco"
            value={formData.banco}
            onChange={(value) => setFormData({ ...formData, banco: value })}
            options={BANCOS_BRASILEIROS}
          />

          <Input
            label="Agência"
            value={formData.agencia}
            onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
            mask="9999"
          />

          <Input
            label="Conta"
            value={formData.conta}
            onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
          />

          <Input
            label="Chave PIX"
            value={formData.pix}
            onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
            placeholder="CNPJ, email ou chave"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Prazo de Pagamento Padrão (dias)"
            type="number"
            value={formData.prazo_pagamento}
            onChange={(e) => setFormData({ ...formData, prazo_pagamento: parseInt(e.target.value) })}
            min="0"
            max="180"
            placeholder="Ex: 30"
          />

          <Input
            label="Condições de Pagamento"
            value={formData.condicoes_pagamento}
            onChange={(e) => setFormData({ ...formData, condicoes_pagamento: e.target.value })}
            placeholder="Ex: 30/60 dias"
          />
        </div>
      </Card>

      {/* Dados Operacionais */}
      <Card title="Dados Operacionais" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Prazo de Entrega Médio (dias)"
            type="number"
            value={formData.prazo_entrega_medio}
            onChange={(e) => setFormData({ ...formData, prazo_entrega_medio: parseInt(e.target.value) })}
            min="0"
            placeholder="Ex: 7"
          />

          <Input
            label="Tempo Resposta Cotação (horas)"
            type="number"
            value={formData.tempo_resposta_cotacao}
            onChange={(e) => setFormData({ ...formData, tempo_resposta_cotacao: parseInt(e.target.value) })}
            min="1"
            placeholder="Ex: 24"
          />

          <Input
            label="Pedido Mínimo (R$)"
            type="number"
            value={formData.pedido_minimo}
            onChange={(e) => setFormData({ ...formData, pedido_minimo: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
            placeholder="Ex: 500.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Horário de Atendimento"
            value={formData.horario_atendimento}
            onChange={(e) => setFormData({ ...formData, horario_atendimento: e.target.value })}
            placeholder="Ex: Seg-Sex 8h-18h"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="aceita_consignacao"
                checked={formData.aceita_consignacao}
                onCheckedChange={(checked) => setFormData({ ...formData, aceita_consignacao: checked })}
              />
              <label htmlFor="aceita_consignacao">Aceita Consignação</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="faz_entrega"
                checked={formData.faz_entrega}
                onCheckedChange={(checked) => setFormData({ ...formData, faz_entrega: checked })}
              />
              <label htmlFor="faz_entrega">Faz Entrega</label>
            </div>
          </div>

          {formData.faz_entrega && (
            <Input
              label="Raio de Entrega (km)"
              type="number"
              value={formData.raio_entrega}
              onChange={(e) => setFormData({ ...formData, raio_entrega: parseInt(e.target.value) })}
              min="0"
              placeholder="Ex: 50"
            />
          )}
        </div>
      </Card>

      {/* Avaliação */}
      <Card title="Avaliação e Performance" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <RatingInput
            label="Qualidade dos Produtos"
            value={formData.avaliacao_qualidade}
            onChange={(value) => setFormData({ ...formData, avaliacao_qualidade: value })}
            max={5}
          />

          <RatingInput
            label="Pontualidade"
            value={formData.avaliacao_pontualidade}
            onChange={(value) => setFormData({ ...formData, avaliacao_pontualidade: value })}
            max={5}
          />

          <RatingInput
            label="Atendimento"
            value={formData.avaliacao_atendimento}
            onChange={(value) => setFormData({ ...formData, avaliacao_atendimento: value })}
            max={5}
          />

          <RatingInput
            label="Preço"
            value={formData.avaliacao_preco}
            onChange={(value) => setFormData({ ...formData, avaliacao_preco: value })}
            max={5}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Avaliação Geral
            </label>
            <p className="text-3xl font-bold text-indigo-600">
              {calcularAvaliacaoGeral(formData).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">de 5.0 estrelas</p>
          </div>
        </div>
      </Card>

      {/* Certificações */}
      <Card title="Certificações" padding="lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cert_iso9001"
              checked={formData.certificacoes?.iso9001}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                certificacoes: { ...formData.certificacoes, iso9001: checked }
              })}
            />
            <label htmlFor="cert_iso9001">ISO 9001 (Gestão da Qualidade)</label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cert_iso13485"
              checked={formData.certificacoes?.iso13485}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                certificacoes: { ...formData.certificacoes, iso13485: checked }
              })}
            />
            <label htmlFor="cert_iso13485">ISO 13485 (Dispositivos Médicos)</label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cert_anvisa"
              checked={formData.certificacoes?.anvisa}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                certificacoes: { ...formData.certificacoes, anvisa: checked }
              })}
            />
            <label htmlFor="cert_anvisa">Certificado ANVISA</label>
          </div>

          <Textarea
            label="Outras Certificações"
            value={formData.certificacoes?.outras}
            onChange={(e) => setFormData({
              ...formData,
              certificacoes: { ...formData.certificacoes, outras: e.target.value }
            })}
            rows={2}
            placeholder="Liste outras certificações relevantes..."
          />
        </div>
      </Card>

      {/* Observações */}
      <Card title="Observações" padding="lg">
        <Textarea
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
          placeholder="Informações adicionais sobre o fornecedor..."
        />
      </Card>

      {/* Botões */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          icon={loading ? <Loader2 className="animate-spin" /> : <Check />}
        >
          {loading ? 'Salvando...' : fornecedorId ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </FormularioContainer>
  );
};
```

---

## 10. CADASTRO DE PRODUTOS OPME

### 10.1. Formulário Avançado de Produto OPME

**Arquivo**: `/components/formularios/FormularioProdutoOPMEAvancado.tsx`

```typescript
/**
 * Formulário Avançado de Produto OPME
 * 
 * SEÇÕES:
 * 1. Identificação
 *    - Código Interno (gerado automaticamente)
 *    - Código de Barras (EAN)
 *    - Código ANVISA (validação ANVISA)
 *    - Código TUSS (autocomplete ANS)
 *    - Descrição Completa (obrigatório)
 * 
 * 2. Classificação
 *    - Categoria
 *    - Subcategoria
 *    - Grupo de Produtos
 *    - Classe de Risco ANVISA (I, II, III, IV)
 *    - Tipo de Material
 * 
 * 3. Fornecedor
 *    - Fornecedor Principal (select)
 *    - Fornecedores Alternativos
 *    - Fabricante
 *    - País de Origem
 * 
 * 4. Precificação
 *    - Preço de Custo
 *    - Margem de Lucro (%)
 *    - Preço de Venda (calculado)
 *    - Preço Mínimo
 *    - Preço Tabela (para convênios)
 * 
 * 5. Estoque
 *    - Unidade de Medida
 *    - Estoque Mínimo
 *    - Estoque Máximo
 *    - Ponto de Pedido
 *    - Localização no Almoxarifado
 * 
 * 6. Rastreabilidade
 *    - Exige Rastreamento Individual
 *    - Controla Lote
 *    - Controla Validade
 *    - Controla Número de Série
 *    - Requer Refrigeração
 *    - Temperatura de Armazenamento
 * 
 * 7. Documentação
 *    - Upload de Registro ANVISA (PDF)
 *    - Upload de Laudo Técnico
 *    - Upload de Manual/IFU
 *    - Upload de Certificado de Conformidade
 * 
 * VALIDAÇÕES:
 * - Código ANVISA: Validação no portal ANVISA
 * - Código TUSS: Validação ANS
 * - Preço de Venda: Deve ser maior que custo
 * - Margem: 0-100%
 * 
 * INTEGRAÇÕES:
 * - ANVISA (validação produto)
 * - ANS TUSS (códigos)
 * - Cálculo automático de preço de venda
 */

export const FormularioProdutoOPMEAvancado: React.FC<FormularioProdutoProps> = ({
  produtoId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProdutoOPMEFormData>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  // Gerar Código Interno automaticamente
  useEffect(() => {
    if (!produtoId && !formData.codigo_interno) {
      const codigoGerado = gerarCodigoInterno();
      setFormData({ ...formData, codigo_interno: codigoGerado });
    }
  }, []);

  // Calcular Preço de Venda automaticamente
  useEffect(() => {
    if (formData.preco_custo && formData.margem_lucro) {
      const precoVenda = formData.preco_custo * (1 + formData.margem_lucro / 100);
      setFormData({ ...formData, preco_venda: precoVenda });
    }
  }, [formData.preco_custo, formData.margem_lucro]);

  // Validação de Código ANVISA
  const handleCodigoANVISAChange = async (codigo: string) => {
    setFormData({ ...formData, codigo_anvisa: codigo });

    if (codigo.length >= 10) {
      try {
        const resultado = await consultarANVISA(codigo);
        
        if (!resultado.valido) {
          setValidationErrors({
            ...validationErrors,
            codigo_anvisa: 'Código ANVISA não encontrado ou inválido'
          });
          return;
        }

        // Enriquecer dados
        setFormData({
          ...formData,
          codigo_anvisa: codigo,
          descricao: resultado.descricao || formData.descricao,
          classe_risco: resultado.classeRisco || formData.classe_risco,
          fabricante: resultado.fabricante || formData.fabricante
        });

        // Limpar erro
        const { codigo_anvisa: _, ...rest } = validationErrors;
        setValidationErrors(rest);

      } catch (error) {
        console.warn('Erro ao validar código ANVISA:', error);
      }
    }
  };

  return (
    <FormularioContainer
      title={produtoId ? 'Editar Produto OPME' : 'Novo Produto OPME'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* Seção 1: Identificação */}
      <Card title="Identificação" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código Interno"
            value={formData.codigo_interno}
            onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
            required
            disabled
            error={validationErrors.codigo_interno}
          />

          <Input
            label="Código de Barras (EAN)"
            value={formData.codigo_barras}
            onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
            placeholder="7891234567890"
          />

          <Input
            label="Código ANVISA"
            value={formData.codigo_anvisa}
            onChange={(e) => handleCodigoANVISAChange(e.target.value)}
            placeholder="80123456789"
            error={validationErrors.codigo_anvisa}
          />

          <AutocompleteInput
            label="Código TUSS"
            value={formData.codigo_tuss}
            onChange={(value) => setFormData({ ...formData, codigo_tuss: value })}
            onSearch={searchCodigosTUSS}
            placeholder="Digite para buscar..."
          />

          <div className="md:col-span-2">
            <Textarea
              label="Descrição Completa"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              required
              error={validationErrors.descricao}
              placeholder="Descrição detalhada do produto OPME..."
            />
          </div>
        </div>
      </Card>

      {/* Seção 2: Classificação */}
      <Card title="Classificação" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Categoria"
            value={formData.categoria}
            onChange={(value) => setFormData({ ...formData, categoria: value })}
            options={CATEGORIAS_OPME}
            required
          />

          <Select
            label="Subcategoria"
            value={formData.subcategoria}
            onChange={(value) => setFormData({ ...formData, subcategoria: value })}
            options={getSubcategorias(formData.categoria)}
          />

          <Select
            label="Grupo de Produtos"
            value={formData.grupo_id}
            onChange={(value) => setFormData({ ...formData, grupo_id: value })}
            options={GRUPOS_PRODUTOS}
          />

          <Select
            label="Classe de Risco ANVISA"
            value={formData.classe_risco}
            onChange={(value) => setFormData({ ...formData, classe_risco: value })}
            options={[
              { value: 'I', label: 'Classe I (Baixo Risco)' },
              { value: 'II', label: 'Classe II (Médio Risco)' },
              { value: 'III', label: 'Classe III (Alto Risco)' },
              { value: 'IV', label: 'Classe IV (Máximo Risco)' }
            ]}
          />

          <Input
            label="Tipo de Material"
            value={formData.tipo_material}
            onChange={(e) => setFormData({ ...formData, tipo_material: e.target.value })}
            placeholder="Ex: Titânio, Aço Inox, Polietileno"
          />
        </div>
      </Card>

      {/* Seção 3: Fornecedor */}
      <Card title="Fornecedor" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Fornecedor Principal"
            value={formData.fornecedor_id}
            onChange={(value) => setFormData({ ...formData, fornecedor_id: value })}
            options={FORNECEDORES_DISPONIVEIS}
            required
          />

          <MultiSelect
            label="Fornecedores Alternativos"
            value={formData.fornecedores_alternativos || []}
            onChange={(values) => setFormData({ ...formData, fornecedores_alternativos: values })}
            options={FORNECEDORES_DISPONIVEIS}
          />

          <Input
            label="Fabricante"
            value={formData.fabricante}
            onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
          />

          <Select
            label="País de Origem"
            value={formData.pais_origem}
            onChange={(value) => setFormData({ ...formData, pais_origem: value })}
            options={PAISES}
          />
        </div>
      </Card>

      {/* Seção 4: Precificação */}
      <Card title="Precificação" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Preço de Custo (R$)"
            type="number"
            value={formData.preco_custo}
            onChange={(e) => setFormData({ ...formData, preco_custo: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
            required
            error={validationErrors.preco_custo}
          />

          <Input
            label="Margem de Lucro (%)"
            type="number"
            value={formData.margem_lucro}
            onChange={(e) => setFormData({ ...formData, margem_lucro: parseFloat(e.target.value) })}
            min="0"
            max="1000"
            step="0.01"
            required
          />

          <Input
            label="Preço de Venda (R$)"
            type="number"
            value={formData.preco_venda}
            onChange={(e) => setFormData({ ...formData, preco_venda: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
            required
            disabled
          />

          <Input
            label="Preço Mínimo (R$)"
            type="number"
            value={formData.preco_minimo}
            onChange={(e) => setFormData({ ...formData, preco_minimo: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
          />

          <div className="md:col-span-4">
            <Alert variant="info">
              <Calculator className="h-4 w-4" />
              <AlertDescription>
                Preço de Venda calculado automaticamente: R$ {formatCurrency(formData.preco_venda)}
                <br />
                <small>
                  Fórmula: Custo (R$ {formatCurrency(formData.preco_custo)}) × 
                  (1 + Margem ({formData.margem_lucro}%))
                </small>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Card>

      {/* Seção 5: Estoque */}
      <Card title="Controle de Estoque" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Unidade de Medida"
            value={formData.unidade_medida}
            onChange={(value) => setFormData({ ...formData, unidade_medida: value })}
            options={[
              { value: 'UN', label: 'Unidade' },
              { value: 'CX', label: 'Caixa' },
              { value: 'PC', label: 'Peça' },
              { value: 'KIT', label: 'Kit' },
              { value: 'PAR', label: 'Par' }
            ]}
            required
          />

          <Input
            label="Estoque Mínimo"
            type="number"
            value={formData.estoque_minimo}
            onChange={(e) => setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) })}
            min="0"
            required
          />

          <Input
            label="Estoque Máximo"
            type="number"
            value={formData.estoque_maximo}
            onChange={(e) => setFormData({ ...formData, estoque_maximo: parseInt(e.target.value) })}
            min="0"
          />

          <Input
            label="Ponto de Pedido"
            type="number"
            value={formData.ponto_pedido}
            onChange={(e) => setFormData({ ...formData, ponto_pedido: parseInt(e.target.value) })}
            min="0"
            placeholder="Qtd para novo pedido"
          />

          <Input
            label="Localização (Almoxarifado)"
            value={formData.localizacao_estoque}
            onChange={(e) => setFormData({ ...formData, localizacao_estoque: e.target.value })}
            placeholder="Ex: A01-P03-N02"
          />
        </div>
      </Card>

      {/* Seção 6: Rastreabilidade */}
      <Card title="Rastreabilidade e Armazenamento" padding="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rastreavel"
                checked={formData.rastreavel}
                onCheckedChange={(checked) => setFormData({ ...formData, rastreavel: checked })}
              />
              <label htmlFor="rastreavel">Exige Rastreamento Individual</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="controla_lote"
                checked={formData.controla_lote}
                onCheckedChange={(checked) => setFormData({ ...formData, controla_lote: checked })}
              />
              <label htmlFor="controla_lote">Controla Lote</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="controla_validade"
                checked={formData.controla_validade}
                onCheckedChange={(checked) => setFormData({ ...formData, controla_validade: checked })}
              />
              <label htmlFor="controla_validade">Controla Validade</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="controla_serie"
                checked={formData.controla_numero_serie}
                onCheckedChange={(checked) => setFormData({ ...formData, controla_numero_serie: checked })}
              />
              <label htmlFor="controla_serie">Controla Número de Série</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="requer_refrigeracao"
                checked={formData.requer_refrigeracao}
                onCheckedChange={(checked) => setFormData({ ...formData, requer_refrigeracao: checked })}
              />
              <label htmlFor="requer_refrigeracao">Requer Refrigeração</label>
            </div>
          </div>

          {formData.requer_refrigeracao && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Temperatura Mínima (°C)"
                type="number"
                value={formData.temperatura_minima}
                onChange={(e) => setFormData({ ...formData, temperatura_minima: parseInt(e.target.value) })}
                placeholder="Ex: 2"
              />
              <Input
                label="Temperatura Máxima (°C)"
                type="number"
                value={formData.temperatura_maxima}
                onChange={(e) => setFormData({ ...formData, temperatura_maxima: parseInt(e.target.value) })}
                placeholder="Ex: 8"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Seção 7: Documentação */}
      <Card title="Documentação" padding="lg">
        <div className="space-y-4">
          <FileUploadZone
            label="Registro ANVISA (PDF)"
            accept=".pdf"
            onFileSelect={(file) => handleUploadDocumento('registro_anvisa', file)}
            value={formData.documentos?.registro_anvisa}
          />

          <FileUploadZone
            label="Laudo Técnico (PDF)"
            accept=".pdf"
            onFileSelect={(file) => handleUploadDocumento('laudo_tecnico', file)}
            value={formData.documentos?.laudo_tecnico}
          />

          <FileUploadZone
            label="Manual/IFU (PDF)"
            accept=".pdf"
            onFileSelect={(file) => handleUploadDocumento('manual_ifu', file)}
            value={formData.documentos?.manual_ifu}
          />

          <FileUploadZone
            label="Certificado de Conformidade (PDF)"
            accept=".pdf"
            onFileSelect={(file) => handleUploadDocumento('certificado_conformidade', file)}
            value={formData.documentos?.certificado_conformidade}
          />
        </div>
      </Card>

      {/* Observações */}
      <Card title="Observações" padding="lg">
        <Textarea
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
          placeholder="Informações técnicas adicionais sobre o produto..."
        />
      </Card>

      {/* Botões */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          icon={loading ? <Loader2 className="animate-spin" /> : <Check />}
        >
          {loading ? 'Salvando...' : produtoId ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </FormularioContainer>
  );
};
```

---

[Continuação do arquivo com Equipes Médicas, Transportadoras, IA, Importação em Massa e todo o Módulo de Compras...]

**Arquivo muito extenso. Continuo com a Parte II (Compras e Fornecedores) em seguida?**
