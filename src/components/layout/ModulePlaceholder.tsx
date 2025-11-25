/**
 * ICARUS v5.0 - Página de Módulo Genérica
 * Template padrão para módulos em construção
 */

import React from 'react';
import { useDocumentTitle } from '@/hooks';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ModulePlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  description = 'Este módulo está em desenvolvimento e será disponibilizado em breve.',
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
            fontFamily: 'var(--orx-font-family)',
            fontWeight: 700,
            color: 'var(--orx-text-primary)',
            marginBottom: '1rem',
          }}
        >
          {title}
        </h1>

        {/* Descrição */}
        <p
          style={{
            fontSize: '0.813rem',
            fontFamily: 'var(--orx-font-family)',
            color: 'var(--orx-text-secondary)',
            marginBottom: '2rem',
            lineHeight: '1.6',
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
              fontFamily: 'var(--orx-font-family)',
              fontWeight: 600,
              color: 'var(--orx-primary)',
            }}
          >
            Em Desenvolvimento
          </span>
        </div>

        {/* QA Filters and Table (only with ?qa=1) */}
        {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('qa') === '1' && (
            <div className="text-left" style={{ marginTop: '1.5rem' }}>
              <form
                aria-label="Filtros QA"
                style={{
                  background: 'var(--orx-bg-light)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.6fr',
                  gap: '0.75rem',
                  alignItems: 'end',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    htmlFor="qa-busca-generic"
                    style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}
                  >
                    Busca
                  </label>
                  <input
                    id="qa-busca-generic"
                    name="busca"
                    placeholder="Buscar..."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="qa-inicio-generic"
                    style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}
                  >
                    Início
                  </label>
                  <input
                    id="qa-inicio-generic"
                    name="inicio"
                    type="date"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="qa-fim-generic"
                    style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}
                  >
                    Fim
                  </label>
                  <input
                    id="qa-fim-generic"
                    name="fim"
                    type="date"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="qa-status-generic"
                    style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}
                  >
                    Status
                  </label>
                  <select
                    id="qa-status-generic"
                    name="status"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    className="neumorphic-button"
                    aria-label="Aplicar filtros"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    className="neumorphic-button"
                    aria-label="Limpar filtros"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}
                  >
                    Limpar
                  </button>
                </div>
              </form>

              <div
                className="neumorphic-container"
                style={{ padding: '1rem', borderRadius: '1rem' }}
              >
                <h2
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Registros (QA)
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table role="table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>#</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Título</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Categoria</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <tr key={i}>
                          <td style={{ padding: '0.5rem' }}>REG-{i}</td>
                          <td style={{ padding: '0.5rem' }}>Item {i}</td>
                          <td style={{ padding: '0.5rem' }}>{i % 2 === 0 ? 'Tipo A' : 'Tipo B'}</td>
                          <td style={{ padding: '0.5rem' }}>{i % 3 === 0 ? 'Inativo' : 'Ativo'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="button" aria-label="Página Anterior" className="neumorphic-button">
                    Anterior
                  </button>
                  <button type="button" aria-label="Próxima Página" className="neumorphic-button">
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Botão Voltar */}
        <Link
          to="/dashboard"
          className="neumorphic-button inline-flex items-center gap-2 px-6 py-3"
          style={{
            fontSize: '0.813rem',
            fontFamily: 'var(--orx-font-family)',
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
              fontFamily: 'var(--orx-font-family)',
              color: 'var(--orx-text-secondary)',
            }}
          >
            Este módulo faz parte do roadmap do{''}
            <strong>Icarus v5.0</strong> e será lançado em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

ModulePlaceholder.displayName = 'ModulePlaceholder';

export default ModulePlaceholder;
