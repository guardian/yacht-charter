import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

//

const key = getURLParams("key") ? getURLParams("key") : "1Rn0TTg3o37sRpYG4BRgPEqgyjVKsoNc4WpD_qzdwTcU"
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
// https://interactive.guim.co.uk/embed/aus/2020/yacht-charter-v5/index.html?key=local-trend-nsw-corona-2020&location=yacht-charter-data

// Sankey testing

// const key = "1gZbZMDnbsG5zeIxX3n5SzZzC_YiXBvWwxcre4bEape4"
// const location = "docsdata"

// Line chart

// const key = "1gZbZMDnbsG5zeIxX3n5SzZzC_YiXBvWwxcre4bEape4"
// const location = "docsdata"



new Chart(key, location)
//https://interactive.guim.co.uk/yacht-charter-data/australian-states-daily-covid-cases-2020.json
//https://interactive.guim.co.uk/yacht-charter-data/local-trend-nsw-corona-2020.json