import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CapacitacaoIA } from "@/components/modules/CapacitacaoIA";

describe("CapacitacaoIA", () => {
  it("deve estar definido", () => {
    render(<CapacitacaoIA />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
