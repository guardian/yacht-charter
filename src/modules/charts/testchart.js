"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestChart = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TestChart = /*#__PURE__*/function () {
  function TestChart(results) {
    _classCallCheck(this, TestChart);

    this.create();
  }

  _createClass(TestChart, [{
    key: "create",
    value: function create() {
      var svg = d3.select("body").append("svg").attr("width", 960).attr("height", 300);
      var margin = {
        left: 30,
        right: 30,
        top: 10,
        bottom: 20
      };
      var width = svg.attr("width") - margin.left - margin.right;
      var height = svg.attr("height") - margin.bottom - margin.top; // TODO: nest data with d3.nest

      var data = [{
        "date": "01/01/2016",
        "a": 250,
        "b": 0,
        "c": 0,
        "d": 0
      }, {
        "date": "01/02/2016",
        "a": 150,
        "b": 80,
        "c": 20,
        "d": 0
      }, {
        "date": "01/03/2016",
        "a": 150,
        "b": 70,
        "c": 10,
        "d": 20
      }, {
        "date": "01/04/2016",
        "a": 150,
        "b": 30,
        "c": 30,
        "d": 40
      }];
      var x = d3.scaleTime().rangeRound([0, width]);
      var x_axis = d3.axisBottom(x);
      var y = d3.scaleLinear().rangeRound([height, 0]);
      var y_axis = d3.axisBottom(y);
      var parseTime = d3.timeParse("%d/%m/%Y");
      x.domain(d3.extent(data, function (d) {
        return parseTime(d.date);
      }));
      y.domain([0, d3.max(data, function (d) {
        return d3.max([d.a, d.b, d.c, d.d]);
      })]);

      var a = function a(d) {
        return d.a;
      };

      var multiline = function multiline(category) {
        var line = d3.line().x(function (d) {
          return x(parseTime(d.date));
        }).y(function (d) {
          return y(d[category]);
        });
        return line;
      };

      var line = d3.line().x(function (d) {
        return x(parseTime(d.date));
      }).y(function (d) {
        return y(d);
      });
      var categories = ['a', 'b', 'c', 'd']; //var color = d3.scale.category10();  // escala com 10 cores (category10)

      var color = d3.scaleOrdinal(d3.schemeCategory10);
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      for (var i in categories) {
        var lineFunction = multiline(categories[i]);
        g.append("path").datum(data).attr("class", "line").style("stroke", color(i)).attr("d", lineFunction);
      } // Add the X Axis


      g.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)); // Add the Y Axis

      g.append("g").call(d3.axisLeft(y));
    }
  }]);

  return TestChart;
}();

exports.TestChart = TestChart;