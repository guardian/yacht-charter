
var lastSorted = null
var reversed = null

export default function styleHeaders(e) {

	const headers = document.querySelectorAll(".column-header");
	const tableEl = document.getElementById("int-table");


  for (var h = 0; h < headers.length; h++) {

      headers[h].className = "column-header";

  }

  if (lastSorted === e.target && reversed === false) {
      e.target.className = "column-header sorted-reversed";
      reversed = true;
  } else {
      e.target.className = "column-header sorted";
      reversed = false;
  }
  if (!hasClass(tableEl, "table-sorted")) {
      tableEl.className = "table-sorted";
  }
  lastSorted = e.target;
}

function hasClass(el, cls) {
  if (!el.className) {
      return false;
  } else {
      var newElementClass = ' ' + el.className + ' ';
      var newClassName = ' ' + cls + ' ';
      return newElementClass.indexOf(newClassName) !== -1;
  }
}