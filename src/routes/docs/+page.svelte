<script lang="ts">
  import Param from "$lib/components/Param.svelte"
  import Seo from "$lib/components/Seo.svelte"

  let id = $state("windows-batch")
  let name = $state("PleahMaCaka")

  const idPath = $derived(encodeURIComponent(id.trim() || "windows-batch"))
  const namePath = $derived(encodeURIComponent(name.trim() || "PleahMaCaka"))
</script>

<Seo
  title="Docs, Zed Extension Badges"
  description="Every endpoint and query option for Zed extension badges and download charts"
  path="/docs"
/>

{#snippet heading(text: string)}
  <h2 class="mt-12 mb-3 border-b border-base-300 pb-2 text-lg font-semibold">
    {text}
  </h2>
{/snippet}

{#snippet example(sources: string[])}
  <div
    class="mb-4 flex flex-wrap items-center gap-3 rounded-box border border-base-300 bg-base-100 p-4 dotgrid"
  >
    {#each sources as src (src)}
      <img
        class="h-auto max-w-full"
        {src}
        alt="badge example"
        loading="lazy"
        decoding="async"
      />
    {/each}
  </div>
{/snippet}

<p class="mt-1 mb-7 font-serif italic text-secondary">
  Live badges for Zed extensions, rendered per request from api.zed.dev.
</p>
<p class="mb-4">
  The highlighted parts of each path are editable and every example on this page
  follows along; click an edited value to reset it. Swap <code>.svg</code> for
  <code>.png</code> on any image endpoint when the target refuses SVG, Discord
  included.
</p>

{@render heading("Extension badges")}
<p class="mb-4">
  Drop an extension id in the URL and embed it anywhere. The card matches
  zed.dev's own extension list.
</p>
{@render example([
  `/extension/${idPath}.svg`,
  `/extension/${idPath}.svg?style=flat`,
])}
<div class="overflow-x-auto">
  <table class="table table-sm">
    <tbody>
      <tr><td class="whitespace-nowrap"><code>/extension/<Param bind:value={id} initial="windows-batch" />.svg</code></td><td>card badge: Zed logo, name, download count, description, author line</td></tr>
      <tr><td class="whitespace-nowrap"><code>/extension/<Param bind:value={id} initial="windows-batch" />.png</code></td><td>same badge as PNG</td></tr>
      <tr><td class="whitespace-nowrap"><code>/extension/<Param bind:value={id} initial="windows-batch" />.json</code></td><td>raw Zed API metadata</td></tr>
    </tbody>
  </table>
</div>
<small class="mt-2 block text-sm text-secondary"><code>&lt;id&gt;</code> is the <code>id</code> from the extension's <code>extension.toml</code>.</small>

{@render heading("Download charts")}
<p class="mb-4">
  The same badge with the download trend attached below. Snapshots are taken
  daily, so a chart grows from the day an extension first appears in the index.
</p>
{@render example([`/chart/${idPath}.svg`])}
<div class="overflow-x-auto">
  <table class="table table-sm">
    <tbody>
      <tr><td class="whitespace-nowrap"><code>/chart/<Param bind:value={id} initial="windows-batch" />.svg</code></td><td>badge card plus cumulative download trend</td></tr>
    </tbody>
  </table>
</div>

{@render heading("Author badges")}
<p class="mb-4">
  One badge for everything you published: total downloads and extension count.
</p>
{@render example([`/author/${namePath}.svg`])}
<div class="overflow-x-auto">
  <table class="table table-sm">
    <tbody>
      <tr><td class="whitespace-nowrap"><code>/author/<Param bind:value={name} initial="PleahMaCaka" />.svg</code></td><td>card badge: @name, total downloads, extension count</td></tr>
      <tr><td class="whitespace-nowrap"><code>/author/<Param bind:value={name} initial="PleahMaCaka" />.json</code></td><td>raw stats: <code>{"{ name, extensions, downloads, ids }"}</code></td></tr>
    </tbody>
  </table>
</div>
<small class="mt-2 block text-sm text-secondary"><code>&lt;name&gt;</code> matches the name part of <code>authors</code> in <code>extension.toml</code>, case insensitive (email ignored).</small>

{@render heading("Custom badges")}
<p class="mb-4">Your text, same look. No upstream data involved.</p>
{@render example([
  "/custom.svg?message=Made+with+zed-badge",
  "/custom.svg?label=zed-badge&message=MIT&style=flat",
])}
<div class="overflow-x-auto">
  <table class="table table-sm">
    <tbody>
      <tr><td class="whitespace-nowrap"><code>/custom.svg?message=...</code></td><td>card badge with your own text</td></tr>
      <tr><td class="whitespace-nowrap"><code>/custom.svg?label=...&amp;message=...&amp;style=flat</code></td><td>thin variant, label left and message right</td></tr>
    </tbody>
  </table>
</div>
<small class="mt-2 block text-sm text-secondary">Extras: <code>right=</code> (top right value), <code>meta=</code> (gray author line). Each text field caps at 48 chars.</small>

{@render heading("Query options")}
<p class="mb-4">Options apply to every image endpoint unless noted.</p>
<div class="overflow-x-auto">
  <table class="table table-sm">
    <tbody>
      <tr><td class="whitespace-nowrap"><code>style=flat</code></td><td>thin flat badge instead of the card</td></tr>
      <tr><td class="whitespace-nowrap"><code>theme=light</code></td><td>cream light card (default is dark, card only)</td></tr>
      <tr><td class="whitespace-nowrap"><code>label=</code></td><td>override the title (card) or left label (flat)</td></tr>
      <tr><td class="whitespace-nowrap"><code>desc=</code></td><td>replace the description with your own text; <code>{"{{downloads}}"}</code>, <code>{"{{version}}"}</code> (extension) and <code>{"{{extensions}}"}</code> (author) are substituted, and the first variable renders bold (max 48 chars)</td></tr>
      <tr><td class="whitespace-nowrap"><code>desc=0</code> / <code>author=0</code></td><td>hide the description or author line; the card recenters</td></tr>
      <tr><td class="whitespace-nowrap"><code>category=1</code></td><td>show the extension category tag (Language, Theme, LSP, ...)</td></tr>
      <tr><td class="whitespace-nowrap"><code>metric=version</code></td><td>version instead of downloads (extension only)</td></tr>
      <tr><td class="whitespace-nowrap"><code>raw=1</code></td><td>full count with commas (1,234) instead of 1.2k or 1.2M</td></tr>
      <tr><td class="whitespace-nowrap"><code>color=</code></td><td>flat badge value color (default Zed brand blue)</td></tr>
      <tr><td class="whitespace-nowrap"><code>logo=0</code></td><td>remove the logo (flat only)</td></tr>
    </tbody>
  </table>
</div>

{@render heading("Freshness and errors")}
<p class="mb-4">
  Badges render fresh on every request behind a short cache; end to end they
  update within about 5 minutes. Unknown ID or name renders a red
  <code>not found</code> badge. Upstream outages render a grey
  <code>unavailable</code> badge (never cached). Your README never shows a
  broken image.
</p>
{@render example(["/extension/not-a-real-extension.svg"])}
