import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const aliases = {
  '@/components': '/src/components',
  '@/hooks': '/src/hooks',
  '@/containers': '/src/containers',
  '@/lib': '/src/lib',
  '@/pages': '/src/pages',
  '@/types': '/src/types',
  '@/queries': '/src/queries',
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "packstack-3s",
    project: "frontend"
  })],

  resolve: {
    alias: aliases
  },

  build: {
    sourcemap: true
  }
})