import * as d3 from "d3"
import { $, $$, round, numberWithCommas, wait, getDimensions } from '../modules/util'
import ajax from '../modules/ajax';
import noUiSlider from "nouislider"

export class Chartbuilder {

	constructor(data) {

		var self = this

		this.chart = document.querySelector("#app")

		this.database = data

		this.type = self.database.settings[0].type

		ajax(`<%= path %>/assets/templates/${self.type}.html`).then((template) => {

			const html = self.mustache(template, self.database.template)

			self.chart.innerHTML = html

			self.configure()

		})
		
	}

    configure() {

    	var self = this

		var app = () => chartbuilder.init(self.database, self.chart, d3, noUiSlider)

		this.loader(`<%= path %>/assets/modules/${self.type}.js`, app, document.body);

	}

    mustache(l, a, m, c) {

        var self = this

        function h(a, b) {
            b = b.pop ? b : b.split(".");
            a = a[b.shift()] || "";
            return 0 in b ? h(a, b) : a
        }
        var k = self.mustache,
            e = "";
        a = Array.isArray(a) ? a : a ? [a] : [];
        a = c ? 0 in a ? [] : [1] : a;
        for (c = 0; c < a.length; c++) {
            var d = "",
                f = 0,
                n, b = "object" == typeof a[c] ? a[c] : {},
                b = Object.assign({}, m, b);
            b[""] = {
                "": a[c]
            };
            l.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g, function(a, c, l, m, p, q, g) {
                f ? d += f && !p || 1 < f ? a : c : (e += c.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g, function(a, c, e, f, g, d) {
                    return c ? h(b, c) : f ? h(b, d) : g ? k(h(b, d), b) : e ? "" : (new Option(h(b, d))).innerHTML
                }), n = q);
                p ? --f || (g = h(b, g), e = /^f/.test(typeof g) ? e + g.call(b, d, function(a) {
                    return k(a, b)
                }) : e + k(d, g, b, n), d = "") : ++f
            })
        }
        return e
    }

	loader(url, code, location){

	    var tag = document.createElement('script');
	    tag.src = url;
	    tag.onload = code;
	    tag.onreadystatechange = code;
	    location.appendChild(tag);

	}

}