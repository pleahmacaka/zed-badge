import type { ParamMatcher } from "@sveltejs/kit"

export const match: ParamMatcher = param => ["svg", "png"].includes(param)
