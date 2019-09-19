import loadJson from '../components/load-json/'
import { Chartbuilder } from './modules/applet'


function getURLParams(paramName) {

	const params = window.parent.location.search.substring(1).split("&")

    for (let i = 0; i < params.length; i++) {
    	let val = params[i].split("=");
	    if (val[0] == paramName) {
	        return val[1];
	    }
	}
	return null;

}

const key = (getURLParams('key')) ? getURLParams('key') : "1evrvPdWq4ysFW5JrdtJLDG3hVPNjPDnBqNJtT-WZnRo" ; 

if ( key != null ) {

	loadJson(`https://interactive.guim.co.uk/docsdata/${key}.json?t=${new Date().getTime()}`) 
	      .then((data) => {
	      	new Chartbuilder(data.sheets)
	      })

}





