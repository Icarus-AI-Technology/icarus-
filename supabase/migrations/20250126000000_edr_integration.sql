-- ============================================
-- Migration: EDR (Enterprise Deep Research) Integration
-- Version: 1.0.0
-- Date: 2025-01-26
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. EDR Research Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS edr_research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Research metadata
  query TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  max_loops INTEGER DEFAULT 10 CHECK (max_loops > 0 AND max_loops <= 50),
  current_loop INTEGER DEFAULT 0,
  
  -- Configuration
  llm_provider VARCHAR(50) DEFAULT 'openai' CHECK (llm_provider IN ('openai', 'anthropic', 'google', 'groq', 'sambanova')),
  llm_model VARCHAR(100),
  search_provider VARCHAR(50) DEFAULT 'tavily' CHECK (search_provider IN ('tavily', 'brave', 'serper')),
  
  -- Steering & control
  steering_enabled BOOLEAN DEFAULT false,
  human_in_loop BOOLEAN DEFAULT false,
  
  -- Results
  final_report TEXT,
  report_url TEXT,
  visualization_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit & metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_loop_range CHECK (current_loop >= 0 AND current_loop <= max_loops)
);

-- Indexes for performance
CREATE INDEX idx_edr_sessions_org ON edr_research_sessions(organization_id);
CREATE INDEX idx_edr_sessions_user ON edr_research_sessions(user_id);
CREATE INDEX idx_edr_sessions_status ON edr_research_sessions(status);
CREATE INDEX idx_edr_sessions_created ON edr_research_sessions(created_at DESC);
CREATE INDEX idx_edr_sessions_provider ON edr_research_sessions(llm_provider);

-- RLS policies
ALTER TABLE edr_research_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's research sessions"
  ON edr_research_sessions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create research sessions"
  ON edr_research_sessions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sessions"
  ON edr_research_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_edr_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER edr_sessions_updated_at
  BEFORE UPDATE ON edr_research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_edr_sessions_updated_at();

-- ============================================
-- 2. EDR Agent Tasks (Decomposition)
-- ============================================
CREATE TABLE IF NOT EXISTS edr_agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  
  -- Task hierarchy
  parent_task_id UUID REFERENCES edr_agent_tasks(id) ON DELETE CASCADE,
  task_order INTEGER DEFAULT 0,
  depth_level INTEGER DEFAULT 0,
  
  -- Task details
  agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('master', 'general', 'academic', 'github', 'linkedin', 'visualization', 'reflection')),
  task_description TEXT NOT NULL,
  task_query TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'cancelled')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Results
  result TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Execution metrics
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_edr_tasks_session ON edr_agent_tasks(session_id);
CREATE INDEX idx_edr_tasks_status ON edr_agent_tasks(status);
CREATE INDEX idx_edr_tasks_parent ON edr_agent_tasks(parent_task_id);
CREATE INDEX idx_edr_tasks_agent ON edr_agent_tasks(agent_type);
CREATE INDEX idx_edr_tasks_priority ON edr_agent_tasks(priority DESC);
CREATE INDEX idx_edr_tasks_created ON edr_agent_tasks(created_at);

-- ============================================
-- 3. EDR Search Results (Cache)
-- ============================================
CREATE TABLE IF NOT EXISTS edr_search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES edr_agent_tasks(id) ON DELETE CASCADE,
  
  -- Search metadata
  search_type VARCHAR(50) CHECK (search_type IN ('general', 'academic', 'github', 'linkedin', 'documentation')),
  query TEXT NOT NULL,
  query_hash TEXT, -- MD5 hash for deduplication
  
  -- Results
  url TEXT,
  title TEXT,
  snippet TEXT,
  content TEXT,
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
  
  -- Source metadata
  source_type VARCHAR(50) CHECK (source_type IN ('web', 'paper', 'repo', 'profile', 'documentation', 'news')),
  author TEXT,
  published_date DATE,
  
  -- Vector embedding for similarity (OpenAI ada-002: 1536 dimensions)
  embedding vector(1536),
  
  -- Cache control
  cached BOOLEAN DEFAULT true,
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_edr_search_task ON edr_search_results(task_id);
CREATE INDEX idx_edr_search_type ON edr_search_results(search_type);
CREATE INDEX idx_edr_search_hash ON edr_search_results(query_hash);
CREATE INDEX idx_edr_search_cached ON edr_search_results(cached, cache_expires_at);

-- Vector similarity index (IVFFlat for faster approximate nearest neighbor search)
CREATE INDEX idx_edr_search_embedding ON edr_search_results 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- 4. EDR Reflection Logs
-- ============================================
CREATE TABLE IF NOT EXISTS edr_reflection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  
  -- Reflection metadata
  loop_number INTEGER NOT NULL,
  reflection_type VARCHAR(50) CHECK (reflection_type IN ('gap_detection', 'quality_assessment', 'direction_update', 'synthesis')),
  
  -- Analysis
  knowledge_gaps JSONB DEFAULT '[]'::jsonb,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  coverage_score DECIMAL(3,2) CHECK (coverage_score >= 0 AND coverage_score <= 1),
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Reasoning
  reasoning TEXT,
  
  -- Human feedback
  human_feedback TEXT,
  human_steering JSONB,
  feedback_applied BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_edr_reflection_session ON edr_reflection_logs(session_id);
CREATE INDEX idx_edr_reflection_loop ON edr_reflection_logs(loop_number);
CREATE INDEX idx_edr_reflection_type ON edr_reflection_logs(reflection_type);
CREATE INDEX idx_edr_reflection_created ON edr_reflection_logs(created_at DESC);

-- ============================================
-- 5. EDR Steering Commands
-- ============================================
CREATE TABLE IF NOT EXISTS edr_steering_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Command
  command_type VARCHAR(50) NOT NULL CHECK (command_type IN ('pause', 'resume', 'refine', 'expand', 'focus', 'stop', 'redirect', 'prioritize')),
  command_text TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'expired')),
  applied_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Impact
  impact_summary TEXT,
  tasks_affected JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_edr_steering_session ON edr_steering_commands(session_id);
CREATE INDEX idx_edr_steering_user ON edr_steering_commands(user_id);
CREATE INDEX idx_edr_steering_status ON edr_steering_commands(status);
CREATE INDEX idx_edr_steering_type ON edr_steering_commands(command_type);
CREATE INDEX idx_edr_steering_created ON edr_steering_commands(created_at DESC);

-- ============================================
-- 6. EDR Visualizations
-- ============================================
CREATE TABLE IF NOT EXISTS edr_visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  
  -- Visualization metadata
  viz_type VARCHAR(50) CHECK (viz_type IN ('chart', 'graph', 'table', 'network', 'timeline', 'heatmap', 'treemap')),
  title TEXT,
  description TEXT,
  
  -- Data
  viz_data JSONB NOT NULL,
  viz_config JSONB DEFAULT '{}'::jsonb,
  
  -- Generated assets
  image_url TEXT,
  svg_data TEXT,
  
  -- Display
  order_position INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_edr_viz_session ON edr_visualizations(session_id);
CREATE INDEX idx_edr_viz_type ON edr_visualizations(viz_type);
CREATE INDEX idx_edr_viz_featured ON edr_visualizations(is_featured);
CREATE INDEX idx_edr_viz_order ON edr_visualizations(order_position);

-- Trigger for updated_at
CREATE TRIGGER edr_viz_updated_at
  BEFORE UPDATE ON edr_visualizations
  FOR EACH ROW
  EXECUTE FUNCTION update_edr_sessions_updated_at();

-- ============================================
-- 7. EDR Citations & References
-- ============================================
CREATE TABLE IF NOT EXISTS edr_citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  search_result_id UUID REFERENCES edr_search_results(id) ON DELETE SET NULL,
  
  -- Citation details
  citation_text TEXT NOT NULL,
  citation_context TEXT,
  url TEXT,
  title TEXT,
  
  -- Source metadata
  author TEXT,
  published_date DATE,
  source_type VARCHAR(50),
  
  -- Citation metrics
  relevance_score DECIMAL(3,2),
  used_in_report BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_edr_citations_session ON edr_citations(session_id);
CREATE INDEX idx_edr_citations_search ON edr_citations(search_result_id);
CREATE INDEX idx_edr_citations_used ON edr_citations(used_in_report);

-- ============================================
-- 8. Views for Analytics
-- ============================================

-- Research session summary
CREATE OR REPLACE VIEW edr_session_summary AS
SELECT 
  s.id,
  s.query,
  s.status,
  s.current_loop,
  s.max_loops,
  s.llm_provider,
  s.created_at,
  s.completed_at,
  EXTRACT(EPOCH FROM (COALESCE(s.completed_at, NOW()) - s.created_at)) AS duration_seconds,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT r.id) AS total_reflections,
  COUNT(DISTINCT v.id) AS total_visualizations,
  AVG(r.quality_score) AS avg_quality_score
FROM edr_research_sessions s
LEFT JOIN edr_agent_tasks t ON t.session_id = s.id
LEFT JOIN edr_reflection_logs r ON r.session_id = s.id
LEFT JOIN edr_visualizations v ON v.session_id = s.id
GROUP BY s.id;

-- Agent performance metrics
CREATE OR REPLACE VIEW edr_agent_performance AS
SELECT 
  agent_type,
  COUNT(*) AS total_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_tasks,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed_tasks,
  AVG(duration_ms) AS avg_duration_ms,
  AVG(confidence_score) AS avg_confidence
FROM edr_agent_tasks
GROUP BY agent_type;

-- ============================================
-- 9. Functions for EDR Operations
-- ============================================

-- Function to create a new research session
CREATE OR REPLACE FUNCTION create_edr_session(
  p_query TEXT,
  p_llm_provider VARCHAR(50) DEFAULT 'openai',
  p_max_loops INTEGER DEFAULT 10,
  p_steering_enabled BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User not associated with any organization';
  END IF;
  
  -- Create session
  INSERT INTO edr_research_sessions (
    query,
    llm_provider,
    max_loops,
    steering_enabled,
    organization_id,
    user_id,
    status
  ) VALUES (
    p_query,
    p_llm_provider,
    p_max_loops,
    p_steering_enabled,
    v_org_id,
    auth.uid(),
    'pending'
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add steering command
CREATE OR REPLACE FUNCTION add_steering_command(
  p_session_id UUID,
  p_command_type VARCHAR(50),
  p_command_text TEXT DEFAULT NULL,
  p_parameters JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_command_id UUID;
BEGIN
  -- Verify user has access to session
  IF NOT EXISTS (
    SELECT 1 FROM edr_research_sessions
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to session';
  END IF;
  
  -- Create steering command
  INSERT INTO edr_steering_commands (
    session_id,
    user_id,
    command_type,
    command_text,
    parameters,
    status
  ) VALUES (
    p_session_id,
    auth.uid(),
    p_command_type,
    p_command_text,
    p_parameters,
    'pending'
  )
  RETURNING id INTO v_command_id;
  
  RETURN v_command_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. Grants
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON edr_research_sessions TO authenticated;
GRANT SELECT, INSERT ON edr_agent_tasks TO authenticated;
GRANT SELECT ON edr_search_results TO authenticated;
GRANT SELECT, INSERT ON edr_reflection_logs TO authenticated;
GRANT SELECT, INSERT ON edr_steering_commands TO authenticated;
GRANT SELECT ON edr_visualizations TO authenticated;
GRANT SELECT ON edr_citations TO authenticated;

-- Grant access to views
GRANT SELECT ON edr_session_summary TO authenticated;
GRANT SELECT ON edr_agent_performance TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_edr_session TO authenticated;
GRANT EXECUTE ON FUNCTION add_steering_command TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================

COMMENT ON TABLE edr_research_sessions IS 'Enterprise Deep Research: Research sessions with multi-agent orchestration';
COMMENT ON TABLE edr_agent_tasks IS 'EDR: Decomposed tasks for specialized agents (Master, General, Academic, GitHub, LinkedIn, Visualization)';
COMMENT ON TABLE edr_search_results IS 'EDR: Cached search results with vector embeddings for similarity search';
COMMENT ON TABLE edr_reflection_logs IS 'EDR: Reflection mechanism for knowledge gap detection and quality assessment';
COMMENT ON TABLE edr_steering_commands IS 'EDR: Human-in-the-loop steering commands for real-time research refinement';
COMMENT ON TABLE edr_visualizations IS 'EDR: Generated visualizations and data-driven insights';
COMMENT ON TABLE edr_citations IS 'EDR: Citations and references used in research reports';

