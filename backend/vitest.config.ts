import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,js}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/db/schema.ts']
    }
  }
});