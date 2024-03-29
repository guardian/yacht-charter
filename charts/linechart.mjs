import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import dataTools from "./dataTools"
import Tooltip from "./shared/tooltip"
import ColorScale from "./shared/colorscale"
import renderCanvas from "../utilities/renderCanvas"
import dimensions from "./constants/dimensions"
import templatizer from "./shared/templatizer"
import template from "./templates/linechart"
import sonic from "./sonic"
const Sonic =  new sonic()

/****** Example tooltip template */
// `
//   <b>{{#formatDate}}{{date}}{{/formatDate}}</b><br/>
//   <b>Australia</b>: {{Australia}}<br/>
//   <b>France</b>: {{France}}<br/>
//   <b>Germany</b>: {{Germany}}<br/>
//   <b>Italy</b>: {{Italy}}<br/>
//   <b>Sweden</b>: {{Sweden}}<br/>
//   <b>United Kingdom</b>: {{United Kingdom}}<br/>
// `
/****** end tooltip template */

function getLongestKeyLength($svg, keys, isMobile, lineLabelling) {
	if (lineLabelling) {
		d3.select("#dummyText").remove()
		const longestKey = keys.sort(function (a, b) {
			return b.length - a.length
		})[0]
		const dummyText = $svg
			.append("text")
			.attr("x", -50)
			.attr("y", -50)
			.attr("id", "dummyText")
			.attr("class", "annotationText")
			.style("font-weight", "bold")
			.style("font-size", "15px")
			.text(longestKey)
		return dummyText.node().getBBox().width
	}
	return 0
}

function commonWords(string1, string2) {
	var list1 = string1.split(" ")
	var list2 = string2.split(" ")
	var result = []
	list1.forEach(function(s) {
		if (list2.includes(s)) {
			result.push(s)
		}
	})
	console.log(result)
	return result.join(" ")
  };


export default class LineChart {
	constructor(results, social) {

		const merged = templatizer(template, results)

		const parsed = JSON.parse(JSON.stringify(merged))

		// console.log(dimensions)
		this.isPlaying = false
		this.data = parsed["sheets"]["data"]
		this.areaData = null
		this.areaKeys = null
		this.areaXColumn = null

		if ("areas" in parsed["sheets"]) {
			this.areaData = parsed["sheets"]["areas"]
			this.areaKeys = Object.keys(this.areaData[0])
			this.areaXColumn = this.areaKeys[0] // use first key, string or date
			this.areaKeys.splice(0, 1) // remove the first key
		}

		this.keys = Object.keys(this.data[0])
		this.xColumn = this.keys[0] // use first key, string or date
		this.keys.splice(0, 1) // remove the first key
		this.template = parsed["sheets"]["template"]
		this.meta = this.template[0]
		console.log("meta", this.meta)
		this.labels = parsed["sheets"]["labels"]
		this.periods = parsed["sheets"]["periods"]
		this.userKey = parsed["sheets"]["key"]
		this.options = parsed["sheets"]["options"][0]
		this.lines = null 
		this.xAxisDateFormat = null
		this.credit = true
		this.borderTop = true
		this.borderBottom = true

		if ("credit" in this.options) {
			if (this.options.credit != "") {
				if (this.options.credit == "FALSE") {
					this.credit = false
				}
				else {
					this.credit = true
				}
			}
			console.log("height",this.meta.height)
		}

		if ("lines" in parsed["sheets"]) {
			if (parsed["sheets"]['lines'][0] != "" ) {
				this.lines = parsed["sheets"]['lines']
			}
		}

		if ("borderTop" in this.meta) {
			if (this.meta.borderTop == "FALSE") {
				this.borderTop = false
			}
		}

		if ("borderBottom" in this.meta) {
			if (this.meta.borderBottom == "FALSE") {
				this.borderBottom = false
			}
		}


		// console.log("line", this.lines)

		this.tooltipTemplate = this.meta.tooltip
		this.hasTooltipTemplate = this.tooltipTemplate && this.tooltipTemplate != "" ? true : false ;
		d3.selectAll("#tooltip").remove()
		this.tooltip = new Tooltip("#graphicContainer")

		this.lineLabelling = null

		this.x_axis_cross_y = null
		this.colors = new ColorScale()

		this.$svg = null
		this.$features = null
		this.$chartKey = d3.select("#chartKey")

		const windowWidth = Math.max(
			document.documentElement.clientWidth,
			window.innerWidth || 0
		)
		this.isMobile = windowWidth < 610 ? true : false
		// console.log("mobile", this.isMobile)
		
		this.containerWidth = document
			.querySelector("#graphicContainer")
			.getBoundingClientRect().width

		this.margin = {
			top: 0,
			right: 0,
			bottom: 20,
			left: 40
		}
		
		this.height = this.containerWidth * 0.6 - this.margin.top - this.margin.bottom

		if ("height" in this.meta) {
			if (this.meta.height != "") {
				this.height = +this.meta.height - this.margin.top - this.margin.bottom
			}
			console.log("height",this.meta.height)
		}

		this.width = this.containerWidth - this.margin.left - this.margin.right
		

		this.y = d3.scaleLinear().rangeRound([this.height, 0])
		this.xAxis = null
		this.yAxis = null

		this.min = null
		this.max = null
		this.lineGenerators = {}
		this.parseTime = null
		this.parsePeriods = null
		this.hideNullValues = "yes"

		this.chartValues = []
		this.chartKeyData = {}

		const furniture = document.querySelector("#furniture")
		const footer = document.querySelector("#footer")
		const body = document.querySelector("body")
	 	var self = this

		function adjustSize() {
			// console.log("setting up social stuff")
			var furnitureHeight = furniture.getBoundingClientRect().height
			var footerHeight = footer.getBoundingClientRect().height
			self.height = dimensions[social].height/2 - furniture.getBoundingClientRect().height - footer.getBoundingClientRect().height - 33
			self.width = document.querySelector("#graphicContainer").getBoundingClientRect().width - 20
			self.width = self.width - self.margin.left - self.margin.right
			self.height = self.height - self.margin.top - self.margin.bottom
		}

		if (social) {

			body.classList.add(social);
			this.isMobile = true

			const resizeObserver = new ResizeObserver(entries => {
				console.log("height changed")
				adjustSize()
				this.setup()
				this.render()
				renderCanvas(social)
			})

			// start observing a DOM node
			resizeObserver.observe(furniture)

			adjustSize()
			this.setup()
			this.render()
			renderCanvas(social)
		}
		
		else {
			this.setup()
			this.render()
		}
	}

	setup() {
		console.log("setup")
		console.log("svg width", this.width, "height", this.height)

		// Remove previous svg
		d3.select("#graphicContainer svg").remove()
		this.$chartKey.html("")

		// titles and source
		d3.select("#chartTitle").html(this.meta.title)
		d3.select("#subTitle").html(this.meta.subtitle)

		if (this.meta.source != "") {
			d3.select("#sourceText").html(" | Source: " + this.meta.source)
		}

		if (this.credit) {
			d3.select("#credit").html("Guardian graphic")
		}

		var addAreaKey = []

		if (this.areaData) {
			var areaLen = this.areaKeys.length/2
			// console.log("areaLen", areaLen)
			for (let i = 0; i < areaLen; i++) {
				var lowerI = i * 2 
				var upperI = i * 2 + 2
				console.log(lowerI, upperI)
				var currentAreaKeys = this.areaKeys.slice(lowerI,upperI)
				console.log(currentAreaKeys)
				addAreaKey.push(commonWords(currentAreaKeys[0], currentAreaKeys[1]))
			}

		}
		
		const combinedKey = [...this.keys, ...addAreaKey]
		// set up color domain/range
		const keyColor = dataTools.getKeysColors({
			keys: combinedKey,
			userKey: this.userKey,
			option: this.options
		})

		this.y = d3.scaleLinear().rangeRound([this.height, 0])

		this.colors.set(keyColor.keys, keyColor.colors)

		// ?
		if (this.meta.x_axis_cross_y) {
			if (this.meta.x_axis_cross_y != "") {
				this.x_axis_cross_y = +this.meta.x_axis_cross_y
			}
		}

		// chart margins provided
		if (this.meta["margin-top"]) {
			this.margin = {
				top: +this.meta["margin-top"],
				right: +this.meta["margin-right"],
				bottom: +this.meta["margin-bottom"],
				left: +this.meta["margin-left"]
			}
		}

		// chart line breaks
		if (this.meta["breaks"]) {
			this.hideNullValues = this.meta["breaks"]
		}

		// x axis type
		if (this.meta["xColumn"]) {
			this.xColumn = this.meta["xColumn"]
			this.keys.splice(this.keys.indexOf(this.xColumn), 1)
		}

		// update y scale if y scale type is provided
		if (this.meta["yScaleType"]) {
			this.y = d3[this.meta["yScaleType"]]().range([this.height, 0]).nice()
		}

		// lineLabelling toggling 
		if (this.options!=undefined) {
			if (this.options.hasOwnProperty('lineLabelling')) {
				this.lineLabelling = (this.options['lineLabelling'] === "TRUE" | this.options['lineLabelling'] === "") ? true : false ;
			} else {
				this.lineLabelling = false
			}
		}

		// console.log("dateformat", this.meta["dateFormat"] )

		this.parseTime = this.meta["dateFormat"] ? d3.timeParse(this.meta["dateFormat"]) : null
		// console.log("parseTime", this.parseTime)
		this.parsePeriods = this.meta["periodDateFormat"] ? d3.timeParse(this.meta["periodDateFormat"]) : null
		this.xAxisDateFormat = this.meta["xAxisDateFormat"] ? d3.timeFormat(this.meta["xAxisDateFormat"]) : null

		// create svg
		this.$svg = d3
			.select("#graphicContainer")
			.append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.attr("id", "svg")
			.attr("overflow", "hidden")

		// update right margin and svg width based on the longest key
		
		this.margin.right =
			this.margin.right +
			getLongestKeyLength(this.$svg, this.keys, this.isMobile, this.lineLabelling)
		
		this.width = document.querySelector("#graphicContainer").getBoundingClientRect().width - this.margin.left - this.margin.right
		this.$svg.attr("width", this.width + this.margin.left + this.margin.right)


		if (!this.borderBottom) {
			d3.select(".interactive-wrapper").classed("borderBottom", false)
		}

		if (!this.borderTop) {
			d3.select(".interactive-wrapper").classed("borderTop", false)
		}

		// update x scale based on scale type

		if (this.parseTime && typeof this.data[0][this.xColumn] == "string") {
			console.log("parsing")
			this.x = d3.scaleTime().rangeRound([0, this.width])
		}

		else if (!(this.data[0][this.xColumn] instanceof Date)) {
			console.log("linear scale")
			this.x = d3.scaleLinear().rangeRound([0, this.width])
		}

		else {
			console.log("already a date")
		}

		// group for chart features
		this.$features = this.$svg
			.append("g")
			.attr(
				"transform",
				"translate(" + this.margin.left + "," + this.margin.top + ")"
			)

		this.keys.forEach((key) => {
			// setup how to draw line
		 

				 this.lineGenerators[key] = d3
					.line()
					.x((d) => {       
						return this.x(d[this.xColumn])
					})
					.y((d) => {
						return this.y(d[key])
					})

			

			if (this.hideNullValues === "yes") {
		 
			 this.lineGenerators[key].defined(function (d) {
					return d
					})
			}
		

			// get all chart values for each key
			this.data.forEach((d) => {
				if (typeof d[key] == "string") {
					if (d[key].includes(",")) {
						if (!isNaN(d[key].replace(/,/g, ""))) {
							d[key] = +d[key].replace(/,/g, "")
							this.chartValues.push(d[key])
						}
					} else if (d[key] != "") {
						if (!isNaN(d[key])) {
							d[key] = +d[key]
							this.chartValues.push(d[key])
						}
					} else if (d[key] == "") {
						d[key] = null
					}
				} else {
					this.chartValues.push(d[key])
				}
			})
		})

		// make a chart key    

		this.makeKey = function makeKey() {
			this.$chartKey.html("")
			combinedKey.forEach((key) => {
				const $keyDiv = this.$chartKey.append("div").attr("class", "keyDiv")

				$keyDiv
					.append("span")
					.attr("class", "keyCircle")
					.style("background-color", () => this.colors.get(key))

				$keyDiv.append("span").attr("class", "keyText").text(key)
			})
		}


		if (this.isMobile && !this.lineLabelling) {
			this.makeKey()
		}

		if (this.lineLabelling === false) {
			this.makeKey()
		}

		this.data.forEach((d) => {
			if (this.parseTime && typeof d[this.xColumn] == "string") {
				d[this.xColumn] = this.parseTime(d[this.xColumn])
			}
		})

		if (this.areaData) {
			this.areaData.forEach((d) => {
				if (this.parseTime && typeof d[this.areaXColumn] == "string") {
					d[this.areaXColumn] = this.parseTime(d[this.areaXColumn])
				}
			})

			this.areaKeys.forEach((key) => {
				this.areaData.forEach((d) => {
					if (typeof d[key] == "string") {
						if (d[key].includes(",")) {
							if (!isNaN(d[key].replace(/,/g, ""))) {
								d[key] = +d[key].replace(/,/g, "")
								this.chartValues.push(d[key])
							}
						} else if (d[key] != "") {
							if (!isNaN(d[key])) {
								d[key] = +d[key]
								this.chartValues.push(d[key])
							}
						} else if (d[key] == "") {
							d[key] = null
						}
					} else {
						this.chartValues.push(d[key])
					}
				})
			})

		
		}

		this.keys.forEach((key) => {
			this.chartKeyData[key] = []
			this.data.forEach((d) => {
				if (d[key] != null) {
					let newData = {}
					newData[this.xColumn] = d[this.xColumn]
					newData[key] = d[key]
					this.chartKeyData[key].push(newData)
				} 

				else if (this.hideNullValues === "yes") {
					this.chartKeyData[key].push(null)
				}
			})
		})

		this.labels.forEach((d) => {
			if (this.parseTime && typeof d.x == "string") {
				d.x = this.parseTime(d.x)
			}

			if (typeof d.y == "string") {
				d.y = +d.y
			}

			if (typeof d.offset == "string") {
				d.offset = +d.offset
			}
		})

		if (this.lines) {
				this.lines.forEach((d) => {
				if (this.parseTime && typeof d.x1 == "string") {
					d.x1 = this.parseTime(d.x1)
					d.x2 = this.parseTime(d.x2)
				}

				if (typeof d.y1 == "string") {
					d.y1 = +d.y1
					d.y2 = +d.y2
				}

			})
		}

		// console.log(this.periods)
		this.periods.forEach((d) => {
			if (typeof d.start == "string") {
				if (this.parsePeriods != null) {

						d.start = this.parsePeriods(d.start)
						if (d.end != "") {
							d.end = this.parsePeriods(d.end)
							d.middle = new Date((d.start.getTime() + d.end.getTime()) / 2)
						}

						else {
							d.middle = d.start
						}
						
				}

				else {
					d.start = +d.start

					if (d.end != "") {
						d.end = +d.end
						d.middle = (d.end + d.start) / 2
					}

					else {
							d.middle = d.start
						}
				}
				
			}
		})


		// determine y min/max of the chart
		// this.max = d3.max(this.chartValues)

		this.max =
			this.meta["maxY"] && this.meta["maxY"] !== ""
				? parseInt(this.meta["maxY"])
				: d3.max(this.chartValues)

		this.min =
			this.meta["minY"] && this.meta["minY"] !== ""
				? parseInt(this.meta["minY"])
				: d3.min(this.chartValues)

		// setup x and y axis domains
		this.x.domain(
			d3.extent(this.data, (d) => {
				return d[this.xColumn]
			})
		)
		this.y.domain([this.min, this.max])

		// setup x and y axis
		// const xTicks = Math.round(this.width / 110)

		const xTicks = 5 
		// console.log("xTicks", xTicks)
		const yTicks = this.meta["yScaleType"] === "scaleLog" ? 3 : 5

		this.xAxis = d3.axisBottom(this.x)
			.ticks(xTicks)
	
		// console.log("parseTime2", this.parseTime)	

		if (!this.parseTime) {
			console.log("yiiieeew")
			this.xAxis.tickFormat(d3.format("d"))
		}  

		else {

			// check if user has set x axis date format	
			if (this.xAxisDateFormat) {
				this.xAxis.tickFormat(this.xAxisDateFormat)
			}

			else {
				if (this.meta["dateFormat"] == "%Y") {
					this.xAxis.tickFormat(d3.timeFormat("%Y"))
				}
				else {
					this.xAxis.tickFormat(d3.timeFormat("%-d %b %y"))
				}
			}
			
		}

		this.yAxis = d3
			.axisLeft(this.y)
			.tickFormat(function (d) {
				return numberFormat(d)
			})
			.ticks(yTicks)
			.tickSize(-this.width)  

	} // end setup

	render() {

		// Remove
		d3.selectAll(".periodLine").remove()
		d3.selectAll(".periodLabel").remove()


		this.$features
			.selectAll(".periodLine .start")
			.data(this.periods)
			.enter()
			.append("line")
			.attr("x1", (d) => {
				return this.x(d.start)
			})
			.attr("y1", 0)
			.attr("x2", (d) => {
				return this.x(d.start)
			})
			.attr("y2", this.height)
			.attr("class", "periodLine mobHide start")
			.attr("stroke", "#bdbdbd")
			.attr("opacity", (d) => {
				if (d.start < this.x.domain()[0]) {
					return 0
				} else {
					return 1
				}
			})
			.attr("stroke-width", 1)

		this.$features
			.selectAll(".periodLine .end")
			.data(this.periods.filter(b => b.end != ""))
			.enter()
			.append("line")
			.attr("x1", (d) => {
				return this.x(d.end)
			})
			.attr("y1", 0)
			.attr("x2", (d) => {
				return this.x(d.end)
			})
			.attr("y2", this.height)
			.attr("class", "periodLine mobHide end")
			.attr("stroke", "#bdbdbd")
			.attr("opacity", (d) => {
				if (d.end > this.x.domain()[1]) {
					return 0
				} else {
					return 1
				}
			})
			.attr("stroke-width", 1)

		this.$features
			.selectAll(".periodLabel")
			.data(this.periods)
			.enter()
			.append("text")
			.attr("x", (d) => {
				if (d.labelAlign == "middle") {
					return this.x(d.middle)
				} else if (d.labelAlign == "start") {
					return this.x(d.start) + 5
				}
			})
			.attr("y", -5)
			.attr("text-anchor", (d) => {
				return d.labelAlign
			})
			.attr("class", "periodLabel mobHide")
			.attr("opacity", 1)
			.text((d) => {
				return d.label
			})



		this.$features.append("g")
				.attr("class", "y dashed")
				.call(this.yAxis)
				.style("stroke-dasharray", "2 2")  

		this.$features
			.append("g")
			.attr("class", "x")
			.attr("transform", () => {
				if (this.x_axis_cross_y != null) {
					return "translate(0," + this.y(this.x_axis_cross_y) + ")"
				} else {
					return "translate(0," + this.height + ")"
				}
			})
			.call(this.xAxis)

		this.$features.select(".y .domain").remove()    

		this.$features
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("fill", "#767676")
			.attr("text-anchor", "end")
			.text(this.meta.yAxisLabel)

		this.$features
			.append("text")
			.attr("x", this.width)
			.attr("y", this.height - 6)
			.attr("fill", "#767676")
			.attr("text-anchor", "end")
			.text(this.meta.xAxisLabel)

		d3.selectAll(".tick line").attr("stroke", "#767676")

		d3.selectAll(".tick text").attr("fill", "#767676")

		d3.selectAll(".domain").attr("stroke", "#767676")

			if (this.lines) {
					this.$features
			.selectAll(".line")
			.data(this.lines)
			.enter()
			.append("line")
			.attr("x1", (d) => this.x(d.x1))
			.attr("y1", (d) => this.y(d.y1))
			.attr("x2", (d) => this.x(d.x2))
			.attr("y2", (d) => this.y(d.y1))
			.attr("class", "line")
			.attr("stroke", "#767676")
			.attr("stroke-dasharray", "2,2")
			.attr("stroke-width", 1)	

		this.$features
			.selectAll(".lineText")
			.data(this.lines)
			.enter()
			.append("text")
			.attr("x", (d) => this.x(d.x1))
			.attr("y", (d) => this.y(d.y1) - 5)
			// .attr("text-anchor", "start")
			.attr("class", "lineText")
			.attr("opacity", 1)
			.text((d) => {
				return d.text
			})	

		}	


		this.sonicData = {}

		this.keyOrder = []

		// draw filled areas

		if (this.areaData) {
			var areaLen = this.areaKeys.length/2
			// console.log("areaLen", areaLen)
			for (let i = 0; i < areaLen; i++) {
				var lowerI = i * 2 
				var upperI = i * 2 + 2
				// console.log(lowerI, upperI)
				var currentAreaKeys = this.areaKeys.slice(lowerI,upperI)
				// console.log(currentAreaKeys)
			

				var currentKey = commonWords(currentAreaKeys[0], currentAreaKeys[1])
				let area = d3.area()
					.x((d) => this.x((d[this.areaXColumn])))
					.y0((d) =>  this.y(d[currentAreaKeys[0]]))
					.y1((d) => this.y(d[currentAreaKeys[1]]))

				this.$features.append("path")
					.datum(this.areaData)
					.attr("class", "areaPath")
					.attr("fill", this.colors.get(currentKey))
					.attr("opacity", 0.6)
					.attr("stroke", "none")
					.attr("d", area)	

			}

		}


		// Draw the lines

		this.keys.forEach((key) => {
			this.$features
				.append("path")
				.datum(this.chartKeyData[key])
				.attr("fill", "none")
				.attr("stroke", (d) => this.colors.get(key))
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 2)
				.attr("d", this.lineGenerators[key])

			const tempLabelData = this.chartKeyData[key].filter((d) => d != null)
			let lineLabelAlign = "start"
			let lineLabelOffset = 0

			// if (!this.isMobile && this.lineLabelling) {
			//    if (
			//   this.x(tempLabelData[tempLabelData.length - 1].index) >
			//   this.width - 20
			// ) {
			//   lineLabelAlign = "end"
			//   lineLabelOffset = -10
			// }
			// }

			this.sonicData[key] = tempLabelData

			this.keyOrder.push(key)

			this.$features
					.append("circle")
					.attr("cy", (d) => {
						return this.y(tempLabelData[tempLabelData.length - 1][key])
					})
					.attr("fill", (d) => this.colors.get(key))
					.attr("cx", (d) => {
						return this.x(tempLabelData[tempLabelData.length - 1][this.xColumn])
					})
					.attr("r", 4)
					.style("opacity", 1)

			// if (!this.isMobile && this.lineLabelling) {
			if (this.lineLabelling) {	

				this.$features
					.append("text")
					.attr("class", "lineLabels")
					.style("font-weight","bold")
					.style("font-size","15px")
					.attr("y", (d) => {
						return (
							this.y(tempLabelData[tempLabelData.length - 1][key]) +
							4 +
							lineLabelOffset
						)
					})
					.attr("x", (d) => {
						return (
							this.x(tempLabelData[tempLabelData.length - 1][this.xColumn]) + 5
						)
					})
					.style("opacity", 1)
					.attr("text-anchor", lineLabelAlign)
					.attr("fill", (d) => this.colors.get(key))
					.text((d) => {
						return key
					})
			}


		}) // end drawing lines

	



		if (this.hasTooltipTemplate) {

			this.drawHoverFeature()
 
		}

		if (this.options.aria==='TRUE') {
			console.log("Setting up sonificiations")
			console.log(this.sonicData)
			// const duration = 10000 / this.sonicData[this.keys[0]].length

			// console.log("duration", duration)	

			Sonic.ification(this.sonicData, this.x, this.y, this.xColumn, this.keyOrder, this.margin, this.y.domain(), 'svg')

		}

		this.drawAnnotation()

	} // end render?

	drawHoverFeature() {
		const self = this
		const xColumn = this.xColumn
		const $hoverLine = this.$features
			.append("line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", this.height)
			.style("opacity", 0)
			.style("stroke", "#333")
			.style("stroke-dasharray", 4)

		const $hoverLayerRect = this.$features
			.append("rect")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("opacity", 0)

		// Handle mouse hover event
		// Find the data based on mouse position
		const getTooltipData = (d, event) => {
			const bisectX = d3.bisector((d) => d[xColumn]).left,
				x0 = this.x.invert(d3.mouse(event)[0]),
				i = bisectX(this.data, x0, 1),
				tooltipData = {}

			this.keys.forEach((key) => {
				const data = this.chartKeyData[key],
					d0 = data[i - 1],
					d1 = data[i]

				if (d0 && d1) {
					d = x0 - d0[xColumn] > d1[xColumn] - x0 ? d1 : d0
				} else {
					d = d0
				}

				tooltipData[xColumn] = d[xColumn]
				tooltipData[key] = d[key]
			})
			return tooltipData
		}

		// Render tooltip data
		const templateRender = (data) => {
			return mustache(this.tooltipTemplate, {
				...helpers,
				...data
			})
		}

		$hoverLayerRect
			.on("mousemove touchmove", function (d) {
				const tooltipData = getTooltipData(d, this)
				const tooltipText = templateRender(tooltipData)

				self.tooltip.show(
					tooltipText,
					self.width,
					self.height + self.margin.top + self.margin.bottom
				)

				$hoverLine
					.attr("x1", self.x(tooltipData[xColumn]))
					.attr("x2", self.x(tooltipData[xColumn]))
					.style("opacity", 0.5)
			})
			.on("mouseout touchend", function () {
				self.tooltip.hide()
				$hoverLine.style("opacity", 0)
			})
	}

	drawAnnotation() {

		var self = this

		// console.log("drawing annotations")

		function textPadding(d) {
			return d.offset > 0 ? 6 : -2
		}

		function textPaddingMobile(d) {
			return d.offset > 0 ? 8 : 4
		}

		const $footerAnnotations = d3.select("#footerAnnotations")
		$footerAnnotations.html("")

		this.$features
			.selectAll(".annotationLine")
			.data(this.labels)
			.enter()
			.append("line")
			.attr("class", "annotationLine")
			.attr("x1", (d) => {
				return this.x(d.x)
			})
			.attr("y1", (d) => {
				return this.y(d.y)
			})
			.attr("x2", (d) => {
				return this.x(d.x)
			})
			.attr("y2", (d) => {
				// const yPos = this.y(d.offset)
				// return yPos <= -15 ? -15 : yPos
				return this.y(d.y) - d.offset
			})
			.style("opacity", 1)
			.attr("stroke", "#000")

		// if (this.isMobile) {
		// 	this.$features
		// 		.selectAll(".annotationCircles")
		// 		.data(this.labels)
		// 		.enter()
		// 		.append("circle")
		// 		.attr("class", "annotationCircle")
		// 		.attr("cy", (d) => {
		// 			return this.y(d.y) - d.offset - 4
		// 		})
		// 		.attr("cx", (d) => {
		// 			return this.x(d.x)
		// 		})
		// 		.attr("r", 8)
		// 		.attr("fill", "#000")

		// 	this.$features
		// 		.selectAll(".annotationTextMobile")
		// 		.data(this.labels)
		// 		.enter()
		// 		.append("text")
		// 		.attr("class", "annotationTextMobile")
		// 		.attr("y", (d) => {
		// 			return this.y(d.y) - d.offset
		// 		})
		// 		.attr("x", (d) => {
		// 			return this.x(d.x)
		// 		})
		// 		.attr("text-anchor", (d) => {
		// 			if (d.align != "") {
		// 				return d.align
		// 			}
		// 			else {
		// 				return "start"
		// 			}
		// 		})
		// 		.style("opacity", 1)
		// 		.attr("fill", "white")
		// 		.text((d, i) => {
		// 			return i + 1
		// 		})

		// 	if (this.labels.length > 0) {
		// 		$footerAnnotations
		// 			.append("span")
		// 			.attr("class", "annotationFooterHeader")
		// 			.text("Notes: ")
		// 	}

		// 	this.labels.forEach((d, i) => {
		// 		$footerAnnotations
		// 			.append("span")
		// 			.attr("class", "annotationFooterNumber")
		// 			.text(i + 1 + " - ")

		// 		if (i < this.labels.length - 1) {
		// 			$footerAnnotations
		// 				.append("span")
		// 				.attr("class", "annotationFooterText")
		// 				.text(d.text + ", ")
		// 		} else {
		// 			$footerAnnotations
		// 				.append("span")
		// 				.attr("class", "annotationFooterText")
		// 				.text(d.text)
		// 		}
		// 	})
		// } else {
			this.$features
				.selectAll(".annotationText2")
				.data(this.labels)
				.enter()
				.append("text")
				.attr("class", "annotationText2")
				.attr("y", (d) => {
					// const yPos = this.y(d.offset)
					// return yPos <= -10 ? -10 : yPos + -1 * textPadding(d)
					return this.y(d.y) - d.offset - textPadding(d) / 2
				})
				.attr("x", (d) => {
					// const yPos = this.y(d.offset)
					// const xPos = this.x(d.x)
					// return yPos <= -10 ? xPos - 5 : xPos
					return this.x(d.x)
				})
				.style("text-anchor", (d) => {
					return d.align
				})
				.style("opacity", 1)
				.text((d) => {
					return d.text
				})
		// }



	}

	// sonic() {

	// 	var self = this

	// 	const bpm = 400

	// 	const note = 60 / bpm

	// 	const low = 130.81

	// 	const high = 261.63

	// 	const domain = this.y.domain()

	// 	const scale = d3.scaleLinear()
	// 	      .domain(domain)
	// 	      .range([low,high])

	// 	const duration = len(self.sonicData) / 10000

	// 	console.log(self.sonicData)
	// 	console.log("duration", duration)

	// 	var sonicButton = document.getElementById('sonic');
	// 	sonicButton.addEventListener('click', noiseLoop);
	// 	sonicButton.addEventListener('keydown', sonicButtonKeydownHandler);
	// 	sonicButton.addEventListener('keyup', sonicButtonKeyupHandler);

	// 	function sonicButtonKeydownHandler (event) {
	// 	  // The action button is activated by space on the keyup event, but the
	// 	  // default action for space is already triggered on keydown. It needs to be
	// 	  // prevented to stop scrolling the page before activating the button.
	// 	  if (event.keyCode === 32) {
	// 	    event.preventDefault();
	// 	  }
	// 	  // If enter is pressed, activate the button
	// 	  else if (event.keyCode === 13) {
	// 	    event.preventDefault();
	// 	    noiseLoop();
	// 	  }
	// 	}

	// 	/**
	// 	 * Activates the action button with the space key.
	// 	 *
	// 	 * @param {KeyboardEvent} event
	// 	 */
	// 	function sonicButtonKeyupHandler (event) {
	// 	  if (event.keyCode === 32) {
	// 	    event.preventDefault();
	// 	    noiseLoop();
	// 	  }
	// 	}

	// 	this.$svg.append("circle")
	// 			.attr("r",5)
	// 			.attr("stroke", "red")
	// 			.attr("cx",self.x(self.data[0].Date) + self.margin.left)
	// 			.attr("cy",self.y(self.data[0][self.keyOrder[0]]) + self.margin.top)
	// 			.attr("fill","none")
	// 			.attr("id", "playHead")
		      
	// 	function makeNoise(xVar, yVar) {
		    
	// 		console.log("note", note)

	// 	    var synth = new tone.Synth({
	// 	      envelope: {
	// 	        decay: 0,
	// 	        sustain:1,
	// 	        release:0.5
	// 	      },
	// 	      oscillator : {
	// 	        count: 8,
	// 	        spread: 30,
	// 	        type : "sawtooth4"
	// 	      }
	// 	    }
	// 	    ).toDestination();

	// 	    self.sonicData[yVar].forEach(function(d,i) {			    	

	// 	      if (i == 0) { 
	// 	        synth.triggerAttackRelease(scale(d[yVar]), self.sonicData[yVar].length * note).onsilence(clearSynth())
	// 	        d3.select("#playHead")
	// 	            .attr("cx",self.x(self.sonicData[yVar][i][xVar]) + self.margin.left)
	// 	            .attr("cy",self.y(self.sonicData[yVar][i][yVar]) + self.margin.top)
	// 	      }
	// 	      else {
	// 	        tone.Transport.schedule(function(){
	// 	          d3.select("#playHead").transition().duration(500)
	// 	            .ease(d3.easeLinear)
	// 	            .attr("cx",self.x(self.sonicData[yVar][i][xVar]) + self.margin.left)
	// 	            .attr("cy",self.y(self.sonicData[yVar][i][yVar]) + self.margin.top)
		          
	// 	          synth.frequency.rampTo(scale(d[yVar]), note);
	// 	        }, i * note);
	// 	      }

	// 	    })
		  
	// 	    tone.Transport.position = "0:0:0"
	// 	    tone.Transport.start()
		  
	// 	    function clearSynth () {
	// 	      console.log("finished")
	// 	    }

	// 	}

	// 	function beep(key) {

	// 	    return new Promise( (resolve, reject) => {

	// 		    var synth = new tone.Synth({
	// 		      envelope: {
	// 		        decay: 0,
	// 		        sustain:1,
	// 		        release:0.5
	// 		      },
	// 		      oscillator : {
	// 		        count: 8,
	// 		        spread: 30,
	// 		        type : "sawtooth4"
	// 		      }
	// 		    }
	// 		    ).toDestination();

	// 		    synth.triggerAttackRelease(key, 1).onend(clearSynth())

	// 		   	tone.Transport.position = "0:0:0"

	// 		    tone.Transport.start()

	// 		    function clearSynth () {
	// 		      resolve({ status : "success"})
	// 		    }


	// 	    }).catch(function(e) {

	// 		  reject(e);

	// 		});
		  
	// 	}

	// 	function speaker(text) {

	// 	    return new Promise( (resolve, reject) => {

	// 			if ('speechSynthesis' in window) {
				 
	// 			 	var msg = new SpeechSynthesisUtterance();

	// 			 	msg.text = text

	// 			 	window.speechSynthesis.speak(msg);

	// 			 	msg.onend = function() {

	// 			 		resolve({ status : "success"})

	// 			 	};

	// 			} else {

	// 				resolve({ status : "no txt to speach"})

	// 			}

	// 	    }).catch(function(e) {

	// 		  reject(e);

	// 		});
	// 	}

	// 	async function noiseLoop() {

	// 		if (!this.isPlaying) {

	// 			this.isPlaying = true

	// 			const text1 = await speaker(`The lowest value on the chart is ${domain[0]}, and it sounds like `)

	// 			const beep1 = await beep(scale(domain[0]))

	// 			await timer(1200);

	// 			const text2 = await speaker(`The highest value on the chart is ${domain[1]}, and it sounds like `)

	// 			const beep2 = await beep(scale(domain[1]))

	// 			await timer(1200);

	// 			for await (const datastream of self.keyOrder) {
	// 				console.log(datastream)
	// 		        d3.select("#playHead")
	// 	            .attr("cx",self.x(self.sonicData[datastream][0][this.xColumn]) + self.margin.left)
	// 	            .attr("cy",self.y(self.sonicData[datastream][0][datastream]) + self.margin.top)

	// 				const category = await speaker(datastream)

	// 				makeNoise(this.xColumn, datastream)

	// 				await timer(self.sonicData[datastream].length * note * 1000);

	// 			}

	// 			this.isPlaying = false

	// 		}
	// 	}
	// }

}
