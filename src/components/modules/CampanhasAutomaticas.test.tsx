import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampanhasAutomaticas } from "@/components/modules/CampanhasAutomaticas";

describe("CampanhasAutomaticas", () => {
  it("deve estar definido", () => {
    render(<CampanhasAutomaticas />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
