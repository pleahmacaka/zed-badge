import { cleanText } from "$lib/format"
import { imageResponse, parseOpts } from "$lib/server/badge"
import { cardSvg } from "$lib/server/card"
import { cacheHeader } from "$lib/server/env"
import { flatSvg } from "$lib/server/flat"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = ({ params, url }) => {
  const format = params.ext === "png" ? "png" : "svg"
  const opts = parseOpts(url)
  const title = opts.label ?? "zed-badge"
  const message = cleanText(url.searchParams.get("message") ?? "")
  const meta = cleanText(url.searchParams.get("meta") ?? "")
  const right = cleanText(url.searchParams.get("right") ?? "")
  const cacheControl = cacheHeader()

  if (opts.flat) {
    return imageResponse(
      flatSvg(title, message || "custom badge", opts.color, opts.logo),
      format,
      cacheControl,
    )
  }

  return imageResponse(
    cardSvg({
      title,
      right: right || undefined,
      desc: message || undefined,
      meta: meta || undefined,
      theme: opts.theme,
    }),
    format,
    cacheControl,
  )
}
