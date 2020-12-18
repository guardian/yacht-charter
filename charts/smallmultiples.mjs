import moment from "moment"
import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import dataTools from "./dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"

export default class SmallMultiples {
  constructor(results) {
    console.log(results)
    var self = this
    var data = results.sheets.data
    var details = results.sheets.template
    var options = results.sheets.options

    var dataKeys = Object.keys(data[0])

    console.log(dataKeys)

    this.groupVar = dataKeys[1]
    this.xVar = dataKeys[0]
    this.yVar = dataKeys[2]
    this.hasTooltip = details[0].tooltip != "" ? true : false

    var keys = [...new Set(data.map((d) => d[this.groupVar]))]
    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )

    data.forEach(function (d) {
      if (typeof d[self.yVar] == "string") {
        d[self.yVar] = +d[self.yVar]
      }
      if (typeof d[self.xVar] == "string") {
        let timeParse = d3.timeParse("%Y-%m-%d")
        d[self.xVar] = timeParse(d[self.xVar])
      }
    })

    if (this.hasTooltip) {
      this.tooltip = new Tooltip("#graphicContainer")
    }

    this.data = data

    this.keys = keys

    this.details = details

    this.isMobile = windowWidth < 610 ? true : false

    this.template = details[0].tooltip

    this.colors = new ColorScale({ domain: [0] })

    this.chartType =
      options[0] && options[0].chartType ? options[0].chartType : "area" // bar, line, area (default)

    if (options[0] && options[0]["scaleBy"] == "group") {
      this.showGroupMax = true
    } else {
      this.showGroupMax = false
      d3.select("#switch").html("Show max scale for group")
    }
    d3.select("#switch").on("click", function () {
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
        top: 0,
        right: 0,
        bottom: 20,
        left: 50
      }
    }

    this.margin = margin
    this.width
    this.height

    this.setup()
  }

  setup() {
    var self = this
    var containerWidth = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width

    self.containerHeight = containerWidth

    console.log("containerWidth", containerWidth)

    var numCols
    if (containerWidth <= 500) {
      numCols = 1
    } else if (containerWidth <= 750) {
      numCols = 2
    } else {
      numCols = 3
    }

    console.log(numCols)

    var width = containerWidth / numCols

    console.log("width", width)

    var height = 200

    if (self.isMobile) {
      height = 150
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
        hasTooltip: this.hasTooltip
      })
    })
  }

  drawChart({ data, key, details, chartType, isMobile, hasTooltip }) {
    const id = dataTools.getId(key),
      chartId = `#${id}`,
      isBar = chartType === "bar", // use different x scale
      isLine = chartType === "line",
      isArea = chartType === "area"

    d3.select("#graphicContainer")
      .append("div")
      .attr("id", id)
      .attr("class", "chart-grid")

    d3.select(chartId).append("div").text(key).attr("class", "chartSubTitle")

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

    const x = isBar
      ? d3.scaleBand().range([0, this.width]).padding(0)
      : d3.scaleLinear().range([0, this.width])
    const y = d3.scaleLinear().range([this.height, 0])
    const duration = 1000
    let yMax = this.showGroupMax
      ? data
      : data.filter((item) => item[this.groupVar] === key)

    if (isBar) {
      x.domain(data.map((d) => d[this.xVar]))
    } else {
      x.domain(d3.extent(data, (d) => d[this.xVar]))
    }

    y.domain(d3.extent(yMax, (d) => d[this.yVar])).nice()

    const tickMod = Math.round(x.domain().length / 3)
    const ticks = x
      .domain()
      .filter((d, i) => !(i % tickMod) || i === x.domain().length - 1)
    const xAxis = d3
      .axisBottom(x)
      .tickValues(ticks)
      .tickFormat(d3.timeFormat("%d %b"))
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
      yMax = this.showGroupMax
        ? data
        : data.filter((item) => item[this.groupVar] === key)

      y.domain(d3.extent(yMax, (d) => d[this.yVar]))

      const chartData = data.filter((d) => d[this.groupVar] === key)
      const drawOptions = {
        features,
        data: chartData,
        duration,
        x,
        y,
        hasTooltip
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

      features.select(".y").transition().duration(duration).call(yAxis)
    }

    document.getElementById("switch").addEventListener("click", () => update())
    update()
  }

  drawBarChart({ features, data, duration, x, y, hasTooltip }) {
    var bars = features.selectAll(".bar").data(data)

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
    const $line = features.selectAll(".line-path").data([data])
    const line = d3
      .line()
      .x((d) => x(d[this.xVar]))
      .y((d) => y(d[this.yVar]))
    const initialLine = d3
      .line()
      .x((d) => x(d[this.xVar]))
      .y(this.height)

    $line
      .enter()
      .append("path")
      .attr("class", "line-path")
      .attr("fill", "transparent")
      .attr("d", initialLine)
      .merge($line)
      .transition()
      .duration(duration)
      .attr("d", line)
      .attr("stroke", this.colors.get(0))

    $line.exit().transition().duration(duration).attr("d", initialLine).remove()
  }

  drawAreaChart({ features, data, duration, x, y }) {
    const $area = features.selectAll(".area-path").data([data])
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

    $hoverLayerRect
      .on("mousemove touchmove", function (d) {
        const x0 = x.invert(d3.mouse(this)[0])
        const tooltipText = templateRender(d, this)

        self.tooltip.show(
          tooltipText,
          self.width,
          self.height + self.margin.top + self.margin.bottom
        )
        $hoverLine.attr("x1", x(x0)).attr("x2", x(x0)).style("opacity", 0.5)
      })
      .on("mouseout touchend", function () {
        self.tooltip.hide()
        $hoverLine.style("opacity", 0)
      })
  }
}
