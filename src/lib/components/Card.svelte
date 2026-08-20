<script lang="ts" module>
  import type { CardContent } from "$lib/components/CardBody.svelte"

  export type CardProps = CardContent
</script>

<script lang="ts">
  import CardBody, {
    CARD_HEIGHT,
    CARD_WIDTH,
    cardLabel,
  } from "$lib/components/CardBody.svelte"
  import { cardThemes } from "$lib/tokens"

  const props: CardProps = $props()

  const t = $derived(cardThemes[props.theme ?? "dark"])
  const label = $derived(cardLabel(props))
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={CARD_WIDTH}
  height={CARD_HEIGHT}
  role="img"
  aria-label={label}
>
  <title>{label}</title>
  <rect width={CARD_WIDTH} height={CARD_HEIGHT} rx="8" fill={t.background} />
  <rect
    x="0.5"
    y="0.5"
    width={CARD_WIDTH - 1}
    height={CARD_HEIGHT - 1}
    rx="7.5"
    fill="none"
    stroke={t.border}
  />
  <CardBody {...props} />
</svg>
