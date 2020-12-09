"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _dataTools = _interopRequireDefault(require("./dataTools"));

var _colorscale = _interopRequireDefault(require("./shared/colorscale"));

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var table = /*#__PURE__*/function () {
  function table(results) {
    (0, _classCallCheck2["default"])(this, table);
    var container = d3.select("#graphicContainer");
    var data = results.sheets.data;
    var details = results.sheets.template;
    var options = results.sheets.options;
    var userKey = results["sheets"]["key"];

    var _dataTools$getColorDo = _dataTools["default"].getColorDomainRangeMax(options),
        colorDomain = _dataTools$getColorDo.colorDomain,
        colorRange = _dataTools$getColorDo.colorRange,
        colorMax = _dataTools$getColorDo.colorMax;

    this.colors = new _colorscale["default"]({
      type: "linear",
      domain: colorDomain,
      colors: colorRange,
      divisor: colorMax
    });
    this.big(data);
    this.small(data);
  }

  (0, _createClass2["default"])(table, [{
    key: "big",
    value: function big(data) {
      var self = this;

      function generateTableHead(table, data) {
        var thead = table.createTHead();
        var row = thead.insertRow();

        var _iterator = _createForOfIteratorHelper(data),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var key = _step.value;
            var th = document.createElement("th");
            th.classList.add("column-header");
            var text = document.createTextNode(key);
            th.appendChild(text);
            row.appendChild(th);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      function generateTable(table, data) {
        var _iterator2 = _createForOfIteratorHelper(data),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var element = _step2.value;
            var row = table.insertRow();

            for (var key in element) {
              var cell = row.insertCell();
              var text = document.createTextNode(element[key]);
              cell.appendChild(text);
              cell.style.backgroundColor = self.colors.get(element[key]);
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }

      var table = document.querySelector("#big-table");
      var pivots = Object.keys(data[0]);
      generateTableHead(table, pivots);
      generateTable(table, data);
    }
  }, {
    key: "small",
    value: function small(data) {
      var self = this;
      var pivots = Object.keys(data[0]);

      function generateTable(table, data) {
        var _iterator3 = _createForOfIteratorHelper(data),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var cat = _step3.value;
            var row = table.insertRow();
            var th = document.createElement("th");
            th.colSpan = "2";
            th.classList.add("st-head-row");
            th.innerHTML = cat[pivots[0]];
            row.appendChild(th);

            for (var i = 1; i < pivots.length; i++) {
              var tr = table.insertRow();
              var key = tr.insertCell();
              key.classList.add("st-key");
              var text = document.createTextNode(pivots[i]);
              key.appendChild(text);
              var val = tr.insertCell();
              val.classList.add("st-val");
              var txt = document.createTextNode(cat[pivots[i]]);
              val.appendChild(txt);
              val.style.backgroundColor = self.colors.get(cat[pivots[i]]);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }

      var table = document.querySelector("#small-table");
      generateTable(table, data);
    }
  }]);
  return table;
}();

exports["default"] = table;