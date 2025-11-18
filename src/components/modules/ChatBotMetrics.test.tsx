import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBotMetrics } from "@/components/modules/ChatBotMetrics";

describe("ChatBotMetrics", () => {
  it("deve estar definido", () => {
    render(<ChatBotMetrics />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
