import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface SubModuleLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  children: React.ReactNode;
}

export const SubModuleLayout: React.FC<SubModuleLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  stats,
  children,
}) => {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-indigo-500 transition-colors">
            <Home size={16} />
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="opacity-50" />
              {item.path ? (
                <Link to={item.path} className="hover:text-indigo-500 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>

      {/* Stats / Mini Cards Section */}
      {stats && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{stats}</div>}

      {/* Main Content Section */}
      <div className="bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
};
