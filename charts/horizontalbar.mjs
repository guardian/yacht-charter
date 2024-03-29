import { numberFormat } from "../utilities/numberFormat"
import dataTools from "./dataTools"
import Dropdown from "./shared/dropdown"
import ColorScale from "./shared/colorscale"
import { ISO_8601 } from "moment"
import colorPresets from "./constants/colors"
import  { addLabel, clickLogging } from './shared/arrows'


export default class horizontalBar {
  constructor(results) {
    const container = d3.select("#graphicContainer")

    this.data = results.sheets.data
    this.temp_data = null
    
    this.details = results.sheets.template
    this.labels = results.sheets.labels
    this.userKey = results["sheets"]["key"]
    this.options = results.sheets.options[0]

    this.maxXticks = results.sheets.options[0]['maxXticks']

    this.keys = Object.keys(this.data[0])

    this.xVar = null
    this.yVar = null
    this.colors = new ColorScale()
    this.suffix = null

    if (this.details[0]["suffix"]) {
        this.suffix = this.details[0]["suffix"]
      } else {
        this.suffix = ""
    }

    this.scaleByAllMax = null

    if (this.options["scaleByAllMax"]) {
        this.scaleByAllMax = this.options["scaleByAllMax"]
    }

    this.enableShowMore = null

    if (this.options["enableShowMore"]) {
        this.enableShowMore = this.options["enableShowMore"]
    }

    this.autoSort = null 

    if (this.options["autoSort"]) {
        this.autoSort = this.options["autoSort"]
    }

    // console.log(this.enableShowMore)

     // var color = new ColorScale()
    
    const keyColor = dataTools.getKeysColors({
      keys: this.keys,
      userKey: this.userKey,
      option: this.options
    })

    this.colors.set(keyColor.keys, keyColor.colors)


    // exclude bars that are less than this percent of the max value
    // this.cut_off = results.sheets.options[0]["cut_off_pct"]

  // grab dropdown options to initialise first selection
    var dropDownVals = results.sheets.dropdown[0]
    // find column names to use in case it is not a drop down bar chart
    var columns = this.keys.filter(d => d != "Color" && d != "keyCategory")

    // Only assign key names to x and y axis if it is actually a dropdown
    if (dropDownVals){

      if (this.details[0]["yColumn"]) {
        this.yVar = this.details[0]["yColumn"]
      } else {
        this.yVar = this.keys[0]
      }
  
      if (this.details[0]["xColumn"]) {
        this.xVar = this.details[0]["xColumn"]
      } else {
        this.xVar = dropDownVals.data
      }
    
    this.dropdown = new Dropdown(
      "dataPicker",
      dataTools.getDropdown(results.sheets.dropdown, this.keys)
    )
    // listen to the custom dropdown event
    this.dropdown.on("dropdown-change", (value) => {
      this.xVar = value
      this.setup()
      this.draw()
    })
    } else {
      // If it is not a dropdown then just assign first two column names yo x and y, and remove selector
      this.xVar = columns[1]
      this.yVar = columns[0]
      d3.select("#dataPicker").remove()

    }

    this.setup()
    this.draw()
    this.drawShowMore()
  }

  setup() {

    // console.log("data", this.data)

    var isMobile
    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )

    if (windowWidth < 610) {
      isMobile = true
    }

    if (windowWidth >= 610) {
      isMobile = false
    }

    console.log("windowWidth",windowWidth)

    // console.log("xVar", this.xVar, "yVar", this.yVar)


    var yNaN = isNaN(this.data[0][this.yVar])
    var allValues = []

    this.data.forEach((d) => {

      if (typeof d[this.yVar] == "string" && !yNaN) {

        d[this.yVar] = +d[this.yVar]
      
      }

      if (typeof d[this.xVar] == "string" && d[this.xVar] != "") {
        d[this.xVar] = +d[this.xVar]
      }

      else if (typeof d[this.xVar] == "string" && d[this.xVar] == "") {
        d[this.xVar] = null
      }
      
       for (let i = 1; i < this.keys.length; i++) {
        // console.log(this.keys[i])
        allValues.push(d[this.keys[i]])
      
      }

    })

 

    this.labels.forEach(function (d) {
      d.x = +d.x
      d.y = +d.y
      d.y2 = +d.y2
    })


    this.temp_data = this.data.filter(d => d[this.xVar] != null)

    // sort the dataset from biggest to smallest

    if (this.options.autoSort != null) {
      if (this.options.autoSort == "TRUE") {
        this.temp_data  = this.temp_data.sort((a, b) => d3.descending(+a[this.xVar], +b[this.xVar]))  
      }

      else {
        // console.log("Not sorting")
      }
    }

    else {
      this.temp_data  = this.temp_data.sort((a, b) => d3.descending(+a[this.xVar], +b[this.xVar]))  
    }
    

    var width = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width

    var height = this.temp_data.length * 75

    console.log("width", width, "height", height)
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
        top: 0,
        right: 0,
        bottom: 20,
        left: 40
      }
    }

    this.width = width - margin.left - margin.right
    this.height = height - margin.top - margin.bottom
    this.margin = margin
    this.isMobile = isMobile
    this.allMax = d3.max(allValues)

    // // Check first entry and see if it looks like a string. True if string, false if number or number as string
  }

  draw() {
    d3.select("#chartTitle").text(this.details[0].title)
    d3.select("#subTitle").text(this.details[0].subtitle)
    d3.select("#sourceText").html(this.details[0].source)
    d3.select("#footnote").html(this.details[0].footnote)
    d3.select("#graphicContainer svg").remove()

    var chartKey = d3.select("#chartKey")
    chartKey.html("")

    var svg = d3
      .select("#graphicContainer")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("id", "svg")
      .attr("overflow", "hidden")
  
    var features = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      )

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

    var x = d3.scaleLinear().range([0, this.width])
    var y = d3
      .scaleBand()
      .range([0, this.height])
      .paddingInner(0.45)
      .paddingOuter(0.45)

    y.domain(
      this.temp_data.map((d) => {

        return d[this.yVar]
      })
      
      )
    

    var xMin, xMax

    if (this.scaleByAllMax != null) {
      xMax = this.allMax
    }

    else {
      xMax = d3.max(this.temp_data, (d) => {
      return d[this.xVar]
      })
    }
    

    if (this.details[0]["minX"]) {
      if (this.details[0]["minX"] != "") {
        xMin = parseInt(this.details[0]["minX"])
      } else {
        xMin = 0
      }
    } else {
      xMin = 0
    }

    x.domain([xMin, xMax]).nice()

    var xAxis
    var yAxis

    yAxis = d3.axisLeft(y)

    xAxis = d3.axisBottom(x)
      .tickFormat(function (d) {
      return numberFormat(d)
    })
    if (this.isMobile && this.maxXticks != null){
      // REDUCE TICKS TO MAXIMUM NUMBER OF TICKS ON MOBILE
      xAxis.ticks(this.maxXticks)
    }
      

    features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(xAxis)

    // features.select("")  

    // features.append("g").attr("class", "y").call(yAxis)

    features
      .selectAll(".bar")
      .data(this.temp_data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .style("fill", (d) => {
        if (d.Color) {
          return d.Color
        } else {
          return colorPresets["guardian"][0]
        }
      })
      .attr("y", (d) => {
        return y(d[this.yVar])
        // return y(d[keys[0]])
      })
      .attr("width", (d) => {
        return x(d[this.xVar])
      })
      .attr("height", y.bandwidth())

    features
      .selectAll(".barText")
      .data(this.temp_data)
      .enter()
      .append("text")
      .attr("class", "barText")
      .attr("x", 0)
      .attr("y", (d) => {
        return y(d[this.yVar]) - 5
      })
      .text((d) => d[this.yVar])

    features
      .selectAll(".barNumber")
      .data(this.temp_data)
      .enter()
      .append("text")
      .attr("class", "barNumber")
      .style("font-weight", "bold")
      .attr("x", (d) => {
        if (x(d[this.xVar]) > 50) {
          return x(d[this.xVar]) - 50
        } else {
          return x(d[this.xVar]) + 5
        }
      })
      .style("fill", (d) => {
        if (x(d[this.xVar]) > 50) {
          return "#FFF"
        } else {
          return "#000"
        }
      })
      .attr("y", (d) => y(d[this.yVar]) + (y.bandwidth() / 2 + 5))
      .text((d) => numberFormat(d[this.xVar]) + this.suffix)

    d3.selectAll(".y .tick").remove()

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
    //   .data(this.labels)
    //   .enter()
    //   .append("line")
    //   .attr("class", "annotationLine")
    //   .attr("x1", function (d) {
    //     return x(d.x) + x.bandwidth() / 2
    //   })
    //   .attr("y1", function (d) {
    //     return y(d.y)
    //   })
    //   .attr("x2", function (d) {
    //     return x(d.x) + x.bandwidth() / 2
    //   })
    //   .attr("y2", function (d) {
    //     return y(d.y2)
    //   })
    //   .style("opacity", 1)
    //   .attr("stroke", "#000")

    // var footerAnnotations = d3.select("#footerAnnotations")

    // footerAnnotations.html("")

    // if (this.isMobile) {
    //   features
    //     .selectAll(".annotationCircles")
    //     .data(this.labels)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "annotationCircle")
    //     .attr("cy", function (d) {
    //       return y(d.y2) + textPadding(d) / 2
    //     })
    //     .attr("cx", function (d) {
    //       return x(d.x) + x.bandwidth() / 2
    //     })
    //     .attr("r", 8)
    //     .attr("fill", "#000")

    //   features
    //     .selectAll(".annotationTextMobile")
    //     .data(this.labels)
    //     .enter()
    //     .append("text")
    //     .attr("class", "annotationTextMobile")
    //     .attr("y", function (d) {
    //       return y(d.y2) + textPaddingMobile(d)
    //     })
    //     .attr("x", function (d) {
    //       return x(d.x) + x.bandwidth() / 2
    //     })
    //     .style("text-anchor", "middle")
    //     .style("opacity", 1)
    //     .attr("fill", "#FFF")
    //     .text(function (d, i) {
    //       return i + 1
    //     })
    //   // console.log(this.labels.length)

    //   if (this.labels.length > 0) {
    //     footerAnnotations
    //       .append("span")
    //       .attr("class", "annotationFooterHeader")
    //       .text("Notes: ")
    //   }

    //   this.labels.forEach(function (d, i) {
    //     footerAnnotations
    //       .append("span")
    //       .attr("class", "annotationFooterNumber")
    //       .text(i + 1 + " - ")

    //     if (i < this.labels.length - 1) {
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
    //     .data(this.labels)
    //     .enter()
    //     .append("text")
    //     .attr("class", "annotationText")
    //     .attr("y", function (d) {
    //       return y(d.y2)
    //     })
    //     .attr("x", function (d) {
    //       return x(d.x) + x.bandwidth() / 2
    //     })
    //     .style("text-anchor", function (d) {
    //       return d.align
    //     })
    //     .style("opacity", 1)
    //     .text(function (d) {
    //       return d.text
    //     })
    // }

    this.labels.forEach((config) => {
        // console.log(typeof config)
        if (typeof config.coords === "string") {
        config.coords = JSON.parse(config.coords)
        }
        addLabel(svg, config, this.width + this.margin.left + this.margin.right, this.height + this.margin.top + this.margin.bottom, this.margin, false)
    })


  }

  drawShowMore() {

    var button = document.getElementById("button2")
    var wrapper = document.getElementById("outer-wrapper")
    var gradient = document.getElementById("gradientBar")

    if (this.options.enableShowMore === "TRUE") {
      console.log("Show more button enabled")
      button.addEventListener("click", toggleButton)
    } else {
      if (button != null) {
        button.remove()
        wrapper.classList.toggle("min")
        gradient.remove()
      }
      
    }

    function toggleButton() {
      wrapper.classList.toggle("min")
      gradient.classList.toggle("gradient")
      button.querySelectorAll(".is-on")[0].classList.toggle("hide")
      button.querySelectorAll(".is-off")[0].classList.toggle("hide")
    }
  }

  round(value, exp) {
    if (typeof exp === "undefined" || +exp === 0) return Math.round(value)

    value = +value
    exp = +exp

    if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) return NaN

    value = value.toString().split("e")
    value = Math.round(+(value[0] + "e" + (value[1] ? +value[1] + exp : exp)))

    value = value.toString().split("e")
    return +(value[0] + "e" + (value[1] ? +value[1] - exp : -exp))
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  wait(ms) {
    new Promise((resolve, reject) => setTimeout(() => resolve(), ms))
  }

  getDimensions(el) {
    const width = el.clientWidth || el.getBoundingClientRect().width
    const height = el.clientHeight || el.getBoundingClientRect().height
    return [width, height]
  }

  hashPattern(patternId, pathClass, rectClass) {
    return `
  		<pattern id='${patternId}' patternUnits='userSpaceOnUse' width='4' height='4'>
  			<rect width='4' height='4' class='${rectClass}'></rect>
  			<path d='M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2' class='${pathClass}'></path>
  		</pattern>
  	`
  }

  duplicate(el, className) {
    const clone = el.cloneNode(true)
    clone.classList.add(className)
    el.parentNode.insertBefore(clone, el)
  }

  pseq(arr, lambda) {
    return arr.reduce((agg, cur) => {
      return agg.then((res) => lambda(cur).then((res2) => res.concat(res2)))
    }, Promise.resolve([]))
  }
}
