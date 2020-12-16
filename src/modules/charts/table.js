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

var _contains = _interopRequireDefault(require("../utilities/contains"));

var _createTable = _interopRequireDefault(require("../utilities/table/createTable"));

var _addMobilePrefix = _interopRequireDefault(require("../utilities/table/addMobilePrefix"));

var _propComparator = _interopRequireDefault(require("../utilities/table/propComparator"));

var _styleHeaders = _interopRequireDefault(require("../utilities/table/styleHeaders"));

var _colourize = _interopRequireDefault(require("../utilities/table/colourize"));

var _mustache = _interopRequireDefault(require("../utilities/mustache"));

var _matchArray = _interopRequireDefault(require("../utilities/table/matchArray"));

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var table = /*#__PURE__*/function () {
  function table(results) {
    (0, _classCallCheck2["default"])(this, table);
    var self = this;

    var _table = document.querySelector("#int-table");

    var data = results.sheets.data;
    var details = results.sheets.template;
    var options = results.sheets.options;
    var userKey = results["sheets"]["key"];
    var headings = Object.keys(data[0]);
    data.forEach(function (row) {
      var _iterator = _createForOfIteratorHelper(headings),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var cell = _step.value;
          row[cell] = typeof row[cell] === "string" && !isNaN(parseInt(row[cell])) ? +row[cell] : row[cell];
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
    (0, _createTable["default"])(_table, headings);
    (0, _addMobilePrefix["default"])(headings);
    (0, _colourize["default"])(headings, userKey, data, _colorscale["default"]).then(function (data) {
      self.data = data;
      self.setup(options);
    });
  }

  (0, _createClass2["default"])(table, [{
    key: "setup",
    value: function setup(options) {
      var _this = this;

      var self = this;
      this.render();
      this.searchEl = document.getElementById("search-field");

      if (options[0].enableSearch === 'TRUE') {
        document.querySelector("#search-container").style.display = "block";
        this.searchEl.addEventListener("input", function () {
          return self.render(_this.value);
        });
        this.searchEl.addEventListener("focus", function () {
          if (_this.value === "Search") {
            _this.value = "";
          }
        });
      }

      if (options[0].enableSort === 'TRUE') {
        this.currentSort = null;
        document.querySelector("tr").addEventListener("click", function (e) {
          return self.sortColumns(e);
        });
      }

      if (options[0].scrolling === 'TRUE') {
        this.showingRows = true;
      } else {
        this.showingRows = false;
        document.querySelector("#untruncate").style.display = "block";
        document.querySelector("#untruncate").addEventListener("click", function (button) {
          self.showingRows = self.showingRows ? false : true;
          self.render();
        });
      }
    }
  }, {
    key: "sortColumns",
    value: function sortColumns(e) {
      var self = this;
      this.data = this.data.sort((0, _propComparator["default"])(e.target.cellIndex));
      (0, _styleHeaders["default"])(e);
      this.render();
    }
  }, {
    key: "render",
    value: function render() {
      var self = this;
      var tbodyEl = document.querySelector("#int-table tbody");
      var template = "{{#rows}}\n        <tr {{#getIndex}}{{/getIndex}}>\n            {{#item}}\n                <td {{#styleCheck}}{{/styleCheck}} class=\"column\"><span class=\"header-prefix\"></span><span>{{value}}</span></td>\n            {{/item}}\n        </tr>\n    {{/rows}}";
      var rowsToRender = this.searchEl && this.searchEl.value !== "" ? self.data.filter(function (item) {
        return (0, _matchArray["default"])(item.map(function (row) {
          return Object.values(row)[0];
        }), self.searchEl.value);
      }) : self.data;
      var finalRows = rowsToRender.map(function (item, index) {
        return {
          index: index,
          item: item
        };
      });

      var styleCheck = function styleCheck() {
        return this.color ? "style=\"background-color:".concat(this.color, ";text-align:center;color:").concat(this.contrast, ";\"") : !isNaN(this.value) ? "style=\"text-align:center;\"" : '';
      };

      var getIndex = function getIndex() {
        return this.index >= 10 && !self.showingRows ? "style=\"display:none;\"" : "";
      };

      var html = (0, _mustache["default"])(template, {
        rows: finalRows,
        styleCheck: styleCheck,
        getIndex: getIndex
      });
      tbodyEl.innerHTML = html;
    }
  }]);
  return table;
}();

exports["default"] = table;