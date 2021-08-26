import tone from "tone"

export default {

  create(svg) {

    svg.append("circle")
        .attr("r",20)
        .attr("cx",100)
        .attr("cy",50)
        .attr("fill","lightgreen")
        .style("cursor", "pointer")
        .attr("id", "playButton")
        .on("click", noiseLoop)

    svg.append("circle")
        .attr("r",5)
        .attr("stroke", "red")
        .attr("cx",x(this.data[0].Date))
        .attr("cy",y(this.data[0]['Original goal']))
        .attr("fill","none")
        .attr("id", "playHead")

  }

}


/*

    let bpm = 400

    let note = 60 / bpm

    let low = 130.81

    let high = 261.63

    let scale = d3.scaleLinear()
          .domain([0, d3.max(this.data, d => d['Original goal'])])
          .range([low,high])





          

    function makeNoise(xVar, yVar) {
        
        var synth = new tone.Synth({
          envelope: {
            decay: 0,
            sustain:1,
            release:0.5
          },
          oscillator : {
            count: 8,
            spread: 30,
            type : "sawtooth4"
          }
        }
        ).toDestination();
        console.log("start", yVar)
      
        self.tempLabelData[yVar].forEach(function(d,i) {
          if (i == 0) { 
            synth.triggerAttackRelease(scale(d[yVar]), self.tempLabelData[yVar].length * note).onsilence(clearSynth())
            d3.select("#playHead")
                .attr("cx",x(self.tempLabelData[yVar][i][xVar]))
                .attr("cy",y(self.tempLabelData[yVar][i][yVar]))
          }
          else {
            tone.Transport.schedule(function(){
              d3.select("#playHead").transition().duration(500)
                .ease(d3.easeLinear)
                .attr("cx",x(self.tempLabelData[yVar][i][xVar]))
                .attr("cy",y(self.tempLabelData[yVar][i][yVar]))
              
              synth.frequency.rampTo(scale(d[yVar]), note);
            }, i*note);
          }
        })
      
        tone.Transport.position = "0:0:0"
        tone.Transport.start()
      
        function clearSynth () {
          console.log("finished")
        }
    }

    function noiseLoop() {

      var keyOrder = ['Original goal', 'Revised goal', keys[0]]
      
      makeNoise('Date', keyOrder[0])
      console.log(self.tempLabelData[keyOrder[1]].length * note * 1000)
      setTimeout(function() { makeNoise('Date', keyOrder[1])}, self.tempLabelData[keyOrder[1]].length * note * 1000 + 2000)
      setTimeout(function() { makeNoise('Date', keyOrder[2])}, (self.tempLabelData[keyOrder[1]].length * note * 1000) + (self.tempLabelData[keyOrder[2]].length * note * 1000) + 4000)

    }

*/