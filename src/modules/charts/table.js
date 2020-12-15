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
    (0, _createTable["default"])(_table, headings);
    (0, _addMobilePrefix["default"])(headings);
    (0, _colourize["default"])(headings, userKey, data, _colorscale["default"]).then(function (data) {
      self.data = data;
      self.setup(options);
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