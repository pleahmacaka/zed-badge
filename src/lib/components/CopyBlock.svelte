<script lang="ts">
  let { title, text }: { title: string; text: string } = $props()

  const copy = () => navigator.clipboard.writeText(text)
</script>

<h2 class="mt-9 mb-2.5 text-xs text-secondary label-caps">{title}</h2>
<div class="flex items-stretch gap-2">
  <pre
    class="flex-1 overflow-x-auto rounded-field border border-base-300 bg-base-100 px-3.5 py-3 font-mono text-sm break-all whitespace-pre-wrap">{text}</pre>
  <button type="button" class="btn btn-outline" onclick={copy}>Copy</button>
</div>
