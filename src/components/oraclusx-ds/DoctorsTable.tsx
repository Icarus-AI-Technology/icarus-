import React from 'react';
import { MoreHorizontal, Phone, Building2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Doctor {
  id: string;
  name: string;
  crm: string;
  specialty: string;
  hospital: string;
  phone: string;
  successRate: number;
  avatarUrl: string;
}

interface DoctorsTableProps {
  doctors: Doctor[];
}

export const DoctorsTable: React.FC<DoctorsTableProps> = ({ doctors }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)] border border-slate-100 dark:border-slate-700/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700/50">
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Médico
            </th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              CRM / UF
            </th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Especialidade
            </th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hospital Principal
            </th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Contato
            </th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa Sucesso
            </th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
          {doctors.map((doctor) => (
            <tr
              key={doctor.id}
              className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {doctor.name}
                    </div>
                    <div className="text-xs text-slate-400">ID: {doctor.id}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="font-mono text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                  {doctor.crm}
                </span>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-100 dark:border-violet-500/20">
                  {doctor.specialty}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Building2 size={14} className="text-slate-400" />
                  {doctor.hospital}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Phone size={14} className="text-slate-400" />
                  {doctor.phone}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold',
                      doctor.successRate >= 95
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    )}
                  >
                    <Star size={12} fill="currentColor" />
                    {doctor.successRate}%
                  </div>
                </div>
              </td>
              <td className="p-4 text-right">
                <button className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/20 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
