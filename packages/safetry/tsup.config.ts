import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: true,
  treeshake: true,
  minify: true,
  target: 'es2022',
  outDir: 'dist',
  external: [],
  bundle: true,
  skipNodeModulesBundle: true,
  platform: 'neutral',
  esbuildOptions: (options) => {
    options.conditions = ['module'];
  },
});
