import * as d3 from "d3"
import ajax from "../modules/ajax"
import noUiSlider from "nouislider"
import loadJson from "../../components/load-json/"
import Ractive from "ractive"

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
              data: data.sheets.template[0]
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
      import("./charts/animated")
        .then((AnimatedBarChart) => {
          app = new AnimatedBarChart(data.sheets, chart, d3, noUiSlider)
        })
      break
    case "scatterplot":
      import("./charts/scatterplot")
        .then((ScatterPlot) => {
          app = new ScatterPlot(data, d3)
        })
      break
    case "stackedbarchart":
      import("./charts/stackedbarchart")
        .then((StackedBarChart) => {
          app = new StackedBarChart(data, d3)
        })
      break
    case "annotatedbarchart":
      import("./charts/annotatedbarchart")
        .then((AnnotatedBarChart) => {
          app = new AnnotatedBarChart(data, d3)
        })
      break
    case "treemap":
      import("./charts/treemap")
        .then((TreeMap) => {
          console.log(TreeMap)
          app = new TreeMap(data.sheets.data, d3)
        })
      break
    default:
      console.log("no valid type selected")
    }

    var tag = document.createElement("script")
    tag.onload = app
    tag.onreadystatechange = app
    document.body.appendChild(tag)
    //this._loader(`<%= path %>/assets/modules/${type}.js`, app, document.body)
  }

  _loader(url, code, location) {

    var tag = document.createElement("script")
    tag.src = url
    tag.onload = code
    tag.onreadystatechange = code
    location.appendChild(tag)

  }

}