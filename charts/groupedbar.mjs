import dataTools from "./dataTools"
import ColorScale from "./shared/colorscale"
import { numberFormat } from '../utilities/numberFormat'

d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};

export default class groupedBar {

  constructor(results) {

    this.data = results.sheets.data
    this.details = results.sheets.template
    this.labels = results.sheets.labels
    this.userKey = results["sheets"]["key"]
    this.options = results.sheets.options[0]['enableShowMore']

    this.render()

  }

  render() {

    var data = this.data

    var chartKey = d3.select("#chartKey")
    
    chartKey.html("")

    var columns = Object.keys(data[0]);

    var primary = columns[0]

    var groupKey = data.map(d => d[columns[0]])

    columns.shift()

    var keys = columns

    var dataset = []

    data.map(d => keys.map(key => (+d[key]))).forEach(ob => dataset.push(...ob))

    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    var isMobile = (windowWidth < 610) ? true : false ;

    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width

    var height = 60 * groupKey.length   

    var margin

    if (this.details[0]["margin-top"]) {
      margin = {
        top: +this.details[0]["margin-top"],
        right: +this.details[0]["margin-right"],
        bottom: +this.details[0]["margin-bottom"],
        left: +this.details[0]["margin-left"]
      }
    } else {
      margin = {
        top: 20,
        right: 20,
        bottom: 0,
        left: 150
      }
    }
    
    this.userKey.forEach(function (key, i) {
      var keyDiv = chartKey.append("div").attr("class", "keyDiv")

      keyDiv
        .append("span")
        .attr("class", "keyCircle")
        .style("background-color", function () {
          return key.colour
        })

      keyDiv.append("span").attr("class", "keyText").text(key.key)
    })

    width = width - margin.left - margin.right

    height = height - margin.top - margin.bottom;
   
    d3.select("#graphicContainer svg").remove();

    var svg = d3.select("#graphicContainer").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "svg")
      .attr("overflow", "hidden");          

    var y0 = d3.scaleBand()
      .domain(groupKey)
      .rangeRound([margin.top, height - margin.bottom])
      .paddingInner(0.1)
    
    var y1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([y0.bandwidth(), 0])
      .padding(0.05)
    
    var x = d3.scaleLinear()
      .domain([0, d3.max(dataset)])
      .rangeRound([margin.left, ( width + margin.left )  - margin.right])
    
    var color = d3.scaleOrdinal()

    color.range(this.userKey.map(item => item.colour))

    color.domain(this.userKey.map(item => item.key))

    var xAxis = g => g
      .attr("transform", `translate(0,${0 + margin.top})`)
      .attr("class", "axisgroup") 
      .call(d3.axisTop(x).tickSizeOuter(0))
      .call(d3.axisTop(x)
            .ticks(3)
            .tickSize(-height, 0, 0)
            .tickPadding(10))
      
    var yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y0))

    var bars = svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => {
        return `translate(0,${y0(d[[primary]])})`
      })

    bars.selectAll("rect")
      .data(d => keys.map(key => ({key, value: d[key]})))
      .enter()
      .append("rect")
      .attr("x", d => x(0))
      .attr("y", d => y1(d.key))
      .attr("height", y1.bandwidth())
      .attr("width", d => x(d.value) - x(0))
      .attr("fill", d => {
        return color(d.key)
      })

    bars.selectAll("text")
      .data(d => keys.map(key => ({key, value: d[key]})))
      .enter()
      .append("text")
      .attr("text-anchor", d => (x(d.value) - x(0) < 100) ? "start" : "end" )
      .attr("x", d => (x(d.value) - x(0) < 100) ? x(d.value) + 10 : x(d.value) - 10)
      .attr("y", d => y1(d.key) + ( y1.bandwidth() - 7 ) )
      .attr("fill", d => (x(d.value) - x(0) < 100) ? "black" : "white")
      .attr("font-weight","600")
      .text((d) => d.value);

    bars.selectAll("line")
      .data(d => keys.map(key => ({key, value: d[key]})))
      .enter()
      .append("line")
      .style("stroke", "#767676")
      .style("stroke-width", 1)
      .attr("x1", d => x(0))
      .attr("y1", y0(0))
      .attr("x2", d => x(0))
      .attr("y2", d => y1(d.key) + ( y1.bandwidth() + 2 ) )

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

    d3.selectAll('.axisgroup').moveToBack()

  }

}
