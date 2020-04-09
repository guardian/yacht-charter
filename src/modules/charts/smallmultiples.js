"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _moment = _interopRequireDefault(require("moment"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SmallMultiples = /*#__PURE__*/function () {
  function SmallMultiples(results, isMobile) {
    (0, _classCallCheck2["default"])(this, SmallMultiples);
    var self = this;
    var data = results.sheets.data;
    var details = results.sheets.template;
    var keys = (0, _toConsumableArray2["default"])(new Set(data.map(function (d) {
      return d.State;
    })));
    var tooltip = details[0].tooltip != "" ? true : false;
    data.forEach(function (d) {
      if (typeof d.Cases == "string") {
        d.Cases = +d.Cases;
      }

      if (typeof d.Date == "string") {
        var timeParse = d3.timeParse("%Y-%m-%d");
        d.Date = timeParse(d.Date);
      }
    });

    if (tooltip) {
      this.tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "tooltip").style("position", "absolute").style("background-color", "white").style("opacity", 0);
    }

    this.utilities = {
      decimals: function decimals(items) {
        var nums = items.split(",");
        return parseFloat(this[nums[0]]).toFixed(nums[1]);
      },
      nicedate: function nicedate(dte) {
        var chuncks = this[dte];
        return (0, _moment["default"])(chuncks).format('MMM D');
      }
    };
    this.data = data;
    this.keys = keys;
    this.details = details;
    this.isMobile = isMobile;
    this.hasTooltip = tooltip;
    this.template = details[0].tooltip;
    this.showGroupMax = true;
    d3.select("#switch").on("click", function () {
      self.showGroupMax = self.showGroupMax ? false : true;
      var label = self.showGroupMax ? "Show max scale for each chart" : "Show max scale for group";
      d3.select(this).html(label);
    });
    this.render();
  }

  (0, _createClass2["default"])(SmallMultiples, [{
    key: "render",
    value: function render() {
      var self = this;
      d3.select("#graphicContainer").selectAll("svg").remove();
      d3.select("#graphicContainer").html("");

      for (var keyIndex = 0; keyIndex < this.keys.length; keyIndex++) {
        this._drawSmallChart(self.data, keyIndex, self.keys, self.details, self.isMobile, self.hasTooltip);
      }
    }
  }, {
    key: "_drawSmallChart",
    value: function _drawSmallChart(data, index, key, details, isMobile, tooltip) {
      var self = this;
      var numCols;
      var containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width;

      if (containerWidth < 500) {
        numCols = 1;
      } else if (containerWidth < 750) {
        numCols = 2;
      } else {
        numCols = 3;
      }

      var width = document.querySelector("#graphicContainer").getBoundingClientRect().width / numCols;
      var height = width * 0.5;
      var margin;

      if (details[0]["margin-top"]) {
        margin = {
          top: +details[0]["margin-top"],
          right: +details[0]["margin-right"],
          bottom: +details[0]["margin-bottom"],
          left: +details[0]["margin-left"]
        };
      } else {
        margin = {
          top: 0,
          right: 0,
          bottom: 20,
          left: 50
        };
      }

      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;
      d3.select("#graphicContainer").append("div").attr("id", key[index]).attr("class", "barGrid");
      var hashString = "#";
      var keyId = hashString.concat(key[index]);
      d3.select(keyId).append("div").text(key[index]).attr("class", "chartSubTitle");
      var svg = d3.select(keyId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("overflow", "hidden");
      var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      var keys = Object.keys(data[0]);
      var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
      var y = d3.scaleLinear().range([height, 0]);
      var duration = 1000;
      var yMax = this.showGroupMax ? data : data.filter(function (item) {
        return item.State === key[index];
      });
      x.domain(data.map(function (d) {
        return d.Date;
      }));
      y.domain(d3.extent(yMax, function (d) {
        return d.Cases;
      })).nice();
      var tickMod = Math.round(x.domain().length / 3);
      var ticks = x.domain().filter(function (d, i) {
        return !(i % tickMod) || i === x.domain().length - 1;
      });
      var xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%d %b"));
      var yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return d;
      }).ticks(5);
      features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
      features.append("g").attr("class", "y");

      function update() {
        yMax = self.showGroupMax ? data : data.filter(function (item) {
          return item.State === key[index];
        });
        y.domain(d3.extent(yMax, function (d) {
          return d.Cases;
        }));
        var bars = features.selectAll(".bar").data(data.filter(function (d) {
          return d.State === key[index];
        }));
        bars.enter().append("rect").attr("class", "bar").style("fill", function () {
          return "rgb(204, 10, 17)";
        }).attr('height', 0).attr('y', height).merge(bars).transition().duration(duration).attr("x", function (d) {
          return x(d.Date);
        }).attr("y", function (d) {
          return y(Math.max(d.Cases, 0));
        }).attr("width", x.bandwidth()).attr("height", function (d) {
          return Math.abs(y(d.Cases) - y(0));
        });
        d3.selectAll('.bar').on("mouseover", function (d) {
          if (tooltip) {
            var text = self.mustache(self.template, _objectSpread({}, self.utilities, {}, d));
            self.tooltip.html(text);
            var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width;

            if (d3.event.pageX < width / 2) {
              self.tooltip.style("left", d3.event.pageX + tipWidth / 2 + "px");
            } else if (d3.event.pageX >= width / 2) {
              self.tooltip.style("left", d3.event.pageX - tipWidth + "px");
            }

            self.tooltip.style("top", d3.event.pageY + "px");
            self.tooltip.transition().duration(200).style("opacity", .9);
          }
        }).on("mouseout", function () {
          if (tooltip) {
            self.tooltip.transition().duration(500).style("opacity", 0);
          }
        });
        bars.exit().transition().duration(duration).attr('height', 0).attr('y', height).remove();
        features.select('.y').transition().duration(duration).call(yAxis);
      }

      document.getElementById("switch").addEventListener("click", function () {
        return update();
      });
      update();
    }
  }, {
    key: "mustache",
    value: function mustache(template, self, parent, invert) {
      var render = this.mustache;
      var output = "";
      var i;

      function get(ctx, path) {
        path = path.pop ? path : path.split(".");
        ctx = ctx[path.shift()];
        ctx = ctx != null ? ctx : "";
        return 0 in path ? get(ctx, path) : ctx;
      }

      self = Array.isArray(self) ? self : self ? [self] : [];
      self = invert ? 0 in self ? [] : [1] : self;

      for (i = 0; i < self.length; i++) {
        var childCode = '';
        var depth = 0;
        var inverted;
        var ctx = (0, _typeof2["default"])(self[i]) == "object" ? self[i] : {};
        ctx = Object.assign({}, parent, ctx);
        ctx[""] = {
          "": self[i]
        };
        template.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g, function (match, code, y, z, close, invert, name) {
          if (!depth) {
            output += code.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g, function (match, raw, comment, isRaw, partial, name) {
              return raw ? get(ctx, raw) : isRaw ? get(ctx, name) : partial ? render(get(ctx, name), ctx) : !comment ? new Option(get(ctx, name)).innerHTML : "";
            });
            inverted = invert;
          } else {
            childCode += depth && !close || depth > 1 ? match : code;
          }

          if (close) {
            if (! --depth) {
              name = get(ctx, name);

              if (/^f/.test((0, _typeof2["default"])(name))) {
                output += name.call(ctx, childCode, function (template) {
                  return render(template, ctx);
                });
              } else {
                output += render(childCode, name, ctx, inverted);
              }

              childCode = "";
            }
          } else {
            ++depth;
          }
        });
      }

      return output;
    }
  }]);
  return SmallMultiples;
}();

exports["default"] = SmallMultiples;