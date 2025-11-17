#!/bin/bash

# ============================================
# ICARUS-PRO: Automatic Supabase Deployment
# Non-interactive version with error handling
# ============================================

set +e  # Don't exit on error - we'll handle them

echo "🚀 ICARUS-PRO Automatic Supabase Deployment"
echo "============================================"
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
    supabase link --project-ref $PROJECT_REF 2>&1 | grep -v "already linked" || true
fi

echo ""

# ============================================
# 2. Apply Migrations Individually
# ============================================

echo -e "${BLUE}📦 Applying migrations individually...${NC}"
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Get list of migration files
MIGRATIONS=$(ls -1 supabase/migrations/*.sql 2>/dev/null | grep -E '^[0-9]{4}' | sort)

if [ -z "$MIGRATIONS" ]; then
    echo -e "${YELLOW}⚠️  No migrations found${NC}"
else
    TOTAL=$(echo "$MIGRATIONS" | wc -l)
    CURRENT=0
    
    echo "Found $TOTAL migrations to process"
    echo ""
    
    for MIGRATION in $MIGRATIONS; do
        CURRENT=$((CURRENT + 1))
        BASENAME=$(basename "$MIGRATION")
        
        echo -e "${BLUE}[$CURRENT/$TOTAL]${NC} Processing $BASENAME..."
        
        # Try to apply migration
        if supabase db push --include-all 2>&1 | tee /tmp/migration-output.log | grep -q "Finished"; then
            echo -e "${GREEN}  ✓ Applied successfully${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            # Check if it's just duplicate objects
            if grep -q "already exists" /tmp/migration-output.log; then
                echo -e "${YELLOW}  ⊙ Already exists (skipped)${NC}"
                SKIP_COUNT=$((SKIP_COUNT + 1))
            else
                echo -e "${RED}  ✗ Failed${NC}"
                FAIL_COUNT=$((FAIL_COUNT + 1))
            fi
        fi
        
        echo ""
    done
fi

echo ""
echo "=========================================="
echo "Migration Summary:"
echo -e "${GREEN}✓ Success: $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}⊙ Skipped: $SKIP_COUNT${NC}"
echo -e "${RED}✗ Failed: $FAIL_COUNT${NC}"
echo "=========================================="
echo ""

# ============================================
# 3. Apply Critical EDR Migration
# ============================================

echo -e "${BLUE}🧠 Ensuring EDR tables exist...${NC}"
echo ""

if [ -f "supabase/migrations/20250126000000_edr_integration.sql" ]; then
    echo "Checking EDR tables..."
    
    # Use psql to check if tables exist
    EDR_CHECK=$(supabase db exec "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('edr_research_sessions', 'edr_agent_tasks')
    " 2>/dev/null || echo "0")
    
    if [ "$EDR_CHECK" = "2" ]; then
        echo -e "${GREEN}✓ EDR tables already exist${NC}"
    else
        echo "Applying EDR migration..."
        supabase db push --include-all
        echo -e "${GREEN}✓ EDR migration applied${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  EDR migration file not found${NC}"
fi

echo ""

# ============================================
# 4. Deploy Edge Functions
# ============================================

echo -e "${BLUE}⚡ Deploying Edge Functions...${NC}"
echo ""

# Check if functions exist
if [ -d "supabase/functions" ]; then
    FUNC_DIRS=$(find supabase/functions -maxdepth 1 -mindepth 1 -type d 2>/dev/null)
    
    if [ -n "$FUNC_DIRS" ]; then
        echo "Functions to deploy:"
        
        for FUNC_DIR in $FUNC_DIRS; do
            FUNC_NAME=$(basename "$FUNC_DIR")
            echo "  - $FUNC_NAME"
        done
        
        echo ""
        
        for FUNC_DIR in $FUNC_DIRS; do
            FUNC_NAME=$(basename "$FUNC_DIR")
            echo "Deploying $FUNC_NAME..."
            
            if supabase functions deploy $FUNC_NAME 2>&1; then
                echo -e "${GREEN}  ✓ Deployed successfully${NC}"
            else
                echo -e "${YELLOW}  ⚠️  Deployment had warnings${NC}"
            fi
            
            echo ""
        done
        
        echo -e "${GREEN}✅ Edge Functions processed${NC}"
    else
        echo -e "${YELLOW}⚠️  No Edge Functions found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  supabase/functions directory not found${NC}"
fi

echo ""

# ============================================
# 5. Verify Critical Tables
# ============================================

echo -e "${BLUE}🔍 Verifying critical tables...${NC}"
echo ""

CRITICAL_TABLES=(
  "empresas"
  "usuarios"
  "produtos"
  "cirurgias"
  "edr_research_sessions"
  "edr_agent_tasks"
)

VERIFIED=0

for TABLE in "${CRITICAL_TABLES[@]}"; do
    if supabase db exec "SELECT 1 FROM $TABLE LIMIT 1;" &>/dev/null; then
        echo -e "${GREEN}✓${NC} $TABLE"
        VERIFIED=$((VERIFIED + 1))
    else
        echo -e "${RED}✗${NC} $TABLE (missing)"
    fi
done

echo ""
echo "Verified $VERIFIED/${#CRITICAL_TABLES[@]} critical tables"
echo ""

# ============================================
# 6. Final Summary
# ============================================

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Process Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Results:"
echo "  • Migrations: $SUCCESS_COUNT applied, $SKIP_COUNT skipped, $FAIL_COUNT failed"
echo "  • Database: $VERIFIED/${#CRITICAL_TABLES[@]} critical tables verified"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some migrations failed - review logs above${NC}"
    echo ""
fi

echo "Next steps:"
echo "1. Review any failed migrations above"
echo "2. Check Supabase Dashboard for table structure"
echo "3. Test Edge Functions"
echo "4. Run: pnpm dev"
echo ""
echo "📚 Documentation: docs/SUPABASE_SETUP.md"
echo -e "${BLUE}Dashboard:${NC} https://app.supabase.com/project/$PROJECT_REF"
echo ""

