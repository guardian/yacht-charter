import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "melb-irsd-quartiles"
const location = getURLParams("location") ? getURLParams("location") : "yacht-charter-data"

new Chart(key, location)