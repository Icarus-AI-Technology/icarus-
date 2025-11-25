import React from 'react';
import { BarChart2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col justify-center items-center text-center">
      <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <BarChart2 size={48} className="text-indigo-500" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Analytics & BI</h2>
      <p className="text-gray-400 max-w-md">
        Este módulo está sendo processado pelo Icarus AI. Gráficos avançados e relatórios preditivos
        estarão disponíveis na próxima compilação.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-[#181b29] rounded-2xl border border-white/5 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
};
