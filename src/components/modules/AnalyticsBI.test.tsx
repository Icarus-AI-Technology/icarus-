import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsBI } from "@/components/modules/AnalyticsBI";

describe("AnalyticsBI", () => {
  it("deve estar definido", () => {
    render(<AnalyticsBI />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
