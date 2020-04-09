"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var StackedBarChart = /*#__PURE__*/function () {
  function StackedBarChart(results) {
    (0, _classCallCheck2["default"])(this, StackedBarChart);
    console.log(results);
    var data = results.sheets.data;
    var details = results.sheets.template;
    var labels = results.sheets.labels;
    var userKey = results.sheets.key;
    var optionalKeys = [];
    var optionalColours = [];
    var tooltip = null;

    if (userKey.length > 1) {
      userKey.forEach(function (d) {
        optionalKeys.push(d.key);
        optionalColours.push(d.colour);
      });
    }

    console.log(details);

    function numberFormat(num) {
      if (num > 0) {
        if (num > 1000000000) {
          return num / 1000000000 + "bn";
        }

        if (num > 1000000) {
          return num / 1000000 + "m";
        }

        if (num > 1000) {
          return num / 1000 + "k";
        }

        if (num % 1 != 0) {
          return num.toFixed(2);
        } else {
          return num.toLocaleString();
        }
      }

      if (num < 0) {
        var posNum = num * -1;
        if (posNum > 1000000000) return ["-" + String(posNum / 1000000000) + "bn"];
        if (posNum > 1000000) return ["-" + String(posNum / 1000000) + "m"];
        if (posNum > 1000) return ["-" + String(posNum / 1000) + "k"];else {
          return num.toLocaleString();
        }
      }

      return num;
    }

    var isMobile;
    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    if (windowWidth < 610) {
      isMobile = true;
    }

    if (windowWidth >= 610) {
      isMobile = false;
    }

    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width;
    var height = width * 0.5;
    var margin;
    var dateParse = null;
    var timeInterval = null; // Check if margin defined by user

    if (details[0]["margin-top"] != "") {
      margin = {
        top: +details[0]["margin-top"],
        right: +details[0]["margin-right"],
        bottom: +details[0]["margin-bottom"],
        left: +details[0]["margin-left"]
      };
    } else {
      margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      };
    } // Check if time format defined by user


    if ((0, _typeof2["default"])(details[0]["dateFormat"]) != undefined) {
      dateParse = d3.timeParse(details[0]["dateFormat"]);
    }

    if ((0, _typeof2["default"])(details[0]["timeInterval"]) != undefined) {
      timeInterval = details[0]["timeInterval"];
    }

    if (details[0].tooltip != "") {
      tooltip = true;
    }

    width = width - margin.left - margin.right, height = height - margin.top - margin.bottom;
    d3.select("#chartTitle").text(details[0].title);
    d3.select("#subTitle").text(details[0].subtitle);
    d3.select("#sourceText").html(details[0].source);
    d3.select("#footnote").html(details[0].footnote);
    d3.select("#graphicContainer svg").remove();
    var chartKey = d3.select("#chartKey");
    chartKey.html("");
    var svg = d3.select("#graphicContainer").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden");
    var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var keys = Object.keys(data[0]);
    var colors = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00"];
    var color = d3.scaleOrdinal();

    if (userKey.length > 1) {
      color.domain(optionalKeys).range(optionalColours);
    } else {
      color.domain(keys).range(colors);
    }

    var xVar;

    if (details[0]["xColumn"]) {
      xVar = details[0]["xColumn"];
      keys.splice(keys.indexOf(xVar), 1);
    } else {
      xVar = keys[0];
      keys.splice(0, 1);
    }

    keys.forEach(function (key) {
      var keyDiv = chartKey.append("div").attr("class", "keyDiv");
      keyDiv.append("span").attr("class", "keyCircle").style("background-color", function () {
        return color(key);
      });
      keyDiv.append("span").attr("class", "keyText").text(key);
    });
    data.forEach(function (d) {
      if (dateParse != null) {
        d[xVar] = dateParse(d[xVar]);
      }

      keys.forEach(function (key) {
        d[key] = +d[key];
      });
    }); // console.log(data)

    labels.forEach(function (d) {
      if (dateParse != null) {
        d.x = dateParse(d.x);
      }

      d.y = +d.y;
      d.y2 = +d.y2;
    }); // Time scales for bar charts are heaps annoying

    var xRange;

    function stackMin(serie) {
      return d3.min(serie, function (d) {
        return d[0];
      });
    }

    function stackMax(serie) {
      return d3.max(serie, function (d) {
        return d[1];
      });
    }

    if (timeInterval) {
      console.log(data[data.length - 1][xVar]);

      if (timeInterval == "year") {
        xRange = d3.timeYear.range(data[0][xVar], d3.timeYear.offset(data[data.length - 1][xVar], 1));
      }

      if (timeInterval == "day") {
        xRange = d3.timeDay.range(data[0][xVar], d3.timeDay.offset(data[data.length - 1][xVar], 1));
      }

      if (timeInterval == "month") {
        xRange = d3.timeMonth.range(data[0][xVar], d3.timeMonth.offset(data[data.length - 1][xVar], 1));
      }
    } else {
      xRange = data.map(function (d) {
        return d[xVar];
      });
    } // console.log(xRange)


    var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
    x.domain(xRange);
    var y = d3.scaleLinear().range([height, 0]);
    var layers = d3.stack().offset(d3.stackOffsetDiverging).keys(keys)(data);
    layers.forEach(function (layer) {
      console.log(layer.key);
      layer.forEach(function (subLayer) {
        subLayer.group = layer.key;
      });
    });
    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)]).nice();
    var xAxis;
    var yAxis;
    var ticks = 3;
    console.log(x.domain().length);
    var tickMod = Math.round(x.domain().length / 10);

    if (isMobile) {
      tickMod = Math.round(x.domain().length / 5);
    }

    console.log("tickMod", tickMod);
    ticks = x.domain().filter(function (d, i) {
      return !(i % tickMod);
    });
    console.log(ticks);

    if (isMobile) {
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"));
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return numberFormat(d);
      }).ticks(5);
    } else {
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"));
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return numberFormat(d);
      });
    }

    features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
    features.append("g").attr("class", "y").call(yAxis);
    var layer = features.selectAll("layer").data(layers).enter().append("g").attr("class", function (d) {
      return "layer " + d.key;
    }).style("fill", function (d) {
      return color(d.key);
    });
    layer.selectAll("rect").data(function (d) {
      return d;
    }).enter().append("rect").attr("x", function (d) {
      return x(d.data[xVar]);
    }).attr("y", function (d) {
      return y(d[1]);
    }).attr("class", "barPart").attr("title", function (d) {
      return d.data[d.key];
    }).attr("data-group", function (d) {
      return d.group;
    }).attr("data-count", function (d) {
      return d.data[d.key];
    }).attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    }).attr("width", x.bandwidth());
    features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
    features.append("g").attr("class", "y").call(yAxis);

    if (tooltip) {
      this.makeTooltip(".barPart");
    }

    function textPadding(d) {
      if (d.y2 > 0) {
        return 12;
      } else {
        return -2;
      }
    }

    function textPaddingMobile(d) {
      if (d.y2 > 0) {
        return 12;
      } else {
        return 4;
      }
    }

    features.selectAll(".annotationLine").data(labels).enter().append("line").attr("class", "annotationLine").attr("x1", function (d) {
      return x(d.x) + x.bandwidth() / 2;
    }).attr("y1", function (d) {
      return y(d.y);
    }).attr("x2", function (d) {
      return x(d.x) + x.bandwidth() / 2;
    }).attr("y2", function (d) {
      return y(d.y2);
    }).style("opacity", 1).attr("stroke", "#000");
    var footerAnnotations = d3.select("#footerAnnotations");
    footerAnnotations.html("");

    if (isMobile) {
      features.selectAll(".annotationCircles").data(labels).enter().append("circle").attr("class", "annotationCircle").attr("cy", function (d) {
        return y(d.y2) + textPadding(d) / 2;
      }).attr("cx", function (d) {
        return x(d.x) + x.bandwidth() / 2;
      }).attr("r", 8).attr("fill", "#000");
      features.selectAll(".annotationTextMobile").data(labels).enter().append("text").attr("class", "annotationTextMobile").attr("y", function (d) {
        return y(d.y2) + textPaddingMobile(d);
      }).attr("x", function (d) {
        return x(d.x) + x.bandwidth() / 2;
      }).style("text-anchor", "middle").style("opacity", 1).attr("fill", "#FFF").text(function (d, i) {
        return i + 1;
      });
      console.log(labels.length);

      if (labels.length > 0) {
        footerAnnotations.append("span").attr("class", "annotationFooterHeader").text("Notes: ");
      }

      labels.forEach(function (d, i) {
        footerAnnotations.append("span").attr("class", "annotationFooterNumber").text(i + 1 + " - ");

        if (i < labels.length - 1) {
          footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text + ", ");
        } else {
          footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text);
        }
      });
    } else {
      features.selectAll(".annotationText").data(labels).enter().append("text").attr("class", "annotationText").attr("y", function (d) {
        return y(d.y2);
      }).attr("x", function (d) {
        return x(d.x) + x.bandwidth() / 2;
      }).style("text-anchor", function (d) {
        return d.align;
      }).style("opacity", 1).text(function (d) {
        return d.text;
      });
    }
  }

  (0, _createClass2["default"])(StackedBarChart, [{
    key: "makeTooltip",
    value: function makeTooltip(el) {
      console.log("make", el);
      var els = d3.selectAll(el);
      var width = document.querySelector("#graphicContainer").getBoundingClientRect().width;
      var tooltip = d3.select("#graphicContainer").append("div").attr("class", "tooltip").attr("id", "tooltip").style("position", "absolute").style("background-color", "white").style("opacity", 0);
      els.on("mouseover", function (d) {
        var text = "<b>".concat(d.group, "</b><br>").concat(d.data[d.group]);
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(text);
        var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width; // console.log(tipHeight)

        var mouseX = d3.mouse(this)[0];
        var half = width / 2;

        if (mouseX < half) {
          tooltip.style("left", d3.mouse(this)[0] + tipWidth / 2 + "px");
        } else if (mouseX >= half) {
          tooltip.style("left", d3.mouse(this)[0] - tipWidth + "px");
        } // tooltip.style("left", (d3.mouse(this)[0] + tipWidth/2) + "px");


        tooltip.style("top", d3.mouse(this)[1] + "px");
      });
      els.on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });
    }
  }]);
  return StackedBarChart;
}();

exports["default"] = StackedBarChart;