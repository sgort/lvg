#!/usr/bin/env bash
#
# deploy-dmn-local.sh: deploy the decisions in dmn/ to the LOCAL Operaton only.
#
# Deploying to operaton.open-regels.nl is the owner's decision, made outside this
# repository, so this script refuses any engine other than localhost:8081.
#
# Usage:
#   bash scripts/deploy-dmn-local.sh
#
# Environment:
#   OPERATON_BASE_URL  default http://localhost:8081/engine-rest (must stay on localhost:8081)
#   OPERATON_USER      default demo
#   OPERATON_PASSWORD  default demo
#
# With deploy-changed-only=true, Operaton creates a new version only when a file changed.

set -euo pipefail

BASE_URL="${OPERATON_BASE_URL:-http://localhost:8081/engine-rest}"
BASE_URL="${BASE_URL%/}"
USER_NAME="${OPERATON_USER:-demo}"
PASSWORD="${OPERATON_PASSWORD:-demo}"

case "$BASE_URL" in
  http://localhost:8081/* | http://127.0.0.1:8081/*) ;;
  *)
    echo "deploy-dmn-local: refusing to deploy to $BASE_URL. Only localhost:8081 is allowed." >&2
    exit 1
    ;;
esac

DMN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../dmn" && pwd)"
shopt -s nullglob
files=("$DMN_DIR"/*.dmn)
if [ "${#files[@]}" -eq 0 ]; then
  echo "deploy-dmn-local: no .dmn files in $DMN_DIR." >&2
  exit 1
fi

args=(--form-string "deployment-name=lvg-dmn" --form-string "deploy-changed-only=true")
for file in "${files[@]}"; do
  args+=(-F "data-$(basename "$file")=@$file")
done

echo "Deploying ${#files[@]} file(s) to $BASE_URL"
response=$(curl -sS --fail-with-body -u "$USER_NAME:$PASSWORD" "${args[@]}" \
  "$BASE_URL/deployment/create") || {
  echo "deploy-dmn-local: deployment failed:" >&2
  echo "$response" >&2
  exit 1
}

# Print the deployment id and, per decision, the version now active.
echo "$response" | node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const d = JSON.parse(s);
    const decisions = Object.values(d.deployedDecisionDefinitions ?? {});
    console.log(`Deployment ${d.id}`);
    if (decisions.length === 0) console.log("No changes: nothing new was deployed.");
    for (const def of decisions) console.log(`  ${def.key} version ${def.version}`);
  });
'
