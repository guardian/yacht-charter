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
      if (d3[colors]) {
        range = d3[colors]
        colorSet = true
      } else {
        console.error(
          `${colors} is not part of the d3 scale chromatic colour scheme`
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

  getUserDefinedKeysColors(userDefined) {
    const keys = []
    const colors = []

    userDefined.forEach((d) => {
      keys.push(d.key)
      colors.push(d.colour)
    })
    return {
      keys,
      colors
    }
  }
}

export default ColorScale
