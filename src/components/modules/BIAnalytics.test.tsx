import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BIAnalytics } from "@/components/modules/BIAnalytics";

describe("BIAnalytics", () => {
  it("deve estar definido", () => {
    render(<BIAnalytics />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
