export default class AnnotatedBarChart {
  constructor(results, d3) {
    console.log(results)
    let clone = JSON.parse(JSON.stringify(results))
    var data = clone["sheets"]["data"]
    var details = clone["sheets"]["template"]
    var labels = clone["sheets"]["labels"]

    function numberFormat(num) {
      if (num > 0) {
        if (num > 1000000000) {
          return (num / 1000000000) + "bn"
        }
        if (num > 1000000) {
          return (num / 1000000) + "m"
        }
        if (num > 1000) {
          return (num / 1000) + "k"
        }
        if (num % 1 != 0) {
          return num.toFixed(2)
        } else {
          return num.toLocaleString()
        }
      }
      if (num < 0) {
        var posNum = num * -1
        if (posNum > 1000000000) return ["-" + String((posNum / 1000000000)) + "bn"]
        if (posNum > 1000000) return ["-" + String((posNum / 1000000)) + "m"]
        if (posNum > 1000) return ["-" + String((posNum / 1000)) + "k"]
        else {
          return num.toLocaleString()
        }
      }
      return num
    }

    var isMobile
    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

    if (windowWidth < 610) {
      isMobile = true
    }

    if (windowWidth >= 610) {
      isMobile = false
    }

    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    var height = width * 0.5
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
        left: 40
      }
    }

    width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom

    d3.select("#chartTitle").text(details[0].title)
    d3.select("#subTitle").text(details[0].subtitle)
    d3.select("#sourceText").html(details[0].source)
    d3.select("#footnote").html(details[0].footnote)
    d3.select("#graphicContainer svg").remove()
    var chartKey = d3.select("#chartKey")
    chartKey.html("")


    var svg = d3.select("#graphicContainer").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "svg")
      .attr("overflow", "hidden")

    var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var keys = Object.keys(data[0])

    var xVar

    if (details[0]["xColumn"]) {
      xVar = details[0]["xColumn"]
      keys.splice(keys.indexOf(xVar), 1)
    } else {
      xVar = keys[0]
      keys.splice(0, 1)
    }

    console.log(xVar, keys)

    data.forEach(function (d) {
      if (typeof d[xVar] == "string") {
        d[xVar] = +d[xVar]
      }
      keys.forEach(function (key) {
        d[key] = +d[key]
      })
    })

    labels.forEach(function (d) {
      d.x = +d.x
      d.y = +d.y
      d.y2 = +d.y2
    })

    console.log(labels)

    var x = d3.scaleBand().range([0, width]).paddingInner(0.08)
    var y = d3.scaleLinear().range([height, 0])

    x.domain(data.map(function (d) {
      return d[xVar]
    }))
    y.domain(d3.extent(data, function (d) {
      return d[keys[0]]
    })).nice()

    var xAxis
    var yAxis


    var ticks = x.domain().filter(function (d, i) {
      return !(i % 10)
    })

    if (isMobile) {
      ticks = x.domain().filter(function (d, i) {
        return !(i % 20)
      })
    }

    if (isMobile) {
      xAxis = d3.axisBottom(x).tickValues(ticks)
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return numberFormat(d)
      }).ticks(5)
    } else {
      xAxis = d3.axisBottom(x).tickValues(ticks)
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return numberFormat(d)
      })
    }

    features.append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    features.append("g")
      .attr("class", "y")
      .call(yAxis)

    features.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d[xVar])
      })
      .style("fill", function () {
        return "rgb(204, 10, 17)"
      })
      .attr("y", function (d) {
        return y(Math.max(d[keys[0]], 0))
        // return y(d[keys[0]])
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return Math.abs(y(d[keys[0]]) - y(0))

      })


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

    features.selectAll(".annotationLine")
      .data(labels)
      .enter().append("line")
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

    if (isMobile) {

      features.selectAll(".annotationCircles")
        .data(labels)
        .enter().append("circle")
        .attr("class", "annotationCircle")
        .attr("cy", function (d) {
          return y(d.y2) + textPadding(d) / 2
        })
        .attr("cx", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .attr("r", 8)
        .attr("fill", "#000")

      features.selectAll(".annotationTextMobile")
        .data(labels)
        .enter().append("text")
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
      console.log(labels.length)

      if (labels.length > 0) {
        footerAnnotations.append("span")
          .attr("class", "annotationFooterHeader")
          .text("Notes: ")
      }

      labels.forEach(function (d, i) {

        footerAnnotations.append("span")
          .attr("class", "annotationFooterNumber")
          .text(i + 1 + " - ")

        if (i < labels.length - 1) {
          footerAnnotations.append("span")
            .attr("class", "annotationFooterText")
            .text(d.text + ", ")
        } else {
          footerAnnotations.append("span")
            .attr("class", "annotationFooterText")
            .text(d.text)
        }
      })

    } else {

      features.selectAll(".annotationText")
        .data(labels)
        .enter().append("text")
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
}