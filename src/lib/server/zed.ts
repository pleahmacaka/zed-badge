import { REPO } from "$lib/constants"
import { apiBase } from "$lib/server/env"

export interface ZedExtension {
  id: string
  name: string
  version: string
  description: string
  authors?: string[]
  download_count: number
}

export interface AuthorStats {
  name: string
  extensions: number
  downloads: number
  ids: string[]
}

export type Result<T> = T | null | "error"

interface EdgeFetchInit extends RequestInit {
  cf?: { cacheEverything: boolean; cacheTtl: number }
}

const EXTENSION_TTL = 60
const INDEX_TTL = 600

export const displayName = (author: string) => {
  const bracket = author.indexOf("<")
  const name = bracket === -1 ? author : author.slice(0, bracket)

  return name.trim()
}

const edgeCached = (ttl: number): EdgeFetchInit => ({
  headers: { "user-agent": `zed-badge (+${REPO})` },
  cf: { cacheEverything: true, cacheTtl: ttl },
})

const fetchData = async (
  url: string,
  ttl: number,
): Promise<ZedExtension[] | "error"> => {
  try {
    const res = await fetch(url, edgeCached(ttl))
    if (!res.ok) {
      return "error"
    }

    const body = (await res.json()) as { data?: ZedExtension[] }

    return body.data ?? []
  } catch {
    return "error"
  }
}

export const lookup = async (id: string): Promise<Result<ZedExtension>> => {
  const extensions = await fetchData(
    `${apiBase()}/${encodeURIComponent(id)}`,
    EXTENSION_TTL,
  )
  if (extensions === "error") {
    return "error"
  }

  return extensions.at(0) ?? null
}

const aggregateAuthors = (
  extensions: ZedExtension[],
): Map<string, AuthorStats> => {
  const credits = extensions.flatMap(ext =>
    (ext.authors ?? [])
      .map(displayName)
      .filter(Boolean)
      .map(author => ({ author, ext })),
  )

  const grouped = Map.groupBy(credits, credit => credit.author.toLowerCase())

  return new Map(
    [...grouped].map(([key, group]) => [
      key,
      {
        name: group[0].author,
        extensions: group.length,
        downloads: group.reduce(
          (sum, credit) => sum + credit.ext.download_count,
          0,
        ),
        ids: group.map(credit => credit.ext.id),
      },
    ]),
  )
}

const PROVIDES = [
  "languages",
  "themes",
  "icon-themes",
  "grammars",
  "language-servers",
  "context-servers",
  "slash-commands",
  "debug-adapters",
  "snippets",
  "agent-servers",
]

interface Index {
  extensions: ZedExtension[]
  partial: boolean
}

const fetchIndex = async (): Promise<Index | "error"> => {
  const queries = ["", ...PROVIDES.map(p => `&provides=${p}`)]
  const pages = await Promise.all(
    queries.map(q =>
      fetchData(`${apiBase()}?max_schema_version=100${q}`, INDEX_TTL),
    ),
  )

  if (pages.every(page => page === "error")) {
    return "error"
  }

  const found = pages.filter(page => page !== "error").flat()

  return {
    extensions: [...new Map(found.map(ext => [ext.id, ext])).values()],
    partial: pages.some(page => page === "error"),
  }
}

export const authorLookup = async (
  name: string,
): Promise<Result<AuthorStats>> => {
  const index = await fetchIndex()
  if (index === "error") {
    return "error"
  }

  const stats = aggregateAuthors(index.extensions).get(
    name.trim().toLowerCase(),
  )
  if (!stats && index.partial) {
    return "error"
  }

  return stats ?? null
}
