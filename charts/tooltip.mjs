class Tooltip {
  constructor($body) {
    this.$el = $body
      .append("div")
      .attr("class", "tooltip")
      .attr("width", "100px")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("opacity", 0)
  }

  show(text, containerWidth) {
    this.$el.html(text)
    const tipWidth = this.$el.node().getBoundingClientRect().width

    if (d3.event.pageX < containerWidth / 2) {
      this.$el.style("left", d3.event.pageX + tipWidth / 2 + "px")
    } else if (d3.event.pageX >= containerWidth / 2) {
      this.$el.style("left", d3.event.pageX - tipWidth + "px")
    }

    this.$el.style("top", d3.event.pageY + "px")
    this.$el.transition().duration(200).style("opacity", 0.9)
  }

  hide() {
    this.$el.transition().duration(500).style("opacity", 0)
  }

  /***
    Bind events to target element. 
    - $bindEl: Element to trigger the mouse events
    - containerWidth: width of area where hover events should trigger
    - templateRender: function to return the tooltip text.
      (Usually this passes in the data and the mustache template will render the output)
  -------------*/
  bindEvents($bindEl, containerWidth, templateRender) {
    const self = this
    $bindEl
      .on("mouseover", function (d) {
        self.show(templateRender(d), containerWidth)
      })
      .on("mouseout", () => {
        this.hide()
      })
  }
}

export default Tooltip
