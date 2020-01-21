import * as d3 from "d3"
import ajax from "../modules/ajax"
import noUiSlider from "nouislider"
import loadJson from "../../components/load-json/"
import Ractive from "ractive"
import AnimatedBarChart from "../../assets/modules/animated"
import ScatterPlot from "../../assets/modules/scatterplot"
import StackedBarChart from "../../assets/modules/stackedbarchart"
import AnnotatedBarChart from "../../assets/modules/annotatedbarchart"
import TreeMap from "../../assets/modules/treemap"

export class ChartBuilder {

  constructor(key) {
    const type = "treemap"
    let configure = this._configure.bind(this)
    if (key != null) {
      loadJson(`https://interactive.guim.co.uk/docsdata-test/${key}.json`)
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
    case "stackedbarchart":
      app = new StackedBarChart(data, d3)
      break
    case "annotatedbarchart":
      app = new AnnotatedBarChart(data, d3)
      break
    case "treemap":
      app = new TreeMap(data.sheets.data, d3)
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