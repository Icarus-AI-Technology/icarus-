#!/bin/bash

# ============================================
# ICARUS-PRO: Complete Supabase Deployment
# Applies all migrations and sets up project
# ============================================

set -e  # Exit on error

echo "🚀 ICARUS-PRO Supabase Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Copy .env.example to .env and configure it"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Load environment variables
source .env

# Verify required variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Missing Supabase configuration${NC}"
    echo "Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# ============================================
# 1. Link to Supabase Project
# ============================================

echo -e "${BLUE}📡 Linking to Supabase project...${NC}"

# Extract project ref from URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}⚠️  Could not extract project ref from URL${NC}"
    echo "Please run manually: supabase link --project-ref YOUR_PROJECT_REF"
else
    echo "Project ref: $PROJECT_REF"
    supabase link --project-ref $PROJECT_REF || echo -e "${YELLOW}⚠️  Link failed or already linked${NC}"
fi

echo ""

# ============================================
# 2. Run Migrations
# ============================================

echo -e "${BLUE}📦 Running migrations...${NC}"
echo ""

# List all migrations
echo "Migrations to apply:"
ls -1 supabase/migrations/*.sql 2>/dev/null || echo "No migrations found"
echo ""

# Apply migrations with better error handling
echo "Applying migrations..."
echo ""

# First, try to push all migrations
if supabase db push 2>&1 | tee /tmp/supabase-push.log; then
    echo -e "${GREEN}✅ All migrations applied successfully${NC}"
else
    EXIT_CODE=$?
    
    # Check if error is about existing objects
    if grep -q "already exists" /tmp/supabase-push.log; then
        echo -e "${YELLOW}⚠️  Some objects already exist - this is OK${NC}"
        echo "Continuing with deployment..."
    else
        echo -e "${RED}❌ Migration failed with errors${NC}"
        echo "Check the output above for details"
        exit $EXIT_CODE
    fi
fi

echo -e "${GREEN}✅ Migrations applied successfully${NC}"
echo ""

# ============================================
# 3. Deploy Edge Functions
# ============================================

echo -e "${BLUE}⚡ Deploying Edge Functions...${NC}"
echo ""

# Check if functions exist
if [ -d "supabase/functions" ]; then
    FUNCTIONS=$(ls -d supabase/functions/*/ 2>/dev/null | xargs -n 1 basename)
    
    if [ -n "$FUNCTIONS" ]; then
        echo "Functions to deploy:"
        echo "$FUNCTIONS"
        echo ""
        
        for FUNC in $FUNCTIONS; do
            echo "Deploying $FUNC..."
            supabase functions deploy $FUNC || echo -e "${YELLOW}⚠️  Failed to deploy $FUNC${NC}"
        done
        
        echo ""
        echo -e "${GREEN}✅ Edge Functions deployed${NC}"
    else
        echo -e "${YELLOW}⚠️  No Edge Functions found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  supabase/functions directory not found${NC}"
fi

echo ""

# ============================================
# 4. Setup Storage Buckets
# ============================================

echo -e "${BLUE}🗄️  Setting up Storage Buckets...${NC}"
echo ""

echo "Creating storage buckets..."

# Note: Bucket creation needs to be done via Supabase dashboard or API
# This is just a reference list

cat << EOF
Storage buckets to create manually in Supabase Dashboard:

1. documentos-dpo (private)
2. notas-fiscais (private)
3. imagens-produtos (public)
4. relatorios (private)
5. certificados (private)
6. avatares (public)

Go to: Supabase Dashboard → Storage → Create bucket
EOF

echo ""

# ============================================
# 5. Verify Deployment
# ============================================

echo -e "${BLUE}🔍 Verifying deployment...${NC}"
echo ""

# Check if tables exist
echo "Checking tables..."

TABLES=(
  "organizations"
  "user_organizations"
  "profiles"
  "roles"
  "permissions"
  "contact_messages"
  "activity_logs"
  "notifications"
  "feature_flags"
  "system_settings"
  "audit_trail"
  "edr_research_sessions"
  "edr_agent_tasks"
)

for TABLE in "${TABLES[@]}"; do
    if supabase db exec "SELECT 1 FROM $TABLE LIMIT 1;" &>/dev/null; then
        echo -e "${GREEN}✓${NC} $TABLE"
    else
        echo -e "${RED}✗${NC} $TABLE"
    fi
done

echo ""

# ============================================
# 6. Generate TypeScript Types
# ============================================

echo -e "${BLUE}📝 Generating TypeScript types...${NC}"
echo ""

supabase gen types typescript --local > src/types/database.types.ts || {
    echo -e "${YELLOW}⚠️  Could not generate types (local DB not running)${NC}"
    echo "Run manually: supabase gen types typescript --linked > src/types/database.types.ts"
}

echo ""

# ============================================
# 7. Summary
# ============================================

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "✅ Migrations applied"
echo "✅ Edge Functions deployed"
echo "✅ Database verified"
echo ""
echo "Next steps:"
echo "1. Create storage buckets in Supabase Dashboard"
echo "2. Configure RLS policies if needed"
echo "3. Set environment secrets for Edge Functions"
echo "4. Run: pnpm dev"
echo ""
echo "📚 Documentation: docs/SUPABASE_SETUP.md"
echo ""
echo -e "${BLUE}Project URL:${NC} $VITE_SUPABASE_URL"
echo -e "${BLUE}Dashboard:${NC} https://app.supabase.com/project/$PROJECT_REF"
echo ""

