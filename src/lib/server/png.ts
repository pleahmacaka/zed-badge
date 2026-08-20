import { initWasm, Resvg } from "@resvg/resvg-wasm"
import wasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url"
import { read } from "$app/server"
import regular from "$lib/assets/IBMPlexSans-Regular.ttf"
import semibold from "$lib/assets/IBMPlexSans-SemiBold.ttf"

let ready: Promise<Uint8Array[]> | undefined

const loadWasm = async () => {
  try {
    const { default: wasmModule } = await import(
      "@resvg/resvg-wasm/index_bg.wasm"
    )

    return wasmModule
  } catch {
    return read(wasmUrl).arrayBuffer()
  }
}

const load = async () => {
  const [wasm, ...fonts] = await Promise.all([
    loadWasm(),
    ...[regular, semibold].map(asset => read(asset).arrayBuffer()),
  ])
  try {
    await initWasm(wasm)
  } catch (error) {
    if (!String(error).includes("Already initialized")) {
      throw error
    }
  }

  return fonts.map(font => new Uint8Array(font))
}

export const toPng = async (svg: string): Promise<Uint8Array> => {
  ready ??= load()
  const fonts = await ready

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: fonts,
      defaultFontFamily: "IBM Plex Sans",
      loadSystemFonts: false,
    },
  })

  return resvg.render().asPng()
}
