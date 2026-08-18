<script lang="ts">
  interface Option {
    value: string
    label: string
  }

  let { value = $bindable(), options }: { value: string; options: Option[] } = $props()
</script>

<div class="join">
  {#each options as option (option.value)}
    <button
      type="button"
      class="btn join-item btn-xs w-14 label-caps {value === option.value ? 'btn-outline btn-primary' : 'btn-ghost'}"
      aria-pressed={value === option.value}
      onclick={() => (value = option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
