

    var yMax = (this.showGroupMax) ? data : data.filter( item => item.State === key[index]) ;

    x.domain(data.map(function (d) {
      return d.Date
    }))

    y.domain(d3.extent(yMax, function (d) {
      return d.Cases
    })).nice()

    var xAxis
    var yAxis

    var tickMod = Math.round(x.domain().length / 3)
    var ticks = x.domain().filter(function (d, i) {
      return !(i % tickMod) || i === x.domain().length - 1
    })
    xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%d %b"))
    yAxis = d3.axisLeft(y).tickFormat(function (d) {
      return d
    }).ticks(5)

    features.append("g")
      .attr("class", "x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

    features.append("g")
      .attr("class", "y")
      .call(yAxis)

    features.selectAll(".bar")
      .data(data.filter(d => {
        return d.State === key[index]
      }))
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.Date)
      })
      .style("fill", function () {
        return "rgb(204, 10, 17)"
      })
      .attr("y", function (d) {
        return y(Math.max(d.Cases, 0))
        // return y(d[keys[0]])
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return Math.abs(y(d.Cases) - y(0))
      })
      .on("mouseover", function (d) {

        if (tooltip) {

          var text = self.mustache(self.template, {...self.utilities, ...d})

          self.tooltip.html(text)

          var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width

          if (d3.event.pageX < (width / 2)) {

            self.tooltip.style("left", (d3.event.pageX + tipWidth / 2) + "px")

          } else if (d3.event.pageX >= (width / 2)) {

            self.tooltip.style("left", (d3.event.pageX - tipWidth) + "px")

          }

          self.tooltip.style("top", (d3.event.pageY) + "px")

          self.tooltip.transition().duration(200).style("opacity", .9)

        }



    })
    .on("mouseout", function () {

      if (tooltip) {

        self.tooltip.transition().duration(500).style("opacity", 0)

      }

    })