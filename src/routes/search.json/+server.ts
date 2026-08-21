import { json, type RequestHandler } from "@sveltejs/kit"
import { displayName, fetchIndex } from "$lib/server/zed"

export const GET: RequestHandler = async () => {
  const index = await fetchIndex()
  if (index === "error") {
    return json({ extensions: [], authors: [] }, { status: 503 })
  }

  const extensions = index.extensions
    .map(ext => ({ id: ext.id, name: ext.name, downloads: ext.download_count }))
    .sort((a, b) => b.downloads - a.downloads)

  const byAuthor = new Map<string, number>()
  for (const ext of index.extensions) {
    for (const author of (ext.authors ?? []).map(displayName).filter(Boolean)) {
      byAuthor.set(author, (byAuthor.get(author) ?? 0) + ext.download_count)
    }
  }

  const authors = [...byAuthor]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  return json(
    { extensions, authors },
    { headers: { "cache-control": "public, max-age=600" } },
  )
}
