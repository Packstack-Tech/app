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
  plugins: [react()],
  resolve: {
    alias: aliases
  },
})
