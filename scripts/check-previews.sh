#!/usr/bin/env bash
#
# check-previews.sh: does every preview environment still belong to an open pull
# request?
#
# close-preview-environments.yml deletes a preview when its pull request closes,
# but GitHub does not run pull_request workflows while a pull request has a merge
# conflict, and that includes `closed`. A preview can therefore outlive its pull
# request. LVG-Demo-MO-acc is on the Free tier with three preview slots, and a
# full pool fails the `Build and deploy ACC` check.
#
# This runs on a workstation, because it needs an Azure login. It never deletes:
# it prints the exact command and leaves that decision to a person.
#
# Exit 0 when every preview belongs to an open pull request. Exit 1 on any orphan,
# and whenever something could not be checked.
#
# Usage:
#   npm run check-previews
#   OPEN_PRS="148 149" bash scripts/check-previews.sh
#       Treat only these pull requests as open, to exercise the orphan path.

set -euo pipefail

SUBSCRIPTION="PDR - C1380"
RESOURCE_GROUP="RONL-Preproduction"
APPS=("LVG-Demo-MO-acc" "LVG-Demo-MO" "toestemming-wireframes")

for tool in az gh; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "check-previews: '$tool' is not installed. Nothing was compared." >&2
    exit 1
  fi
done

if ! az account show >/dev/null 2>&1; then
  echo "check-previews: not logged in to Azure (run az login). Nothing was compared." >&2
  exit 1
fi

if [ -n "${OPEN_PRS+x}" ]; then
  open_prs=" ${OPEN_PRS} "
  echo "check-previews: OPEN_PRS is set, treating only these as open:${open_prs}"
else
  if ! prs=$(gh pr list --state open --limit 500 --json number --jq '.[].number' 2>/dev/null); then
    echo "check-previews: cannot list open pull requests (check gh auth status). Nothing was compared." >&2
    exit 1
  fi
  open_prs=" $(printf '%s' "$prs" | tr -d '\r' | tr '\n' ' ') "
fi

echo "check-previews: preview environments against open pull requests"
echo

orphans=0
unchecked=0

for name in "${APPS[@]}"; do
  if ! envs=$(az staticwebapp environment list --subscription "$SUBSCRIPTION" \
    -n "$name" -g "$RESOURCE_GROUP" \
    --query "[?name!='default'].[name, sourceBranch]" -o tsv 2>/dev/null); then
    printf '  %s: cannot list environments\n' "$name"
    unchecked=$((unchecked + 1))
    continue
  fi
  envs=$(printf '%s' "$envs" | tr -d '\r')

  printf '  %s\n' "$name"
  if [ -z "$envs" ]; then
    printf '    no preview environments\n'
    continue
  fi

  while IFS=$'\t' read -r env branch; do
    if ! [[ "$env" =~ ^[0-9]+$ ]]; then
      printf '    %-6s named environment (%s), not a pull request, left alone\n' "$env" "$branch"
    elif [[ "$open_prs" == *" $env "* ]]; then
      printf '    #%-5s open     %s\n' "$env" "$branch"
    else
      printf '    #%-5s ORPHAN   %s, pull request #%s is not open\n' "$env" "$branch" "$env"
      printf '           az staticwebapp environment delete --subscription "%s" -n %s -g %s --environment-name %s --yes\n' \
        "$SUBSCRIPTION" "$name" "$RESOURCE_GROUP" "$env"
      orphans=$((orphans + 1))
    fi
  done <<<"$envs"
done

echo
if [ "$unchecked" -gt 0 ]; then
  echo "check-previews: $unchecked app(s) could not be checked, see above." >&2
fi

if [ "$orphans" -gt 0 ]; then
  echo "$orphans orphaned preview environment(s): each serves a public URL and holds"
  echo "a slot. Run the command(s) above, then run this check again."
  exit 1
fi

if [ "$unchecked" -gt 0 ]; then
  exit 1
fi

echo "OK: every preview environment belongs to an open pull request."
