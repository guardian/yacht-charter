import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "Covid_oz_vac_gap_two_goals_feed"
const location = getURLParams("location") ? getURLParams("location") : "yacht-charter-data"
const social = getURLParams("social") ? getURLParams("social") : false

new Chart(key, location, social)

// https://interactive.guim.co.uk/docsdata/1XTkaLcD41h0ihEc3FDZTuaFks3GTSUdUyXl4ZStxIjs.json

// https://interactive.guim.co.uk/yacht-charter-data/Covid_oz_vac_gap_two_goals_feed.json