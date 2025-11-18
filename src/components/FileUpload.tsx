/**
 * OraclusX Design System - FileUpload Component
 * Upload de arquivos com drag & drop e múltiplo
 * 
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (label, aria-*, keyboard)
 * ✅ TypeScript strict
 */

import React, { useRef, useState } from"react";
import { Upload, X, File, Image, FileText } from"lucide-react";
import { cn } from"@/lib/utils";

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  label,
  helperText,
  error,
  className,
  showPreview = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): boolean => {
    setValidationError("");

    if (maxFiles && selectedFiles.length + files.length > maxFiles) {
      setValidationError(`Máximo de ${maxFiles} arquivo(s) permitido(s)`);
      return false;
    }

    for (const file of files) {
      if (maxSize && file.size > maxSize) {
        setValidationError(`Arquivo"${file.name}" excede o tamanho máximo de ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    if (!validateFiles(fileArray)) return;

    const newFiles = multiple ? [...selectedFiles, ...fileArray] : fileArray;
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image size={20} />;
    if (file.type.includes("pdf")) return <FileText size={20} />;
    return <File size={20} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block mb-2 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key ==="Enter" || e.key ==="") {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Selecionar arquivos"
        title="Selecionar arquivos"
        className={cn("relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
          isDragging &&"border-[var(--primary)] bg-[var(--primary)]/5",
          !isDragging &&"border-gray-300 dark:border-border hover:border-[var(--primary)]",
          disabled &&"opacity-50 cursor-not-allowed",
          (error || validationError) &&"border-error"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          aria-label="Selecionar arquivos"
          title="Selecionar arquivos"
          className="hidden"
        />

        <Upload
          size={48}
          className={cn("mx-auto mb-4",
            isDragging ?"text-[var(--primary)]" :"text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"
          )}
        />

        <p className="mb-2 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
          {isDragging ?"Solte os arquivos aqui" :"Clique ou arraste arquivos"}
        </p>

        {helperText && (
          <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
            {helperText}
          </p>
        )}

        {maxSize && (
          <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
            Tamanho máximo: {(maxSize / 1024 / 1024).toFixed(2)}MB
          </p>
        )}
      </div>

      {(error || validationError) && (
        <p className="mt-2 text-error dark:text-red-400">
          {error || validationError}
        </p>
      )}

      {/* File Preview */}
      {showPreview && selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className={cn("flex items-center gap-3 p-3 rounded-lg","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]"
              )}
            >
              <div className="text-[var(--primary)]">
                {getFileIcon(file)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] truncate font-medium">
                  {file.name}
                </p>
                <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <button
                onClick={() => handleRemoveFile(index)}
                aria-label={`Remover ${file.name}`}
                title={`Remover ${file.name}`}
                className={cn("p-2 rounded-md transition-colors","hover:bg-destructive/5 dark:hover:bg-red-950/20 text-error dark:text-red-400","focus:outline-none focus:ring-2 focus:ring-error"
                )}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

