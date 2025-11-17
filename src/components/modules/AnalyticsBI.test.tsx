import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsBI } from "@/components/modules/AnalyticsBI";

describe("AnalyticsBI", () => {
  it("deve estar definido", () => {
    render(<AnalyticsBI />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
