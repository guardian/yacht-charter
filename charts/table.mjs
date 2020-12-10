import dataTools from "./dataTools"
import ColorScale from "./shared/colorscale"
import contains from "../utilities/contains"
import createTable from "../utilities/table/createTable"
import swatches from "../utilities/table/swatches"
import mustache from "../utilities/mustache"
import matchArray from "../utilities/table/matchArray"

export default class table {
  constructor(results) {

    const self = this

    const container = document.querySelector("#graphicContainer")
    const table = document.querySelector("#int-table")

    const data = results.sheets.data
    const details = results.sheets.template
    const options = results.sheets.options
    const userKey = results["sheets"]["key"]

    const pantone = swatches(data, userKey, ColorScale)
    const headings = Object.keys(data[0])
    const highlighted = userKey.map(item => item.key)
    createTable(table, headings)
    const colourizer = (value, index) => (!contains(headings[index], highlighted)) ? 'none' : pantone.find(item => item.name === headings[index]).profile.get(value) ;
    const values = data.map((row) => Object.values(row))
    
    this.data = values.map((row, i) => row.map((value, index) => { return { value : value, color : colourizer(value, index) }}))

    /*
    format  enableSearch  enableSort
    scrolling TRUE  TRUE
    */

    /*
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
    */

    this.render()

    this.searchEl = document.getElementById("search-field");

    if (options[0].enableSearch==='TRUE') {
      document.querySelector("#search-container").style.display = "block";
      this.searchEl.addEventListener("input", () => self.render(this.value));
      this.searchEl.addEventListener("focus", () => { if (this.value === "Search") { this.value = ""}});
    }

    if (options[0].enableSort==='TRUE') {
      //Set up the sort stuff
    }

    if (options[0].scrolling==='TRUE') {
      //Set up the scrolling stuff
    }

  }

  render() {

    const self = this

    const tbodyEl = document.querySelector("#int-table tbody");

    const template = `{{#rows}}
        <tr>
            {{#.}}
                <td style="background-color:{{color}};"class="column"><span class="header-prefix"></span><span>{{value}}</span></td>
            {{/.}}
        </tr>
    {{/rows}}`;

    const rowsToRender = (this.searchEl && this.searchEl.value !== "Search" && this.searchEl.value !== "") ? self.data.filter((item) => { 
      return matchArray(item.map((row) => Object.values(row)[0]), self.searchEl.value)
    }) : self.data ;

    const html = mustache(template, { rows : rowsToRender }) // { ...helpers, ... }

    tbodyEl.innerHTML = html;

  }

}
