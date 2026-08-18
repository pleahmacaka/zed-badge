import { humanize, withCommas } from "$lib/format"
import {
  jsonError,
  parseOpts,
  shieldsEndpoint,
  stripExt,
  validSubject,
} from "$lib/server/badge"
import { lookup } from "$lib/server/zed"
import { status } from "$lib/tokens"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, url }) => {
  const id = stripExt(params.file)
  if (!validSubject(id)) {
    return jsonError("bad extension id", 400)
  }

  const opts = parseOpts(url)
  const ext = await lookup(id)

  const label =
    opts.label ?? (params.kind === "version" ? "zed extension" : "downloads")
  if (ext === "error") {
    return shieldsEndpoint(label, "unavailable", status.unavailable)
  }
  if (!ext) {
    return shieldsEndpoint(label, "not found", status.notFound)
  }

  if (params.kind === "version") {
    return shieldsEndpoint(label, `v${ext.version}`, opts.color)
  }

  const raw = params.kind === "downloads-raw" || opts.raw
  const message = raw
    ? withCommas(ext.download_count)
    : humanize(ext.download_count)

  return shieldsEndpoint(label, message, opts.color)
}
