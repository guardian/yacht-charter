export default function createTable(table, data, enableSort) {
	let thead = table.createTHead()
	let row = thead.insertRow()
	for (let key of data) {
		let th = document.createElement("th")
		th.classList.add("column-header")

		let span = document.createElement("SPAN")
		let text = document.createTextNode(key)
		th.appendChild(span)
		span.appendChild(text)
		if (enableSort==="TRUE") {
			let div = document.createElement("DIV")
			div.classList.add("toggle-wrapper")
			th.appendChild(div)
		}
		row.appendChild(th)
	}
	let body = table.appendChild(document.createElement('tbody'))
	body.classList.add("table-body")
}