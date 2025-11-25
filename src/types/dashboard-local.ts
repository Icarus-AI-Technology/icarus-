import type { LucideIcon } from 'lucide-react';

export interface StatItem {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
}

export interface CategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}
