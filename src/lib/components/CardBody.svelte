<script lang="ts" module>
  export interface CardContent {
    title: string
    right?: string
    desc?: string
    descSegments?: { prefix: string; strong: string; suffix: string }
    descColor?: string
    meta?: string
    tag?: string
    theme?: "dark" | "light"
  }

  export const CARD_WIDTH = 360
  export const CARD_HEIGHT = 70
  const PADDING = 14
  const LOGO_X = 16
  const LOGO_SIZE = 32
  const TEXT_X = LOGO_X + LOGO_SIZE + 16

  const clip = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value

  export const cardLabel = (content: CardContent) =>
    [
      content.title,
      content.desc ??
        (content.descSegments
          ? content.descSegments.prefix +
            content.descSegments.strong +
            content.descSegments.suffix
          : ""),
      content.right,
    ]
      .filter(Boolean)
      .join(", ")
</script>

<script lang="ts">
  import Icon from "@iconify/svelte"
  import { downloadIcon, userIcon, zedLogo } from "$lib/icons"
  import { cardThemes, fontStack } from "$lib/tokens"

  const {
    title,
    right,
    desc,
    descSegments,
    descColor,
    meta,
    tag,
    theme = "dark",
  }: CardContent = $props()

  const t = $derived(cardThemes[theme])
  const shownTitle = $derived(clip(title, 26))
  const shownDesc = $derived(desc ? clip(desc, 44) : "")
  const shownMeta = $derived(meta ? clip(meta, tag ? 30 : 40) : "")
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
  const hasDesc = $derived(Boolean(shownSegments || shownDesc))
  const rows = $derived(1 + (hasDesc ? 1 : 0) + (shownMeta ? 1 : 0))
  const titleY = $derived(rows === 3 ? 24 : rows === 2 ? 30 : 40)
  const descY = $derived(titleY + 17.5)
  const metaY = $derived(rows === 3 ? 60 : titleY + 18.5)
</script>

<Icon
  icon={zedLogo}
  x={LOGO_X}
  y={(CARD_HEIGHT - LOGO_SIZE) / 2}
  width={LOGO_SIZE}
  height={LOGO_SIZE}
  color={t.logo}
/>
<text
  x={TEXT_X}
  y={titleY}
  font-family={fontStack}
  font-size="14.5"
  font-weight="700"
  fill={t.title}
>
  {shownTitle}
</text>
{#if right}
  <text
    x={CARD_WIDTH - PADDING - 18}
    y={titleY}
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
    x={CARD_WIDTH - PADDING - 13}
    y={titleY - 11}
    width="13"
    height="13"
    color={t.subtle}
  />
{/if}
{#if shownSegments}
  <text x={TEXT_X} y={descY} font-family={fontStack} font-size="12">
    <tspan fill={t.subtle}>{shownSegments.prefix}</tspan>
    <tspan font-weight="700" fill={t.accent}>{shownSegments.strong}</tspan>
    <tspan fill={t.subtle}>{shownSegments.suffix}</tspan>
  </text>
{:else if shownDesc}
  <text
    x={TEXT_X}
    y={descY}
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
    x={TEXT_X}
    y={metaY - 9.5}
    width="11"
    height="11"
    color={t.subtle}
  />
  <text
    x={TEXT_X + 15}
    y={metaY}
    font-family={fontStack}
    font-size="11.5"
    fill={t.subtle}
  >
    {shownMeta}
  </text>
  {#if tag}
    <text
      x={CARD_WIDTH - PADDING}
      y={metaY}
      font-family={fontStack}
      font-size="11"
      fill={t.subtle}
      text-anchor="end"
    >
      {tag}
    </text>
  {/if}
{/if}
