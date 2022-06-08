class Dropdown {
  /***
    Dropdown constructor
    - append the dropdown options and create custom dropdown-change event
  -------------*/
  constructor(id, data) {
    const dispatch = d3.dispatch("dropdown-change")

    this.$el = d3.select(`#${id}`)

    this.$el
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("value", (d) => d.data)
      .text((d) => d.display)

    this.$el.on("change", function () {
      dispatch.call("dropdown-change", this, this.value)
    })

    return dispatch
  }
}

export default Dropdown
