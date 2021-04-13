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


// function fixed(num,dec) {

// }

function numberFormatOG(num) {
        if ( num > 0 ) {
            if ( num >= 1000000000 ) { 

                if ((num / 1000000000) % 1 == 0) {
                    return ( num / 1000000000 ) + 'bn' 
                }
                else {
                    return ( num / 1000000000 ).toFixed(1) + 'bn' 
                }
                
                }
            if ( num >= 1000000 ) { 

                if (( num / 1000000 ) % 1 == 0) {
                  return ( num / 1000000 ) + 'm' 
                }  
                else {
                  return ( num / 1000000 ).toFixed(1) + 'm' 
                }
                
                }
            if ( num >= 1000 ) {

                if (( num / 1000 ) % 1 == 0) {
                  return ( num / 1000 ) + 'k' 
                }

                else {
                  return ( num / 1000 ).toFixed(1) + 'k' 
                }
              }
            if (num % 1 != 0) { 
                return num.toFixed(2) 
              }
            else { return num.toLocaleString() }
        }
        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum >= 1000000000 ) return [ "-" + String(( posNum / 1000000000 ).toFixed(1)) + 'bn'];
            if ( posNum >= 1000000 ) return ["-" + String(( posNum / 1000000 ).toFixed(1)) + 'm'];
            if ( posNum >= 1000 ) return ["-" + String(( posNum / 1000 ).toFixed(1)) + 'k'];
            else { return num.toLocaleString() }
        }
        return num;
    }

/**
  value: Number to be formatted
  formatString (optional): d3 format strings - https://github.com/d3/d3-format
****/
export function numberFormat(value, formatString) {
  return numberFormatOG(value)
  // return value < 0
  //   ? "-" + parse(value * -1, formatString)
  //   : parse(value, formatString)
}


