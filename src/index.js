import getURLParams from "./modules/getURLParams"
import {
  Chart
} from "./modules/chart"
import "./main.scss"

const key = getURLParams("key") ? getURLParams("key") : "1XCm_Es8waEsY4wlDFAUa7HOt35h7_0sRnGXb5MYBJss"
const location = getURLParams("location") ? getURLParams("location") : "docsdata" //"yacht-charter-data"
const social = getURLParams("social") ? getURLParams("social") : false

new Chart(key, location, social)

// https://interactive.guim.co.uk/docsdata/1cR0XSzndyV7J4IbNzvnKBK2diuOB6Bo0FUBzztcPlCk.json

// https://interactive.guim.co.uk/yacht-charter-data/aus-total-corona-deaths-testing.json

// https://interactive.guim.co.uk/docsdata/1jZLBeJnoGl4brYdF6AB-zOO94pvrCLflb9ojTA5Algk.json

// http://localhost:9000/?key=NSW-new-cases-chart-2022&location=yacht-charter-data


// https://interactive.guim.co.uk/yacht-charter-data/NSW-new-cases-chart-2022.json