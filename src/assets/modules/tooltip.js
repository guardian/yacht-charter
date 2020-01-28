export default function makeTooltip(el, data, d3) {
  let els = d3.selectAll(el)
    .data(data)

  let rootBoundingRect = document.querySelector("#graphicContainer")
    .getBoundingClientRect()
  let width = rootBoundingRect.width
  let tooltip = d3.select("#graphicContainer").append("div")
    .attr("class", "tooltip")
    .attr("width", "100px")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("opacity", 0)

  els.on("mouseover", function (d) {
    let text = `<b>${d.id}</b>`
    tooltip.transition()
      .duration(200)
      .style("opacity", .9)

    tooltip.html(text)

    console.log(this)
    let boundingRect = this.getBoundingClientRect()
    console.log(boundingRect)
    let xCoordinate = (boundingRect.left - rootBoundingRect.left)
    let yCoordinate = (boundingRect.top - rootBoundingRect.top + 20)
    let half = width / 2

    console.log(xCoordinate)
    console.log(yCoordinate)

    if (xCoordinate < half) {
      tooltip.style("left", (xCoordinate + 50) + "px")
    } else {
      tooltip.style("left", (xCoordinate - 50) + "px")
    }

    // tooltip.style("left", (d3.mouse(this)[0] + tipWidth/2) + "px");
    tooltip.style("top", (yCoordinate) + "px")

  })

  els.on("mouseout", function () {

    tooltip.transition()
      .duration(500)
      .style("opacity", 0)

  })
}