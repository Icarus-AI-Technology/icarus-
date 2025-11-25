import React from 'react';
import { cn } from '@/lib/utils';

interface NeumoFormProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const NeumoForm: React.FC<NeumoFormProps> = ({
  title,
  description,
  actions,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('ic-card-neumo rounded-[32px] p-6 space-y-6', className)} {...props}>
      {(title || description || actions) && (
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
            {description && <p className="text-sm text-white/70">{description}</p>}
          </div>
          {actions}
        </header>
      )}

      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default NeumoForm;
