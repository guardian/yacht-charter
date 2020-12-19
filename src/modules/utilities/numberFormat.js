const units = {
  bn: 1000000000,
  m: 1000000,
  k: 1000
}

function parse(value, formatString) {
  let v = value

  // if over 1000, add SI prefix
  if (value > 1000) {
    const f = formatString ? d3.format(formatString) : d3.format(".1f")
    Object.keys(units).every((u) => {
      if (value > units[u]) {
        v = f(value / units[u]) + u
        return false
      }
      return true
    })
  } else if (value > 0) {
    const p = d3.precisionFixed(0.5)
    const f = formatString ? d3.format(formatString) : d3.format(`.${p}f`)

    if (value % 1 != 0) {
      v = f(value)
    } else {
      v = value.toLocaleString()
    }
  }

  return v
}

export function numberFormat(value, formatString) {
  return value < 0
    ? "-" + parse(value * -1, formatString)
    : parse(value, formatString)
}
