import * as d3 from "d3"
import noUiSlider from "nouislider"
import { numberFormat } from "../utilities/numberFormat"

class AnimatedBarChart {
  constructor() {
    this.interval = null

    //return this
  }

  render(data) {

    var self = this

    var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

    let el = document.querySelector("#graphicContainer")

    this.config = {

      windowWidth: windowWidth,

      width: el.clientWidth || el.getBoundingClientRect().width,

      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },

      platform: navigator.platform.toLowerCase(),

      userAgent: navigator.userAgent.toLowerCase(),

      isApp: (window.location.origin === "file://" || window.location.origin === null) ? true : false,

      isiOS: self._isIos(),

      isMobile: self._isMobile(),

      smallViewport: (windowWidth < 610) ? true : false

    }

    let setup = d3.select("#graphicContainer").select("svg").empty()

    this._create(data, this.config, setup)

  }

  _create(data, config, setup = true) {

    var database = data.data

    var margin = config.margin

    var width = config.width

    var windowWidth = config.windowWidth

    var smallViewport = config.smallViewport

    var height = width * 0.6

    var category = data.settings[0].categories

    var values = data.settings[0].values

    var topRange = data.settings[0].topRange

    database.forEach(function (d) {
      d.value = +d.value
      d.step = +d.step
    })

    var domain = Array.from(new Set(database.map((item) => item.category)))

    var min = d3.min(database, d => d.step)
    console.log(min)

    var start = min

    var max = d3.max(database, d => d.step)

    var total = max - min

    width = width - margin.left - margin.right, height = height - margin.top - margin.bottom

    d3.select("#graphicContainer svg").remove()

    var svg = d3.select("#graphicContainer").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("id", "svg").attr("overflow", "hidden")

    var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var x = d3.scaleLinear().range([0, width])

    var y = d3.scaleBand().range([height, 0])

    var color = d3.scaleOrdinal().range(d3.schemeCategory10) //https://github.com/d3/d3-scale-chromatic/blob/master/README.md#categorical

    x.domain([0, d3.max(database, (d) => d.value)])

    color.domain(domain)

    function drawChart(cat) {

      var filteredData = database.filter((d) => d.step === cat)
      filteredData.sort((a, b) => b.value - a.value)
      filteredData = filteredData.slice(0, topRange)
      filteredData.sort((a, b) => a.value - b.value)
      y.domain(filteredData.map((d) => d.category)).padding(0.1)
      var bars = svg.selectAll(".bar").data(filteredData, (d) => d.category)
      var labels = svg.selectAll(".label").data(filteredData, (d) => d.category)
      var t = d3.transition("blah").duration(750)
      //Exit
      bars.exit().transition(t).style("opacity", "0").attr("y", (height + margin.top + margin.bottom)).remove()
      labels.exit().transition(t).style("opacity", "0").attr("y", (height + margin.top + margin.bottom)).remove()
      //Update
      bars.transition(t).attr("width", (d) => x(d.value)).attr("y", (d) => y(d.category))
      labels.transition(t).attr("y", (d) => y(d.category) + (y.bandwidth() / 2) + 5).attr("x", 20).text((d) => d.category + " - " + numberFormat(d.value))
      //Enter
      bars.enter().append("rect").attr("class", "bar").attr("title", (d) => d.category).attr("x", 0).attr("y", height + margin.top + margin.bottom).attr("opacity", 1).attr("height", y.bandwidth()).attr("fill", (d) => color(d.category)).attr("width", (d) => x(d.value)).transition(t).attr("width", (d) => x(d.value)).attr("y", (d) => y(d.category))
      labels.enter().append("text").attr("class", "label").attr("x", 20).attr("y", height + margin.top + margin.bottom + 20).attr("opacity", 1).transition(t).attr("y", (d) => y(d.category) + (y.bandwidth() / 2) + 5).text((d) => d.category + " - " + (d.value / 1000).toFixed(1) + "k")
    }

    var yearText = d3.select("#yearText")
    var timer = 0
    drawChart(start)
    var slider = document.getElementById("slider")
    console.log(document)
    if (setup) {
      noUiSlider.create(slider, {
        start: start,
        step: 1,
        range: {
          "min": min,
          "max": max
        }
      })
    }
    if (this.interval !== null) {
      this.interval.stop()
    }

    this.interval = d3.interval(animate, 2000)
    var playButton = d3.select("#play-pause")
    slider.noUiSlider.on("update", function () {
      var newYear = Math.round(slider.noUiSlider.get())
      drawChart(newYear)
      yearText.text(newYear)
    })
    slider.noUiSlider.on("start", function () {
      if (!setup) {
        playPause("pause")
      }
    })
    setup = false

    function animate() {
      var newYear = (start + 1) + timer
      drawChart(newYear)
      yearText.text(newYear)
      slider.noUiSlider.set(newYear)
      timer++
      if (timer == total) {
        timer = 0
      }
    }

    let interval = this.interval
    let self = this

    function playPause(status) {
      if (status == "pause") {
        interval.stop()
        playButton.text("play")
      } else if (status == "play") {
        self.interval = d3.interval(animate, 2000)
        playButton.text("pause")
      }
    }

    playButton.on("click", function () {
      const buttonStatus = playButton.text()
      playPause(buttonStatus)
    })


  }

  _isMobile() {

    var check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true
    })(navigator.userAgent || navigator.vendor || window.opera)
    var isiPad = navigator.userAgent.match(/iPad/i) != null
    return (check || isiPad ? true : false)
  }

  _isIos() {

    var iDevices = [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod"
    ]

    if (navigator.platform) {
      while (iDevices.length) {
        if (navigator.platform === iDevices.pop()) {
          return true
        }
      }
    }

    return false

  }

}

export default AnimatedBarChart