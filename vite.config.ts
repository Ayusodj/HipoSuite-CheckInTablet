import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
      ,
      build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes('node_modules')) {
                if (id.includes('react')) return 'vendor_react';
                if (id.includes('jspdf')) return 'vendor_jspdf';
                if (id.includes('html2canvas')) return 'vendor_html2canvas';
                if (id.includes('exceljs') || id.includes('xlsx') || id.includes('xlsx-style')) return 'vendor_excel';
                if (id.includes('jszip')) return 'vendor_jszip';
                return 'vendor_misc';
              }
            }
          }
        }
      }
    };
});
