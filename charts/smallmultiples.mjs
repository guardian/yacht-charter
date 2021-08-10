// To do:
//  -Add support for custom user key like other charts
//  -Make a key when it is a multiSeries
//  -Label support

import moment from "moment"
import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import dataTools from "./dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"

export default class SmallMultiples {
  constructor(results) {
    var self = this
    var data = results.sheets.data
    var details = results.sheets.template
    var options = results.sheets.options
    
    this.periods = null
    if (results.sheets.periods) {
      this.periods = results.sheets.periods
    }
    
    console.log("periods",this.periods)

    this.dataKeys = Object.keys(data[0])
    this.hideNullValues = "yes"
    this.$chartKey = d3.select("#chartKey")
    this.chartValues = {}
    this.chartType =
      options[0] && options[0].chartType ? options[0].chartType : "area" // bar, line, area (default)

    this.noColsSet = false 

    if (options["breaks"]) {
      this.hideNullValues = options["breaks"]
    }

    if (this.chartType === "bar") {
        this.hideNullValues = "no"
    }

    this.xVar = this.dataKeys[0]

    if (details[0]["xColumn"]) {
      this.xVar = details[0]["xColumn"] 
    }

    this.groupVar = this.dataKeys[1]
    
    if (details[0]["groupColumn"]) {
      this.groupVar = details[0]["groupColumn"]
      // this.dataKeys.splice(keys.indexOf(this.groupVar), 1)
    }

    this.yVar = this.dataKeys[2]

    if (details[0]["yColumn"]) {
      this.groupVar = details[0]["yColumn"]
    }

    this.numCols = null

    if (options[0]["numCols"]) {
      this.numCols = +options[0]["numCols"]
    }

    this.height = null
    
    if (options[0]["height"]) {
      this.height = +options[0]["height"]
    }

    this.multiSeries = false

    this.dataKeys.splice(this.dataKeys.indexOf(this.xVar), 1)
    this.dataKeys.splice(this.dataKeys.indexOf(this.groupVar), 1)

    if (this.dataKeys.length > 1) {
      this.multiSeries = true
      console.log("multiSeries", this.multiSeries)
    }

    this.hasTooltip = details[0].tooltip != "" ? true : false

    var keys = [...new Set(data.map((d) => d[this.groupVar]))]

    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )

    this.details = details
    this.parseTime = this.details[0]["dateFormat"] ? d3.timeParse(this.details[0]["dateFormat"]) : null

    data.forEach(function (d) {
        
      self.dataKeys.forEach(key  => {

          if (typeof d[key] == "string") {

            if (d[key].indexOf(',') > -1) {
              if (!isNaN(d[key].replace(/,/g, ""))) {
                d[key] = +d[key].replace(/,/g, "")
                // this.chartValues.push(d[key])
              }
            } else if (d[key] != "") {
              if (!isNaN(d[key])) {
                d[key] = +d[key]
                // this.chartValues.push(d[key])
              }
            } 

            else if (d[key] == "") {
              if (self.hideNullValues === "yes") {
                d[key] = NaN
              }
              else {
                d[key] = ""
              }
            }

          }
      })
      

      // else {
      //     if (typeof d[self.yVar] == "string") {
      //     d[self.yVar] = +d[self.yVar]
      //   }
      // }

      if (typeof d[self.xVar] == "string") {
        // let timeParse = d3.timeParse("%Y-%m-%d")
        d[self.xVar] = self.parseTime(d[self.xVar])
      
      }
    })

    if (this.periods) {
          this.periods.forEach((d) => {
          if (typeof d.start == "string") {
            if (this.parseTime != null) {

                d.start = this.parseTime(d.start)
                if (d.end != "") {
                  d.end = this.parseTime(d.end)
                  d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2)
                }

                else {
                  d.middle = d.start
                }
                
            }

            else {
              d.start = +d.start

              if (d.end != "") {
                d.end = +d.end
                d.middle = (d.end + d.start) / 2
              }

              else {
                  d.middle = d.start
                }
            }
        
      }
      })
    }
    
    console.log(this.periods)

    if (this.hasTooltip) {
      this.tooltip = new Tooltip("#graphicContainer")
    }

    this.data = data

    this.keys = keys

    // this.parseTime = null
 
    this.isMobile = windowWidth < 610 ? true : false

    this.template = details[0].tooltip

    this.colors = new ColorScale({ domain: this.dataKeys })

  

    // this.chartType = "bar"  

    if (options[0] && options[0]["scaleBy"] == "group") {
      this.showGroupMax = true
    } else {
      this.showGroupMax = false
      d3.select("#switch").html("Show max scale for group")
    }
    d3.select("#switch").on("click", function () {
      console.log("switch")
      self.showGroupMax = self.showGroupMax ? false : true

      var label = self.showGroupMax
        ? "Show max scale for each chart"
        : "Show max scale for group"

      d3.select(this).html(label)
    })

    var margin
    if (details[0]["margin-top"]) {
      margin = {
        top: +details[0]["margin-top"],
        right: +details[0]["margin-right"],
        bottom: +details[0]["margin-bottom"],
        left: +details[0]["margin-left"]
      }
    } else {
      margin = {
        top: 10,
        right: 20,
        bottom: 20,
        left: 50
      }
    }

    this.margin = margin
    this.width
    
    this.setup()
  }

  setup() {
    var self = this
    var containerWidth = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width

    self.containerHeight = containerWidth

    // var numCols

    if (self.numCols === null) {
        if (containerWidth <= 500) {
          self.numCols = 1
        } else if (containerWidth <= 750) {
          self.numCols = 2
        } else {
          self.numCols = 3
        }
    }

    else {
      self.noColsSet = true
      if (self.numCols > 3) {
        if (self.isMobile) {
          self.numCols = 2
        }
      }
    }

    var width = containerWidth / self.numCols

    var height

    if (self.height != null) {
      height = self.height
    }

    else {
      height = 200
      if (self.isMobile) {
      height = 150
      }
    }

    self.width = width - self.margin.left - self.margin.right
    self.height = height - self.margin.top - self.margin.bottom

    d3.select("#graphicContainer").selectAll(".chart-grid").remove()
    

    this.keys.forEach((key, index) => {
      this.drawChart({
        data: this.data,
        key,
        details: this.details,
        chartType: this.chartType,
        isMobile: this.isMobile,
        hasTooltip: this.hasTooltip,
        index
      })
    })

    if (this.multiSeries) {
      
    this.$chartKey.html("")  

    this.dataKeys.forEach((key) => {
        const $keyDiv = this.$chartKey.append("div").attr("class", "keyDiv")

        $keyDiv
          .append("span")
          .attr("class", "keyCircle")
          .style("background-color", () => this.colors.get(key))

        $keyDiv.append("span").attr("class", "keyText").text(key)
      })
    }
  
  }

  drawChart({ data, key, details, chartType, isMobile, hasTooltip, index }) {
    var self = this 

    const id = dataTools.getId(key),
      chartId = `#${id}`,
      isBar = chartType === "bar", // use different x scale
      isLine = chartType === "line",
      isArea = chartType === "area"

    d3.select("#graphicContainer")
      .append("div")
      .attr("id", id)
      .attr("class", "chart-grid")
      .style("width", function(d) {
          
          if (self.numCols === 1) {
            return "100%"
          } else if (self.numCols === 2) {
            return "49.9%"
          } else if (self.numCols === 3) {
            return "32.9%"
          }
          else if (self.numCols > 3) {
              var smWidth = (100/self.numCols - 0.1).toString() + "%"
              return smWidth
          }
      })

    d3.select(chartId).append("div").text(key).attr("class", "chartSubTitle").style("padding-left", this.margin.left + "px")
    // d3.selectAll(".chartSubTitle")

    const svg = d3
      .select(chartId)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("overflow", "hidden")

    const features = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      )

    var x = d3.scaleBand().range([0, this.width]).padding(0)

    if (this.parseTime) {
      if (!isBar) {
          x = d3.scaleTime().range([0, this.width])
      }
    }

    else {
      if (!isBar) {
          x = d3.scaleLinear().range([0, this.width])
      }
    } 

    // const x = isBar
    //   ? d3.scaleBand().range([0, this.width]).padding(0)
    //   : d3.scaleLinear().range([0, this.width])

    const y = d3.scaleLinear().range([this.height, 0])
    const duration = 1000
    let yMax = this.showGroupMax
      ? data
      : data.filter((item) => item[this.groupVar] === key)

    // console.log("yMax", yMax)  

    // console.log("yMax",data.filter((item) => item[this.groupVar] === key))  

    if (isBar) {
      x.domain(data.map((d) => d[this.xVar]))
    } else {
      x.domain(d3.extent(data, (d) => d[this.xVar]))
    }

    if (this.multiSeries) {
      var allValues = []
      this.dataKeys.forEach(key => {
          allValues = allValues.concat(d3.extent(yMax, (d) => d[key]))
      })
      y.domain(d3.extent(allValues))
      // console.log(allValues)
      // console.log(d3.extent(allValues))
    }

    else {
      y.domain(d3.extent(yMax, (d) => d[this.yVar]))
    }

  
    const tickMod = Math.round(x.domain().length / 3)
    console.log("tickMod", tickMod, "blah", x.domain().length)
    // if (isBar) {
    //   const ticks = x
    //   .domain()
    //   .filter((d, i) => !(i % tickMod) || i === x.domain().length - 1)
    // }
    const ticks = x
      .domain()
      .filter((d, i) => !(i % tickMod) || i === x.domain().length - 1)

    console.log("ticks",Math.round(this.width/100))   
    
    var xAxis = d3
      .axisBottom(x)
      // .tickValues(ticks)
      // .tickFormat(d3.timeFormat())
      .ticks(3)

     if (isBar) {
        xAxis.tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"))
     } 

     if (this.numCols > 3) {
    
      var blahTicks = [x.domain()[0],
                      new Date((x.domain()[0].getTime() + x.domain()[1].getTime())/2),
                      x.domain()[1]
                    ]

      xAxis = d3
        .axisBottom(x)
        .tickValues(blahTicks )
        .tickFormat(d3.timeFormat("%-d %b"))
     }
      
    const yAxis = d3
      .axisLeft(y)
      .tickFormat((d) => numberFormat(d))
      .ticks(3)

    features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(xAxis)

    features.append("g").attr("class", "y")

    const update = () => {
      console.log("update")
      yMax = this.showGroupMax
        ? data
        : data.filter((item) => item[this.groupVar] === key)
        

        if (this.multiSeries) {
        var allValues = []
        this.dataKeys.forEach(key => {
            allValues = allValues.concat(d3.extent(yMax, (d) => d[key]))
        })
        y.domain(d3.extent(allValues))
        console.log(allValues)
        console.log(d3.extent(allValues))
      }

        else {
          y.domain(d3.extent(yMax, (d) => d[this.yVar]))
      }  

      // y.domain(d3.extent(yMax, (d) => d[this.yVar]))

      const chartData = data.filter((d) => d[this.groupVar] === key)
      const drawOptions = {
        features,
        data: chartData,
        duration,
        x,
        y,
        hasTooltip,
        index
      }

      if (isBar) {
        this.drawBarChart(drawOptions)
      } else if (isLine) {
        this.drawLineChart(drawOptions)
      } else if (isArea) {
        this.drawAreaChart(drawOptions)
      }

      if (hasTooltip && !isBar) {
        this.drawHoverFeature(drawOptions)
      }

      if (this.periods) {
        this.drawPeriods(drawOptions)
      }
      

      features.select(".y").transition().duration(duration).call(yAxis)
    }

    document.getElementById("switch").addEventListener("click", () => update())
    update()
  }

  drawBarChart({ features, data, duration, x, y, hasTooltip}) {

    var bars = features.selectAll(".bar").data(data)
    console.log(data)
    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .style("fill", () => "rgb(204, 10, 17)")
      .attr("height", 0)
      .attr("y", this.height)
      .merge(bars)
      .transition()
      .duration(duration)
      .attr("x", (d) => x(d[this.xVar]))
      .attr("y", (d) => y(Math.max(d[this.yVar], 0)))
      .attr("width", x.bandwidth())
      .attr("height", (d) => Math.abs(y(d[this.yVar]) - y(0)))

    if (hasTooltip) {
      const templateRender = (d) => {
        return mustache(this.template, { ...helpers, ...d })
      }
      this.tooltip.bindEvents(
        d3.selectAll(".bar"),
        this.width,
        this.containerHeight,
        templateRender
      )
    }

    bars
      .exit()
      .transition()
      .duration(duration)
      .attr("height", 0)
      .attr("y", this.height)
      .remove()
  }

  drawLineChart({ features, data, duration, x, y }) {

      console.log("data", data)
      features.selectAll(`.line-path`).remove()

      this.dataKeys.forEach((key, i) => {

          // const $line = features.selectAll(`.${key}.line-path`).data([data])  
          
        
          console.log(key)

          const line = d3
            .line()
            .x((d) => x(d[this.xVar]))
            .y((d) => y(d[key]))

          if (this.hideNullValues === "yes") {
       
           line.defined(function (d) {
              return !isNaN(d[key])
              })
          }  
           
          const initialLine = d3
            .line()
            .x((d) => x(d[this.xVar]))
            .y(this.height)

          if (this.hideNullValues === "yes") {
     
           initialLine.defined(function (d) {
              return !isNaN(d[key])
              })
          }   

          // $line
          //   .enter()
          //   .append("path")
          //   .attr("class", `${key} line-path`)
          //   .attr("fill", "transparent")
          //   .attr("d", initialLine)
          //   .merge($line)
          //   .transition()
          //   .duration(duration)
          //   .attr("d", line)
          //   .attr("stroke-width", 2)
          //   .attr("stroke", (d) => this.colors.get(key))

          features
            .append("path")
            .datum(data)
            .attr("class", `${key} line-path`)
            .attr("fill", "transparent")
            .attr("d", initialLine)
            .transition()
            .duration(duration)
            .attr("d", line)
            .attr("stroke-width", 2)
            .attr("stroke", (d) => this.colors.get(key))

          // features
          //   .append("path")
          //   .datum(data)
          //   .attr("class", `${key} line-path`)
          //   .attr("fill", "transparent")
          //   .attr("d", line)
          //   .attr("stroke-width", 2)
          //   .attr("stroke", (d) => this.colors.get(key))

          // $line.exit().transition().duration(duration).attr("d", initialLine).remove()
      
      })

    // const line = d3
    //   .line()
    //   .x((d) => x(d[this.xVar]))
    //   .y((d) => y(d[this.yVar]))
    // const initialLine = d3
    //   .line()
    //   .x((d) => x(d[this.xVar]))
    //   .y(this.height)

    // $line
    //   .enter()
    //   .append("path")
    //   .attr("class", "line-path")
    //   .attr("fill", "transparent")
    //   .attr("d", initialLine)
    //   .merge($line)
    //   .transition()
    //   .duration(duration)
    //   .attr("d", line)
    //   .attr("stroke-width", 2)
    //   .attr("stroke", this.colors.get(0))

    // $line.exit().transition().duration(duration).attr("d", initialLine).remove()
  }

  drawAreaChart({ features, data, duration, x, y}) {

    const $area = features.selectAll(".area-path").data([data])
    
    if (this.multiSeries) {

      this.dataKeys.forEach((key, i) => {

           const area = d3
            .area()
            .x((d) => x(d[this.xVar]))
            .y0((d) => y(0))
            .y1((d) => y(d[key]))

          const initialArea = d3
            .area()
            .x((d) => x(d[this.xVar]))
            .y0((d) => y(0))
            .y1((d) => this.height)

          $area
            .enter()
            .append("path")
            .attr("class", "area-path")
            .attr("fill", this.colors.get(i))
            .attr("d", initialArea)
            .merge($area)
            .transition()
            .duration(duration)
            .attr("d", area)

          $area.exit().transition().duration(duration).attr("d", initialArea).remove()
      
      })

    }

    else {

    const area = d3
      .area()
      .x((d) => x(d[this.xVar]))
      .y0((d) => y(0))
      .y1((d) => y(d[this.yVar]))

    const initialArea = d3
      .area()
      .x((d) => x(d[this.xVar]))
      .y0((d) => y(0))
      .y1((d) => this.height)

    $area
      .enter()
      .append("path")
      .attr("class", "area-path")
      .attr("fill", this.colors.get(0))
      .attr("d", initialArea)
      .merge($area)
      .transition()
      .duration(duration)
      .attr("d", area)

    $area.exit().transition().duration(duration).attr("d", initialArea).remove()

    }


  }

  drawHoverFeature({ features, data, x }) {
    const self = this
    const xColumn = this.xVar
    const $hoverLine = features
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.height)
      .style("opacity", 0)
      .style("stroke", "#333")
      .style("stroke-dasharray", 4)

    const $hoverLayerRect = features
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("opacity", 0)

    // Find the data based on mouse position
    const getTooltipData = (d, event) => {
      const bisectDate = d3.bisector((d) => d[xColumn]).left,
        x0 = x.invert(d3.mouse(event)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i]

      let tooltipData = {}

      if (d0 && d1) {
        tooltipData = x0 - d0[xColumn] > d1[xColumn] - x0 ? d1 : d0
      } else {
        tooltipData = d0
      }

      return tooltipData
    }

    // Render tooltip data
    const templateRender = (d, event) => {
      const data = getTooltipData(d, event)
      return mustache(this.template, {
        ...helpers,
        ...data
      })
    }

    // $hoverLayerRect
    //   .on("mousemove touchmove", function (d) {
    //     const x0 = x.invert(d3.mouse(this)[0])
    //     const tooltipText = templateRender(d, this)

    //     self.tooltip.show(
    //       tooltipText,
    //       self.width,
    //       self.height + self.margin.top + self.margin.bottom
    //     )
    //     $hoverLine.attr("x1", x(x0)).attr("x2", x(x0)).style("opacity", 0.5)
    //   })
    //   .on("mouseout touchend", function () {
    //     self.tooltip.hide()
    //     $hoverLine.style("opacity", 0)
    //   })
  }

  drawPeriods({ features, data, x, index }) {

    features.selectAll(".periodLine").remove()
    features.selectAll(".periodLabel").remove()

    features
      .selectAll(".periodLine .start")
      .data(this.periods)
      .enter()
      .append("line")
      .attr("x1", (d) => {
        return x(d.start)
      })
      .attr("y1", 0)
      .attr("x2", (d) => {
        return x(d.start)
      })
      .attr("y2", this.height)
      .attr("class", "periodLine mobHide start")
      .attr("stroke", "#bdbdbd")
      .attr("opacity", (d) => {
        if (d.start < x.domain()[0]) {
          return 0
        } else {
          return 1
        }
      })
      .attr("stroke-width", 1)

    features
      .selectAll(".periodLine .end")
      .data(this.periods.filter(b => b.end != ""))
      .enter()
      .append("line")
      .attr("x1", (d) => {
        return x(d.end)
      })
      .attr("y1", 0)
      .attr("x2", (d) => {
        return x(d.end)
      })
      .attr("y2", this.height)
      .attr("class", "periodLine mobHide")
      .attr("stroke", "#bdbdbd")
      .attr("opacity", (d) => {
        if (d.end > x.domain()[1]) {
          return 0
        } else {
          return 1
        }
      })
      .attr("stroke-width", 1)

    if (index === 0) {

       features
      .selectAll(".periodLabel")
      .data(this.periods)
      .enter()
      .append("text")
      .attr("x", (d) => {
        if (d.labelAlign == "start") {
          return x(d.start) + 5
        } else {
          return x(d.middle)
        }
      })
      .attr("y", -5)
      .attr("text-anchor", (d) => {
        if (d.labelAlign == "start") {
        return "start"
        }
        else {
          return "middle"
        }
      })
      .attr("class", "periodLabel mobHide")
      .attr("opacity", 1)
      .text((d) => {
        return d.label
      })

    }  

   
  }

}
