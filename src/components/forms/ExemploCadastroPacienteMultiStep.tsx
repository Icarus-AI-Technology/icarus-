/**
 * EXEMPLO: Cadastro de Paciente Multi-Step
 * Demonstração completa do sistema de formulários avançados
 * 100% Neumorphism 3D Premium + Lucide React SVG + OraclusX DS
 */

import { CompleteMultiStepForm } from '../MultiStepForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useValidacaoCep } from '@/hooks/useValidacao';
import { useValidacaoCPF } from '@/hooks/useValidacao';

// ============================================
// STEP 1: Dados Pessoais
// ============================================

function Step1DadosPessoais() {
  const [cpf, setCpf] = useState('');
  const { data, loading, error, validate } = useValidacaoCPF();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            placeholder="Digite o nome completo"
            required
          />
        </div>
        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            onBlur={() => validate(cpf)}
          />
          {error && <p className="text-destructive mt-1" style={{ fontSize: '0.813rem' }}>{error}</p>}
          {data && <p className="text-success mt-1" style={{ fontSize: '0.813rem' }}>✓ CPF válido</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
          <Input
            id="dataNascimento"
            type="date"
            required
          />
        </div>
        <div>
          <Label htmlFor="sexo">Sexo *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Feminino</SelectItem>
              <SelectItem value="O">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="estadoCivil">Estado Civil</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
              <SelectItem value="casado">Casado(a)</SelectItem>
              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
          />
        </div>
        <div>
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            placeholder="(00) 00000-0000"
            required
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 2: Endereço
// ============================================

function Step2Endereco() {
  const [cep, setCep] = useState('');
  const { data: cepData, loading, error, validate } = useValidacaoCep();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cep">CEP *</Label>
          <Input
            id="cep"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={() => validate(cep)}
          />
          {loading && <p className="mt-1" style={{ fontSize: '0.813rem' }}>Buscando...</p>}
          {error && <p className="text-destructive mt-1" style={{ fontSize: '0.813rem' }}>{error}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="logradouro">Logradouro *</Label>
          <Input
            id="logradouro"
            placeholder="Rua, Avenida..."
            value={cepData?.logradouro || ''}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            placeholder="123"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            placeholder="Apto, Sala..."
          />
        </div>
        <div>
          <Label htmlFor="uf">UF *</Label>
          <Input
            id="uf"
            value={cepData?.uf || ''}
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            value={cepData?.bairro || ''}
            required
          />
        </div>
        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            value={cepData?.localidade || ''}
            required
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 3: Informações Médicas
// ============================================

function Step3InfoMedicas() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            placeholder="70"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="altura">Altura (cm)</Label>
          <Input
            id="altura"
            type="number"
            placeholder="170"
          />
        </div>
        <div>
          <Label htmlFor="convenio">Convênio</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sus">SUS</SelectItem>
              <SelectItem value="unimed">Unimed</SelectItem>
              <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
              <SelectItem value="sulamerica">Sul América</SelectItem>
              <SelectItem value="particular">Particular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="alergias">Alergias</Label>
        <Textarea
          id="alergias"
          placeholder="Liste alergias conhecidas..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
        <Textarea
          id="medicamentos"
          placeholder="Liste medicamentos de uso contínuo..."
          rows={3}
        />
      </div>
    </div>
  );
}

// ============================================
// STEP 4: Observações
// ============================================

function Step4Observacoes() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="observacoes">Observações Gerais</Label>
        <Textarea
          id="observacoes"
          placeholder="Informações adicionais relevantes..."
          rows={6}
        />
      </div>

      <div className="neuro-inset rounded-xl p-4">
        <h4
          className="text-[var(--text-primary)] mb-2"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.813rem',
            fontWeight: 600,
          }}
        >
          ✓ Revisão do Cadastro
        </h4>
        <p
          className="text-[var(--text-secondary)]"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.813rem',
          }}
        >
          Revise todas as informações antes de concluir. Após a conclusão, o paciente será cadastrado no sistema e receberá um e-mail de confirmação.
        </p>
      </div>
    </div>
  );
}

// ============================================
// FORMULÁRIO COMPLETO
// ============================================

export default function ExemploCadastroPacienteMultiStep() {
  const steps = [
    {
      id: 'dados-pessoais',
      title: 'Dados Pessoais',
      description: 'Informações básicas do paciente',
      component: <Step1DadosPessoais />,
      validate: () => {
        // Validação customizada
        const nome = document.getElementById('nome') as HTMLInputElement;
        return nome?.value.length > 3;
      },
    },
    {
      id: 'endereco',
      title: 'Endereço',
      description: 'Localização e contato',
      component: <Step2Endereco />,
    },
    {
      id: 'info-medicas',
      title: 'Informações Médicas',
      description: 'Histórico e condições de saúde',
      component: <Step3InfoMedicas />,
    },
    {
      id: 'observacoes',
      title: 'Observações',
      description: 'Revisão e conclusão',
      component: <Step4Observacoes />,
    },
  ];

  const handleComplete = () => {
    console.log('Cadastro concluído!');
    // Enviar dados para o backend
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-[var(--text-primary)] mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.813rem',
              fontWeight: 700,
            }}
          >
            Cadastro de Paciente
          </h1>
          <p
            className="text-[var(--text-secondary)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
            }}
          >
            Preencha as informações do paciente em 4 etapas
          </p>
        </div>

        <CompleteMultiStepForm steps={steps} onComplete={handleComplete} />
      </div>
    </div>
  );
}

