#!/usr/bin/env node

/**
 * ICARUS v5.0 - Sistema de Auditoria Inteligente
 * 10 Agentes Especializados para Auditoria Completa
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import ora from "ora";

// ============================================
// CONFIGURAÇÃO DOS AGENTES
// ============================================

const AGENTS = {
  "01": {
    id: "01",
    name: "Design System & UI/UX",
    emoji: "🎨",
    group: 1,
    duration: 40,
    dependencies: [],
    weight: 0.15,
    targetScore: 100,
    subagents: [
      { id: "1.1", name: "OraclusX DS Components", duration: 15 },
      { id: "1.2", name: "Responsividade & A11y", duration: 15 },
      { id: "1.3", name: "Dark/Light Mode & Tokens", duration: 10 },
    ],
  },
  "02": {
    id: "02",
    name: "Frontend Architecture",
    emoji: "⚛️",
    group: 1,
    duration: 40,
    dependencies: [],
    weight: 0.15,
    targetScore: 95,
    subagents: [
      { id: "2.1", name: "Rotas & Navegação", duration: 10 },
      { id: "2.2", name: "Hooks & Context", duration: 10 },
      { id: "2.3", name: "TypeScript & Validações", duration: 10 },
      { id: "2.4", name: "Performance & Build", duration: 10 },
    ],
  },
  "03": {
    id: "03",
    name: "Backend & Database",
    emoji: "🗄️",
    group: 2,
    duration: 55,
    dependencies: [],
    weight: 0.15,
    targetScore: 90,
    subagents: [
      { id: "3.1", name: "Schema & Tabelas", duration: 20 },
      { id: "3.2", name: "RPC Functions & Views", duration: 15 },
      { id: "3.3", name: "Triggers & Constraints", duration: 10 },
      { id: "3.4", name: "RLS Documentation", duration: 10 },
    ],
  },
  "04": {
    id: "04",
    name: "Integrações & APIs",
    emoji: "🔌",
    group: 2,
    duration: 55,
    dependencies: [],
    weight: 0.1,
    targetScore: 85,
    subagents: [
      { id: "4.1", name: "APIs Externas (30+)", duration: 20 },
      { id: "4.2", name: "Supabase Services", duration: 15 },
      { id: "4.3", name: "Transportadoras (18)", duration: 10 },
      { id: "4.4", name: "Webhooks & Queue", duration: 10 },
    ],
  },
  "05": {
    id: "05",
    name: "Inteligência Artificial",
    emoji: "🤖",
    group: 3,
    duration: 75,
    dependencies: ["03", "04"],
    weight: 0.1,
    targetScore: 90,
    subagents: [
      { id: "5.1", name: "Modelos ML (12+)", duration: 30 },
      { id: "5.2", name: "Busca Vetorial", duration: 20 },
      { id: "5.3", name: "LLM Services", duration: 15 },
      { id: "5.4", name: "Compliance IA (5 agentes)", duration: 10 },
    ],
  },
  "06": {
    id: "06",
    name: "Módulos Funcionais (58)",
    emoji: "📦",
    group: 3,
    duration: 75,
    dependencies: ["03", "04"],
    weight: 0.15,
    targetScore: 95,
    subagents: [
      { id: "6.1", name: "Core Business (10)", duration: 20 },
      { id: "6.2", name: "Compras & Fornecedores (6)", duration: 10 },
      { id: "6.3", name: "Logística & Frota (10)", duration: 15 },
      { id: "6.4", name: "RH & Pessoas (11)", duration: 10 },
      { id: "6.5", name: "Analytics & BI (8)", duration: 10 },
      { id: "6.6", name: "Integrações & Automação (7)", duration: 5 },
      { id: "6.7", name: "Inventário & Armazém (6)", duration: 5 },
    ],
  },
  "07": {
    id: "07",
    name: "Segurança & Compliance",
    emoji: "🔒",
    group: 1,
    duration: 40,
    dependencies: [],
    weight: 0.1,
    targetScore: 100,
    subagents: [
      { id: "7.1", name: "Autenticação & RBAC", duration: 15 },
      { id: "7.2", name: "Validações & Sanitização", duration: 10 },
      { id: "7.3", name: "ANVISA & Regulatório", duration: 10 },
      { id: "7.4", name: "Abbott Score (98.2%)", duration: 5 },
    ],
  },
  "08": {
    id: "08",
    name: "Testes & Qualidade",
    emoji: "🧪",
    group: 4,
    duration: 60,
    dependencies: ["01", "02", "03", "04", "05", "06", "07"],
    weight: 0.05,
    targetScore: 85,
    subagents: [
      { id: "8.1", name: "E2E Tests Playwright", duration: 20 },
      { id: "8.2", name: "Unit Tests Vitest", duration: 15 },
      { id: "8.3", name: "QA Scripts", duration: 15 },
      { id: "8.4", name: "Benchmarks", duration: 10 },
    ],
  },
  "09": {
    id: "09",
    name: "Deploy & DevOps",
    emoji: "🚀",
    group: 4,
    duration: 60,
    dependencies: ["08"],
    weight: 0.03,
    targetScore: 90,
    subagents: [
      { id: "9.1", name: "Build & Bundle", duration: 15 },
      { id: "9.2", name: "ENV & Configs", duration: 15 },
      { id: "9.3", name: "Vercel Setup", duration: 20 },
      { id: "9.4", name: "CI/CD & Monitoring", duration: 10 },
    ],
  },
  10: {
    id: "10",
    name: "Limpeza & Boas Práticas",
    emoji: "🧹",
    group: 4,
    duration: 60,
    dependencies: ["09"],
    weight: 0.02,
    targetScore: 100,
    subagents: [
      { id: "10.1", name: "Code Quality", duration: 20 },
      { id: "10.2", name: "Documentation", duration: 15 },
      { id: "10.3", name: "Performance Optimization", duration: 15 },
      { id: "10.4", name: "Final Score Calculation", duration: 10 },
    ],
  },
};

export { AGENTS };
