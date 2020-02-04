import makeTooltip from "./tooltip"

export default class TreeMap {
  constructor(data, d3, isMobile) {

    this.width = document.querySelector("#graphicContainer").getBoundingClientRect().width

    if (isMobile) {
      this.height = this.width * 1.23610097750
    } else {

      this.height = this.width * 0.61803398875
    }

    //nuke old chart
    d3.select("#graphicContainer svg").remove()
    d3.select("#tooltip").remove()

    this.treemap = d3.treemap()
      .size([this.width, this.height])
      .padding(1)
      .round(true)

    const svg = d3.select("#graphicContainer")
      .append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])


    var root = _constructStratifiedData(data)

    this._render(svg, root, d3)
    makeTooltip("rect", root.leaves(), d3)
  }

  _constructStratifiedData(data) {
    // insert a single root node
    const dataWithRoot = [{
        categoryName: "root",
        categoryParent: "",
      },
      ...data
    ]

    d3.stratify()
      .id(function (d) {
        return d.categoryName
      })
      .parentId(function (d) {
        if (d.categoryName != "root") {
          // Point any node without a parent to our single root node needed for
          // the d3 treemap method.
          if (d.categoryParent == null || d.categoryParent == "") {
            return "root"
          } else {
            return d.categoryParent
          }
        } else {
          return null
        }
      })(dataWithRoot)
      .sum(function (d) {
        return d.categorySize
      })
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value
      })
    this.root = root
  }

  _render(svg, root, d3) {
    // set state
    this.root = root
    this.treemap(root)
    var newData = root.leaves()

    const group = svg.insert("g", "parent")
      .data(newData, d => {
        d.id
      })

    //set scale functions
    this.scaleX = d3.scaleLinear()
      .range([0, this.width])
      .domain([root.x0, root.x1])

    this.scaleY = d3.scaleLinear()
      .range([0, this.height])
      .domain([root.y0, root.y1])

    let leaves = group.enter()
      .append("g")
      .attr("transform", d => {
        console.log(d)
        if (d.id === "root") {
          return `translate(${d.x0},${d.y0})`
        } else {
          console.log("scaling")
          console.log(`translate(${this.scaleX(d.x0)},${this.scaleY(d.y0)})`)
          return `translate(${this.scaleX(d.x0)},${this.scaleY(d.y0)})`
        }
      })


    leaves.append("title")
      .text(d => d.data.categoryName)

    leaves.append("rect")
      .attr("id", function (d) {
        return d.id
      })
      .attr("width", d => {
        if (d.id === "root") {
          return this.width
        } else {
          return this.scaleX(d.x1) - this.scaleX(d.x0)
        }
      })
      .attr("height", d => {
        if (d.id === "root") {
          return 0
        } else {
          return this.scaleY(d.y1) - this.scaleY(d.y0)
        }
      })
      .attr("fill", function (d) {
        //default color if overrides are set incorrectly
        var color = "#bada55"
        var node = d
        if (node.data.categoryColorOverride == null ||
          node.data.categoryColorOverride == "") {

          while (node.parent != null &&
            node.data.categoryColorOverride == null ||
            node.data.categoryColorOverride == "") {
            // inherit parent category color
            color = node.parent.data.categoryColorOverride
            node = node.parent
          }

        } else {
          color = node.data.categoryColorOverride
        }

        return color
      })

    leaves.select("rect")
      .attr("cursor", "pointer")
      .on("click", d => {
        this._zoomTo(d, svg, d3)
      })

    leaves.enter().append("clipPath")
      .attr("id", function (d) {
        return "clip-" + d.id
      })
      .append("use")
      .attr("xlink:href", function (d) {
        return "#" + d.id
      })

    let label = leaves.append("text")
      .attr("id", function (d) {
        return "text-" + d.id
      })
      .attr("clip-path", function (d) {
        return "url(#clip-" + d.id + ")"
      })

    label
      .attr("x", 4)
      .attr("y", 13)
      .text(function (d) {
        return d.data.categoryName
      })

    this._wrap(label, d3)

    label.attr("opacity", function () {
      let textWidth = this.parentNode
        .getBBox()
        .width
      let rectWidth = d3.select(this.parentNode)
        .select("rect")
        .node()
        .getBBox()
        .width

      let textHeight = this.parentNode
        .getBBox()
        .height
      let rectHeight = d3.select(this.parentNode)
        .select("rect")
        .node()
        .getBBox()
        .height

      if (textWidth > rectWidth || textHeight > rectHeight) {
        return 0
      } else {
        return 1
      }
    })

    return group
  }

  _wrap(text, d3) {
    text.each(function () {
      let rectWidth = d3.select(this.parentNode)
        .select("rect")
        .node()
        .getBBox()
        .width - 8 // padding
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word = words.pop(),
        line = [],
        y = text.attr("y"),
        dy = 0,
        tspan = text.text(null).append("tspan").attr("x", 4).attr("y", y).attr("dy", dy + "em")

      var lineNumber = 0
      while (word != null) {
        const lineHeight = 1.1
        line.push(word)
        tspan.text(line.join(" "))
        if (tspan.node().getComputedTextLength() > rectWidth) {
          lineNumber += 1
          line.pop()
          tspan.text(line.join(" "))
          line = [word]
          tspan = text.append("tspan").attr("x", 4).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word)
        }
        word = words.pop()
      }
    })
  }

  _zoomTo(newRootDatum, svg, d3) {
    if (newRootDatum.id !== this.root.id) {
      var newRoot = newRootDatum

      while (newRoot.parent.id != this.root.id) {
        newRoot = newRoot.parent
      }

      this._render(svg, newRoot, d3)
    }
  }

  //   _transition(d) {
  //     if (transitioning || !d) return
  //     transitioning = true
  //
  //     var g2 = display(d),
  //       t1 = g1.transition().duration(750),
  //       t2 = g2.transition().duration(750)
  //
  //     // Update the domain only after entering new elements.
  //     x.domain([d.x, d.x + d.dx])
  //     y.domain([d.y, d.y + d.dy])
  //
  //     // Enable anti-aliasing during the transition.
  //     svg.style("shape-rendering", null)
  //
  //     // Draw child nodes on top of parent nodes.
  //     svg.selectAll(".depth").sort(function (a, b) {
  //       return a.depth - b.depth
  //     })
  //
  //     // Fade-in entering text.
  //     g2.selectAll("text").style("fill-opacity", 0)
  //
  //     // Transition to the new view.
  //     t1.selectAll(".ptext").call(text).style("fill-opacity", 0)
  //     t1.selectAll(".ctext").call(text2).style("fill-opacity", 0)
  //     t2.selectAll(".ptext").call(text).style("fill-opacity", 1)
  //     t2.selectAll(".ctext").call(text2).style("fill-opacity", 1)
  //     t1.selectAll("rect").call(rect)
  //     t2.selectAll("rect").call(rect)
  //     // Remove the old node when the transition is finished.
  //     t1.remove().each("end", function () {
  //       svg.style("shape-rendering", "crispEdges")
  //       transitioning = false
  //     })
  //   }
  //
  //   return g
  // }
}