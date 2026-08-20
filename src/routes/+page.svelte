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
  let chart = $state(false)
  let show = $state({ desc: true, author: true, category: false })
  let format = $state("svg")
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
    desc: "",
  })

  type FormKey = keyof typeof form

  const isAuthor = $derived(mode === "author")
  const isCustom = $derived(mode === "custom")
  const isExtension = $derived(mode === "extension")
  const isChart = $derived(isExtension && chart)
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
    help?: string
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
      show: !isChart,
    },
    {
      key: "theme",
      title: "Theme",
      choices: [
        { value: "", label: "Dark" },
        { value: "light", label: "Light" },
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
      show: isExtension && !isChart,
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
    {
      key: "desc",
      title: "Desc",
      placeholder: "Thanks for {{downloads}} downloads!",
      help: "Replaces the description line. Variables: {{downloads}}, {{version}} (extension), {{extensions}} (author). The first variable is rendered bold.",
      show: !isCustom && !(isExtension && !show.desc),
    },
  ])

  const url = $derived.by(() => {
    const subject = debounced.trim() || placeholder
    const base = isCustom
      ? "/custom"
      : `${isChart ? "/chart/" : isAuthor ? "/author/" : "/extension/"}${encodeURIComponent(subject)}`
    const path = `${base}.${format}`

    const fields = [...segments, ...textFields]
      .filter(field => field.show)
      .map(field => [field.key, form[field.key].trim()])
    if (isCustom) {
      fields.unshift(["message", subject])
    }

    const search = new URLSearchParams(fields.filter(([, value]) => value))
    if (isExtension) {
      if (!show.desc) {
        search.set("desc", "0")
      }
      if (!show.author) {
        search.set("author", "0")
      }
      if (show.category) {
        search.set("category", "1")
      }
    }

    return page.url.origin + path + (search.size ? `?${search}` : "")
  })

  const previewSrc = $derived(
    `${url}${url.includes("?") ? "&" : "?"}preview=${Date.now()}`,
  )

  const markdown = $derived(
    `![Zed ${isChart ? "download chart" : `${mode} badge`}](${url})`,
  )
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

<div class="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-[4rem_1fr] md:grid-cols-[4rem_1fr_16.5rem]">
  <div class="flex gap-2 sm:flex-col" aria-label="badge type">
    {#each modes as m (m.value)}
      <button
        type="button"
        class="btn h-16 flex-1 flex-col gap-1 border-base-300 bg-base-100 text-[0.62rem] label-caps sm:flex-none
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
      <img class="max-w-full" src={previewSrc} alt="badge preview" />
    </div>
  </div>

  <div class="self-start rounded-box border border-base-300 bg-base-100 sm:col-span-2 md:col-span-1">
    {#if isExtension}
      <OptionRow label="Chart" help="Append the download trend below the badge">
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          aria-label="show download chart"
          bind:checked={chart}
        />
      </OptionRow>
    {/if}
    {#each segments.filter(s => s.show) as segment (segment.key)}
      <OptionRow label={segment.title}>
        <Segmented bind:value={form[segment.key]} options={segment.choices} />
      </OptionRow>
    {/each}
    <OptionRow label="Format">
      <Segmented
        bind:value={format}
        options={[
          { value: "svg", label: "SVG" },
          { value: "png", label: "PNG" },
        ]}
      />
    </OptionRow>
    {#each textFields.filter(f => f.show) as field (field.key)}
      <OptionRow label={field.title} help={field.help}>
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
    {#if isExtension}
      <OptionRow label="Desc" help="Show the description line">
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          aria-label="show description"
          bind:checked={show.desc}
        />
      </OptionRow>
      <OptionRow label="Author" help="Show the author line">
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          aria-label="show author"
          bind:checked={show.author}
        />
      </OptionRow>
      <OptionRow label="Category" help="Show the category tag">
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          aria-label="show category"
          bind:checked={show.category}
        />
      </OptionRow>
    {/if}
  </div>
</div>

<CopyBlock title="Markdown" text={markdown} />
<CopyBlock title="URL" text={url} />

<small class="mt-2 block text-sm text-secondary">
  Badges refresh within about 5 minutes. See
  <a class="link link-primary" href="/docs">docs</a> for every endpoint and option.
</small>
