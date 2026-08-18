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
import { displayName, lookup } from "$lib/server/zed"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url }) => {
  const wantSvg = params.file.endsWith(".svg")
  const id = stripExt(params.file)
  if (!validSubject(id)) {
    return jsonError("bad extension id", 400)
  }

  const opts = parseOpts(url)
  const cacheControl = cacheHeader()
  const ext = await lookup(id)

  if (!wantSvg) {
    if (ext === "error") {
      return jsonError("upstream unavailable", 502)
    }
    if (!ext) {
      return jsonError("not found", 404)
    }

    return json(ext, {
      headers: {
        "cache-control": cacheControl,
        "access-control-allow-origin": "*",
      },
    })
  }

  if (ext === "error") {
    return svgResponse(
      statusSvg("unavailable", opts, "downloads", id),
      "no-cache",
    )
  }
  if (!ext) {
    return svgResponse(
      statusSvg("missing", opts, "downloads", id),
      cacheControl,
    )
  }

  const isVersion = opts.metric === "version"
  const count = opts.raw
    ? withCommas(ext.download_count)
    : humanize(ext.download_count)
  const value = isVersion ? `v${ext.version}` : count

  if (opts.flat) {
    const label = opts.label ?? (isVersion ? "zed extension" : "downloads")

    return svgResponse(
      flatSvg(
        label,
        wrap(opts.prefix, value, opts.suffix),
        opts.color,
        opts.logo,
      ),
      cacheControl,
    )
  }

  const descSegments = segments(opts.prefix, value, opts.suffix)

  return svgResponse(
    cardSvg({
      title: opts.label ?? ext.name,
      right: value,
      desc: descSegments ? undefined : ext.description,
      descSegments,
      meta: ext.authors?.map(displayName).join(", "),
      theme: opts.theme,
    }),
    cacheControl,
  )
}
