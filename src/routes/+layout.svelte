<script lang="ts">
  import "../app.css"
  import Icon from "@iconify/svelte"
  import { page } from "$app/state"
  import { REPO } from "$lib/constants"
  import { githubIcon, zedLogo } from "$lib/icons"

  let { children } = $props()

  const onDocs = $derived(page.url.pathname.startsWith("/docs"))
</script>

<div class="mx-auto min-h-screen max-w-4xl px-5 pt-10 pb-20 font-sans text-[0.9375rem] leading-relaxed">
  <header class="mb-1 flex items-center gap-3">
    <Icon icon={zedLogo} class="size-8 flex-none text-primary" />
    <h1 class="font-serif text-[1.65rem] font-semibold tracking-tight">Zed Extension Badges</h1>
    <nav class="ml-auto font-mono text-sm">
      {#if onDocs}
        <a class="link link-primary no-underline hover:underline" href="/">generator</a>
      {:else}
        <a class="link link-primary no-underline hover:underline" href="/docs">docs</a>
      {/if}
    </nav>
  </header>

  {@render children()}

  <footer class="mt-16 border-t border-base-300 pt-4 text-sm text-secondary">
    <p>
      Data: <a class="link link-primary" href="https://api.zed.dev/extensions">api.zed.dev</a>.
      Unofficial project, not affiliated with Zed Industries, Inc.
      Logo and fonts per the <a class="link link-primary" href="https://zed.dev/brand">Zed brand guidelines</a>.
    </p>
    <div class="mt-3 flex items-center justify-center gap-3">
      <a class="transition-colors hover:text-primary" href={REPO} aria-label="GitHub repository">
        <Icon icon={githubIcon} class="size-5" />
      </a>
      <span class="font-mono text-xs">MIT License</span>
    </div>
  </footer>
</div>
