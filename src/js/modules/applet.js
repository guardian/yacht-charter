import * as d3 from "d3v3"
import ajax from "../modules/ajax"
import noUiSlider from "nouislider"
import loadJson from "../../components/load-json/"
import Ractive from "ractive"
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
              data: data.sheets.template[0]
            })
            configure(data, document.querySelector("#app"), type)
          })
        })
    }
  }

  _configure(data, chart, type) {
    var app = new TreeMap(data.sheets.data, d3)
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