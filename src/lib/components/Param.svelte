<script lang="ts">
  let { value = $bindable(), initial }: { value: string; initial: string } =
    $props()

  let el: HTMLElement | undefined
  const modified = $derived(value !== initial)

  $effect(() => {
    if (el && el.textContent !== value) {
      el.textContent = value
    }
  })

  const oninput = () => {
    value = el?.textContent ?? ""
  }

  const onclick = () => {
    if (modified) {
      value = initial
    }
  }

  const onkeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      value = initial
    }
  }
</script>

<span
  bind:this={el}
  contenteditable="plaintext-only"
  role="textbox"
  tabindex="0"
  spellcheck="false"
  title={modified ? "click to reset" : "click to edit"}
  class="outline-none {modified
    ? 'cursor-pointer font-semibold text-primary hover:text-error'
    : ''}"
  {oninput}
  {onclick}
  {onkeydown}>{value}</span
>
