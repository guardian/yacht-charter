import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "oz-vaccine-weekly-distribution"
const location = getURLParams("location") ? getURLParams("location") : "yacht-charter-data"
const social = getURLParams("social") ? getURLParams("social") : false

new Chart(key, location, social)