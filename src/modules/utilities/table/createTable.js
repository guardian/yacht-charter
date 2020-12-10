export default function createTable(table, data) {
	let thead = table.createTHead()
	let row = thead.insertRow()
	for (let key of data) {
		let th = document.createElement("th")
		th.classList.add("column-header")
		let text = document.createTextNode(key)
		th.appendChild(text)
		row.appendChild(th)
	}
	let body = table.appendChild(document.createElement('tbody'))
	body.classList.add("table-body")
}