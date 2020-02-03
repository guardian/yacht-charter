const tooltips = {
  prepareTooltip(d3) {
    d3.select("#graphicContainer").append("div")
      .attr("class", "tooltip")
      .attr("width", "100px")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("opacity", 0)
  },

  bindTooltip(els, data, d3, formatNumber) {
    let rootBoundingRect = document.querySelector("#graphicContainer")
      .getBoundingClientRect()
    let width = rootBoundingRect.width

    // console.log(data)

    let tooltip = d3.select("#tooltip")

    els.on("mouseover", function (d) {
      let text = `<b>${d.display + " " + formatNumber(d.value)}</b>`
      console.log(text)
      tooltip.transition()
        .duration(200)
        .style("opacity", .9)

      tooltip.html(text)

      let boundingRect = this.getBoundingClientRect()

      let xCoordinate = (boundingRect.left - rootBoundingRect.left)
      let yCoordinate = (boundingRect.top - rootBoundingRect.top + 20)
      let half = width / 2

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
}

export default tooltips