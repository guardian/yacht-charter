"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Tooltip = /*#__PURE__*/function () {
  /***
    Tooltip constructor
    
    - parentSelector: provide where the tooltip element is going to be appended
    - className (optional): provide additional css class names for more style control
  -------------*/
  function Tooltip(parentSelector, className) {
    (0, _classCallCheck2["default"])(this, Tooltip);
    this.$el = d3.select(parentSelector).append("div").attr("class", "".concat(className, " tooltip")).attr("width", "100px").attr("id", "tooltip").style("position", "absolute").style("background-color", "white").style("opacity", 0);
  }
  /***
    Show tooltip. 
    
    - html: HTML string to display
    - containerWidth: width of area where hover events should trigger
    - pos (optional): {
        left: Number,
        top: Number,
        leftOffset: Number,
        topOffset: Number
      } - Provide overrides for left/top positions
  -------------*/


  (0, _createClass2["default"])(Tooltip, [{
    key: "show",
    value: function show(html, containerWidth, pos) {
      this.$el.html(html);
      var tipWidth = this.$el.node().getBoundingClientRect().width;
      var left = pos && pos.left ? pos.left : d3.event.pageX;
      var top = pos && pos.top ? pos.top : d3.event.pageY;
      var leftOffset = pos && pos.leftOffset ? pos.leftOffset : 0;
      var topOffset = pos && pos.topOffset ? pos.topOffset : 0;

      if (d3.event.pageX < containerWidth / 2) {
        this.$el.style("left", "".concat(left + leftOffset + 10, "px"));
      } else if (d3.event.pageX >= containerWidth / 2) {
        this.$el.style("left", "".concat(left - tipWidth - 10, "px"));
      }

      this.$el.style("top", "".concat(top + topOffset, "px"));
      this.$el.transition().duration(200).style("opacity", 0.9);
    }
    /***
      Hide tooltip
    -------------*/

  }, {
    key: "hide",
    value: function hide() {
      this.$el.transition().duration(500).style("opacity", 0);
    }
    /***
      Bind events to target element. 
      
      - $bindEls: Elements that trigger the mouse events
      - containerWidth: width of area where hover events should trigger
      - templateRender: accepts function, string or number. Function to return the tooltip text.
        (Usually this passes in the data and the mustache template will render the output)
      - pos (optional): {
          left: Number,
          top: Number,
          leftOffset: Number,
          topOffset: Number
        } - Provide overrides for left/top positions
    -------------*/

  }, {
    key: "bindEvents",
    value: function bindEvents($bindEls, containerWidth, templateRender, pos) {
      var _this = this;

      var self = this;
      $bindEls.on("mouseover", function (d) {
        var html = typeof templateRender === "function" ? templateRender(d, this) : templateRender;
        self.show(html, containerWidth, pos);
      }).on("mouseout", function () {
        _this.hide();
      });
    }
  }]);
  return Tooltip;
}();

var _default = Tooltip;
exports["default"] = _default;