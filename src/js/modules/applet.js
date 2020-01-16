import * as d3 from "d3"
import ajax from "../modules/ajax"
import noUiSlider from "nouislider"
import loadJson from "../../components/load-json/"
import Ractive from "ractive"
import AnimatedBarChart from "../../assets/modules/animated"

export class ChartBuilder {

  constructor(key) {
    const type = "animated"
    let configure = this._configure.bind(this)
    if (key != null) {
      loadJson(`https://interactive.guim.co.uk/docsdata/${key}.json`)
        .then((data) => {
          ajax(`<%= path %>/assets/templates/${type}.html`).then((templateHtml) => {
            //todo: make this use ractive
            //const html = mustache(template, data.sheets.template)
            new Ractive({
              target: "#app",
              template: templateHtml,
              data: data.sheets.template
            })
            //const chart = document.querySelector("#app")
            ///chart.innerHTML = html
            configure(data.sheets, document.querySelector("#app"), type)
          })
        })
    }
  }

  _configure(data, chart, type) {
    var app
    switch (type) {
    case "animated":
      app = new AnimatedBarChart(data, chart, d3, noUiSlider)
      break
    default:
    }
    this._loader(`<%= path %>/assets/modules/${type}.js`, app, document.body)
  }

  _loader(url, code, location) {

    var tag = document.createElement("script")
    tag.src = url
    tag.onload = code
    tag.onreadystatechange = code
    location.appendChild(tag)

  }

}