"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _numberFormat = require("../utilities/numberFormat");

var _mustache = _interopRequireDefault(require("../utilities/mustache"));

var _helpers = _interopRequireDefault(require("../utilities/helpers"));

var _tooltip = _interopRequireDefault(require("./tooltip"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
var colorsLong = ["#4daacf", "#5db88b", "#a2b13e", "#8a6929", "#b05cc6", "#c8a466", "#c35f95", "#ce592e", "#d23d5e", "#d89a34", "#7277ca", "#527b39", "#59b74b", "#c76c65", "#8a6929"];
var colorsMedium = ["#000000", "#0000ff", "#9d02d7", "#cd34b5", "#ea5f94", "#fa8775", "#ffb14e", "#ffd700"];
var colorsShort = ["#ffb14e", "#fa8775", "#ea5f94", "#cd34b5", "#9d02d7", "#0000ff"];

function getLongestKeyLength($svg, keys, isMobile) {
  if (!isMobile) {
    d3.select("#dummyText").remove();
    var longestKey = keys.sort(function (a, b) {
      return b.length - a.length;
    })[0];
    var dummyText = $svg.append("text").attr("x", -50).attr("y", -50).attr("id", "dummyText").attr("class", "annotationText").text(longestKey);
    return dummyText.node().getBBox().width;
  }

  return 0;
}

var LineChart = /*#__PURE__*/function () {
  function LineChart(results) {
    (0, _classCallCheck2["default"])(this, LineChart);
    var parsed = JSON.parse(JSON.stringify(results));
    this.data = parsed["sheets"]["data"];
    this.keys = Object.keys(this.data[0]);
    this.xColumn = this.keys[0]; // use first key, string or date

    this.keys.splice(0, 1); // remove the first key

    this.template = parsed["sheets"]["template"];
    this.meta = this.template[0];
    this.labels = parsed["sheets"]["labels"];
    this.periods = parsed["sheets"]["periods"];
    this.userKey = parsed["sheets"]["key"];
    this.options = parsed["sheets"]["options"];
    this.tooltipTemplate = this.meta.tooltip;
    this.hasTooltipTemplate = this.tooltipTemplate && this.tooltipTemplate != "" ? true : false;
    this.tooltip = new _tooltip["default"]("body");
    this.x_axis_cross_y = null;
    this.colors = colorsLong;
    this.optionalKey = {};
    this.$svg = null;
    this.$features = null;
    this.$chartKey = d3.select("#chartKey");
    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    this.isMobile = windowWidth < 610 ? true : false;
    this.containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width;
    console.log("containerWidth", this.containerWidth);
    this.margin = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 40
    };
    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerWidth * 0.6 - this.margin.top - this.margin.bottom;
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.xAxis = null;
    this.yAxis = null;
    this.xVar = this.color = d3.scaleOrdinal().range(this.colors);
    this.min = null;
    this.max = null;
    this.lineGenerators = {};
    this.parseTime = null;
    this.parsePeriods = null;
    this.hideNullValues = "yes";
    this.chartValues = [];
    this.chartKeyData = {};
    this.setup();
    this.render();
  }

  (0, _createClass2["default"])(LineChart, [{
    key: "setup",
    value: function setup() {
      var _this = this;

      // Remove previous svg
      d3.select("#graphicContainer svg").remove();
      this.$chartKey.html(""); // titles and source

      d3.select("#chartTitle").text(this.meta.title);
      d3.select("#subTitle").text(this.meta.subtitle);

      if (this.meta.source != "") {
        d3.select("#sourceText").html(" | Source: " + this.meta.source);
      } // parse optionalKey


      if (this.userKey.length > 1) {
        this.userKey.forEach(function (d) {
          _this.optionalKey[d.key] = d.colour;
        });
      } // ?


      if (this.meta.x_axis_cross_y) {
        if (this.meta.x_axis_cross_y != "") {
          this.x_axis_cross_y = +this.meta.x_axis_cross_y;
        }
      } // chart margins provided


      if (this.meta["margin-top"]) {
        this.margin = {
          top: +this.meta["margin-top"],
          right: +this.meta["margin-right"],
          bottom: +this.meta["margin-bottom"],
          left: +this.meta["margin-left"]
        };
      } // chart line breaks


      if (this.meta["breaks"]) {
        this.hideNullValues = this.meta["breaks"];
      } // x axis type


      if (this.meta["xColumn"]) {
        this.xColumn = this.meta["xColumn"];
        this.keys.splice(this.keys.indexOf(this.xColumn), 1);
      } // update y scale if y scale type is provided


      if (this.meta["yScaleType"]) {
        this.y = d3[this.meta["yScaleType"]]().range([this.height, 0]).nice();
      } // use short colors if less than 6 keys


      if (this.keys.length <= 5) {
        this.colors = colorsShort;
        this.color = d3.scaleOrdinal().range(this.colors);
      } // parsers


      this.parseTime = d3.timeParse(this.meta["dateFormat"]);
      this.parsePeriods = d3.timeParse(this.meta["periodDateFormat"]);
      console.log("containerWidth", this.containerWidth);
      console.log("width", this.width);
      console.log("margin", this.margin); // create svg

      this.$svg = d3.select("#graphicContainer").append("svg").attr("width", this.width + this.margin.left + this.margin.right).attr("height", this.height + this.margin.top + this.margin.bottom).attr("id", "svg").attr("overflow", "hidden"); // update right margin and svg width based on the longest key

      this.margin.right = this.margin.right + getLongestKeyLength(this.$svg, this.keys, this.isMobile);
      this.width = this.containerWidth - this.margin.left - this.margin.right;
      this.$svg.attr("width", this.width + this.margin.left + this.margin.right); // moved x scale definition to here to fix resize issues

      this.x = d3.scaleLinear().rangeRound([0, this.width]); // update x scale based on scale type

      if (typeof this.data[0][this.xColumn] == "string") {
        this.x = d3.scaleTime().rangeRound([0, this.width]);
      }

      console.log("containerWidth", this.containerWidth);
      console.log("width", this.width);
      console.log("svgWidth", this.width + this.margin.left + this.margin.right); // group for chart features

      this.$features = this.$svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      this.keys.forEach(function (key) {
        // setup how to draw line
        _this.lineGenerators[key] = d3.line().x(function (d) {
          return _this.x(d[_this.xColumn]);
        }).y(function (d) {
          return _this.y(d[key]);
        });

        if (_this.hideNullValues === "yes") {
          _this.lineGenerators[key].defined(function (d) {
            return d;
          });
        } // get all chart values for each key


        _this.data.forEach(function (d) {
          if (typeof d[key] == "string") {
            if (d[key].includes(",")) {
              if (!isNaN(d[key].replace(/,/g, ""))) {
                d[key] = +d[key].replace(/,/g, "");

                _this.chartValues.push(d[key]);
              }
            } else if (d[key] != "") {
              if (!isNaN(d[key])) {
                d[key] = +d[key];

                _this.chartValues.push(d[key]);
              }
            } else if (d[key] == "") {
              d[key] = null;
            }
          } else {
            _this.chartValues.push(d[key]);
          }
        });
      });

      if (this.isMobile) {
        this.keys.forEach(function (key) {
          var $keyDiv = _this.$chartKey.append("div").attr("class", "keyDiv");

          $keyDiv.append("span").attr("class", "keyCircle").style("background-color", function () {
            if (_this.optionalKey.hasOwnProperty(key)) {
              return _this.optionalKey[key];
            } else {
              return _this.color(key);
            }
          });
          $keyDiv.append("span").attr("class", "keyText").text(key);
        });
      }

      this.data.forEach(function (d) {
        if (typeof d[_this.xColumn] == "string") {
          d[_this.xColumn] = _this.parseTime(d[_this.xColumn]);
        }
      });
      this.keys.forEach(function (key) {
        _this.chartKeyData[key] = [];

        _this.data.forEach(function (d) {
          if (d[key] != null) {
            var newData = {};
            newData[_this.xColumn] = d[_this.xColumn];
            newData[key] = d[key];

            _this.chartKeyData[key].push(newData);
          } else {
            _this.chartKeyData[key].push(null);
          }
        });
      });
      this.labels.forEach(function (d) {
        if (typeof d.x == "string") {
          d.x = _this.parseTime(d.x);
        }

        if (typeof d.y == "string") {
          d.y = +d.y;
        }

        if (typeof d.offset == "string") {
          d.offset = +d.offset;
        }
      });
      this.periods.forEach(function (d) {
        if (typeof d.start == "string") {
          d.start = _this.parsePeriods(d.start);
          d.end = _this.parsePeriods(d.end);
          d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2);
        }
      }); // determine y min/max of the chart

      this.max = d3.max(this.chartValues);
      this.min = this.meta["minY"] && this.meta["minY"] !== "" ? parseInt(this.meta["minY"]) : d3.min(this.chartValues); // setup x and y axis domains

      this.x.domain(d3.extent(this.data, function (d) {
        return d[_this.xColumn];
      }));
      this.y.domain([this.min, this.max]); // setup x and y axis

      var xTicks = this.isMobile ? 4 : 6;
      var yTicks = this.meta["yScaleType"] === "scaleLog" ? 3 : 5;
      this.xAxis = d3.axisBottom(this.x).ticks(xTicks);
      this.yAxis = d3.axisLeft(this.y).tickFormat(function (d) {
        return (0, _numberFormat.numberFormat)(d);
      }).ticks(yTicks);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      // Remove
      d3.selectAll(".periodLine").remove();
      d3.selectAll(".periodLabel").remove();
      this.$features.selectAll(".periodLine").data(this.periods).enter().append("line").attr("x1", function (d) {
        return _this2.x(d.start);
      }).attr("y1", 0).attr("x2", function (d) {
        return _this2.x(d.start);
      }).attr("y2", this.height).attr("class", "periodLine mobHide").attr("stroke", "#bdbdbd").attr("opacity", function (d) {
        if (d.start < _this2.x.domain()[0]) {
          return 0;
        } else {
          return 1;
        }
      }).attr("stroke-width", 1);
      this.$features.selectAll(".periodLine").data(this.periods).enter().append("line").attr("x1", function (d) {
        return _this2.x(d.end);
      }).attr("y1", 0).attr("x2", function (d) {
        return _this2.x(d.end);
      }).attr("y2", this.height).attr("class", "periodLine mobHide").attr("stroke", "#bdbdbd").attr("opacity", function (d) {
        if (d.end > _this2.x.domain()[1]) {
          return 0;
        } else {
          return 1;
        }
      }).attr("stroke-width", 1);
      this.$features.selectAll(".periodLabel").data(this.periods).enter().append("text").attr("x", function (d) {
        if (d.labelAlign == "middle") {
          return _this2.x(d.middle);
        } else if (d.labelAlign == "start") {
          return _this2.x(d.start) + 5;
        }
      }).attr("y", -5).attr("text-anchor", function (d) {
        return d.labelAlign;
      }).attr("class", "periodLabel mobHide").attr("opacity", 1).text(function (d) {
        return d.label;
      });
      this.$features.append("g").attr("class", "x").attr("transform", function () {
        if (_this2.x_axis_cross_y != null) {
          return "translate(0," + _this2.y(_this2.x_axis_cross_y) + ")";
        } else {
          return "translate(0," + _this2.height + ")";
        }
      }).call(this.xAxis);
      this.$features.append("g").attr("class", "y").call(this.yAxis);
      this.$features.append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "0.71em").attr("fill", "#767676").attr("text-anchor", "end").text(this.meta.yAxisLabel);
      this.$features.append("text").attr("x", this.width).attr("y", this.height - 6).attr("fill", "#767676").attr("text-anchor", "end").text(this.meta.xAxisLabel);
      d3.selectAll(".tick line").attr("stroke", "#767676");
      d3.selectAll(".tick text").attr("fill", "#767676");
      d3.selectAll(".domain").attr("stroke", "#767676");
      this.keys.forEach(function (key) {
        _this2.$features.append("path").datum(_this2.chartKeyData[key]).attr("fill", "none").attr("stroke", function (d) {
          if (_this2.optionalKey.hasOwnProperty(key)) {
            return _this2.optionalKey[key];
          } else {
            return _this2.color(key);
          }
        }).attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 2).attr("d", _this2.lineGenerators[key]);

        var tempLabelData = _this2.chartKeyData[key].filter(function (d) {
          return d != null;
        });

        var lineLabelAlign = "start";
        var lineLabelOffset = 0;

        if (_this2.x(tempLabelData[tempLabelData.length - 1].index) > _this2.width - 20) {
          lineLabelAlign = "end";
          lineLabelOffset = -10;
        }

        if (!_this2.isMobile) {
          _this2.$features.append("circle").attr("cy", function (d) {
            return _this2.y(tempLabelData[tempLabelData.length - 1][key]);
          }).attr("fill", function (d) {
            if (_this2.optionalKey.hasOwnProperty(key)) {
              return _this2.optionalKey[key];
            } else {
              return _this2.color(key);
            }
          }).attr("cx", function (d) {
            return _this2.x(tempLabelData[tempLabelData.length - 1][_this2.xColumn]);
          }).attr("r", 4).style("opacity", 1);

          _this2.$features.append("text").attr("class", "annotationText").attr("y", function (d) {
            return _this2.y(tempLabelData[tempLabelData.length - 1][key]) + 4 + lineLabelOffset;
          }).attr("x", function (d) {
            return _this2.x(tempLabelData[tempLabelData.length - 1][_this2.xColumn]) + 5;
          }).style("opacity", 1).attr("text-anchor", lineLabelAlign).text(function (d) {
            return key;
          });
        }
      });

      if (this.hasTooltipTemplate) {
        this.drawHoverFeature();
      }

      this.drawAnnotation();
    }
  }, {
    key: "drawHoverFeature",
    value: function drawHoverFeature() {
      var _this3 = this;

      var self = this;
      var xColumn = this.xColumn;
      var $hoverLine = this.$features.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", this.height).style("opacity", 0).style("stroke", "#333").style("stroke-dasharray", 4);
      var $hoverLayerRect = this.$features.append("rect").attr("width", this.width).attr("height", this.height).style("opacity", 0); // Handle mouse hover event
      // Find the data based on mouse position

      var getTooltipData = function getTooltipData(d, event) {
        var bisectDate = d3.bisector(function (d) {
          return d[xColumn];
        }).left,
            x0 = _this3.x.invert(d3.mouse(event)[0]),
            i = bisectDate(_this3.data, x0, 1),
            tooltipData = (0, _defineProperty2["default"])({}, xColumn, x0);

        _this3.keys.forEach(function (key) {
          var data = _this3.chartKeyData[key],
              d0 = data[i - 1],
              d1 = data[i];

          if (d0 && d1) {
            d = x0 - d0[xColumn] > d1[xColumn] - x0 ? d1 : d0;
          } else {
            d = d0;
          }

          tooltipData[key] = d[key];
        });

        return tooltipData;
      }; // Render tooltip data


      var templateRender = function templateRender(d, event) {
        var data = getTooltipData(d, event);
        return (0, _mustache["default"])(_this3.tooltipTemplate, _objectSpread({}, _helpers["default"], {}, data));
      };

      $hoverLayerRect.on("mousemove touchmove", function (d) {
        var x0 = self.x.invert(d3.mouse(this)[0]);
        var tooltipText = templateRender(d, this);
        self.tooltip.show(tooltipText, self.width);
        $hoverLine.attr("x1", self.x(x0)).attr("x2", self.x(x0)).style("opacity", 0.5);
      }).on("mouseout", function () {
        self.tooltip.hide();
        $hoverLine.style("opacity", 0);
      });
    }
  }, {
    key: "drawAnnotation",
    value: function drawAnnotation() {
      var _this4 = this;

      function textPadding(d) {
        return d.offset > 0 ? 6 : -2;
      }

      function textPaddingMobile(d) {
        return d.offset > 0 ? 8 : 4;
      }

      var $footerAnnotations = d3.select("#footerAnnotations");
      $footerAnnotations.html("");
      this.$features.selectAll(".annotationLine").data(this.labels).enter().append("line").attr("class", "annotationLine").attr("x1", function (d) {
        return _this4.x(d.x);
      }).attr("y1", function (d) {
        return _this4.y(d.y);
      }).attr("x2", function (d) {
        return _this4.x(d.x);
      }).attr("y2", function (d) {
        var yPos = _this4.y(d.offset);

        return yPos <= -15 ? -15 : yPos;
      }).style("opacity", 1).attr("stroke", "#000");

      if (this.isMobile) {
        this.$features.selectAll(".annotationCircles").data(this.labels).enter().append("circle").attr("class", "annotationCircle").attr("cy", function (d) {
          return _this4.y(d.offset) + textPadding(d) / 2;
        }).attr("cx", function (d) {
          return _this4.x(d.x);
        }).attr("r", 8).attr("fill", "#000");
        this.$features.selectAll(".annotationTextMobile").data(this.labels).enter().append("text").attr("class", "annotationTextMobile").attr("y", function (d) {
          return _this4.y(d.offset) + textPaddingMobile(d);
        }).attr("x", function (d) {
          return _this4.x(d.x);
        }).style("text-anchor", "middle").style("opacity", 1).attr("fill", "#FFF").text(function (d, i) {
          return i + 1;
        });

        if (this.labels.length > 0) {
          $footerAnnotations.append("span").attr("class", "annotationFooterHeader").text("Notes: ");
        }

        this.labels.forEach(function (d, i) {
          $footerAnnotations.append("span").attr("class", "annotationFooterNumber").text(i + 1 + " - ");

          if (i < _this4.labels.length - 1) {
            $footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text + ", ");
          } else {
            $footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text);
          }
        });
      } else {
        this.$features.selectAll(".annotationText2").data(this.labels).enter().append("text").attr("class", "annotationText2").attr("y", function (d) {
          var yPos = _this4.y(d.offset);

          return yPos <= -10 ? -10 : yPos + -1 * textPadding(d);
        }).attr("x", function (d) {
          var yPos = _this4.y(d.offset);

          var xPos = _this4.x(d.x);

          return yPos <= -10 ? xPos - 5 : xPos;
        }).style("text-anchor", function (d) {
          return d.align;
        }).style("opacity", 1).text(function (d) {
          return d.text;
        });
      }
    }
  }]);
  return LineChart;
}();

exports["default"] = LineChart;