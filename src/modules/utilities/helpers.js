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
  
  nicerdate: function(value='Date') {
    return new Date(this.data['Date']).toDateString()
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

// Was this...
// "<strong>{{#nicerdate}}{{data.Date}}{{/nicerdate}}</strong><br><strong>{{group}}</strong>: {{groupValue}}"

// Should be this
// "<strong>{{#nicerdate}}Date{{/nicerdate}}</strong><br><strong>{{group}}</strong>: {{groupValue}}"

export default helpers