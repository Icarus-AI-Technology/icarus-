import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CapacitacaoIA } from "@/components/modules/CapacitacaoIA";

describe("CapacitacaoIA", () => {
  it("deve estar definido", () => {
    render(<CapacitacaoIA />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
