/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base path the router runs under; set by a deploy, absent locally. */
  readonly VITE_BASE_PATH?: string;
  /** The site address; set by each deploy workflow. */
  readonly VITE_SITE_URL?: string;
  /** Commit SHA and run number of the build; set by each deploy workflow. */
  readonly VITE_BUILD_SHA?: string;
  readonly VITE_BUILD_RUN?: string;
}
