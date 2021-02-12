    const formatedNumber = function() {
      //var formated = (this.format[0]==="") ? this.value : (this.format[0]==="numberFormat") ? numberFormat(this.value) : this.value ;

      console.log(this.format[0])
      return this.value
    }


    {{#formatedNumber}}{{/formatedNumber}}



    const key = getURLParams("key") ? getURLParams("key") : "1Zgdmqghdo9oKvbTt-F6ii2p0YF6Mg8kGFr_4tXvF-90"
const location = getURLParams("location") ? getURLParams("location") : "docsdata"