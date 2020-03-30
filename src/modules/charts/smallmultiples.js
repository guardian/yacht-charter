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
  function SmallMultiples(results) {
    (0, _classCallCheck2["default"])(this, SmallMultiples);
    console.log(results);
    var data = results.sheets.data;
    var details = results.sheets.template;
    var keys = (0, _toConsumableArray2["default"])(new Set(data.map(function (d) {
      return d.categoryKey;
    }))); // assumes the second column is the thing we want to group by, but should allow for setting a manual option in template or options
    // var groupVar = keys[1]
    //
    // keys.splice(0, 1)
    //
    // // var nested = d3.nest()
    // //   .key((n) => n[groupVar].trim())
    // //   .entries(data)
    //
    // console.log(nested)

    console.log(keys);
    d3.select("#graphicContainer svg").remove(); // var chartKey = d3.select("#chartKey")
    // chartKey.html("")

    data.forEach(function (d) {
      if (typeof d.categoryValue == "string") {
        d.categoryValue = +d.categoryValue;
      }

      if (typeof d.categoryDay == "string") {
        d.categoryDay = +d.categoryDay;
      }
    });

    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      this._drawSmallChart(data, keyIndex, keys, details);
    }
  }

  (0, _createClass2["default"])(SmallMultiples, [{
    key: "_drawSmallChart",
    value: function _drawSmallChart(data, index, key, details) {
      var width = document.querySelector("#graphicContainer").getBoundingClientRect().width / 3;
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
      d3.select("#graphicContainer").append("div").attr("id", key[index]);
      var hashString = "#";
      var keyId = hashString.concat(key[index]);
      var svg = d3.select(keyId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden");
      var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      var keys = Object.keys(data[0]);
      console.log(1, keys);
      var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
      var y = d3.scaleLinear().range([height, 0]);
      x.domain(data.map(function (d) {
        return d.categoryDay;
      }));
      y.domain(d3.extent(data, function (d) {
        return d.categoryValue;
      })).nice();
      var xAxis;
      var yAxis;
      var ticks = x.domain().filter(function (d, i) {
        return !(i % 20);
      });
      xAxis = d3.axisBottom(x).tickValues(ticks);
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return d;
      });
      features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
      features.append("g").attr("class", "y").call(yAxis);
      features.selectAll(".bar").data(data.filter(function (d) {
        console.log(d);
        console.log(key, index, key[index]);
        return d.categoryKey === key[index];
      })).enter().append("rect").attr("class", "bar").attr("x", function (d) {
        return x(d.categoryDay);
      }).style("fill", function () {
        return "rgb(204, 10, 17)";
      }).attr("y", function (d) {
        return y(Math.max(d.categoryValue, 0)); // return y(d[keys[0]])
      }).attr("width", x.bandwidth()).attr("height", function (d) {
        return Math.abs(y(d.categoryValue) - y(0));
      }); // function textPadding(d) {
      //   if (d.y2 > 0) {
      //     return 12
      //   } else {
      //     return -2
      //   }
      // }
      //
      // function textPaddingMobile(d) {
      //   if (d.y2 > 0) {
      //     return 12
      //   } else {
      //     return 4
      //   }
      // }
    }
  }]);
  return SmallMultiples;
}();

exports["default"] = SmallMultiples;