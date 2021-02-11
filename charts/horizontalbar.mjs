import { numberFormat } from "../utilities/numberFormat"
import dataTools from "./dataTools"
import Dropdown from "./shared/dropdown"
import ColorScale from "./shared/colorscale"
import { ISO_8601 } from "moment"

export default class horizontalBar {
  constructor(results) {
    const container = d3.select("#graphicContainer")
    this.data = results.sheets.data
    this.details = results.sheets.template
    this.labels = results.sheets.labels
    this.userKey = results["sheets"]["key"]
    this.options = results.sheets.options[0]

    // create a clone of the dataset to use to filter y axis
    this.temp_data = results.sheets.data

    this.keys = Object.keys(this.data[0])
    this.xVar = null
    this.yVar = null
    this.colors = new ColorScale({ domain: [0] })

    if (this.details[0]["yColumn"]) {
      this.yVar = this.details[0]["yColumn"]
    } else {
      this.yVar = this.keys[0]
    }

    if (this.details[0]["xColumn"]) {
      this.xVar = this.details[0]["xColumn"]
    } else {
      this.xVar = this.keys[1]
    }

    // pass in the id of the select tag (must be present in the horizontalbar.html)
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

    this.setup()
    this.draw()
    this.drawShowMore()
  }

  setup() {
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

    var width = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width
      // need to set a constant height otherwise it breaks when the y axis goes small then large
    // var height = this.data.length * 60
    var height = this.temp_data.length * 60
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

    console.log("xVar", this.xVar, "yVar", this.yVar)

    var temp_data = this.temp_data

    // work out maximum value in dataset
    var max_value = d3.max(this.data.map(d => d[this.xVar]));
    // create cutoff point at X% of the maximum value
    var cut_off = max_value*0.01;
    this.data = temp_data.filter(d => d[this.xVar] > cut_off)

    // sort the dataset from biggest to smallest
    this.data = this.data.sort((a, b) => d3.descending(+a[this.xVar], +b[this.xVar]))

    // Check first entry and see if it looks like a string. True if string, false if number or number as string
    var yNaN = isNaN(this.data[0][this.yVar])

    // console.log(this.yVar, this.keys)

    this.data.forEach((d) => {
      if (typeof d[this.yVar] == "string" && !yNaN) {
        d[this.yVar] = +d[this.yVar]
      }

      d[this.xVar] = +d[this.xVar]
    })

    this.labels.forEach(function (d) {
      d.x = +d.x
      d.y = +d.y
      d.y2 = +d.y2
    })


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
      .paddingInner(0.4)
      .paddingOuter(0.4)

    y.domain(
      this.data.map((d) => {

        return d[this.yVar]
      })
      
      )
    

    var xMin, xMax

    xMax = d3.max(this.data, (d) => {
      return d[this.xVar]
    })

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
    xAxis = d3.axisBottom(x).tickFormat(function (d) {
      return numberFormat(d, ".0f")
    })

    features
      .append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(xAxis)

    features.append("g").attr("class", "y").call(yAxis)

    features
      .selectAll(".bar")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .style("fill", (d) => {
        if (d.Color) {
          return d.Color
        } else {
          return this.colors.get(0)
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
      .data(this.data)
      .enter()
      .append("text")
      .attr("class", "barText")
      .attr("x", 5)
      .attr("y", (d) => {
        return y(d[this.yVar]) - 5
      })
      .text((d) => d[this.yVar])

    features
      .selectAll(".barNumber")
      .data(this.data)
      .enter()
      .append("text")
      .attr("class", "barNumber")
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
      .text((d) => numberFormat(d[this.xVar]))

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

    features
      .selectAll(".annotationLine")
      .data(this.labels)
      .enter()
      .append("line")
      .attr("class", "annotationLine")
      .attr("x1", function (d) {
        return x(d.x) + x.bandwidth() / 2
      })
      .attr("y1", function (d) {
        return y(d.y)
      })
      .attr("x2", function (d) {
        return x(d.x) + x.bandwidth() / 2
      })
      .attr("y2", function (d) {
        return y(d.y2)
      })
      .style("opacity", 1)
      .attr("stroke", "#000")

    var footerAnnotations = d3.select("#footerAnnotations")

    footerAnnotations.html("")

    if (this.isMobile) {
      features
        .selectAll(".annotationCircles")
        .data(this.labels)
        .enter()
        .append("circle")
        .attr("class", "annotationCircle")
        .attr("cy", function (d) {
          return y(d.y2) + textPadding(d) / 2
        })
        .attr("cx", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .attr("r", 8)
        .attr("fill", "#000")

      features
        .selectAll(".annotationTextMobile")
        .data(this.labels)
        .enter()
        .append("text")
        .attr("class", "annotationTextMobile")
        .attr("y", function (d) {
          return y(d.y2) + textPaddingMobile(d)
        })
        .attr("x", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .style("text-anchor", "middle")
        .style("opacity", 1)
        .attr("fill", "#FFF")
        .text(function (d, i) {
          return i + 1
        })
      // console.log(this.labels.length)

      if (this.labels.length > 0) {
        footerAnnotations
          .append("span")
          .attr("class", "annotationFooterHeader")
          .text("Notes: ")
      }

      this.labels.forEach(function (d, i) {
        footerAnnotations
          .append("span")
          .attr("class", "annotationFooterNumber")
          .text(i + 1 + " - ")

        if (i < this.labels.length - 1) {
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
        .data(this.labels)
        .enter()
        .append("text")
        .attr("class", "annotationText")
        .attr("y", function (d) {
          return y(d.y2)
        })
        .attr("x", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .style("text-anchor", function (d) {
          return d.align
        })
        .style("opacity", 1)
        .text(function (d) {
          return d.text
        })
    }
  }

  drawShowMore() {
    var button = document.getElementById("button2")
    var wrapper = document.getElementById("outer-wrapper")
    var gradient = document.getElementById("gradientBar")

    if (this.options.enableShowMore === "1") {
      console.log("Show more button enabled")
      button.addEventListener("click", toggleButton)
    } else {
      button.remove()
      wrapper.classList.toggle("min")
      gradient.remove()
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
