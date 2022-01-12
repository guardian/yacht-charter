import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "aus-total-corona-deaths-testing"
const location = getURLParams("location") ? getURLParams("location") : "yacht-charter-data"
const social = getURLParams("social") ? getURLParams("social") : false

new Chart(key, location, social)

// https://interactive.guim.co.uk/docsdata/1cR0XSzndyV7J4IbNzvnKBK2diuOB6Bo0FUBzztcPlCk.json

// https://interactive.guim.co.uk/yacht-charter-data/Covid_oz_vac_gap_two_goals_feed.json

// https://interactive.guim.co.uk/docsdata/1jZLBeJnoGl4brYdF6AB-zOO94pvrCLflb9ojTA5Algk.json

