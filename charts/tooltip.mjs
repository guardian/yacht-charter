class Tooltip {
  /***
    Tooltip constructor
    
    - parentSelector: provide where the tooltip element is going to be appended
    - className (optional): provide additional css class names for more style control
  -------------*/
  constructor(parentSelector, className) {
    this.$el = d3
      .select(parentSelector)
      .append("div")
      .attr("class", `${className} tooltip`)
      .attr("width", "100px")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("opacity", 0)
  }

  /***
    Show tooltip. 
    
    - html: HTML string to display
    - containerWidth: width of area where hover events should trigger
    - pos (optional): {
        left: Number,
        top: Number,
        leftOffset: Number,
        topOffset: Number
      } - Provide overrides for left/top positions
  -------------*/
  show(html, containerWidth, pos) {
    this.$el.html(html)

    const tipWidth = this.$el.node().getBoundingClientRect().width
    const left = pos && pos.left ? pos.left : d3.event.pageX
    const top = pos && pos.top ? pos.top : d3.event.pageY
    const leftOffset = pos && pos.leftOffset ? pos.leftOffset : 0
    const topOffset = pos && pos.topOffset ? pos.topOffset : 0

    if (d3.event.pageX < containerWidth / 2) {
      this.$el.style("left", `${left + leftOffset + tipWidth / 2}px`)
    } else if (d3.event.pageX >= containerWidth / 2) {
      this.$el.style("left", `${left - tipWidth}px`)
    }

    this.$el.style("top", `${top + topOffset}px`)
    this.$el.transition().duration(200).style("opacity", 0.9)
  }

  /***
    Hide tooltip
  -------------*/
  hide() {
    this.$el.transition().duration(500).style("opacity", 0)
  }

  /***
    Bind events to target element. 
    
    - $bindEls: Elements that trigger the mouse events
    - containerWidth: width of area where hover events should trigger
    - templateRender: accepts function, string or number. Function to return the tooltip text.
      (Usually this passes in the data and the mustache template will render the output)
    - pos (optional): {
        left: Number,
        top: Number,
        leftOffset: Number,
        topOffset: Number
      } - Provide overrides for left/top positions
  -------------*/
  bindEvents($bindEls, containerWidth, templateRender, pos) {
    const self = this
    $bindEls
      .on("mouseover", function (d) {
        const html =
          typeof templateRender === "function"
            ? templateRender(d, this)
            : templateRender
        self.show(html, containerWidth, pos)
      })
      .on("mouseout", () => {
        this.hide()
      })
  }
}

export default Tooltip
