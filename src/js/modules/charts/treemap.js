import makeTooltip from "./tooltip"
import * as d3 from "d3"

export default class TreeMap {
  constructor(data, isMobile) {

    this.width = document.querySelector("#graphicContainer").getBoundingClientRect().width

    if (isMobile) {
      this.height = this.width * 1.23610097750
    } else {

      this.height = this.width * 0.61803398875
    }

    //clear old chart
    d3.select("#graphicContainer svg").remove()
    d3.select("#tooltip").remove()

    this.treemap = d3.treemap()
      .size([this.width, this.height])
      .padding(1)
      .round(true)

    const svg = d3.select("#graphicContainer")
      .append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])


    var root = this._constructStratifiedData(data)

    makeTooltip.prepareTooltip(d3)
    this._render(svg, root)
  }

  _constructStratifiedData(data) {

    //construct dummy Nodes for categories if they don't exist already
    let parentNodes = []
    let elementSet = new Set()

    data.forEach((datum) => {
      elementSet.add(datum.categoryName)
    })

    data.forEach((datum) => {
      if (!elementSet.has(datum.categoryParent)) {
        elementSet.add(datum.categoryParent)
        parentNodes.push({
          categoryName: datum.categoryParent,
          categoryParent: "root",
        })
      }
    })


    // insert a single root node and category nodes
    const dataWithRoot = [{
        categoryName: "root",
        categoryParent: "",
      },
      ...parentNodes,
      ...data
    ]

    let root = d3.stratify()
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

    return root
  }

  _render(svg, root) {
    // set state
    this.root = root
    this.treemap(root)
    var newData = root.leaves()
    console.log(newData)

    //set scale functions
    this.scaleX = d3.scaleLinear()
      .range([0, this.width])
      .domain([root.x0, root.x1])

    this.scaleY = d3.scaleLinear()
      .range([0, this.height])
      .domain([root.y0, root.y1])


    let leaves = svg.append("g")
      .attr("class", "parent")
      .selectAll("g")
      .data(newData)
      .enter()
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

    //let leaves = group


    leaves.append("title")
      .text(d => d.data.categoryName)

    leaves.append("rect")
      .attr("id", function (d) {
        return d.id
      })
      .attr("width", d => {
        if (d.id === "root") {
          return d.x1 - d.x0
        } else {
          return this.scaleX(d.x1) - this.scaleX(d.x0)
        }
      })
      .attr("height", d => {
        if (d.id === "root") {
          return d.y1 - d.y0
        } else {
          return this.scaleY(d.y1) - this.scaleY(d.y0)
        }
      })
      .attr("fill", function (d) {
        //default color if overrides are set incorrectly
        var color = "#bada55"
        // var node = d
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

        return color
      })

    leaves.select("rect")
      .attr("cursor", "pointer")
      .on("click", d => {
        this._zoomTo(d, svg)
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
        .getBoundingClientRect()
        .width
      let rectWidth = d3.select(this.parentNode)
        .select("rect")
        .node()
        .getBoundingClientRect()
        .width

      let textHeight = this.parentNode
        .getBoundingClientRect()
        .height
      let rectHeight = d3.select(this.parentNode)
        .select("rect")
        .node()
        .getBoundingClientRect()
        .height

      let tooltipData = newData.map(newDatum => {
        return {
          display: newDatum.categoryName,
          value: newDatum.categorySize
        }
      })

      makeTooltip.bindTooltip(leaves, tooltipData, d3, "$,d")

      if (textWidth > rectWidth || textHeight > rectHeight) {
        return 0
      } else {
        return 1
      }
    })
    return svg.select(".parent")
  }

  _wrap(text) {
    text.each(function () {
      console.log(this.parentNode)
      let rectWidth = d3.select(this.parentNode)
        .select("rect")
        .node()
        .getBoundingClientRect()
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
        if (tspan.node().getBoundingClientRect().width > rectWidth) {
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

  _zoomTo(newRootDatum, svg) {
    if (newRootDatum.id !== this.root.id) {
      var newRoot = newRootDatum

      while (newRoot.parent.id != this.root.parent.id) {
        newRoot = newRoot.parent
      }

      this._transition(newRoot, svg)
    }
  }

  _transition(d, g1) {
    if (this.transitioning || !d) return
    this.transitioning = true

    var g2 = this._render(d),
      t1 = g1.transition().duration(750),
      t2 = g2.transition().duration(750)

    // Update the domain only after entering new elements.
    this.scaleX.domain([d.x, d.x + d.dx])
    this.scaleY.domain([d.y, d.y + d.dy])

    // Enable anti-aliasing during the transition.
    //svg.style("shape-rendering", null)

    // // Draw child nodes on top of parent nodes.
    // svg.selectAll(".depth").sort(function (a, b) {
    //   return a.depth - b.depth
    // })

    // Fade-in entering text.
    g2.selectAll("text").style("fill-opacity", 0)

    // Transition to the new view.
    // t2.selectAll(".ptext").call(text).style("fill-opacity", 1)
    // t2.selectAll(".ctext").call(text2).style("fill-opacity", 1)
    t1.selectAll("rect")
    t2.selectAll("rect")
    // Remove the old node when the transition is finished.
    t1.remove().each("end", function () {
      //svg.style("shape-rendering", "crispEdges")
      this.transitioning = false
    })
  }
}