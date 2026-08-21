<script lang="ts">
  import Icon from "@iconify/svelte"
  import { checkIcon, copyIcon } from "$lib/icons"

  let { title, text }: { title: string; text: string } = $props()

  let copied = $state(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    copied = true
    setTimeout(() => (copied = false), 1200)
  }
</script>

<h2 class="mt-3 mb-2 text-xs text-secondary label-caps">{title}</h2>
<div class="flex items-stretch gap-2">
  <pre
    class="flex h-10 min-w-0 flex-1 items-center overflow-x-auto rounded-field border border-base-300 bg-base-100 px-3.5 font-mono text-sm whitespace-nowrap">{text}</pre>
  <button
    type="button"
    class="btn btn-square btn-outline size-10 min-h-0"
    aria-label="copy {title.toLowerCase()}"
    onclick={copy}
  >
    <Icon icon={copied ? checkIcon : copyIcon} class="size-4" />
  </button>
</div>
