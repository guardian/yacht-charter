import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import Tooltip from "./tooltip"

/****** Example tooltip template */
// `
//   <b>{{#formatDate}}{{date}}{{/formatDate}}</b><br/>
//   <b>Australia</b>: {{Australia}}<br/>
//   <b>France</b>: {{France}}<br/>
//   <b>Germany</b>: {{Germany}}<br/>
//   <b>Italy</b>: {{Italy}}<br/>
//   <b>Sweden</b>: {{Sweden}}<br/>
//   <b>United Kingdom</b>: {{United Kingdom}}<br/>
// `
/****** end tooltip template */

// default colours
const colorsLong = [
  "#4daacf",
  "#5db88b",
  "#a2b13e",
  "#8a6929",
  "#b05cc6",
  "#c8a466",
  "#c35f95",
  "#ce592e",
  "#d23d5e",
  "#d89a34",
  "#7277ca",
  "#527b39",
  "#59b74b",
  "#c76c65",
  "#8a6929"
]
const colorsMedium = [
  "#000000",
  "#0000ff",
  "#9d02d7",
  "#cd34b5",
  "#ea5f94",
  "#fa8775",
  "#ffb14e",
  "#ffd700"
]
const colorsShort = [
  "#ffb14e",
  "#fa8775",
  "#ea5f94",
  "#cd34b5",
  "#9d02d7",
  "#0000ff"
]

function getLongestKeyLength($svg, keys, isMobile) {
  if (!isMobile) {
    d3.select("#dummyText").remove()
    const longestKey = keys.sort(function (a, b) {
      return b.length - a.length
    })[0]
    const dummyText = $svg
      .append("text")
      .attr("x", -50)
      .attr("y", -50)
      .attr("id", "dummyText")
      .attr("class", "annotationText")
      .text(longestKey)
    return dummyText.node().getBBox().width
  }
  return 0
}

export default class LineChart {
  constructor(results) {
    const parsed = JSON.parse(JSON.stringify(results))

    this.data = parsed["sheets"]["data"]
    this.keys = Object.keys(this.data[0])
    this.xColumn = this.keys[0] // use first key, string or date
    this.keys.splice(0, 1) // remove the first key

    this.template = parsed["sheets"]["template"]
    this.meta = this.template[0]
    this.labels = parsed["sheets"]["labels"]
    this.periods = parsed["sheets"]["periods"]
    this.userKey = parsed["sheets"]["key"]
    this.options = parsed["sheets"]["options"]
    this.tooltipTemplate = this.meta.tooltip
    this.hasTooltipTemplate =
      this.tooltipTemplate && this.tooltipTemplate != "" ? true : false
    this.tooltip = new Tooltip(d3.select("body"))

    this.x_axis_cross_y = null
    this.colors = colorsLong
    this.optionalKey = {}

    this.$svg = null
    this.$features = null
    this.$chartKey = d3.select("#chartKey")

    const windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    this.isMobile = windowWidth < 610 ? true : false
    this.containerWidth = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width
    console.log("containerWidth", this.containerWidth)
    this.margin = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 40
    }

    this.width = this.containerWidth - this.margin.left - this.margin.right
    this.height =
      this.containerWidth * 0.6 - this.margin.top - this.margin.bottom

    this.y = d3.scaleLinear().rangeRound([this.height, 0])
    this.xAxis = null
    this.yAxis = null
    this.xVar = this.color = d3.scaleOrdinal().range(this.colors)
    this.min = null
    this.max = null
    this.lineGenerators = {}
    this.parseTime = null
    this.parsePeriods = null
    this.hideNullValues = "yes"

    this.chartValues = []
    this.chartKeyData = {}

    this.setup()
    this.render()
  }

  setup() {
    // Remove previous svg
    d3.select("#graphicContainer svg").remove()
    this.$chartKey.html("")

    // titles and source
    d3.select("#chartTitle").text(this.meta.title)
    d3.select("#subTitle").text(this.meta.subtitle)
    if (this.meta.source != "") {
      d3.select("#sourceText").html(" | Source: " + this.meta.source)
    }

    // parse optionalKey
    if (this.userKey.length > 1) {
      this.userKey.forEach((d) => {
        this.optionalKey[d.key] = d.colour
      })
    }

    // ?
    if (this.meta.x_axis_cross_y) {
      if (this.meta.x_axis_cross_y != "") {
        this.x_axis_cross_y = +this.meta.x_axis_cross_y
      }
    }

    // chart margins provided
    if (this.meta["margin-top"]) {
      this.margin = {
        top: +this.meta["margin-top"],
        right: +this.meta["margin-right"],
        bottom: +this.meta["margin-bottom"],
        left: +this.meta["margin-left"]
      }
    }

    // chart line breaks
    if (this.meta["breaks"]) {
      this.hideNullValues = this.meta["breaks"]
    }

    // x axis type
    if (this.meta["xColumn"]) {
      this.xColumn = this.meta["xColumn"]
      this.keys.splice(this.keys.indexOf(this.xColumn), 1)
    }

    // update y scale if y scale type is provided
    if (this.meta["yScaleType"]) {
      this.y = d3[this.meta["yScaleType"]]().range([this.height, 0]).nice()
    }

    // use short colors if less than 6 keys
    if (this.keys.length <= 5) {
      this.colors = colorsShort
      this.color = d3.scaleOrdinal().range(this.colors)
    }

    // parsers
    this.parseTime = d3.timeParse(this.meta["dateFormat"])
    this.parsePeriods = d3.timeParse(this.meta["periodDateFormat"])

    console.log("containerWidth", this.containerWidth)
    console.log("width", this.width)
    console.log("margin", this.margin)

    // create svg
    this.$svg = d3
      .select("#graphicContainer")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("id", "svg")
      .attr("overflow", "hidden")

    // update right margin and svg width based on the longest key
    this.margin.right =
      this.margin.right +
      getLongestKeyLength(this.$svg, this.keys, this.isMobile)
    this.width = this.containerWidth - this.margin.left - this.margin.right
    this.$svg.attr("width", this.width + this.margin.left + this.margin.right)

    // moved x scale definition to here to fix resize issues

    this.x = d3.scaleLinear().rangeRound([0, this.width])

    // update x scale based on scale type
    if (typeof this.data[0][this.xColumn] == "string") {
      this.x = d3.scaleTime().rangeRound([0, this.width])
    }

    console.log("containerWidth", this.containerWidth)
    console.log("width", this.width)
    console.log("svgWidth", this.width + this.margin.left + this.margin.right)

    // group for chart features
    this.$features = this.$svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      )

    this.keys.forEach((key) => {
      // setup how to draw line
      this.lineGenerators[key] = d3
        .line()
        .x((d) => {
          return this.x(d[this.xColumn])
        })
        .y((d) => {
          return this.y(d[key])
        })

      if (this.hideNullValues === "yes") {
        this.lineGenerators[key].defined(function (d) {
          return d
        })
      }

      // get all chart values for each key
      this.data.forEach((d) => {
        if (typeof d[key] == "string") {
          if (d[key].includes(",")) {
            if (!isNaN(d[key].replace(/,/g, ""))) {
              d[key] = +d[key].replace(/,/g, "")
              this.chartValues.push(d[key])
            }
          } else if (d[key] != "") {
            if (!isNaN(d[key])) {
              d[key] = +d[key]
              this.chartValues.push(d[key])
            }
          } else if (d[key] == "") {
            d[key] = null
          }
        } else {
          this.chartValues.push(d[key])
        }
      })
    })

    if (this.isMobile) {
      this.keys.forEach((key) => {
        const $keyDiv = this.$chartKey.append("div").attr("class", "keyDiv")

        $keyDiv
          .append("span")
          .attr("class", "keyCircle")
          .style("background-color", () => {
            if (this.optionalKey.hasOwnProperty(key)) {
              return this.optionalKey[key]
            } else {
              return this.color(key)
            }
          })

        $keyDiv.append("span").attr("class", "keyText").text(key)
      })
    }

    this.data.forEach((d) => {
      if (typeof d[this.xColumn] == "string") {
        d[this.xColumn] = this.parseTime(d[this.xColumn])
      }
    })

    this.keys.forEach((key) => {
      this.chartKeyData[key] = []

      this.data.forEach((d) => {
        if (d[key] != null) {
          let newData = {}
          newData[this.xColumn] = d[this.xColumn]
          newData[key] = d[key]
          this.chartKeyData[key].push(newData)
        } else {
          this.chartKeyData[key].push(null)
        }
      })
    })

    this.labels.forEach((d) => {
      if (typeof d.x == "string") {
        d.x = this.parseTime(d.x)
      }

      if (typeof d.y == "string") {
        d.y = +d.y
      }

      if (typeof d.offset == "string") {
        d.offset = +d.offset
      }
    })

    this.periods.forEach((d) => {
      if (typeof d.start == "string") {
        d.start = this.parsePeriods(d.start)
        d.end = this.parsePeriods(d.end)
        d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2)
      }
    })

    // determine y min/max of the chart
    this.max = d3.max(this.chartValues)
    this.min =
      this.meta["minY"] && this.meta["minY"] !== ""
        ? parseInt(this.meta["minY"])
        : d3.min(this.chartValues)

    // setup x and y axis domains
    this.x.domain(
      d3.extent(this.data, (d) => {
        return d[this.xColumn]
      })
    )
    this.y.domain([this.min, this.max])

    // setup x and y axis
    const xTicks = this.isMobile ? 4 : 6
    const yTicks = this.meta["yScaleType"] === "scaleLog" ? 3 : 5
    this.xAxis = d3.axisBottom(this.x).ticks(xTicks)
    this.yAxis = d3
      .axisLeft(this.y)
      .tickFormat(function (d) {
        return numberFormat(d)
      })
      .ticks(yTicks)
  }

  render() {
    // Remove
    d3.selectAll(".periodLine").remove()
    d3.selectAll(".periodLabel").remove()

    this.$features
      .selectAll(".periodLine")
      .data(this.periods)
      .enter()
      .append("line")
      .attr("x1", (d) => {
        return this.x(d.start)
      })
      .attr("y1", 0)
      .attr("x2", (d) => {
        return this.x(d.start)
      })
      .attr("y2", this.height)
      .attr("class", "periodLine mobHide")
      .attr("stroke", "#bdbdbd")
      .attr("opacity", (d) => {
        if (d.start < this.x.domain()[0]) {
          return 0
        } else {
          return 1
        }
      })
      .attr("stroke-width", 1)

    this.$features
      .selectAll(".periodLine")
      .data(this.periods)
      .enter()
      .append("line")
      .attr("x1", (d) => {
        return this.x(d.end)
      })
      .attr("y1", 0)
      .attr("x2", (d) => {
        return this.x(d.end)
      })
      .attr("y2", this.height)
      .attr("class", "periodLine mobHide")
      .attr("stroke", "#bdbdbd")
      .attr("opacity", (d) => {
        if (d.end > this.x.domain()[1]) {
          return 0
        } else {
          return 1
        }
      })
      .attr("stroke-width", 1)

    this.$features
      .selectAll(".periodLabel")
      .data(this.periods)
      .enter()
      .append("text")
      .attr("x", (d) => {
        if (d.labelAlign == "middle") {
          return this.x(d.middle)
        } else if (d.labelAlign == "start") {
          return this.x(d.start) + 5
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

    this.$features
      .append("g")
      .attr("class", "x")
      .attr("transform", () => {
        if (this.x_axis_cross_y != null) {
          return "translate(0," + this.y(this.x_axis_cross_y) + ")"
        } else {
          return "translate(0," + this.height + ")"
        }
      })
      .call(this.xAxis)

    this.$features.append("g").attr("class", "y").call(this.yAxis)

    this.$features
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(this.meta.yAxisLabel)

    this.$features
      .append("text")
      .attr("x", this.width)
      .attr("y", this.height - 6)
      .attr("fill", "#767676")
      .attr("text-anchor", "end")
      .text(this.meta.xAxisLabel)

    d3.selectAll(".tick line").attr("stroke", "#767676")

    d3.selectAll(".tick text").attr("fill", "#767676")

    d3.selectAll(".domain").attr("stroke", "#767676")

    this.keys.forEach((key) => {
      this.$features
        .append("path")
        .datum(this.chartKeyData[key])
        .attr("fill", "none")
        .attr("stroke", (d) => {
          if (this.optionalKey.hasOwnProperty(key)) {
            return this.optionalKey[key]
          } else {
            return this.color(key)
          }
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", this.lineGenerators[key])

      const tempLabelData = this.chartKeyData[key].filter((d) => d != null)
      let lineLabelAlign = "start"
      let lineLabelOffset = 0

      if (
        this.x(tempLabelData[tempLabelData.length - 1].index) >
        this.width - 20
      ) {
        lineLabelAlign = "end"
        lineLabelOffset = -10
      }

      if (!this.isMobile) {
        this.$features
          .append("circle")
          .attr("cy", (d) => {
            return this.y(tempLabelData[tempLabelData.length - 1][key])
          })
          .attr("fill", (d) => {
            if (this.optionalKey.hasOwnProperty(key)) {
              return this.optionalKey[key]
            } else {
              return this.color(key)
            }
          })
          .attr("cx", (d) => {
            return this.x(tempLabelData[tempLabelData.length - 1][this.xColumn])
          })
          .attr("r", 4)
          .style("opacity", 1)

        this.$features
          .append("text")
          .attr("class", "annotationText")
          .attr("y", (d) => {
            return (
              this.y(tempLabelData[tempLabelData.length - 1][key]) +
              4 +
              lineLabelOffset
            )
          })
          .attr("x", (d) => {
            return (
              this.x(tempLabelData[tempLabelData.length - 1][this.xColumn]) + 5
            )
          })
          .style("opacity", 1)
          .attr("text-anchor", lineLabelAlign)
          .text((d) => {
            return key
          })
      }
    })

    if (this.hasTooltipTemplate) {
      this.drawHoverFeature()
    }

    this.drawAnnotation()
  }

  drawHoverFeature() {
    const self = this
    const xColumn = this.xColumn
    const $hoverLine = this.$features
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.height)
      .style("opacity", 0)
      .style("stroke", "#333")
      .style("stroke-dasharray", 4)

    const $hoverLayerRect = this.$features
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("opacity", 0)

    // Handle mouse hover event
    // Find the data based on mouse position
    const getTooltipData = (d, event) => {
      const bisectDate = d3.bisector((d) => d[xColumn]).left,
        x0 = this.x.invert(d3.mouse(event)[0]),
        i = bisectDate(this.data, x0, 1),
        tooltipData = {
          [xColumn]: x0
        }

      this.keys.forEach((key) => {
        const data = this.chartKeyData[key],
          d0 = data[i - 1],
          d1 = data[i]

        if (d0 && d1) {
          d = x0 - d0[xColumn] > d1[xColumn] - x0 ? d1 : d0
        } else {
          d = d0
        }

        tooltipData[key] = d[key]
      })
      return tooltipData
    }

    // Render tooltip data
    const templateRender = (d, event) => {
      const data = getTooltipData(d, event)
      return mustache(this.tooltipTemplate, {
        ...helpers,
        ...data
      })
    }

    $hoverLayerRect
      .on("mousemove touchmove", function (d) {
        const x0 = self.x.invert(d3.mouse(this)[0])
        const tooltipText = templateRender(d, this)

        self.tooltip.show(tooltipText, self.width)

        $hoverLine
          .attr("x1", self.x(x0))
          .attr("x2", self.x(x0))
          .style("opacity", 0.5)
      })
      .on("mouseout", function () {
        self.tooltip.hide()
        $hoverLine.style("opacity", 0)
      })
  }

  drawAnnotation() {
    function textPadding(d) {
      return d.offset > 0 ? 6 : -2
    }

    function textPaddingMobile(d) {
      return d.offset > 0 ? 8 : 4
    }

    const $footerAnnotations = d3.select("#footerAnnotations")
    $footerAnnotations.html("")

    this.$features
      .selectAll(".annotationLine")
      .data(this.labels)
      .enter()
      .append("line")
      .attr("class", "annotationLine")
      .attr("x1", (d) => {
        return this.x(d.x)
      })
      .attr("y1", (d) => {
        return this.y(d.y)
      })
      .attr("x2", (d) => {
        return this.x(d.x)
      })
      .attr("y2", (d) => {
        const yPos = this.y(d.offset)
        return yPos <= -15 ? -15 : yPos
      })
      .style("opacity", 1)
      .attr("stroke", "#000")

    if (this.isMobile) {
      this.$features
        .selectAll(".annotationCircles")
        .data(this.labels)
        .enter()
        .append("circle")
        .attr("class", "annotationCircle")
        .attr("cy", (d) => {
          return this.y(d.offset) + textPadding(d) / 2
        })
        .attr("cx", (d) => {
          return this.x(d.x)
        })
        .attr("r", 8)
        .attr("fill", "#000")

      this.$features
        .selectAll(".annotationTextMobile")
        .data(this.labels)
        .enter()
        .append("text")
        .attr("class", "annotationTextMobile")
        .attr("y", (d) => {
          return this.y(d.offset) + textPaddingMobile(d)
        })
        .attr("x", (d) => {
          return this.x(d.x)
        })
        .style("text-anchor", "middle")
        .style("opacity", 1)
        .attr("fill", "#FFF")
        .text((d, i) => {
          return i + 1
        })

      if (this.labels.length > 0) {
        $footerAnnotations
          .append("span")
          .attr("class", "annotationFooterHeader")
          .text("Notes: ")
      }

      this.labels.forEach((d, i) => {
        $footerAnnotations
          .append("span")
          .attr("class", "annotationFooterNumber")
          .text(i + 1 + " - ")

        if (i < this.labels.length - 1) {
          $footerAnnotations
            .append("span")
            .attr("class", "annotationFooterText")
            .text(d.text + ", ")
        } else {
          $footerAnnotations
            .append("span")
            .attr("class", "annotationFooterText")
            .text(d.text)
        }
      })
    } else {
      this.$features
        .selectAll(".annotationText2")
        .data(this.labels)
        .enter()
        .append("text")
        .attr("class", "annotationText2")
        .attr("y", (d) => {
          const yPos = this.y(d.offset)
          return yPos <= -10 ? -10 : yPos + -1 * textPadding(d)
        })
        .attr("x", (d) => {
          const yPos = this.y(d.offset)
          const xPos = this.x(d.x)
          return yPos <= -10 ? xPos - 5 : xPos
        })
        .style("text-anchor", (d) => {
          return d.align
        })
        .style("opacity", 1)
        .text((d) => {
          return d.text
        })
    }
  }
}
