"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _moment = _interopRequireDefault(require("moment"));

var _mustache = _interopRequireDefault(require("../utilities/mustache"));

var _helpers = _interopRequireDefault(require("../utilities/helpers"));

var _tooltip = _interopRequireDefault(require("./shared/tooltip"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SmallMultiples = /*#__PURE__*/function () {
  function SmallMultiples(results) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, SmallMultiples);
    console.log(results);
    var self = this;
    var data = results.sheets.data;
    var details = results.sheets.template;
    var options = results.sheets.options;
    var dataKeys = Object.keys(data[0]);
    console.log(dataKeys);
    this.groupVar = dataKeys[1];
    this.xVar = dataKeys[0];
    this.yVar = dataKeys[2];
    this.hasTooltip = details[0].tooltip != "" ? true : false;
    var keys = (0, _toConsumableArray2["default"])(new Set(data.map(function (d) {
      return d[_this.groupVar];
    })));
    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    data.forEach(function (d) {
      if (typeof d[self.yVar] == "string") {
        d[self.yVar] = +d[self.yVar];
      }

      if (typeof d[self.xVar] == "string") {
        var timeParse = d3.timeParse("%Y-%m-%d");
        d[self.xVar] = timeParse(d[self.xVar]);
      }
    });

    if (this.hasTooltip) {
      this.tooltip = new _tooltip["default"]("#graphicContainer");
    }

    this.data = data;
    this.keys = keys;
    this.details = details;
    this.isMobile = windowWidth < 610 ? true : false;
    this.template = details[0].tooltip;

    if (options[0]["scaleBy"] == "group") {
      this.showGroupMax = true;
    } else {
      this.showGroupMax = false;
      d3.select("#switch").html("Show max scale for group");
    }

    d3.select("#switch").on("click", function () {
      self.showGroupMax = self.showGroupMax ? false : true;
      var label = self.showGroupMax ? "Show max scale for each chart" : "Show max scale for group";
      d3.select(this).html(label);
    });
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

    this.margin = margin;
    this.width;
    this.height;
    this.render();
  }

  (0, _createClass2["default"])(SmallMultiples, [{
    key: "render",
    value: function render() {
      var self = this;
      var containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width;
      self.containerHeight = document.querySelector("#graphicContainer").getBoundingClientRect().width;
      console.log("containerWidth", containerWidth);
      var numCols;

      if (containerWidth <= 500) {
        numCols = 1;
      } else if (containerWidth <= 750) {
        numCols = 2;
      } else {
        numCols = 3;
      }

      console.log(numCols);
      var width = document.querySelector("#graphicContainer").getBoundingClientRect().width / numCols;
      console.log("width", width);
      var height = 200;

      if (self.isMobile) {
        height = 150;
      }

      self.width = width - self.margin.left - self.margin.right;
      self.height = height - self.margin.top - self.margin.bottom; // d3.select("#graphicContainer").selectAll("svg").remove()

      d3.select("#graphicContainer").selectAll(".barGrid").remove();

      for (var keyIndex = 0; keyIndex < this.keys.length; keyIndex++) {
        this._drawSmallChart(self.data, keyIndex, self.keys, self.details, self.isMobile, self.hasTooltip);
      }
    }
  }, {
    key: "_drawSmallChart",
    value: function _drawSmallChart(data, index, key, details, isMobile, hasTooltip) {
      var self = this;

      function makeId(str) {
        return str.replace(/ /g, "_");
      }

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

      d3.select("#graphicContainer").append("div").attr("id", makeId(key[index])).attr("class", "barGrid");
      var hashString = "#";
      var keyId = hashString.concat(makeId(key[index]));
      d3.select(keyId).append("div").text(key[index]).attr("class", "chartSubTitle");
      var svg = d3.select(keyId).append("svg").attr("width", self.width + self.margin.left + self.margin.right).attr("height", self.height + self.margin.top + self.margin.bottom).attr("overflow", "hidden");
      var features = svg.append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
      var keys = Object.keys(data[0]);
      var x = d3.scaleBand().range([0, self.width]).padding(0);
      var y = d3.scaleLinear().range([self.height, 0]);
      var duration = 1000;
      var yMax = self.showGroupMax ? data : data.filter(function (item) {
        return item[self.groupVar] === key[index];
      });
      x.domain(data.map(function (d) {
        return d[self.xVar];
      }));
      y.domain(d3.extent(yMax, function (d) {
        return d[self.yVar];
      })).nice();
      var tickMod = Math.round(x.domain().length / 3);
      var ticks = x.domain().filter(function (d, i) {
        return !(i % tickMod) || i === x.domain().length - 1;
      });
      var xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%d %b"));
      var yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return numberFormat(d);
      }).ticks(3);
      features.append("g").attr("class", "x").attr("transform", "translate(0," + self.height + ")").call(xAxis);
      features.append("g").attr("class", "y");

      function update() {
        // console.log(self)
        yMax = self.showGroupMax ? data : data.filter(function (item) {
          return item[self.groupVar] === key[index];
        });
        y.domain(d3.extent(yMax, function (d) {
          return d[self.yVar];
        }));
        var bars = features.selectAll(".bar").data(data.filter(function (d) {
          return d[self.groupVar] === key[index];
        }));
        bars.enter().append("rect").attr("class", "bar").style("fill", function () {
          return "rgb(204, 10, 17)";
        }).attr("height", 0).attr("y", self.height).merge(bars).transition().duration(duration).attr("x", function (d) {
          return x(d[self.xVar]);
        }).attr("y", function (d) {
          return y(Math.max(d[self.yVar], 0));
        }).attr("width", x.bandwidth()).attr("height", function (d) {
          return Math.abs(y(d[self.yVar]) - y(0));
        });

        if (hasTooltip) {
          var templateRender = function templateRender(d) {
            return (0, _mustache["default"])(self.template, _objectSpread({}, _helpers["default"], {}, d));
          };

          self.tooltip.bindEvents(d3.selectAll(".bar"), self.width, self.containerHeight, templateRender);
        }

        bars.exit().transition().duration(duration).attr("height", 0).attr("y", self.height).remove();
        features.select(".y").transition().duration(duration).call(yAxis);
      }

      document.getElementById("switch").addEventListener("click", function () {
        return update();
      });
      update();
    }
  }]);
  return SmallMultiples;
}();

exports["default"] = SmallMultiples;