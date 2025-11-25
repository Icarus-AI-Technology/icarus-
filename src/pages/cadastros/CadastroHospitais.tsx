import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, MapPin, User, Loader2, X, Stethoscope, Save } from 'lucide-react';
import { toast } from 'sonner';

// Components
import { FormFieldError } from '@/components/oraclusx-ds/FormFieldError';
import { Button } from '@/components/oraclusx-ds/Button';
import { NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';

// Services
import { cadastrosService } from '@/services/CadastrosService';
import { validacaoService } from '@/services/ValidacaoService';

// Types
import type { Hospital, ValidationErrors } from '@/types/cadastros';

// Hooks
import { useDocumentTitle } from '@/hooks';

// Estado inicial
const initialFormData: Hospital = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  cnes: '',
  tipo: 'hospital',
  telefone: '',
  email: '',
  site: '',
  endereco: {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
  },
  responsavel_nome: '',
  responsavel_cpf: '',
  responsavel_telefone: '',
  responsavel_email: '',
  responsavel_cargo: '',
  quantidade_leitos: 0,
  salas_cirurgicas: 0,
  atende_urgencia: false,
  convenios_aceitos: [],
  observacoes: '',
  ativo: true,
  id: '',
  created_at: '',
  updated_at: '',
};

export default function CadastroHospitais() {
  useDocumentTitle('Cadastro de Hospitais');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingCnpj, setValidatingCnpj] = useState(false);
  const [validatingCep, setValidatingCep] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<Hospital>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Limpar erro ao digitar
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco!, [id]: value },
    }));
  };

  const handleCnpjBlur = async () => {
    if (!formData.cnpj) return;

    setValidatingCnpj(true);
    try {
      // Validar formato
      if (!validacaoService.validarCNPJ(formData.cnpj)) {
        setErrors((prev) => ({ ...prev, cnpj: 'CNPJ inválido' }));
        setValidatingCnpj(false);
        return;
      }

      // Buscar dados na API
      const dados = await validacaoService.consultarCNPJ(formData.cnpj);
      if (dados) {
        setFormData((prev) => ({
          ...prev,
          razao_social: dados.razao_social || prev.razao_social,
          nome_fantasia: dados.nome_fantasia || prev.nome_fantasia,
          endereco: {
            ...prev.endereco!,
            cep: dados.endereco?.cep || prev.endereco?.cep || '',
            logradouro: dados.endereco?.logradouro || prev.endereco?.logradouro || '',
            numero: dados.endereco?.numero || prev.endereco?.numero || '',
            bairro: dados.endereco?.bairro || prev.endereco?.bairro || '',
            cidade: dados.endereco?.cidade || prev.endereco?.cidade || '',
            uf: dados.endereco?.uf || prev.endereco?.uf || '',
          },
          telefone: dados.telefone || prev.telefone,
          email: (dados as { email?: string }).email || prev.email,
        }));
        toast.success('Dados do CNPJ carregados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao validar CNPJ:', error);
      // Não bloquear o fluxo, apenas avisar
    } finally {
      setValidatingCnpj(false);
    }
  };

  const handleCepBlur = async () => {
    if (!formData.endereco?.cep || formData.endereco.cep.length < 8) return;

    setValidatingCep(true);
    try {
      const dados = await validacaoService.consultarCEP(formData.endereco.cep);
      if (dados) {
        setFormData((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco!,
            logradouro: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            uf: dados.uf,
          },
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setValidatingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    const newErrors: ValidationErrors = {};
    if (!formData.razao_social) newErrors.razao_social = 'Razão Social é obrigatória';
    if (!formData.cnpj) newErrors.cnpj = 'CNPJ é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    try {
      await cadastrosService.criar('hospital', formData);
      toast.success('Hospital cadastrado com sucesso!');
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao cadastrar hospital:', error);
      toast.error('Erro ao cadastrar hospital. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cadastro de Hospitais</h1>
          <p className="text-muted mt-1">
            Cadastre hospitais, clínicas e ambulatórios com validações CNPJ e CNES
          </p>
        </div>
        <Button
          variant="neumo"
          onClick={() => navigate('/cadastros')}
          className="flex items-center gap-2 px-4 py-2 text-primary"
        >
          <X size={18} />
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Dados Institucionais */}
        <div className="p-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <Building2 size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">Dados Institucionais</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Razão Social */}
            <div>
              <label htmlFor="razao_social" className="block mb-2 text-sm font-medium text-primary">
                Razão Social *
              </label>
              <NeuInput
                id="razao_social"
                value={formData.razao_social}
                onChange={handleChange}
                placeholder="Nome oficial da empresa"
                error={errors.razao_social}
              />
              <FormFieldError error={errors.razao_social} />
            </div>

            {/* Nome Fantasia */}
            <div>
              <label
                htmlFor="nome_fantasia"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Nome Fantasia
              </label>
              <NeuInput
                id="nome_fantasia"
                value={formData.nome_fantasia || ''}
                onChange={handleChange}
                placeholder="Nome comercial"
              />
            </div>

            {/* CNPJ */}
            <div>
              <label htmlFor="cnpj" className="block mb-2 text-sm font-medium text-primary">
                CNPJ *
              </label>
              <div className="relative">
                <NeuInput
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  error={errors.cnpj}
                />
                {validatingCnpj && (
                  <Loader2
                    size={16}
                    className="absolute animate-spin right-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                )}
              </div>
              <FormFieldError error={errors.cnpj} />
            </div>

            {/* CNES */}
            <div>
              <label htmlFor="cnes" className="block mb-2 text-sm font-medium text-primary">
                CNES
              </label>
              <NeuInput
                id="cnes"
                value={formData.cnes || ''}
                onChange={handleChange}
                placeholder="Cadastro Nacional de Estabelecimentos de Saúde"
              />
            </div>

            {/* Tipo de Estabelecimento */}
            <div>
              <label htmlFor="tipo" className="block mb-2 text-sm font-medium text-primary">
                Tipo de Estabelecimento
              </label>
              <NeuSelect
                value={formData.tipo}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'tipo', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: 'hospital', label: 'Hospital Geral' },
                  { value: 'clinica', label: 'Clínica Especializada' },
                  { value: 'ambulatorio', label: 'Ambulatório' },
                ]}
              />
            </div>

            {/* Site */}
            <div>
              <label htmlFor="site" className="block mb-2 text-sm font-medium text-primary">
                Website
              </label>
              <NeuInput
                id="site"
                value={formData.site || ''}
                onChange={handleChange}
                placeholder="www.exemplo.com.br"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Contato */}
        <div className="p-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <Phone size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">Contato</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-primary">
                Telefone *
              </label>
              <NeuInput
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                error={errors.telefone}
              />
              <FormFieldError error={errors.telefone} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-primary">
                Email *
              </label>
              <NeuInput
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@hospital.com.br"
                error={errors.email}
              />
              <FormFieldError error={errors.email} />
            </div>
          </div>
        </div>

        {/* Seção 3: Endereço */}
        <div className="p-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <MapPin size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">Endereço</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* CEP */}
            <div>
              <label htmlFor="cep" className="block mb-2 text-sm font-medium text-primary">
                CEP
              </label>
              <div className="relative">
                <NeuInput
                  id="cep"
                  value={formData.endereco?.cep || ''}
                  onChange={handleAddressChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {validatingCep && (
                  <Loader2
                    size={16}
                    className="absolute animate-spin right-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                )}
              </div>
            </div>

            {/* Logradouro */}
            <div className="col-span-2">
              <label htmlFor="logradouro" className="block mb-2 text-sm font-medium text-primary">
                Logradouro
              </label>
              <NeuInput
                id="logradouro"
                value={formData.endereco?.logradouro || ''}
                onChange={handleAddressChange}
                placeholder="Rua, Avenida..."
              />
            </div>

            {/* Número */}
            <div>
              <label htmlFor="numero" className="block mb-2 text-sm font-medium text-primary">
                Número
              </label>
              <NeuInput
                id="numero"
                value={formData.endereco?.numero || ''}
                onChange={handleAddressChange}
                placeholder="123"
              />
            </div>

            {/* Complemento */}
            <div>
              <label htmlFor="complemento" className="block mb-2 text-sm font-medium text-primary">
                Complemento
              </label>
              <NeuInput
                id="complemento"
                value={formData.endereco?.complemento || ''}
                onChange={handleAddressChange}
                placeholder="Bloco, Sala..."
              />
            </div>

            {/* Bairro */}
            <div>
              <label htmlFor="bairro" className="block mb-2 text-sm font-medium text-primary">
                Bairro
              </label>
              <NeuInput
                id="bairro"
                value={formData.endereco?.bairro || ''}
                onChange={handleAddressChange}
                placeholder="Centro"
              />
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor="cidade" className="block mb-2 text-sm font-medium text-primary">
                Cidade
              </label>
              <NeuInput
                id="cidade"
                value={formData.endereco?.cidade || ''}
                onChange={handleAddressChange}
                placeholder="São Paulo"
              />
            </div>

            {/* UF */}
            <div>
              <label htmlFor="uf" className="block mb-2 text-sm font-medium text-primary">
                UF
              </label>
              <NeuSelect
                value={formData.endereco?.uf || ''}
                onValueChange={(val) =>
                  handleAddressChange({
                    target: { id: 'uf', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: 'AC', label: 'AC' },
                  { value: 'AL', label: 'AL' },
                  { value: 'AP', label: 'AP' },
                  { value: 'AM', label: 'AM' },
                  { value: 'BA', label: 'BA' },
                  { value: 'CE', label: 'CE' },
                  { value: 'DF', label: 'DF' },
                  { value: 'ES', label: 'ES' },
                  { value: 'GO', label: 'GO' },
                  { value: 'MA', label: 'MA' },
                  { value: 'MT', label: 'MT' },
                  { value: 'MS', label: 'MS' },
                  { value: 'MG', label: 'MG' },
                  { value: 'PA', label: 'PA' },
                  { value: 'PB', label: 'PB' },
                  { value: 'PR', label: 'PR' },
                  { value: 'PE', label: 'PE' },
                  { value: 'PI', label: 'PI' },
                  { value: 'RJ', label: 'RJ' },
                  { value: 'RN', label: 'RN' },
                  { value: 'RS', label: 'RS' },
                  { value: 'RO', label: 'RO' },
                  { value: 'RR', label: 'RR' },
                  { value: 'SC', label: 'SC' },
                  { value: 'SP', label: 'SP' },
                  { value: 'SE', label: 'SE' },
                  { value: 'TO', label: 'TO' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Seção 4: Responsável Legal */}
        <div className="p-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <User size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">Responsável Legal</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nome do Responsável */}
            <div>
              <label
                htmlFor="responsavel_nome"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Nome Completo *
              </label>
              <NeuInput
                id="responsavel_nome"
                value={formData.responsavel_nome}
                onChange={handleChange}
                placeholder="Nome do responsável"
                error={errors.responsavel_nome}
              />
              <FormFieldError error={errors.responsavel_nome} />
            </div>

            {/* CPF do Responsável */}
            <div>
              <label
                htmlFor="responsavel_cpf"
                className="block mb-2 text-sm font-medium text-primary"
              >
                CPF *
              </label>
              <NeuInput
                id="responsavel_cpf"
                value={formData.responsavel_cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={14}
                error={errors.responsavel_cpf}
              />
              <FormFieldError error={errors.responsavel_cpf} />
            </div>

            {/* Telefone do Responsável */}
            <div>
              <label
                htmlFor="responsavel_telefone"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Telefone do Responsável *
              </label>
              <NeuInput
                id="responsavel_telefone"
                value={formData.responsavel_telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                error={errors.responsavel_telefone}
              />
              <FormFieldError error={errors.responsavel_telefone} />
            </div>

            {/* Cargo */}
            <div>
              <label
                htmlFor="responsavel_cargo"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Cargo *
              </label>
              <NeuInput
                id="responsavel_cargo"
                value={formData.responsavel_cargo || ''}
                onChange={handleChange}
                placeholder="Diretor Administrativo"
                error={errors.responsavel_cargo}
              />
              <FormFieldError error={errors.responsavel_cargo} />
            </div>

            {/* Email do Responsável */}
            <div>
              <label
                htmlFor="responsavel_email"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Email do Responsável
              </label>
              <NeuInput
                id="responsavel_email"
                value={formData.responsavel_email || ''}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Seção 5: Dados Operacionais */}
        <div className="p-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <Stethoscope size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">Dados Operacionais</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Quantidade de Leitos */}
            <div>
              <label
                htmlFor="quantidade_leitos"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Quantidade de Leitos
              </label>
              <NeuInput
                id="quantidade_leitos"
                type="number"
                value={String(formData.quantidade_leitos || '')}
                onChange={handleChange}
                placeholder="0"
                min={0}
              />
            </div>

            {/* Salas Cirúrgicas */}
            <div>
              <label
                htmlFor="salas_cirurgicas"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Salas Cirúrgicas
              </label>
              <NeuInput
                id="salas_cirurgicas"
                type="number"
                value={String(formData.salas_cirurgicas || '')}
                onChange={handleChange}
                placeholder="0"
                min={0}
              />
            </div>

            {/* Atende Urgência */}
            <div className="flex items-center h-full pt-6">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.atende_urgencia}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, atende_urgencia: e.target.checked }))
                    }
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${
                      formData.atende_urgencia ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData.atende_urgencia ? 'transform translate-x-4' : ''
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-sm font-medium text-primary">
                  Atende Urgência/Emergência
                </div>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div className="mt-4">
            <label htmlFor="observacoes" className="block mb-2 text-sm font-medium text-primary">
              Observações
            </label>
            <NeuTextarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={handleChange}
              placeholder="Informações adicionais..."
              rows={4}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="neumo"
            onClick={() => navigate('/cadastros')}
            type="button"
            className="px-6 py-3 text-primary"
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 text-white bg-primary hover:bg-primary-dark"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Hospital
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
