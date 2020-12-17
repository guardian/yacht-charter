import swatches from "./swatches"

export default async function colourize(headings, userKey, data, ColorScale) {

	const pantone = swatches(data, userKey, ColorScale)

	const highlighted = userKey.map(item => item.key)

	const colourizer = (value, index) => (!contains(headings[index], highlighted)) ? false : pantone.find(item => item.name === headings[index]).profile.get(value) ;

	const values = data.map((row) => Object.values(row))

	return await values.map((row, i) => row.map((value, index) => { return { value : value, color : colourizer(value, index), contrast : setContrast(colourizer(value, index)) }}))
}

function contains(a, b) {

    if (Array.isArray(b)) {
        return b.some(x => a.indexOf(x) > -1);
    }

    return a.indexOf(b) > -1;
}


function setContrast(colour) {

	let textColour = 'black'

	if (colour) {

		let rgb = getRGB(colour)

		let yiq = ((rgb[0]*299)+(rgb[1]*587)+(rgb[2]*114))/1000;
	
		textColour = (yiq >= 128) ? 'black' : 'white';
	}

	return textColour
}

function getRGB(str){
  let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  return match ? [
    +match[1],
    +match[2],
    +match[3]
  ] : [];
}