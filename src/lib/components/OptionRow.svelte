<script lang="ts">
  import Icon from "@iconify/svelte"
  import type { Snippet } from "svelte"
  import { helpIcon } from "$lib/icons"

  let {
    label,
    help,
    stacked = false,
    aside,
    children,
  }: {
    label: string
    help?: string
    stacked?: boolean
    aside?: Snippet
    children: Snippet
  } = $props()
</script>

{#snippet name()}
  <span class="flex items-center gap-1 text-[0.62rem] text-secondary label-caps">
    {label}
    {#if help}
      <span class="tooltip tooltip-bottom normal-case" data-tip={help}>
        <Icon icon={helpIcon} class="size-3.5" />
      </span>
    {/if}
  </span>
{/snippet}

<div
  class="flex border-b border-base-300 px-3 py-2.5 last:border-b-0 {stacked
    ? 'flex-col gap-2'
    : 'items-center justify-between gap-2.5'}"
>
  {#if stacked}
    <div class="flex items-center justify-between gap-2.5">
      {@render name()}
      {#if aside}{@render aside()}{/if}
    </div>
  {:else}
    {@render name()}
  {/if}
  {@render children()}
</div>
