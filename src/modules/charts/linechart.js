<<<<<<< HEAD
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var LineChart = function LineChart(results) {
  (0, _classCallCheck2["default"])(this, LineChart);
  console.log(results);
  var clone = JSON.parse(JSON.stringify(results));
  var data = clone["sheets"]["data"];
  var template = clone["sheets"]["template"];
  var labels = clone["sheets"]["labels"];
  var periods = clone["sheets"]["periods"];
  var userKey = clone["sheets"]["key"];
  var options = clone["sheets"]["options"];
  var optionalKey = {};
  var x_axis_cross_y = null;

  if (userKey.length > 1) {
    userKey.forEach(function (d) {
      optionalKey[d.keyName] = d.colour;
    });
  }

  function numberFormat(num) {
    if (num > 0) {
      if (num > 1000000000) {
        return num / 1000000000 + "bn";
      }

      if (num > 1000000) {
        return num / 1000000 + "m";
      }

      if (num > 1000) {
        return num / 1000 + "k";
      }

      if (num % 1 != 0) {
        return num.toFixed(2);
      } else {
        return num.toLocaleString();
      }
    }

    if (num < 0) {
      var posNum = num * -1;
      if (posNum > 1000000000) return ["-" + String(posNum / 1000000000) + "bn"];
      if (posNum > 1000000) return ["-" + String(posNum / 1000000) + "m"];
      if (posNum > 1000) return ["-" + String(posNum / 1000) + "k"];else {
        return num.toLocaleString();
      }
    }

    return num;
  }

  d3.select("#chartTitle").text(template[0].title);
  d3.select("#subTitle").text(template[0].subtitle);

  if (template[0].source != "") {
    d3.select("#sourceText").html(" | Source: " + template[0].source);
  }

  if (template[0].x_axis_cross_y != "") {
    x_axis_cross_y = +template[0].x_axis_cross_y;
    x_axis_cross_y = null;
  }

  d3.select("#footnote").html(template[0].footnote);
  var chartKey = d3.select("#chartKey");
  var isMobile;
  var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  if (windowWidth < 610) {
    isMobile = true;
  }

  if (windowWidth >= 610) {
    isMobile = false;
  }

  var containerWidth = document.querySelector("#graphicContainer").getBoundingClientRect().width;
  var height = containerWidth * 0.6;
  console.log("width", containerWidth, "height", height);
  var margin;

  if (template[0]["margin-top"]) {
    margin = {
      top: +template[0]["margin-top"],
      right: +template[0]["margin-right"],
      bottom: +template[0]["margin-bottom"],
      left: +template[0]["margin-left"]
    };
  } else {
    margin = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 40
    };
  }

  var lineLabelling = true;

  if (options.length > 0) {
    if (options[0]["lineLabelling"]) {
      if (options[0]["lineLabelling"] != "") {
        lineLabelling = options[0]["lineLabelling"] === true;
      }
    }
  }

  console.log(lineLabelling);
  var breaks = "yes";

  if (template[0]["breaks"]) {
    breaks = template[0]["breaks"];
  }

  var keys = Object.keys(data[0]);
  var xVar;

  if (template[0]["xColumn"]) {
    xVar = template[0]["xColumn"];
    keys.splice(keys.indexOf(xVar), 1);
  } else {
    xVar = keys[0];
    keys.splice(0, 1);
  } // console.log(xVar, keys)


  var colors = ["#4daacf", "#5db88b", "#a2b13e", "#8a6929", "#b05cc6", "#c8a466", "#c35f95", "#ce592e", "#d23d5e", "#d89a34", "#7277ca", "#527b39", "#59b74b", "#c76c65", "#8a6929"];
  var width = containerWidth - margin.left - margin.right,
      height = height - margin.top - margin.bottom;
  d3.select("#graphicContainer svg").remove();
  chartKey.html("");
  var svg = d3.select("#graphicContainer").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden");

  if (lineLabelling && !isMobile) {
    var longestKey = keys.sort(function (a, b) {
      return b.length - a.length;
    })[0];
    d3.select("#dummyText").remove();
    var dummyText = svg.append("text").attr("x", -50).attr("y", -50).attr("id", "dummyText").attr("class", "annotationText").text(longestKey);
    var keyLength = dummyText.node().getBBox().width;
    margin.right = margin.right + keyLength;
    console.log(margin.right, keyLength);
  }

  width = containerWidth - margin.left - margin.right;
  svg.attr("width", width + margin.left + margin.right);
  var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var x;

  if (typeof data[0][xVar] == "string") {
    x = d3.scaleTime().rangeRound([0, width]);
  } else {
    x = d3.scaleLinear().rangeRound([0, width]);
  }

  var y;

  if (template[0]["yScaleType"]) {
    y = d3[template[0]["yScaleType"]]().range([height, 0]).nice();
  } else {
    y = d3.scaleLinear().rangeRound([height, 0]);
  }

  var color = d3.scaleOrdinal().range(colors);
  var lineGenerators = {};
  var allValues = [];
  keys.forEach(function (key) {
    if (breaks === "yes") {
      lineGenerators[key] = d3.line().defined(function (d) {
        return d;
      }).x(function (d) {
        return x(d[xVar]);
      }).y(function (d) {
        return y(d[key]);
      });
    } else {
      lineGenerators[key] = d3.line().x(function (d) {
        return x(d[xVar]);
      }).y(function (d) {
        return y(d[key]);
      });
    }

    data.forEach(function (d) {
      if (typeof d[key] == "string") {
        if (d[key].includes(",")) {
          if (!isNaN(d[key].replace(/,/g, ""))) {
            d[key] = +d[key].replace(/,/g, "");
            allValues.push(d[key]);
          }
        } else if (d[key] != "") {
          if (!isNaN(d[key])) {
            d[key] = +d[key];
            allValues.push(d[key]);
          }
        } else if (d[key] == "") {
          d[key] = null;
        }
      } else {
        allValues.push(d[key]);
      }
    });
  }); // console.log(data)

  if (isMobile) {
    keys.forEach(function (key) {
      var keyDiv = chartKey.append("div").attr("class", "keyDiv");
      keyDiv.append("span").attr("class", "keyCircle").style("background-color", function () {
        if (optionalKey.hasOwnProperty(key)) {
          return optionalKey[key];
        } else {
          return color(key);
        }
      });
      keyDiv.append("span").attr("class", "keyText").text(key);
    });
  }

  var parseTime = d3.timeParse(template[0]["dateFormat"]);
  var parsePeriods = d3.timeParse(template[0]["periodDateFormat"]);
  data.forEach(function (d) {
    if (typeof d[xVar] == "string") {
      d[xVar] = parseTime(d[xVar]);
    }
  });
  var keyData = {};
  keys.forEach(function (key) {
    keyData[key] = [];
    data.forEach(function (d) {
      if (d[key] != null) {
        var newData = {};
        newData[xVar] = d[xVar];
        newData[key] = d[key];
        keyData[key].push(newData);
      } else {
        keyData[key].push(null);
      }
    });
  });
  labels.forEach(function (d) {
    if (typeof d.x == "string") {
      d.x = parseTime(d.x);
    }

    if (typeof d.y == "string") {
      d.y = +d.y;
    }

    if (typeof d.offset == "string") {
      d.offset = +d.offset;
    }
  });
  periods.forEach(function (d) {
    if (typeof d.start == "string") {
      d.start = parsePeriods(d.start);
      d.end = parsePeriods(d.end);
      d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2);
    }
  });
  var min;
  var max = d3.max(allValues);

  if (template[0]["baseline"] === "zero") {
    min = 0;
  } else {
    min = d3.min(allValues);
  }

  x.domain(d3.extent(data, function (d) {
    return d[xVar];
  }));
  y.domain([min, max]);
  var xAxis;
  var yAxis;

  if (isMobile) {
    xAxis = d3.axisBottom(x).ticks(5);
    yAxis = d3.axisLeft(y).tickFormat(function (d) {
      return numberFormat(d);
    }).ticks(3);
  } else {
    xAxis = d3.axisBottom(x);
    yAxis = d3.axisLeft(y).tickFormat(function (d) {
      return numberFormat(d);
    }).ticks(3);
  }

  d3.selectAll(".periodLine").remove();
  d3.selectAll(".periodLabel").remove();
  features.selectAll(".periodLine").data(periods).enter().append("line").attr("x1", function (d) {
    return x(d.start);
  }).attr("y1", 0).attr("x2", function (d) {
    return x(d.start);
  }).attr("y2", height).attr("class", "periodLine mobHide").attr("stroke", "#bdbdbd").attr("opacity", function (d) {
    if (d.start < x.domain()[0]) {
      return 0;
    } else {
      return 1;
    }
  }).attr("stroke-width", 1);
  features.selectAll(".periodLine").data(periods).enter().append("line").attr("x1", function (d) {
    return x(d.end);
  }).attr("y1", 0).attr("x2", function (d) {
    return x(d.end);
  }).attr("y2", height).attr("class", "periodLine mobHide").attr("stroke", "#bdbdbd").attr("opacity", function (d) {
    if (d.end > x.domain()[1]) {
      return 0;
    } else {
      return 1;
    }
  }).attr("stroke-width", 1);
  features.selectAll(".periodLabel").data(periods).enter().append("text").attr("x", function (d) {
    if (d.labelAlign == "middle") {
      return x(d.middle);
    } else if (d.labelAlign == "start") {
      return x(d.start) + 5;
    }
  }).attr("y", -5).attr("text-anchor", function (d) {
    return d.labelAlign;
  }).attr("class", "periodLabel mobHide").attr("opacity", 1).text(function (d) {
    return d.label;
  });
  features.append("g").attr("class", "x").attr("transform", function () {
    if (x_axis_cross_y != null) {
      return "translate(0," + y(x_axis_cross_y) + ")";
    } else {
      return "translate(0," + height + ")";
    }
  }).call(xAxis);
  features.append("g").attr("class", "y").call(yAxis);
  features.append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "0.71em").attr("fill", "#767676").attr("text-anchor", "end").text(template[0].yAxisLabel);
  features.append("text").attr("x", width).attr("y", height - 6).attr("fill", "#767676").attr("text-anchor", "end").text(template[0].xAxisLabel);
  d3.selectAll(".tick line").attr("stroke", "#767676");
  d3.selectAll(".tick text").attr("fill", "#767676");
  d3.selectAll(".domain").attr("stroke", "#767676");
  keys.forEach(function (key) {
    features.append("path").datum(keyData[key]).attr("fill", "none").attr("stroke", function (d) {
      if (optionalKey.hasOwnProperty(key)) {
        return optionalKey[key];
      } else {
        return color(key);
      }
    }).attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 1.5).attr("d", lineGenerators[key]);
    var tempLabelData = keyData[key].filter(function (d) {
      return d != null;
    });
    var end = tempLabelData.length - 1;
    features.append("circle").attr("cy", function (d) {
      return y(tempLabelData[tempLabelData.length - 1][key]);
    }).attr("fill", function (d) {
      if (optionalKey.hasOwnProperty(key)) {
        return optionalKey[key];
      } else {
        return color(key);
      }
    }).attr("cx", function (d) {
      return x(tempLabelData[tempLabelData.length - 1].index);
    }).attr("r", 4).style("opacity", 1);
    var lineLabelAlign = "start";
    var lineLabelOffset = 0; // if (x(tempLabelData[tempLabelData.length - 1].index) > width - 20) {
    //   lineLabelAlign = "end"
    //   lineLabelOffset = -10
    // }

    if (!isMobile) {
      features.append("text").attr("class", "annotationText").attr("y", function (d) {
        return y(tempLabelData[tempLabelData.length - 1][key]) + 4 + lineLabelOffset;
      }).attr("x", function (d) {
        return x(tempLabelData[tempLabelData.length - 1].index) + 5;
      }).style("opacity", 1).attr("text-anchor", lineLabelAlign).text(function (d) {
        return key;
      });
    }
  });

  function textPadding(d) {
    if (d.offset > 0) {
      return 12;
    } else {
      return -2;
    }
  }

  function textPaddingMobile(d) {
    if (d.offset > 0) {
      return 12;
    } else {
      return 4;
    }
  }

  features.selectAll(".annotationLine").data(labels).enter().append("line").attr("class", "annotationLine").attr("x1", function (d) {
    return x(d.x);
  }).attr("y1", function (d) {
    return y(d.y);
  }).attr("x2", function (d) {
    return x(d.x);
  }).attr("y2", function (d) {
    return y(d.offset);
  }).style("opacity", 1).attr("stroke", "#000");
  var footerAnnotations = d3.select("#footerAnnotations");
  footerAnnotations.html("");

  if (isMobile) {
    features.selectAll(".annotationCircles").data(labels).enter().append("circle").attr("class", "annotationCircle").attr("cy", function (d) {
      return y(d.offset) + textPadding(d) / 2;
    }).attr("cx", function (d) {
      return x(d.x);
    }).attr("r", 8).attr("fill", "#000");
    features.selectAll(".annotationTextMobile").data(labels).enter().append("text").attr("class", "annotationTextMobile").attr("y", function (d) {
      return y(d.offset) + textPaddingMobile(d);
    }).attr("x", function (d) {
      return x(d.x);
    }).style("text-anchor", "middle").style("opacity", 1).attr("fill", "#FFF").text(function (d, i) {
      return i + 1;
    });

    if (labels.length > 0) {
      footerAnnotations.append("span").attr("class", "annotationFooterHeader").text("Notes: ");
    }

    labels.forEach(function (d, i) {
      footerAnnotations.append("span").attr("class", "annotationFooterNumber").text(i + 1 + " - ");

      if (i < labels.length - 1) {
        footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text + ", ");
      } else {
        footerAnnotations.append("span").attr("class", "annotationFooterText").text(d.text);
      }
    });
  } else {
    features.selectAll(".annotationText").data(labels).enter().append("text").attr("class", "annotationText").attr("y", function (d) {
      return y(d.offset) + textPadding(d);
    }).attr("x", function (d) {
      return x(d.x);
    }).style("text-anchor", function (d) {
      return d.align;
    }).style("opacity", 1).text(function (d) {
      return d.text;
    });
  }
} // end init
;

exports["default"] = LineChart;
=======
"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof")),_classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck")),LineChart=function t(e){function n(t){if(t>0)return t>1e9?t/1e9+"bn":t>1e6?t/1e6+"m":t>1e3?t/1e3+"k":t%1!=0?t.toFixed(2):t.toLocaleString();if(t<0){var e=-1*t;return e>1e9?["-"+String(e/1e9)+"bn"]:e>1e6?["-"+String(e/1e6)+"m"]:e>1e3?["-"+String(e/1e3)+"k"]:t.toLocaleString()}return t}function r(t){return t.offset>0?12:-2}function a(t){return t.offset>0?12:4}(0,_classCallCheck2.default)(this,t),console.log(e);var o=JSON.parse(JSON.stringify(e)),i=o.sheets.data,l=o.sheets.template,s=o.sheets.labels,c=o.sheets.periods,u=o.sheets.key,d={},f=null;u.length>1&&u.forEach(function(t){d[t.keyName]=t.colour}),d3.select("#chartTitle").text(l[0].title),d3.select("#subTitle").text(l[0].subtitle),""!=l[0].source&&d3.select("#sourceText").html(" | Source: "+l[0].source),""!=l[0].x_axis_cross_y&&(f=+l[0].x_axis_cross_y,f=null),d3.select("#footnote").html(l[0].footnote);var p,x=d3.select("#chartKey"),h=Math.max(document.documentElement.clientWidth,window.innerWidth||0);h<610&&(p=!0),h>=610&&(p=!1);var g,y=document.querySelector("#graphicContainer").getBoundingClientRect().width,m=.6*y;g=l[0]["margin-top"]?{top:+l[0]["margin-top"],right:+l[0]["margin-right"],bottom:+l[0]["margin-bottom"],left:+l[0]["margin-left"]}:{top:0,right:0,bottom:20,left:40};var b="yes";l[0].breaks&&(b=l[0].breaks);var v=["#4daacf","#5db88b","#a2b13e","#8a6929","#b05cc6","#c8a466","#c35f95","#ce592e","#d23d5e","#d89a34","#7277ca","#527b39","#59b74b","#c76c65","#8a6929"];y=y-g.left-g.right,m=m-g.top-g.bottom,d3.select("#graphicContainer svg").remove(),x.html("");var k,L=d3.select("#graphicContainer").append("svg").attr("width",y+g.left+g.right).attr("height",m+g.top+g.bottom).attr("id","svg").attr("overflow","hidden"),A=L.append("g").attr("transform","translate("+g.left+","+g.top+")"),C=Object.keys(i[0]);l[0].xColumn?(k=l[0].xColumn,C.splice(C.indexOf(k),1)):(k=C[0],C.splice(0,1)),console.log(k,C);var T;T="string"==typeof i[0][k]?d3.scaleTime().rangeRound([0,y]):d3.scaleLinear().rangeRound([0,y]);var _;_=l[0].yScaleType?d3[l[0].yScaleType]().range([m,0]).nice():d3.scaleLinear().rangeRound([m,0]),console.log(_);var F=d3.scaleOrdinal().range(v),w={},E=[];C.forEach(function(t){w[t]="yes"===b?d3.line().defined(function(t){return t}).x(function(t){return T(t[k])}).y(function(e){return _(e[t])}):d3.line().x(function(t){return T(t[k])}).y(function(e){return _(e[t])}),i.forEach(function(e){"string"==typeof e[t]?e[t].includes(",")?isNaN(e[t].replace(/,/g,""))||(e[t]=+e[t].replace(/,/g,""),E.push(e[t])):""!=e[t]?isNaN(e[t])||(e[t]=+e[t],E.push(e[t])):""==e[t]&&(e[t]=null):E.push(e[t])})}),p&&C.forEach(function(t){var e=x.append("div").attr("class","keyDiv");e.append("span").attr("class","keyCircle").style("background-color",function(){return d.hasOwnProperty(t)?d[t]:F(t)}),e.append("span").attr("class","keyText").text(t)}),console.log(l[0].dateFormat);var S=d3.timeParse(l[0].dateFormat),N=d3.timeParse(l[0].periodDateFormat);i.forEach(function(t){console.log((0,_typeof2.default)(t[k])),"string"==typeof t[k]&&(t[k]=S(t[k]))});var O={};C.forEach(function(t){O[t]=[],i.forEach(function(e){if(null!=e[t]){var n={};n[k]=e[k],n[t]=e[t],O[t].push(n)}else O[t].push(null)})}),console.log(O),s.forEach(function(t){"string"==typeof t.x&&(t.x=S(t.x)),"string"==typeof t.y&&(t.y=+t.y),"string"==typeof t.offset&&(t.offset=+t.offset)}),c.forEach(function(t){"string"==typeof t.start&&(t.start=N(t.start),t.end=N(t.end),t.middle=new Date((t.start.getTime()+t.end.getTime())/2))}),console.log(c);var q;q="zero"===l[0].baseline?0:d3.min(E),T.domain(d3.extent(i,function(t){return t[k]})),_.domain([q,1e5]);var R,D;p?(R=d3.axisBottom(T).ticks(5),D=d3.axisLeft(_).tickFormat(function(t){return n(t)}).ticks(3)):(R=d3.axisBottom(T),D=d3.axisLeft(_).tickFormat(function(t){return n(t)}).ticks(3)),d3.selectAll(".periodLine").remove(),d3.selectAll(".periodLabel").remove(),A.selectAll(".periodLine").data(c).enter().append("line").attr("x1",function(t){return T(t.start)}).attr("y1",0).attr("x2",function(t){return T(t.start)}).attr("y2",m).attr("class","periodLine mobHide").attr("stroke","#bdbdbd").attr("opacity",function(t){return t.start<T.domain()[0]?0:1}).attr("stroke-width",1),A.selectAll(".periodLine").data(c).enter().append("line").attr("x1",function(t){return T(t.end)}).attr("y1",0).attr("x2",function(t){return T(t.end)}).attr("y2",m).attr("class","periodLine mobHide").attr("stroke","#bdbdbd").attr("opacity",function(t){return t.end>T.domain()[1]?0:1}).attr("stroke-width",1),A.selectAll(".periodLabel").data(c).enter().append("text").attr("x",function(t){return"middle"==t.labelAlign?T(t.middle):"start"==t.labelAlign?T(t.start)+5:void 0}).attr("y",-5).attr("text-anchor",function(t){return t.labelAlign}).attr("class","periodLabel mobHide").attr("opacity",1).text(function(t){return t.label}),A.append("g").attr("class","x").attr("transform",function(){return null!=f?(console.log(f),"translate(0,"+_(f)+")"):(console.log(m),"translate(0,"+m+")")}).call(R),A.append("g").attr("class","y").call(D),A.append("text").attr("transform","rotate(-90)").attr("y",6).attr("dy","0.71em").attr("fill","#767676").attr("text-anchor","end").text(l[0].yAxisLabel),A.append("text").attr("x",y).attr("y",m-6).attr("fill","#767676").attr("text-anchor","end").text(l[0].xAxisLabel),d3.selectAll(".tick line").attr("stroke","#767676"),d3.selectAll(".tick text").attr("fill","#767676"),d3.selectAll(".domain").attr("stroke","#767676"),C.forEach(function(t){console.log(O[t]),A.append("path").datum(O[t]).attr("fill","none").attr("stroke",function(e){return d.hasOwnProperty(t)?d[t]:F(t)}).attr("stroke-linejoin","round").attr("stroke-linecap","round").attr("stroke-width",1.5).attr("d",w[t]);var e=O[t].filter(function(t){return null!=t});console.log(e);e.length;console.log(e[e.length-1].index),A.append("circle").attr("cy",function(n){return _(e[e.length-1][t])}).attr("fill",function(e){return d.hasOwnProperty(t)?d[t]:F(t)}).attr("cx",function(t){return T(e[e.length-1].index)}).attr("r",4).style("opacity",1);var n="start",r=0;T(e[e.length-1].index)>y-20&&(n="end",r=-10),p||A.append("text").attr("class","annotationText").attr("y",function(n){return _(e[e.length-1][t])+4+r}).attr("x",function(t){return T(e[e.length-1].index)+5}).style("opacity",1).attr("text-anchor",n).text(function(e){return t})}),A.selectAll(".annotationLine").data(s).enter().append("line").attr("class","annotationLine").attr("x1",function(t){return T(t.x)}).attr("y1",function(t){return _(t.y)}).attr("x2",function(t){return T(t.x)}).attr("y2",function(t){return _(t.offset)}).style("opacity",1).attr("stroke","#000");var P=d3.select("#footerAnnotations");P.html(""),p?(A.selectAll(".annotationCircles").data(s).enter().append("circle").attr("class","annotationCircle").attr("cy",function(t){return _(t.offset)+r(t)/2}).attr("cx",function(t){return T(t.x)}).attr("r",8).attr("fill","#000"),A.selectAll(".annotationTextMobile").data(s).enter().append("text").attr("class","annotationTextMobile").attr("y",function(t){return _(t.offset)+a(t)}).attr("x",function(t){return T(t.x)}).style("text-anchor","middle").style("opacity",1).attr("fill","#FFF").text(function(t,e){return e+1}),console.log(s.length),s.length>0&&P.append("span").attr("class","annotationFooterHeader").text("Notes: "),s.forEach(function(t,e){P.append("span").attr("class","annotationFooterNumber").text(e+1+" - "),e<s.length-1?P.append("span").attr("class","annotationFooterText").text(t.text+", "):P.append("span").attr("class","annotationFooterText").text(t.text)})):A.selectAll(".annotationText").data(s).enter().append("text").attr("class","annotationText").attr("y",function(t){return _(t.offset)+r(t)}).attr("x",function(t){return T(t.x)}).style("text-anchor",function(t){return t.align}).style("opacity",1).text(function(t){return t.text})};exports.default=LineChart;
>>>>>>> 5d7cc43c8be5539e7f8a887b8d20324664e44d0d
