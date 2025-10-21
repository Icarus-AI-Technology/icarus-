/**
 * ICARUS v5.0 - Página de Módulo Genérica
 * Template padrão para módulos em construção
 */

import React from"react";
import { useDocumentTitle } from"@/hooks";
import { Construction, ArrowLeft } from"lucide-react";
import { Link } from"react-router-dom";

export interface ModulePlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  description ="Este módulo está em desenvolvimento e será disponibilizado em breve.",
  icon,
}) => {
  useDocumentTitle(`${title} - Icarus v5.0`);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="neumorphic-card p-12 max-w-2xl w-full text-center">
        {/* Ícone */}
        <div className="flex justify-center mb-6">
          {icon || <Construction size={64} className="text-indigo-500" />}
        </div>

        {/* Título */}
        <h1
          style={{
            fontSize: '0.813rem',
            fontFamily:"var(--orx-font-family)",
            fontWeight: 700,
            color:"var(--orx-text-primary)",
            marginBottom:"1rem",
          }}
        >
          {title}
        </h1>

        {/* Descrição */}
        <p
          style={{
            fontSize: '0.813rem',
            fontFamily:"var(--orx-font-family)",
            color:"var(--orx-text-secondary)",
            marginBottom:"2rem",
            lineHeight:"1.6",
          }}
        >
          {description}
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-6">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span
            style={{
              fontSize: '0.813rem',
              fontFamily:"var(--orx-font-family)",
              fontWeight: 600,
              color:"var(--orx-primary)",
            }}
          >
            Em Desenvolvimento
          </span>
        </div>

        {/* Botão Voltar */}
        <Link
          to="/dashboard"
          className="neumorphic-button inline-flex items-center gap-2 px-6 py-3"
          style={{
            fontSize: '0.813rem',
            fontFamily:"var(--orx-font-family)",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </Link>

        {/* Informações Adicionais */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p
            style={{
              fontSize: '0.813rem',
              fontFamily:"var(--orx-font-family)",
              color:"var(--orx-text-secondary)",
            }}
          >
            Este módulo faz parte do roadmap do{""}
            <strong>Icarus v5.0</strong> e será lançado em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

ModulePlaceholder.displayName ="ModulePlaceholder";

export default ModulePlaceholder;

