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

var _swatches = _interopRequireDefault(require("../utilities/table/swatches"));

var _mustache = _interopRequireDefault(require("../utilities/mustache"));

var _matchArray = _interopRequireDefault(require("../utilities/table/matchArray"));

var table = /*#__PURE__*/function () {
  function table(results) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, table);
    var self = this;
    var container = document.querySelector("#graphicContainer");

    var _table = document.querySelector("#int-table");

    var data = results.sheets.data;
    var details = results.sheets.template;
    var options = results.sheets.options;
    var userKey = results["sheets"]["key"];
    var pantone = (0, _swatches["default"])(data, userKey, _colorscale["default"]);
    var headings = Object.keys(data[0]);
    var highlighted = userKey.map(function (item) {
      return item.key;
    });
    (0, _createTable["default"])(_table, headings);

    var colourizer = function colourizer(value, index) {
      return !(0, _contains["default"])(headings[index], highlighted) ? 'none' : pantone.find(function (item) {
        return item.name === headings[index];
      }).profile.get(value);
    };

    var values = data.map(function (row) {
      return Object.values(row);
    });
    this.data = values.map(function (row, i) {
      return row.map(function (value, index) {
        return {
          value: value,
          color: colourizer(value, index)
        };
      });
    });
    /*
    format  enableSearch  enableSort
    scrolling TRUE  TRUE
    */

    /*
    const {
      colorDomain,
      colorRange,
      colorMax
    } = dataTools.getColorDomainRangeMax(options)
     this.colors = new ColorScale({
      type: "linear",
      domain: colorDomain,
      colors: colorRange,
      divisor: colorMax
    })
    */

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

    if (options[0].enableSort === 'TRUE') {//Set up the sort stuff
    }

    if (options[0].scrolling === 'TRUE') {//Set up the scrolling stuff
    }
  }

  (0, _createClass2["default"])(table, [{
    key: "render",
    value: function render() {
      var self = this;
      var tbodyEl = document.querySelector("#int-table tbody");
      var template = "{{#rows}}\n        <tr>\n            {{#.}}\n                <td style=\"background-color:{{color}};\"class=\"column\"><span class=\"header-prefix\"></span><span>{{value}}</span></td>\n            {{/.}}\n        </tr>\n    {{/rows}}";
      var rowsToRender = this.searchEl && this.searchEl.value !== "Search" && this.searchEl.value !== "" ? self.data.filter(function (item) {
        return (0, _matchArray["default"])(item.map(function (row) {
          return Object.values(row)[0];
        }), self.searchEl.value);
      }) : self.data;
      var html = (0, _mustache["default"])(template, {
        rows: rowsToRender
      }); // { ...helpers, ... }

      tbodyEl.innerHTML = html;
    }
  }]);
  return table;
}();

exports["default"] = table;