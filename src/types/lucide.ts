/**
 * Lucide Icon Type Definition
 * 
 * LucideIcon is NOT exported by lucide-react as a runtime value.
 * It's only a TypeScript type, so we define it here for reuse.
 */

import React from 'react';

export type LucideIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: string | number }
>;

