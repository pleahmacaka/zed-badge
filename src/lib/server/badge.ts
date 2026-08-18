import { json } from "@sveltejs/kit"
import { cleanText } from "$lib/format"
import { cardSvg } from "$lib/server/card"
import { flatSvg } from "$lib/server/flat"
import { status, zed } from "$lib/tokens"

export interface BadgeOpts {
  label?: string
  color: string
  raw: boolean
  logo: boolean
  flat: boolean
  theme: "dark" | "light" | "auto"
  metric: string
  prefix: string
  suffix: string
}

const parseTheme = (value: string | null): BadgeOpts["theme"] => {
  if (value === "light" || value === "auto") {
    return value
  }

  return "dark"
}

export const parseOpts = (url: URL): BadgeOpts => ({
  label: cleanText(url.searchParams.get("label") ?? "") || undefined,
  color: url.searchParams.get("color") || zed.blue,
  raw: url.searchParams.get("raw") === "1",
  logo: url.searchParams.get("logo") !== "0",
  flat: url.searchParams.get("style") === "flat",
  theme: parseTheme(url.searchParams.get("theme")),
  metric: url.searchParams.get("metric") ?? "downloads",
  prefix: cleanText(url.searchParams.get("prefix") ?? ""),
  suffix: cleanText(url.searchParams.get("suffix") ?? ""),
})

export const stripExt = (file: string) => {
  for (const ext of [".svg", ".json"]) {
    if (file.endsWith(ext)) {
      return file.slice(0, -ext.length)
    }
  }

  return file
}

export const validSubject = (subject: string) =>
  subject.length > 0 && subject.length <= 64

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

export const jsonError = (message: string, statusCode: number) =>
  json(
    { error: message },
    {
      status: statusCode,
      headers: { "access-control-allow-origin": "*" },
    },
  )

export const shieldsEndpoint = (
  label: string,
  message: string,
  color: string,
) =>
  json({
    schemaVersion: 1,
    label,
    message,
    color,
    cacheSeconds: 300,
    namedLogo: "zedindustries",
  })
