import moment from "moment"

var helpers = {

  decimals: function(items) {
    var nums = items.split(",")
    return parseFloat(this[nums[0]]).toFixed(nums[1]);
  },

  nicedate: function(dte) {
    console.log(dte)
    var chuncks = this[dte]
    return moment(chuncks).format('MMM D')
  },
  
  nicerdate: function(value, render) {
    var date = new Date(render(value));
    console.log(date)
    // var xVar = Object.keys(this.data[0])[0]
    // return moment(this.data[xVar]).format('MMM D')
  },

  // format date as month day (i.e. Jan 30)
  // - value should be a valid date string
  formatDate: function (value, render) {
    var date = new Date(render(value));
    return moment(date).format("MMM D");
  },

  // In future, make helper functions do specific date formats, and name accordingly

  dateYear: function (value, render) {
    var date = new Date(render(value));
    return moment(date).format("Y");
  },

  roundZero: function (value, render) {
    return Math.round(render(value));
  }

}

export default helpers