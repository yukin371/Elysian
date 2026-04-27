import { URL, fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

const toPosixPath = (id: string) => id.replaceAll("\\", "/")

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@elysian/generator/browser": fileURLToPath(
        new URL("../../packages/generator/src/browser.ts", import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = toPosixPath(id)

          if (
            normalizedId.includes("/packages/frontend-vue/") ||
            normalizedId.includes("/packages/ui-core/")
          ) {
            return "ely-frontend"
          }

          if (
            normalizedId.includes("/node_modules/") &&
            normalizedId.includes("/vue/")
          ) {
            return "vendor-vue"
          }
        },
      },
    },
  },
})
