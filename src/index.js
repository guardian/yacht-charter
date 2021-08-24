import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "1knYkj-Xl2FS-UPtrTO6QZ5ENKrx2uwnXdntyu57m5Dw"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"
const social = getURLParams("social") ? getURLParams("social") : false

new Chart(key, location, social)