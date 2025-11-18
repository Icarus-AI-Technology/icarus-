import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatEnterprise } from "@/components/modules/ChatEnterprise";

describe("ChatEnterprise", () => {
  it("deve estar definido", () => {
    render(<ChatEnterprise />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
