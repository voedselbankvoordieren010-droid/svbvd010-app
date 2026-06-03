import { defineConfig } from 'vite';

export default defineConfig({
  base: './',

  build: {
    sourcemap: false,

    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@supabase')) {
            return 'supabase';
          }

          if (id.includes('pdf')) {
    return 'pdf';
  }
  
          if (id.includes('chart')) {
            return 'charts';
          }

          return 'vendor';
        }
      }
    }
  }
});
