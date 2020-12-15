import dataTools from "./dataTools"
import ColorScale from "./shared/colorscale"
import contains from "../utilities/contains"
import createTable from "../utilities/table/createTable"
import addMobilePrefix from "../utilities/table/addMobilePrefix"
import propComparator from "../utilities/table/propComparator"
import styleHeaders from "../utilities/table/styleHeaders"
import colourize from "../utilities/table/colourize"
import mustache from "../utilities/mustache"
import matchArray from "../utilities/table/matchArray"

export default class table {
  constructor(results) {

    const self = this
    const table = document.querySelector("#int-table")
    const data = results.sheets.data
    const details = results.sheets.template
    const options = results.sheets.options
    const userKey = results["sheets"]["key"]
    const headings = Object.keys(data[0])
    
    createTable(table, headings)
    
    addMobilePrefix(headings)

    colourize(headings, userKey, data, ColorScale).then(data => {

      self.data = data

      self.setup(options)

    })


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

  }

  setup(options) {

    var self = this

    this.render()

    this.searchEl = document.getElementById("search-field");

    if (options[0].enableSearch==='TRUE') {
      document.querySelector("#search-container").style.display = "block";
      this.searchEl.addEventListener("input", () => self.render(this.value));
      this.searchEl.addEventListener("focus", () => { if (this.value === "Search") { this.value = ""}});
    }

    if (options[0].enableSort==='TRUE') {
      this.currentSort = null
      document.querySelector("tr").addEventListener("click", (e) => self.sortColumns(e));
    }

    if (options[0].scrolling==='TRUE') {
      this.showingRows = true
    } else {
      this.showingRows = false
      document.querySelector("#untruncate").style.display = "block";
      document.querySelector("#untruncate").addEventListener("click", (button) => {
        self.showingRows = (self.showingRows) ? false : true ;
        self.render()
      });
    }

  }

  sortColumns(e) {

    var self = this

    this.data = this.data.sort(propComparator(e.target.cellIndex));

    styleHeaders(e)

    this.render()

  }

  render() {

    const self = this

    const tbodyEl = document.querySelector("#int-table tbody");

    const template = `{{#rows}}
        <tr {{#getIndex}}{{/getIndex}}>
            {{#item}}
                <td {{#styleCheck}}{{/styleCheck}} class="column"><span class="header-prefix"></span><span>{{value}}</span></td>
            {{/item}}
        </tr>
    {{/rows}}`;

    const rowsToRender = (this.searchEl && this.searchEl.value !== "") ? self.data.filter((item) => { 
      return matchArray(item.map((row) => Object.values(row)[0]), self.searchEl.value)
    }) : self.data ;

    const finalRows = rowsToRender.map((item,index) => {
      return { index : index , item : item}
    })

    const styleCheck = function() {
      return (this.color) ? `style="background-color:${this.color};text-align:center;color:${this.contrast};"` :
      (!isNaN(this.value)) ? `style="text-align:center;"` : ''
    }

    const getIndex = function() {
      return (this.index >= 10 && !self.showingRows) ? `style="display:none;"` : ""
    }

    const html = mustache( template, { rows : finalRows, styleCheck : styleCheck, getIndex : getIndex })

    tbodyEl.innerHTML = html;

  }

}
