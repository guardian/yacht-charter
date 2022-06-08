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
    var periods = null
    if (results.sheets.periods) {
      periods = results.sheets.periods
    }
    console.log("periods", periods)
    if (trendline) {
        if (trendline.length > 0) {
        hasTrendline = trendline[0].index != "" ? true : false
      }
    }

     const dimensons = {"twitter": {"width":1200,"height":675, "scaling": 2}, 
        "instagram": {"width":1200,"height":1200, "scaling": 2},
        "facebook": {"width":1200,"height":630, "scaling": 2}    
        }
    const body = document.querySelector("body")
    const furniture = document.querySelector("#furniture")
    const footer = document.querySelector("#footer")
    
    var template
    var keys = Object.keys(data[0])

    console.log("keys")
    console.log(keys)

    if (hasTooltip) {
      template = details[0].tooltip
    }

    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    
    var isMobile = windowWidth < 610 ? true : false
    var isSmall = windowWidth < 640 ? true : false

    if (self.social) {
      body.classList.add(self.social);
      isMobile = true
    }
    // Default height and width setup

    var width = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width
    var height = width * 0.5

    var margin
    var dateParse = null
    var timeInterval = null
    var xAxisDateFormat = null
    var x_axis_cross_y = null


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
      if (details[0]["dateFormat"] != "") {
        dateParse = d3.timeParse(details[0]["dateFormat"])
      }
      else {
        dateParse = null
      }
    }
    if (typeof details[0]["timeInterval"] != undefined) {
      if (details[0]["timeInterval"] != "") {
        timeInterval = details[0]["timeInterval"]
      }

      else {
        timeInterval = null
      }
    }
    if (typeof details[0]["xAxisDateFormat"] != undefined) {
      console.log("yep")
      if (details[0]["xAxisDateFormat"] != "") {
        console.log("yep2")
        xAxisDateFormat = d3.timeFormat(details[0]["xAxisDateFormat"])
      }
      else {

        if (dateParse) {
          xAxisDateFormat = d3.timeFormat("%d %b '%y")
        }

        else {
          xAxisDateFormat = null
        }
        
      } 
      
    }





    if (details[0]["baseline"]) {
      if (details[0]["baseline"] != "") {
        x_axis_cross_y = +details[0]["baseline"]
      }
    }


    var xVar
    if (details[0]["xColumn"]) {
      xVar = details[0]["xColumn"]
      keys.splice(keys.indexOf(xVar), 1)
    } else {
      xVar = keys[0]
      keys.splice(0, 1)
    }

    const keyColor = dataTools.getKeysColors({ keys: keys, userKey: userKey, option: options[0]})

    self.colors.set(keyColor.keys, keyColor.colors)


    var chartKey = d3.select("#chartKey")

    chartKey.html("")


    keys.forEach((key, i) => {
      var keyDiv = chartKey.append("div").attr("class", "keyDiv")
      keyDiv
        .append("span")
        .attr("class", "keyCircle")
        .style("background-color", () => {
          return self.colors.get(key)
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


    if (periods) {

      periods.forEach((d) => {
        if (typeof d.start == "string") {
          if (dateParse != null) {

              d.start = dateParse(d.start)
              if (d.end) {
                  if (d.end != "") {
                  d.end = dateParse(d.end)
                  d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2)
                }
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


    var layers = d3.stack().offset(d3.stackOffsetDiverging).keys(keys)(data)



    layers.forEach(function (layer) {
      layer.forEach(function (subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
      })
    })

    // Set up for social media views

   console.log("layers")

   console.log(layers)
    // var canvas
  
    function adjustSize() {

      console.log("setting up social stuff")
      // document.querySelector("html").style.fontSize = dimensons[self.social].scaling
      var furnitureHeight = furniture.getBoundingClientRect().height
      var footerHeight = footer.getBoundingClientRect().height
      console.log("furniture heigut", furnitureHeight, "footer height", footerHeight)
      height = dimensons[self.social].height/2 - furniture.getBoundingClientRect().height - footer.getBoundingClientRect().height - 33
      // margin.top = margin.top * 1.5
      // margin.left = margin.left * 1.5
      // margin.bottom = margin.bottom * 1.5
      // margin.right = margin.right * 1.5
      width = document.querySelector("#graphicContainer").getBoundingClientRect().width - 20
      width = width - margin.left - margin.right
      height = height - margin.top - margin.bottom
      
      makeChart()

    }

    if (self.social) {

      adjustSize()

      const resizeObserver = new ResizeObserver(entries => {
        console.log("height changed")
        adjustSize()
      })

      // start observing a DOM node
      resizeObserver.observe(furniture)

    }
    
    else {
      width = width - margin.left - margin.right
      height = height - margin.top - margin.bottom
      makeChart()
    }

  
    function makeChart() {

     console.log("height", height, "width", width)

      d3.select("#graphicContainer svg").remove()

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

    

    // set up color domain/range
    

    var x = d3.scaleBand().range([0, width]).paddingInner(0.08)

    x.domain(xRange)

    var y = d3.scaleLinear().range([height, 0])

   

    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
    var xAxis
    var yAxis
    var ticks = 3

    var tickMod = Math.round(x.domain().length / 8)
    if (isSmall) {
      tickMod = Math.round(x.domain().length / 5)
    }

    var ticks = x.domain().filter(function (d, i) {
      return !(i % tickMod)
    })

    if (isSmall) {
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

   

    features.append("g").attr("class", "y").call(yAxis)

    d3.selectAll(".y .tick line")
      .style("stroke", "#dcdcdc")
      .style("stroke-dasharray", "2 2")  
      .attr("x2", width)
    
    d3.selectAll(".y path").style("stroke-width", "0") 
    
    if (periods) {
      features
      .selectAll(".periodLine .start")
      .data(periods)
      .enter()
      .append("line")
      .attr("x1", (d) => {
        return x(d.start)
      })
      .attr("y1", 0)
      .attr("x2", (d) => {
        return x(d.start)
      })
      .attr("y2", height)
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
      .data(periods.filter(b => b.end != ""))
      .enter()
      .append("line")
      .attr("x1", (d) => {
        return x(d.end)
      })
      .attr("y1", 0)
      .attr("x2", (d) => {
        return x(d.end)
      })
      .attr("y2", height)
      .attr("class", "periodLine mobHide end")
      .attr("stroke", "#bdbdbd")
      .attr("opacity", (d) => {
        if (d.end > x.domain()[1]) {
          return 0
        } else {
          return 1
        }
      })
      .attr("stroke-width", 1)

    features
      .selectAll(".periodLabel")
      .data(periods)
      .enter()
      .append("text")
      .attr("x", (d) => {
        console.log("blah",d.labelAlign)
        if (d.labelAlign == "middle") {
          return x(d.middle)
        } else if (d.labelAlign == "start" || d.labelAlign == "end") {
          return x(d.start) + 5
        }
      })
      .attr("y", -5)
      .attr("text-anchor", (d) => {
        return d.labelAlign
      })
      .attr("class", "periodLabel mobHide")
      .attr("opacity", 1)
      .text((d) => {
        return d.label
      })
    }
    

    var layer = features
      .selectAll("layer")
      .data(layers, (d) => d.key)
      .enter()
      .append("g")
      .attr("class", (d) => "layer " + d.key)
      .style("fill", (d, i) => self.colors.get(d.key))
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
      .attr("transform", () => {
        if (x_axis_cross_y != null) {
          return "translate(0," + y(x_axis_cross_y) + ")"
        } else {
          return "translate(0," + height + ")"
        }
      })
      .call(xAxis)

    if (hasTooltip) {
      const templateRender = (d) => {
        return mustache(template, { ...helpers, ...d })
      }
      self.tooltip.bindEvents(
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
        console.log("trendColors",options[0].trendColors)
        const tColors = options[0].trendColors.split(",")
        self.trendColors.set(tColors.length, tColors)
      }

      var colourIndex = 0

      for (const trend of tkeys) {

        let tline = d3.line()

        let offset = x.bandwidth() / 2

        let tdata = trendline.map((item) => [x(item[xVar]) + offset, y(+item[trend])])

        features
          .append("path")
          .attr("d", tline(tdata))
          .attr("stroke", self.trendColors.get(colourIndex))
          .attr("fill", "none")
          .attr("stroke-width", "3")

        d3.selectAll(".trendKey").remove()  

        var keyDiv = chartKey.append("div").attr("class", "keyDiv trendKey").style("position", "relative")

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
          .attr("fill", () => self.trendColors.get(colourIndex))  

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

    // if (isMobile) {
    //   features
    //     .selectAll(".annotationCircles")
    //     .data(labels)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "annotationCircle")
    //     .attr("cy", function (d) {
    //       return y(d.y2) + textPadding(d) / 2
    //     })
    //     .attr("cx", function (d) {
    //       return x(d.x1) + x.bandwidth() / 2
    //     })
    //     .attr("r", 8)
    //     .attr("fill", "#000")
    //   features
    //     .selectAll(".annotationTextMobile")
    //     .data(labels)
    //     .enter()
    //     .append("text")
    //     .attr("class", "annotationTextMobile")
    //     .attr("y", function (d) {
    //       return y(d.y2) + textPaddingMobile(d)
    //     })
    //     .attr("x", function (d) {
    //       return x(d.x1) + x.bandwidth() / 2
    //     })
    //     .attr("text-anchor", (d) => {
    //       if (d.align != "") {
    //         return d.align
    //       }
    //       else {
    //         return "middle"
    //       }
    //     })
    //     .style("opacity", 1)
    //     .attr("fill", "#FFF")
    //     .text(function (d, i) {
    //       return i + 1
    //     })

    //   if (labels.length > 0) {
    //     footerAnnotations
    //       .append("span")
    //       .attr("class", "annotationFooterHeader")
    //       .text("Notes: ")
    //   }
    //   labels.forEach(function (d, i) {
    //     footerAnnotations
    //       .append("span")
    //       .attr("class", "annotationFooterNumber")
    //       .text(i + 1 + " - ")
    //     if (i < labels.length - 1) {
    //       footerAnnotations
    //         .append("span")
    //         .attr("class", "annotationFooterText")
    //         .text(d.text + ", ")
    //     } else {
    //       footerAnnotations
    //         .append("span")
    //         .attr("class", "annotationFooterText")
    //         .text(d.text)
    //     }
    //   })
    // } else {

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
    // }
  
    }
    

    

  }

}
