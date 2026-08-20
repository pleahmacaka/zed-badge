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

export type Rendered =
  | { text: string }
  | { prefix: string; strong: string; suffix: string }

const fill = (s: string, values: Record<string, string>) =>
  Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    s,
  )

export const template = (
  desc: string,
  values: Record<string, string>,
): Rendered => {
  for (const [key, value] of Object.entries(values)) {
    const token = `{{${key}}}`
    const at = desc.indexOf(token)
    if (at === -1) {
      continue
    }

    return {
      prefix: fill(desc.slice(0, at), values),
      strong: value,
      suffix: fill(desc.slice(at + token.length), values),
    }
  }

  return { text: fill(desc, values) }
}
