import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgendamentoCirurgico } from "@/components/modules/AgendamentoCirurgico";

describe("AgendamentoCirurgico", () => {
  it("deve estar definido", () => {
    render(<AgendamentoCirurgico />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
