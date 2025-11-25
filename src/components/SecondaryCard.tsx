import React from 'react';
import type { LucideIcon } from '@/types/lucide';
import { Card, CardBody } from "@heroui/react";

interface SecondaryCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  colorClass: string;
  accentColor: string;
}

export const SecondaryCard: React.FC<SecondaryCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
  accentColor,
}) => {
  return (
    <Card 
      className="bg-[#181b29] border border-white/5 hover:border-white/10 transition-all duration-300 group"
      shadow="sm"
      style={{ borderRadius: '2rem' }}
    >
      <CardBody className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center`}
          >
            <Icon size={20} className={accentColor} />
          </div>
          <span className="text-gray-400 text-sm font-medium">{title}</span>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          <p className="text-xs text-gray-500">{subtext}</p>
        </div>
      </CardBody>
    </Card>
  );
};
