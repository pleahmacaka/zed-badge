import type { D1Database } from "@cloudflare/workers-types"
import { asc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { snapshots } from "$lib/server/schema"

export interface HistoryPoint {
  date: string
  downloads: number
}

const MAX_POINTS = 90

export const downsample = (points: HistoryPoint[]): HistoryPoint[] => {
  if (points.length <= MAX_POINTS) {
    return points
  }

  const step = Math.ceil(points.length / MAX_POINTS)
  const sampled = points.filter((_, i) => i % step === 0)
  const last = points.at(-1)
  if (last && sampled.at(-1) !== last) {
    sampled.push(last)
  }

  return sampled
}

export const history = async (
  db: D1Database,
  id: string,
): Promise<HistoryPoint[]> => {
  const rows = await drizzle(db)
    .select({ date: snapshots.date, downloads: snapshots.downloads })
    .from(snapshots)
    .where(eq(snapshots.extensionId, id))
    .orderBy(asc(snapshots.date))

  return downsample(rows)
}
