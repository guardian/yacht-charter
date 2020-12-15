export default function addMobilePrefix(headerRows) {
  	var css = "",
	head = document.head || document.getElementsByTagName('head')[0],
	style = document.createElement('style'),

	css = "@media (max-width: 30em) {";

	headerRows.map(function(name, index) {
	  css += `tr td:nth-child(${index + 1}) span.header-prefix::before { content: '${name}: '; font-weight: 600; }`;
	});

	css += "}";

	style.type = 'text/css';

	if (style.styleSheet) {
	  style.styleSheet.cssText = css;
	} else {
	  style.appendChild(document.createTextNode(css));
	}

	head.appendChild(style);

  
}