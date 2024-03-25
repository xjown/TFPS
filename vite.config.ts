import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import * as Three from 'three';

const threeTypes: string[] = [];

for (let i in Three) {
  threeTypes.push(i);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      include: [/\.[tj]s?$/],
      imports: [{ three: threeTypes }],
      dts: 'src/typings/auto-imports.d.ts',
    }),
  ],
});
