declare module "*.wasm" {
  const module: WebAssembly.Module
  export default module
}

declare module "virtual:icon-data" {
  import type { IconifyIcon } from "@iconify/types"

  export const zedLogo: IconifyIcon
  export const githubIcon: IconifyIcon
  export const downloadIcon: IconifyIcon
  export const userIcon: IconifyIcon
  export const blocksIcon: IconifyIcon
  export const pencilIcon: IconifyIcon
  export const chartIcon: IconifyIcon
  export const helpIcon: IconifyIcon
}
