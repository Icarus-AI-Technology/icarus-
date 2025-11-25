import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Shield, Phone, DollarSign, FileText, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { CadastrosService } from '../../services/CadastrosService';
import { ValidacaoService } from '../../services/ValidacaoService';
import { Button } from '@/components/oraclusx-ds/Button';
import { Input } from '@/components/oraclusx-ds/Input';
import { Select } from '@/components/oraclusx-ds/Select';
import type { Convenio, ConvenioFormData, ValidationErrors } from '../../types/cadastros';

/**
 * FORMULÁRIO DE CADASTRO DE CONVÊNIOS
 *
 * DOCUMENTAÇÃO: MODULOS_CADASTROS_COMPRAS_PARTE2.md → Seção"Convênios"
 *
 * ESTRUTURA:
 * 1. Dados Institucionais (Nome *, CNPJ, Registro ANS, Tipo)
 * 2. Contato (Telefone, WhatsApp, Email *, Site)
 * 3. Dados Financeiros (Prazo Pagamento, Taxa Admin, Forma Pagto, Dias de Fechamento/Pagto)
 * 4. Faturamento Eletrônico (Possui portal?, URL, Login, Exige autorização prévia?)
 * 5. Observações (Textarea livre)
 *
 * VALIDAÇÕES:
 * - Nome: Obrigatório
 * - Email: Obrigatório + formato
 * - CNPJ: Opcional, mas se preenchido, validado (Receita Federal)
 * - Registro ANS: Opcional, mas se preenchido, validado (formato)
 *
 * INTEGRAÇÕES:
 * - Receita Federal (CNPJ)
 * - ANS (Validação de registro)
 * - CadastrosService (CRUD)
 * - ValidacaoService (Validações)
 *
 * DESIGN:
 * - OraclusX DS 100% (CSS Variables, Neumorphism, Hard Gates)
 * - Dark Mode Ready
 * - Responsivo (1/2/3/4 colunas)
 * - Loading states (CNPJ)
 * - Inline validation errors
 */

export default function CadastroConvenios() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingCnpj, setValidatingCnpj] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<ConvenioFormData>({
    nome: '',
    cnpj: '',
    ans_registro: '',
    tipo: 'plano_saude',
    telefone: '',
    whatsapp: '',
    email: '',
    site: '',
    prazo_pagamento: 30,
    taxa_administrativa: 0,
    forma_pagamento: 'ted',
    dia_fechamento: 25,
    dia_pagamento: 10,
    faturamento_eletronico: false,
    portal_faturamento: '',
    login_portal: '',
    exige_autorizacao: true,
    prazo_autorizacao: 48,
    observacoes: '',
  });

  // Validation Errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * HANDLE INPUT CHANGE
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;

    // Checkbox handling
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: ConvenioFormData) => ({ ...prev, [id]: checked }));
      return;
    }

    // Number fields
    if (
      type === 'number' ||
      id === 'prazo_pagamento' ||
      id === 'taxa_administrativa' ||
      id === 'dia_fechamento' ||
      id === 'dia_pagamento' ||
      id === 'prazo_autorizacao'
    ) {
      const numValue = value === '' ? undefined : parseFloat(value);
      setFormData((prev: ConvenioFormData) => ({ ...prev, [id]: numValue }));
      return;
    }

    // Regular fields
    setFormData((prev: ConvenioFormData) => ({ ...prev, [id]: value }));
  };

  /**
   * VALIDAÇÃO CNPJ EM TEMPO REAL (OPCIONAL, MAS SE PREENCHIDO, VALIDADO)
   */
  const handleCnpjBlur = async () => {
    // Se CNPJ não foi preenchido, não precisa validar
    if (!formData.cnpj || formData.cnpj.trim() === '') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cnpj;
        return newErrors;
      });
      return;
    }

    setValidatingCnpj(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cnpj;
      return newErrors;
    });

    try {
      const validacaoService = new ValidacaoService();
      const result = await validacaoService.consultarCNPJReceitaFederal(formData.cnpj);
      const { valido: valid, mensagem: message, razaoSocial } = result;

      if (!valid) {
        setErrors((prev: ValidationErrors) => ({ ...prev, cnpj: message || 'CNPJ inválido' }));
      } else {
        toast.success('CNPJ validado com sucesso!');

        // Preenche automaticamente a Razão Social (se disponível)
        if (razaoSocial) {
          setFormData((prev: ConvenioFormData) => ({
            ...prev,
            nome: razaoSocial,
          }));
          toast.success(`Razão Social preenchida: ${razaoSocial}`);
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      setErrors((prev: ValidationErrors) => ({
        ...prev,
        cnpj: err.message || 'Erro ao validar CNPJ.',
      }));
    } finally {
      setValidatingCnpj(false);
    }
  };

  /**
   * VALIDAÇÃO ANTES DE SUBMETER
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do convênio é obrigatório.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório.';
    }

    // Email format
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de email inválido.';
      }
    }

    // Registro ANS format (opcional, mas se preenchido, deve seguir padrão)
    if (formData.ans_registro && formData.ans_registro.trim() !== '') {
      const ansRegex = /^\d{6}$/; // 6 dígitos
      if (!ansRegex.test(formData.ans_registro)) {
        newErrors.ans_registro = 'Registro ANS deve conter 6 dígitos.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * SUBMIT
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const cadastrosService = new CadastrosService();
      const { data: novoConvenio, error } = await cadastrosService.criar<Convenio>(
        'convenio',
        formData as unknown as Omit<Convenio, 'id' | 'created_at' | 'updated_at'>
      );

      if (error || !novoConvenio) {
        throw error || new Error('Erro ao cadastrar convênio');
      }

      const convenio = novoConvenio as Convenio;
      toast.success(`Convênio ${convenio.nome} cadastrado com sucesso!`);
      navigate('/cadastros');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Erro ao cadastrar convênio.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * CANCEL
   */
  const handleCancel = () => {
    if (
      window.confirm('Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.')
    ) {
      navigate('/cadastros');
    }
  };

  return (
    <div className="py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/cadastros')}
            className="p-3 rounded-lg flex items-center justify-center"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-[0.813rem] font-bold text-[var(--orx-text-primary)]">
              Cadastro de Convênios
            </h1>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mt-1">
              Preencha os dados do convênio. Campos com (*) são obrigatórios.
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* 1. DADOS INSTITUCIONAIS */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 mb-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              1. Dados Institucionais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nome */}
            <div className="col-span-full">
              <Input
                variant="neumo"
                label="Nome do Convênio *"
                id="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Unimed São Paulo"
                error={errors.nome}
              />
            </div>

            {/* CNPJ */}
            <div>
              <div className="relative">
                <Input
                  variant="neumo"
                  label="CNPJ (Opcional)"
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  error={errors.cnpj}
                  rightIcon={validatingCnpj ? Loader2 : undefined}
                />
              </div>
            </div>

            {/* Registro ANS */}
            <div>
              <Input
                variant="neumo"
                label="Registro ANS"
                id="ans_registro"
                value={formData.ans_registro}
                onChange={handleChange}
                placeholder="Ex: 123456 (6 dígitos)"
                maxLength={6}
                error={errors.ans_registro}
              />
            </div>

            {/* Tipo */}
            <div>
              <Select
                label="Tipo *"
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData((prev: ConvenioFormData) => ({
                    ...prev,
                    tipo: (value ?? prev.tipo) as 'plano_saude' | 'seguros' | 'publico',
                  }))
                }
                options={[
                  { value: 'plano_saude', label: 'Plano de Saúde' },
                  { value: 'seguros', label: 'Seguros' },
                  { value: 'publico', label: 'Público (SUS)' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 2. CONTATO */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 mb-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Phone size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              2. Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Telefone */}
            <div>
              <Input
                variant="neumo"
                label="Telefone"
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 3456-7890"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <Input
                variant="neumo"
                label="WhatsApp"
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 98765-4321"
              />
            </div>

            {/* Email */}
            <div className="col-span-full">
              <Input
                variant="neumo"
                label="Email *"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@convenio.com.br"
                error={errors.email}
              />
            </div>

            {/* Site */}
            <div className="col-span-full">
              <Input
                variant="neumo"
                label="Site"
                id="site"
                type="url"
                value={formData.site}
                onChange={handleChange}
                placeholder="https://www.convenio.com.br"
              />
            </div>
          </div>
        </div>

        {/* 3. DADOS FINANCEIROS */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 mb-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              3. Dados Financeiros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Prazo de Pagamento */}
            <div>
              <Input
                variant="neumo"
                label="Prazo de Pagamento (dias)"
                id="prazo_pagamento"
                type="number"
                value={formData.prazo_pagamento || ''}
                onChange={handleChange}
                placeholder="Ex: 30"
                min="0"
              />
            </div>

            {/* Taxa Administrativa */}
            <div>
              <Input
                variant="neumo"
                label="Taxa Administrativa (%)"
                id="taxa_administrativa"
                type="number"
                value={formData.taxa_administrativa || ''}
                onChange={handleChange}
                placeholder="Ex: 15"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            {/* Forma de Pagamento */}
            <div>
              <Select
                label="Forma de Pagamento"
                value={formData.forma_pagamento}
                onValueChange={(value) =>
                  setFormData((prev: ConvenioFormData) => ({
                    ...prev,
                    forma_pagamento: (value ?? prev.forma_pagamento) as
                      | 'ted'
                      | 'boleto'
                      | 'pix'
                      | 'cheque',
                  }))
                }
                options={[
                  { value: 'ted', label: 'TED' },
                  { value: 'boleto', label: 'Boleto' },
                  { value: 'pix', label: 'PIX' },
                  { value: 'cheque', label: 'Cheque' },
                ]}
              />
            </div>

            {/* Dia de Fechamento */}
            <div>
              <Input
                variant="neumo"
                label="Dia de Fechamento"
                id="dia_fechamento"
                type="number"
                value={formData.dia_fechamento || ''}
                onChange={handleChange}
                placeholder="Ex: 25"
                min="1"
                max="31"
              />
            </div>

            {/* Dia de Pagamento */}
            <div>
              <label
                htmlFor="dia_pagamento"
                className="block text-sm font-medium text-primary mb-2"
              >
                Dia de Pagamento
              </label>
              <input
                type="number"
                id="dia_pagamento"
                value={formData.dia_pagamento || ''}
                onChange={handleChange}
                className="neumorphic-input w-full p-3 rounded-lg text-sm text-primary"
                placeholder="Ex: 10"
                min="1"
                max="31"
              />
            </div>
          </div>
        </div>

        {/* 4. FATURAMENTO ELETRÔNICO */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 mb-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              4. Faturamento Eletrônico
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Possui Portal */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="faturamento_eletronico"
                checked={formData.faturamento_eletronico}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[var(--orx-border)] text-[var(--orx-primary)] focus:ring-[var(--orx-primary)]"
              />
              <label
                htmlFor="faturamento_eletronico"
                className="text-[0.813rem] font-medium text-[var(--orx-text-primary)]"
              >
                Possui portal de faturamento?
              </label>
            </div>

            {/* Exige Autorização */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="exige_autorizacao"
                checked={formData.exige_autorizacao}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[var(--orx-border)] text-[var(--orx-primary)] focus:ring-[var(--orx-primary)]"
              />
              <label
                htmlFor="exige_autorizacao"
                className="text-[0.813rem] font-medium text-[var(--orx-text-primary)]"
              >
                Exige autorização prévia?
              </label>
            </div>

            {formData.faturamento_eletronico && (
              <>
                <div className="col-span-full md:col-span-1">
                  <Input
                    variant="neumo"
                    label="URL do Portal"
                    id="portal_faturamento"
                    type="url"
                    value={formData.portal_faturamento || ''}
                    onChange={handleChange}
                    placeholder="https://portal.convenio.com.br"
                  />
                </div>
                <div className="col-span-full md:col-span-1">
                  <Input
                    variant="neumo"
                    label="Login de Acesso"
                    id="login_portal"
                    value={formData.login_portal || ''}
                    onChange={handleChange}
                    placeholder="usuario.faturamento"
                  />
                </div>
              </>
            )}

            {formData.exige_autorizacao && (
              <div className="col-span-full md:col-span-1">
                <Input
                  variant="neumo"
                  label="Prazo de Autorização (horas)"
                  id="prazo_autorizacao"
                  type="number"
                  value={formData.prazo_autorizacao || ''}
                  onChange={handleChange}
                  placeholder="Ex: 48"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* 5. OBSERVAÇÕES */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 mb-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              5. Observações
            </h2>
          </div>

          <div>
            <label
              htmlFor="observacoes"
              className="block text-[0.813rem] font-medium text-[var(--orx-text-primary)] mb-2"
            >
              Observações Gerais
            </label>
            <textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[var(--orx-bg-input)] border border-[var(--orx-border-input)] text-[var(--orx-text-primary)] text-[0.813rem] focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)] transition-all min-h-[100px]"
              placeholder="Informações adicionais sobre o convênio..."
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCancel}
            className="px-6 py-3"
          >
            Cancelar
          </Button>

          <Button
            variant="neumo"
            type="submit"
            color="primary"
            className="px-6 py-3 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <Save size={18} />
                Cadastrar Convênio
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
