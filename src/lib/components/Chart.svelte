<script lang="ts" module>
  import type { CardContent } from "$lib/components/CardBody.svelte"
  import type { HistoryPoint } from "$lib/server/history"

  export interface ChartProps {
    card: CardContent
    points: HistoryPoint[]
  }

  const HEIGHT = 220
  const PLOT = { left: 46, right: 328, top: 96, bottom: 184 }
  const TICKS = 3
  const BANDS = 8
  const MAX_FILL = 0.3

  const niceCeil = (value: number) => {
    if (value <= 0) {
      return 1
    }

    const power = 10 ** Math.floor(Math.log10(value))
    const unit = [1, 2, 5, 10].find(u => u * power >= value) ?? 10

    return unit * power
  }

  const axisLabel = (v: number) => {
    if (v < 1_000) {
      return String(Math.round(v))
    }

    const [value, unit] = v < 999_500 ? [v / 1_000, "k"] : [v / 1_000_000, "M"]
    const digits = value < 10 ? 2 : value < 100 ? 1 : 0

    return `${Number(value.toFixed(digits))}${unit}`
  }

  const dateLabel = (iso: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
      new Date(iso),
    )
</script>

<script lang="ts">
  import CardBody, {
    CARD_HEIGHT,
    CARD_WIDTH,
    cardLabel,
  } from "$lib/components/CardBody.svelte"
  import { cardThemes, fontStack } from "$lib/tokens"

  const { card, points }: ChartProps = $props()

  const t = $derived(cardThemes[card.theme ?? "dark"])

  const hasData = $derived(points.length >= 2)
  const values = $derived(points.map(p => p.downloads))
  const low = $derived(hasData ? Math.min(...values) : 0)
  const high = $derived(hasData ? Math.max(...values) : 1)
  const step = $derived(niceCeil(Math.max(high - low, 1) / TICKS))
  const floor = $derived(Math.max(Math.floor(low / step) * step, 0))
  const ceil = $derived(Math.ceil(Math.max(high, floor + 1) / step) * step)

  const x = $derived(
    (i: number) =>
      PLOT.left +
      ((PLOT.right - PLOT.left) * i) / Math.max(points.length - 1, 1),
  )
  const y = $derived(
    (v: number) =>
      PLOT.bottom - ((PLOT.bottom - PLOT.top) * (v - floor)) / (ceil - floor),
  )

  const lineYs = $derived(points.map(p => y(p.downloads)))
  const line = $derived(
    lineYs.map((py, i) => `${x(i).toFixed(1)},${py.toFixed(1)}`).join(" "),
  )

  const bandStep = $derived((PLOT.bottom - PLOT.top) / BANDS)
  const bands = $derived(
    Array.from({ length: BANDS }, (_, band) => {
      const depth = (band + 1) * bandStep
      const upper = lineYs.map((py, i) => `${x(i).toFixed(1)},${py.toFixed(1)}`)
      const lower = lineYs
        .map(
          (py, i) =>
            `${x(i).toFixed(1)},${Math.min(py + depth, PLOT.bottom).toFixed(1)}`,
        )
        .reverse()

      return [...upper, ...lower].join(" ")
    }),
  )

  const gridValues = $derived(
    Array.from(
      { length: Math.round((ceil - floor) / step) },
      (_, i) => floor + step * (i + 1),
    ),
  )
  const dateTicks = $derived(
    Array.from({ length: hasData ? TICKS : 0 }, (_, i) => {
      const index = Math.round(((points.length - 1) * i) / (TICKS - 1))
      const anchor = i === 0 ? "start" : i === TICKS - 1 ? "end" : "middle"

      return { index, anchor, label: dateLabel(points[index].date) }
    }),
  )

  const last = $derived(points.at(-1))
  const label = $derived(
    hasData
      ? `${cardLabel(card)}, ${points[0].date} to ${last?.date}`
      : `${cardLabel(card)}, collecting download history`,
  )
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={CARD_WIDTH}
  height={HEIGHT}
  role="img"
  aria-label={label}
>
  <title>{label}</title>
  <rect width={CARD_WIDTH} height={HEIGHT} rx="8" fill={t.background} />
  <rect
    x="0.5"
    y="0.5"
    width={CARD_WIDTH - 1}
    height={HEIGHT - 1}
    rx="7.5"
    fill="none"
    stroke={t.border}
  />
  <CardBody {...card} />
  <line
    x1="0.5"
    y1={CARD_HEIGHT}
    x2={CARD_WIDTH - 0.5}
    y2={CARD_HEIGHT}
    stroke={t.border}
  />

  {#if hasData}
    {#each gridValues as value (value)}
      <line
        x1={PLOT.left}
        y1={y(value)}
        x2={PLOT.right}
        y2={y(value)}
        stroke={t.border}
      />
      <text
        x={PLOT.left - 6}
        y={y(value) + 3.5}
        font-family={fontStack}
        font-size="10"
        fill={t.subtle}
        text-anchor="end"
      >
        {axisLabel(value)}
      </text>
    {/each}
    {#each dateTicks as tick (tick.index)}
      <text
        x={x(tick.index)}
        y={PLOT.bottom + 20}
        font-family={fontStack}
        font-size="10"
        fill={t.subtle}
        text-anchor={tick.anchor}
      >
        {tick.label}
      </text>
    {/each}

    {#each bands as band (band)}
      <polygon points={band} fill={t.accent} fill-opacity={MAX_FILL / BANDS} />
    {/each}
    <polyline
      points={line}
      fill="none"
      stroke={t.accent}
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    {#if last}
      <circle
        cx={x(points.length - 1)}
        cy={y(last.downloads)}
        r="3.5"
        fill={t.accent}
        stroke={t.background}
        stroke-width="2"
      />
    {/if}
  {:else}
    <text
      x={CARD_WIDTH / 2}
      y={(PLOT.top + PLOT.bottom) / 2}
      font-family={fontStack}
      font-size="12"
      fill={t.subtle}
      text-anchor="middle"
    >
      collecting history, check back tomorrow
    </text>
  {/if}
</svg>
