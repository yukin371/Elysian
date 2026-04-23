import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@arco-design/web-vue")) {
            return "vendor-arco"
          }

          if (id.includes("/packages/ui-enterprise-vue/")) {
            return "ely-enterprise"
          }

          if (
            id.includes("/packages/frontend-vue/") ||
            id.includes("/packages/ui-core/")
          ) {
            return "ely-frontend"
          }

          if (id.includes("/node_modules/") && id.includes("/vue/")) {
            return "vendor-vue"
          }
        },
      },
    },
  },
})
