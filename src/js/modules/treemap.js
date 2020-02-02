import tooltips from "./tooltip"

export default class TreeMap {
  constructor(data, d3, isMobile) {

    this.width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    //golden ratio
    if (isMobile) {
      this.height = this.width * 1.2
    } else {
      this.height = this.width * 0.61803398875
    }

    //nuke old chart
    d3.select("#graphicContainer svg").remove()
    d3.select("#tooltip").remove()

    let alpScale = d3.scale.linear()
      .domain([0, 6000000])
      .range(["#e57373", "#ef5350"])

    let libScale = d3.scale.linear()
      .domain([0, 7000000])
      .range(["#81d4fa", "#03a9f4"])

    let natScale = d3.scale.linear()
      .domain([0, 4000000])
      .range(["#80cbc4", "#26a69a"])

    let greenScale = d3.scale.linear()
      .domain([0, 4000000])
      .range(["#aed581", "#33691e"])

    let otherScale = d3.scale.linear()
      .domain([0, 4000000])
      .range(["rgb(203,201,226)", "rgb(84,39,143)"])

    let keyedData = data.map(d => {
      d.key = d.categoryName.replace(/[()#. ]/g, "")
      d.display = d.categoryName
      d.value = +d.categorySize



      switch (d.categoryParent) {
      case ("Australian Labor Party"):
        d.colorScale = alpScale
        break
      case ("Liberal Party of Australia"):
        d.colorScale = libScale
        break
      case ("Australian Greens"):
        d.colorScale = greenScale
        break
      case ("National Party of Australia"):
        d.colorScale = natScale
        break
      case ("Other"):
        d.colorScale = otherScale
        break
      default:
        d.colorScale = otherScale
        break
      }

      return d
    })

    let categoryMap = d3.nest()
      .key(function (d) {
        return d.categoryParent
      }).entries(keyedData)
    categoryMap = categoryMap
      .map(d => {
        d.display = d.values[0].categoryParent
        d.colorScale = d.values[0].colorScale
        return d
      })

    for (const category in categoryMap) {
      categoryMap[category].values = d3.nest()
        .key(function (d) {
          return d.donationBranch.replace(/[()#. ]/g, "")
        }).entries(categoryMap[category].values)
      categoryMap[category].values = categoryMap[category].values
        .map(d => {
          d.display = d.values[0].donationBranch
          d.colorScale = d.values[0].colorScale
          return d
        })
    }

    tooltips.prepareTooltip(d3)
    this._main(categoryMap, d3)


  }

  _main(data, d3) {
    var opts = {
      margin: {
        top: 24,
        right: 0,
        bottom: 0,
        left: 0
      },
      rootname: "TOP",
      format: "$,d",
      title: "",
    }
    var root,
      formatNumber = d3.format(opts.format),
      rname = opts.rootname,
      margin = opts.margin,
      theight = 36 + 16

    // d3.slect("#graphicContainer").width(opts.width).height(opts.height)
    var width = this.width - margin.left - margin.right,
      height = this.height - margin.top - margin.bottom - theight,
      transitioning

    var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width])

    var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height])

    var treemap = d3.layout.treemap()
      .children(function (d, depth) {
        return depth ? null : d._children
      })
      .sort(function (a, b) {
        return a.value - b.value
      })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false)

    var svg = d3.select("#graphicContainer").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges")

    var grandparent = svg.append("g")
      .attr("class", "grandparent")

    grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top)

    grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em")

    if (data instanceof Array) {
      root = {
        key: rname,
        values: data,
        display: "Total Donations"
      }
    } else {
      root = data
    }

    initialize(root)
    accumulate(root)
    layout(root)
    display(root)
    // tooltips.bindTooltip(".children", root._children, d3)

    if (window.parent !== window) {
      var myheight = document.documentElement.scrollHeight || document.body.scrollHeight
      window.parent.postMessage({
        height: myheight
      }, "*")
    }

    function initialize(root) {
      root.x = root.y = 0
      root.dx = width
      root.dy = height
      root.depth = 0
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
      return (d._children = d.values) ?
        d.value = d.values.reduce(function (p, v) {
          return p + accumulate(v)
        }, 0) :
        d.value
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d._children) {
        treemap.nodes({
          _children: d._children
        })
        d._children.forEach(function (c) {
          c.x = d.x + c.x * d.dx
          c.y = d.y + c.y * d.dy
          c.dx *= d.dx
          c.dy *= d.dy
          c.parent = d
          layout(c)
        })
      }
    }

    function display(d) {
      grandparent
        .datum(d.parent)
        .on("click", transition)
        .select("text")
        .text(name(d))

      var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth")

      var g = g1.selectAll("g")
        .data(d._children)
        .enter().append("g")

      g.filter(function (d) {
          return d._children
        })
        .classed("children", true)
        .on("click", transition)

      var children = g.selectAll(".child")
        .data(function (d) {
          return d._children || [d]
        })
        .enter().append("g")

      children.append("rect")
        .attr("class", "child")
        .call(rect)

      children.append("text")
        .attr("class", "ctext")
        .text(function (d) {
          return d.display
        })
        .call(text2)

      g.append("rect")
        .attr("class", "parent")
        .call(rect)

      var t = g.append("text")
        .attr("class", "ptext")
        .attr("dy", ".75em")

      t.append("tspan")
        .text(function (d) {
          return d.display
        })
      t.append("tspan")
        .attr("dy", "1.0em")
        .text(function (d) {
          return formatNumber(d.value)
        })
      t.call(text)

      g.selectAll("rect")
        .style("fill", function (d) {
          return d.colorScale(d.value)
        })

      if (d._children) {
        tooltips.bindTooltip(children, d._children, d3)
      }



      function transition(d) {
        if (transitioning || !d) return
        transitioning = true

        var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750)

        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx])
        y.domain([d.y, d.y + d.dy])

        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null)

        // Draw child nodes on top of parent nodes.
        svg.selectAll(".depth").sort(function (a, b) {
          return a.depth - b.depth
        })

        // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0)

        // Transition to the new view.
        t1.selectAll(".ptext").call(text).style("fill-opacity", 0)
        t1.selectAll(".ctext").call(text2).style("fill-opacity", 0)
        t2.selectAll(".ptext").call(text).style("fill-opacity", 1)
        t2.selectAll(".ctext").call(text2).style("fill-opacity", 1)
        t1.selectAll("rect").call(rect)
        t2.selectAll("rect").call(rect)
        // Remove the old node when the transition is finished.
        t1.remove().each("end", function () {
          svg.style("shape-rendering", "crispEdges")
          transitioning = false
        })
      }

      return g
    }

    function text(text) {
      text.selectAll("tspan")
        .attr("x", function (d) {
          return x(d.x) + 6
        })
      text.attr("x", function (d) {
          return x(d.x) + 6
        })
        .attr("y", function (d) {
          return y(d.y) + 6
        })
        .style("opacity", function (d) {
          return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0
        })
    }

    function text2(text) {
      text.attr("x", function (d) {
          return x(d.x + d.dx) - this.getComputedTextLength() - 6
        })
        .attr("y", function (d) {
          return y(d.y + d.dy) - 6
        })
        .style("opacity", function (d) {
          return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0
        })
    }

    function rect(rect) {
      rect.attr("x", function (d) {
          return x(d.x)
        })
        .attr("y", function (d) {
          return y(d.y)
        })
        .attr("width", function (d) {
          return x(d.x + d.dx) - x(d.x)
        })
        .attr("height", function (d) {
          return y(d.y + d.dy) - y(d.y)
        })
    }

    function name(d) {
      return d.parent ?
        name(d.parent) + " / " + d.display + " " + formatNumber(d.value) + "" :
        d.display + " " + formatNumber(d.value) + ""
    }
  }
}