import { json } from "@sveltejs/kit"
import type { CardProps } from "$lib/components/Card.svelte"
import { cleanText, humanize, template, withCommas } from "$lib/format"
import { cardSvg } from "$lib/server/card"
import { flatSvg } from "$lib/server/flat"
import { toPng } from "$lib/server/png"
import { category, displayName, type ZedExtension } from "$lib/server/zed"
import { status, zed } from "$lib/tokens"

export interface BadgeOpts {
  label?: string
  color: string
  raw: boolean
  logo: boolean
  flat: boolean
  theme: "dark" | "light"
  metric: string
  desc: string
  author: boolean
  category: boolean
}

const parseTheme = (value: string | null): BadgeOpts["theme"] =>
  value === "light" ? "light" : "dark"

export const parseOpts = (url: URL): BadgeOpts => ({
  label: cleanText(url.searchParams.get("label") ?? "") || undefined,
  color: url.searchParams.get("color") || zed.blue,
  raw: url.searchParams.get("raw") === "1",
  logo: url.searchParams.get("logo") !== "0",
  flat: url.searchParams.get("style") === "flat",
  theme: parseTheme(url.searchParams.get("theme")),
  metric: url.searchParams.get("metric") ?? "downloads",
  desc: cleanText(url.searchParams.get("desc") ?? ""),
  author: url.searchParams.get("author") !== "0",
  category: url.searchParams.get("category") === "1",
})

export const stripExt = (file: string) => {
  for (const ext of [".svg", ".png", ".json"]) {
    if (file.endsWith(ext)) {
      return file.slice(0, -ext.length)
    }
  }

  return file
}

export const imageFormat = (file: string): "svg" | "png" =>
  file.endsWith(".png") ? "png" : "svg"

export const validSubject = (subject: string) =>
  subject.length > 0 && subject.length <= 64

export const extensionCard = (
  ext: ZedExtension,
  opts: BadgeOpts,
): CardProps => {
  const isVersion = opts.metric === "version"
  const count = opts.raw
    ? withCommas(ext.download_count)
    : humanize(ext.download_count)
  const value = isVersion ? `v${ext.version}` : count
  const hideDesc = opts.desc === "0"
  const rendered =
    opts.desc && !hideDesc
      ? template(opts.desc, { downloads: count, version: `v${ext.version}` })
      : undefined

  return {
    title: opts.label ?? ext.name,
    right: value,
    desc: hideDesc
      ? undefined
      : rendered
        ? "text" in rendered
          ? rendered.text
          : undefined
        : ext.description,
    descSegments: rendered && "strong" in rendered ? rendered : undefined,
    meta: opts.author ? ext.authors?.map(displayName).join(", ") : undefined,
    tag: opts.category ? category(ext) : undefined,
    theme: opts.theme,
  }
}

export const statusSvg = (
  state: "missing" | "unavailable",
  opts: BadgeOpts,
  flatLabel: string,
  cardTitle: string,
) => {
  const message = state === "unavailable" ? "unavailable" : "not found"
  const color = state === "unavailable" ? status.unavailable : status.notFound

  if (opts.flat) {
    return flatSvg(opts.label ?? flatLabel, message, color, opts.logo)
  }

  return cardSvg({
    title: opts.label ?? cardTitle,
    desc: message,
    descColor: color,
    theme: opts.theme,
  })
}

export const svgResponse = (body: string, cacheControl: string) =>
  new Response(body, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": cacheControl,
      "access-control-allow-origin": "*",
    },
  })

export const imageResponse = async (
  svg: string,
  format: "svg" | "png",
  cacheControl: string,
) => {
  if (format === "svg") {
    return svgResponse(svg, cacheControl)
  }

  const png = await toPng(svg)

  return new Response(png.slice().buffer, {
    headers: {
      "content-type": "image/png",
      "cache-control": cacheControl,
      "access-control-allow-origin": "*",
    },
  })
}

export const jsonError = (message: string, statusCode: number) =>
  json(
    { error: message },
    {
      status: statusCode,
      headers: { "access-control-allow-origin": "*" },
    },
  )
