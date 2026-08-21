import { copyFileSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import type { IconifyJSON } from "@iconify/types"
import { getIconData } from "@iconify/utils"
import { icons as lucide } from "@iconify-json/lucide"
import { icons as simpleIcons } from "@iconify-json/simple-icons"
import adapter from "@sveltejs/adapter-cloudflare"
import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, type Plugin } from "vite"

const ICONS: Record<string, [IconifyJSON, string]> = {
  zedLogo: [simpleIcons, "zedindustries"],
  githubIcon: [simpleIcons, "github"],
  downloadIcon: [lucide, "download"],
  userIcon: [lucide, "user"],
  blocksIcon: [lucide, "blocks"],
  pencilIcon: [lucide, "pencil"],
  chartIcon: [lucide, "chart-line"],
  helpIcon: [lucide, "circle-help"],
  copyIcon: [lucide, "copy"],
  shareIcon: [lucide, "share-2"],
  checkIcon: [lucide, "check"],
}

const iconData = (): Plugin => ({
  name: "icon-data",
  resolveId(id) {
    if (id === "virtual:icon-data") {
      return "\0virtual:icon-data"
    }
  },
  load(id) {
    if (id !== "\0virtual:icon-data") {
      return
    }

    return Object.entries(ICONS)
      .map(([name, [set, icon]]) => {
        const data = getIconData(set, icon)
        if (!data) {
          throw new Error(`missing icon: ${set.prefix}:${icon}`)
        }

        return `export const ${name} = ${JSON.stringify(data)}`
      })
      .join("\n")
  },
})

const resvgWasm = (): Plugin => ({
  name: "resvg-wasm-external",
  apply: "build",
  enforce: "pre",
  resolveId(id) {
    if (id.endsWith("index_bg.wasm")) {
      return { id: "./resvg.wasm", external: true }
    }
  },
  writeBundle() {
    const source = createRequire(import.meta.url).resolve(
      "@resvg/resvg-wasm/index_bg.wasm",
    )
    mkdirSync(".svelte-kit/output/server/chunks", { recursive: true })
    copyFileSync(source, ".svelte-kit/output/server/chunks/resvg.wasm")
  },
})

export default defineConfig({
  plugins: [
    iconData(),
    resvgWasm(),
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) =>
          filename.includes("node_modules") ? undefined : true,
      },
      adapter: adapter(),
    }),
  ],
})
