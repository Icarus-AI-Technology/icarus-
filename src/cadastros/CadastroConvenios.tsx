import { useState } from"react";
import { useNavigate } from"react-router-dom";
import { ArrowLeft, Save, Loader2, Shield, Phone, DollarSign, FileText, Globe } from"lucide-react";
import { toast } from"sonner";
import { FormFieldError } from"../../components/oraclusx-ds/FormFieldError";
import { CadastrosService } from"../../services/CadastrosService";
import { ValidacaoService } from"../../services/ValidacaoService";
import type { ConvenioFormData, ValidationErrors } from"../../types/cadastros";

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
    nome:"",
    cnpj:"",
    ans_registro:"",
    tipo:"plano_saude",
    telefone:"",
    whatsapp:"",
    email:"",
    site:"",
    prazo_pagamento: 30,
    taxa_administrativa: 0,
    forma_pagamento:"ted",
    dia_fechamento: 25,
    dia_pagamento: 10,
    faturamento_eletronico: false,
    portal_faturamento:"",
    login_portal:"",
    exige_autorizacao: true,
    prazo_autorizacao: 48,
    observacoes:"",
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

    // Number fields
    if (
      type ==="number" ||
      id ==="prazo_pagamento" ||
      id ==="taxa_administrativa" ||
      id ==="dia_fechamento" ||
      id ==="dia_pagamento" ||
      id ==="prazo_autorizacao"
    ) {
      const numValue = value ==="" ? undefined : parseFloat(value);
      setFormData((prev) => ({ ...prev, [id]: numValue }));
      return;
    }

    // Regular fields
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * VALIDAÇÃO CNPJ EM TEMPO REAL (OPCIONAL, MAS SE PREENCHIDO, VALIDADO)
   */
  const handleCnpjBlur = async () => {
    // Se CNPJ não foi preenchido, não precisa validar
    if (!formData.cnpj || formData.cnpj.trim() ==="") {
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
      const { valid, message, razaoSocial } = await ValidacaoService.validarCNPJ(formData.cnpj);

      if (!valid) {
        setErrors((prev) => ({ ...prev, cnpj: message }));
      } else {
        toast.success("CNPJ validado com sucesso!");

        // Preenche automaticamente a Razão Social (se disponível)
        if (razaoSocial) {
          setFormData((prev) => ({
            ...prev,
            nome: razaoSocial,
          }));
          toast.success(`Razão Social preenchida: ${razaoSocial}`);
        }
      }
    } catch (error: unknown) {
        const err = error as Error;
      setErrors((prev) => ({
        ...prev,
        cnpj: error.message ||"Erro ao validar CNPJ.",
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
      newErrors.nome ="Nome do convênio é obrigatório.";
    }

    if (!formData.email.trim()) {
      newErrors.email ="Email é obrigatório.";
    }

    // Email format
    if (formData.email && formData.email.trim() !=="") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email ="Formato de email inválido.";
      }
    }

    // Registro ANS format (opcional, mas se preenchido, deve seguir padrão)
    if (formData.ans_registro && formData.ans_registro.trim() !=="") {
      const ansRegex = /^\d{6}$/; // 6 dígitos
      if (!ansRegex.test(formData.ans_registro)) {
        newErrors.ans_registro ="Registro ANS deve conter 6 dígitos.";
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
      const novoConvenio = await cadastrosService.createConvenio(formData);

      toast.success(`Convênio ${novoConvenio.nome} cadastrado com sucesso!`);
      navigate("/cadastros");
    } catch (error: unknown) {
        const err = error as Error;
      toast.error(error.message ||"Erro ao cadastrar convênio.");
      console.error("Erro ao cadastrar convênio:", err);
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
              Cadastro de Convênios
            </h1>
            <p
              style={{
                fontSize: '0.813rem',
                color:"var(--orx-text-secondary)",
                marginTop:"0.25rem",
              }}
            >
              Preencha os dados do convênio. Campos com (*) são obrigatórios.
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* 1. DADOS INSTITUCIONAIS */}
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
              1. Dados Institucionais
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Nome */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="nome"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Nome do Convênio *
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: Unimed São Paulo"
              />
              <FormFieldError error={errors.nome} />
            </div>

            {/* CNPJ */}
            <div>
              <label
                htmlFor="cnpj"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                CNPJ (Opcional)
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type="text"
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  onBlur={handleCnpjBlur}
                  className="neumorphic-input"
                  style={{
                    width:"100%",
                    padding:"0.75rem",
                    borderRadius:"0.5rem",
                    fontSize: '0.813rem',
                    color:"var(--orx-text-primary)",
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {validatingCnpj && (
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
              <FormFieldError error={errors.cnpj} />
            </div>

            {/* Registro ANS */}
            <div>
              <label
                htmlFor="ans_registro"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Registro ANS
              </label>
              <input
                type="text"
                id="ans_registro"
                value={formData.ans_registro}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 123456 (6 dígitos)"
                maxLength={6}
              />
              <FormFieldError error={errors.ans_registro} />
            </div>

            {/* Tipo */}
            <div>
              <label
                htmlFor="tipo"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Tipo *
              </label>
              <select
                id="tipo"
                value={formData.tipo}
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
                <option value="plano_saude">Plano de Saúde</option>
                <option value="seguros">Seguros</option>
                <option value="publico">Público (SUS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. CONTATO */}
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
              <Phone size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              2. Contato
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
                Telefone
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

            {/* WhatsApp */}
            <div>
              <label
                htmlFor="whatsapp"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                value={formData.whatsapp}
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
                Email *
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
                placeholder="contato@convenio.com.br"
              />
              <FormFieldError error={errors.email} />
            </div>

            {/* Site */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                htmlFor="site"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Site
              </label>
              <input
                type="url"
                id="site"
                value={formData.site}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="https://www.convenio.com.br"
              />
            </div>
          </div>
        </div>

        {/* 3. DADOS FINANCEIROS */}
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
              <DollarSign size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              3. Dados Financeiros
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Prazo de Pagamento */}
            <div>
              <label
                htmlFor="prazo_pagamento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Prazo de Pagamento (dias)
              </label>
              <input
                type="number"
                id="prazo_pagamento"
                value={formData.prazo_pagamento ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 30"
                min="0"
              />
            </div>

            {/* Taxa Administrativa */}
            <div>
              <label
                htmlFor="taxa_administrativa"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Taxa Administrativa (%)
              </label>
              <input
                type="number"
                id="taxa_administrativa"
                value={formData.taxa_administrativa ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 15"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label
                htmlFor="forma_pagamento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Forma de Pagamento
              </label>
              <select
                id="forma_pagamento"
                value={formData.forma_pagamento}
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
                <option value="ted">TED</option>
                <option value="boleto">Boleto</option>
                <option value="pix">PIX</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            {/* Dia de Fechamento */}
            <div>
              <label
                htmlFor="dia_fechamento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Dia de Fechamento
              </label>
              <input
                type="number"
                id="dia_fechamento"
                value={formData.dia_fechamento ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 25"
                min="1"
                max="31"
              />
            </div>

            {/* Dia de Pagamento */}
            <div>
              <label
                htmlFor="dia_pagamento"
                style={{
                  display:"block",
                  fontSize: '0.813rem',
                  fontWeight:"var(--orx-font-weight-medium)",
                  color:"var(--orx-text-primary)",
                  marginBottom:"0.5rem",
                }}
              >
                Dia de Pagamento
              </label>
              <input
                type="number"
                id="dia_pagamento"
                value={formData.dia_pagamento ||""}
                onChange={handleChange}
                className="neumorphic-input"
                style={{
                  width:"100%",
                  padding:"0.75rem",
                  borderRadius:"0.5rem",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
                placeholder="Ex: 10"
                min="1"
                max="31"
              />
            </div>
          </div>
        </div>

        {/* 4. FATURAMENTO ELETRÔNICO */}
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
              <Globe size={20} style={{ color:"white" }} />
            </div>
            <h2
              style={{
                fontSize: '0.813rem',
                fontWeight:"var(--orx-font-weight-semibold)",
                color:"var(--orx-text-primary)",
              }}
            >
              4. Faturamento Eletrônico
            </h2>
          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:"1rem",
            }}
          >
            {/* Possui Faturamento Eletrônico */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"0.5rem",
                  cursor:"pointer",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <input
                  type="checkbox"
                  id="faturamento_eletronico"
                  checked={formData.faturamento_eletronico}
                  onChange={handleChange}
                  style={{
                    width:"20px",
                    height:"20px",
                    cursor:"pointer",
                  }}
                />
                <span style={{ fontSize: '0.813rem' }}>Possui Faturamento Eletrônico</span>
              </label>
            </div>

            {/* Portal de Faturamento (condicional) */}
            {formData.faturamento_eletronico && (
              <>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label
                    htmlFor="portal_faturamento"
                    style={{
                      display:"block",
                      fontSize: '0.813rem',
                      fontWeight:"var(--orx-font-weight-medium)",
                      color:"var(--orx-text-primary)",
                      marginBottom:"0.5rem",
                    }}
                  >
                    URL do Portal de Faturamento
                  </label>
                  <input
                    type="url"
                    id="portal_faturamento"
                    value={formData.portal_faturamento}
                    onChange={handleChange}
                    className="neumorphic-input"
                    style={{
                      width:"100%",
                      padding:"0.75rem",
                      borderRadius:"0.5rem",
                      fontSize: '0.813rem',
                      color:"var(--orx-text-primary)",
                    }}
                    placeholder="https://faturamento.convenio.com.br"
                  />
                </div>

                <div style={{ gridColumn:"1 / -1" }}>
                  <label
                    htmlFor="login_portal"
                    style={{
                      display:"block",
                      fontSize: '0.813rem',
                      fontWeight:"var(--orx-font-weight-medium)",
                      color:"var(--orx-text-primary)",
                      marginBottom:"0.5rem",
                    }}
                  >
                    Login / Usuário do Portal
                  </label>
                  <input
                    type="text"
                    id="login_portal"
                    value={formData.login_portal}
                    onChange={handleChange}
                    className="neumorphic-input"
                    style={{
                      width:"100%",
                      padding:"0.75rem",
                      borderRadius:"0.5rem",
                      fontSize: '0.813rem',
                      color:"var(--orx-text-primary)",
                    }}
                    placeholder="Ex: usuario_hospital"
                  />
                </div>
              </>
            )}

            {/* Exige Autorização Prévia */}
            <div style={{ gridColumn:"1 / -1" }}>
              <label
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"0.5rem",
                  cursor:"pointer",
                  fontSize: '0.813rem',
                  color:"var(--orx-text-primary)",
                }}
              >
                <input
                  type="checkbox"
                  id="exige_autorizacao"
                  checked={formData.exige_autorizacao}
                  onChange={handleChange}
                  style={{
                    width:"20px",
                    height:"20px",
                    cursor:"pointer",
                  }}
                />
                <span>Exige Autorização Prévia para Procedimentos</span>
              </label>
            </div>

            {/* Prazo de Autorização (condicional) */}
            {formData.exige_autorizacao && (
              <div>
                <label
                  htmlFor="prazo_autorizacao"
                  style={{
                    display:"block",
                    fontSize: '0.813rem',
                    fontWeight:"var(--orx-font-weight-medium)",
                    color:"var(--orx-text-primary)",
                    marginBottom:"0.5rem",
                  }}
                >
                  Prazo de Autorização (horas)
                </label>
                <input
                  type="number"
                  id="prazo_autorizacao"
                  value={formData.prazo_autorizacao ||""}
                  onChange={handleChange}
                  className="neumorphic-input"
                  style={{
                    width:"100%",
                    padding:"0.75rem",
                    borderRadius:"0.5rem",
                    fontSize: '0.813rem',
                    color:"var(--orx-text-primary)",
                  }}
                  placeholder="Ex: 48"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* 5. OBSERVAÇÕES */}
        <div
          className="neumorphic-card"
          style={{
            padding:"1.5rem",
            marginBottom:"2rem",
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
              5. Observações
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
              placeholder="Informações adicionais relevantes sobre o convênio"
            />
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
                Cadastrar Convênio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

