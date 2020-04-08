import moment from 'moment'

export default class SmallMultiples {
  constructor(results, isMobile) {
    var data = results.sheets.data
    var details = results.sheets.template
    var keys = [...new Set(data.map(d => d.State))]
    var tooltip = (details[0].tooltip != "") ? true : false ;


    d3.select("#graphicContainer svg").remove()
    d3.select("#graphicContainer").html("")

    data.forEach(function (d) {
      if (typeof d.Cases == "string") {
        d.Cases = +d.Cases
      }
      if (typeof d.Date == "string") {
        let timeParse = d3.timeParse("%Y-%m-%d")
        d.Date = timeParse(d.Date)
      }
    })

    if (tooltip) {

      this.tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("opacity", 0)
    }

    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {

      this._drawSmallChart(data, keyIndex, keys, details, isMobile, tooltip)

    }
  }

  _drawSmallChart(data, index, key, details, isMobile, tooltip) {

    var self = this

    var numCols
  
    var containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width

    if (containerWidth  < 500) {
      numCols = 1
    }

    else if (containerWidth  < 750) {
      numCols = 2
    }

    else {
      numCols = 3
    }

    console.log(numCols)

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
      .attr("class", "barGrid")

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

    var utilities = {
        decimals: function(items) {
          var nums = items.split(",")
          return parseFloat(this[nums[0]]).toFixed(nums[1]);
        },
        nicedate: function(dte) {
          var chuncks = this[dte]
          return moment(chuncks).format('MMM D')
        }
    }

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
      .on("mouseover", function (d) {

        if (tooltip) {

          var text = self.mustache('<strong>Date: </strong>{{#nicedate}}Date{{/nicedate}}<br/><strong>Cases: </strong>{{Cases}}', {...utilities, ...d})

          self.tooltip.html(text)

          var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width

          if (d3.event.pageX < (width / 2)) {

            self.tooltip.style("left", (d3.event.pageX + tipWidth / 2) + "px")

          } else if (d3.event.pageX >= (width / 2)) {

            self.tooltip.style("left", (d3.event.pageX - tipWidth) + "px")

          }

          self.tooltip.style("top", (d3.event.pageY) + "px")

          self.tooltip.transition().duration(200).style("opacity", .9)

        }



    })
    .on("mouseout", function () {

      if (tooltip) {

        self.tooltip.transition().duration(500).style("opacity", 0)

      }

    })

  }

  mustache(template, self, parent, invert) {
    var render = this.mustache
    var output = ""
    var i

    function get (ctx, path) {
      path = path.pop ? path : path.split(".")
      ctx = ctx[path.shift()]
      ctx = ctx != null ? ctx : ""
      return (0 in path) ? get(ctx, path) : ctx
    }

    self = Array.isArray(self) ? self : (self ? [self] : [])
    self = invert ? (0 in self) ? [] : [1] : self
    
    for (i = 0; i < self.length; i++) {
      var childCode = ''
      var depth = 0
      var inverted
      var ctx = (typeof self[i] == "object") ? self[i] : {}
      ctx = Object.assign({}, parent, ctx)
      ctx[""] = {"": self[i]}
      
      template.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,
        function(match, code, y, z, close, invert, name) {
          if (!depth) {
            output += code.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g,
              function(match, raw, comment, isRaw, partial, name) {
                return raw ? get(ctx, raw)
                  : isRaw ? get(ctx, name)
                  : partial ? render(get(ctx, name), ctx)
                  : !comment ? new Option(get(ctx, name)).innerHTML
                  : ""
              }
            )
            inverted = invert
          } else {
            childCode += depth && !close || depth > 1 ? match : code
          }
          if (close) {
            if (!--depth) {
              name = get(ctx, name)
              if (/^f/.test(typeof name)) {
                output += name.call(ctx, childCode, function (template) {
                  return render(template, ctx)
                })
              } else {
                output += render(childCode, name, ctx, inverted) 
              }
              childCode = ""
            }
          } else {
            ++depth
          }
        }
      )
    }
    return output
  }
}