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
  
<<<<<<< HEAD
  nicerdate: function(value='Date') {
    return new Date(this.data['Date']).toDateString()
=======
  nicerdate: function(value, render) {
    var date = new Date(render(value));
    console.log(date)
    // var xVar = Object.keys(this.data[0])[0]
    // return moment(this.data[xVar]).format('MMM D')
>>>>>>> 0691d842c11bc5737e36ae40d0379fc496a6b08d
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