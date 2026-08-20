import { json } from "@sveltejs/kit"
import { humanize, template, withCommas } from "$lib/format"
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
import { cacheHeader } from "$lib/server/env"
import { flatSvg } from "$lib/server/flat"
import { lookup } from "$lib/server/zed"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url }) => {
  const wantJson = params.file.endsWith(".json")
  const format = imageFormat(params.file)
  const id = stripExt(params.file)
  if (!validSubject(id)) {
    return jsonError("bad extension id", 400)
  }

  const opts = parseOpts(url)
  const cacheControl = cacheHeader()
  const ext = await lookup(id)

  if (wantJson) {
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
    return imageResponse(
      statusSvg("unavailable", opts, "downloads", id),
      format,
      "no-cache",
    )
  }
  if (!ext) {
    return imageResponse(
      statusSvg("missing", opts, "downloads", id),
      format,
      cacheControl,
    )
  }

  const isVersion = opts.metric === "version"
  const count = opts.raw
    ? withCommas(ext.download_count)
    : humanize(ext.download_count)
  const value = isVersion ? `v${ext.version}` : count
  const rendered = opts.desc
    ? template(opts.desc, { downloads: count, version: `v${ext.version}` })
    : undefined

  if (opts.flat) {
    const label = opts.label ?? (isVersion ? "zed extension" : "downloads")
    const message = rendered
      ? "text" in rendered
        ? rendered.text
        : rendered.prefix + rendered.strong + rendered.suffix
      : value

    return imageResponse(
      flatSvg(label, message, opts.color, opts.logo),
      format,
      cacheControl,
    )
  }

  return imageResponse(cardSvg(extensionCard(ext, opts)), format, cacheControl)
}
