import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

// https://docs.google.com/spreadsheets/d/1Rn0TTg3o37sRpYG4BRgPEqgyjVKsoNc4WpD_qzdwTcU/edit#gid=117658605

const key = getURLParams("key") ? getURLParams("key") : "1Rn0TTg3o37sRpYG4BRgPEqgyjVKsoNc4WpD_qzdwTcU"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"

new Chart(key, location)


// https://interactive.guim.co.uk/embed/aus/2020/yacht-charter-v15/index.html?key=oz_vaccine_tracker_goals_trend_two_trend_test&location=yacht-charter-data