import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'jsdom', include: ['src/theme/dynamic-colors.spec.ts', 'src/theme/demo-dynamic-colors.spec.ts'] },
});
