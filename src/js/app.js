import {
  ChartBuilder
} from "./modules/applet"


function getURLParams(paramName) {
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

const key = getURLParams("key") ? getURLParams("key") : "1aaxWJBVD653P8yLeQUtERhGe8JXXTOqMnZFmCcI2mT8"

const location = getURLParams("location") ? getURLParams("location") : "docsdata"

//animated = "1wsga1Ja8HalQvwQNisnd1twXLbTYCOjVuyH-RrcZZnA"
//scatterplot = "1AsgU8YQCKI6DuzJ8Y1qh4-Y7YRuFZZQr8K-4gmbtffU"
//stackedbarchart = "1qcFgkC1KraIA1n1fNSJxDGBWiKMEdfnAEuwFgHKXGg4"
//annotatedbarchart = "1yHONV9cWG0V1Yg2EY2prdxx00Z0AgGqO-6Wr6HQTux0"
//treemap = "1-N-6UNFyYSCRHP18gy_u6pfzaosqomD1pzzHBZoss9E"
//linechart = "total-emissions-year-to-date"
//horizontalbar = "1aaxWJBVD653P8yLeQUtERhGe8JXXTOqMnZFmCcI2mT8"

new ChartBuilder(key, location)