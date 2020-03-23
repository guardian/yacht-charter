"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _tooltip = _interopRequireDefault(require("./tooltip"));

var d3 = _interopRequireDefault(require("d3"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TreeMap = /*#__PURE__*/function () {
  function TreeMap(data, isMobile) {
    _classCallCheck(this, TreeMap);

    this.width = document.querySelector("#graphicContainer").getBoundingClientRect().width;

    if (isMobile) {
      this.height = this.width * 1.23610097750;
    } else {
      this.height = this.width * 0.61803398875;
    } //clear old chart


    d3.select("#graphicContainer svg").remove();
    d3.select("#tooltip").remove();
    this.treemap = d3.treemap().size([this.width, this.height]).padding(1).round(true);
    var svg = d3.select("#graphicContainer").append("svg").attr("viewBox", [0, 0, this.width, this.height]);

    var root = this._constructStratifiedData(data);

    _tooltip["default"].prepareTooltip(d3);

    this._render(svg, root);
  }

  _createClass(TreeMap, [{
    key: "_constructStratifiedData",
    value: function _constructStratifiedData(data) {
      //construct dummy Nodes for categories if they don't exist already
      var parentNodes = [];
      var elementSet = new Set();
      data.forEach(function (datum) {
        elementSet.add(datum.categoryName);
      });
      data.forEach(function (datum) {
        if (!elementSet.has(datum.categoryParent)) {
          elementSet.add(datum.categoryParent);
          parentNodes.push({
            categoryName: datum.categoryParent,
            categoryParent: "root"
          });
        }
      }); // insert a single root node and category nodes

      var dataWithRoot = [{
        categoryName: "root",
        categoryParent: ""
      }].concat(parentNodes, _toConsumableArray(data));
      var root = d3.stratify().id(function (d) {
        return d.categoryName;
      }).parentId(function (d) {
        if (d.categoryName != "root") {
          // Point any node without a parent to our single root node needed for
          // the d3 treemap method.
          if (d.categoryParent == null || d.categoryParent == "") {
            return "root";
          } else {
            return d.categoryParent;
          }
        } else {
          return null;
        }
      })(dataWithRoot).sum(function (d) {
        return d.categorySize;
      }).sort(function (a, b) {
        return b.height - a.height || b.value - a.value;
      });
      this.root = root;
      return root;
    }
  }, {
    key: "_render",
    value: function _render(svg, root) {
      var _this = this;

      // set state
      console.log("rendering");
      console.log(root);
      this.root = root;
      root.depth = 0;
      this.treemap(root);
      var newData = root.leaves(); //set scale functions

      var scaleX = d3.scaleLinear().range([0, this.width]).domain([root.x0, root.x1]);
      var scaleY = d3.scaleLinear().range([0, this.height]).domain([root.y0, root.y1]);
      var leaves = svg.append("g").attr("class", "parent").selectAll("g").data(newData).enter().append("g").attr("transform", function (d) {
        if (d.id === "root") {
          return "translate(".concat(d.x0, ",").concat(d.y0, ")");
        } else {
          return "translate(".concat(scaleX(d.x0), ",").concat(scaleY(d.y0), ")");
        }
      }); //let leaves = group

      leaves.append("title").text(function (d) {
        return d.data.categoryName;
      });
      leaves.append("rect").attr("id", function (d) {
        return d.id;
      }).attr("width", function (d) {
        console.log(d);

        if (d.id === "root") {
          return d.x1 - d.x0;
        } else {
          return scaleX(d.x1) - scaleX(d.x0);
        }
      }).attr("height", function (d) {
        if (d.id === "root") {
          return d.y1 - d.y0;
        } else {
          return scaleY(d.y1) - scaleY(d.y0);
        }
      }).attr("fill", function () {
        //default color if overrides are set incorrectly
        var color = "#bada55"; // var node = d
        // if (node.data.categoryColorOverride == null ||
        //   node.data.categoryColorOverride == "") {
        //
        //   while (node.parent != null &&
        //     node.data.categoryColorOverride == null ||
        //     node.data.categoryColorOverride == "") {
        //     // inherit parent category color
        //     color = node.parent.data.categoryColorOverride
        //     node = node.parent
        //   }
        //
        // } else {
        //   color = node.data.categoryColorOverride
        // }

        return color;
      });
      leaves.select("rect").attr("cursor", "pointer").on("click", function (d) {
        _this._zoomTo(d, svg);
      });
      leaves.enter().append("clipPath").attr("id", function (d) {
        return "clip-" + d.id;
      }).append("use").attr("xlink:href", function (d) {
        return "#" + d.id;
      });
      var label = leaves.append("text").attr("id", function (d) {
        return "text-" + d.id;
      }).attr("clip-path", function (d) {
        return "url(#clip-" + d.id + ")";
      });
      label.attr("x", 4).attr("y", 13).text(function (d) {
        return d.data.categoryName;
      });

      this._wrap(label, d3);

      label.attr("opacity", function () {
        var textWidth = this.parentNode.getBoundingClientRect().width;
        var rectWidth = d3.select(this.parentNode).select("rect").node().getBoundingClientRect().width;
        var textHeight = this.parentNode.getBoundingClientRect().height;
        var rectHeight = d3.select(this.parentNode).select("rect").node().getBoundingClientRect().height;
        var tooltipData = newData.map(function (newDatum) {
          return {
            display: newDatum.categoryName,
            value: newDatum.categorySize
          };
        });

        _tooltip["default"].bindTooltip(leaves, tooltipData, d3, d3.format("$,d"));

        if (textWidth > rectWidth || textHeight > rectHeight) {
          return 0;
        } else {
          return 1;
        }
      });
      return svg.select(".parent");
    }
  }, {
    key: "_wrap",
    value: function _wrap(text) {
      text.each(function () {
        var rectWidth = d3.select(this.parentNode).select("rect").node().getBoundingClientRect().width - 8; // padding

        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word = words.pop(),
            line = [],
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null).append("tspan").attr("x", 4).attr("y", y).attr("dy", dy + "em");
        var lineNumber = 0;

        while (word != null) {
          var lineHeight = 1.1;
          line.push(word);
          tspan.text(line.join(" "));

          if (tspan.node().getBoundingClientRect().width > rectWidth) {
            lineNumber += 1;
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 4).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
          }

          word = words.pop();
        }
      });
    }
  }, {
    key: "_zoomTo",
    value: function _zoomTo(newRootDatum, svg) {
      if (newRootDatum.id !== this.root.id) {
        var newRoot = newRootDatum;
        console.log(newRoot);

        while (this.root.parent != null && newRoot.parent != null && newRoot.parent.id !== this.root.parent.id) {
          newRoot = newRoot.parent;
        }

        console.log(newRoot);

        this._transition(svg, newRoot, svg.select(".parent"));
      }
    }
  }, {
    key: "_transition",
    value: function _transition(svg, d, g1) {
      var _this2 = this;

      if (this.transitioning || !d) return;
      this.transitioning = true;
      var transitionIn = d3.transition().attrTween("opacity", function () {
        return d3.interpolateNumber(0, 1);
      }).duration(3000);
      var transitionOut = d3.transition().attrTween("opacity", function () {
        console.log("calling tween");
        return d3.interpolateNumber(1, 0);
      }).duration(3000).on("end", function () {
        _this2.transitioning = false;
      });

      var g2 = this._render(svg, d, 0);

      g2.attr("opacity", 0).style("fill-opacity", 0);
      g1.transition(transitionOut).remove().each(function () {
        _this2.transitioning = false;
      });
      g2.transition(transitionIn); // t2 = g2.transition().duration(750)
      // //   .attr("opacity", 1)
      // //   .remove()
      // Update the domain only after entering new elements.
      // this.scaleX.domain([d.x, d.x + d.dx])
      // this.scaleY.domain([d.y, d.y + d.dy])
      // Enable anti-aliasing during the transition.
      //svg.style("shape-rendering", null)
      // // Draw child nodes on top of parent nodes.
      // svg.selectAll(".depth").sort(function (a, b) {
      //   return a.depth - b.depth
      // })
      // Fade-in entering text.
      //g2.selectAll("text").style("fill-opacity", 0)
      // Transition to the new view.
      // t2.selectAll(".ptext").call(text).style("fill-opacity", 1)
      // t2.selectAll(".ctext").call(text2).style("fill-opacity", 1)
      // t1.selectAll("rect")
      // t2.selectAll("rect")
      // // Remove the old node when the transition is finished.
      // t1.remove().each(function () {
      //   //svg.style("shape-rendering", "crispEdges")
      //   this.transitioning = false
      // })
    }
  }]);

  return TreeMap;
}();

exports["default"] = TreeMap;