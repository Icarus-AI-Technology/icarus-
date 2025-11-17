import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BIAnalytics } from "@/components/modules/BIAnalytics";

describe("BIAnalytics", () => {
  it("deve estar definido", () => {
    render(<BIAnalytics />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
