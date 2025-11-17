/**
 * Componente de Upload de Documentos
 * ICARUS v5.0 - OraclusX Design System
 *
 * Upload de documentos pessoais e profissionais para médicos
 * Substitui o container de dados bancários
 *
 * Tipos de documentos suportados:
 * - Pessoais: RG, CPF, Comprovante Residência, CNH
 * - Profissionais: CRM, Diploma, Certificados, Currículo
 */

import React, { useState, useCallback } from "react";
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface DocumentoUpload {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  arquivo: File;
  url?: string;
  status: "pending" | "uploading" | "success" | "error";
  progresso?: number;
  erro?: string;
}

export type TipoDocumento =
  | "rg"
  | "cpf"
  | "comprovante_residencia"
  | "cnh"
  | "crm"
  | "diploma"
  | "certificado"
  | "curriculo"
  | "outros";

export const TIPOS_DOCUMENTO = {
  // Pessoais
  rg: { label: "RG", categoria: "Pessoal" },
  cpf: { label: "CPF", categoria: "Pessoal" },
  comprovante_residencia: {
    label: "Comprovante de Residência",
    categoria: "Pessoal",
  },
  cnh: { label: "CNH", categoria: "Pessoal" },

  // Profissionais
  crm: { label: "CRM", categoria: "Profissional" },
  diploma: { label: "Diploma", categoria: "Profissional" },
  certificado: {
    label: "Certificado/Especialização",
    categoria: "Profissional",
  },
  curriculo: { label: "Currículo", categoria: "Profissional" },
  outros: { label: "Outros", categoria: "Geral" },
};

export interface DocumentosUploadProps {
  documentos: DocumentoUpload[];
  onChange: (documentos: DocumentoUpload[]) => void;
  maxFiles?: number;
  maxSize?: number; // em MB
  acceptedTypes?: string[];
}

export const DocumentosUpload: React.FC<DocumentosUploadProps> = ({
  documentos,
  onChange,
  maxFiles = 10,
  maxSize = 5, // 5MB
  acceptedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento>("outros");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processarArquivos(files);
    },
    [processarArquivos],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const files = Array.from(e.target.files);
      processarArquivos(files);

      // Reset input
      e.target.value = "";
    },
    [processarArquivos],
  );

  const processarArquivos = useCallback(
    (files: File[]) => {
      if (documentos.length + files.length > maxFiles) {
        alert(`Máximo de ${maxFiles} arquivos permitidos`);
        return;
      }

      const novosDocumentos: DocumentoUpload[] = files
        .filter((file) => {
          // Valida tipo
          if (!acceptedTypes.includes(file.type)) {
            alert(`Tipo de arquivo não permitido: ${file.type}`);
            return false;
          }

          // Valida tamanho
          const sizeMB = file.size / (1024 * 1024);
          if (sizeMB > maxSize) {
            alert(
              `Arquivo muito grande: ${file.name} (${sizeMB.toFixed(2)}MB). Máximo: ${maxSize}MB`,
            );
            return false;
          }

          return true;
        })
        .map((file) => ({
          id: Math.random().toString(36).substring(7),
          nome: file.name,
          tipo: selectedTipo,
          arquivo: file,
          status: "pending" as const,
        }));

      onChange([...documentos, ...novosDocumentos]);
    },
    [acceptedTypes, documentos, maxFiles, maxSize, onChange, selectedTipo],
  );

  const removerDocumento = (id: string) => {
    onChange(documentos.filter((doc) => doc.id !== id));
  };

  const getIconeDocumento = (tipo: TipoDocumento) => {
    const categoria = TIPOS_DOCUMENTO[tipo].categoria;
    return categoria === "Profissional" ? FileText : ImageIcon;
  };

  const documentosPessoais = documentos.filter(
    (doc) => TIPOS_DOCUMENTO[doc.tipo].categoria === "Pessoal",
  );
  const documentosProfissionais = documentos.filter(
    (doc) => TIPOS_DOCUMENTO[doc.tipo].categoria === "Profissional",
  );
  const documentosGerais = documentos.filter(
    (doc) => TIPOS_DOCUMENTO[doc.tipo].categoria === "Geral",
  );

  return (
    <div className="space-y-6">
      {/* Seletor de Tipo de Documento */}
      <div>
        <label
          className="block text-[var(--text-primary)] mb-2"
          style={{ fontSize: "0.813rem", fontWeight: 500 }}
        >
          Tipo de Documento
        </label>
        <select
          value={selectedTipo}
          onChange={(e) => setSelectedTipo(e.target.value as TipoDocumento)}
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <optgroup label="Documentos Pessoais">
            {Object.entries(TIPOS_DOCUMENTO)
              .filter(([_, info]) => info.categoria === "Pessoal")
              .map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
          </optgroup>
          <optgroup label="Documentos Profissionais">
            {Object.entries(TIPOS_DOCUMENTO)
              .filter(([_, info]) => info.categoria === "Profissional")
              .map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
          </optgroup>
          <optgroup label="Outros">
            <option value="outros">Outros</option>
          </optgroup>
        </select>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all",
          isDragging
            ? "border-[var(--primary)] bg-[var(--primary)]/10"
            : "border-[var(--border)] bg-[var(--surface)]",
          "hover:border-[var(--primary)] hover:bg-[var(--primary)]/5",
        )}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="w-12 h-12 text-[var(--primary)] mb-4" />
          <p
            className="text-[var(--text-primary)] mb-2"
            style={{ fontSize: "0.813rem", fontWeight: 500 }}
          >
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "0.813rem" }}
          >
            PDF, JPEG, PNG ou WEBP • Máximo {maxSize}MB por arquivo
          </p>
          <p
            className="text-[var(--text-muted)] mt-2"
            style={{ fontSize: "0.813rem" }}
          >
            {documentos.length} de {maxFiles} arquivos enviados
          </p>
        </label>
      </div>

      {/* Lista de Documentos Pessoais */}
      {documentosPessoais.length > 0 && (
        <Card className="p-4">
          <h3
            className="text-[var(--text-primary)] mb-3"
            style={{ fontSize: "0.813rem", fontWeight: 600 }}
          >
            Documentos Pessoais
          </h3>
          <div className="space-y-2">
            {documentosPessoais.map((doc) => {
              const Icone = getIconeDocumento(doc.tipo);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                >
                  <Icone className="w-5 h-5 text-[var(--primary)]" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[var(--text-primary)] truncate"
                      style={{ fontSize: "0.813rem", fontWeight: 500 }}
                    >
                      {doc.nome}
                    </p>
                    <p
                      className="text-[var(--text-secondary)]"
                      style={{ fontSize: "0.813rem" }}
                    >
                      {TIPOS_DOCUMENTO[doc.tipo].label}
                    </p>
                  </div>
                  {doc.status === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-[var(--orx-success)]" />
                  )}
                  {doc.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-[var(--orx-error)]" />
                  )}
                  <button
                    onClick={() => removerDocumento(doc.id)}
                    className="p-1 rounded hover:bg-[var(--surface)] transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Lista de Documentos Profissionais */}
      {documentosProfissionais.length > 0 && (
        <Card className="p-4">
          <h3
            className="text-[var(--text-primary)] mb-3"
            style={{ fontSize: "0.813rem", fontWeight: 600 }}
          >
            Documentos Profissionais
          </h3>
          <div className="space-y-2">
            {documentosProfissionais.map((doc) => {
              const Icone = getIconeDocumento(doc.tipo);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                >
                  <Icone className="w-5 h-5 text-[var(--primary)]" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[var(--text-primary)] truncate"
                      style={{ fontSize: "0.813rem", fontWeight: 500 }}
                    >
                      {doc.nome}
                    </p>
                    <p
                      className="text-[var(--text-secondary)]"
                      style={{ fontSize: "0.813rem" }}
                    >
                      {TIPOS_DOCUMENTO[doc.tipo].label}
                    </p>
                  </div>
                  {doc.status === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-[var(--orx-success)]" />
                  )}
                  {doc.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-[var(--orx-error)]" />
                  )}
                  <button
                    onClick={() => removerDocumento(doc.id)}
                    className="p-1 rounded hover:bg-[var(--surface)] transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Lista de Documentos Gerais */}
      {documentosGerais.length > 0 && (
        <Card className="p-4">
          <h3
            className="text-[var(--text-primary)] mb-3"
            style={{ fontSize: "0.813rem", fontWeight: 600 }}
          >
            Outros Documentos
          </h3>
          <div className="space-y-2">
            {documentosGerais.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]"
              >
                <File className="w-5 h-5 text-[var(--primary)]" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[var(--text-primary)] truncate"
                    style={{ fontSize: "0.813rem", fontWeight: 500 }}
                  >
                    {doc.nome}
                  </p>
                </div>
                {doc.status === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-[var(--orx-success)]" />
                )}
                {doc.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-[var(--orx-error)]" />
                )}
                <button
                  onClick={() => removerDocumento(doc.id)}
                  className="p-1 rounded hover:bg-[var(--surface)] transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
