import dataTools from "./dataTools"
import ColorScale from "./shared/colorscale"
import contains from "../utilities/contains"
import createTable from "../utilities/table/createTable"
import addCustomCSS from "../utilities/table/addCustomCSS"
import propComparator from "../utilities/table/propComparator"
import styleHeaders from "../utilities/table/styleHeaders"
import colourize from "../utilities/table/colourize"
import mustache from "../utilities/mustache"
import matchArray from "../utilities/table/matchArray"
import { numberFormat } from "../utilities/numberFormat"
import { commas } from "../utilities/commas"

export default class table {
  constructor(results) {

    const self = this

    this.showingRows = true
    const table = document.querySelector("#int-table")
    const data = results.sheets.data
    const details = results.sheets.template
    const options = results.sheets.options
    const userKey = results["sheets"]["key"]
    const headings = Object.keys(data[0])

    data.forEach(function(row) {
      for (let cell of headings) {
        row[cell] = (typeof row[cell] === "string" && !isNaN(parseInt(row[cell]))) ? +row[cell] : row[cell]
      }
    });

    //console.log(data)
    
    createTable(table, headings, options[0].enableSort)
    
    addCustomCSS(headings, options[0].format)

    colourize(headings, userKey, data, ColorScale).then(data => {

      self.data = data

      self.setup(options)

    })

  }

  setup(options) {

    var self = this

    this.render()

    this.searchEl = document.getElementById("search-field");

    if (options[0].enableSearch==='TRUE') {
      document.querySelector("#search-container").style.display = "block";
      this.searchEl.addEventListener("input", () => self.render(this.value));
    }

    if (options[0].enableSort==='TRUE') {
      this.currentSort = null
      document.querySelector("tr").addEventListener("click", (e) => self.sortColumns(e));
    }

    if (options[0].format==='truncated') {
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
                <td {{#styleCheck}}{{/styleCheck}} class="column"><span class="header-prefix"></span><span>{{#formatedNumber}}{{/formatedNumber}}</span></td>
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
      (!isNaN(this.value)) ? `style="text-align:center;"` : '' ;
    }

    const formatedNumber = function() {
      var value = ""
      if (this.format!=undefined) {
        let arr = this.format.map(item => item.trim())
        let val = this.value
        value += (contains(arr,'$')) ? '$' : '' ;
        value += (contains(arr,'numberFormat')) ? numberFormat(val) : (contains(arr,'commas')) ? commas(val) : val ;
      } else {
        value = this.value
      }
      return value
    }

    const getIndex = function() {
      return (this.index >= 10 && !self.showingRows) ? `style="display:none;"` : ""
    }

    const html = mustache( template, { rows : finalRows, styleCheck : styleCheck, getIndex : getIndex, formatedNumber : formatedNumber })

    tbodyEl.innerHTML = html;

  }

}
