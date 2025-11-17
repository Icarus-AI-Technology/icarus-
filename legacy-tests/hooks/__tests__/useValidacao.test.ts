import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useValidacao } from "../useValidacao";

describe("useValidacao", () => {
  it("should validate CPF correctly", () => {
    const { result } = renderHook(() => useValidacao());

    // CPF válido
    expect(result.current.validarCPF("123.456.789-09")).toBe(true);

    // CPF inválido
    expect(result.current.validarCPF("000.000.000-00")).toBe(false);
    expect(result.current.validarCPF("123.456.789-00")).toBe(false);
  });

  it("should validate CNPJ correctly", () => {
    const { result } = renderHook(() => useValidacao());

    // CNPJ válido
    expect(result.current.validarCNPJ("11.222.333/0001-81")).toBe(true);

    // CNPJ inválido
    expect(result.current.validarCNPJ("00.000.000/0000-00")).toBe(false);
  });

  it("should validate email correctly", () => {
    const { result } = renderHook(() => useValidacao());

    // Emails válidos
    expect(result.current.validarEmail("test@example.com")).toBe(true);
    expect(result.current.validarEmail("user.name+tag@example.co.uk")).toBe(
      true,
    );

    // Emails inválidos
    expect(result.current.validarEmail("invalid")).toBe(false);
    expect(result.current.validarEmail("test@")).toBe(false);
    expect(result.current.validarEmail("@example.com")).toBe(false);
  });

  it("should validate phone correctly", () => {
    const { result } = renderHook(() => useValidacao());

    // Telefones válidos
    expect(result.current.validarTelefone("(11) 98765-4321")).toBe(true);
    expect(result.current.validarTelefone("11987654321")).toBe(true);

    // Telefones inválidos
    expect(result.current.validarTelefone("123")).toBe(false);
    expect(result.current.validarTelefone("abcdefghijk")).toBe(false);
  });

  it("should validate CEP correctly", () => {
    const { result } = renderHook(() => useValidacao());

    // CEP válido
    expect(result.current.validarCEP("01310-100")).toBe(true);
    expect(result.current.validarCEP("01310100")).toBe(true);

    // CEP inválido
    expect(result.current.validarCEP("123")).toBe(false);
    expect(result.current.validarCEP("abcde-fgh")).toBe(false);
  });

  it("should validate required field", () => {
    const { result } = renderHook(() => useValidacao());

    expect(result.current.validarObrigatorio("texto")).toBe(true);
    expect(result.current.validarObrigatorio("")).toBe(false);
    expect(result.current.validarObrigatorio("   ")).toBe(false);
    expect(result.current.validarObrigatorio(null)).toBe(false);
    expect(result.current.validarObrigatorio(undefined)).toBe(false);
  });

  it("should validate number range", () => {
    const { result } = renderHook(() => useValidacao());

    expect(result.current.validarRange(5, 1, 10)).toBe(true);
    expect(result.current.validarRange(1, 1, 10)).toBe(true);
    expect(result.current.validarRange(10, 1, 10)).toBe(true);
    expect(result.current.validarRange(0, 1, 10)).toBe(false);
    expect(result.current.validarRange(11, 1, 10)).toBe(false);
  });

  it("should validate date format", () => {
    const { result } = renderHook(() => useValidacao());

    expect(result.current.validarData("2024-01-15")).toBe(true);
    expect(result.current.validarData("15/01/2024")).toBe(true);
    expect(result.current.validarData("invalid")).toBe(false);
    expect(result.current.validarData("2024-13-01")).toBe(false); // Mês inválido
  });

  it("should validate password strength", () => {
    const { result } = renderHook(() => useValidacao());

    // Senha forte
    expect(result.current.validarSenha("Senha@123")).toBe(true);

    // Senhas fracas
    expect(result.current.validarSenha("123456")).toBe(false); // Muito curta
    expect(result.current.validarSenha("senhafraca")).toBe(false); // Sem números/especiais
    expect(result.current.validarSenha("12345678")).toBe(false); // Apenas números
  });

  it("should validate file size", () => {
    const { result } = renderHook(() => useValidacao());

    const file1MB = { size: 1024 * 1024 } as File; // 1MB
    const file10MB = { size: 10 * 1024 * 1024 } as File; // 10MB

    expect(result.current.validarTamanhoArquivo(file1MB, 5)).toBe(true);
    expect(result.current.validarTamanhoArquivo(file10MB, 5)).toBe(false);
  });

  it("should validate file type", () => {
    const { result } = renderHook(() => useValidacao());

    const pdfFile = { type: "application/pdf" } as File;
    const imageFile = { type: "image/jpeg" } as File;
    const textFile = { type: "text/plain" } as File;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    expect(result.current.validarTipoArquivo(pdfFile, allowedTypes)).toBe(true);
    expect(result.current.validarTipoArquivo(imageFile, allowedTypes)).toBe(
      true,
    );
    expect(result.current.validarTipoArquivo(textFile, allowedTypes)).toBe(
      false,
    );
  });
});
