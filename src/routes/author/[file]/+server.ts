import { json } from "@sveltejs/kit"
import { humanize, template, withCommas } from "$lib/format"
import {
  imageFormat,
  imageResponse,
  jsonError,
  parseOpts,
  statusSvg,
  stripExt,
  validSubject,
} from "$lib/server/badge"
import { cardSvg } from "$lib/server/card"
import { cacheHeader } from "$lib/server/env"
import { flatSvg } from "$lib/server/flat"
import { authorLookup } from "$lib/server/zed"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url }) => {
  const wantJson = params.file.endsWith(".json")
  const format = imageFormat(params.file)
  const name = stripExt(params.file)
  if (!validSubject(name)) {
    return jsonError("bad author name", 400)
  }

  const opts = parseOpts(url)
  const cacheControl = cacheHeader()
  const stats = await authorLookup(name)

  if (wantJson) {
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
    return imageResponse(
      statusSvg("unavailable", opts, name, `@${name}`),
      format,
      "no-cache",
    )
  }
  if (!stats) {
    return imageResponse(
      statusSvg("missing", opts, name, `@${name}`),
      format,
      cacheControl,
    )
  }

  const count = opts.raw
    ? withCommas(stats.downloads)
    : humanize(stats.downloads)
  const rendered = opts.desc
    ? template(opts.desc, {
        downloads: count,
        extensions: String(stats.extensions),
      })
    : undefined

  if (opts.flat) {
    const message = rendered
      ? "text" in rendered
        ? rendered.text
        : rendered.prefix + rendered.strong + rendered.suffix
      : `${count} downloads`

    return imageResponse(
      flatSvg(
        opts.label ?? stats.name,
        message,
        opts.color,
        opts.logo,
        opts.labelColor,
      ),
      format,
      cacheControl,
    )
  }

  const plural = stats.extensions === 1 ? "" : "s"

  return imageResponse(
    cardSvg({
      title: opts.label ?? `@${stats.name}`,
      right: count,
      desc: rendered
        ? "text" in rendered
          ? rendered.text
          : undefined
        : `${stats.extensions} extension${plural} on Zed`,
      descSegments: rendered && "strong" in rendered ? rendered : undefined,
      theme: opts.theme,
    }),
    format,
    cacheControl,
  )
}
