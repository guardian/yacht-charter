class Tooltip {
  /***
    Tooltip constructor
    
    - parentSelector: provide where the tooltip element is going to be appended
    - className (optional): provide additional css class names for more style control
  -------------*/
  constructor(parentSelector, className = "") {
    this.$el = d3
      .select(parentSelector)
      .append("div")
      .attr("class", `${className} tooltip`)
      .attr("width", "100px")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("opacity", 0)

    this.parentOffset = d3
      .select(parentSelector)
      .node()
      .getBoundingClientRect().top
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
  show(html, containerWidth, containerHeight, pos) {
    this.$el.html(html)

    const tipWidth = this.$el.node().getBoundingClientRect().width
    const tipHeight = this.$el.node().getBoundingClientRect().height
    const left = pos && pos.left ? pos.left : d3.pointer(event)[0]
    const top = pos && pos.top ? pos.top : d3.pointer(event)[1] - this.parentOffset
    const leftOffset = pos && pos.leftOffset ? pos.leftOffset : 0
    const topOffset = pos && pos.topOffset ? pos.topOffset : 0

    // console.log(tipHeight)
    // console.log("containerWidth:", containerWidth, "containerHeight:", containerHeight, "pageX", d3.event.pageX, "pageY", d3.event.pageY, "top", top, "parentOffset", this.parentOffset)

    if (d3.pointer(event)[0] < containerWidth / 2) {
      this.$el.style("left", `${d3.pointer(event)[0] + tipWidth/2 + 10}px`)
    } else if (d3.pointer(event)[0] >= containerWidth / 2) {
      this.$el.style("left", `${left - tipWidth - 10}px`)
    }

    // this.$el.style("top", `${top + topOffset}px`)

    if (top < containerHeight - tipHeight) {
      this.$el.style("top", `${top + topOffset}px`)
    } else if (top >= containerHeight - tipHeight) {
      this.$el.style("top", `${top + topOffset - tipHeight}px`)
    }

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
  bindEvents($bindEls, containerWidth, containerHeight, templateRender, pos) {
    const self = this
    $bindEls
      .on("mouseover", function (d) {
        // console.log(d)
        const html =
          typeof templateRender === "function"
            ? templateRender(d, this)
            : templateRender
        self.show(html, containerWidth, containerHeight, pos)
      })
      .on("mouseout", () => {
        this.hide()
      })
  }
}

export default Tooltip
