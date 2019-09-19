import Promise from 'promise-polyfill'; 
if (!window.Promise) {
  window.Promise = Promise;
}

import fetch from 'unfetch'

export default function(url) {
	return fetch(url)
	  .then((response) => response.json())
}