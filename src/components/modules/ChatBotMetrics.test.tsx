import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBotMetrics } from "@/components/modules/ChatBotMetrics";

describe("ChatBotMetrics", () => {
  it("deve estar definido", () => {
    render(<ChatBotMetrics />);
    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  // TODO: Adicionar mais testes específicos
});
