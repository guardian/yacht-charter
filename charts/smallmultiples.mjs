export default class SmallMultiples {
  constructor(results, isMobile) {
    var data = results.sheets.data
    var details = results.sheets.template
    var keys = [...new Set(data.map(d => d.State))]


    d3.select("#graphicContainer svg").remove()
    // var chartKey = d3.select("#chartKey")
    // chartKey.html("")
    data.forEach(function (d) {
      if (typeof d.Cases == "string") {
        d.Cases = +d.Cases
      }
      if (typeof d.Date == "string") {
        let timeParse = d3.timeParse("%Y-%m-%d")
        d.Date = timeParse(d.Date)
      }
    })

    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      this._drawSmallChart(data, keyIndex, keys, details, isMobile)
    }
  }

  _drawSmallChart(data, index, key, details, isMobile) {
    var numCols
    if (isMobile) {
      numCols = 2
    } else {
      numCols = 3
    }
    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width / numCols
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
        left: 50
      }
    }

    width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom

    d3.select("#graphicContainer").append("div")
      .attr("id", key[index])

    let hashString = "#"
    let keyId = hashString.concat(key[index])


    d3.select(keyId).append("div")
      .text(key[index])
      .attr("class", "chartSubTitle")


    var svg = d3.select(keyId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "svg")

      .attr("overflow", "hidden")

    var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var keys = Object.keys(data[0])

    var x = d3.scaleBand().range([0, width]).paddingInner(0.08)
    var y = d3.scaleLinear().range([height, 0])

    x.domain(data.map(function (d) {
      return d.Date
    }))
    y.domain(d3.extent(data, function (d) {
      return d.Cases
    })).nice()

    var xAxis
    var yAxis

    var tickMod = Math.round(x.domain().length / 3)
    var ticks = x.domain().filter(function (d, i) {
      return !(i % tickMod) || i === x.domain().length - 1
    })
    xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%d %b"))
    yAxis = d3.axisLeft(y).tickFormat(function (d) {
      return d
    }).ticks(5)

    features.append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    features.append("g")
      .attr("class", "y")
      .call(yAxis)

    features.selectAll(".bar")
      .data(data.filter(d => {
        return d.State === key[index]
      }))
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.Date)
      })
      .style("fill", function () {
        return "rgb(204, 10, 17)"
      })
      .attr("y", function (d) {
        return y(Math.max(d.Cases, 0))
        // return y(d[keys[0]])
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return Math.abs(y(d.Cases) - y(0))

      })
  }
}