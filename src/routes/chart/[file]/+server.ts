import {
  extensionCard,
  imageFormat,
  imageResponse,
  jsonError,
  parseOpts,
  statusSvg,
  stripExt,
  validSubject,
} from "$lib/server/badge"
import { cardSvg } from "$lib/server/card"
import { chartSvg } from "$lib/server/chart"
import { cacheHeader } from "$lib/server/env"
import { history } from "$lib/server/history"
import { lookup } from "$lib/server/zed"
import { status } from "$lib/tokens"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url, platform }) => {
  const format = imageFormat(params.file)
  const id = stripExt(params.file)
  if (!validSubject(id)) {
    return jsonError("bad extension id", 400)
  }

  const opts = parseOpts(url)
  const cacheControl = cacheHeader()
  const unavailable = () =>
    imageResponse(
      cardSvg({
        title: opts.label ?? id,
        desc: "history unavailable",
        descColor: status.unavailable,
        theme: opts.theme,
      }),
      format,
      "no-cache",
    )

  const db = platform?.env?.DB
  if (!db) {
    return unavailable()
  }

  const [ext, points] = await Promise.all([lookup(id), history(db, id)])
  if (points === null) {
    return unavailable()
  }
  if (ext === "error") {
    return imageResponse(
      statusSvg("unavailable", opts, id, id),
      format,
      "no-cache",
    )
  }
  if (!ext) {
    return imageResponse(
      statusSvg("missing", opts, id, id),
      format,
      cacheControl,
    )
  }

  return imageResponse(
    chartSvg({ card: extensionCard(ext, opts), points }),
    format,
    cacheControl,
  )
}
