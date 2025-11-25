/**
 * OraclusX Design System - SubModulesNavigation Component
 * Navegação de submódulos com padrão neumórfico
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubModule {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface SubModulesNavigationProps {
  title: string;
  subModules: SubModule[];
  className?: string;
}

export const SubModulesNavigation: React.FC<SubModulesNavigationProps> = ({
  title,
  subModules,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-body-lg text-primary dark:text-gray-100 mb-4 orx-orx-font-medium">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {subModules.map((subModule) => (
          <button
            key={subModule.id}
            onClick={subModule.onClick}
            className="orx-card p-4 text-left hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {subModule.icon && (
                  <div className="flex-shrink-0 mt-1 text-primary">{subModule.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-primary dark:text-gray-100 mb-1 orx-orx-font-medium">
                    {subModule.label}
                  </h4>
                  {subModule.description && (
                    <p className="text-body-sm text-secondary dark:text-muted line-clamp-2">
                      {subModule.description}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight
                size={20}
                className="flex-shrink-0 text-muted group-hover:text-primary transition-colors"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

SubModulesNavigation.displayName = 'OraclusXSubModulesNavigation';

export default SubModulesNavigation;
