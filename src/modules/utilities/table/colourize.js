import swatches from "./swatches"

export default async function colourize(headings, userKey, data, ColorScale) {

	const pantone = swatches(data, userKey, ColorScale)

	const highlighted = userKey.map(item => item.key)

    const formating = userKey.map(item => { 

        return (item.format) ? item.format.split(",") : undefined ;
        
    })

	const colourizer = (value, index) => (!contains(headings[index], highlighted)) ? false : pantone.find(item => item.name === headings[index]).profile.get(value) ;

	const values = data.map((row) => Object.values(row))

    var getIndex = (index) => {
        return (highlighted.indexOf(headings[index]) > -1) ? formating[highlighted.indexOf(headings[index])] : [""]
    }

	return await values.map((row, i) => row.map((value, index) => { return { value : value, sort : value, format: getIndex(index), color : colourizer(value, index), contrast : setContrast(colourizer(value, index)) }}))
}

function contains(a, b) {

    if (Array.isArray(b)) {
        return b.some(x => a.indexOf(x) > -1);
    }

    return a.indexOf(b) > -1;
}

function setContrast(colour) {

	if (colour) {

	    if (colour.indexOf('#') === 0) {

	    	colour = colour.slice(1);

	    	return invertColor(colour)

	    } else {

			let rgb = getRGB(colour)

			let yiq = ((rgb[0]*299)+(rgb[1]*587)+(rgb[2]*114))/1000;

			return (yiq >= 128) ? 'black' : 'white';

	    }

	}

	return 'black'
}

function invertColor(hex, bw=true) {

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }

    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {

        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }

    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);

    return "#" + padZero(r) + padZero(g) + padZero(b);

}

function getRGB(str){
  let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  return match ? [
    +match[1],
    +match[2],
    +match[3]
  ] : [];
}
