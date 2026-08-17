import { render } from "svelte/server"
import Card, { type CardProps } from "$lib/components/Card.svelte"

export const cardSvg = (props: CardProps): string =>
  render(Card, { props }).body
