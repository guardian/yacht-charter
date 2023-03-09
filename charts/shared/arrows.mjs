// import * as d3 from "d3"

function generateArc(el, config, margin, width, height) {

	// Optional arg for large arc flag, set to zero if doesn't exist
	console.log("margin", margin, "width", width, "height", height)
	if (!config.largeArcFlag) {
		config.largeArcFlag = 0
	}

	// Optional arg for sweep flag, set to zero if doesn't exist

	if (!config.sweepFlag) {
		config.sweepFlag = 0
	}

	// Optional arg that sets both x and y radius

	if (!config.radius) {
		config.radius = 75
	}
	// console.log("yeh")

	var newCoords = JSON.parse(JSON.stringify(config.coords))

	if (config.coordType) {

		if (config.coordType === "pct" || config.coordType === "") {
			
			var group = el.select("g")
			var svgWidth = width - margin.left - margin.right
			var svgHeight = height - margin.top - margin.bottom
			console.log("svgWidth", svgWidth, "svgHeight", svgHeight)

			newCoords.sourceX = (config.coords.sourceX * svgWidth) + margin.left
			newCoords.targetX = (config.coords.targetX * svgWidth)  + margin.left
			newCoords.sourceY = (config.coords.sourceY * svgHeight) + margin.top
			newCoords.targetY = (config.coords.targetY * svgHeight) + margin.top
			newCoords.textX = (config.coords.textX * svgWidth) + margin.left
			newCoords.textY = (config.coords.textY * svgHeight) + margin.top
		}

	}

	var curvePath = `M ${newCoords.sourceX}, ${newCoords.sourceY} A ${config.radius}, ${config.radius} 0 ${config.largeArcFlag},${config.sweepFlag} ${newCoords.targetX}, ${newCoords.targetY}`

	return {"curvePath":curvePath, "newCoords":newCoords}
	
}

function clickLogging(el, width, height, margin, clickLoggingOn) {

	var clickLogging = true
	if (clickLogging) {

		var clickNo = 0
		var id = null
		var clickType = "svg"

		var clickResults = { "targetX":0,
					"targetY":0,
					"sourceX":0,
					"sourceY":0,
					"textX":0,
					"textY":0
				}

		var labelPaths = el.selectAll(".clickControl")

		labelPaths.on("click", function(e) {
			clickNo = clickNo - 1
			id = d3.select(this).attr("data-id")
			// console.log(id)
			d3.select(`#${id} .clickControl`).transition().attr("opacity",0.2)
			d3.select(`#${id} .labelPath`).transition().attr("opacity",0.2)
			clickType = "path" 
		})

		var labelTexts = el.selectAll(".labelText")

		labelTexts.on("click", function(e) {
			clickNo = clickNo - 1
			id = d3.select(this).attr("data-id")
			console.log(id)
			d3.select(this).transition().attr("opacity",0.2)
			clickType = "label" 
		})

		el.on("click", function(e) {
			console.log("clicktype", clickType, "clickNo", clickNo)
			console.log("clickPos", d3.pointer(event)[0], d3.pointer(event)[1], "modifiedPos", d3.pointer(event)[0] - margin.left, d3.pointer(event)[1] - margin.top)
			console.log("clickPos", d3.pointer(event)[0], d3.pointer(event)[1], "modifiedPos", d3.pointer(event)[0] - margin.left, d3.pointer(event)[1] - margin.top)


			var clickXpct = (d3.pointer(event)[0] - margin.left) / (width - margin.left - margin.right)
			var clickYpct = (d3.pointer(event)[1] - margin.top) / (height - margin.top - margin.bottom)

			console.log("clickXpct", clickXpct, "clickYpct", clickYpct)

			if (clickNo == -1) {
				clickNo = clickNo + 1
			}

			else if (clickNo == 0) 	{
				clickNo = clickNo + 1
				clickResults.targetX = clickXpct
				clickResults.targetY = clickYpct

				if (clickType === "label") {
					if (id != null) {

						var newConfig = JSON.parse(el.select(`#${id}`).attr("data-config"))
						console.log("newConfig",newConfig)
						
						id = null
						
							clickResults.textX = clickXpct
							clickResults.textY = clickYpct
							newConfig.coords.textX = clickResults.textX
							newConfig.coords.textY = clickResults.textY
							addLabel(el, newConfig, width, height, margin, clickLoggingOn)
							console.log(JSON.stringify(newConfig.coords))
						
						}
					}	

			}

			else if (clickNo === 1) {
				clickNo = 0

				if (id != null) {

					var newConfig = JSON.parse(el.select(`#${id}`).attr("data-config"))
					console.log("newConfig",newConfig)
					
					id = null
					
					if (clickType === "path") {
						clickResults.sourceX = clickXpct
						clickResults.sourceY = clickYpct
						newConfig.coords.sourceX = clickResults.sourceX
						newConfig.coords.sourceY = clickResults.sourceY
						newConfig.coords.targetX = clickResults.targetX
						newConfig.coords.targetY = clickResults.targetY
					}

					// if (clickType === "label") {
					// 	clickResults.textX = (d3.pointer(event)[0] - margin.left)  / (width + margin.right)
					// 	clickResults.textY = (d3.pointer(event)[1] - margin.top) / (height + margin.bottom)
					// 	newConfig.coords.textX = clickResults.textX
					// 	newConfig.coords.textY = clickResults.textY
					// }

					addLabel(el, newConfig, width, height, margin, clickLoggingOn)
					console.log(JSON.stringify(newConfig.coords))
				}

				
			}
        
		})

	}
}


var insertLinebreaks = function () {
		
	    var el = d3.select(this);
	    var words = el.text().split('\n');
		// console.log(words)
	    el.text('');
	    for (var i = 0; i < words.length; i++) {
	        var tspan = el.append('tspan').text(words[i]);
	        if (i > 0)
	        // tspan.attr('dy', '15');
	        tspan.attr('x', el.attr("x")).attr('dy', '15');
	    }
	};


function addLabel(el, config, width, height, margin, clickLoggingOn) {

		console.log("Drawing arrow label", config.id, "clickLoggingOn", clickLoggingOn)


		el.select(`#${config.id}`).remove()

		var labelWrapper = el.append("g")
								.attr("id", config.id)
								.attr("class", "labelWrapper")
								.attr("data-config", JSON.stringify(config))
								.style("opacity", 0)

		var newStuff = generateArc(el, config, margin, width, height)
		var curvePath = newStuff.curvePath
		var newCoords = newStuff.newCoords				
		console.log("newCoords",newCoords)
		el.append("svg:defs").append("svg:marker")
			.attr("id", "arrow")
			.attr("refX", 6)
			.attr("refY", 6)
			.attr("markerWidth", 30)
			.attr("markerHeight", 30)
			.attr("markerUnits","userSpaceOnUse")
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M 0 0 12 6 0 12 3 6")
			.style("fill", "black")

		labelWrapper.append("path")
			.attr("class", "labelPath")
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("stroke-width",2)
			.attr("data-id", config.id)
			.attr("marker-end", () => {
				if (config.arrow) {
					if (config.arrow == "true") {
						return "url(#arrow)"
					}
					else {
						return "none"
					}
				}

				else {
					return "none"
				}

			})
			
			.attr("d", curvePath)

		if (clickLoggingOn) {	

			var pathEl = el.select(`#${config.id} .labelPath`).node();
			var midpoint = pathEl.getPointAtLength(pathEl.getTotalLength()/2);
			// console.log("midpoint",midpoint)
			labelWrapper.append("circle")
				.attr("fill", "black")
				.attr("stroke", "black")
				.attr("class", "clickControl")
				.attr("r",5)
				.attr("data-id", config.id)
				// .attr("marker-end", "url(#arrow)")
				.attr("cx", midpoint.x)
				.attr("cy", midpoint.y)	
		}

		labelWrapper.append("text")
			.attr("class", "labelText")
			.attr("text-anchor", () => {
				if (config.align) {
					return config.align
				}
				else {
					return "start"
				}
			})
			.attr("x", newCoords.textX)
			.attr("y", newCoords.textY)
			.attr("dy",15)
			.attr("data-id", config.id)
			.attr("dx",0)
			.attr("fill","black")
			.text(config.text)

		el.selectAll(`#${config.id} text`).each(insertLinebreaks);		

		if (clickLoggingOn) {
			console.log(el)
			clickLogging(el, width, height, margin, clickLoggingOn)
		}

		labelWrapper.transition().style("opacity", 1)

	// console.log("arrow config", "width", width, "height", height)
	
}

export { addLabel , clickLogging }