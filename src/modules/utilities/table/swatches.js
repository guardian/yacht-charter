export default function swatches(data, userKey, ColorScale) {

	const swatches = userKey.map((name) => {

        var extent =  d3.extent(data.map((item) => item[name.key]));

        var swatch = {}

        swatch.name = name.key

        swatch.profile = new ColorScale({
                            type: name.scale,
                            domain: (name.values!="") ? name.values.split(',') : extent,
                            colors: (name.colours.split(',').length > 1) ? name.colours.split(',') : name.colours
                          })


        return swatch

    })

    return swatches

}