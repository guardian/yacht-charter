/**
 * Creates a color key block to identify data that is color coded.
 * @param {categories} arg A list of strings which identify the key text.
 * @param {colors} arg A list of web colors used in the given chart, presented
 * in the same order as {categories}
 */
export default function createCats(d3, categories, colours) {
  const defaultColours = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6"]
  if (colours == null || colours.size == 0) {
    colours = defaultColours
  }
  let greyScale = ["#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#bdbdbd", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
  let symbolTypes = ["symbolCircle",
    "symbolCross",
    "symbolDiamond",
    "symbolSquare",
    "symbolStar",
    "symbolTriangle",
    "symbolWye",
    "symbolCircle",
    "symbolCross",
    "symbolDiamond",
    "symbolSquare",
    "symbolStar",
    "symbolTriangle",
    "symbolWye"
  ]

  var keys = categories
  var colourDomain = []
  var colourRange = []

  //self.database.forEach((item) => keys.indexOf(item[categories]) === -1 ? keys.push(item[categories]) : "")

  while (symbolTypes.length < keys.length) {

    symbolTypes = [...symbolTypes, ...symbolTypes]
  }

  var symbolGenerator = d3.symbol().size(50)

  var syms = keys.map((item, index) => [item, symbolTypes[index]])

  var symap = new Map(syms)

  let symbolKey = (cat) => {

    symbolGenerator.type(d3[symap.get(cat)])

    return symbolGenerator()
  }

  var html = ""

  // if (this.key != null) {
  //
  //   if (this.key[0].key != "") {
  //
  //     this.key.forEach(function (d) {
  //
  //       html += "<div class=\"keyDiv\"><span data-cat=\"" + d.key + "\" class=\"keyCircle\" style=\"background: " + d.colour + "\"></span>"
  //       html += " <span class=\"keyText\">" + d.key + "</span></div>"
  //     })
  //
  //   }
  //
  // } else {

  for (var i = 0; i < keys.length; i++) {

    colourDomain.push(keys[i])
    colourRange.push(colours[i])

  }

  let colourKey = d3.scaleOrdinal()
  let greyKey = d3.scaleOrdinal()

  // categories.forEach(function (d) {
  //   colourDomain.push(d.key)
  //   colourRange.push(d.colour)
  // })

  colourKey
    .domain(colourDomain)
    .range(colourRange)

  greyKey
    .domain(colourDomain)
    .range(greyScale)


  html += "<div class=\"colour_blind_key\">"

  for (i = 0; i < keys.length; i++) {
    // colourDomain.push(keys[i])
    // colourRange.push(self.colours[i])
    html += "<div class=\"keyDiv\"><span data-cat=\"" + keys[i] + "\" class=\"keySymbol\"><svg width=\"12\" height=\"12\" viewBox=\"-6 -6 12 12\"><path d=\"" + symbolKey(keys[i]) + "\" stroke=\"#000\" stroke-width=\"1px\" fill=\"" + greyKey(keys[i]) + "\" /></svg></span>"
    html += " <span class=\"keyText\">" + keys[i] + "</span></div>"
  }

  html += "</div><div class=\"colour_vision_key\">"

  for (i = 0; i < keys.length; i++) {
    html += "<div class=\"keyDiv\"><span data-cat=\"" + keys[i] + "\" class=\"keyCircle\" style=\"background: " + colours[i] + "\"></span>"
    html += " <span class=\"keyText\">" + keys[i] + "</span></div>"
  }

  html += "</div>"
  // }

  d3.select("#key").html(html)

}