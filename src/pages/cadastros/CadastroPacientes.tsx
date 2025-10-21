import { useState } from"react";
import { useNavigate } from"react-router-dom";
import { ArrowLeft, Save, Loader2, UserCheck, MapPin, Shield, Heart, FileText, AlertCircle } from"lucide-react";
import { toast } from"sonner";
import { FormFieldError } from"../../components/oraclusx-ds/FormFieldError";
import { CadastrosService } from"../../services/CadastrosService";
import { ValidacaoService } from"../../services/ValidacaoService";
import type { PacienteFormData, ValidationErrors } from"../../types/cadastros";

/**
 * FORMULÁRIO DE CADASTRO DE PACIENTES
 * 
 * DOCUMENTAÇÃO: MODULOS_CADASTROS_COMPRAS_PARTE2.md → Seção"Pacientes"
 * 
 * ESTRUTURA:
 * 1. Dados Pessoais (Nome, CPF, RG, Data Nascimento, Sexo, Estado Civil)
 * 2. Filiação (Nome da Mãe *, Nome do Pai)
 * 3. Contato (Telefone, Celular, Email)
 * 4. Endereço (CEP com busca automática, Logradouro, etc)
 * 5. Dados do Convênio (Convênio *, Carteirinha *, Validade, Plano, Tipo)
 * 6. Informações de Saúde (Grupo Sanguíneo, Alergias, Medicamentos, Observações)
 * 7. Consentimento LGPD (Obrigatório)
 * 
 * VALIDAÇÕES:
 * - CPF: Opcional, mas se preenchido, validado (Receita Federal)
 * - Nome da Mãe: Obrigatório (lei brasileira)
 * - Carteirinha: Obrigatória
 * - Email: Formato válido
 * - CEP: Busca automática ViaCEP
 * - Consentimento LGPD: Obrigatório (checkbox)
 * 
 * INTEGRAÇÕES:
 * - Receita Federal (CPF se preenchido)
 * - ViaCEP (Endereço)
 * - CadastrosService (CRUD)
 * - ValidacaoService (Validações)
 * 
 * DESIGN:
 * - OraclusX DS 100% (CSS Variables, Neumorphism, Hard Gates)
 * - Dark Mode Ready
 * - Responsivo (1/2/3/4 colunas)
 * - Loading states (CPF, CEP)
 * - Inline validation errors
 */

export default function CadastroPacientes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingCpf, setValidatingCpf] = useState(false);
  const [validatingCep, setValidatingCep] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<PacienteFormData>({
    nome_completo:"",
    cpf:"",
    rg:"",
    data_nascimento:"",
    sexo:"M",
    estado_civil:"solteiro",
    nome_mae:"",
    nome_pai:"",
    telefone:"",
    celular:"",
    email:"",
    endereco: {
      cep:"",
      logradouro:"",
      numero:"",
      complemento:"",
      bairro:"",
      cidade:"",
      uf:"",
    },
    convenio_id:"",
    numero_carteirinha:"",
    validade_plano:"",
    plano:"",
    tipo_atendimento:"completo",
    grupo_sanguineo:"O+",
    alergias:"",
    medicamentos_uso:"",
    observacoes_saude:"",
    observacoes:"",
    consentimento_lgpd: false,
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
    if (type ==="checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [id]: checked }));
      return;
    }

    // Nested address fields
    if (
      id.startsWith("cep") ||
      id.startsWith("logradouro") ||
      id.startsWith("numero") ||
      id.startsWith("complemento") ||
      id.startsWith("bairro") ||
      id.startsWith("cidade") ||
      id.startsWith("uf")
    ) {
      const addressKey = id.split("_")[0] as keyof typeof formData.endereco;
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco!,
          [addressKey]: value,
        },
      }));
      return;
    }

    // Regular fields
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * VALIDAÇÃO CPF EM TEMPO REAL (OPCIONAL, MAS SE PREENCHIDO, VALIDADO)
   */
  const handleCpfBlur = async () => {
    // Se CPF não foi preenchido, não precisa validar
    if (!formData.cpf || formData.cpf.trim() ==="") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
      return;
    }

    setValidatingCpf(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cpf;
      return newErrors;
    });

    try {
      const { valid, message } = await ValidacaoService.validarCPF(formData.cpf);

      if (!valid) {
        setErrors((prev) => ({ ...prev, cpf: message }));
      } else {
        toast.success("CPF validado com sucesso!");
      }
    } catch (error: unknown) {
      setErrors((prev) => ({
        ...prev,
        cpf: error.message ||"Erro ao validar CPF.",
      }));
    } finally {
      setValidatingCpf(false);
    }
  };

  /**
   * BUSCA CEP (VIACEP)
   */
  const handleCepBlur = async () => {
    if (!formData.endereco?.cep || formData.endereco.cep.trim() ==="") return;

    setValidatingCep(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors["cep"];
      return newErrors;
    });

    try {
      const { valid, message, endereco: enderecoData } = await ValidacaoService.validarCEP(
        formData.endereco.cep
      );

      if (!valid || !enderecoData) {
        setErrors((prev) => ({ ...prev, cep: message }));
        return;
      }

      // Preenche automaticamente os campos
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco!,
          logradouro: enderecoData.logradouro ||"",
          bairro: enderecoData.bairro ||"",
          cidade: enderecoData.localidade ||"",
          uf: enderecoData.uf ||"",
        },
      }));

      toast.success("CEP encontrado e endereço preenchido!");
    } catch (error: unknown) {
      setErrors((prev) => ({
        ...prev,
        cep: error.message ||"Erro ao buscar CEP.",
      }));
    } finally {
      setValidatingCep(false);
    }
  };

  /**
   * VALIDAÇÃO ANTES DE SUBMETER
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Campos obrigatórios
    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo ="Nome completo é obrigatório.";
    }

    if (!formData.nome_mae.trim()) {
      newErrors.nome_mae ="Nome da mãe é obrigatório (lei brasileira).";
    }

    if (!formData.convenio_id.trim()) {
      newErrors.convenio_id ="Convênio é obrigatório.";
    }

    if (!formData.numero_carteirinha.trim()) {
      newErrors.numero_carteirinha ="Número da carteirinha é obrigatório.";
    }

    if (!formData.data_nascimento.trim()) {
      newErrors.data_nascimento ="Data de nascimento é obrigatória.";
    }

    // LGPD Consent
    if (!formData.consentimento_lgpd) {
      newErrors.consentimento_lgpd ="Consentimento LGPD é obrigatório.";
    }

    // Email format (se preenchido)
    if (formData.email && formData.email.trim() !=="") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email ="Formato de email inválido.";
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
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const cadastrosService = new CadastrosService();
      const novoPaciente = await cadastrosService.createPaciente(formData);

      toast.success(`Paciente ${novoPaciente.nome_completo} cadastrado com sucesso!`);
      navigate("/cadastros");
    } catch (error: unknown) {
      toast.error(error.message ||"Erro ao cadastrar paciente.");
      console.error("Erro ao cadastrar paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CANCEL
   */
  const handleCancel = () => {
    if (
      window.confirm("Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos."
      )
    ) {
      navigate("/cadastros");
    }
  };

  return (
    <div style={{ padding:"2rem 0" }}>
      {/* HEADER */}
      <div
        style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          marginBottom:"2rem",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <button
            onClick={() => navigate("/cadastros")}
            className="neumorphic-button"
            style={{
              padding:"0.75rem",
              borderRadius:"0.5rem",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
            }}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-bold)",
                color:"var(--orx-text-primary)",
              }}
            >
              Cadastro de Pacientes
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                marginTop:"0.25rem",
              }}
            >
              Preencha os dados do paciente. Campos com (*) são obrigatórios.
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* 1. DADOS PESSOAIS */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <UserCheck size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              1. Dados Pessoais
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Nome Completo */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="nome_completo"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: Maria Silva Santos"
              />
              <FormFieldError error={errors.nome_completo} />
            </div>

            {/* CPF */}
            <div>
              <label
                htmlFor="cpf"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                CPF (Opcional)
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type="text"
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  onBlur={handleCpfBlur}
                  className="neumorphic-input"
                  style={{
                    width:"100%",
                    padding:"0.75rem",
                    borderRadius:"0.5rem",
                    fontSize: '0.813rem',
                    color:"var(--orx-text-primary)",
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {validatingCpf && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                    style={{
                      position:"absolute",
                      right:"0.75rem",
                      top:"50%",
                      transform:"translateY(-50%)",
                      color:"var(--orx-primary)",
                    }}
                  />
                )}
              </div>
              <FormFieldError error={errors.cpf} />
            </div>

            {/* RG */}
            <div>
              <label
                htmlFor="rg"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                RG
              </label>
              <input
                type="text"
                id="rg"
                value={formData.rg}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 12.345.678-9"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label
                htmlFor="data_nascimento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Data de Nascimento *
              </label>
              <input
                type="date"
                id="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              />
              <FormFieldError error={errors.data_nascimento} />
            </div>

            {/* Sexo */}
            <div>
              <label
                htmlFor="sexo"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Sexo *
              </label>
              <select
                id="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Estado Civil */}
            <div>
              <label
                htmlFor="estado_civil"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Estado Civil
              </label>
              <select
                id="estado_civil"
                value={formData.estado_civil}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao_estavel">União Estável</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. FILIAÇÃO */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <UserCheck size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              2. Filiação
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Nome da Mãe */}
            <div>
              <label
                htmlFor="nome_mae"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Nome da Mãe *
              </label>
              <input
                type="text"
                id="nome_mae"
                value={formData.nome_mae}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: Ana Silva Santos"
              />
              <FormFieldError error={errors.nome_mae} />
            </div>

            {/* Nome do Pai */}
            <div>
              <label
                htmlFor="nome_pai"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Nome do Pai
              </label>
              <input
                type="text"
                id="nome_pai"
                value={formData.nome_pai}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: João Silva Santos"
              />
            </div>
          </div>
        </div>

        {/* 3. CONTATO */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <UserCheck size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              3. Contato
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Telefone */}
            <div>
              <label
                htmlFor="telefone"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Telefone Fixo
              </label>
              <input
                type="tel"
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="(11) 3456-7890"
              />
            </div>

            {/* Celular */}
            <div>
              <label
                htmlFor="celular"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Celular (WhatsApp)
              </label>
              <input
                type="tel"
                id="celular"
                value={formData.celular}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="(11) 98765-4321"
              />
            </div>

            {/* Email */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="email"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="maria.santos@example.com"
              />
              <FormFieldError error={errors.email} />
            </div>
          </div>
        </div>

        {/* 4. ENDEREÇO */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <MapPin size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              4. Endereço
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* CEP */}
            <div>
              <label
                htmlFor="cep"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                CEP
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type="text"
                  id="cep"
                  value={formData.endereco?.cep ||""}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  className="neumorphic-input"
                  style={{
                    width:"100%",
                    padding:"0.75rem",
                    borderRadius:"0.5rem",
                    fontSize: '0.813rem',
                    color:"var(--orx-text-primary)",
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {validatingCep && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                    style={{
                      position:"absolute",
                      right:"0.75rem",
                      top:"50%",
                      transform:"translateY(-50%)",
                      color:"var(--orx-primary)",
                    }}
                  />
                )}
              </div>
              <FormFieldError error={errors.cep} />
            </div>

            {/* Logradouro */}
            <div style={{ gridColumn:"span 2" }}>
              <label
                htmlFor="logradouro"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Logradouro
              </label>
              <input
                type="text"
                id="logradouro"
                value={formData.endereco?.logradouro ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            {/* Número */}
            <div>
              <label
                htmlFor="numero"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Número
              </label>
              <input
                type="text"
                id="numero"
                value={formData.endereco?.numero ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="123"
              />
            </div>

            {/* Complemento */}
            <div>
              <label
                htmlFor="complemento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Complemento
              </label>
              <input
                type="text"
                id="complemento"
                value={formData.endereco?.complemento ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Apto, Bloco, etc."
              />
            </div>

            {/* Bairro */}
            <div>
              <label
                htmlFor="bairro"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                value={formData.endereco?.bairro ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: Centro"
              />
            </div>

            {/* Cidade */}
            <div>
              <label
                htmlFor="cidade"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                value={formData.endereco?.cidade ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: São Paulo"
              />
            </div>

            {/* UF */}
            <div>
              <label
                htmlFor="uf"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                UF
              </label>
              <select
                id="uf"
                value={formData.endereco?.uf ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="">Selecione</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. DADOS DO CONVÊNIO */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <Shield size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              5. Dados do Convênio
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Convênio (Mockado - será SELECT de API) */}
            <div>
              <label
                htmlFor="convenio_id"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Convênio *
              </label>
              <select
                id="convenio_id"
                value={formData.convenio_id}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="">Selecione o convênio</option>
                <option value="1">Unimed</option>
                <option value="2">Bradesco Saúde</option>
                <option value="3">SulAmérica</option>
                <option value="4">Amil</option>
                <option value="5">NotreDame Intermédica</option>
                <option value="6">Particular</option>
              </select>
              <FormFieldError error={errors.convenio_id} />
            </div>

            {/* Número da Carteirinha */}
            <div>
              <label
                htmlFor="numero_carteirinha"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Número da Carteirinha *
              </label>
              <input
                type="text"
                id="numero_carteirinha"
                value={formData.numero_carteirinha}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 123456789012345"
              />
              <FormFieldError error={errors.numero_carteirinha} />
            </div>

            {/* Validade do Plano */}
            <div>
              <label
                htmlFor="validade_plano"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Validade do Plano
              </label>
              <input
                type="date"
                id="validade_plano"
                value={formData.validade_plano}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              />
            </div>

            {/* Nome do Plano */}
            <div>
              <label
                htmlFor="plano"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Nome do Plano
              </label>
              <input
                type="text"
                id="plano"
                value={formData.plano}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: Premium, Executivo"
              />
            </div>

            {/* Tipo de Atendimento */}
            <div>
              <label
                htmlFor="tipo_atendimento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Tipo de Atendimento
              </label>
              <select
                id="tipo_atendimento"
                value={formData.tipo_atendimento}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="ambulatorial">Ambulatorial</option>
                <option value="hospitalar">Hospitalar</option>
                <option value="completo">Completo</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. INFORMAÇÕES DE SAÚDE */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <Heart size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              6. Informações de Saúde
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Grupo Sanguíneo */}
            <div>
              <label
                htmlFor="grupo_sanguineo"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Grupo Sanguíneo
              </label>
              <select
                id="grupo_sanguineo"
                value={formData.grupo_sanguineo}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Alergias */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="alergias"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Alergias
              </label>
              <textarea
                id="alergias"
                value={formData.alergias}
                onChange={handleChange}
                className="neumorphic-input"
                rows={3}
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                  resize:"vertical",
                }}
                placeholder="Descreva alergias conhecidas (medicamentos, alimentos, etc.)"
              />
            </div>

            {/* Medicamentos em Uso */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="medicamentos_uso"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Medicamentos em Uso
              </label>
              <textarea
                id="medicamentos_uso"
                value={formData.medicamentos_uso}
                onChange={handleChange}
                className="neumorphic-input"
                rows={3}
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                  resize:"vertical",
                }}
                placeholder="Liste medicamentos de uso contínuo"
              />
            </div>

            {/* Observações de Saúde */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="observacoes_saude"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Observações de Saúde
              </label>
              <textarea
                id="observacoes_saude"
                value={formData.observacoes_saude}
                onChange={handleChange}
                className="neumorphic-input"
                rows={3}
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                  resize:"vertical",
                }}
                placeholder="Histórico médico relevante, cirurgias prévias, etc."
              />
            </div>
          </div>
        </div>

        {/* 7. OBSERVAÇÕES GERAIS */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"1.5rem",
            borderRadius:"1rem",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-primary)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              <FileText size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              7. Observações Gerais
            </h2>
          </div>

          <div>
            <label
              htmlFor="observacoes"
              style={{
                display:"block",
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-medium)",
                color:"var(--orx-text-primary)",
                marginBottom:"0.5rem",
              }}
            >
              Observações
            </label>
            <textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="neumorphic-input"
              rows={4}
              style={{
                width:"100%",
                padding:"0.75rem",
                borderRadius:"0.5rem",
                fontSize: '0.813rem',
                color:"var(--orx-text-primary)",
                resize:"vertical",
              }}
              placeholder="Informações adicionais relevantes sobre o paciente"
            />
          </div>
        </div>

        {/* 8. CONSENTIMENTO LGPD */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"2rem",
            borderRadius:"1rem",
            background:"rgba(245, 158, 11, 0.05)",
          }}
        >
          <div style={{ display:"flex", alignItems:"flex-start", gap:"0.75rem" }}>
            <div
              style={{
                width:"40px",
                height:"40px",
                borderRadius:"0.5rem",
                background:"var(--orx-warning)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={20} style={{ color:"white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-semibold)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.75rem",
                }}
              >
                Consentimento LGPD *
              </h2>
              <p
                style={{
                  fontSize: '0.813rem',
                  color:"var(--orx-text-secondary)",
                  lineHeight:"1.6",
                  marginBottom:"1rem",
                }}
              >
                De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), é necessário o
                consentimento do paciente para coleta e tratamento de seus dados pessoais e dados sensíveis
                de saúde.
              </p>

              <label
                style={{
                  display:"flex",
                  alignItems:"flex-start",
                  gap:"0.75rem",
                  cursor:"pointer",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <input
                  type="checkbox"
                  id="consentimento_lgpd"
                  checked={formData.consentimento_lgpd}
                  onChange={handleChange}
                  style={{
                    width:"20px",
                    height:"20px",
                    marginTop:"2px",
                    flexShrink: 0,
                    cursor:"pointer",
                  }}
                />
                <span>
                  Autorizo o uso dos meus dados pessoais e de saúde para fins de atendimento médico,
                  faturamento, auditoria e demais atividades relacionadas à prestação de serviços de saúde,
                  conforme descrito na{""}
                  <a
                    href="/politica-privacidade"
                    style={{
                      color:"var(--orx-primary)",
                      textDecoration:"underline",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>
              <FormFieldError error={errors.consentimento_lgpd} />
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div
          style={{
            display:"flex",
            justifyContent:"flex-end",
            gap:"1rem",
            paddingTop:"1rem",
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            className="neumorphic-button"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              padding:"0.75rem 2rem",
              borderRadius:"0.5rem",
              fontSize: '0.813rem',
              fontWeight:"var(--orx-font-weight-medium)",
              color:"var(--orx-text-primary)",
            }}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="neumorphic-button"
            style={{
              padding:"0.75rem 2rem",
              borderRadius:"0.5rem",
              fontSize: '0.813rem',
              fontWeight:"var(--orx-font-weight-medium)",
              background:"var(--orx-primary)",
              color:"white",
              display:"flex",
              alignItems:"center",
              gap:"0.5rem",
            }}
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
                Cadastrar Paciente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

