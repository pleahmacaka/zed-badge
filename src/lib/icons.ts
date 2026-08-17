import type { IconifyIcon, IconifyJSON } from "@iconify/types"
import { getIconData } from "@iconify/utils"
import { icons as lucide } from "@iconify-json/lucide"
import { icons as simpleIcons } from "@iconify-json/simple-icons"

const icon = (set: IconifyJSON, name: string): IconifyIcon => {
  const data = getIconData(set, name)
  if (!data) {
    throw new Error(`missing icon: ${set.prefix}:${name}`)
  }

  return data
}

export const zedLogo = icon(simpleIcons, "zedindustries")
export const githubIcon = icon(simpleIcons, "github")
export const downloadIcon = icon(lucide, "download")
export const userIcon = icon(lucide, "user")
export const blocksIcon = icon(lucide, "blocks")
export const pencilIcon = icon(lucide, "pencil")
