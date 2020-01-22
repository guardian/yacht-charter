export default class TreeMap {
  constructor(data, d3) {

    var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
    var height = width * 0.5
    var color = "#bada55"

    var treemap = d3.treemap()
      .size([width, height])
      .padding(1)
      .round(true)

    const svg = d3.select("#graphicContainer")
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif")

    var root = d3.stratify()
      .id(function (d) {
        return d.categoryName
      })
      .parentId(function (d) {
        return d.categoryParent
      })(data)
      .sum(function (d) {
        return d.categorySize
      })
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value
      })

    treemap(root)

    console.log(root.leaves())

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", function (d) {
        return "translate(" + d.x0 + "," + d.y0 + ")"
      })

    leaf.append("title")
      .text(d => d.data.categoryName)

    var cell = svg.selectAll("a")
      .data(root.leaves())
      .enter().append("a")
      .attr("target", "_blank")
      .attr("transform", function (d) {
        return "translate(" + d.x0 + "," + d.y0 + ")"
      })

    cell.append("rect")
      .attr("id", function (d) {
        return d.id
      })
      .attr("width", function (d) {
        return d.x1 - d.x0
      })
      .attr("height", function (d) {
        return d.y1 - d.y0
      })
      .attr("fill", function () {
        return color
      })

    cell.append("clipPath")
      .attr("id", function (d) {
        return "clip-" + d.id
      })
      .append("use")
      .attr("xlink:href", function (d) {
        return "#" + d.id
      })

    var label = cell.append("text")
      .attr("clip-path", function (d) {
        return "url(#clip-" + d.id + ")"
      })

    label.append("tspan")
      .attr("x", 4)
      .attr("y", 13)
      .text(function (d) {
        return d.id
      })

    label.append("tspan")
      .attr("x", 4)
      .attr("y", 25)
      .text(function (d) {
        return d.value
      })

    // cell.append("title")
    //   .text(function (d) {
    //     return d.id
    //   })
  }
}