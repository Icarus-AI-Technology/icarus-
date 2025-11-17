import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as MlService from "../MlService";

const mock = new MockAdapter(axios);

beforeEach(() => {
  mock.reset();
});

describe("MlService", () => {
  const baseUrl = process.env.VITE_ML_API_URL || "http://localhost:8000";

  it("calls LLM endpoint with prompt", async () => {
    const payload = { message: "hello" };
    mock.onPost(`${baseUrl}/llm/mistral`).reply(200, payload);

    const result = await MlService.generateLLM("hello");

    expect(result).toEqual(payload);
    expect(mock.history.post[0].data).toContain("hello");
  });

  it("calls finance sentiment endpoint", async () => {
    mock.onPost(`${baseUrl}/nlp/finance`).reply(200, { sentiment: "positive" });

    const result = await MlService.analyzeFinance("fluxo de caixa");

    expect(result.sentiment).toBe("positive");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({
      text: "fluxo de caixa",
      task: "sentiment",
    });
  });

  it("calls optimizer endpoint", async () => {
    mock
      .onPost(`${baseUrl}/optimizer/or-tools`)
      .reply(200, { optimum: [1, 2, 3] });

    const result = await MlService.optimizeObjective([1, 2, 3]);

    expect(result.optimum).toEqual([1, 2, 3]);
  });

  it("performs vector search", async () => {
    mock
      .onPost(`${baseUrl}/vector/faiss/search`)
      .reply(200, { ids: ["a"], scores: [0.95] });

    const response = await MlService.searchVector([0.1, 0.2], 1);

    expect(response.ids).toEqual(["a"]);
    expect(response.scores[0]).toBeCloseTo(0.95);
  });

  it("adds vectors", async () => {
    mock.onPost(`${baseUrl}/vector/faiss/add`).reply(200, { count: 1 });

    const response = await MlService.addVectors(["id1"], [[0.1, 0.2]]);

    expect(response.count).toBe(1);
  });

  it("clears vectors", async () => {
    mock
      .onPost(`${baseUrl}/vector/faiss/clear`)
      .reply(200, { status: "cleared" });

    const response = await MlService.clearVectors();

    expect(response.status).toBe("cleared");
  });

  it("forecasts series", async () => {
    mock
      .onPost(`${baseUrl}/timeseries/prophet`)
      .reply(200, {
        forecast: [1, 2],
        timestamps: ["2025-10-20", "2025-10-21"],
      });

    const response = await MlService.forecastSeries(["2025-10-20"], [10], 2);

    expect(response.forecast).toHaveLength(2);
  });

  it("persists vectors via configured endpoint", async () => {
    const endpoint = "https://example.com/api/ml/vectors";
    mock.onPost(endpoint).reply(200, { status: "ok" });

    const result = await MlService.persistVectors(
      [
        {
          externalId: "doc-1",
          module: "cirurgias",
          embedding: [0.1, 0.2],
          metadata: { idioma: "pt-BR" },
        },
      ],
      endpoint,
    );

    expect(result.status).toBe("ok");
    expect(JSON.parse(mock.history.post.at(-1)!.data)).toEqual({
      vectors: [
        {
          external_id: "doc-1",
          module: "cirurgias",
          embedding: [0.1, 0.2],
          metadata: { idioma: "pt-BR" },
        },
      ],
    });
  });

  it("clears persisted vectors", async () => {
    const endpoint = "https://example.com/api/ml/vectors";
    mock.onDelete(endpoint).reply(200, { status: "cleared" });

    const result = await MlService.clearPersistedVectors(endpoint);

    expect(result.status).toBe("cleared");
  });

  it("lists persisted vectors", async () => {
    const endpoint = "https://example.com/api/ml/vectors";
    mock.onGet(`${endpoint}?module=cirurgias`).reply(200, { vectors: [] });

    const result = await MlService.listPersistedVectors(
      { module: "cirurgias" },
      endpoint,
    );

    expect(result.vectors).toEqual([]);
  });
});
