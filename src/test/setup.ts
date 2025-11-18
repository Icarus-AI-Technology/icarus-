/**
 * Setup global para testes Vitest
 */

import { expect, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Estende matchers do jest-dom
expect.extend(matchers);

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});

// Garante que sempre exista um elemento com role=document
beforeEach(() => {
  document.body.setAttribute('role', 'document');
});

// Mock de window.matchMedia (para testes de responsividade)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

