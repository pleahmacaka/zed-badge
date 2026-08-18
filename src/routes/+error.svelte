<script lang="ts">
  import { page } from "$app/state"
</script>

<svelte:head>
  <title>{page.status}, Zed Extension Badges</title>
</svelte:head>

<div class="mt-24 flex flex-col items-center gap-3 text-center">
  <p class="font-mono text-6xl font-bold text-primary">{page.status}</p>
  <p class="font-serif italic text-secondary">
    {page.error?.message ?? "something went wrong"}
  </p>
  <a class="link link-primary mt-2 font-mono text-sm" href="/">
    back to generator
  </a>
</div>
