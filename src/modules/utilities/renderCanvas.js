import html2canvas from 'html2canvas'

export default function renderCanvas (social) {
    console.log("renderCanvas")
    // Maybe re-write with https://html2canvas.hertzen.com/ instead which seems supported and popular

     const dimensons = {"twitter": {"width":1200,"height":675, "scaling": 2}, 
        "instagram": {"width":1200,"height":1200, "scaling": 2},
        "facebook": {"width":1200,"height":630, "scaling": 2}    
        }

    if (document.querySelector("canvas")) {
        document.querySelector("canvas").remove()
      }

      var renderCanvas = document.createElement("canvas")
      renderCanvas.id = "canvas"
      renderCanvas.width = dimensons[social].width
      renderCanvas.height = dimensons[social].height
      
      console.log("height", dimensons[social].height, "width", dimensons[social].width)

      document.body.appendChild(renderCanvas)

    var element = document.getElementById('app')

    html2canvas(element, {canvas:renderCanvas, scale: 2}).then(function() {
         document.getElementById('downloadLink').innerHTML = " | "
        var link = document.createElement('a');
        link.download = 'chart.png'
        link.text = "Download chart"
        link.href = document.getElementById('canvas').toDataURL()
        document.getElementById('downloadLink').appendChild(link)
    })


}