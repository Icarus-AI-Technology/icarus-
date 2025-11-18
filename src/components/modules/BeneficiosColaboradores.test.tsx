import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BeneficiosColaboradores } from "@/components/modules/BeneficiosColaboradores";

describe("BeneficiosColaboradores", () => {
  it("deve estar definido", () => {
    render(<BeneficiosColaboradores />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
