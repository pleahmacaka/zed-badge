<script lang="ts">
</script>

<svelte:head>
  <title>Docs, Zed Extension Badges</title>
  <meta
    name="description"
    content="Every endpoint and query option for Zed extension and author badges"
  />
</svelte:head>

{#snippet heading(text: string)}
  <h2 class="mt-12 mb-3 border-b border-base-300 pb-2 text-lg font-semibold">{text}</h2>
{/snippet}

{#snippet example(sources: string[])}
  <div
    class="mb-4 flex flex-wrap items-center gap-3 rounded-box border border-base-300 bg-base-100 p-4 dotgrid"
  >
    {#each sources as src (src)}
      <img {src} alt="badge example" />
    {/each}
  </div>
{/snippet}

<p class="mt-1 mb-7 font-serif italic text-secondary">
  All endpoints. Badges are rendered per request. Freshness is about 5 minutes end to end.
</p>

{@render heading("Extension badges")}
<p class="mb-4">
  Drop an extension id in the URL and embed it anywhere. The card matches zed.dev's own
  extension list; the flat style is rendered by shields' badge-maker.
</p>
{@render example([
  "/extension/windows-batch.svg?theme=auto",
  "/extension/windows-batch.svg?style=flat",
])}
<table class="table table-sm">
  <tbody>
    <tr><td><code>/extension/&lt;id&gt;.svg</code></td><td>card badge: Zed logo, name, download count, description, author line</td></tr>
    <tr><td><code>/extension/&lt;id&gt;.svg?style=flat</code></td><td>thin shields style badge</td></tr>
    <tr><td><code>/extension/&lt;id&gt;.svg?metric=version</code></td><td>version instead of downloads</td></tr>
    <tr><td><code>/extension/&lt;id&gt;.json</code></td><td>raw Zed API metadata (not a badge)</td></tr>
  </tbody>
</table>
<small class="mt-2 block text-sm text-secondary"><code>&lt;id&gt;</code> is the <code>id</code> from the extension's <code>extension.toml</code>.</small>

{@render heading("Author badges")}
<p class="mb-4">One badge for everything you published: total downloads and extension count.</p>
{@render example(["/author/PleahMaCaka.svg?theme=auto"])}
<table class="table table-sm">
  <tbody>
    <tr><td><code>/author/&lt;name&gt;.svg</code></td><td>card badge: @name, total downloads, extension count</td></tr>
    <tr><td><code>/author/&lt;name&gt;.svg?style=flat</code></td><td>thin variant</td></tr>
    <tr><td><code>/author/&lt;name&gt;.json</code></td><td>raw stats: <code>{"{ name, extensions, downloads, ids }"}</code></td></tr>
  </tbody>
</table>
<small class="mt-2 block text-sm text-secondary"><code>&lt;name&gt;</code> matches the name part of <code>authors</code> in <code>extension.toml</code>, case insensitive (email ignored). The upstream API has no user endpoint, so stats aggregate over the full extension index (cached 10 min).</small>

{@render heading("Custom badges")}
<p class="mb-4">Your text, same look. No upstream data involved.</p>
{@render example([
  "/custom.svg?message=Made+with+zed-badge&theme=auto",
  "/custom.svg?label=zed-badge&message=MIT&style=flat",
])}
<table class="table table-sm">
  <tbody>
    <tr><td><code>/custom.svg?message=...</code></td><td>card badge with your own text</td></tr>
    <tr><td><code>/custom.svg?label=...&amp;message=...&amp;style=flat</code></td><td>thin variant, label left and message right</td></tr>
  </tbody>
</table>
<small class="mt-2 block text-sm text-secondary">Extras: <code>right=</code> (top right value), <code>meta=</code> (gray author line). Each text field caps at 48 chars.</small>

{@render heading("shields.io endpoints")}
<p class="mb-4">
  Prefer shields' own styling? These return endpoint JSON for
  <code>img.shields.io/endpoint</code>.
</p>
<table class="table table-sm">
  <tbody>
    <tr><td><code>/downloads/&lt;id&gt;.json</code></td><td>humanized count (957, 12k, 1.2M)</td></tr>
    <tr><td><code>/downloads-raw/&lt;id&gt;.json</code></td><td>full count with commas (1,234)</td></tr>
    <tr><td><code>/version/&lt;id&gt;.json</code></td><td>version</td></tr>
  </tbody>
</table>
<pre class="mt-3 overflow-x-auto rounded-field border border-base-300 bg-base-100 px-3.5 py-3 font-mono text-sm break-all whitespace-pre-wrap">![Zed downloads](https://img.shields.io/endpoint?url=&lt;encoded URL of /downloads/&lt;id&gt;.json&gt;)</pre>
<small class="mt-2 block text-sm text-secondary">shields enforces a cache of at least 5 minutes on its own.</small>

{@render heading("Query options")}
<table class="table table-sm">
  <tbody>
    <tr><td><code>theme=</code></td><td><code>light</code> for the cream card, <code>auto</code> to follow the viewer's dark mode via a media query inside the SVG (GitHub supports this). Default is dark, card only.</td></tr>
    <tr><td><code>label=</code></td><td>override the title (card) or left label (flat)</td></tr>
    <tr><td><code>prefix=</code> / <code>suffix=</code></td><td>custom text around the number, replacing the description: <code>prefix=Thanks+for&amp;suffix=downloading!</code> renders "Thanks for <b>12.2k</b> downloading!" (spacing added automatically, max 48 chars each)</td></tr>
    <tr><td><code>raw=1</code></td><td>full count with commas (1,234) instead of 1.2k or 1.2M</td></tr>
    <tr><td><code>color=</code></td><td>flat badge value color (default Zed brand blue)</td></tr>
    <tr><td><code>logo=0</code></td><td>remove the logo (flat only)</td></tr>
  </tbody>
</table>

{@render heading("Errors")}
<p class="mb-4">
  Unknown ID or name renders a red <code>not found</code> badge. Upstream outages render a grey
  <code>unavailable</code> badge (never cached). Your README never shows a broken image.
</p>
{@render example(["/extension/not-a-real-extension.svg?theme=auto"])}
