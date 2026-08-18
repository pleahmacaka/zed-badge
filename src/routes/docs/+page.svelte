<svelte:head>
  <title>Docs, Zed Extension Badges</title>
  <meta
    name="description"
    content="Every endpoint and query option for Zed extension and author badges"
  />
</svelte:head>

<p class="mt-1 mb-7 font-serif italic text-secondary">
  All endpoints. Badges are rendered per request. Freshness is about 5 minutes end to end.
</p>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">Extension badges</h2>
<table class="table table-sm">
  <tbody>
    <tr><td><code>/extension/&lt;id&gt;.svg</code></td><td>card badge: Zed logo, name, download count, description, author line (matches zed.dev's extension cards)</td></tr>
    <tr><td><code>/extension/&lt;id&gt;.svg?style=flat</code></td><td>thin shields style badge</td></tr>
    <tr><td><code>/extension/&lt;id&gt;.svg?metric=version</code></td><td>version instead of downloads</td></tr>
  </tbody>
</table>
<small class="mt-2 block text-sm text-secondary"><code>&lt;id&gt;</code> is the <code>id</code> from the extension's <code>extension.toml</code>.</small>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">Author badges</h2>
<table class="table table-sm">
  <tbody>
    <tr><td><code>/author/&lt;name&gt;.svg</code></td><td>card badge: @name, total downloads, extension count</td></tr>
    <tr><td><code>/author/&lt;name&gt;.svg?style=flat</code></td><td>thin variant</td></tr>
    <tr><td><code>/author/&lt;name&gt;.json</code></td><td>raw stats: <code>{"{ name, extensions, downloads, ids }"}</code></td></tr>
  </tbody>
</table>
<small class="mt-2 block text-sm text-secondary"><code>&lt;name&gt;</code> matches the name part of <code>authors</code> in <code>extension.toml</code>, case insensitive (email ignored). The upstream API has no user endpoint, so stats aggregate over the full extension index (cached 10 min).</small>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">Custom badges</h2>
<table class="table table-sm">
  <tbody>
    <tr><td><code>/custom.svg?message=...</code></td><td>card badge with your own text, no upstream data</td></tr>
    <tr><td><code>/custom.svg?label=...&amp;message=...&amp;style=flat</code></td><td>thin variant, label left and message right</td></tr>
  </tbody>
</table>
<small class="mt-2 block text-sm text-secondary">Extras: <code>right=</code> (top right value), <code>meta=</code> (gray author line), <code>theme=light</code>. Each text field caps at 48 chars.</small>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">shields.io endpoints</h2>
<table class="table table-sm">
  <tbody>
    <tr><td><code>/downloads/&lt;id&gt;.json</code></td><td>endpoint JSON for <code>img.shields.io/endpoint</code> (957 stays "957", 12345 becomes "12k")</td></tr>
    <tr><td><code>/downloads-raw/&lt;id&gt;.json</code></td><td>full count with commas (1,234)</td></tr>
    <tr><td><code>/version/&lt;id&gt;.json</code></td><td>version</td></tr>
    <tr><td><code>/extension/&lt;id&gt;.json</code></td><td>raw Zed API metadata (not a badge)</td></tr>
  </tbody>
</table>
<pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-field border border-base-300 bg-base-100 px-3.5 py-3 font-mono text-sm">![Zed downloads](https://img.shields.io/endpoint?url=&lt;encoded URL of /downloads/&lt;id&gt;.json&gt;)</pre>
<small class="mt-2 block text-sm text-secondary">Use these when you want shields' own styling options (<code>style=flat-square</code> etc.). shields enforces a cache of at least 5 minutes on its own.</small>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">Query options</h2>
<table class="table table-sm">
  <tbody>
    <tr><td><code>prefix=</code> / <code>suffix=</code></td><td>custom text around the number, replacing the description line: <code>prefix=Thanks+for&amp;suffix=downloading!</code> renders "Thanks for <b>12.2k</b> downloading!" (spacing added automatically, max 48 chars each)</td></tr>
    <tr><td><code>label=</code></td><td>override the title (card) or left label (flat)</td></tr>
    <tr><td><code>theme=light</code></td><td>cream light card (default is dark, card only)</td></tr>
    <tr><td><code>theme=auto</code></td><td>follows the viewer's dark mode via a media query inside the SVG (GitHub supports this; renderers without CSS support fall back to the light palette)</td></tr>
    <tr><td><code>raw=1</code></td><td>full count with commas (1,234) instead of 1.2k or 1.2M</td></tr>
    <tr><td><code>color=</code></td><td>flat badge value color (default Zed brand blue)</td></tr>
    <tr><td><code>logo=0</code></td><td>remove the logo (flat only)</td></tr>
  </tbody>
</table>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">Errors</h2>
<p>
  Unknown ID or name renders a red <code>not found</code> badge. Upstream outages render a grey
  <code>unavailable</code> badge (never cached). Your README never shows a broken image.
</p>
