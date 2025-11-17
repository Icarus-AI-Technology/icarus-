import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatCNPJ,
  validateEmail,
  validateCPF,
  validateCNPJ,
} from "@/lib/utils";

describe("Utils - Formatação", () => {
  describe("formatCurrency", () => {
    it("deve formatar valores monetários corretamente", () => {
      expect(formatCurrency(1000)).toBe("R$ 1.000,00");
      expect(formatCurrency(1500.5)).toBe("R$ 1.500,50");
      expect(formatCurrency(0)).toBe("R$ 0,00");
    });

    it("deve lidar com valores negativos", () => {
      expect(formatCurrency(-500)).toBe("-R$ 500,00");
    });
  });

  describe("formatDate", () => {
    it("deve formatar datas corretamente", () => {
      const date = new Date("2025-10-27T12:00:00Z");
      const formatted = formatDate(date);
      expect(formatted).toMatch(/27\/10\/2025/);
    });

    it("deve aceitar string ISO", () => {
      const formatted = formatDate("2025-10-27");
      expect(formatted).toMatch(/27\/10\/2025/);
    });
  });

  describe("formatCPF", () => {
    it("deve formatar CPF corretamente", () => {
      expect(formatCPF("12345678900")).toBe("123.456.789-00");
    });

    it("deve retornar vazio para CPF inválido", () => {
      expect(formatCPF("123")).toBe("");
    });
  });

  describe("formatCNPJ", () => {
    it("deve formatar CNPJ corretamente", () => {
      expect(formatCNPJ("12345678000190")).toBe("12.345.678/0001-90");
    });

    it("deve retornar vazio para CNPJ inválido", () => {
      expect(formatCNPJ("123")).toBe("");
    });
  });
});

describe("Utils - Validação", () => {
  describe("validateEmail", () => {
    it("deve validar emails corretos", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user+tag@domain.co.uk")).toBe(true);
    });

    it("deve rejeitar emails inválidos", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
    });
  });

  describe("validateCPF", () => {
    it("deve validar CPF válido", () => {
      expect(validateCPF("11111111111")).toBe(true);
    });

    it("deve rejeitar CPF inválido", () => {
      expect(validateCPF("123")).toBe(false);
      expect(validateCPF("00000000000")).toBe(false);
    });
  });

  describe("validateCNPJ", () => {
    it("deve validar CNPJ com 14 dígitos", () => {
      expect(validateCNPJ("12345678000190")).toBe(true);
    });

    it("deve rejeitar CNPJ com menos de 14 dígitos", () => {
      expect(validateCNPJ("123")).toBe(false);
    });
  });
});
