import { cleanText } from "$lib/format"
import { parseOpts, svgResponse } from "$lib/server/badge"
import { cardSvg } from "$lib/server/card"
import { cacheHeader } from "$lib/server/env"
import { flatSvg } from "$lib/server/flat"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = ({ url }) => {
  const opts = parseOpts(url)
  const title = opts.label ?? "zed-badge"
  const message = cleanText(url.searchParams.get("message") ?? "")
  const meta = cleanText(url.searchParams.get("meta") ?? "")
  const right = cleanText(url.searchParams.get("right") ?? "")
  const cacheControl = cacheHeader()

  if (opts.flat) {
    return svgResponse(
      flatSvg(title, message || "custom badge", opts.color, opts.logo),
      cacheControl,
    )
  }

  return svgResponse(
    cardSvg({
      title,
      right: right || undefined,
      desc: message || undefined,
      meta: meta || undefined,
      theme: opts.theme,
    }),
    cacheControl,
  )
}
