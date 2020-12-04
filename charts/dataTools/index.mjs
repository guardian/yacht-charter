export default {
  getKeysColors(keys, userDefined, options) {
    let obj = {
      keys
    }

    // userDefined takes precedence over options.colorScheme
    if (userDefined.length > 1) {
      obj = this.getUserDefinedKeysColors(userDefined)
    } else if (options.colorScheme) {
      obj.colors = options.colorScheme
    }

    return obj
  },

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
