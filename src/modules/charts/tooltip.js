"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var tooltips = {
  prepareTooltip: function prepareTooltip(d3) {
    d3.select("#graphicContainer").append("div").attr("class", "tooltip").attr("width", "100px").attr("id", "tooltip").style("position", "absolute").style("background-color", "white").style("opacity", 0);
  },
  bindTooltip: function bindTooltip(els, data, d3, formatNumber) {
    var rootBoundingRect = document.querySelector("#graphicContainer").getBoundingClientRect();
    var width = rootBoundingRect.width; // console.log(data)

    var tooltip = d3.select("#tooltip");
    els.on("mouseover", function (d) {
      var text = "<b>".concat(d.display + " " + formatNumber(d.value), "</b>");
      console.log(text);
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(text);
      var boundingRect = this.getBoundingClientRect();
      var xCoordinate = boundingRect.left - rootBoundingRect.left;
      var yCoordinate = boundingRect.top - rootBoundingRect.top + 20;
      var half = width / 2;

      if (xCoordinate < half) {
        tooltip.style("left", xCoordinate + 50 + "px");
      } else {
        tooltip.style("left", xCoordinate - 50 + "px");
      } // tooltip.style("left", (d3.mouse(this)[0] + tipWidth/2) + "px");


      tooltip.style("top", yCoordinate + "px");
    });
    els.on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });
  }
};
var _default = tooltips;
exports["default"] = _default;