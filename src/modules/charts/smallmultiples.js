<<<<<<< HEAD
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
  function SmallMultiples(results, isMobile) {
    (0, _classCallCheck2["default"])(this, SmallMultiples);
    var data = results.sheets.data;
    var details = results.sheets.template;
    var keys = (0, _toConsumableArray2["default"])(new Set(data.map(function (d) {
      return d.State;
    })));
    d3.select("#graphicContainer").html(""); // var chartKey = d3.select("#chartKey")
    // chartKey.html("")

    data.forEach(function (d) {
      if (typeof d.Cases == "string") {
        d.Cases = +d.Cases;
      }

      if (typeof d.Date == "string") {
        var timeParse = d3.timeParse("%Y-%m-%d");
        d.Date = timeParse(d.Date);
      }
    });

    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      this._drawSmallChart(data, keyIndex, keys, details, isMobile);
    }
  }

  (0, _createClass2["default"])(SmallMultiples, [{
    key: "_drawSmallChart",
    value: function _drawSmallChart(data, index, key, details, isMobile) {
      var numCols;
      var containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width;

      if (containerWidth < 500) {
        numCols = 1;
      } else if (containerWidth < 750) {
        numCols = 2;
      } else {
        numCols = 3;
      }

      console.log(numCols);
      var width = document.querySelector("#graphicContainer").getBoundingClientRect().width / numCols;
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
      d3.select("#graphicContainer").append("div").attr("id", key[index]).attr("class", "barGrid");
      var hashString = "#";
      var keyId = hashString.concat(key[index]);
      d3.select(keyId).append("div").text(key[index]).attr("class", "chartSubTitle");
      var svg = d3.select(keyId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden");
      var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      var keys = Object.keys(data[0]);
      var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
      var y = d3.scaleLinear().range([height, 0]);
      x.domain(data.map(function (d) {
        return d.Date;
      }));
      y.domain(d3.extent(data, function (d) {
        return d.Cases;
      })).nice();
      var xAxis;
      var yAxis;
      var tickMod = Math.round(x.domain().length / 3);
      var ticks = x.domain().filter(function (d, i) {
        return !(i % tickMod) || i === x.domain().length - 1;
      });
      xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%d %b"));
      yAxis = d3.axisLeft(y).tickFormat(function (d) {
        return d;
      }).ticks(5);
      features.append("g").attr("class", "x").attr("transform", "translate(0," + height + ")").call(xAxis);
      features.append("g").attr("class", "y").call(yAxis);
      features.selectAll(".bar").data(data.filter(function (d) {
        return d.State === key[index];
      })).enter().append("rect").attr("class", "bar").attr("x", function (d) {
        return x(d.Date);
      }).style("fill", function () {
        return "rgb(204, 10, 17)";
      }).attr("y", function (d) {
        return y(Math.max(d.Cases, 0)); // return y(d[keys[0]])
      }).attr("width", x.bandwidth()).attr("height", function (d) {
        return Math.abs(y(d.Cases) - y(0));
      });
    }
  }]);
  return SmallMultiples;
}();

exports["default"] = SmallMultiples;
=======
"use strict";function ownKeys(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),r.push.apply(r,a)}return r}function _objectSpread(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?ownKeys(Object(r),!0).forEach(function(e){(0,_defineProperty2.default)(t,e,r[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))})}return t}var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof")),_defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty")),_toConsumableArray2=_interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray")),_classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck")),_createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass")),_moment=_interopRequireDefault(require("moment")),SmallMultiples=function(){function t(e,r){(0,_classCallCheck2.default)(this,t);var a=e.sheets.data,n=e.sheets.template,o=(0,_toConsumableArray2.default)(new Set(a.map(function(t){return t.State}))),i=""!=n[0].tooltip;console.log(e),d3.select("#graphicContainer svg").remove(),d3.select("#graphicContainer").html(""),a.forEach(function(t){if("string"==typeof t.Cases&&(t.Cases=+t.Cases),"string"==typeof t.Date){var e=d3.timeParse("%Y-%m-%d");t.Date=e(t.Date)}}),i&&(this.tooltip=d3.select("body").append("div").attr("class","tooltip").attr("id","tooltip").style("position","absolute").style("background-color","white").style("opacity",0));for(var l=0;l<o.length;l++)this._drawSmallChart(a,l,o,n,r,i)}return(0,_createClass2.default)(t,[{key:"_drawSmallChart",value:function(t,e,r,a,n,o){var i,l=this;i=n?2:3;var s,u=document.querySelector("#graphicContainer").getBoundingClientRect().width/i,c=.5*u;s=a[0]["margin-top"]?{top:+a[0]["margin-top"],right:+a[0]["margin-right"],bottom:+a[0]["margin-bottom"],left:+a[0]["margin-left"]}:{top:0,right:0,bottom:20,left:50},u=u-s.left-s.right,c=c-s.top-s.bottom,d3.select("#graphicContainer").append("div").attr("id",r[e]).attr("class","barGrid");var p="#",d=p.concat(r[e]);d3.select(d).append("div").text(r[e]).attr("class","chartSubTitle");var f=d3.select(d).append("svg").attr("width",u+s.left+s.right).attr("height",c+s.top+s.bottom).attr("id","svg").attr("overflow","hidden"),m=f.append("g").attr("transform","translate("+s.left+","+s.top+")"),h=(Object.keys(t[0]),{decimals:function(t){var e=t.split(",");return parseFloat(this[e[0]]).toFixed(e[1])},nicedate:function(t){var e=this[t];return(0,_moment.default)(e).format("MMM D")}}),g=d3.scaleBand().range([0,u]).paddingInner(.08),b=d3.scaleLinear().range([c,0]);g.domain(t.map(function(t){return t.Date})),b.domain(d3.extent(t,function(t){return t.Cases})).nice();var y,v,C=Math.round(g.domain().length/3),_=g.domain().filter(function(t,e){return!(e%C)||e===g.domain().length-1});y=d3.axisBottom(g).tickValues(_).tickFormat(d3.timeFormat("%d %b")),v=d3.axisLeft(b).tickFormat(function(t){return t}).ticks(5),m.append("g").attr("class","x").attr("transform","translate(0,"+c+")").call(y),m.append("g").attr("class","y").call(v),m.selectAll(".bar").data(t.filter(function(t){return t.State===r[e]})).enter().append("rect").attr("class","bar").attr("x",function(t){return g(t.Date)}).style("fill",function(){return"rgb(204, 10, 17)"}).attr("y",function(t){return b(Math.max(t.Cases,0))}).attr("width",g.bandwidth()).attr("height",function(t){return Math.abs(b(t.Cases)-b(0))}).on("mouseover",function(t){if(o){var e=l.mustache("<strong>Date: </strong>{{#nicedate}}Date{{/nicedate}}<br/><strong>Cases: </strong>{{Cases}}",_objectSpread({},h,{},t));l.tooltip.html(e);var r=document.querySelector("#tooltip").getBoundingClientRect().width;d3.event.pageX<u/2?l.tooltip.style("left",d3.event.pageX+r/2+"px"):d3.event.pageX>=u/2&&l.tooltip.style("left",d3.event.pageX-r+"px"),l.tooltip.style("top",d3.event.pageY+"px"),l.tooltip.transition().duration(200).style("opacity",.9)}}).on("mouseout",function(){o&&l.tooltip.transition().duration(500).style("opacity",0)})}},{key:"mustache",value:function(t,e,r,a){function n(t,e){return e=e.pop?e:e.split("."),t=t[e.shift()],t=null!=t?t:"",0 in e?n(t,e):t}var o,i=this.mustache,l="";e=Array.isArray(e)?e:e?[e]:[],e=a?0 in e?[]:[1]:e;for(o=0;o<e.length;o++){var s,u="",c=0,p="object"==(0,_typeof2.default)(e[o])?e[o]:{};p=Object.assign({},r,p),p[""]={"":e[o]},t.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,function(t,e,r,a,o,d,f){c?u+=c&&!o||c>1?t:e:(l+=e.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g,function(t,e,r,a,o,l){return e?n(p,e):a?n(p,l):o?i(n(p,l),p):r?"":new Option(n(p,l)).innerHTML}),s=d),o?--c||(f=n(p,f),/^f/.test((0,_typeof2.default)(f))?l+=f.call(p,u,function(t){return i(t,p)}):l+=i(u,f,p,s),u=""):++c})}return l}}]),t}();exports.default=SmallMultiples;
>>>>>>> 5d7cc43c8be5539e7f8a887b8d20324664e44d0d
