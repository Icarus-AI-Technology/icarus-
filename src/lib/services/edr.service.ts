/**
 * Enterprise Deep Research (EDR) Service
 * Multi-agent research system with reflection and steering
 *
 * Based on: https://github.com/SalesforceAIResearch/enterprise-deep-research
 */

import { supabase } from "@/lib/supabase";

// ============================================
// Types & Interfaces
// ============================================

export type EDRStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "paused";
export type EDRAgentType =
  | "master"
  | "general"
  | "academic"
  | "github"
  | "linkedin"
  | "visualization"
  | "reflection";
export type EDRProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "sambanova";
export type EDRSearchProvider = "tavily" | "brave" | "serper";

export interface EDRResearchConfig {
  query: string;
  llmProvider?: EDRProvider;
  llmModel?: string;
  maxLoops?: number;
  steeringEnabled?: boolean;
  humanInLoop?: boolean;
  searchProvider?: EDRSearchProvider;
}

export interface EDRResearchSession {
  id: string;
  organizationId: string;
  userId: string;
  query: string;
  status: EDRStatus;
  maxLoops: number;
  currentLoop: number;
  llmProvider: EDRProvider;
  llmModel?: string;
  searchProvider: EDRSearchProvider;
  steeringEnabled: boolean;
  humanInLoop: boolean;
  finalReport?: string;
  reportUrl?: string;
  visualizationData?: any;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  metadata: Record<string, any>;
}

export interface EDRAgentTask {
  id: string;
  sessionId: string;
  parentTaskId?: string;
  taskOrder: number;
  depthLevel: number;
  agentType: EDRAgentType;
  taskDescription: string;
  taskQuery?: string;
  status:
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "skipped"
    | "cancelled";
  priority: number;
  result?: string;
  sources?: any[];
  confidenceScore?: number;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  retryCount: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface EDRReflection {
  id: string;
  sessionId: string;
  loopNumber: number;
  reflectionType:
    | "gap_detection"
    | "quality_assessment"
    | "direction_update"
    | "synthesis";
  knowledgeGaps: string[];
  qualityScore?: number;
  coverageScore?: number;
  suggestedActions: string[];
  reasoning?: string;
  humanFeedback?: string;
  humanSteering?: any;
  feedbackApplied: boolean;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface EDRSteeringCommand {
  id: string;
  sessionId: string;
  userId: string;
  commandType:
    | "pause"
    | "resume"
    | "refine"
    | "expand"
    | "focus"
    | "stop"
    | "redirect"
    | "prioritize";
  commandText?: string;
  parameters: Record<string, any>;
  status: "pending" | "applied" | "rejected" | "expired";
  appliedAt?: string;
  rejectionReason?: string;
  impactSummary?: string;
  tasksAffected: string[];
  createdAt: string;
  expiresAt?: string;
  metadata: Record<string, any>;
}

export interface EDRVisualization {
  id: string;
  sessionId: string;
  vizType:
    | "chart"
    | "graph"
    | "table"
    | "network"
    | "timeline"
    | "heatmap"
    | "treemap";
  title?: string;
  description?: string;
  vizData: any;
  vizConfig: Record<string, any>;
  imageUrl?: string;
  svgData?: string;
  orderPosition: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

// ============================================
// EDR Service Class
// ============================================

export class EDRService {
  private static instance: EDRService;

  private constructor() {}

  public static getInstance(): EDRService {
    if (!EDRService.instance) {
      EDRService.instance = new EDRService();
    }
    return EDRService.instance;
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Create a new EDR research session
   */
  async createSession(config: EDRResearchConfig): Promise<EDRResearchSession> {
    const { data, error } = await supabase.rpc("create_edr_session", {
      p_query: config.query,
      p_llm_provider: config.llmProvider || "openai",
      p_max_loops: config.maxLoops || 10,
      p_steering_enabled: config.steeringEnabled || false,
    });

    if (error) {
      console.error("Error creating EDR session:", error);
      throw new Error(`Failed to create EDR session: ${error.message}`);
    }

    // Fetch the created session
    return await this.getSession(data);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<EDRResearchSession> {
    const { data, error } = await supabase
      .from("edr_research_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return this.mapSessionFromDB(data);
  }

  /**
   * List user's sessions
   */
  async listSessions(limit = 20, offset = 0): Promise<EDRResearchSession[]> {
    const { data, error } = await supabase
      .from("edr_research_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }

    return data.map(this.mapSessionFromDB);
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: EDRStatus,
  ): Promise<void> {
    const updates: any = { status };

    if (status === "running" && !updates.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === "completed" || status === "failed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("edr_research_sessions")
      .update(updates)
      .eq("id", sessionId);

    if (error) {
      throw new Error(`Failed to update session status: ${error.message}`);
    }
  }

  /**
   * Save final report
   */
  async saveFinalReport(
    sessionId: string,
    report: string,
    visualizations?: any,
  ): Promise<void> {
    const { error } = await supabase
      .from("edr_research_sessions")
      .update({
        final_report: report,
        visualization_data: visualizations,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      throw new Error(`Failed to save final report: ${error.message}`);
    }
  }

  // ============================================
  // Task Management
  // ============================================

  /**
   * Create agent task
   */
  async createTask(task: Partial<EDRAgentTask>): Promise<EDRAgentTask> {
    const { data, error } = await supabase
      .from("edr_agent_tasks")
      .insert({
        session_id: task.sessionId,
        parent_task_id: task.parentTaskId,
        task_order: task.taskOrder || 0,
        depth_level: task.depthLevel || 0,
        agent_type: task.agentType,
        task_description: task.taskDescription,
        task_query: task.taskQuery,
        priority: task.priority || 5,
        status: "pending",
        metadata: task.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return this.mapTaskFromDB(data);
  }

  /**
   * Get tasks for session
   */
  async getSessionTasks(sessionId: string): Promise<EDRAgentTask[]> {
    const { data, error } = await supabase
      .from("edr_agent_tasks")
      .select("*")
      .eq("session_id", sessionId)
      .order("task_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data.map(this.mapTaskFromDB);
  }

  /**
   * Update task status and result
   */
  async updateTask(
    taskId: string,
    updates: Partial<EDRAgentTask>,
  ): Promise<void> {
    const dbUpdates: any = {};

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.result) dbUpdates.result = updates.result;
    if (updates.sources) dbUpdates.sources = updates.sources;
    if (updates.confidenceScore !== undefined) {
      dbUpdates.confidence_score = updates.confidenceScore;
    }
    if (updates.durationMs) dbUpdates.duration_ms = updates.durationMs;

    if (updates.status === "running") {
      dbUpdates.started_at = new Date().toISOString();
    }

    if (updates.status === "completed" || updates.status === "failed") {
      dbUpdates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("edr_agent_tasks")
      .update(dbUpdates)
      .eq("id", taskId);

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  // ============================================
  // Reflection Management
  // ============================================

  /**
   * Create reflection log
   */
  async createReflection(
    reflection: Partial<EDRReflection>,
  ): Promise<EDRReflection> {
    const { data, error } = await supabase
      .from("edr_reflection_logs")
      .insert({
        session_id: reflection.sessionId,
        loop_number: reflection.loopNumber,
        reflection_type: reflection.reflectionType,
        knowledge_gaps: reflection.knowledgeGaps || [],
        quality_score: reflection.qualityScore,
        coverage_score: reflection.coverageScore,
        suggested_actions: reflection.suggestedActions || [],
        reasoning: reflection.reasoning,
        metadata: reflection.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reflection: ${error.message}`);
    }

    return this.mapReflectionFromDB(data);
  }

  /**
   * Get reflections for session
   */
  async getSessionReflections(sessionId: string): Promise<EDRReflection[]> {
    const { data, error } = await supabase
      .from("edr_reflection_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("loop_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch reflections: ${error.message}`);
    }

    return data.map(this.mapReflectionFromDB);
  }

  // ============================================
  // Steering Commands
  // ============================================

  /**
   * Add steering command
   */
  async addSteeringCommand(
    sessionId: string,
    commandType: EDRSteeringCommand["commandType"],
    commandText?: string,
    parameters?: Record<string, any>,
  ): Promise<EDRSteeringCommand> {
    const { data, error } = await supabase.rpc("add_steering_command", {
      p_session_id: sessionId,
      p_command_type: commandType,
      p_command_text: commandText,
      p_parameters: parameters || {},
    });

    if (error) {
      throw new Error(`Failed to add steering command: ${error.message}`);
    }

    // Fetch the created command
    const { data: command, error: fetchError } = await supabase
      .from("edr_steering_commands")
      .select("*")
      .eq("id", data)
      .single();

    if (fetchError) {
      throw new Error(
        `Failed to fetch steering command: ${fetchError.message}`,
      );
    }

    return this.mapSteeringFromDB(command);
  }

  /**
   * Get pending steering commands
   */
  async getPendingCommands(sessionId: string): Promise<EDRSteeringCommand[]> {
    const { data, error } = await supabase
      .from("edr_steering_commands")
      .select("*")
      .eq("session_id", sessionId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch steering commands: ${error.message}`);
    }

    return data.map(this.mapSteeringFromDB);
  }

  /**
   * Apply steering command
   */
  async applyCommand(commandId: string, impactSummary?: string): Promise<void> {
    const { error } = await supabase
      .from("edr_steering_commands")
      .update({
        status: "applied",
        applied_at: new Date().toISOString(),
        impact_summary: impactSummary,
      })
      .eq("id", commandId);

    if (error) {
      throw new Error(`Failed to apply steering command: ${error.message}`);
    }
  }

  // ============================================
  // Visualization Management
  // ============================================

  /**
   * Create visualization
   */
  async createVisualization(
    viz: Partial<EDRVisualization>,
  ): Promise<EDRVisualization> {
    const { data, error } = await supabase
      .from("edr_visualizations")
      .insert({
        session_id: viz.sessionId,
        viz_type: viz.vizType,
        title: viz.title,
        description: viz.description,
        viz_data: viz.vizData,
        viz_config: viz.vizConfig || {},
        image_url: viz.imageUrl,
        svg_data: viz.svgData,
        order_position: viz.orderPosition || 0,
        is_featured: viz.isFeatured || false,
        metadata: viz.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create visualization: ${error.message}`);
    }

    return this.mapVisualizationFromDB(data);
  }

  /**
   * Get visualizations for session
   */
  async getSessionVisualizations(
    sessionId: string,
  ): Promise<EDRVisualization[]> {
    const { data, error } = await supabase
      .from("edr_visualizations")
      .select("*")
      .eq("session_id", sessionId)
      .order("order_position", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch visualizations: ${error.message}`);
    }

    return data.map(this.mapVisualizationFromDB);
  }

  // ============================================
  // Helper Methods
  // ============================================

  private mapSessionFromDB(data: any): EDRResearchSession {
    return {
      id: data.id,
      organizationId: data.organization_id,
      userId: data.user_id,
      query: data.query,
      status: data.status,
      maxLoops: data.max_loops,
      currentLoop: data.current_loop,
      llmProvider: data.llm_provider,
      llmModel: data.llm_model,
      searchProvider: data.search_provider,
      steeringEnabled: data.steering_enabled,
      humanInLoop: data.human_in_loop,
      finalReport: data.final_report,
      reportUrl: data.report_url,
      visualizationData: data.visualization_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      metadata: data.metadata,
    };
  }

  private mapTaskFromDB(data: any): EDRAgentTask {
    return {
      id: data.id,
      sessionId: data.session_id,
      parentTaskId: data.parent_task_id,
      taskOrder: data.task_order,
      depthLevel: data.depth_level,
      agentType: data.agent_type,
      taskDescription: data.task_description,
      taskQuery: data.task_query,
      status: data.status,
      priority: data.priority,
      result: data.result,
      sources: data.sources,
      confidenceScore: data.confidence_score,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      durationMs: data.duration_ms,
      retryCount: data.retry_count,
      metadata: data.metadata,
      createdAt: data.created_at,
    };
  }

  private mapReflectionFromDB(data: any): EDRReflection {
    return {
      id: data.id,
      sessionId: data.session_id,
      loopNumber: data.loop_number,
      reflectionType: data.reflection_type,
      knowledgeGaps: data.knowledge_gaps,
      qualityScore: data.quality_score,
      coverageScore: data.coverage_score,
      suggestedActions: data.suggested_actions,
      reasoning: data.reasoning,
      humanFeedback: data.human_feedback,
      humanSteering: data.human_steering,
      feedbackApplied: data.feedback_applied,
      createdAt: data.created_at,
      metadata: data.metadata,
    };
  }

  private mapSteeringFromDB(data: any): EDRSteeringCommand {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      commandType: data.command_type,
      commandText: data.command_text,
      parameters: data.parameters,
      status: data.status,
      appliedAt: data.applied_at,
      rejectionReason: data.rejection_reason,
      impactSummary: data.impact_summary,
      tasksAffected: data.tasks_affected,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      metadata: data.metadata,
    };
  }

  private mapVisualizationFromDB(data: any): EDRVisualization {
    return {
      id: data.id,
      sessionId: data.session_id,
      vizType: data.viz_type,
      title: data.title,
      description: data.description,
      vizData: data.viz_data,
      vizConfig: data.viz_config,
      imageUrl: data.image_url,
      svgData: data.svg_data,
      orderPosition: data.order_position,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      metadata: data.metadata,
    };
  }
}

// Export singleton instance
export const edrService = EDRService.getInstance();
