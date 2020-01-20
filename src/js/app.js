import {
  ChartBuilder
} from "./modules/applet"


function getURLParams(paramName) {

  const params = window.parent.location.search.substring(1).split("&")

  for (let i = 0; i < params.length; i++) {
    let val = params[i].split("=")
    if (val[0] == paramName) {
      return val[1]
    }
  }
  return null

}

const key = (getURLParams("key")) ? getURLParams("key") : "1qcFgkC1KraIA1n1fNSJxDGBWiKMEdfnAEuwFgHKXGg4"

//animated = "1evrvPdWq4ysFW5JrdtJLDG3hVPNjPDnBqNJtT-WZnRo"
//scatterplot = "1AsgU8YQCKI6DuzJ8Y1qh4-Y7YRuFZZQr8K-4gmbtffU"
//stackedbarchart = "1qcFgkC1KraIA1n1fNSJxDGBWiKMEdfnAEuwFgHKXGg4"

new ChartBuilder(key)