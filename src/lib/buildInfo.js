/**
 * Which BUILD of the site is running.
 *
 * LVG makes no versioned releases, and redeploying unchanged code produces a new
 * artifact, so "which build am I looking at?" needs its own answer. The SHA says
 * what was built; the run number distinguishes two builds of identical code.
 *
 * Both are injected at build time by .github/workflows/azure-lvg-{acc,stable}.yml,
 * on the build step, because the runner builds this app and the deploy action is
 * passed skip_app_build: true. Nothing is derived from git here: a build id that
 * silently fails to resolve is worse than none.
 *
 * Ported from ronl-business-api packages/public-site/src/lib/buildInfo.ts.
 *
 * @typedef {object} BuildInfo
 * @property {string} sha Full 40-character commit SHA, or '' when not injected.
 * @property {string} shortSha First 7 characters of the SHA, or '' when not injected.
 * @property {string} run GitHub Actions run number, or '' when not injected.
 * @property {boolean} isTracked True only when both values are present.
 * @property {string} label Ready to render. Never blank.
 */

/** @type {BuildInfo} */
const UNTRACKED = {
  sha: '',
  shortSha: '',
  run: '',
  isTracked: false,
  label: 'local build',
};

/**
 * Read the injected build identifiers and describe them.
 *
 * The env is read on every call rather than captured at module scope, so tests
 * can stub it per case.
 *
 * Half-configured counts as untracked. A run number with no SHA implies a
 * provenance the bundle does not have, and a SHA with no run number cannot tell
 * two builds of the same commit apart. Either way the answer is 'local build'.
 *
 * @returns {BuildInfo}
 */
export function getBuildInfo() {
  const sha = (import.meta.env.VITE_BUILD_SHA ?? '').trim();
  const run = (import.meta.env.VITE_BUILD_RUN ?? '').trim();

  if (!sha || !run) return UNTRACKED;

  const shortSha = sha.slice(0, 7);
  return { sha, shortSha, run, isTracked: true, label: `build ${shortSha} · #${run}` };
}
