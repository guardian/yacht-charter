import moment from "moment"

var helpers = {

  decimals: function(items) {
    var nums = items.split(",")
    return parseFloat(this[nums[0]]).toFixed(nums[1]);
  },

  nicerdate: function(value='Date', render) {
    return new Date(this[render(value)]).toDateString()
  },

  formatDate: function (values="Date,MMM D 'YY", render) {
    let value = values.split(",")
    let date = new Date(this[render(value[0])])
    let format = (value[1]) ? value[1] : "MMM D 'YY"
    return moment(date).format(format);
  },

  roundZero: function (value, render) {
    return Math.round(render(value));
  }

}

export default helpers