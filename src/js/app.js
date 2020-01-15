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

const key = (getURLParams("key")) ? getURLParams("key") : "1evrvPdWq4ysFW5JrdtJLDG3hVPNjPDnBqNJtT-WZnRo"

new ChartBuilder(key)