/**
 * Formulário de Cadastro de Pessoa Jurídica
 * ICARUS v5.0 - 100% via API Receita Federal
 *
 * REGRA: Todos os dados são buscados automaticamente via CNPJ
 * Usuário não preenche manualmente - apenas complementa endereço
 */

import { Card } from "@/components/ui/card";
import { MaskedInput } from "@/components/ui/masked-input";
import { useCNPJ } from "@/services/cnpj.service";
import { useCEP } from "@/services/cep.service";
import {
  Search,
  Building2,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const CadastroPessoaJuridica = () => {
  const [cnpj, setCnpj] = useState("");
  const [complementoEndereco, setComplementoEndereco] = useState("");
  const [numeroEndereco, setNumeroEndereco] = useState("");

  const cnpjAPI = useCNPJ();
  const cepAPI = useCEP();

  const handleBuscarCNPJ = async () => {
    try {
      const dados = await cnpjAPI.buscar(cnpj);

      // Se tem CEP, busca endereço completo
      if (dados.endereco.cep) {
        await cepAPI.buscar(dados.endereco.cep);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar CNPJ:", err);
    }
  };

  const handleBuscarCEP = async (cep: string) => {
    try {
      await cepAPI.buscar(cep);
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const dadosCompletos = cnpjAPI.data;
  const enderecoCompleto = cepAPI.data || dadosCompletos?.endereco;

  return (
    <div className="min-h-screen p-6 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-[var(--text-primary)] mb-2"
            style={{ fontSize: "0.813rem", fontWeight: 700 }}
          >
            Cadastro de Pessoa Jurídica
          </h1>
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "0.813rem" }}
          >
            Busca automática via CNPJ - Receita Federal
          </p>
        </div>

        {/* Busca CNPJ */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <MaskedInput
                mask="CNPJ"
                label="CNPJ"
                value={cnpj}
                onValueChange={(value, isValid) => {
                  setCnpj(value);
                  if (isValid) {
                    // Auto-busca quando CNPJ válido
                    handleBuscarCNPJ();
                  }
                }}
                required
                disabled={cnpjAPI.loading}
              />
            </div>
            <button
              onClick={handleBuscarCNPJ}
              disabled={cnpjAPI.loading || cnpj.length !== 14}
              className={cn(
                "mt-8 px-6 py-2.5 rounded-lg font-medium transition-all",
                "bg-[var(--primary)] text-white",
                "hover:bg-[var(--primary-hover)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center gap-2",
              )}
            >
              {cnpjAPI.loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </div>

          {cnpjAPI.error && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--orx-error)]/10 border border-[var(--orx-error)] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--orx-error)]" />
              <p
                className="text-[var(--orx-error)]"
                style={{ fontSize: "0.813rem" }}
              >
                {cnpjAPI.error}
              </p>
            </div>
          )}

          {dadosCompletos && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--orx-success)]/10 border border-[var(--orx-success)] flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--orx-success)]" />
              <p
                className="text-[var(--orx-success)]"
                style={{ fontSize: "0.813rem" }}
              >
                CNPJ encontrado! Dados carregados automaticamente.
              </p>
            </div>
          )}
        </Card>

        {/* Dados da Empresa (Preenchidos automaticamente) */}
        {dadosCompletos && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-[var(--primary)]" />
                <h2
                  className="text-[var(--text-primary)]"
                  style={{ fontSize: "0.813rem", fontWeight: 600 }}
                >
                  Dados da Empresa
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Razão Social */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.razaoSocial}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Nome Fantasia */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.nomeFantasia}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Data Abertura */}
                <div>
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Data de Abertura
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.dataAbertura}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Porte */}
                <div>
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Porte
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.porte}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Natureza Jurídica */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Natureza Jurídica
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.naturezaJuridica}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Atividade Principal */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Atividade Principal
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.atividadePrincipal}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>
              </div>
            </Card>

            {/* Endereço (Via CEP) */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-[var(--primary)]" />
                <h2
                  className="text-[var(--text-primary)]"
                  style={{ fontSize: "0.813rem", fontWeight: 600 }}
                >
                  Endereço (Via CEP - Correios)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* CEP com busca */}
                <div>
                  <MaskedInput
                    mask="CEP"
                    label="CEP"
                    value={enderecoCompleto?.cep || ""}
                    onValueChange={(value, isValid) => {
                      if (isValid) {
                        handleBuscarCEP(value);
                      }
                    }}
                    disabled
                  />
                </div>

                {/* Logradouro */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={enderecoCompleto?.logradouro || ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Número - EDITÁVEL */}
                <div>
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Número <span className="text-[var(--orx-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={numeroEndereco}
                    onChange={(e) => setNumeroEndereco(e.target.value)}
                    placeholder="Ex: 123"
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                {/* Complemento - EDITÁVEL */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complementoEndereco}
                    onChange={(e) => setComplementoEndereco(e.target.value)}
                    placeholder="Ex: Sala 101"
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                {/* Bairro */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={enderecoCompleto?.bairro || ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Cidade */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={enderecoCompleto?.cidade || ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                {/* Estado */}
                <div className="md:col-span-2">
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Estado
                  </label>
                  <input
                    type="text"
                    value={enderecoCompleto?.estado || ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>
              </div>
            </Card>

            {/* Contato */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-[var(--primary)]" />
                <h2
                  className="text-[var(--text-primary)]"
                  style={{ fontSize: "0.813rem", fontWeight: 600 }}
                >
                  Contato
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={dadosCompletos.contato.telefone}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>

                <div>
                  <label
                    className="block text-[var(--text-primary)] mb-2"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={dadosCompletos.contato.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] opacity-75"
                  />
                </div>
              </div>
            </Card>

            {/* Botões */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => {
                  cnpjAPI.limpar();
                  cepAPI.limpar();
                  setCnpj("");
                  setComplementoEndereco("");
                  setNumeroEndereco("");
                }}
                className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
              >
                Cancelar
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors">
                Salvar Cadastro
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
