export default function getURLParams(paramName) {
  var params = ""
  if (top !== self) {
    params = window.location.search.substring(1).split("&")
  } else {
    params = window.parent.location.search.substring(1).split("&")
  }

  for (let i = 0; i < params.length; i++) {
    let val = params[i].split("=")
    if (val[0] == paramName) {
      return val[1]
    }
  }
  return null

}