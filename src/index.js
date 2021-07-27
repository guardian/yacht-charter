import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

// https://docs.google.com/spreadsheets/d/1Rn0TTg3o37sRpYG4BRgPEqgyjVKsoNc4WpD_qzdwTcU/edit#gid=117658605

const key = getURLParams("key") ? getURLParams("key") : "1vr4y135MvVV-4OanjA17io2qGL5U132_cvaa2XyxHnQ"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"
const social = getURLParams("social") ? getURLParams("social") : false
console.log("social",social)
new Chart(key, location, social)


// https://interactive.guim.co.uk/embed/aus/2020/yacht-charter-v15/index.html?key=oz_vaccine_tracker_goals_trend_two_trend_test&location=yacht-charter-data