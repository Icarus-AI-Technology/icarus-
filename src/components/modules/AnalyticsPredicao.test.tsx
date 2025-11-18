import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsPredicao } from "@/components/modules/AnalyticsPredicao";

describe("AnalyticsPredicao", () => {
  it("deve estar definido", () => {
    render(<AnalyticsPredicao />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
