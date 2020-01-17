import * as d3 from "d3"
import ajax from "../modules/ajax"
import noUiSlider from "nouislider"
import loadJson from "../../components/load-json/"
import Ractive from "ractive"
import AnimatedBarChart from "../../assets/modules/animated"
import ScatterPlot from "../../assets/modules/scatterplot"

export class ChartBuilder {

  constructor(key) {
    const type = "scatterplot"
    let configure = this._configure.bind(this)
    if (key != null) {
      loadJson(`https://interactive.guim.co.uk/docsdata/${key}.json`)
        .then((data) => {
          ajax(`<%= path %>/assets/templates/${type}.html`).then((templateHtml) => {
            new Ractive({
              target: "#app",
              template: templateHtml,
              data: data.sheets.template
            })
            configure(data, document.querySelector("#app"), type)
          })
        })
    }
  }

  _configure(data, chart, type) {
    var app
    switch (type) {
    case "animated":
      app = new AnimatedBarChart(data.sheets, chart, d3, noUiSlider)
      break
    case "scatterplot":
      app = new ScatterPlot(data, d3)
      break
    default:
      console.log("no valid type selected")
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