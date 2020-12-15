export default function createTable(table, data) {
	let thead = table.createTHead()
	let row = thead.insertRow()
	for (let key of data) {
		let th = document.createElement("th")
		th.classList.add("column-header")

		let span = document.createElement("SPAN")
		let text = document.createTextNode(key)
		let div = document.createElement("DIV")
		div.classList.add("toggle-wrapper")
		th.appendChild(span)
		span.appendChild(text)
		th.appendChild(div)
		row.appendChild(th)
	}
	let body = table.appendChild(document.createElement('tbody'))
	body.classList.add("table-body")
}