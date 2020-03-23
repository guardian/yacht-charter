"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createCats;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Creates a color key block to identify data that is color coded.
 * @param {categories} arg A list of strings which identify the key text.
 * @param {colors} arg A list of web colors used in the given chart, presented
 * in the same order as {categories}
 */
function createCats(d3, categories, colours) {
  var defaultColours = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6"];

  if (colours == null || colours.size == 0) {
    colours = defaultColours;
  }

  var greyScale = ["#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var symbolTypes = ["symbolCircle", "symbolCross", "symbolDiamond", "symbolSquare", "symbolStar", "symbolTriangle", "symbolWye", "symbolCircle", "symbolCross", "symbolDiamond", "symbolSquare", "symbolStar", "symbolTriangle", "symbolWye"];
  var keys = categories;
  var colourDomain = [];
  var colourRange = []; //self.database.forEach((item) => keys.indexOf(item[categories]) === -1 ? keys.push(item[categories]) : "")

  while (symbolTypes.length < keys.length) {
    symbolTypes = [].concat(_toConsumableArray(symbolTypes), _toConsumableArray(symbolTypes));
  }

  var symbolGenerator = d3.symbol().size(50);
  var syms = keys.map(function (item, index) {
    return [item, symbolTypes[index]];
  });
  var symap = new Map(syms);

  var symbolKey = function symbolKey(cat) {
    symbolGenerator.type(d3[symap.get(cat)]);
    return symbolGenerator();
  };

  var html = ""; // if (this.key != null) {
  //
  //   if (this.key[0].key != "") {
  //
  //     this.key.forEach(function (d) {
  //
  //       html += "<div class=\"keyDiv\"><span data-cat=\"" + d.key + "\" class=\"keyCircle\" style=\"background: " + d.colour + "\"></span>"
  //       html += " <span class=\"keyText\">" + d.key + "</span></div>"
  //     })
  //
  //   }
  //
  // } else {

  for (var i = 0; i < keys.length; i++) {
    colourDomain.push(keys[i]);
    colourRange.push(colours[i]);
  }

  var colourKey = d3.scaleOrdinal();
  var greyKey = d3.scaleOrdinal(); // categories.forEach(function (d) {
  //   colourDomain.push(d.key)
  //   colourRange.push(d.colour)
  // })

  colourKey.domain(colourDomain).range(colourRange);
  greyKey.domain(colourDomain).range(greyScale);
  html += "<div class=\"colour_blind_key\">";

  for (i = 0; i < keys.length; i++) {
    // colourDomain.push(keys[i])
    // colourRange.push(self.colours[i])
    html += "<div class=\"keyDiv\"><span data-cat=\"" + keys[i] + "\" class=\"keySymbol\"><svg width=\"12\" height=\"12\" viewBox=\"-6 -6 12 12\"><path d=\"" + symbolKey(keys[i]) + "\" stroke=\"#000\" stroke-width=\"1px\" fill=\"" + greyKey(keys[i]) + "\" /></svg></span>";
    html += " <span class=\"keyText\">" + keys[i] + "</span></div>";
  }

  html += "</div><div class=\"colour_vision_key\">";

  for (i = 0; i < keys.length; i++) {
    html += "<div class=\"keyDiv\"><span data-cat=\"" + keys[i] + "\" class=\"keyCircle\" style=\"background: " + colours[i] + "\"></span>";
    html += " <span class=\"keyText\">" + keys[i] + "</span></div>";
  }

  html += "</div>"; // }

  d3.select("#key").html(html);
}