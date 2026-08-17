#!/usr/bin/env bun

const SAMPLE = [
  {
    id: "windows-batch",
    name: "Windows Batch",
    version: "0.2.0",
    description: "Windows Batch/CMD script support",
    authors: ["PleahMaCaka <pleahmacaka@gmail.com>"],
    repository: "https://github.com/PleahMaCaka/zed-batch",
    schema_version: 1,
    wasm_api_version: "0.7.0",
    provides: ["languages", "grammars", "language-servers"],
    published_at: "2026-08-08T16:23:07Z",
    download_count: 957,
  },
  {
    id: "batcave-theme",
    name: "Batcave Theme",
    version: "0.0.1",
    description: "Deep cave darkness with the Batcomputer's cyan glow.",
    authors: ["Mert Deveci"],
    repository: "https://github.com/mertdeveci5/batcave-theme",
    schema_version: 1,
    wasm_api_version: null,
    provides: ["themes"],
    published_at: "2026-08-07T10:54:01Z",
    download_count: 28,
  },
  {
    id: "big-one",
    name: "Big One",
    version: "1.4.2",
    description: "Exercises download_count formatting (1.2M)",
    authors: ["nobody"],
    repository: "https://example.com",
    schema_version: 1,
    wasm_api_version: null,
    provides: ["themes"],
    published_at: "2026-01-01T00:00:00Z",
    download_count: 1_234_567,
  },
  {
    id: "mid-one",
    name: "Mid One",
    version: "0.9.0",
    description: "Exercises download_count formatting (12k)",
    authors: ["nobody"],
    repository: "https://example.com",
    schema_version: 1,
    wasm_api_version: null,
    provides: ["themes"],
    published_at: "2026-01-01T00:00:00Z",
    download_count: 12_345,
  },
  {
    id: "tiny-snippets",
    name: "Tiny Snippets",
    version: "0.1.0",
    description: "Exercises the snippets provides category",
    authors: ["Snippet Author"],
    repository: "https://example.com",
    schema_version: 1,
    wasm_api_version: null,
    provides: ["snippets"],
    published_at: "2026-01-01T00:00:00Z",
    download_count: 3,
  },
]

Bun.serve({
  port: 8787,
  fetch(req) {
    const url = new URL(req.url)
    const id = url.pathname.startsWith("/extensions/")
      ? url.pathname.slice("/extensions/".length)
      : ""

    if (id) {
      return Response.json({
        data: SAMPLE.filter(e => e.id === decodeURIComponent(id)),
      })
    }

    const version = Number(url.searchParams.get("max_schema_version") ?? "0")
    const provides = url.searchParams.get("provides")
    const data = SAMPLE.filter(e => e.schema_version <= version).filter(
      e => !provides || e.provides.includes(provides),
    )

    return Response.json({ data })
  },
})

console.log("fixture API on http://localhost:8787/extensions")
