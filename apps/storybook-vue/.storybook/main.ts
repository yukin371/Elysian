import { URL, fileURLToPath } from "node:url"

import type { StorybookConfig } from "@storybook/vue3-vite"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  staticDirs: ["../public"],
  addons: [],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  async viteFinal(baseConfig) {
    baseConfig.plugins = [...(baseConfig.plugins ?? []), vue(), tailwindcss()]
    baseConfig.resolve = {
      ...(baseConfig.resolve ?? {}),
      alias: {
        ...(baseConfig.resolve?.alias ?? {}),
        "@elysian/ui-public-vue": fileURLToPath(
          new URL(
            "../../../packages/ui-public-vue/src/index.ts",
            import.meta.url,
          ),
        ),
      },
    }
    return baseConfig
  },
}

export default config
