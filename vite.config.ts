import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// isSsrBuild: `vite build --ssr` 로 실행되는 프리렌더용 번들 빌드.
// 클라이언트 번들과 출력 위치/파일명 규칙이 달라야 하므로 분기한다.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the project root directory
      '@': path.resolve(__dirname, './'),
    },
  },
  base: '/',
  build: isSsrBuild
    ? {
        // 프리렌더 스크립트(scripts/prerender.mjs)가 import 하는 Node 번들
        outDir: 'dist-ssr',
        ssr: 'app/entry-server.tsx',
      }
    : {
        outDir: 'dist',
        rollupOptions: {
          output: {
            entryFileNames: 'assets/index.js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        },
      },
}))
