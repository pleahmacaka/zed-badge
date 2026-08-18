import { json } from "@sveltejs/kit"
import { humanize, segments, withCommas, wrap } from "$lib/format"
import {
  jsonError,
  parseOpts,
  statusSvg,
  stripExt,
  svgResponse,
  validSubject,
} from "$lib/server/badge"
import { cardSvg } from "$lib/server/card"
import { cacheHeader } from "$lib/server/env"
import { flatSvg } from "$lib/server/flat"
import { authorLookup } from "$lib/server/zed"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url }) => {
  const wantSvg = params.file.endsWith(".svg")
  const name = stripExt(params.file)
  if (!validSubject(name)) {
    return jsonError("bad author name", 400)
  }

  const opts = parseOpts(url)
  const cacheControl = cacheHeader()
  const stats = await authorLookup(name)

  if (!wantSvg) {
    if (stats === "error") {
      return jsonError("upstream unavailable", 502)
    }
    if (!stats) {
      return jsonError("author not found", 404)
    }

    return json(stats, {
      headers: {
        "cache-control": cacheControl,
        "access-control-allow-origin": "*",
      },
    })
  }

  if (stats === "error") {
    return svgResponse(
      statusSvg("unavailable", opts, name, `@${name}`),
      "no-cache",
    )
  }
  if (!stats) {
    return svgResponse(
      statusSvg("missing", opts, name, `@${name}`),
      cacheControl,
    )
  }

  const count = opts.raw
    ? withCommas(stats.downloads)
    : humanize(stats.downloads)

  const descSegments = segments(opts.prefix, count, opts.suffix)

  if (opts.flat) {
    const message = descSegments
      ? wrap(opts.prefix, count, opts.suffix)
      : `${count} downloads`

    return svgResponse(
      flatSvg(opts.label ?? stats.name, message, opts.color, opts.logo),
      cacheControl,
    )
  }

  const plural = stats.extensions === 1 ? "" : "s"

  return svgResponse(
    cardSvg({
      title: opts.label ?? `@${stats.name}`,
      right: count,
      desc: descSegments
        ? undefined
        : `${stats.extensions} extension${plural} on Zed`,
      descSegments,
      theme: opts.theme,
    }),
    cacheControl,
  )
}
