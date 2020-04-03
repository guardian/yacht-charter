"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var SmallMultiples = /*#__PURE__*/function () {
  function SmallMultiples(results, isMobile) {
    (0, _classCallCheck2["default"])(this, SmallMultiples);
    var data = results.sheets.data;
    var details = results.sheets.template;
    var keys = (0, _toConsumableArray2["default"])(new Set(data.map(function (d) {
      return d.State;
    })));
    d3.select("#graphicContainer").html(""); // var chartKey = d3.select("#chartKey")
    // chartKey.html("")

    data.forEach(function (d) {
      if (typeof d.Cases == "string") {
        d.Cases = +d.Cases;
      }

      if (typeof d.Date == "string") {
        var timeParse = d3.timeParse("%Y-%m-%d");
        d.Date = timeParse(d.Date);
      }
    });

    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      this._drawSmallChart(data, keyIndex, keys, details, isMobile);
    }
  }

  (0, _createClass2["default"])(SmallMultiples, [{
    key: "_drawSmallChart",
    value: function _drawSmallChart(data, index, key, details, isMobile) {
      var numCols;
      var containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width;

      if (containerWidth < 500) {
        numCols = 1;
      } else if (containerWidth < 750) {
        numCols = 2;
      } else {
        numCols = 3;
      }

      console.log(numCols);
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

      width = width - margin.left - margin.right, height = height - margin.top - margin.bottom;
      d3.select("#graphicContainer").append("div").attr("id", key[index]).attr("class", "barGrid");
      var hashString = "#";
      var keyId = hashString.concat(key[index]);
      d3.select(keyId).append("div").text(key[index]).attr("class", "chartSubTitle");
      var svg = d3.select(keyId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden");
      var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      var keys = Object.keys(data[0]);
      var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
      var y = d3.scaleLinear().range([height, 0]);
      x.domain(data.map(function (d) {
        return d.Date;
      }));
      y.domain(d3.extent(data, function (d) {
        return d.Cases;
      })).nice();
      var xAxis;
      var yAxis;
      var tickMod = Math.round(x.domain().length / 3);
      var ticks = x.domain().filter(function (d, i) {
        return !(i % tickMod) || i === x.domain().length - 1;
      });
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%d %b"));
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return d;
      }).ticks(5);
      features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
      features.append("g").attr("class", "y").call(yAxis);
      features.selectAll(".bar").data(data.filter(function (d) {
        return d.State === key[index];
      })).enter().append("rect").attr("class", "bar").attr("x", function (d) {
        return x(d.Date);
      }).style("fill", function () {
        return "rgb(204, 10, 17)";
      }).attr("y", function (d) {
        return y(Math.max(d.Cases, 0)); // return y(d[keys[0]])
      }).attr("width", x.bandwidth()).attr("height", function (d) {
        return Math.abs(y(d.Cases) - y(0));
      });
    }
  }]);
  return SmallMultiples;
}();

exports["default"] = SmallMultiples;