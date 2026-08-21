<script lang="ts">
  import Icon from "@iconify/svelte"
  import { onMount } from "svelte"
  import { page } from "$app/state"
  import CopyBlock from "$lib/components/CopyBlock.svelte"
  import OptionRow from "$lib/components/OptionRow.svelte"
  import Segmented from "$lib/components/Segmented.svelte"
  import Seo from "$lib/components/Seo.svelte"
  import { blocksIcon, checkIcon, pencilIcon, shareIcon, userIcon } from "$lib/icons"

  const modes = [
    { value: "extension", label: "Ext", icon: blocksIcon },
    { value: "author", label: "Author", icon: userIcon },
    { value: "custom", label: "Custom", icon: pencilIcon },
  ]

  let mode = $state("extension")
  let chart = $state(false)
  let show = $state({ desc: true, author: true, category: false, link: true })
  let suggestions = $state<{
    extensions: { id: string; name: string; downloads: number }[]
    authors: string[]
  }>({ extensions: [], authors: [] })

  let picking = $state(false)
  let active = $state(0)

  const matches = $derived.by(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return []
    }

    if (isAuthor) {
      return suggestions.authors
        .filter(author => author.toLowerCase().includes(needle))
        .slice(0, 8)
        .map(author => ({ value: author, label: author }))
    }

    if (!isExtension) {
      return []
    }

    return suggestions.extensions
      .filter(
        ext =>
          ext.id.toLowerCase().includes(needle) ||
          ext.name.toLowerCase().includes(needle),
      )
      .slice(0, 8)
      .map(ext => ({ value: ext.id, label: ext.name }))
  })

  const pick = (value: string) => {
    query = value
    debounced = value
    picking = false
    active = 0
  }

  const navigate = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      picking = false

      return
    }

    if (!picking || !matches.length) {
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      active = (active + 1) % matches.length
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      active = (active - 1 + matches.length) % matches.length
    } else if (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault()
      pick(matches[active].value)
    }
  }

  const loadSuggestions = async () => {
    if (suggestions.extensions.length) {
      return
    }

    const res = await fetch("/search.json")
    if (res.ok) {
      suggestions = await res.json()
    }
  }
  let link = $state("")
  let format = $state("svg")
  let query = $state("")
  let debounced = $state("")

  $effect(() => {
    const q = query
    active = 0
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
    color: "",
    labelColor: "",
  })

  type FormKey = keyof typeof form

  const isAuthor = $derived(mode === "author")
  const isCustom = $derived(mode === "custom")
  const isExtension = $derived(mode === "extension")
  const isFlat = $derived(form.style === "flat")
  const isChart = $derived(isExtension && chart && !isFlat)

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
    swatch?: string
    presets?: string[]
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
      title: isFlat ? "Value" : "Desc",
      placeholder: "Thanks for {{downloads}} downloads!",
      help: `Replaces the ${isFlat ? "right-hand value" : "description line"}. Variables: {{downloads}}, {{version}} (extension), {{extensions}} (author).${isFlat ? "" : " The first variable is rendered bold."}`,
      show: !isCustom,
    },
    {
      key: "color",
      title: "Value color",
      placeholder: "#1348dc",
      help: "Color of the right-hand value. CSS name or hex.",
      swatch: "#1348dc",
      presets: ["#1348dc", "#54a2ff", "#3d9a57", "#c88b2e", "#e05d44"],
      show: isFlat,
    },
    {
      key: "labelColor",
      title: "Label color",
      placeholder: "black",
      help: "Color of the left label. CSS name or hex; gray matches shields.io.",
      swatch: "#000000",
      presets: ["black", "#555555", "#24292e", "#111419"],
      show: isFlat,
    },
  ])

  const trimHash = (value: string) =>
    value.startsWith("#") ? value.slice(1) : value

  const subject = $derived(debounced.trim() || placeholder)

  const defaultLink = $derived(
    isExtension ? `https://zed.dev/extensions/${subject}` : "",
  )

  const linkHref = $derived(show.link ? link.trim() || defaultLink : "")

  const url = $derived.by(() => {
    const base = isCustom
      ? "/custom"
      : `${isChart ? "/chart/" : isAuthor ? "/author/" : "/extension/"}${encodeURIComponent(subject)}`
    const path = `${base}.${format}`

    const fields = [...segments, ...textFields]
      .filter(field => field.show)
      .map(field => {
        const value = form[field.key].trim()

        return [field.key, "swatch" in field ? trimHash(value) : value]
      })
    if (isCustom) {
      fields.unshift(["message", subject])
    }

    const search = new URLSearchParams(fields.filter(([, value]) => value))
    if (isExtension && !isFlat) {
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

  const shareUrl = $derived.by(() => {
    const params = new URLSearchParams(new URL(url).search)
    if (mode !== "extension") {
      params.set("mode", mode)
    }
    params.set("id", subject)
    if (chart) {
      params.set("chart", "1")
    }
    if (format !== "svg") {
      params.set("format", format)
    }
    if (!show.link) {
      params.set("link", "0")
    } else if (link.trim()) {
      params.set("link", link.trim())
    }
    params.delete("message")

    return `${page.url.origin}/${params.size ? `?${params}` : ""}`
  })

  const HEX_LENGTHS = [3, 4, 6, 8]

  const withHash = (value: string) =>
    HEX_LENGTHS.includes(value.length) &&
    [...value].every(c => "0123456789abcdefABCDEF".includes(c))
      ? `#${value}`
      : value

  let shared = $state(false)

  const share = async () => {
    await navigator.clipboard.writeText(shareUrl)
    shared = true
    setTimeout(() => (shared = false), 1200)
  }

  onMount(() => {
    const params = page.url.searchParams

    mode = params.get("mode") ?? "extension"
    query = params.get("id") ?? ""
    debounced = query
    chart = params.get("chart") === "1"
    format = params.get("format") === "png" ? "png" : "svg"

    for (const key of Object.keys(form) as FormKey[]) {
      const value = params.get(key) ?? ""
      form[key] =
        key === "color" || key === "labelColor" ? withHash(value) : value
    }

    show.desc = form.desc !== "0"
    show.author = params.get("author") !== "0"
    show.category = params.get("category") === "1"
    if (!show.desc) {
      form.desc = ""
    }

    const shared = params.get("link")
    show.link = shared !== "0"
    link = shared && shared !== "0" ? shared : ""

  })

  const previewSrc = $derived(
    `${url}${url.includes("?") ? "&" : "?"}preview=${Date.now()}`,
  )

  const SWEEP_MS = 700

  let loading = $state(true)
  let startedAt = 0

  const fetchKey = $derived(
    `${mode}:${debounced.trim()}:${format}:${isChart}`,
  )

  $effect(() => {
    fetchKey
    startedAt = Date.now()
    loading = true
  })

  const settle = () => {
    const at = startedAt
    const left = Math.max(SWEEP_MS - (Date.now() - at), 0)

    setTimeout(() => {
      if (startedAt === at) {
        loading = false
      }
    }, left)
  }

  const markdown = $derived.by(() => {
    const image = `![Zed ${isChart ? "download chart" : `${mode} badge`}](${url})`

    return linkHref ? `[${image}](${linkHref})` : image
  })
</script>

<Seo
  title="Zed Extension Badges"
  description="Live SVG badges for Zed extensions and their authors, rendered from api.zed.dev"
  path="/"
/>

<p class="mt-1 mb-7 font-serif italic text-secondary">
  Live badges for Zed extensions and their authors, rendered fresh from api.zed.dev.
</p>

<div class="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-[1fr_16.5rem]">
  <div class="flex min-w-0 flex-col gap-3">
    <div class="grid grid-cols-[4rem_1fr] gap-3.5">
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
    <button
      type="button"
      class="btn btn-ghost mt-auto h-16 flex-col gap-1 border border-base-300 bg-base-100 text-[0.62rem] text-secondary label-caps"
      title="Copy a link to these settings"
      onclick={share}
    >
      <Icon icon={shared ? checkIcon : shareIcon} class="size-5" />
      {shared ? "Copied" : "Share"}
    </button>
  </div>

  <div class="flex min-w-0 flex-col gap-3">
    <div class="relative">
      <input
        type="text"
        class="input w-full font-mono"
        {placeholder}
        aria-label="extension id, author name, or custom text"
        autocomplete="off"
        spellcheck="false"
        onfocus={() => {
          picking = true
          loadSuggestions()
        }}
        onblur={() => setTimeout(() => (picking = false), 120)}
        onkeydown={navigate}
        role="combobox"
        aria-expanded={picking && matches.length > 0}
        aria-controls="subjects"
        bind:value={query}
      />
      {#if picking && matches.length}
        <ul
          id="subjects"
          role="listbox"
          class="absolute top-full right-0 left-0 z-10 mt-1 overflow-y-auto rounded-box border border-base-300 bg-base-100 py-1"
        >
          {#each matches as match, i (match.value)}
            <li>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                class="flex w-full items-baseline gap-2 px-3 py-1.5 text-left {i === active
                  ? 'bg-base-200'
                  : 'hover:bg-base-200'}"
                onmouseenter={() => (active = i)}
                onclick={() => pick(match.value)}
              >
                <span class="truncate font-mono text-sm">{match.value}</span>
                {#if match.label !== match.value}
                  <span class="truncate text-xs text-secondary">{match.label}</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div
      class="relative flex h-72 items-center justify-center overflow-hidden rounded-box border border-base-300 bg-base-100 p-6 dotgrid {loading
        ? 'sweep'
        : ''}"
    >
      <img
        class="max-w-full"
        src={previewSrc}
        alt="badge preview"
        onload={settle}
        onerror={settle}
      />
    </div>
  </div>
    </div>
    <CopyBlock title="Markdown" text={markdown} />
    <CopyBlock title="URL" text={url} />
    <small class="text-xs text-secondary/70">
      Badges refresh within about 5 minutes. See
      <a class="link" href="/docs">docs</a> for every endpoint and option.
    </small>
  </div>

  <div class="self-start rounded-box border border-base-300 bg-base-100">
    {#if isExtension}
      <OptionRow label="Chart" help="Append the download trend below the badge (card style only)">
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          aria-label="show download chart"
          disabled={isFlat}
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
      {@const toggleDesc = field.key === "desc" && isExtension && !isFlat}
      <OptionRow label={field.title} help={field.help} stacked>
        {#snippet aside()}
          {#if toggleDesc}
            <input
              type="checkbox"
              class="toggle toggle-primary toggle-sm"
              aria-label="show description"
              bind:checked={show.desc}
            />
          {:else if field.swatch}
            <div class="flex items-center gap-1.5">
              {#each field.presets ?? [] as preset (preset)}
                <button
                  type="button"
                  class="size-4 cursor-pointer rounded-full border border-base-300"
                  style="background-color: {preset}"
                  title={preset}
                  aria-label={preset}
                  aria-pressed={form[field.key] === preset}
                  onclick={() => (form[field.key] = preset)}
                ></button>
              {/each}
              <input
                type="color"
                class="size-5 cursor-pointer rounded-field border border-base-300 bg-transparent"
                aria-label="{field.title} picker"
                value={form[field.key] || field.swatch}
                oninput={e => (form[field.key] = e.currentTarget.value)}
              />
            </div>
          {/if}
        {/snippet}
        <input
          type="text"
          class="input input-sm w-full font-mono"
          placeholder={field.placeholder}
          aria-label={field.title}
          autocomplete="off"
          spellcheck="false"
          disabled={toggleDesc && !show.desc}
          bind:value={form[field.key]}
        />
      </OptionRow>
    {/each}
    {#if isExtension && !isFlat}
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
    <OptionRow label="Link" help="Wrap the Markdown badge in a link" stacked>
      {#snippet aside()}
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          aria-label="wrap markdown in a link"
          bind:checked={show.link}
        />
      {/snippet}
      <input
        type="text"
        class="input input-sm w-full font-mono"
        placeholder={defaultLink || "https://example.com"}
        aria-label="Link"
        autocomplete="off"
        spellcheck="false"
        disabled={!show.link}
        bind:value={link}
      />
    </OptionRow>
  </div>
</div>

