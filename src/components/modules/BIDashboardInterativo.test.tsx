import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BIDashboardInterativo } from "@/components/modules/BIDashboardInterativo";

describe("BIDashboardInterativo", () => {
  it("deve estar definido", () => {
    render(<BIDashboardInterativo />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
