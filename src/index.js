import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "victransport_patronage_covid"
const location = getURLParams("location") ? getURLParams("location") : "yacht-charter-data"

new Chart(key, location)


// https://interactive.guim.co.uk/embed/aus/2020/yacht-charter-v15/index.html?key=oz_vaccine_tracker_goals_trend_two_trend_test&location=yacht-charter-data