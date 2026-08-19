<script lang="ts">
  import Icon from "@iconify/svelte"
  import { page } from "$app/state"
  import CopyBlock from "$lib/components/CopyBlock.svelte"
  import OptionRow from "$lib/components/OptionRow.svelte"
  import Segmented from "$lib/components/Segmented.svelte"
  import { blocksIcon, pencilIcon, userIcon } from "$lib/icons"

  const modes = [
    { value: "extension", label: "Ext", icon: blocksIcon },
    { value: "author", label: "Author", icon: userIcon },
    { value: "custom", label: "Custom", icon: pencilIcon },
  ]

  let mode = $state("extension")
  let query = $state("")
  let debounced = $state("")

  $effect(() => {
    const q = query
    const timer = setTimeout(() => (debounced = q), 300)

    return () => clearTimeout(timer)
  })

  const selectMode = (value: string) => {
    mode = value
    query = ""
    debounced = ""
  }

  let form = $state({
    style: "",
    theme: "",
    metric: "",
    raw: "",
    logo: "",
    label: "",
    prefix: "",
    suffix: "",
  })

  type FormKey = keyof typeof form

  const isAuthor = $derived(mode === "author")
  const isCustom = $derived(mode === "custom")
  const isExtension = $derived(mode === "extension")
  const isFlat = $derived(form.style === "flat")

  const placeholder = $derived(
    isCustom ? "Made with zed-badge" : isAuthor ? "PleahMaCaka" : "windows-batch",
  )

  interface Segment {
    key: FormKey
    title: string
    choices: { value: string; label: string }[]
    show: boolean
  }

  interface TextField {
    key: FormKey
    title: string
    placeholder: string
    show: boolean
  }

  const segments: Segment[] = $derived([
    {
      key: "style",
      title: "Style",
      choices: [
        { value: "", label: "Card" },
        { value: "flat", label: "Flat" },
      ],
      show: true,
    },
    {
      key: "theme",
      title: "Theme",
      choices: [
        { value: "", label: "Dark" },
        { value: "light", label: "Light" },
        { value: "auto", label: "Auto" },
      ],
      show: !isFlat,
    },
    {
      key: "metric",
      title: "Metric",
      choices: [
        { value: "", label: "DL" },
        { value: "version", label: "Ver" },
      ],
      show: isExtension,
    },
    {
      key: "raw",
      title: "Number",
      choices: [
        { value: "", label: "1.2k" },
        { value: "1", label: "1,234" },
      ],
      show: !isCustom,
    },
    {
      key: "logo",
      title: "Logo",
      choices: [
        { value: "", label: "On" },
        { value: "0", label: "Off" },
      ],
      show: isFlat,
    },
  ])

  const textFields: TextField[] = $derived([
    { key: "label", title: "Label", placeholder: isCustom ? "zed-badge" : "(default)", show: true },
    { key: "prefix", title: "Before", placeholder: "Thanks for", show: !isCustom },
    { key: "suffix", title: "After", placeholder: "downloading!", show: !isCustom },
  ])

  const url = $derived.by(() => {
    const subject = debounced.trim() || placeholder
    const path = isCustom
      ? "/custom.svg"
      : `${isAuthor ? "/author/" : "/extension/"}${encodeURIComponent(subject)}.svg`

    const fields = [...segments, ...textFields]
      .filter(field => field.show)
      .map(field => [field.key, form[field.key].trim()])
    if (isCustom) {
      fields.unshift(["message", subject])
    }

    const search = new URLSearchParams(fields.filter(([, value]) => value))

    return page.url.origin + path + (search.size ? `?${search}` : "")
  })

  const markdown = $derived(`![Zed ${mode} badge](${url})`)
</script>

<svelte:head>
  <title>Zed Extension Badges</title>
  <meta
    name="description"
    content="Live SVG badges for Zed extensions and their authors, rendered from api.zed.dev"
  />
</svelte:head>

<p class="mt-1 mb-7 font-serif italic text-secondary">
  Live badges for Zed extensions and their authors, rendered fresh from api.zed.dev.
</p>

<div class="mt-5 grid grid-cols-[4rem_1fr] gap-3.5 md:grid-cols-[4rem_1fr_16.5rem]">
  <div class="flex flex-col gap-2" aria-label="badge type">
    {#each modes as m (m.value)}
      <button
        type="button"
        class="btn h-16 flex-col gap-1 border-base-300 bg-base-100 text-[0.62rem] label-caps
          {mode === m.value ? 'btn-outline btn-primary' : 'btn-ghost border'}"
        aria-pressed={mode === m.value}
        onclick={() => selectMode(m.value)}
      >
        <Icon icon={m.icon} class="size-5" />
        {m.label}
      </button>
    {/each}
  </div>

  <div class="flex min-w-0 flex-col gap-3">
    <input
      type="text"
      class="input w-full font-mono"
      {placeholder}
      aria-label="extension id, author name, or custom text"
      autocomplete="off"
      spellcheck="false"
      bind:value={query}
    />
    <div
      class="flex min-h-60 flex-1 items-center justify-center rounded-box border border-base-300 bg-base-100 p-6 dotgrid"
    >
      <img class="max-w-full" src={url} alt="badge preview" />
    </div>
  </div>

  <div class="col-span-2 self-start overflow-hidden rounded-box border border-base-300 bg-base-100 md:col-span-1">
    {#each segments.filter(s => s.show) as segment (segment.key)}
      <OptionRow label={segment.title}>
        <Segmented bind:value={form[segment.key]} options={segment.choices} />
      </OptionRow>
    {/each}
    {#each textFields.filter(f => f.show) as field (field.key)}
      <OptionRow label={field.title}>
        <input
          type="text"
          class="input input-sm w-36 font-mono"
          placeholder={field.placeholder}
          aria-label={field.title}
          autocomplete="off"
          spellcheck="false"
          bind:value={form[field.key]}
        />
      </OptionRow>
    {/each}
  </div>
</div>

<CopyBlock title="Markdown" text={markdown} />
<CopyBlock title="URL" text={url} />

<small class="mt-2 block text-sm text-secondary">
  Badges refresh within about 5 minutes. See
  <a class="link link-primary" href="/docs">docs</a> for every endpoint and option.
</small>
