export function numberFormat(num) {
  if (num > 0) {
    if (num > 1000000000) {
      return (num / 1000000000) + 'bn'
    }
    if (num > 1000000) {
      return (num / 1000000) + 'm'
    }
    if (num > 1000) {
      return (num / 1000) + 'k'
    }
    if (num % 1 != 0) {
      return num.toFixed(2)
    } else {
      return num.toLocaleString()
    }
  }
  if (num < 0) {
    var posNum = num * -1;
    if (posNum > 1000000000) return ["-" + String((posNum / 1000000000)) + 'bn'];
    if (posNum > 1000000) return ["-" + String((posNum / 1000000)) + 'm'];
    if (posNum > 1000) return ["-" + String((posNum / 1000)) + 'k'];
    else {
      return num.toLocaleString()
    }
  }
  return num;
}