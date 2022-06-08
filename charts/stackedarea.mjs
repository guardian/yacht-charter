import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import dataTools from "./dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import renderCanvas from "../utilities/renderCanvas"
import templatizer from "./shared/templatizer"
import template from "./templates/stackedarea"
import  { addLabel, clickLogging } from './shared/arrows'


// import * as rasterizeHTML from 'rasterizehtml'

export default class StackedBarChart {
  constructor(results, social) {

    const merged = templatizer(template, results)

    this.colors = new ColorScale()
    this.trendColors = new ColorScale()
    this.results = merged
    this.social = social
    

    this.tooltipTemplate = this.results.sheets.template[0].tooltip
    this.hasTooltipTemplate = false

    if (this.tooltipTemplate) {
      
      if (this.tooltipTemplate != "") {
  
        d3.selectAll("#tooltip").remove()
          this.hasTooltipTemplate = true
         this.tooltip = new Tooltip("#graphicContainer")
         
      }
    }
    
   
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
    var details = results.sheets.template[0]
    console.log("details", details)
    var labels = results.sheets.labels
    console.log(labels)
    var userKey = results.sheets.key
    var options = results.sheets.options
    // var hasTooltip =  details.tooltip != "" ? true : false

     const dimensons = {"twitter": {"width":1200,"height":675, "scaling": 2}, 
        "instagram": {"width":1200,"height":1200, "scaling": 2},
        "facebook": {"width":1200,"height":630, "scaling": 2}    
        }
    const body = document.querySelector("body")
    const furniture = document.querySelector("#furniture")
    const footer = document.querySelector("#footer")
    
    var template
    var keys = Object.keys(data[0])

    // console.log("keys")
    // console.log(keys)

    // if (hasTooltip) {
    //   template = details.tooltip
    // }

    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    var isMobile = windowWidth < 610 ? true : false
    
    if (self.social) {
      body.classList.add(self.social);
      isMobile = true
    }
    // Default height and width setup

    var width = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width
    var height = width * 0.5

    var margin, x, y
    var dateParse = null
    var timeInterval = null
    var xAxisDateFormat = null
    var x_axis_cross_y = null

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

    // Check if margin defined by user
    if (details["margin-top"] != "") {
      margin = {
        top: +details["margin-top"],
        right: +details["margin-right"],
        bottom: +details["margin-bottom"],
        left: +details["margin-left"]
      }
    } else {
      margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      }
    }

    if (typeof details["dateFormat"] != undefined) {
      if (details["dateFormat"] != "") {
        dateParse = d3.timeParse(details["dateFormat"])
      }
      else {
        dateParse = null
      }
    }

    if (typeof details["xAxisDateFormat"] != undefined) {
      if (details["xAxisDateFormat"] != "") {
        xAxisDateFormat = d3.timeFormat(details["xAxisDateFormat"])
      }
      else {

        if (dateParse) {
          xAxisDateFormat = d3.timeFormat("%e %b '%y")
        }

        else {
          xAxisDateFormat = null
        }
        
      } 
      
    }

    if (details["baseline"]) {
      if (details["baseline"] != "") {
        x_axis_cross_y = +details["baseline"]
      }
    }


    var xVar

    if (details["xColumn"]) {
      xVar = details["xColumn"]
      keys.splice(keys.indexOf(xVar), 1)
    } else {
      xVar = keys[0]
      keys.splice(0, 1)
    }
    // console.log("xVar", xVar)
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

    // labels.forEach(function (d) {
    //   if (dateParse != null) {
    //     d.x1 = dateParse(d.x1)
    //   }
    //   d.y1 = +d.y1
    //   d.y2 = +d.y2
    // })

   
    var layers = d3.stack().keys(keys)(data)

    layers.forEach(function (layer) {
      layer.forEach(function (subLayer) {
        subLayer.group = layer.key
        subLayer.groupValue = subLayer.data[layer.key]
        subLayer.total = subLayer.data.Total
      })
    })



    // Set up for social media views

   // console.log("layers")

   // console.log(layers)
    // var canvas
  
    function adjustSize() {

      console.log("setting up social stuff")
      // document.querySelector("html").style.fontSize = dimensons[self.social].scaling
      var furnitureHeight = furniture.getBoundingClientRect().height
      var footerHeight = footer.getBoundingClientRect().height
      // console.log("furniture heigut", furnitureHeight, "footer height", footerHeight)
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

     // console.log("height", height, "width", width)

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
    
    x = d3.scaleTime().range([0, width])
    // console.log("data", data)


    x.domain(d3.extent(data, d => d[xVar]))
    
    y = d3.scaleLinear().range([height, 0])


    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
    // console.log("domain", y.domain())

    var area = d3.area()
      .x(function(d, i) { 
        return x(d.data[xVar]); 
      })
      .y0(function(d) { 
        // console.log(d)
        // console.log(y(d[0]))
        return y(d[0]); 
      })
      .y1(function(d) { return y(d[1]); });

    var xAxis
    var yAxis
    var ticks = 3

    // var tickMod = Math.round(x.domain().length / 10)
    // if (isMobile) {
    //   tickMod = Math.round(x.domain().length / 5)
    // }

    // var ticks = x.domain().filter(function (d, i) {
    //   return !(i % tickMod)
    // })

    
     // yAxis = d3.axisLeft(y).tickFormat(function (d) {
     //    return numberFormat(d)
     //  })
    if (isMobile) {
      xAxis = d3.axisBottom(x).tickFormat(xAxisDateFormat).ticks(4)
      yAxis = d3
        .axisLeft(y)
        .tickFormat(function (d) {
          return numberFormat(d)
        })
        .ticks(5)
    } else {
      xAxis = d3.axisBottom(x).tickFormat(xAxisDateFormat)
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
    
    var layer = features
      .selectAll("layer")
      .data(layers, (d) => d.key)
      .enter()
      .append("g")
      .attr("class", (d) => "layer " + d.key)
      .style("fill", (d, i) => self.colors.get(d.key))

    layer.append("path")
      .attr("class", "area")
      .attr("d", area);

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


    features
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(details.yAxisLabel)

    features
      .append("text")
      .attr("x", width)
      .attr("y", height - 6)
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(details.xAxisLabel)  

    // if (hasTooltip) {
    //   const templateRender = (d) => {
    //     return mustache(template, { ...helpers, ...d })
    //   }
    //   self.tooltip.bindEvents(
    //     d3.selectAll(".barPart"),
    //     width,
    //     height + margin.top + margin.bottom,
    //     templateRender
    //   )
    // }

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

    // features
    //   .selectAll(".annotationLine")
    //   .data(labels)
    //   .enter()
    //   .append("line")
    //   .attr("class", "annotationLine")
    //   .attr("x1", function (d) {
    //     return x(d.x1) + x.bandwidth() / 2
    //   })
    //   .attr("y1", function (d) {
    //     return y(d.y1)
    //   })
    //   .attr("x2", function (d) {
    //     return x(d.x1) + x.bandwidth() / 2
    //   })
    //   .attr("y2", function (d) {
    //     return y(d.y2)
    //   })
    //   .style("opacity", 1)

    // var footerAnnotations = d3.select("#footerAnnotations")

    // footerAnnotations.html("")

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
    //   features
    //     .selectAll(".annotationText")
    //     .data(labels)
    //     .enter()
    //     .append("text")
    //     .attr("class", "annotationText")
    //     .attr("y", function (d) {
    //       return y(d.y2) - 4
    //     })
    //     .attr("x", function (d) {
    //       return x(d.x1) + x.bandwidth() / 2
    //     })
    //     .attr("text-anchor", function (d) {
    //       return d.align
    //     })
    //     .style("opacity", 1)
    //     .text(function (d) {
    //       return d.text
    //     })
    // } // end is mobile
  
    // thing


    labels.forEach((config) => {
        addLabel(svg, config, width + margin.left + margin.right, height + margin.top + margin.bottom,margin, false)
    })



    if (self.hasTooltipTemplate) {
        drawHoverFeature(self.tooltipTemplate, self.tooltip)
       // console.log("drawing hover yeahhhh")
    }


    function drawHoverFeature(template, tooltip) {
   
    const self = this
    
    const hoverLine = features
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height)
      .style("opacity", 0)
      .style("stroke", "#333")
      .style("stroke-dasharray", 4)

    const hoverLayerRect = features
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 0)

    // Handle mouse hover event
    // Find the data based on mouse position
    const getTooltipData = (d) => {
      // console.log(event)
      d3.pointer(event)[0]
      const bisectX = d3.bisector((d) => d[xVar]).left,
        x0 = x.invert(d3.pointer(event)[0]),
        i = bisectX(data, x0, 1)

      // console.log(x0, i)  
      // console.log(data, xVar)
      
      // var tooltipData = data.filter(d => d[xVar] === x0)

      // keys.forEach((key) => {
      //   const data = chartKeyData[key],
      //     d0 = data[i - 1],
      //     d1 = data[i]

      //   if (d0 && d1) {
      //     d = x0 - d0[xVar] > d1[xVar] - x0 ? d1 : d0
      //   } else {
      //     d = d0
      //   }

      //   tooltipData[xVar] = d[xVar]
      //   tooltipData[key] = d[key]
      // })
      return data[i]
    }

    // Render tooltip data

    // console.log("asasa", self)
    const templateRender = (data) => {
      return mustache(template, {
        ...helpers,
        ...data
      })
    }

    hoverLayerRect
      .on("mousemove touchmove", function (d) {
        const tooltipData = getTooltipData(d, this)
        var tooltipText = `<b>${xAxisDateFormat(tooltipData[xVar])}</b><br>` 

        keys.forEach((key) => {
           var keyText = `${key}: ${tooltipData[key]}<br>`
           tooltipText = tooltipText + keyText
        })

        tooltip.show(
          tooltipText,
          width,
          height + margin.top + margin.bottom
        )

        hoverLine
          .attr("x1", x(tooltipData[xVar]))
          .attr("x2", x(tooltipData[xVar]))
          .style("opacity", 0.5)
      })
      .on("mouseout touchend", function () {
        tooltip.hide()
        hoverLine.style("opacity", 0)
      })
    } // end drawHoverFeature


    
    } // end makeChart
    

   

  } // end render?




} // end class
