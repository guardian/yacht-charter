import colorPresets from "../constants/colors"

class ColorScale {
  constructor() {
    this.colors = d3.scaleOrdinal().range(colorPresets["guardian"])
  }

  get(key) {
    return this.colors(key)
  }

  /***
  - keys: domains
  - colors: string name of the d3 colour scheme OR array of colours
-------------*/
  set(keys, colors) {
    let colorSet = false
    let range = null
    const domain = keys

    if (typeof colors === "string") {
      if (colorPresets[colors]) {
        range = colorPresets[colors]
        colorSet = true
      } else if (d3[colors]) {
        range = d3[colors]
        colorSet = true
      } else {
        console.error(
          `${colors} is not part of the color presets or d3 scale chromatic colour scheme`
        )
      }
    }

    if (Array.isArray(colors)) {
      range = colors
      colorSet = true
    }

    if (colorSet) {
      this.colors.range(range)
    }

    if (domain && domain.length > 0) {
      this.colors.domain(domain)
    }
  }
}

export default ColorScale
