export default class horizontalBar {
  constructor(results, d3) {
    const container = d3.select("#graphicContainer svg")
    container.remove()
    console.log(results)
    var data = results.sheets.data
    var details = results.sheets.template
    var labels = results.sheets.labels
    var userKey = results["sheets"]["key"]

    function numberFormat(num) {
      if (num > 0) {
        if (num > 1000000000) {
          return (num / 1000000000).toFixed(1) + "bn"
        }
        if (num > 1000000) {
          return (num / 1000000).toFixed(1) + "m"
        }
        if (num > 1000) {
          return (num / 1000).toFixed(1) + "k"
        }
        if (num % 1 != 0) {
          return num.toFixed(1)
        } else {
          return num.toLocaleString()
        }
      }
      if (num < 0) {
        var posNum = num * -1
        if (posNum > 1000000000) return ["-" + String((posNum / 1000000000)) + "bn"]
        if (posNum > 1000000) return ["-" + String((posNum / 1000000)) + "m"]
        if (posNum > 1000) return ["-" + String((posNum / 1000)) + "k"]
        else {
          return num.toLocaleString()
        }
      }
      return num
    }

    function axisFormat(num) {
      if (num > 0) {
        if (num > 1000000000) {
          return (num / 1000000000) + "bn"
        }
        if (num > 1000000) {
          return (num / 1000000) + "m"
        }
        if (num > 1000) {
          return (num / 1000) + "k"
        }
        if (num % 1 != 0) {
          return num.toFixed(1)
        } else {
          return num.toLocaleString()
        }
      }
      if (num < 0) {
        var posNum = num * -1
        if (posNum > 1000000000) return ["-" + String((posNum / 1000000000)) + "bn"]
        if (posNum > 1000000) return ["-" + String((posNum / 1000000)) + "m"]
        if (posNum > 1000) return ["-" + String((posNum / 1000)) + "k"]
        else {
          return num.toLocaleString()
        }
      }
      return num
    }

    var isMobile
    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

    if (windowWidth < 610) {
      isMobile = true
    }

    if (windowWidth >= 610) {
      isMobile = false
    }

    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    console.log(width)
    var height = data.length * 70
    var margin

    if (details[0]["margin-top"]) {
      margin = {
        top: +details[0]["margin-top"],
        right: +details[0]["margin-right"],
        bottom: +details[0]["margin-bottom"],
        left: +details[0]["margin-left"]
      }
    } else {
      margin = {
        top: 0,
        right: 0,
        bottom: 20,
        left: 40
      }
    }

    width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom

    d3.select("#chartTitle").text(details[0].title)
    d3.select("#subTitle").text(details[0].subtitle)
    d3.select("#sourceText").html(details[0].source)
    d3.select("#footnote").html(details[0].footnote)
    d3.select("#graphicContainer svg").remove()
    var chartKey = d3.select("#chartKey")
    chartKey.html("")

    var svg = d3.select("#graphicContainer").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "svg")
      .attr("overflow", "hidden")

    var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var keys = Object.keys(data[0])

    var xVar
    var yVar

    if (details[0]["yColumn"]) {
      yVar = details[0]["yColumn"]
      // keys.splice(keys.indexOf(yVar), 1);
    } else {
      yVar = keys[0]
      // keys.splice(0, 1);
    }

    if (details[0]["xColumn"]) {
      xVar = details[0]["xColumn"]
      // keys.splice(keys.indexOf(xVar), 1);
    } else {
      xVar = keys[1]
      // keys.splice(0, 1);
    }

    // Check first entry and see if it looks like a string. True if string, false if number or number as string

    var yNaN = isNaN(data[0][yVar])

    console.log(yVar, keys)

    data.forEach(function (d) {
      if (typeof d[yVar] == "string" && !yNaN) {
        d[yVar] = +d[yVar]
      }

      d[xVar] = +d[xVar]

    })

    labels.forEach(function (d) {
      d.x = +d.x
      d.y = +d.y
      d.y2 = +d.y2
    })

    console.log(data)

    userKey.forEach(function (key, i) {

      var keyDiv = chartKey.append("div")
        .attr("class", "keyDiv")

      keyDiv.append("span")
        .attr("class", "keyCircle")
        .style("background-color", function () {
          return key.colour
        })

      keyDiv.append("span")
        .attr("class", "keyText")
        .text(key.key)

    })

    var x = d3.scaleLinear().range([0, width])
    var y = d3.scaleBand().range([0, height]).paddingInner(0.3).paddingOuter(0.3)

    y.domain(data.map(function (d) {
      return d[yVar]
    }))
    x.domain(d3.extent(data, function (d) {
      return d[xVar]
    })).nice()

    var xAxis
    var yAxis

    yAxis = d3.axisLeft(y)
    xAxis = d3.axisBottom(x).tickFormat(function (d) {
      return axisFormat(d)
    })

    features.append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    features.append("g")
      .attr("class", "y")
      .call(yAxis)

    features.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .style("fill", function (d) {
        return d.Color
      })
      .attr("y", function (d) {
        return y(d[yVar])
        // return y(d[keys[0]])
      })
      .attr("width", function (d) {
        return x(d[xVar])
      })
      .attr("height", y.bandwidth())

    features.selectAll(".barText")
      .data(data)
      .enter().append("text")
      .attr("class", "barText")
      .attr("x", 5)
      .attr("y", function (d) {
        return y(d[yVar]) - 5
      })
      .text(d => d[yVar])

    features.selectAll(".barNumber")
      .data(data)
      .enter().append("text")
      .attr("class", "barNumber")
      .attr("x", function (d) {
        if (x(d[xVar]) > 50) {
          return x(d[xVar]) - 50
        } else {
          return x(d[xVar]) + 5
        }

      })
      .style("fill", function (d) {
        if (x(d[xVar]) > 50) {
          return "#FFF"
        } else {
          return "#000"
        }

      })
      .attr("y", d => y(d[yVar]) + (y.bandwidth() / 2 + 5))
      .text(d => numberFormat(d[xVar]))

    d3.selectAll(".y .tick").remove()

    function textPadding(d) {
      if (d.y2 > 0) {
        return 12
      } else {
        return -2
      }
    }

    function textPaddingMobile(d) {
      if (d.y2 > 0) {
        return 12
      } else {
        return 4
      }
    }

    features.selectAll(".annotationLine")
      .data(labels)
      .enter().append("line")
      .attr("class", "annotationLine")
      .attr("x1", function (d) {
        return x(d.x) + x.bandwidth() / 2
      })
      .attr("y1", function (d) {
        return y(d.y)
      })
      .attr("x2", function (d) {
        return x(d.x) + x.bandwidth() / 2
      })
      .attr("y2", function (d) {
        return y(d.y2)
      })
      .style("opacity", 1)
      .attr("stroke", "#000")

    var footerAnnotations = d3.select("#footerAnnotations")

    footerAnnotations.html("")

    if (isMobile) {

      features.selectAll(".annotationCircles")
        .data(labels)
        .enter().append("circle")
        .attr("class", "annotationCircle")
        .attr("cy", function (d) {
          return y(d.y2) + textPadding(d) / 2
        })
        .attr("cx", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .attr("r", 8)
        .attr("fill", "#000")

      features.selectAll(".annotationTextMobile")
        .data(labels)
        .enter().append("text")
        .attr("class", "annotationTextMobile")
        .attr("y", function (d) {
          return y(d.y2) + textPaddingMobile(d)
        })
        .attr("x", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .style("text-anchor", "middle")
        .style("opacity", 1)
        .attr("fill", "#FFF")
        .text(function (d, i) {
          return i + 1
        })
      console.log(labels.length)

      if (labels.length > 0) {
        footerAnnotations.append("span")
          .attr("class", "annotationFooterHeader")
          .text("Notes: ")
      }



      labels.forEach(function (d, i) {

        footerAnnotations.append("span")
          .attr("class", "annotationFooterNumber")
          .text(i + 1 + " - ")

        if (i < labels.length - 1) {
          footerAnnotations.append("span")
            .attr("class", "annotationFooterText")
            .text(d.text + ", ")
        } else {
          footerAnnotations.append("span")
            .attr("class", "annotationFooterText")
            .text(d.text)
        }



      })

    } else {

      features.selectAll(".annotationText")
        .data(labels)
        .enter().append("text")
        .attr("class", "annotationText")
        .attr("y", function (d) {
          return y(d.y2)
        })
        .attr("x", function (d) {
          return x(d.x) + x.bandwidth() / 2
        })
        .style("text-anchor", function (d) {
          return d.align
        })
        .style("opacity", 1)
        .text(function (d) {
          return d.text
        })

    }

    // var button = document.getElementById("button2")
    // var wrapper = document.getElementById("outer-wrapper")
    // var gradient = document.getElementById("gradientBar")
    //
    // button.addEventListener("click", toggleButton)
    //
    // function toggleButton() {
    //   wrapper.classList.toggle("min")
    //   gradient.classList.toggle("gradient")
    //   button.querySelectorAll(".is-on")[0].classList.toggle("hide")
    //   button.querySelectorAll(".is-off")[0].classList.toggle("hide")
    // }

    // const fnmap = {
    //   'toggle': 'toggle',
    //     'show': 'add',
    //     'hide': 'remove'
    // };

    // const collapse = (selector, cmd) => {
    //   const targets = Array.from(document.querySelectorAll(selector));
    //   console.log("targets",targets)
    //   targets.forEach(target => {
    //     target.classList[fnmap[cmd]]('show');
    //   });
    // }

    // // Grab all the trigger elements on the page
    // const triggers = Array.from(document.querySelectorAll('[data-toggle="collapse1"]'));
    // // Listen for click events, but only on our triggers
    // window.addEventListener('click', (ev) => {
    // console.log("triggered")
    //   const elm = ev.target;
    //   console.log(elm)
    //   if (triggers.includes(elm)) {
    //     const selector = elm.getAttribute('data-target');
    //     console.log(selector)
    //     collapse(selector, 'toggle');
    //     elm.querySelectorAll('.is-on')[0].classList.toggle("hide");
    //     elm.querySelectorAll('.is-off')[0].classList.toggle("hide");

    //   }
    // }, false);
    // end init
  }
}