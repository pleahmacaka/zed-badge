const NO_LEADING_SPACE = " .,!?;:%)]"

const isPrintable = (c: string) => c >= " " && c !== "<" && c !== ">"

export const humanize = (n: number): string => {
  if (n < 1_000) {
    return String(n)
  }

  const [value, unit] = n < 999_500 ? [n / 1_000, "k"] : [n / 1_000_000, "M"]
  if (value >= 10) {
    return `${Math.round(value)}${unit}`
  }

  const fixed = value.toFixed(1)

  return `${fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed}${unit}`
}

export const withCommas = (n: number): string => n.toLocaleString("en-US")

export const cleanText = (s = ""): string =>
  [...s].filter(isPrintable).slice(0, 48).join("")

const fmtPrefix = (prefix: string) => {
  if (!prefix) {
    return ""
  }

  return prefix.endsWith(" ") ? prefix : `${prefix} `
}

const fmtSuffix = (suffix: string) => {
  if (!suffix) {
    return ""
  }

  return NO_LEADING_SPACE.includes(suffix[0]) ? suffix : ` ${suffix}`
}

export const wrap = (prefix: string, value: string, suffix: string) => {
  if (!prefix && !suffix) {
    return value
  }

  return `${fmtPrefix(prefix)}${value}${fmtSuffix(suffix)}`.trim()
}

export const segments = (prefix: string, strong: string, suffix: string) => {
  if (!prefix && !suffix) {
    return undefined
  }

  return { prefix: fmtPrefix(prefix), strong, suffix: fmtSuffix(suffix) }
}
