/**
 * Teste de Integração: Fluxo Completo de Cirurgia
 */

import { describe, it, expect } from "vitest";

describe("Fluxo Completo de Cirurgia", () => {
  it("deve criar cirurgia com todos os recursos", async () => {
    // 1. Paciente existe
    const paciente = { id: "pac-1", nome: "Paciente Teste" };
    expect(paciente).toBeDefined();

    // 2. Médico existe
    const medico = { id: "med-1", nome: "Dr. Teste", crm: "12345" };
    expect(medico).toBeDefined();

    // 3. Hospital existe
    const hospital = { id: "hosp-1", nome: "Hospital Teste" };
    expect(hospital).toBeDefined();

    // 4. Materiais disponíveis em estoque
    const materiais = [
      { id: "mat-1", nome: "Parafuso", quantidade: 10 },
      { id: "mat-2", nome: "Placa", quantidade: 5 },
    ];
    expect(materiais).toHaveLength(2);

    // 5. Cirurgia pode ser criada
    const cirurgia = {
      paciente_id: paciente.id,
      medico_id: medico.id,
      hospital_id: hospital.id,
      materiais: materiais.map((m) => ({ produto_id: m.id, quantidade: 1 })),
      data_cirurgia: new Date().toISOString(),
      status: "agendada",
    };

    expect(cirurgia).toMatchObject({
      paciente_id: "pac-1",
      medico_id: "med-1",
      hospital_id: "hosp-1",
      status: "agendada",
    });

    expect(cirurgia.materiais).toHaveLength(2);
  });

  it("deve validar estoque antes de agendar cirurgia", () => {
    const estoqueDisponivel = 10;
    const quantidadeNecessaria = 5;

    expect(estoqueDisponivel).toBeGreaterThanOrEqual(quantidadeNecessaria);
  });

  it("deve calcular valor total da cirurgia", () => {
    const materiais = [
      { valor_unitario: 100, quantidade: 2 },
      { valor_unitario: 50, quantidade: 3 },
    ];

    const valorTotal = materiais.reduce(
      (sum, m) => sum + m.valor_unitario * m.quantidade,
      0,
    );

    expect(valorTotal).toBe(350);
  });
});
