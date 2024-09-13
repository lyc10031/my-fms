import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import path from "path";
import { nodeResolve } from '@rollup/plugin-node-resolve';

// 全局引入 md-editor-v3 的样式
// import 'md-editor-v3/lib/style.css';

export default defineConfig({
  plugins: [
    vue(),
    nodeResolve(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        
        {
          '@element-plus/icons-vue': ['ArrowLeft', 'ArrowRight', /* 其他你需要的图标 */],
          'md-editor-v3': ['MdEditor', 'MdPreview'],
          'dompurify': [
            ['default', 'DOMPurify']
          ],
        },
      ],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        (componentName) => {
          if (componentName === 'MdEditor' || componentName === 'MdPreview') {
            return { name: componentName, from: 'md-editor-v3' }
          }
        },
      ],
      dts: 'src/components.d.ts',
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        // additionalData: `@import 'md-editor-v3/lib/style.css';`,  // 确保样式全局导入
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  optimizeDeps: {
    include: ['element-plus/es', '@element-plus/icons-vue'],
  },
  
});