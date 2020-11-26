import moment from "moment"

var helpers = {

  decimals: function(items) {
    var nums = items.split(",")
    return parseFloat(this[nums[0]]).toFixed(nums[1]);
  },

  nicedate: function(dte) {
    var chuncks = this[dte]
    return moment(chuncks).format('MMM D')
  },
  
  nicerdate: function() {
    return moment(this.data.index).format('MMM D')
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
  }

}

export default helpers