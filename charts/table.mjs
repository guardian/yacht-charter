import dataTools from "./dataTools"
import ColorScale from "./shared/colorscale"

export default class table {
  constructor(results) {
    const container = d3.select("#graphicContainer")
    var data = results.sheets.data
    var details = results.sheets.template
    var options = results.sheets.options
    var userKey = results["sheets"]["key"]

    const {
      colorDomain,
      colorRange,
      colorMax
    } = dataTools.getColorDomainRangeMax(options)

    this.colors = new ColorScale({
      type: "linear",
      domain: colorDomain,
      colors: colorRange,
      divisor: colorMax
    })

    this.big(data)
    this.small(data)
  }

  big(data) {
    const self = this
    function generateTableHead(table, data) {
      let thead = table.createTHead()
      let row = thead.insertRow()
      for (let key of data) {
        let th = document.createElement("th")
        th.classList.add("column-header")
        let text = document.createTextNode(key)
        th.appendChild(text)
        row.appendChild(th)
      }
    }

    function generateTable(table, data) {
      for (let element of data) {
        let row = table.insertRow()
        for (let key in element) {
          let cell = row.insertCell()
          let text = document.createTextNode(element[key])
          cell.appendChild(text)
          cell.style.backgroundColor = self.colors.get(element[key])
        }
      }
    }

    let table = document.querySelector("#big-table")
    let pivots = Object.keys(data[0])
    generateTableHead(table, pivots)
    generateTable(table, data)
  }

  small(data) {
    const self = this
    let pivots = Object.keys(data[0])

    function generateTable(table, data) {
      for (let cat of data) {
        let row = table.insertRow()
        var th = document.createElement("th")
        th.colSpan = "2"
        th.classList.add("st-head-row")
        th.innerHTML = cat[pivots[0]]
        row.appendChild(th)

        for (var i = 1; i < pivots.length; i++) {
          let tr = table.insertRow()

          let key = tr.insertCell()
          key.classList.add("st-key")
          let text = document.createTextNode(pivots[i])
          key.appendChild(text)

          let val = tr.insertCell()
          val.classList.add("st-val")
          let txt = document.createTextNode(cat[pivots[i]])
          val.appendChild(txt)
          val.style.backgroundColor = self.colors.get(cat[pivots[i]])
        }
      }
    }

    let table = document.querySelector("#small-table")

    generateTable(table, data)
  }
}
