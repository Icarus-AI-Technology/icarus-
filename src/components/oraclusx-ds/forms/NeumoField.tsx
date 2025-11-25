import React from 'react';
import { cn } from '@/lib/utils';

interface NeumoFieldProps {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

export const NeumoField: React.FC<NeumoFieldProps> = ({ label, description, error, children }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">{label}</label>
      {description && <p className="text-xs text-white/60">{description}</p>}
      <div className={cn('ic-card-neumo rounded-2xl p-3', error && 'ring-2 ring-rose-500')}>
        {children}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
};

export default NeumoField;
