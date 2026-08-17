import { env } from "$env/dynamic/private"

export const apiBase = () => env.ZED_API ?? "https://api.zed.dev/extensions"

export const cacheHeader = () => {
  const maxAge = env.BADGE_MAX_AGE ? Number(env.BADGE_MAX_AGE) : 300
  if (!Number.isFinite(maxAge) || maxAge <= 0) {
    return "no-cache, max-age=0"
  }

  return `public, max-age=${maxAge}, stale-while-revalidate=60`
}
