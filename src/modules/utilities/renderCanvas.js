export default function renderCanvas (social) {

    // Maybe re-write with https://html2canvas.hertzen.com/ instead which seems supported and popular

    const dimensons = {"twitter": {"width":1200,"height":675}, 
        "instagram": {"width":1200,"height":1200}    
        }

    if (document.querySelector("canvas")) {
        document.querySelector("canvas").remove()
      }

      var canvas = document.createElement("canvas")
      canvas.id = "canvas"
      canvas.width = dimensons[social].width
      canvas.height = dimensons[social].height
      console.log("canvas", canvas)

      document.body.appendChild(canvas)


    // this copies computed styles from elements to the copied element and is magical

    var realStyle = function(_elem, _style) {
    var computedStyle;
    if ( typeof _elem.currentStyle != 'undefined' ) {
        computedStyle = _elem.currentStyle;
    } else {
        computedStyle = document.defaultView.getComputedStyle(_elem, null);
    }

        return _style ? computedStyle[_style] : computedStyle;
    };

    var copyComputedStyle = function(src, dest) {
        var s = realStyle(src);
        for ( var i in s ) {
            // Do not use `hasOwnProperty`, nothing will get copied
            if ( typeof s[i] == "string" && s[i] && i != "cssText" && !/\d/.test(i) ) {
                // The try is for setter only properties
                try {
                    dest.style[i] = s[i];
                    // `fontSize` comes before `font` If `font` is empty, `fontSize` gets
                    // overwritten.  So make sure to reset this property. (hackyhackhack)
                    // Other properties may need similar treatment
                    if ( i == "font" ) {
                        dest.style.fontSize = s.fontSize;
                    }
                } catch (e) {}
            }
        }
    };

    var element = document.getElementById('app')
    var copy = element.cloneNode(true);
    // console.log("copy",copy)
    copyComputedStyle(element, copy); 

    var childNodes = Array.from(element.querySelectorAll("*"))
    var copyNodes = Array.from(copy.querySelectorAll("*"))
    childNodes.forEach(function(node, i) {
      copyComputedStyle(node, copyNodes[i]);
    })
    // copyComputedStyle(document.getElementById('chartTitle'), copy.querySelector('#chartTitle'));

    // var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var d = document.implementation.createHTMLDocument();

    d.body.appendChild(copy);

    rasterizeHTML.drawDocument(d, canvas).then(function(renderResult) {
        ctx.drawImage(renderResult.image, -8, -8);
        document.getElementById('downloadLink').innerHTML = " | "
        var link = document.createElement('a');
        link.download = 'chart.png'
        link.text = "Download chart"
        link.href = document.getElementById('canvas').toDataURL()
        document.getElementById('downloadLink').appendChild(link)
    });

    // var download = function() {
    //   var link = document.createElement('a');
    //   link.download = 'chart.png';
    //   link.href = document.getElementById('canvas').toDataURL()
    //   link.click();
    // }


}