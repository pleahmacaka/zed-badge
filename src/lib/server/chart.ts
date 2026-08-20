import { render } from "svelte/server"
import Chart, { type ChartProps } from "$lib/components/Chart.svelte"

export const chartSvg = (props: ChartProps): string =>
  render(Chart, { props }).body
