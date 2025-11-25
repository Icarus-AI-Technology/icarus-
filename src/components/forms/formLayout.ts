/**
 * OraclusX Forms - Layout Constants
 * Classes Tailwind CSS para grids de formulários
 */

// Grid padrão de formulários (responsivo)
export const FORM_GRID = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

// Colunas para campos de formulário
export const FORM_COL = {
  full: 'col-span-full',
  half: 'col-span-1',
  twoThirds: 'col-span-1 md:col-span-2',
  oneThird: 'col-span-1',
} as const;

// Espaçamentos
export const FORM_SPACING = {
  section: 'mb-8',
  field: 'mb-4',
  label: 'mb-2',
} as const;
