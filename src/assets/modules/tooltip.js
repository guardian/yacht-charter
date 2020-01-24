export default function makeTooltip(el, data, d3) {
  let els = d3.selectAll(el)
    .data(data)

  let width = document.querySelector("#graphicContainer").getBoundingClientRect().width
  let tooltip = d3.select("#graphicContainer").append("div")
    .attr("class", "tooltip")
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
    let tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width

    // console.log(tipHeight)
    let boundingRect = this.getBoundingClientRect()
    console.log(boundingRect)
    let xCoordinate = boundingRect.x + window.pageXOffset
    let yCoordinate = boundingRect.y + window.pageYOffset
    let half = width / 2

    console.log(xCoordinate)
    console.log(yCoordinate)

    if (xCoordinate < half) {
      tooltip.style("left", (xCoordinate + tipWidth / 2) + "px")
    } else {
      tooltip.style("left", (xCoordinate - tipWidth / 2) + "px")
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