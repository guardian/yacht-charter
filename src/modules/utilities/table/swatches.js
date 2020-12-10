export default function swatches(data, userKey, ColorScale) {

	const swatches = userKey.map((name) => {

        var domain =  d3.extent(data.map((item) => +item[name.key]));

        var swatch = {}

        swatch.name = name.key

        swatch.profile = new ColorScale({
          type: "linear",
          domain: domain.map((d) => d / domain[1]),
          colors: (name.colorScheme.split(',').length > 1) ? name.colorScheme.split(',') : d3[name.colorScheme][6],
          divisor: domain[1] / 10
        })

        return swatch

    })

    return swatches

}