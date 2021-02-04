const COLOR_SCHEME = "colorScheme"
const COLOR_LINEAR_RANGE = "colorLinearRange"
const COLOR_MAX = "colorMax"

export default {
  /**
    colorKeysRanges: object that provides the key/color pair
    maxValue (optional): use this max if provided, otherwise find the max in array.
    returns an array of values 
  *******/
  getColorDomainRangeMax(option) {
    const hasProp = (p) => option && option[p]
    const isArray = Array.isArray(option[COLOR_LINEAR_RANGE])

    // if option is an array, the domain are the Object.values
    const domain = hasProp(COLOR_LINEAR_RANGE)
      ? isArray
        ? Object.values(option[COLOR_LINEAR_RANGE])
        : Object.keys(option[COLOR_LINEAR_RANGE]).map((k) => parseInt(k))
      : []

    // if option is an array, the range are empty
    const range = hasProp(COLOR_LINEAR_RANGE)
      ? isArray
        ? []
        : Object.values(option[COLOR_LINEAR_RANGE])
      : []

    // if option is an array, the range are empty
    const colorScheme = option[COLOR_SCHEME]

    const max = option[COLOR_MAX] || d3.max(domain)

    return {
      colorDomain: domain.map((d) => d / max),
      colorRange: range && range.length > 0 ? range : colorScheme,
      colorMax: max
    }
  },

  getUserDefinedKeysColors(userDefined) {
    const keys = []
    const colors = []

    userDefined.forEach((d) => {
      keys.push(d.keyName)
      colors.push(d.colour)
    })
    return {
      keys,
      colors
    }
  },

  getKeysColors({ keys, userKey, option }) {
    let obj = {
      keys
    }
    // userKey takes precedence over option.colorScheme
    if (userKey.length > 1) {
      console.log("key",userKey)
      obj = this.getUserDefinedKeysColors(userKey)
    } else if (option[COLOR_SCHEME]) {
      obj.colors = option[COLOR_SCHEME]
    }

    console.log(obj)
    return obj
  }
}
