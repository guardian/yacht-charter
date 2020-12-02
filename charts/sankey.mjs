import { numberFormat } from "../utilities/numberFormat"
import mustache from "../utilities/mustache"
import helpers from "../utilities/helpers"
import Tooltip from "./tooltip"
import *  as d3sankey from "d3-sankey"

export default class Sankey {
	constructor(results) {
		this.tooltip = new Tooltip("#graphicContainer")
		this.results = results
		this.render()
	}

	render() {

		var self = this
		var results = JSON.parse(JSON.stringify(self.results))
		var data = results.sheets.data
		var details = results.sheets.template
		var labels = results.sheets.labels
		var userKey = results.sheets.key
		var optionalKeys = []
		var optionalColours = []
		var hasTooltip = details[0].tooltip != "" ? true : false

		var template

		if (userKey.length > 1) {
			userKey.forEach(function (d) {
				optionalKeys.push(d.key)
				optionalColours.push(d.colour)
			})
		}

		if (hasTooltip) {
			template = details[0].tooltip
		}

		var windowWidth = Math.max(
			document.documentElement.clientWidth,
			window.innerWidth || 0
		)
		var isMobile = windowWidth < 610 ? true : false
		var width = document
			.querySelector("#graphicContainer")
			.getBoundingClientRect().width
		var height = width * 0.5
		var margin
		
		// Check if margin defined by user
		if (details[0]["margin-top"] != "") {
			margin = {
				top: +details[0]["margin-top"],
				right: +details[0]["margin-right"],
				bottom: +details[0]["margin-bottom"],
				left: +details[0]["margin-left"]
			}
		} else {
			margin = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 40
			}
		}

		width = width - margin.left - margin.right;
		height = height - margin.top - margin.bottom;

		d3.select("#graphicContainer svg").remove()

		var chartKey = d3.select("#chartKey")

		chartKey.html("")

		var svg = d3
			.select("#graphicContainer")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("id", "svg")
			.attr("overflow", "hidden")
		
		const defs = svg.append('defs');	

		var features = svg
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		var colors = [
			"#a6cee3",
			"#1f78b4",
			"#b2df8a",
			"#33a02c",
			"#fb9a99",
			"#e31a1c",
			"#fdbf6f",
			"#ff7f00"
		]

		
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		data.forEach(function (d) {
			d.value = +d.value
		})

		labels.forEach(function (d) {
			if (dateParse != null) {
				d.x1 = dateParse(d.x1)
			}
			d.y1 = +d.y1
			d.y2 = +d.y2
		})
		
  		const dataNodes = Array.from(new Set(data.flatMap(l => [l.source, l.target])), name => ({name}));
  		const domain = Array.from(new Set(data.flatMap(l => [l.source, l.target])));
  		color.domain(domain)

  		var graphData = {"nodes" : dataNodes , "links" : data };
  		
  		// console.log(graphData)

  		var sankey = d3sankey.sankey()
      		.size([width, height])
      		.nodeId(d => d.name)


		var graph = sankey(graphData);

		console.log(graph)
		
		const edgeColor = 'path'


		var link = svg.append("g").selectAll("link")
			.data(graph.links)
			.enter().append("path")
			.attr("class", "link")
			.style("mix-blend-mode", "multiply")
			.style("fill", "none")
      		.attr("stroke-opacity", 0.5)
			.attr("d", d3sankey.sankeyLinkHorizontal())
			.attr("stroke-width", function(d) { return d.width; })

      	link.style('stroke', (d, i) => {
			console.log(d.source, d.target);

			// make unique gradient ids  
			const gradientID = `gradient${i}`;

			const startColor = color(d.source.name);
			const stopColor = color(d.target.name);

			console.log('startColor', startColor);
			console.log('stopColor', stopColor);

			const linearGradient = defs.append('linearGradient')
				.attr('id', gradientID)
				.attr("gradientUnits", "userSpaceOnUse")
		        .attr("x1", d.source.x1)
		        .attr("x2", d.target.x0)

			linearGradient.selectAll('stop') 
				.data([                             
				  {offset: '10%', color: startColor },      
				  {offset: '90%', color: stopColor }    
				])                  
				.enter().append('stop')
				.attr('offset', d => {
					console.log('d.offset', d.offset);
					return d.offset; 
				})   
				.attr('stop-color', d => {
					console.log('d.color', d.color);
					return d.color;
			});

			return `url(#${gradientID})`;
		})
 	


  		console.log(link)	


		var node = svg.append("g").selectAll(".node")
			.data(graph.nodes)
			.enter().append("g")
			.attr("class", "node")

		node.append("rect")
			.attr("x", function(d) { return d.x0; })
			.attr("y", function(d) { return d.y0; })
			.attr("height", function(d) { return d.y1 - d.y0; })
			.attr("width", sankey.nodeWidth())
			.style("fill", function(d) { 
			     return d.color = color(d.name); })
			.attr("stroke", "#000")
			.append("title")
			.text(d => d.name)


		} 	
}
