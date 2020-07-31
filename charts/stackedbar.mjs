import { numberFormat } from '../utilities/numberFormat'
import mustache from '../utilities/mustache'
import helpers from '../utilities/helpers'

export default class StackedBarChart {

  constructor(results) {

    this.results = results

    this.tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("opacity", 0);

    this.render()

  }

  render() {

    var self = this

    var results = JSON.parse(JSON.stringify(self.results))

    var data = results.sheets.data
    var details = results.sheets.template
    var labels = results.sheets.labels
    var trendline = results.sheets.trendline
    var userKey = results.sheets.key
    var optionalKeys = []
    var optionalColours = []
    var hasTooltip = (details[0].tooltip != "") ? true : false ;
    var hasTrendline = (trendline[0].minx != "") ? true : false ;
    var template

    if (userKey.length > 1) {
      userKey.forEach(function(d) {
        optionalKeys.push(d.key)
        optionalColours.push(d.colour)
      })
    }

    if (hasTooltip) {

      template = details[0].tooltip    

    }

    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var isMobile = (windowWidth < 610) ? true : false ;
    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    var height = width * 0.5;
    var margin;
    var dateParse = null
    var timeInterval = null
    var xAxisDateFormat = null
    // Check if margin defined by user
    if (details[0]['margin-top'] != "") {
      margin = {
        top: +details[0]['margin-top'],
        right: +details[0]['margin-right'],
        bottom: +details[0]['margin-bottom'],
        left: +details[0]['margin-left']
      };
    } else {
      margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      };
    }

    if (typeof details[0]['dateFormat'] != undefined) {
      dateParse = d3.timeParse(details[0]['dateFormat']);
    }
    if (typeof details[0]['timeInterval'] != undefined) {
      timeInterval = details[0]['timeInterval'];
    }
    if (typeof details[0]['xAxisDateFormat'] != undefined) {
      xAxisDateFormat = d3.timeFormat(details[0]['xAxisDateFormat'])
    }

    width = width - margin.left - margin.right,height = height - margin.top - margin.bottom;

    d3.select("#graphicContainer svg").remove();

    var chartKey = d3.select("#chartKey");

    chartKey.html("");

    var svg = d3.select("#graphicContainer").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden");
    var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var keys = Object.keys(data[0])
    var colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00'];
    var color = d3.scaleOrdinal();
    if (userKey.length > 1) {
      color.domain(optionalKeys).range(optionalColours)
    } else {
      color.domain(keys).range(colors);
    }
    var xVar;
    if (details[0]['xColumn']) {
      xVar = details[0]['xColumn'];
      keys.splice(keys.indexOf(xVar), 1);
    } else {
      xVar = keys[0]
      keys.splice(0, 1);
    }

    keys.forEach(function(key, i) {
      var keyDiv = chartKey.append("div").attr("class", "keyDiv")
      keyDiv.append("span").attr("class", "keyCircle").style("background-color", function() {
        return color(key);
      })
      keyDiv.append("span").attr("class", "keyText").text(key)
    })

    data.forEach(function(d) {
      if (dateParse != null) {
        if (typeof d[xVar] === 'string') {
          d[xVar] = dateParse(d[xVar])
        }
      }
      keys.forEach(function(key, i) {
        d[key] = +d[key]
      });
      d.Total = d3.sum(keys, k => +d[k]);
    })

    labels.forEach(function(d) {
      if (dateParse != null) {
        d.x1 = dateParse(d.x1)
      }
      d.y1 = +d.y1
      d.y2 = +d.y2
    });
    // Time scales for bar charts are heaps annoying
    var barWidth;
    var xRange;

    function stackMin(serie) {
      return d3.min(serie, function(d) {
        return d[0];
      });
    }

    function stackMax(serie) {
      return d3.max(serie, function(d) {
        return d[1];
      });
    }

    if (timeInterval) {

      if (timeInterval == 'year') {
        xRange = d3.timeYear.range(data[0][xVar], d3.timeYear.offset(data[data.length - 1][xVar], 1));
      }
      if (timeInterval == 'day') {
        xRange = d3.timeDay.range(data[0][xVar], d3.timeDay.offset(data[data.length - 1][xVar], 1));
      }
      if (timeInterval == 'month') {
        xRange = d3.timeMonth.range(data[0][xVar], d3.timeMonth.offset(data[data.length - 1][xVar], 1));
      }
    } else {
      xRange = data.map(function(d) {
        return d[xVar];
      })
    }

    var x = d3.scaleBand().range([0, width]).paddingInner(0.08);

    x.domain(xRange);

    var y = d3.scaleLinear().range([height, 0]);
 
    var layers = d3.stack().offset(d3.stackOffsetDiverging).keys(keys)(data)

    layers.forEach(function(layer) {
      layer.forEach(function(subLayer) {
        subLayer.group = layer.key
      })
    })

    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)]).nice()
    var xAxis;
    var yAxis;
    var ticks = 3

    var tickMod = Math.round(x.domain().length / 10)
    if (isMobile) {
      tickMod = Math.round(x.domain().length / 5)
    }

    var ticks = x.domain().filter(function(d, i) {
      return !(i % tickMod);
    });

    if (isMobile) {
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(xAxisDateFormat)
      yAxis = d3.axisLeft(y).tickFormat(function(d) {
        return numberFormat(d)
      }).ticks(5);
    } else {
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(xAxisDateFormat)
      yAxis = d3.axisLeft(y).tickFormat(function(d) {
        return numberFormat(d)
      });
    }
    features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
    features.append("g").attr("class", "y").call(yAxis)
    var layer = features.selectAll('layer').data(layers, d => d.key).enter().append('g').attr('class', d => "layer " + d.key).style('fill', (d, i) => (color(d.key)))
    layer.selectAll('rect').data(d => d).enter().append('rect').attr('x', d => x(d.data[xVar])).attr('y', d => y(d[1])).attr("class", "barPart").attr("title", d => d.data[d.key]).attr('data-group', d => d.group).attr('data-count', d => d.data[d.key]).attr('height', d => y(d[0]) - y(d[1])).attr('width', x.bandwidth())
    features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
    features.append("g").attr("class", "y").call(yAxis)

    if (hasTooltip) {

      d3.selectAll('.barPart').on("mouseover", function(d) {

        var text = mustache(template, { ...helpers, ...d })
        self.tooltip.html(text)
        var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width
        if (d3.event.pageX < (width / 2)) {
          self.tooltip.style("left", (d3.event.pageX + tipWidth / 2) + "px")
        } else if (d3.event.pageX >= (width / 2)) {
          self.tooltip.style("left", (d3.event.pageX - tipWidth) + "px")
        }
        self.tooltip.style("top", (d3.event.pageY) + "px")
        self.tooltip.transition().duration(200).style("opacity", .9)
      }).on("mouseout", function() {
        self.tooltip.transition().duration(500).style("opacity", 0)
      })
    }

    if (hasTrendline) {

      for (const trend of trendline) {

        var maxx = x(d3.max(xRange))
        var maxy = y(trend.maxy)
        var minx = x(d3.min(xRange))
        var miny = y(trend.miny)

        features.append("line")
          .attr("x1", minx)
          .attr("y1", miny)
          .attr("x2", maxx)
          .attr("y2", maxy)
          .attr("stroke-width", 1)
          .attr("stroke", trend.colour)
          .attr("stroke-dasharray", "1 1")

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

    features.selectAll(".annotationLine").data(labels).enter().append("line").attr("class", "annotationLine").attr("x1", function(d) {
      return x(d.x1) + x.bandwidth() / 2;
    }).attr("y1", function(d) {
      return y(d.y1)
    }).attr("x2", function(d) {
      return x(d.x1) + x.bandwidth() / 2;
    }).attr("y2", function(d) {
      return y(d.y2)
    }).style("opacity", 1).attr("stroke", "#000");

    var footerAnnotations = d3.select("#footerAnnotations");

    footerAnnotations.html("");

    if (isMobile) {
      features.selectAll(".annotationCircles").data(labels).enter().append("circle").attr("class", "annotationCircle").attr("cy", function(d) {
        return y(d.y2) + textPadding(d) / 2
      }).attr("cx", function(d) {
        return x(d.x1) + x.bandwidth() / 2
      }).attr("r", 8).attr("fill", "#000");
      features.selectAll(".annotationTextMobile").data(labels).enter().append("text").attr("class", "annotationTextMobile").attr("y", function(d) {
        return y(d.y2) + textPaddingMobile(d)
      }).attr("x", function(d) {
        return x(d.x1) + x.bandwidth() / 2
      }).style("text-anchor", "middle").style("opacity", 1).attr("fill", "#FFF").text(function(d, i) {
        return i + 1
      });

      if (labels.length > 0) {
        footerAnnotations.append("span").attr("class", "annotationFooterHeader").text("Notes: ");
      }
      labels.forEach(function(d, i) {
        footerAnnotations.append("span").attr("class", "annotationFooterNumber").text(i + 1 + " - ");
        if (i < labels.length - 1) {
          footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text + ", ");
        } else {
          footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text);
        }
      })
    } else {
      features.selectAll(".annotationText").data(labels).enter().append("text").attr("class", "annotationText").attr("y", function(d) {
        return y(d.y2) - 4
      }).attr("x", function(d) {
        return x(d.x1) + x.bandwidth() / 2
      }).style("text-anchor", function(d) {
        return d.align
      }).style("opacity", 1).text(function(d) {
        return d.text
      });
    }
  }

}