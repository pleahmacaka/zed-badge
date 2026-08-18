<script lang="ts">
  import type { Snippet } from "svelte"

  let { label, children }: { label: string; children: Snippet } = $props()
</script>

<div class="flex items-center justify-between gap-2.5 border-b border-base-300 px-3 py-2.5 last:border-b-0">
  <span class="text-[0.62rem] text-secondary label-caps">{label}</span>
  {@render children()}
</div>
