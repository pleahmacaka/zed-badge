import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { snapshots } from "../src/lib/server/schema"

interface Env {
  DB: D1Database
  ZED_API?: string
}

interface ZedExtension {
  id: string
  download_count: number
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

const ROWS_PER_STATEMENT = 30

const fetchPage = async (url: string): Promise<ZedExtension[]> => {
  const res = await fetch(url, {
    headers: {
      "user-agent": "zed-badge-cron (+https://github.com/PleahMaCaka/zed-badge)",
    },
  })
  if (!res.ok) {
    return []
  }

  const body = (await res.json()) as { data?: ZedExtension[] }

  return body.data ?? []
}

const fetchIndex = async (apiBase: string): Promise<ZedExtension[]> => {
  const queries = ["", ...PROVIDES.map(p => `&provides=${p}`)]
  const pages = await Promise.all(
    queries.map(q => fetchPage(`${apiBase}?max_schema_version=100${q}`)),
  )

  return [...new Map(pages.flat().map(ext => [ext.id, ext])).values()]
}

const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }

  return out
}

export const snapshot = async (env: Env, date: string) => {
  const apiBase = env.ZED_API ?? "https://api.zed.dev/extensions"
  const extensions = await fetchIndex(apiBase)
  if (extensions.length === 0) {
    throw new Error("empty extension index, keeping previous snapshot")
  }

  const db = drizzle(env.DB)
  const inserts = chunk(extensions, ROWS_PER_STATEMENT).map(rows =>
    db
      .insert(snapshots)
      .values(
        rows.map(ext => ({
          extensionId: ext.id,
          date,
          downloads: ext.download_count,
        })),
      )
      .onConflictDoUpdate({
        target: [snapshots.extensionId, snapshots.date],
        set: { downloads: sql`excluded.downloads` },
      }),
  )
  await db.batch(inserts as [(typeof inserts)[number]])

  return extensions.length
}

export default {
  async scheduled(event: ScheduledController, env: Env) {
    const date = new Date(event.scheduledTime).toISOString().slice(0, 10)
    const count = await snapshot(env, date)
    console.log(`snapshot ${date}: ${count} extensions`)
  },
} satisfies ExportedHandler<Env>
