import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampanhasAutomaticas } from "@/components/modules/CampanhasAutomaticas";

describe("CampanhasAutomaticas", () => {
  it("deve estar definido", () => {
    render(<CampanhasAutomaticas />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
