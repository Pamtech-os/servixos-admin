import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Proxy the API through the dev server so it is same-origin with the page;
      // otherwise the browser drops the API's SameSite=Lax auth cookies on localhost.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'https://api-dev.servixos.com',
          changeOrigin: true,
          // Strip any Domain=.servixos.com so the cookies are stored for localhost
          cookieDomainRewrite: '',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
          },
        },
      },
    },
  }
})
