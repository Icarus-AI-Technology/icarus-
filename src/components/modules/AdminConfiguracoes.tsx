/**
 * Admin Configurações (Apenas Administradores)
 * - Upload Certificado Digital (PFX)
 * - Upload de Logo (com preview light/dark)
 * - Cadastro Empresa via CNPJ (auto-preenchimento)
 * - Templates de Documentos (WYSIWYG placeholder)
 */
import React, { useMemo, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  FileUpload,
  Input,
  Textarea,
  FormField,
  FormGroup,
} from "@/components/oraclusx-ds";
import { MaskedInput } from "@/components/ui/masked-input";
import { Camera, ShieldCheck } from "lucide-react";
import DOMPurify from "dompurify";

const MAX_PFX = 10 * 1024 * 1024; // 10MB
const TEMPLATE_PREVIEW_PLACEHOLDER =
  'Ex.: Prezado {{"cliente.nome"}}, segue o documento de {{"tipo"}}...';

export const AdminConfiguracoes: React.FC = () => {
  // Certificado
  const [pfxFiles, setPfxFiles] = useState<File[]>([]);
  const [pfxValid, setPfxValid] = useState<boolean | null>(null);
  const [pfxInfo, setPfxInfo] = useState<{ validade?: string } | null>(null);
  const [pfxPassword, setPfxPassword] = useState("");
  const [pfxPasswordOk, setPfxPasswordOk] = useState<boolean | null>(null);

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Empresa (CNPJ)
  const [cnpjValid, setCnpjValid] = useState(false);
  const [empresa, setEmpresa] = useState({
    razao: "",
    fantasia: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    telefone: "",
    email: "",
    atividadePrincipal: "",
    atividadesSecundarias: "",
    situacao: "",
    abertura: "",
    capitalSocial: "",
    naturezaJuridica: "",
    ie: "",
    im: "",
    regimeTributario: "",
    responsavel: "",
  });
  const [responsavelStatus, setResponsavelStatus] = useState<
    "idle" | "corrigindo" | "padronizado" | "invalido"
  >("idle");
  const [templateHtml, setTemplateHtml] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const sanitizedTemplatePreview = useMemo(() => {
    const preview =
      templateHtml && templateHtml.trim().length > 0
        ? templateHtml
        : TEMPLATE_PREVIEW_PLACEHOLDER;
    return DOMPurify.sanitize(preview, { USE_PROFILES: { html: true } });
  }, [templateHtml]);

  const standardizeUppercase = (value: string): string => {
    return value.normalize("NFKC").replace(/\s+/g, " ").trim().toUpperCase();
  };

  const handleResponsavelChange = (value: string) => {
    const corrected = standardizeUppercase(value);
    const isPadronizado =
      corrected.length > 0 && corrected === value.toUpperCase();
    setEmpresa((prev) => ({ ...prev, responsavel: corrected }));
    setResponsavelStatus(isPadronizado ? "padronizado" : "corrigindo");
  };

  const handlePfx = (files: File[]) => {
    const valid =
      files.every((f) => f.name.toLowerCase().endsWith(".pfx")) &&
      files.every((f) => f.size <= MAX_PFX);
    setPfxFiles(files);
    setPfxValid(valid);
    // Mock de leitura e validade
    if (valid && files.length) {
      setPfxInfo({
        validade: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 180,
        ).toLocaleDateString("pt-BR"),
      });
    } else {
      setPfxInfo(null);
    }
  };

  const handleLogo = (files: File[]) => {
    const [f] = files;
    if (!f) return;
    // Validar dimensões 200x60
    const img = new Image();
    img.onload = () => {
      if (img.width !== 200 || img.height !== 60) {
        // Mantém upload, mas sinaliza recomendação
        console.warn("Logo fora das dimensões recomendadas 200x60");
      }
      setLogoUrl(URL.createObjectURL(f));
    };
    img.src = URL.createObjectURL(f);
  };

  const fetchCNPJ = async (_cnpjSemMascara: string) => {
    // Stub de integração com Receita (substituir por chamada real)
    // Preenche alguns dados fictícios
    setEmpresa((prev) => ({
      ...prev,
      razao: "ICARUS SISTEMAS LTDA",
      fantasia: "ICARUS",
      cep: "01001-000",
      endereco: "Praça da Sé",
      numero: "100",
      bairro: "Sé",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "(11) 99999-0000",
      email: "contato@icarus.com.br",
      atividadePrincipal: "Desenvolvimento de programas de computador",
      atividadesSecundarias: "Consultoria em TI; Treinamentos",
      situacao: "ATIVA",
      abertura: "01/01/2018",
      capitalSocial: "R$ 500.000,00",
      naturezaJuridica: "Sociedade Empresária Limitada",
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-heading-lg text-primary dark:text-gray-100">
            Configurações do Sistema
          </h1>
          <Badge variant="default">Admins</Badge>
        </header>

        {/* Certificado Digital */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Certificado Digital</CardTitle>
            <CardDescription>Aceita .pfx (A1/A3) até 10MB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-[400px_1fr] gap-4 items-start">
              <div className="orx-card p-4 rounded-xl">
                <div className="w-[400px] h-[200px]">
                  <FileUpload
                    onFileSelect={handlePfx}
                    accept=".pfx"
                    multiple={false}
                    maxSize={MAX_PFX}
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 items-end">
                  <FormField label="Senha do Certificado" htmlFor="pfx-pass">
                    <Input
                      id="pfx-pass"
                      type="password"
                      placeholder="Senha do .pfx"
                      value={pfxPassword}
                      onChange={(e) => setPfxPassword(e.target.value)}
                    />
                  </FormField>
                  <button
                    type="button"
                    className="orx-button-primary px-3 py-2 rounded-lg"
                    onClick={() =>
                      setPfxPasswordOk(pfxPassword.trim().length >= 4)
                    }
                    title="Validar senha"
                  >
                    Validar senha
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={pfxValid ? "text-success" : "text-warning"}
                    size={18}
                  />
                  <span className="text-body-sm text-secondary dark:text-muted">
                    Validação em tempo real
                  </span>
                </div>
                {pfxPasswordOk !== null && (
                  <div className="text-body-sm">
                    {pfxPasswordOk ? (
                      <span className="text-success">Senha válida</span>
                    ) : (
                      <span className="text-error">Senha inválida</span>
                    )}
                  </div>
                )}
                {pfxInfo?.validade && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      Válido até {pfxInfo.validade}
                    </Badge>
                  </div>
                )}
                {pfxFiles.length > 0 && (
                  <div className="text-body-xs text-secondary dark:text-muted">
                    {pfxFiles[0].name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload de Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Logo</CardTitle>
            <CardDescription>
              PNG/JPG/SVG 200x60 (transparente preferível)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="orx-card p-4 rounded-xl">
                <FileUpload
                  onFileSelect={handleLogo}
                  accept=".png,.jpg,.jpeg,.svg"
                  multiple={false}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="orx-card p-4 rounded-xl bg-white">
                  <p className="text-body-sm text-secondary mb-2">Light</p>
                  <div className="h-[60px] flex items-center justify-center bg-gray-50 rounded">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="logo"
                        className="h-[40px] object-contain"
                      />
                    ) : (
                      <Camera className="text-muted" />
                    )}
                  </div>
                </div>
                <div className="orx-card p-4 rounded-xl bg-[#0b0f19]">
                  <p className="text-body-sm mb-2 text-white/70">Dark</p>
                  <div className="h-[60px] flex items-center justify-center bg-[#0b0f19] rounded">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="logo"
                        className="h-[40px] object-contain invert"
                      />
                    ) : (
                      <Camera className="text-muted" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cadastro Empresa via CNPJ */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Empresa via CNPJ</CardTitle>
            <CardDescription>
              Auto-preenchimento via Receita Federal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-[280px_auto] gap-4 items-end">
                <MaskedInput
                  mask="CNPJ"
                  label="CNPJ"
                  required
                  showValidation
                  onValueChange={(unmasked, valid) => {
                    setCnpjValid(valid);
                    if (valid) fetchCNPJ(unmasked);
                  }}
                />
                <div className="text-body-sm text-secondary dark:text-muted">
                  {cnpjValid
                    ? "CNPJ válido. Buscando dados..."
                    : "Preencha um CNPJ válido"}
                </div>
              </div>

              <FormGroup columns={2}>
                <FormField label="Razão Social">
                  <Input
                    value={empresa.razao}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Nome Fantasia">
                  <Input
                    value={empresa.fantasia}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="CEP">
                  <Input
                    value={empresa.cep}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Endereço">
                  <Input
                    value={empresa.endereco}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Número">
                  <Input
                    value={empresa.numero}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Bairro">
                  <Input
                    value={empresa.bairro}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Cidade">
                  <Input
                    value={empresa.cidade}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Estado">
                  <Input
                    value={empresa.estado}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Telefone">
                  <Input
                    value={empresa.telefone}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Email">
                  <Input
                    value={empresa.email}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Atividade Principal">
                  <Textarea
                    value={empresa.atividadePrincipal}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Atividades Secundárias">
                  <Textarea
                    value={empresa.atividadesSecundarias}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Situação Cadastral">
                  <Input
                    value={empresa.situacao}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Data de Abertura">
                  <Input
                    value={empresa.abertura}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Capital Social">
                  <Input
                    value={empresa.capitalSocial}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="Natureza Jurídica">
                  <Input
                    value={empresa.naturezaJuridica}
                    readOnly
                    className="cursor-not-allowed bg-muted/30"
                  />
                </FormField>
                <FormField label="IE">
                  <Input
                    value={empresa.ie}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, ie: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="IM">
                  <Input
                    value={empresa.im}
                    onChange={(e) =>
                      setEmpresa({ ...empresa, im: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Regime Tributário">
                  <Input
                    value={empresa.regimeTributario}
                    onChange={(e) =>
                      setEmpresa({
                        ...empresa,
                        regimeTributario: standardizeUppercase(e.target.value),
                      })
                    }
                  />
                </FormField>
                <FormField label="Responsável Legal">
                  <div>
                    <Input
                      value={empresa.responsavel}
                      onChange={(e) => handleResponsavelChange(e.target.value)}
                      placeholder="NOME COMPLETO"
                      className={
                        responsavelStatus === "corrigindo"
                          ? "border-warning animate-pulse"
                          : responsavelStatus === "invalido"
                            ? "border-error"
                            : ""
                      }
                    />
                    <div className="mt-1 flex items-center gap-2">
                      {responsavelStatus === "padronizado" && (
                        <Badge variant="default">✓ Padronizado</Badge>
                      )}
                      {responsavelStatus === "corrigindo" && (
                        <Badge
                          variant="default"
                          className="bg-warning/10 text-warning"
                        >
                          Corrigindo…
                        </Badge>
                      )}
                      {responsavelStatus === "invalido" && (
                        <span className="text-body-xs text-error">
                          Valor inválido
                        </span>
                      )}
                    </div>
                  </div>
                </FormField>
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* Templates de Documentos (placeholder WYSIWYG) */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de Documentos</CardTitle>
            <CardDescription>
              Editor visual com variáveis {'{{ variable }}'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="orx-button px-2 py-1"
                    title="Negrito"
                    onClick={() => document.execCommand("bold")}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="orx-button px-2 py-1"
                    title="Itálico"
                    onClick={() => document.execCommand("italic")}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="orx-button px-2 py-1"
                    title="Sublinhado"
                    onClick={() => document.execCommand("underline")}
                  >
                    U
                  </button>
                  <button
                    type="button"
                    className="orx-button px-2 py-1"
                    title="Inserir variável"
                    onClick={() => {
                      if (editorRef.current) {
                        const sel = window.getSelection();
                        const variable = "{{cliente.nome}}";
                        const node = document.createTextNode(variable);
                        if (sel && sel.rangeCount > 0) {
                          const range = sel.getRangeAt(0);
                          range.deleteContents();
                          range.insertNode(node);
                        } else {
                          editorRef.current.appendChild(node);
                        }
                        setTemplateHtml(editorRef.current.innerHTML);
                      }
                    }}
                  >
                    {"{ }"}
                  </button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  className="orx-card p-3 rounded-lg min-h-[220px] focus:outline-none"
                  onInput={(e) =>
                    setTemplateHtml((e.target as HTMLDivElement).innerHTML)
                  }
                  aria-label="Editor de template"
                />
              </div>
              <div className="orx-card p-4 rounded-xl">
                <p className="text-body-sm text-secondary mb-2">Preview</p>
                <div
                  className="p-3 bg-surface dark:bg-card rounded-lg text-body-sm text-primary dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: sanitizedTemplatePreview }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConfiguracoes;
