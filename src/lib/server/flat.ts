import { iconToHTML, iconToSVG, svgToData } from "@iconify/utils"
import { makeBadge } from "badge-maker"
import { zedLogo } from "$lib/icons"

const rendered = iconToSVG(zedLogo, { height: 24 })
const logo = svgToData(
  iconToHTML(rendered.body, { ...rendered.attributes, color: "white" }),
)

export const flatSvg = (
  label: string,
  message: string,
  color: string,
  withLogo = true,
  labelColor = "black",
): string =>
  makeBadge({
    label,
    message,
    color,
    labelColor,
    ...(withLogo ? { logoBase64: logo } : {}),
  })
