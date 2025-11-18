import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CertificacoesAnvisa } from "@/components/modules/CertificacoesAnvisa";

describe("CertificacoesAnvisa", () => {
  it("deve estar definido", () => {
    render(<CertificacoesAnvisa />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
