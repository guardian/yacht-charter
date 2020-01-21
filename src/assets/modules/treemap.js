export default class TreeMap {
  constructor(data, d3) {
    console.log(data)

    var width = 960,
      height = 500,
      color = "#bada55"

    var treemap = d3.treemap()
      .size([width, height])
      .padding(1)
      .round(true)

    console.log(data)

    // var svg = d3.select("#graphicContainer").append("svg")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .append("g")
    //   .attr("transform", "translate(-.5,-.5)")
    //todo move caption based on depth
    // like if y = 0 and x < width of parent caption
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif")

    var root = d3.stratify()
      .id(function (d) {
        return d.categoryName
      })
      .parentId(function (d) {
        return d.categoryParent
      })
      (data)
      .sum(function (d) {
        return d.size
      })
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value
      })

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)

    leaf.append("title")
      .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${d.value}`)

    treemap(root)

    var cell = svg.selectAll("a")
      .data(root.leaves())
      .enter().append("a")
      .attr("target", "_blank")
      .attr("xlink:href", function (d) {
        var p = d.data.path.split("/")
        return "https://github.com/" + p.slice(0, 2).join("/") + "/blob/v" + version[p[1]] + "/src/" + p.slice(2).join("/")
      })
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
      .attr("fill", function (d) {
        var a = d.ancestors()
        return color(a[a.length - 2].id)
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
        return d.data.path.substring(d.data.path.lastIndexOf("/") + 1, d.data.path.lastIndexOf("."))
      })

    label.append("tspan")
      .attr("x", 4)
      .attr("y", 25)
      .text(function (d) {
        return format(d.value)
      })

    cell.append("title")
      .text(function (d) {
        return d.id + "\n" + format(d.value)
      })
  }
}