import * as tone from 'tone'
const timer = ms => new Promise(res => setTimeout(res, ms)) 

// export default function sonic(sonicData, x, y, keyOrder, margin, domain, svg) {

var sonic = {

  init: function(sonicData, x, y, keyOrder, margin, domain, svg) {

    const bpm = 400

    const note = 60 / bpm

    const low = 130.81

    const high = 261.63

    let isPlaying = false

    const scale = d3.scaleLinear()
          .domain(domain)
          .range([low,high])

    var button = document.createElement("button")

    button.setAttribute("id", "sonic");

    button.setAttribute("tabindex", "1");

    button.setAttribute("aria-label", "click to hear the chart values");

    button.setAttribute("role", "button");

    var furniture = document.getElementById('furniture');

    furniture.appendChild(button);

    var sonicButton = document.getElementById('sonic');
    sonicButton.addEventListener('click', noiseLoop);
    sonicButton.addEventListener('keydown', sonicButtonKeydownHandler);
    sonicButton.addEventListener('keyup', sonicButtonKeyupHandler);

    d3.select(`#${svg}`).append("circle")
        .attr("r",5)
        .attr("stroke", "red")
        .attr("cx",x(sonicData[keyOrder[0]][0]['Date']) + margin.left)
        .attr("cy",y(sonicData[keyOrder[0]][0][keyOrder[0]]) + margin.top)
        .attr("fill","none")
        .attr("id", "playHead")

  },

  sonicButtonKeydownHandler: function(event) {

    if (event.keyCode === 32) {
      event.preventDefault();
    }
    // If enter is pressed, activate the button
    else if (event.keyCode === 13) {
      event.preventDefault();
      noiseLoop();
    }
  },

  sonicButtonKeyupHandler: function(event) {
    if (event.keyCode === 32) {
      event.preventDefault();
      noiseLoop();
    }
  },
        
  makeNoise: function(xVar, yVar) {
      
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

      sonicData[yVar].forEach(function(d,i) {          

        if (i == 0) { 
          synth.triggerAttackRelease(scale(d[yVar]), sonicData[yVar].length * note).onsilence(clearSynth())
          d3.select("#playHead")
              .attr("cx",x(sonicData[yVar][i][xVar]) + margin.left)
              .attr("cy",y(sonicData[yVar][i][yVar]) + margin.top)
        }
        else {
          tone.Transport.schedule(function(){
            d3.select("#playHead").transition().duration(500)
              .ease(d3.easeLinear)
              .attr("cx",x(sonicData[yVar][i][xVar]) + margin.left)
              .attr("cy",y(sonicData[yVar][i][yVar]) + margin.top)
            
            synth.frequency.rampTo(scale(d[yVar]), note);
          }, i * note);
        }

      })
    
      tone.Transport.position = "0:0:0"
      tone.Transport.start()
    
      function clearSynth () {
        console.log("finished")
      }

  },

  beep : function(key) {

      return new Promise( (resolve, reject) => {

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

        synth.triggerAttackRelease(key, 1).onend(clearSynth())

        tone.Transport.position = "0:0:0"

        tone.Transport.start()

        function clearSynth () {
          resolve({ status : "success"})
        }


      }).catch(function(e) {

      reject(e);

    });
    
  },

  speaker: function(text) {

      return new Promise( (resolve, reject) => {

      if ('speechSynthesis' in window) {
       
        var msg = new SpeechSynthesisUtterance();

        msg.text = text

        window.speechSynthesis.speak(msg);

        msg.onend = function() {

          resolve({ status : "success"})

        };

      } else {

        resolve({ status : "no txt to speach"})

      }

      }).catch(function(e) {

      reject(e);

    });
  },

  noiseLoop: async function() {

    if (!isPlaying) {

      isPlaying = true

      const text1 = await speaker(`The lowest value on the chart is ${domain[0]}, and it sounds like `)

      const beep1 = await beep(scale(domain[0]))

      await timer(1200);

      const text2 = await speaker(`The highest value on the chart is ${domain[1]}, and it sounds like `)

      const beep2 = await beep(scale(domain[1]))

      await timer(1200);

      for await (const datastream of keyOrder) {

            d3.select("#playHead")
              .attr("cx",x(sonicData[datastream][0]['Date']) + margin.left)
              .attr("cy",y(sonicData[datastream][0][datastream]) + margin.top)

        const category = await speaker(datastream)

        makeNoise('Date', datastream)

        await timer(sonicData[datastream].length * note * 1000);

      }

      isPlaying = false

    }

  }

}

export default sonic