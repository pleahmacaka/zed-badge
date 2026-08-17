export const zed = {
  blue: "#1348dc",
  blue400: "#54a2ff",
}

export interface CardTheme {
  background: string
  border: string
  title: string
  accent: string
  subtle: string
  logo: string
}

export const cardThemes: Record<"dark" | "light", CardTheme> = {
  dark: {
    background: "#111419",
    border: "#ffffff24",
    title: "#f4f5f7",
    accent: zed.blue400,
    subtle: "#f4f5f785",
    logo: "#ffffff",
  },
  light: {
    background: "#f5f4f3",
    border: "#d1cfc8",
    title: "#1b1d21",
    accent: zed.blue,
    subtle: "#727a89",
    logo: zed.blue,
  },
}

export const status = {
  notFound: "#e05d44",
  unavailable: "#9f9f9f",
}

export const fontStack =
  "IBM Plex Sans, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
