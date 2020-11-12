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
  }

}

export default helpers