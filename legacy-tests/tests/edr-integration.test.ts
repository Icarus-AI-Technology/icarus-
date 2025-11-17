/**
 * Integration Tests for EDR (Enterprise Deep Research)
 * Tests all components: Migration, Service, Edge Functions, Frontend
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { edrService } from "../src/lib/services/edr.service";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

describe("EDR Integration Tests", () => {
  let testSessionId: string;
  let testUserId: string;
  let testOrgId: string;

  beforeAll(async () => {
    // Create test user and organization
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signUp({
      email: "test-edr@icarus.com",
      password: "testpassword123",
    });

    if (authError) {
      console.warn("Auth error (user might already exist):", authError);
    }

    testUserId = user?.id || "";

    // Create test organization
    const { data: org } = await supabase
      .from("organizations")
      .insert({
        name: "EDR Test Organization",
        slug: "edr-test-org",
      })
      .select()
      .single();

    testOrgId = org?.id || "";

    // Link user to organization
    await supabase.from("user_organizations").insert({
      user_id: testUserId,
      organization_id: testOrgId,
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testSessionId) {
      await supabase
        .from("edr_research_sessions")
        .delete()
        .eq("id", testSessionId);
    }

    if (testOrgId) {
      await supabase.from("organizations").delete().eq("id", testOrgId);
    }
  });

  describe("Database Schema", () => {
    it("should have all EDR tables created", async () => {
      const tables = [
        "edr_research_sessions",
        "edr_agent_tasks",
        "edr_search_results",
        "edr_reflection_logs",
        "edr_steering_commands",
        "edr_visualizations",
        "edr_citations",
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table).select("id").limit(1);
        expect(error).toBeNull();
      }
    });

    it("should have EDR views created", async () => {
      const { error } = await supabase
        .from("edr_session_summary")
        .select("*")
        .limit(1);

      expect(error).toBeNull();
    });
  });

  describe("EDR Service", () => {
    it("should create a new research session", async () => {
      const session = await edrService.createSession({
        query: "Test query: What are the latest advances in AI?",
        llmProvider: "openai",
        maxLoops: 5,
        steeringEnabled: true,
      });

      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.query).toBe(
        "Test query: What are the latest advances in AI?",
      );
      expect(session.status).toBe("pending");

      testSessionId = session.id;
    });

    it("should get session by ID", async () => {
      const session = await edrService.getSession(testSessionId);

      expect(session).toBeDefined();
      expect(session.id).toBe(testSessionId);
    });

    it("should list sessions", async () => {
      const sessions = await edrService.listSessions(10, 0);

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
    });

    it("should update session status", async () => {
      await edrService.updateSessionStatus(testSessionId, "running");

      const session = await edrService.getSession(testSessionId);
      expect(session.status).toBe("running");
    });

    it("should create agent tasks", async () => {
      const task = await edrService.createTask({
        sessionId: testSessionId,
        agentType: "master",
        taskDescription: "Master planning task",
        taskQuery: "Decompose research query",
        priority: 10,
      });

      expect(task).toBeDefined();
      expect(task.id).toBeTruthy();
      expect(task.agentType).toBe("master");
    });

    it("should get session tasks", async () => {
      const tasks = await edrService.getSessionTasks(testSessionId);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it("should create reflection log", async () => {
      const reflection = await edrService.createReflection({
        sessionId: testSessionId,
        loopNumber: 1,
        reflectionType: "gap_detection",
        knowledgeGaps: ["Need more academic sources"],
        qualityScore: 0.7,
        suggestedActions: ["Search academic databases"],
      });

      expect(reflection).toBeDefined();
      expect(reflection.id).toBeTruthy();
      expect(reflection.loopNumber).toBe(1);
    });

    it("should add steering command", async () => {
      const command = await edrService.addSteeringCommand(
        testSessionId,
        "refine",
        "Focus more on recent research",
        { year: "2024" },
      );

      expect(command).toBeDefined();
      expect(command.id).toBeTruthy();
      expect(command.commandType).toBe("refine");
    });

    it("should save final report", async () => {
      const report = "# Research Report\n\nThis is a test report.";

      await edrService.saveFinalReport(testSessionId, report);

      const session = await edrService.getSession(testSessionId);
      expect(session.finalReport).toBe(report);
      expect(session.status).toBe("completed");
    });
  });

  describe("Edge Functions", () => {
    it("should start research via orchestrator", async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/edr-orchestrator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            action: "start",
            query: "Test orchestration query",
            config: {
              llmProvider: "openai",
              maxLoops: 3,
            },
          }),
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.sessionId).toBeTruthy();
    });

    it("should get session status via orchestrator", async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/edr-orchestrator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            action: "status",
            sessionId: testSessionId,
          }),
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.session).toBeDefined();
      expect(data.session.id).toBe(testSessionId);
    });
  });

  describe("Database Functions", () => {
    it("should create session via stored procedure", async () => {
      const { data, error } = await supabase.rpc("create_edr_session", {
        p_query: "Test query via RPC",
        p_llm_provider: "openai",
        p_max_loops: 5,
        p_steering_enabled: true,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
    });
  });

  describe("RLS Policies", () => {
    it("should enforce row level security", async () => {
      // Try to access session from different user
      const { data: otherUser } = await supabase.auth.signUp({
        email: "other-user@icarus.com",
        password: "testpassword123",
      });

      const otherSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      await otherSupabase.auth.setSession({
        access_token: "fake-token",
        refresh_token: "fake-refresh",
      } as any);

      const { data, error } = await otherSupabase
        .from("edr_research_sessions")
        .select("*")
        .eq("id", testSessionId)
        .single();

      // Should fail due to RLS
      expect(data).toBeNull();
    });
  });

  describe("Performance", () => {
    it("should handle concurrent session creation", async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        edrService.createSession({
          query: `Concurrent test query ${i}`,
          maxLoops: 3,
        }),
      );

      const sessions = await Promise.all(promises);

      expect(sessions.length).toBe(5);
      sessions.forEach((session) => {
        expect(session.id).toBeTruthy();
      });
    });

    it("should handle large task lists", async () => {
      const taskPromises = Array.from({ length: 20 }, (_, i) =>
        edrService.createTask({
          sessionId: testSessionId,
          agentType: "general",
          taskDescription: `Task ${i}`,
          priority: i,
        }),
      );

      const tasks = await Promise.all(taskPromises);
      expect(tasks.length).toBe(20);
    });
  });
});
