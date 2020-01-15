import * as d3 from "d3"
import {
  $,
  $$,
  round,
  numberWithCommas,
  wait,
  getDimensions
} from "./util"
import ajax from "../modules/ajax"
import noUiSlider from "nouislider"
import loadJson from "../../components/load-json/"

export class ChartBuilder {

  constructor(key) {
    const type = "animated"
    let configure = this._configure.bind(this)
    let mustache = this._mustache.bind(this)
    if (key != null) {
      loadJson(`https://interactive.guim.co.uk/docsdata/${key}.json`)
        .then((data) => {
          const type = "animated"
          ajax(`<%= path %>/assets/templates/${type}.html`).then((template) => {
            //todo: make this use ractive
            const html = mustache(template, data.sheets.template)
            const chart = document.querySelector("#app")
            chart.innerHTML = html
            configure(data.sheets, chart, type)
          })
        })
    }
  }

  _configure(data, chart, type) {
    var app = () => chartbuilder.init(data, chart, d3, noUiSlider)
    this._loader(`<%= path %>/assets/modules/${type}.js`, app, document.body)
  }

  _mustache(l, a, m, c) {

    var self = this

    function h(a, b) {
      b = b.pop ? b : b.split(".")
      a = a[b.shift()] || ""
      return 0 in b ? h(a, b) : a
    }
    var k = self.mustache,
      e = ""
    a = Array.isArray(a) ? a : a ? [a] : []
    a = c ? 0 in a ? [] : [1] : a
    for (c = 0; c < a.length; c++) {
      var d = "",
        f = 0,
        n, b = "object" == typeof a[c] ? a[c] : {},
        b = Object.assign({}, m, b)
      b[""] = {
        "": a[c]
      }
      l.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g, function (a, c, l, m, p, q, g) {
        f ? d += f && !p || 1 < f ? a : c : (e += c.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g, function (a, c, e, f, g, d) {
          return c ? h(b, c) : f ? h(b, d) : g ? k(h(b, d), b) : e ? "" : (new Option(h(b, d))).innerHTML
        }), n = q)
        p ? --f || (g = h(b, g), e = /^f/.test(typeof g) ? e + g.call(b, d, function (a) {
          return k(a, b)
        }) : e + k(d, g, b, n), d = "") : ++f
      })
    }
    return e
  }

  _loader(url, code, location) {

    var tag = document.createElement("script")
    tag.src = url
    tag.onload = code
    tag.onreadystatechange = code
    location.appendChild(tag)

  }

}