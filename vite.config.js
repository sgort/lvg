import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // No VITE_ prefix, so these values stay on the dev server and never reach the
  // browser bundle. Override the local defaults in .env.local if needed.
  const env = loadEnv(mode, process.cwd(), 'OPERATON_');
  const user = env.OPERATON_USER || 'demo';
  const password = env.OPERATON_PASSWORD || 'demo';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // The local Operaton requires a login, so the proxy adds it. Only the call
        // the app makes is forwarded: other sites can send requests to this dev
        // server, and they must not reach the rest of the engine with that login.
        '/api/engine-rest/decision-definition/key/bereken_isolatie_opties/evaluate': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          auth: `${user}:${password}`,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
