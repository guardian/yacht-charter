import colorPresets from "../constants/colors"

class ColorScale {
  constructor(options) {

    const colorPreset = colorPresets["guardian"]
    const isString = typeof options === "string"
    const getProp = (p) => (!options || isString ? null : options[p])
    const type = options ? (isString ? options : options.type) : "ordinal"
    const domain = getProp("domain")
    const colors = getProp("colors")
    this.divisor = getProp("divisor")

    switch (type) {
      case "linear":
        this.cScale = d3.scaleLinear().range(colorPreset)
        break

      case "threshold":
        this.cScale = d3.scaleThreshold().range(colorPreset)
        break

      case "quantile":
        this.cScale = d3.scaleQuantile().range(colorPreset)
        break

      case "quantize":
        this.cScale = d3.scaleQuantize().range(colorPreset)
        break

      case "ordinal":
      default:
        this.cScale = d3.scaleOrdinal().range(colorPreset)
    }

    this.set(domain, colors)
  }

  get(key) {
    const k = this.divisor ? key / this.divisor : key
    return this.cScale(k)
  }

  /***
  - domain
  - colors: string name of the d3 colour scheme OR array of colours
-------------*/
  set(domain, colors) {
    let colorSet = false
    let range = null

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

    if (Array.isArray(colors) && colors.length > 0) {
      range = colors
      colorSet = true
    }

    if (colorSet) {
      console.log(range)
      this.cScale.range(range)
    }

    if (domain && domain.length > 0) {
      console.log(domain)
      this.cScale.domain(domain)
    }


  }
}

export default ColorScale
