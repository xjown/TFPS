import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import { resolve } from 'path';

import * as Three from 'three';

const threeTypes: string[] = [];

for (let i in Three) {
  threeTypes.push(i);
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    AutoImport({
      include: [/\.[tj]s?$/],
      imports: [{ three: threeTypes }],
      dts: 'src/typings/auto-imports.d.ts',
    }),
  ],
});
