import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "1vTJNmKMFpk5AgpOKitE0LclgBKR8ht1djvwSdSwxhw8"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"
const social = getURLParams("social") ? getURLParams("social") : false

new Chart(key, location, social)



//https://interactive.guim.co.uk/embed/aus/2020/yacht-charter-v19/index.html?key=1vTJNmKMFpk5AgpOKitE0LclgBKR8ht1djvwSdSwxhw8&location=docsdata
