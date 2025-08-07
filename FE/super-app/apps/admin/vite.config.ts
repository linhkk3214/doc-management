import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/admin',
  
  server: {
    port: 4200,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost'
    },
    proxy: {
      '/api': {
        target: 'https://ocr-app-api.csharpp.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  
  preview: {
    port: 4300,
    host: 'localhost',
  },
  
  plugins: [nxViteTsPaths()],
  
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  
  build: {
    outDir: '../../dist/apps/admin',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});