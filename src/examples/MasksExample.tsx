/**
 * Exemplo de Uso - Máscaras Automáticas
 * ICARUS v5.0
 */

import { MaskedInput } from '@/components/ui/masked-input';
import { Card } from '@/components/ui/card';

export const MasksExamplePage = () => {
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [data, setData] = useState('');
  const [moeda, setMoeda] = useState('');
  const [porcentagem, setPorcentagem] = useState('');
  const [placa, setPlaca] = useState('');

  const [validationStates, setValidationStates] = useState<Record<string, boolean>>({});

  const handleValueChange = (field: string) => (value: string, isValid: boolean) => {
    setValidationStates((prev) => ({ ...prev, [field]: isValid }));
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--background)]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-[var(--text-primary)] mb-2"
            style={{ fontSize: '0.813rem', fontWeight: 700 }}
          >
            Máscaras Automáticas
          </h1>
          <p className="text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
            Sistema completo de formatação e validação de inputs
          </p>
        </div>

        {/* Máscaras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPF */}
          <Card className="p-6">
            <MaskedInput
              mask="CPF"
              label="CPF"
              value={cpf}
              onValueChange={handleValueChange('cpf')}
              helperText="Validação automática com dígitos verificadores"
              required
            />
            {validationStates.cpf && (
              <div className="mt-2 text-[var(--orx-success)]" style={{ fontSize: '0.813rem' }}>
                ✓ CPF válido
              </div>
            )}
          </Card>

          {/* CNPJ */}
          <Card className="p-6">
            <MaskedInput
              mask="CNPJ"
              label="CNPJ"
              value={cnpj}
              onValueChange={handleValueChange('cnpj')}
              helperText="Validação automática com dígitos verificadores"
              required
            />
          </Card>

          {/* Telefone */}
          <Card className="p-6">
            <MaskedInput
              mask="Telefone"
              label="Telefone"
              value={telefone}
              onValueChange={handleValueChange('telefone')}
              helperText="Aceita fixo (10 dígitos) e celular (11 dígitos)"
            />
          </Card>

          {/* CEP */}
          <Card className="p-6">
            <MaskedInput
              mask="CEP"
              label="CEP"
              value={cep}
              onValueChange={handleValueChange('cep')}
              helperText="Formato: 00000-000"
            />
          </Card>

          {/* Data */}
          <Card className="p-6">
            <MaskedInput
              mask="Data"
              label="Data de Nascimento"
              value={data}
              onValueChange={handleValueChange('data')}
              helperText="Validação de data real (DD/MM/YYYY)"
              required
            />
          </Card>

          {/* Moeda */}
          <Card className="p-6">
            <MaskedInput
              mask="Moeda"
              label="Valor"
              value={moeda}
              onValueChange={handleValueChange('moeda')}
              helperText="Formatação automática de moeda"
            />
          </Card>

          {/* Porcentagem */}
          <Card className="p-6">
            <MaskedInput
              mask="Porcentagem"
              label="Taxa"
              value={porcentagem}
              onValueChange={handleValueChange('porcentagem')}
              helperText="De 0,00% a 100,00%"
            />
          </Card>

          {/* Placa */}
          <Card className="p-6">
            <MaskedInput
              mask="Placa"
              label="Placa do Veículo"
              value={placa}
              onValueChange={handleValueChange('placa')}
              helperText="Formato Mercosul (AAA-0A00) ou antigo (AAA-0000)"
            />
          </Card>
        </div>

        {/* Valores */}
        <Card className="p-6">
          <h2
            className="text-[var(--text-primary)] mb-4"
            style={{ fontSize: '0.813rem', fontWeight: 600 }}
          >
            Valores Não Formatados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono" style={{ fontSize: '0.813rem' }}>
            <div>
              <strong>CPF:</strong> {cpf}
            </div>
            <div>
              <strong>CNPJ:</strong> {cnpj}
            </div>
            <div>
              <strong>Telefone:</strong> {telefone}
            </div>
            <div>
              <strong>CEP:</strong> {cep}
            </div>
            <div>
              <strong>Data:</strong> {data}
            </div>
            <div>
              <strong>Moeda:</strong> {moeda}
            </div>
            <div>
              <strong>Porcentagem:</strong> {porcentagem}
            </div>
            <div>
              <strong>Placa:</strong> {placa}
            </div>
          </div>
        </Card>

        {/* Documentação */}
        <Card className="p-6 bg-[var(--surface)]">
          <h2
            className="text-[var(--text-primary)] mb-4"
            style={{ fontSize: '0.813rem', fontWeight: 600 }}
          >
            Documentação
          </h2>
          <div className="space-y-3 text-[var(--text-secondary)]" style={{ fontSize: '0.813rem' }}>
            <div>
              <strong className="text-[var(--text-primary)]">Características:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Formatação automática em tempo real</li>
                <li>Validação integrada (CPF, CNPJ, Data)</li>
                <li>Remoção automática de caracteres não permitidos</li>
                <li>Ícones de validação (sucesso/erro)</li>
                <li>Totalmente tipado com TypeScript</li>
                <li>Neumorphic design integrado</li>
              </ul>
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Uso:</strong>
              <pre className="bg-[var(--background)] p-3 rounded mt-2 overflow-x-auto">
{`<MaskedInput
  mask="CPF"
  label="CPF"
  value={cpf}
  onValueChange={(value, isValid) => {
    setCpf(value);
    console.log('Válido?', isValid);
  }}
  required
/>`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

