import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"
const key = getURLParams("key") ? getURLParams("key") : "1iZs8MT2qBcEz0550zWiPAFkGw03TEapgSJd-jBM2zVs"

const location = getURLParams("location") ? getURLParams("location") : "docsdata"
//animated = "1wsga1Ja8HalQvwQNisnd1twXLbTYCOjVuyH-RrcZZnA"
//scatterplot = "1AsgU8YQCKI6DuzJ8Y1qh4-Y7YRuFZZQr8K-4gmbtffU"
//stackedbarchart = "1qcFgkC1KraIA1n1fNSJxDGBWiKMEdfnAEuwFgHKXGg4"
//annotatedbarchart = "1yHONV9cWG0V1Yg2EY2prdxx00Z0AgGqO-6Wr6HQTux0"
//treemap = "1-N-6UNFyYSCRHP18gy_u6pfzaosqomD1pzzHBZoss9E"
//linechart = "total-emissions-year-to-date"
//horizontalbar = "1aaxWJBVD653P8yLeQUtERhGe8JXXTOqMnZFmCcI2mT8"
//smallmultiples = "australian-states-daily-covid-cases-2020"

//data directories: "yacht-charter-data" "docsdata"

new Chart(key, location)