import mustache from "../modules/utilities/mustache"
import { getJson, getTemplate } from '../modules/utilities/toolbelt';

export class Chart {

  constructor(key, location, social) {

    var self = this

    this.social = social

    if (key != null) {

      this.getData(location, key)

    }

  }

  async getData(location, key) {

    this.data = await getJson(`https://interactive.guim.co.uk/${location}/${key}.json`)

    this.type = this.data.sheets.chartId[0].type

    if (this.data.sheets.template[0].title!="") {

      document.title = `Chart: ${this.data.sheets.template[0].title}`

    }

    this.loadTemplate()

  }

  async loadTemplate() {

    const templateHtml = await getTemplate(`./templates/${this.type}.html`)

    document.querySelector("#app").innerHTML = mustache(templateHtml, this.data.sheets.template[0])

    this._initialiseChart(this.data, this.type)

  }

  _initialiseChart(data, type, isMobile) {
    
    switch (type) {
    case "animated":
      import("./charts/animated")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default()
          instance.render(data.sheets)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "scatterplot":
      import("./charts/scatterplot")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "stackedbar":
      import("./charts/stackedbar")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data, this.social)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "groupedbar":
      import("./charts/groupedbar")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "annotatedbarchart":
      import("./charts/annotatedbarchart")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "treemap":
      import("./charts/treemap")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data.sheets.data, data.sheets.colours, data.sheets.settings)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "linechart":
      import("./charts/linechart")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data, this.social)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "horizontalbar":
      import("./charts/horizontalbar")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          // Horizontal bar should resize itself otherwise it can't use select
          // this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "smallmultiples":
      import("./charts/smallmultiples")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          this._addListener(instance, data, type, importedChartModule)
        })
      break
    case "sankey":
      import("./charts/sankey")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          this._addListener(instance, data, type, importedChartModule)
        })
      break  
    case "table":
      import("./charts/table")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data)
          this._addListener(instance, data, type)
        })
      break
    case "stackedarea":
      import("./charts/stackedarea")
        .then((importedChartModule) => {
          let instance = new importedChartModule.default(data, this.social)
          this._addListener(instance, data, type, importedChartModule)
        })
      break  

    default:
      console.log("no valid type selected")
    }
  }

  _addListener(instance, data, type, importedChartModule) {
    var lastWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
    var to = null
    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var isMobile = (windowWidth < 610) ? true : false ;
    let reRenderChart = this._reRenderChart.bind(this)
    console.log(isMobile)
    window.addEventListener("resize", function () {
      var thisWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
      if (lastWidth != thisWidth) {
        window.clearTimeout(to)
        to = window.setTimeout(function () {
          console.log("Resizing")
          var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

          if (windowWidth < 610) {
            isMobile = true
          }

          if (windowWidth >= 610) {
            isMobile = false
          }
          reRenderChart(data, type, isMobile, instance, importedChartModule)
        }, 1000)
      }
    })
    var tag = document.createElement("script")
    tag.onload = instance
    tag.onreadystatechange = instance
    document.body.appendChild(tag)
  }

  _reRenderChart(data, type, isMobile, instance, importedChartModule) {
    console.log("re-render")
    switch (type) {
    case "animated":
      instance.render(data.sheets)
      break
    case "treemap":
      instance = new importedChartModule.default(data.sheets.data, data.sheets.colours, data.sheets.settings)
      break
    case "linechart":
      instance = new importedChartModule.default(data, this.social)
      break
    case "horizontalbar":
      instance = new importedChartModule.default(data)
      break
    case "stackedbar":
      instance = new importedChartModule.default(data, this.social)
      break
    case "stackedarea":
      instance = new importedChartModule.default(data, this.social)
      break  
    case "smallmultiples":
      instance = new importedChartModule.default(data)
      break
    case "sankey":
      instance.render()
      break  
    case "table":
      console.log("Table resize")
      break
    default:
      instance = new importedChartModule.default(data)
    }
  }
}