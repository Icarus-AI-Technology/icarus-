-- ============================================
-- ICARUS-PRO: Master Migration
-- Complete Database Setup for Supabase
-- Version: 5.0.0
-- Date: 2025-01-26
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- 1. ORGANIZATIONS & USERS
-- ============================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) DEFAULT 'hospital' CHECK (type IN ('hospital', 'distributor', 'manufacturer', 'clinic')),
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User Organizations (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_active ON organizations(active);
CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);
CREATE INDEX idx_profiles_id ON profiles(id);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- 2. PERMISSIONS & RBAC
-- ============================================

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id, organization_id)
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  resource VARCHAR(100),
  action VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CONTACT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_email ON contact_messages(email);

-- RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'support')
    )
  );

-- ============================================
-- 4. ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_org ON activity_logs(organization_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_resource ON activity_logs(resource, resource_id);

-- RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's activity logs"
  ON activity_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_org ON notifications(organization_id);
CREATE INDEX idx_notif_read ON notifications(read);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);
CREATE INDEX idx_notif_priority ON notifications(priority);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- 6. FEATURE FLAGS
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users UUID[],
  target_organizations UUID[],
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flags_key ON feature_flags(key);
CREATE INDEX idx_flags_enabled ON feature_flags(enabled);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled feature flags"
  ON feature_flags FOR SELECT
  USING (enabled = true);

-- ============================================
-- 7. SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON system_settings(key);
CREATE INDEX idx_settings_category ON system_settings(category);
CREATE INDEX idx_settings_public ON system_settings(is_public);

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings"
  ON system_settings FOR SELECT
  USING (is_public = true);

-- ============================================
-- 8. AUDIT TRAIL
-- ============================================

CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_table ON audit_trail(table_name);
CREATE INDEX idx_audit_record ON audit_trail(record_id);
CREATE INDEX idx_audit_operation ON audit_trail(operation);
CREATE INDEX idx_audit_user ON audit_trail(user_id);
CREATE INDEX idx_audit_org ON audit_trail(organization_id);
CREATE INDEX idx_audit_created ON audit_trail(created_at DESC);

-- RLS
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit trail for their org"
  ON audit_trail FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 9. STORAGE BUCKETS SETUP
-- ============================================

-- Create storage buckets (execute via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('documentos-dpo', 'documentos-dpo', false),
--   ('notas-fiscais', 'notas-fiscais', false),
--   ('imagens-produtos', 'imagens-produtos', true),
--   ('relatorios', 'relatorios', false),
--   ('certificados', 'certificados', false),
--   ('avatares', 'avatares', true);

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contact_messages_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_action VARCHAR,
  p_resource VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's primary organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = auth.uid() AND is_primary = true
  LIMIT 1;
  
  INSERT INTO activity_logs (
    user_id,
    organization_id,
    action,
    resource,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    v_org_id,
    p_action,
    p_resource,
    p_resource_id,
    p_details
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's primary organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = p_user_id AND is_primary = true
  LIMIT 1;
  
  INSERT INTO notifications (
    user_id,
    organization_id,
    type,
    title,
    message,
    link,
    priority
  ) VALUES (
    p_user_id,
    v_org_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_priority
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_key VARCHAR,
  p_user_id UUID DEFAULT auth.uid(),
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag RECORD;
  v_random INTEGER;
BEGIN
  SELECT * INTO v_flag
  FROM feature_flags
  WHERE key = p_flag_key;
  
  -- Flag doesn't exist or is disabled
  IF NOT FOUND OR v_flag.enabled = false THEN
    RETURN false;
  END IF;
  
  -- Check target users
  IF p_user_id = ANY(v_flag.target_users) THEN
    RETURN true;
  END IF;
  
  -- Check target organizations
  IF p_org_id IS NOT NULL AND p_org_id = ANY(v_flag.target_organizations) THEN
    RETURN true;
  END IF;
  
  -- Check rollout percentage
  v_random := floor(random() * 100)::INTEGER;
  IF v_random < v_flag.rollout_percentage THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. INITIAL DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system access', '["*"]'::jsonb),
  ('manager', 'Management access', '["read:*", "create:*", "update:*"]'::jsonb),
  ('user', 'Standard user access', '["read:*", "create:own", "update:own"]'::jsonb),
  ('viewer', 'Read-only access', '["read:*"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (code, name, resource, action) VALUES
  ('SYSTEM_ALL', 'Full System Access', '*', '*'),
  ('READ_ALL', 'Read All', '*', 'read'),
  ('CREATE_ALL', 'Create All', '*', 'create'),
  ('UPDATE_ALL', 'Update All', '*', 'update'),
  ('DELETE_ALL', 'Delete All', '*', 'delete')
ON CONFLICT (code) DO NOTHING;

-- Insert default settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('app_name', '"ICARUS v5.0"'::jsonb, 'Application name', 'general', true),
  ('app_version', '"5.0.0"'::jsonb, 'Application version', 'general', true),
  ('maintenance_mode', 'false'::jsonb, 'Maintenance mode flag', 'system', false),
  ('max_file_size_mb', '50'::jsonb, 'Maximum file upload size in MB', 'uploads', true),
  ('session_timeout_minutes', '480'::jsonb, 'Session timeout in minutes', 'security', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (key, name, description, enabled) VALUES
  ('edr_research', 'EDR Research', 'Enable Enterprise Deep Research', true),
  ('gpt_researcher', 'GPT Researcher', 'Enable GPT Researcher chatbot', true),
  ('dark_mode', 'Dark Mode', 'Enable dark mode', true),
  ('advanced_analytics', 'Advanced Analytics', 'Enable advanced analytics dashboard', false),
  ('realtime_collaboration', 'Realtime Collaboration', 'Enable realtime collaboration features', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 12. GRANTS
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON organizations TO authenticated;
GRANT SELECT, INSERT ON user_organizations TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT, INSERT ON contact_messages TO authenticated;
GRANT SELECT ON activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;
GRANT SELECT ON system_settings TO authenticated;
GRANT SELECT ON audit_trail TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION is_feature_enabled TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON SCHEMA public IS 'ICARUS-PRO v5.0 - Complete Database Schema';

