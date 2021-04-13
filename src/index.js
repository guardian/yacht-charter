import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "1LLWGOIVoY04guA_TViTzEp3z5sb6ZjD8c8x7ZiYP2rQ"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"

new Chart(key, location)