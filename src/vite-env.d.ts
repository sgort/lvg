/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base path the router runs under; set by a deploy, absent locally. */
  readonly VITE_BASE_PATH?: string;
}
