<script lang="ts" module>
  export interface CardProps {
    title: string
    right?: string
    desc?: string
    descSegments?: { prefix: string; strong: string; suffix: string }
    descColor?: string
    meta?: string
    theme?: "dark" | "light" | "auto"
  }

  const WIDTH = 360
  const HEIGHT = 70
  const PADDING = 14
  const LOGO_SIZE = 32
  const TEXT_X = PADDING + LOGO_SIZE + 12

  const clip = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value

  const rules = (t: CardTheme) =>
    `.bg{fill:${t.background}}.frame{stroke:${t.border}}.title{fill:${t.title}}` +
    `.accent{fill:${t.accent}}.subtle{fill:${t.subtle}}` +
    `.icon{color:${t.subtle}}.logo{color:${t.logo}}`
</script>

<script lang="ts">
  import Icon from "@iconify/svelte"
  import { downloadIcon, userIcon, zedLogo } from "$lib/icons"
  import { type CardTheme, cardThemes, fontStack } from "$lib/tokens"

  const { title, right, desc, descSegments, descColor, meta, theme = "dark" }: CardProps = $props()

  const auto = $derived(theme === "auto")
  const t = $derived(cardThemes[theme === "auto" ? "light" : theme])
  const autoCss = $derived(
    `${rules(cardThemes.light)}@media(prefers-color-scheme:dark){${rules(cardThemes.dark)}}`,
  )
  const dy = $derived(meta ? 0 : 7)
  const shownTitle = $derived(clip(title, 26))
  const shownDesc = $derived(desc ? clip(desc, 44) : "")
  const shownMeta = $derived(meta ? clip(meta, 40) : "")
  const shownSegments = $derived.by(() => {
    if (!descSegments) {
      return undefined
    }

    const prefix = clip(descSegments.prefix, 20)
    const budget = 44 - prefix.length - descSegments.strong.length

    return {
      prefix,
      strong: descSegments.strong,
      suffix: clip(descSegments.suffix, Math.max(budget, 0)),
    }
  })
  const label = $derived(
    [title, desc ?? (descSegments ? descSegments.prefix + descSegments.strong + descSegments.suffix : ""), right]
      .filter(Boolean)
      .join(", "),
  )
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={WIDTH} height={HEIGHT} role="img" aria-label={label}>
  <title>{label}</title>
  {#if auto}
    <svelte:element this={"style"}>{autoCss}</svelte:element>
  {/if}
  <rect class="bg" width={WIDTH} height={HEIGHT} rx="8" fill={t.background} />
  <rect
    class="frame"
    x="0.5"
    y="0.5"
    width={WIDTH - 1}
    height={HEIGHT - 1}
    rx="7.5"
    fill="none"
    stroke={t.border}
  />
  <Icon
    icon={zedLogo}
    class="logo"
    x={PADDING}
    y={(HEIGHT - LOGO_SIZE) / 2}
    width={LOGO_SIZE}
    height={LOGO_SIZE}
    color={auto ? undefined : t.logo}
  />
  <text
    class="title"
    x={TEXT_X}
    y={24 + dy}
    font-family={fontStack}
    font-size="14.5"
    font-weight="700"
    fill={t.title}
  >
    {shownTitle}
  </text>
  {#if right}
    <text
      class="accent"
      x={WIDTH - PADDING - 18}
      y={24 + dy}
      font-family={fontStack}
      font-size="12.5"
      font-weight="600"
      fill={t.accent}
      text-anchor="end"
    >
      {right}
    </text>
    <Icon
      icon={downloadIcon}
      class="icon"
      x={WIDTH - PADDING - 13}
      y={13 + dy}
      width="13"
      height="13"
      color={auto ? undefined : t.subtle}
    />
  {/if}
  {#if shownSegments}
    <text x={TEXT_X} y={43.5 + dy} font-family={fontStack} font-size="12">
      <tspan class="subtle" fill={t.subtle}>{shownSegments.prefix}</tspan>
      <tspan class="accent" font-weight="700" fill={t.accent}>{shownSegments.strong}</tspan>
      <tspan class="subtle" fill={t.subtle}>{shownSegments.suffix}</tspan>
    </text>
  {:else if shownDesc}
    <text
      class={descColor ? undefined : "subtle"}
      x={TEXT_X}
      y={43.5 + dy}
      font-family={fontStack}
      font-size="12"
      fill={descColor ?? t.subtle}
    >
      {shownDesc}
    </text>
  {/if}
  {#if shownMeta}
    <Icon
      icon={userIcon}
      class="icon"
      x={TEXT_X}
      y="50.5"
      width="11"
      height="11"
      color={auto ? undefined : t.subtle}
    />
    <text
      class="subtle"
      x={TEXT_X + 15}
      y="60"
      font-family={fontStack}
      font-size="11.5"
      fill={t.subtle}
    >
      {shownMeta}
    </text>
  {/if}
</svg>
