#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   GH_OWNER=dmeneghel82 GH_REPO=newortho GH_BRANCH=main bash scripts/ci/publish-qa-workflows.sh
#   # Optional: GH_TOKEN (for API fallback if gh CLI is not available)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -z "${GH_OWNER:-}" || -z "${GH_REPO:-}" ]]; then
  echo "GH_OWNER and GH_REPO are required (e.g., GH_OWNER=user GH_REPO=repo)" >&2
  exit 1
fi

GH_BRANCH="${GH_BRANCH:-main}"
REMOTE_URL="${REMOTE_URL:-https://github.com/${GH_OWNER}/${GH_REPO}.git}"
BRANCH_NAME="chore/qa-workflows-$(date +%s)"

echo "Cloning ${REMOTE_URL}..."
WORKDIR="$(mktemp -d)"
git clone --depth 1 "${REMOTE_URL}" "${WORKDIR}/repo"
cd "${WORKDIR}/repo"

echo "Creating branch ${BRANCH_NAME} from ${GH_BRANCH}..."
git fetch origin "${GH_BRANCH}" || true
git checkout -B "${BRANCH_NAME}" "origin/${GH_BRANCH}" || git checkout -b "${BRANCH_NAME}"

echo "Copying workflow files..."
mkdir -p .github/workflows
cp "${ROOT_DIR}/.github/workflows/qa.yml" .github/workflows/qa.yml
cp "${ROOT_DIR}/.github/workflows/create-qa-issues.yml" .github/workflows/create-qa-issues.yml
cp "${ROOT_DIR}/.github/workflows/open-qa-pr.yml" .github/workflows/open-qa-pr.yml

echo "Committing changes..."
git add .github/workflows/qa.yml .github/workflows/create-qa-issues.yml .github/workflows/open-qa-pr.yml
git commit -m "chore(ci): add QA workflows (audits, issues, checklist PR)" || echo "Nothing to commit."

echo "Pushing branch ${BRANCH_NAME}..."
git push -u origin "${BRANCH_NAME}" || true

PR_TITLE="Add QA workflows (audits, issues, checklist PR)"
PR_BODY="Automated addition of QA workflows (A11y+Lighthouse, Create Issues from Reports, Open QA Checklist PR)."

if command -v gh >/dev/null 2>&1; then
  echo "Opening PR via gh CLI..."
  gh pr create --title "${PR_TITLE}" --body "${PR_BODY}" --base "${GH_BRANCH}" --head "${BRANCH_NAME}" || true
else
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "Opening PR via GitHub API..."
    curl -s -X POST \
      -H "Authorization: Bearer ${GH_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/pulls" \
      -d "{\"title\":\"${PR_TITLE}\",\"body\":\"${PR_BODY}\",\"head\":\"${BRANCH_NAME}\",\"base\":\"${GH_BRANCH}\"}" >/dev/null || true
  else
    echo "PR creation skipped (gh not found and GH_TOKEN not set)."
  fi
fi

echo "Dispatching workflows..."
if command -v gh >/dev/null 2>&1; then
  gh workflow run "QA Audits" || true
  gh workflow run "Create QA Issues from Reports" || true
  gh workflow run "Open QA Checklist PR" || true
else
  if [[ -n "${GH_TOKEN:-}" ]]; then
    for wf in qa.yml create-qa-issues.yml open-qa-pr.yml; do
      curl -s -X POST \
        -H "Authorization: Bearer ${GH_TOKEN}" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${wf}/dispatches" \
        -d "{\"ref\":\"${GH_BRANCH}\"}" >/dev/null || true
    done
  else
    echo "Workflow dispatch skipped (gh not found and GH_TOKEN not set)."
  fi
fi

echo "Attempting to download QA artifacts (if available)..."
if command -v gh >/dev/null 2>&1; then
  mkdir -p "${ROOT_DIR}/qa-artifacts"
  gh run list --limit 20 --json databaseId,status,workflowName,headBranch,displayTitle | tee "${ROOT_DIR}/qa-artifacts/runs.json" || true
  gh run download --name qa-artifacts -D "${ROOT_DIR}/qa-artifacts" || true
fi

echo "Done. Branch: ${BRANCH_NAME}"


