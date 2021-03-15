import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "1JFbrsqMVl9NSNBr-xC7OteSSDvgT5JFhVKoUKn5grVc"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"

new Chart(key, location)