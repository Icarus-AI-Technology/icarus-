/**
 * Página: EDR Research (Enterprise Deep Research)
 * Interface para pesquisa profunda multi-agente com steering em tempo real
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
} from "@/components/oraclusx-ds";
import {
  Brain,
  Play,
  Pause,
  StopCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Eye,
  BarChart3,
  Network,
  FileText,
  Send,
} from "lucide-react";
import {
  edrService,
  type EDRResearchSession,
  type EDRAgentTask,
} from "@/lib/services/edr.service";
import { useToast } from "@/contexts";

export default function EDRResearch() {
  const { addToast } = useToast();

  // State
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<EDRResearchSession | null>(null);
  const [tasks, setTasks] = useState<EDRAgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steeringText, setSteeringText] = useState("");
  const [showSteering, setShowSteering] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch session status
  const fetchSessionStatus = async (sessionId: string) => {
    try {
      const sessionData = await edrService.getSession(sessionId);
      setSession(sessionData);
      setProgress(
        Math.round((sessionData.currentLoop / sessionData.maxLoops) * 100),
      );

      const tasksData = await edrService.getSessionTasks(sessionId);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  // Connect to SSE stream
  const connectStream = (sessionId: string) => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const streamUrl = `${SUPABASE_URL}/functions/v1/edr-stream?sessionId=${sessionId}`;

    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "update") {
        setProgress(data.session.progress);
        if (data.recentTasks) {
          setTasks((prev) => [...data.recentTasks, ...prev].slice(0, 10));
        }
      }

      if (data.type === "done") {
        eventSource.close();
        fetchSessionStatus(sessionId);
        addToast({
          message: "Research completed!",
          type: "success",
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      addToast({
        message: "Stream connection lost",
        type: "error",
      });
    };

    eventSourceRef.current = eventSource;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Start research
  const handleStartResearch = async () => {
    if (!query.trim()) {
      addToast({
        message: "Please enter a research query",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newSession = await edrService.createSession({
        query,
        llmProvider: "openai",
        maxLoops: 10,
        steeringEnabled: true,
        humanInLoop: true,
      });

      setSession(newSession);
      setShowSteering(true);

      // Connect to stream
      connectStream(newSession.id);

      // Start orchestration via Edge Function
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/edr-orchestrator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: "start",
            sessionId: newSession.id,
            query,
            config: {
              llmProvider: "openai",
              maxLoops: 10,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to start orchestration");
      }

      addToast({
        message: "Research started successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error starting research:", error);
      addToast({
        message: "Failed to start research",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add steering command
  const handleAddSteering = async (commandType: string) => {
    if (!session) return;

    try {
      await edrService.addSteeringCommand(
        session.id,
        commandType as any,
        steeringText || undefined,
      );

      addToast({
        message: `Steering command "${commandType}" added`,
        type: "success",
      });

      setSteeringText("");
    } catch (error) {
      addToast({
        message: "Failed to add steering command",
        type: "error",
      });
    }
  };

  // Stop research
  const handleStopResearch = async () => {
    if (!session) return;

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${SUPABASE_URL}/functions/v1/edr-orchestrator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "stop",
          sessionId: session.id,
        }),
      });

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      addToast({
        message: "Research stopped",
        type: "info",
      });

      fetchSessionStatus(session.id);
    } catch (error) {
      addToast({
        message: "Failed to stop research",
        type: "error",
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: AlertCircle,
      },
      running: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: Loader2,
      },
      completed: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: CheckCircle2,
      },
      failed: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: AlertCircle,
      },
      paused: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: Pause,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}
      >
        <Icon
          size={14}
          className={status === "running" ? "animate-spin" : ""}
        />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-heading flex items-center gap-2">
              <Brain size={28} className="text-purple-500" />
              Enterprise Deep Research (EDR)
            </CardTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              Multi-agent research system with reflection, steering, and
              real-time insights. Powered by Salesforce AI Research.
            </p>
          </CardHeader>
        </Card>

        {/* Research Input */}
        {!session && (
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="query"
                    className="block text-body-md font-medium mb-2"
                  >
                    Research Query
                  </label>
                  <Textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your research question... (e.g., 'What are the latest advances in multi-agent AI systems?')"
                    className="w-full min-h-[120px]"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleStartResearch}
                    disabled={isLoading || !query.trim()}
                    className="min-w-[180px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play size={18} className="mr-2" />
                        Start Research
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Active */}
        {session && (
          <>
            {/* Progress Card */}
            <Card variant="default" padding="lg">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {session.query}
                      </h3>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(session.status)}
                        <span className="text-body-sm text-muted-foreground">
                          Loop {session.currentLoop} / {session.maxLoops}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {session.status === "running" && (
                        <Button
                          onClick={handleStopResearch}
                          variant="outline"
                          size="sm"
                        >
                          <StopCircle size={16} className="mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-body-xs mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tasks */}
              <div className="lg:col-span-2 space-y-4">
                <Card variant="default" padding="md">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Network size={20} />
                      Agent Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {tasks.length === 0 ? (
                        <p className="text-body-sm text-muted-foreground text-center py-8">
                          No tasks yet. Orchestration starting...
                        </p>
                      ) : (
                        tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {task.agentType === "master" && (
                                  <Brain
                                    size={16}
                                    className="text-purple-500"
                                  />
                                )}
                                {task.agentType === "general" && (
                                  <TrendingUp
                                    size={16}
                                    className="text-blue-500"
                                  />
                                )}
                                {task.agentType === "academic" && (
                                  <FileText
                                    size={16}
                                    className="text-green-500"
                                  />
                                )}
                                {task.agentType === "github" && (
                                  <Network
                                    size={16}
                                    className="text-orange-500"
                                  />
                                )}
                                {task.agentType === "visualization" && (
                                  <BarChart3
                                    size={16}
                                    className="text-pink-500"
                                  />
                                )}
                                <span className="text-body-sm font-medium capitalize">
                                  {task.agentType}
                                </span>
                              </div>
                              {getStatusBadge(task.status)}
                            </div>
                            <p className="text-body-xs text-muted-foreground">
                              {task.taskDescription}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Final Report */}
                {session.finalReport && (
                  <Card variant="default" padding="md">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText size={20} />
                        Final Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-body-sm">
                          {session.finalReport}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Steering Panel */}
              <div className="space-y-4">
                <Card variant="default" padding="md">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye size={20} />
                      Human Steering
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Textarea
                        value={steeringText}
                        onChange={(e) => setSteeringText(e.target.value)}
                        placeholder="Add feedback or steering instructions..."
                        className="w-full min-h-[100px]"
                        disabled={session.status !== "running"}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleAddSteering("refine")}
                          size="sm"
                          variant="outline"
                          disabled={session.status !== "running"}
                        >
                          Refine
                        </Button>
                        <Button
                          onClick={() => handleAddSteering("expand")}
                          size="sm"
                          variant="outline"
                          disabled={session.status !== "running"}
                        >
                          Expand
                        </Button>
                        <Button
                          onClick={() => handleAddSteering("focus")}
                          size="sm"
                          variant="outline"
                          disabled={session.status !== "running"}
                        >
                          Focus
                        </Button>
                        <Button
                          onClick={() => handleAddSteering("redirect")}
                          size="sm"
                          variant="outline"
                          disabled={session.status !== "running"}
                        >
                          Redirect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info */}
                <Card variant="default" padding="md">
                  <CardContent>
                    <h4 className="text-body-sm font-semibold mb-2">
                      About EDR
                    </h4>
                    <ul className="text-body-xs space-y-1 text-muted-foreground">
                      <li>• Multi-agent orchestration</li>
                      <li>• Real-time reflection</li>
                      <li>• Human-in-the-loop steering</li>
                      <li>• Automated report generation</li>
                      <li>• Citation management</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
