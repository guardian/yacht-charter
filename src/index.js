import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "12uVYXiRLojmJXPXSGZ8BqtcHVG0IvtzI6Q_Xrxq2lyY"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"

new Chart(key, location)