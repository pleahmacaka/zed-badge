import type { ParamMatcher } from "@sveltejs/kit"

export const match: ParamMatcher = param =>
  ["downloads", "downloads-raw", "version"].includes(param)
