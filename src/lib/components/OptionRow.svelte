<script lang="ts">
  import Icon from "@iconify/svelte"
  import type { Snippet } from "svelte"
  import { helpIcon } from "$lib/icons"

  let {
    label,
    help,
    children,
  }: { label: string; help?: string; children: Snippet } = $props()
</script>

<div
  class="flex items-center justify-between gap-2.5 border-b border-base-300 px-3 py-2.5 last:border-b-0"
>
  <span class="flex items-center gap-1 text-[0.62rem] text-secondary label-caps">
    {label}
    {#if help}
      <span class="tooltip tooltip-bottom normal-case" data-tip={help}>
        <Icon icon={helpIcon} class="size-3.5" />
      </span>
    {/if}
  </span>
  {@render children()}
</div>
