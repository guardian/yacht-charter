import helpers from "../utilities/helpers"
import mustache from "../utilities/mustache"

export default class ScatterPlot {
  constructor(data) {
    var self = this

    // Declare
    this.firstTime = true
    this.default = null
    this.database = null
    this.template = null
    this.trendlines = null
    this.trendline = null
    this.tiptext = null
    this.target = null
    this.filter = null
    this.cats = null
    this.x_format = null
    this.categories = null
    this.x_axis_cross_y = null
    this.y_axis_cross_x = null
    this.x_label = null
    this.y_label = null
    this.colours = [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6"
    ]
    this.greyScale = [
      "#bdbdbd",
      "#bdbdbd",
      "#bdbdbd",
      "#bdbdbd",
      "#bdbdbd",
      "#bdbdbd",
      "#bdbdbd",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF"
    ]
    this.symbolTypes = [
      "symbolCircle",
      "symbolCross",
      "symbolDiamond",
      "symbolSquare",
      "symbolStar",
      "symbolTriangle",
      "symbolWye",
      "symbolCircle",
      "symbolCross",
      "symbolDiamond",
      "symbolSquare",
      "symbolStar",
      "symbolTriangle",
      "symbolWye"
    ]
    this.categories = null
    this.label_col = null
    var labels = []

    // Assign
    this.template = data.sheets.template
    this.key = null
    this.yTag = data.sheets.template[0].y
    this.xTag = data.sheets.template[0].x
    this.zero_line_x =
      data.sheets.template[0].zero_line_x === "TRUE" ? true : false
    this.zero_line_y =
      data.sheets.template[0].zero_line_y === "TRUE" ? true : false
    this.database = data.sheets.database
    this.database.forEach(function (d) {
      d.x = +d[data.sheets.template[0].x]
      d.y = +d[data.sheets.template[0].y]
      if ("label" in d) {
        if (d.label === "TRUE") {
          labels.push(d)
        }
      }
    })

    this.margin = null

    if (this.template[0]["margin-top"]) {
      this.margin = {
        top: +this.template[0]["margin-top"],
        right: +this.template[0]["margin-right"],
        bottom: +this.template[0]["margin-bottom"],
        left: +this.template[0]["margin-left"]
      }
    } else {
      this.margin = {
        top: 0,
        right: 0,
        bottom: 20,
        left: 40
      }
    }

    this.labels = labels
    console.log(this.template)
    console.log(this.database)
    console.log(this.labels)

    if (this.template[0]["title"] != "") {
      d3.select(".chartTitle").html(self.template[0]["title"])
    }

    this.colourKey = d3.scaleOrdinal()
    this.greyKey = d3.scaleOrdinal()

    if ("key" in data.sheets) {
      this.key = data.sheets.key

      if (data.sheets.key[0] != "") {
        var colourDomain = []
        var colourRange = []

        data.sheets.key.forEach(function (d) {
          colourDomain.push(d.key)
          colourRange.push(d.colour)
        })

        this.colourKey.domain(colourDomain).range(colourRange)
      }
    }

    if (this.template[0].categories != "") {
      this._createCats(d3)
    }

    if (this.template[0]["standfirst"] != "") {
      d3.select("#standfirst").html(self.template[0].standfirst)
    }

    if (this.template[0]["x_format"] != "") {
      this.x_format = this.template[0]["x_format"]
    }

    if (this.template[0].trendline == "TRUE") {
      this.trendline = true
      this.trendlines = data.sheets.trendline
    }

    // Set the tooltip text
    if (this.template[0].tooltip != "") {
      this.tiptext = this.template[0].tooltip
    }

    // Create the filter selectors if they have been set in the Googledoc
    if (this.template[0].filter != "") {
      this._createFilters(d3)
    }

    // Create the category selectors if they have been set in the Googledoc

    if (this.template[0].x_axis_cross_y != "") {
      this.x_axis_cross_y = this.template[0].x_axis_cross_y
    }

    if (this.template[0].y_axis_cross_x != "") {
      this.y_axis_cross_x = this.template[0].y_axis_cross_x
    }

    if (this.template[0]["label"] != "") {
      this.label_col = this.template[0].label_col
    }

    if (this.template[0]["x_label"] != "") {
      this.x_label = this.template[0].x_label
    } else {
      this.x_label = data.sheets.template[0].x
    }

    if (this.template[0]["y_label"] != "") {
      this.y_label = this.template[0].y_label
    } else {
      this.y_label = data.sheets.template[0].y
    }

    this.hasAnnotations = data.sheets.labels.length > 0 ? true : false

    if (this.hasAnnotations) {
      this.annotations = data.sheets.labels
    }

    this.colourBlindUser = false

    d3.select("#scatterplot_chart_data_source").html(self.template[0].source)
    this._render(d3)

    d3.selectAll("#colourBlind").on("click", function () {
      self.colourBlindUser = self.colourBlindUser ? false : true
      if (self.colourBlindUser) {
        d3.select("#colourBlind").text("colour")
      } else {
        d3.select("#colourBlind").text("greyscale")
      }
      d3.select("#key").classed(
        "colourvision",
        !d3.select("#key").classed("colourvision")
      )
      this._render(d3)
    })

    // this.resizer()
  }

  _createFilters(d3) {
    console.log("Inside the filter function")

    var self = this

    self.filter = self.template[0].filter

    self.default = self.template[0].default_filter

    var filters = []

    self.database.forEach(function (item) {
      filters.indexOf(item[self.filter]) === -1
        ? filters.push(item[self.filter])
        : ""
    })

    var html = ""

    for (var i = 0; i < filters.length; i++) {
      // Create the categories legend
      html +=
        '<div data-filter="' +
        filters[i] +
        '" class="btn filter ' +
        (i == 0 ? "currentfilter" : "") +
        '">' +
        filters[i] +
        "</div>"
    }

    d3.select("#graphicContainer").html(html)
  }

  _createCats(d3) {
    var self = this

    self.cats = self.template[0].categories

    var categories = []
    var colourDomain = []
    var colourRange = []
    var fillRange = []

    self.database.forEach((item) =>
      categories.indexOf(item[self.cats]) === -1
        ? categories.push(item[self.cats])
        : ""
    )

    while (self.symbolTypes.length < categories.length) {
      self.symbolTypes = [...self.symbolTypes, ...self.symbolTypes]
    }

    var symbolGenerator = d3.symbol().size(50)

    var syms = categories.map((item, index) => [item, self.symbolTypes[index]])

    var symap = new Map(syms)

    this.symbolKey = (cat) => {
      symbolGenerator.type(d3[symap.get(cat)])

      return symbolGenerator()
    }

    var html = ""

    if (this.key != null) {
      if (this.key[0].key != "") {
        this.key.forEach(function (d, i) {
          html +=
            '<div class="keyDiv"><span data-cat="' +
            d.key +
            '" class="keyCircle" style="background: ' +
            d.colour +
            '"></span>'
          html += ' <span class="keyText">' + d.key + "</span></div>"
        })
      }
    } else {
      for (var i = 0; i < categories.length; i++) {
        colourDomain.push(categories[i])
        colourRange.push(self.colours[i])
      }

      this.colourKey.domain(colourDomain).range(colourRange)

      this.greyKey.domain(colourDomain).range(this.greyScale)

      html += '<div class="colour_blind_key">'

      for (var i = 0; i < categories.length; i++) {
        // colourDomain.push(categories[i])
        // colourRange.push(self.colours[i])

        html +=
          '<div class="keyDiv"><span data-cat="' +
          categories[i] +
          '" class="keySymbol"><svg width="12" height="12" viewBox="-6 -6 12 12"><path d="' +
          self.symbolKey(categories[i]) +
          '" stroke="#000" stroke-width="1px" fill="' +
          this.greyKey(categories[i]) +
          '" /></svg></span>'
        html += ' <span class="keyText">' + categories[i] + "</span></div>"
      }

      html += '</div><div class="colour_vision_key">'

      for (var i = 0; i < categories.length; i++) {
        html +=
          '<div class="keyDiv"><span data-cat="' +
          categories[i] +
          '" class="keyCircle" style="background: ' +
          self.colours[i] +
          '"></span>'
        html += ' <span class="keyText">' + categories[i] + "</span></div>"
      }

      html += "</div>"
    }

    d3.select("#key").html(html)
  }

  labelizer(text) {
    var text = text.replace(/_/g, " ")

    return text.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }

  resizer(d3) {
    var self = this
    window.addEventListener("resize", function () {
      clearTimeout(document.body.data)

      document.body.data = setTimeout(function () {
        console.log("Resize the chart")

        self._render(d3)
      }, 800)
    })
  }

  _render(d3) {
    var self = this

    var isMobile
    var windowWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    isMobile = windowWidth < 610 ? true : false

    var width = document
      .querySelector("#graphicContainer")
      .getBoundingClientRect().width
    var height = isMobile ? width * 0.7 : width * 0.5

    ;(width = width - self.margin.left - self.margin.right),
      (height = height - self.margin.top - self.margin.bottom)

    // Filter the data if the filter value has been set in the Googledoc
    if (self.filter != null) {
      self.target = self.database.filter(function (d) {
        return d[self.filter] == self.default
      })
    } else {
      self.target = self.database
    }

    d3.select("#graphicContainer svg").remove()

    // setup x
    var xValue = function (d) {
        return d.x
      }, // data -> value
      x = d3.scaleLinear().range([0, width]), // value -> display
      xMap = function (d) {
        return x(xValue(d))
      }, // data -> display
      xAxis = d3.axisBottom(x) //d3.svg.axis().scale(x).orient("bottom");

    if (self.x_format) {
      xAxis.tickFormat(d3.format(self.x_format))
    }

    // setup y
    var yValue = function (d) {
        return d.y
      }, // data -> value
      y = d3.scaleLinear().range([height, 0]), // value -> display
      yMap = function (d) {
        return y(yValue(d))
      }, // data -> display
      yAxis = d3.axisLeft(y) //d3.svg.axis().scale(y).orient("left");

    var svg = d3
      .select("#graphicContainer")
      .append("svg")
      .attr("width", width + self.margin.left + self.margin.right)
      .attr("height", height + self.margin.top + self.margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${width + self.margin.left + self.margin.right} ${
          height + self.margin.top + self.margin.bottom
        }`
      )
      .classed("svg-content", true)
      .append("g")
      .attr(
        "transform",
        "translate(" + self.margin.left + "," + self.margin.top + ")"
      )

    // Get the values for the X Axis using all the values from the database (This means you can flip between categories and compare values on the same axis)
    var xRange = self.database.map(function (d) {
      return parseFloat(d.x)
    })

    // Set the X axis min value
    var xMin = d3.min(xRange)

    // Set the X axis max value
    var xMax = d3.max(xRange)

    // Get the full range
    var yRange = self.database.map(function (d) {
      return parseFloat(d.y)
    })

    // Add a 5% buffer on either side of the X axis min max values
    var xLabels = self.bufferize(xMin, xMax)

    // Set the Y axis min value
    var yMin = d3.min(self.database, function (d) {
      return parseFloat(d.y)
    })

    // Set the Y axis max value
    var yMax = d3.max(self.database, function (d) {
      return parseFloat(d.y)
    })
    console.log(yMin, yMax)
    // Add a 5% buffer on either side of the Y axis min max values
    var yLabels = self.bufferize(yMin, yMax)

    console.log("xLabels", xLabels)
    x.domain(xLabels)
    y.domain(yLabels)

    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tipster")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("opacity", 0)

    // x-axis
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", function () {
        if (self.x_axis_cross_y != null) {
          return "translate(0," + y(self.x_axis_cross_y) + ")"
        } else {
          return "translate(0," + height + ")"
        }
      })
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(self.x_label)

    // y-axis
    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", function () {
        if (self.y_axis_cross_x != null) {
          return "translate(" + x(self.y_axis_cross_x) + ",0)"
        }
      })
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(self.y_label)

    if (self.zero_line_x) {
      svg
        .append("line")
        .attr("class", "zeroline")
        .attr("x1", function () {
          return x(0)
        })
        .attr("y1", function () {
          return 0
        }) //y(yMax)
        .attr("x2", function () {
          return x(0)
        })
        .attr("y2", function () {
          return height
        }) //y(yMin)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .style("opacity", 1)
    }

    if (self.zero_line_y) {
      svg
        .append("line")
        .attr("class", "zeroline")
        .attr("x1", function () {
          return 0
        })
        .attr("y1", function () {
          return y(0)
        }) //y(yMax)
        .attr("x2", function () {
          return width
        })
        .attr("y2", function () {
          return y(0)
        }) //y(yMin)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .style("opacity", 1)
    }

    svg
      .selectAll(".dot-label")
      .data(self.labels)
      .enter()
      .append("text")
      .attr("class", "dot-label")
      .attr("x", xMap)
      .attr("dy", 15)
      .attr("text-anchor", "middle")
      .attr("y", yMap)
      .text(function (d) {
        return d[self.label_col]
      })

    if (self.colourBlindUser) {
      svg
        .selectAll(".dot")
        .data(self.target)
        .enter()
        .append("path")
        .attr("class", function (d) {
          return "dot " + d[self.cats]
        })
        .attr("stroke", "#000")
        .attr("stroke-width", "1px")
        .attr("transform", function (d) {
          return `translate(${x(d.x)},${y(d.y)})`
        })
        .style("opacity", 0.8)
        .style("fill", function (d) {
          return self.greyKey(d[self.cats])
          // return (self.cats==null) ? '#4bc6df' : self.colourKey(d[self.cats])
        })
        .attr("d", function (d) {
          return self.symbolKey(d[self.cats])
        })
        .on("mouseover", function (d) {
          if (self.tiptext != null) {
            tooltip.transition().duration(200).style("opacity", 0.9)

            tooltip
              .html(self.tipster(d))
              .style("left", self.tooltip(d3.event.pageX, width) + "px")
              .style(
                "top",
                (isMobile ? height / 2 : d3.event.pageY + 10) + "px"
              )
          }
        })
        .on("mouseout", function () {
          if (self.tiptext != null) {
            tooltip.transition().duration(500).style("opacity", 0)
          }
        })
    } else {
      svg
        .selectAll(".dot")
        .data(self.target)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return "dot " + d[self.cats]
        })
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) {
          return self.cats == null ? "#4bc6df" : self.colourKey(d[self.cats])
        })
        .attr("stroke", function (d) {
          if (d.label != "") {
            return "#000"
          } else {
            return "#bdbdbd"
          }
        })
        .attr("stroke-width", function () {
          return "1px"
        })
        .on("mouseover", function (d) {
          if (self.tiptext != null) {
            tooltip.transition().duration(200).style("opacity", 0.9)

            tooltip
              .html(self.tipster(d))
              .style("left", self.tooltip(d3.event.pageX, width) + "px")
              .style(
                "top",
                (isMobile ? height / 2 : d3.event.pageY + 10) + "px"
              )
          }
        })
        .on("mouseout", function (d) {
          if (self.tiptext != null) {
            tooltip.transition().duration(500).style("opacity", 0)
          }
        })
    }

    if (self.filter != null) {
      d3.selectAll(".filter").on("click", self.filters)
    }

    if (self.cats != null) {
      var user = self.colourBlindUser ? ".keySymbol" : ".keyCircle"

      d3.selectAll(user).on("click", self.stated)
    }

    // Add the trendline if it has been specified
    if (self.trendline) {
      var trendline = self.trendlines.filter(function (value) {
        return value.trendline == self.default
      })

      if (trendline.length == 0) {
        trendline = self.trendlines.filter(function (value) {
          return value.trendline == "default"
        })
      }

      console.log(trendline)
      var x1 = parseFloat(trendline[0].min_x)
      var y1 = parseFloat(trendline[0].min_y)
      var x2 = parseFloat(trendline[0].max_x)
      var y2 = parseFloat(trendline[0].max_y)

      var trendData = [[x1, y1, x2, y2]]
      var trendline = svg.selectAll(".trendline").data(trendData)

      trendline
        .enter()
        .append("line")
        .attr("class", "trendline")
        .attr("x1", function (d) {
          return x(d[0])
        })
        .attr("y1", function (d) {
          return y(d[1])
        })
        .attr("x2", function (d) {
          return x(d[2])
        })
        .attr("y2", function (d) {
          return y(d[3])
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("opacity", 1)
        .style("stroke-dasharray", "3, 3")
    }

    if (self.hasAnnotations) {
      for (var i = 0; i < self.annotations.length; i++) {
        let scaled_x = self.annotations[i].scaled_x === "TRUE" ? true : false
        let position_x = scaled_x
          ? x(+self.annotations[i].x)
          : +self.annotations[i].x
        let scaled_y = self.annotations[i].scaled_y === "TRUE" ? true : false
        let position_y = scaled_y
          ? y(+self.annotations[i].y)
          : +self.annotations[i].y
        let rotation =
          self.annotations[i].rotation === "" ? 0 : self.annotations[i].rotation

        svg
          .append("text")
          .attr("class", "annotations mobHide")
          .attr("x", position_x)
          .attr("y", position_y)
          .style("text-anchor", self.annotations[i]["text-anchor"])
          .text(self.annotations[i].text)
          .attr("transform", function (d) {
            return `rotate(${rotation},${position_x},${position_y})`
          })
      }
    }
  }

  calcLinear(data, x, y, minX, minY) {
    //console.log(data, x, y, minX, minY)
    /////////
    //SLOPE//
    /////////

    // Let n = the number of data points
    var n = data.length

    // Get just the points
    var pts = []
    data.forEach(function (d, i) {
      var obj = {}
      obj.x = d[x]
      obj.y = d[y]
      obj.mult = obj.x * obj.y
      pts.push(obj)
    })

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    var sum = 0
    var xSum = 0
    var ySum = 0
    var sumSq = 0
    pts.forEach(function (pt) {
      sum = sum + pt.mult
      xSum = xSum + pt.x
      ySum = ySum + pt.y
      sumSq = sumSq + pt.x * pt.x
    })
    var a = sum * n
    var b = xSum * ySum
    var c = sumSq * n
    var d = xSum * xSum

    // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
    // slope = m = (a - b) / (c - d)
    var m = (a - b) / (c - d)

    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    var e = ySum

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum

    // Plug the values you have calculated for e and f into the following equation for the y-intercept
    // y-intercept = b = (e - f) / n
    var b = (e - f) / n

    // Print the equation below the chart
    //document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
    //document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;

    // return an object of two points
    // each point is an object with an x and y coordinate
    return {
      ptA: {
        x: minX,
        y: m * minX + b
      },
      ptB: {
        y: minY,
        x: (minY - b) / m
      }
    }
  }

  bufferize(min, max) {
    var buffer = ((max - min) / 100) * 5

    return [min - buffer, max + buffer]
  }

  tipster(d) {
    var self = this
    var text = mustache(self.tiptext, { ...helpers, ...d })
    return text
  }

  tooltip(pos, width) {
    var self = this

    if (width < 500) {
      return width / 2 - 100
    } else {
      return pos > width / 2 ? pos - 235 : pos + 5
    }
  }

  stated() {
    var self = this

    var currElement = d3.select(this)

    var cat = currElement.attr("data-cat")

    var activeClass = "greyedOut"

    var alreadyIsActive = d3.select(this).classed(activeClass)

    d3.select(this).classed(activeClass, !alreadyIsActive)

    // Target the circles for a specific cat
    var currCircles = d3.selectAll("#graphicContainer .dot." + cat)

    // Target the trendline for a specific cat
    var trendline = d3.selectAll("#graphicContainer .trendline." + cat)

    alreadyIsActive
      ? currCircles.style("display", "block")
      : currCircles.style("display", "none")

    alreadyIsActive
      ? trendline.style("opacity", 0.7)
      : trendline.style("opacity", 0)

    if (self.categories != undefined) {
      self.categories.filter(function (value) {
        if (value.name == cat) {
          value.status = alreadyIsActive
        }
      })
    }
  }

  _filters(d3) {
    var self = this

    var currElement = d3.select(this)
    self.default = currElement.attr("data-filter")
    var activeClass = "currentfilter"
    d3.selectAll(".filter").classed(activeClass, false)
    var alreadyIsActive = d3.select(this).classed(activeClass)
    d3.select(this).classed(activeClass, !alreadyIsActive)
    self._render(d3)
  }

  _colorize(state) {
    return this.categories.filter((value) => value.name == state)[0].colour
  }
}
