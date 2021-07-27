import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import dataTools from "./dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import renderCanvas from "../utilities/renderCanvas"

// import * as rasterizeHTML from 'rasterizehtml'

export default class StackedBarChart {
  constructor(results, social) {
    this.tooltip = new Tooltip("#graphicContainer")
    this.colors = new ColorScale()
    this.trendColors = new ColorScale()
    this.results = results
    this.social = social
    this.render()
    if (social) {
      renderCanvas(social)
    }

  }

  // turn this into a module !!!!!

  

  render() {

    var self = this
    console.log("social",self.social)
    var results = JSON.parse(JSON.stringify(self.results))
    var data = results.sheets.data
    var details = results.sheets.template
    var labels = results.sheets.labels
    var trendline = results.sheets.trendline
    var userKey = results.sheets.key 
    var options = results.sheets.options
    var hasTooltip =  details[0].tooltip != "" ? true : false
    var hasTrendline = false
    
    if (trendline) {
        if (trendline.length > 0) {
        hasTrendline = trendline[0].index != "" ? true : false
      }
    }
    
    var template
    var keys = Object.keys(data[0])

    if (hasTooltip) {
      template = details[0].tooltip
    }

    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    var isMobile = windowWidth < 610 ? true : false
    

    // Default height and width setup

    var width = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width
    var height = width * 0.5


    // Set up for social media views

    const dimensons = {"twitter": {"width":1200,"height":675}, 
        "instagram": {"width":1200,"height":1200}    
        }
    const body = document.querySelector("body")
    const furniture = document.querySelector("#furniture")
    const footer = document.querySelector("#footer")
    // var canvas
    
    if (self.social) {
      console.log("setting up social stuff")
      body.classList.add(self.social);
      height = dimensons[self.social].height - furniture.getBoundingClientRect().height - footer.getBoundingClientRect().height - 33
      // width = width - 20;
    }
    
    console.log("height", height, "width", width)

    var margin
    var dateParse = null
    var timeInterval = null
    var xAxisDateFormat = null
    // Check if margin defined by user
    if (details[0]["margin-top"] != "") {
      margin = {
        top: +details[0]["margin-top"],
        right: +details[0]["margin-right"],
        bottom: +details[0]["margin-bottom"],
        left: +details[0]["margin-left"]
      }
    } else {
      margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      }
    }

    if (typeof details[0]["dateFormat"] != undefined) {
      dateParse = d3.timeParse(details[0]["dateFormat"])
    }
    if (typeof details[0]["timeInterval"] != undefined) {
      timeInterval = details[0]["timeInterval"]
    }
    if (typeof details[0]["xAxisDateFormat"] != undefined) {
      xAxisDateFormat = d3.timeFormat(details[0]["xAxisDateFormat"])
    }

    ;(width = width - margin.left - margin.right),
      (height = height - margin.top - margin.bottom)

    d3.select("#graphicContainer svg").remove()

    var chartKey = d3.select("#chartKey")

    chartKey.html("")

    var svg = d3
      .select("#graphicContainer")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "svg")
      .attr("overflow", "hidden")
    var features = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var xVar
    if (details[0]["xColumn"]) {
      xVar = details[0]["xColumn"]
      keys.splice(keys.indexOf(xVar), 1)
    } else {
      xVar = keys[0]
      keys.splice(0, 1)
    }

    // set up color domain/range
    const keyColor = dataTools.getKeysColors({ keys: keys, userKey: userKey, option: options[0]})

    this.colors.set(keyColor.keys, keyColor.colors)

    keys.forEach((key, i) => {
      var keyDiv = chartKey.append("div").attr("class", "keyDiv")
      keyDiv
        .append("span")
        .attr("class", "keyCircle")
        .style("background-color", () => {
          return this.colors.get(key)
        })
      keyDiv.append("span").attr("class", "keyText").text(key)
    })

    data.forEach(function (d) {
      if (dateParse != null) {
        if (typeof d[xVar] === "string") {
          d[xVar] = dateParse(d[xVar])
        }
      }
      keys.forEach(function (key, i) {
        d[key] = +d[key]
      })
      d.Total = d3.sum(keys, (k) => +d[k])
    })

    labels.forEach(function (d) {
      if (dateParse != null) {
        d.x1 = dateParse(d.x1)
      }
      d.y1 = +d.y1
      d.y2 = +d.y2
    })

    // Time scales for bar charts are heaps annoying
    var barWidth
    var xRange

    function stackMin(serie) {
      return d3.min(serie, function (d) {
        return d[0]
      })
    }

    function stackMax(serie) {
      return d3.max(serie, function (d) {
        return d[1]
      })
    }

    if (timeInterval) {
      if (timeInterval == "year") {
        xRange = d3.timeYear.range(
          data[0][xVar],
          d3.timeYear.offset(data[data.length - 1][xVar], 1)
        )
      }
      if (timeInterval == "day") {
        xRange = d3.timeDay.range(
          data[0][xVar],
          d3.timeDay.offset(data[data.length - 1][xVar], 1)
        )
      }
      if (timeInterval == "month") {
        xRange = d3.timeMonth.range(
          data[0][xVar],
          d3.timeMonth.offset(data[data.length - 1][xVar], 1)
        )
      }

      if (timeInterval == "week") {
        xRange = d3.timeWeek.range(
          data[0][xVar],
          d3.timeWeek.offset(data[data.length - 1][xVar], 1)
        )
      }

    } else {
      xRange = data.map(function (d) {
        return d[xVar]
      })
    }

    var x = d3.scaleBand().range([0, width]).paddingInner(0.08)

    x.domain(xRange)

    var y = d3.scaleLinear().range([height, 0])

    var layers = d3.stack().offset(d3.stackOffsetDiverging).keys(keys)(data)

    layers.forEach(function (layer) {
      layer.forEach(function (subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
      })
    })

    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)]).nice()
    var xAxis
    var yAxis
    var ticks = 3

    var tickMod = Math.round(x.domain().length / 10)
    if (isMobile) {
      tickMod = Math.round(x.domain().length / 5)
    }

    var ticks = x.domain().filter(function (d, i) {
      return !(i % tickMod)
    })

    if (isMobile) {
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(xAxisDateFormat)
      yAxis = d3
        .axisLeft(y)
        .tickFormat(function (d) {
          return numberFormat(d)
        })
        .ticks(5)
    } else {
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(xAxisDateFormat)
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return numberFormat(d)
      })
    }
    features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    features.append("g").attr("class", "y").call(yAxis)

    d3.selectAll(".y .tick line")
      .style("stroke", "#dcdcdc")
      .style("stroke-dasharray", "2 2")  
      .attr("x2", width)
    
    d3.selectAll(".y path").style("stroke-width", "0") 
    
    var layer = features
      .selectAll("layer")
      .data(layers, (d) => d.key)
      .enter()
      .append("g")
      .attr("class", (d) => "layer " + d.key)
      .style("fill", (d, i) => this.colors.get(d.key))
    layer
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.data[xVar]))
      .attr("y", (d) => y(d[1]))
      .attr("class", "barPart")
      .attr("title", (d) => d.data[d.key])
      .attr("data-group", (d) => d.group)
      .attr("data-count", (d) => d.data[d.key])
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())

    features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    if (hasTooltip) {
      const templateRender = (d) => {
        return mustache(template, { ...helpers, ...d })
      }
      this.tooltip.bindEvents(
        d3.selectAll(".barPart"),
        width,
        height + margin.top + margin.bottom,
        templateRender
      )
    }

    if (hasTrendline) {
      var tkeys = Object.keys(trendline[0]).filter((item) => item != xVar)

      trendline.forEach(function (d) {
        if (dateParse != null) {
          if (typeof d[xVar] === "string") {
            d[xVar] = dateParse(d[xVar])
          }
        }

      })


      if (options[0].trendColors) {
        const tColors = options[0].trendColors.split(",")
        this.trendColors.set(tColors.length, tColors)
      }

      var colourIndex = 0

      for (const trend of tkeys) {

        let tline = d3.line()

        let offset = x.bandwidth() / 2

        let tdata = trendline.map((item) => [x(item[xVar]) + offset, y(+item[trend])])

        features
          .append("path")
          .attr("d", tline(tdata))
          .attr("stroke", this.trendColors.get(colourIndex))
          .attr("fill", "none")
          .attr("stroke-width", "3")

        var keyDiv = chartKey.append("div").attr("class", "keyDiv").style("position", "relative")

        // keyDiv
        //   .append("span")
        //   .attr("class", "keyDash")
        //   .style("border-color", () => this.trendColors.get(colourIndex))

        // THIS IS A HACK TO SUPPORT IMAGE RENDERING

        keyDiv
          .append("svg")
           .attr("class", "keyDash")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", "none")
          .append("rect")
          .attr("x", 0)
          .attr("y", 6)
          .attr("width", 12)
          .attr("height", 2)
          .attr("fill", () => this.trendColors.get(colourIndex))  

        keyDiv.append("span").attr("class", "keyText").style("margin-left", "18px").text(tkeys[colourIndex])

        colourIndex++
      }
    }

    function textPadding(d) {
      if (d.y2 > 0) {
        return 12
      } else {
        return -2
      }
    }

    function textPaddingMobile(d) {
      if (d.y2 > 0) {
        return 12
      } else {
        return 4
      }
    }

    features
      .selectAll(".annotationLine")
      .data(labels)
      .enter()
      .append("line")
      .attr("class", "annotationLine")
      .attr("x1", function (d) {
        return x(d.x1) + x.bandwidth() / 2
      })
      .attr("y1", function (d) {
        return y(d.y1)
      })
      .attr("x2", function (d) {
        return x(d.x1) + x.bandwidth() / 2
      })
      .attr("y2", function (d) {
        return y(d.y2)
      })
      .style("opacity", 1)

    var footerAnnotations = d3.select("#footerAnnotations")

    footerAnnotations.html("")

    if (isMobile) {
      features
        .selectAll(".annotationCircles")
        .data(labels)
        .enter()
        .append("circle")
        .attr("class", "annotationCircle")
        .attr("cy", function (d) {
          return y(d.y2) + textPadding(d) / 2
        })
        .attr("cx", function (d) {
          return x(d.x1) + x.bandwidth() / 2
        })
        .attr("r", 8)
        .attr("fill", "#000")
      features
        .selectAll(".annotationTextMobile")
        .data(labels)
        .enter()
        .append("text")
        .attr("class", "annotationTextMobile")
        .attr("y", function (d) {
          return y(d.y2) + textPaddingMobile(d)
        })
        .attr("x", function (d) {
          return x(d.x1) + x.bandwidth() / 2
        })
        .style("text-anchor", "middle")
        .style("opacity", 1)
        .attr("fill", "#FFF")
        .text(function (d, i) {
          return i + 1
        })

      if (labels.length > 0) {
        footerAnnotations
          .append("span")
          .attr("class", "annotationFooterHeader")
          .text("Notes: ")
      }
      labels.forEach(function (d, i) {
        footerAnnotations
          .append("span")
          .attr("class", "annotationFooterNumber")
          .text(i + 1 + " - ")
        if (i < labels.length - 1) {
          footerAnnotations
            .append("span")
            .attr("class", "annotationFooterText")
            .text(d.text + ", ")
        } else {
          footerAnnotations
            .append("span")
            .attr("class", "annotationFooterText")
            .text(d.text)
        }
      })
    } else {
      features
        .selectAll(".annotationText")
        .data(labels)
        .enter()
        .append("text")
        .attr("class", "annotationText")
        .attr("y", function (d) {
          return y(d.y2) - 4
        })
        .attr("x", function (d) {
          return x(d.x1) + x.bandwidth() / 2
        })
        .attr("text-anchor", function (d) {
          return d.align
        })
        .style("opacity", 1)
        .text(function (d) {
          return d.text
        })
    }
  }
}
