import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 49,
        branches: 44,
        functions: 43,
        lines: 51,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.mjs',
      ],
    },
  },
});
