/**
 * OraclusX Design System - Table Primitives
 * Componentes HTML primitivos para tabelas customizadas
 */

import React from 'react';
import { cn } from '@/lib/utils';

export const TableContainer = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table {...props} className={cn("w-full border-collapse", className)}>
    {children}
  </table>
);

export const TableHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead {...props} className={cn("bg-[var(--surface-raised)] border-b border-[var(--border)]", className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props} className={className}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...props} className={cn("border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors", className)}>
    {children}
  </tr>
);

export const TableHead = ({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th {...props} className={cn("px-4 py-3 text-left orx-orx-font-semibold text-[var(--text)]", className)}>
    {children}
  </th>
);

export const TableCell = ({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td {...props} className={cn("px-4 py-3 text-[var(--text-secondary)]", className)}>
    {children}
  </td>
);

