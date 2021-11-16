import * as tone from 'tone'
import createElement from "../shared/createElement"
const timer = ms => new Promise(res => setTimeout(res, ms)) 

var self = {}

export default {

  init: function(sonicData, x, y, xVar, keyOrder, margin, domain, svg) {

    self.isPlaying = false
    
    self.sonicData = sonicData
    console.log("xVar",sonicData)
    self.x = x

    self.y = y

    self.keyOrder = keyOrder

    self.margin = margin

    const bpm = 400

    const duration = 10

    // const note = 60 / bpm

    const note = duration / self.sonicData[self.keyOrder[0]].length

    const low = 130.81

    const high = 261.63

    const scale = d3.scaleLinear()
          .domain(domain)
          .range([low,high])

    const button = createElement("button",{"id":"sonic", "tabindex" : "1", "tabindex" : "1", "aria-label" : "click to hear the chart values", "role" : "button"})

    const furniture = document.querySelector('#furniture');

    furniture.appendChild(button);

    const sonicButton = document.querySelector('#sonic');
    sonicButton.addEventListener('click', noiseLoop);
    sonicButton.addEventListener('keydown', sonicButtonKeydownHandler);
    sonicButton.addEventListener('keyup', sonicButtonKeyupHandler);

    function sonicButtonKeydownHandler (event) {
      // The action button is activated by space on the keyup event, but the
      // default action for space is already triggered on keydown. It needs to be
      // prevented to stop scrolling the page before activating the button.
      if (event.keyCode === 32) {
        event.preventDefault();
      }
      // If enter is pressed, activate the button
      else if (event.keyCode === 13) {
        event.preventDefault();
        noiseLoop();
      }
    }

    function sonicButtonKeyupHandler (event) {
      if (event.keyCode === 32) {
        event.preventDefault();
        noiseLoop();
      }
    }

    d3.select(`#${svg}`).append("circle")
        .attr("r",5)
        .attr("stroke", "red")
        .attr("cx", -200) // self.x(self.sonicData[self.keyOrder[0]][0]['Date']) + self.margin.left
        .attr("cy", -200) // self.y(self.sonicData[self.keyOrder[0]][0][self.keyOrder[0]]) + self.margin.top
        .attr("fill","none")
        .attr("id", "playHead")
          
    function makeNoise(xVar, yVar) {
        

        console.log(self.sonicData[yVar].length * note, note)

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

        self.sonicData[yVar].forEach(function(d,i) {          

          if (i == 0) { 
            synth.triggerAttackRelease(scale(d[yVar]), self.sonicData[yVar].length * note).onsilence(clearSynth())
            d3.select("#playHead")
                .attr("cx",self.x(self.sonicData[yVar][i][xVar]) + self.margin.left)
                .attr("cy",self.y(self.sonicData[yVar][i][yVar]) + self.margin.top)
          }
          else {
            tone.Transport.schedule(function(){
              d3.select("#playHead").transition().duration(note)
                .ease(d3.easeLinear)
                .attr("cx",self.x(self.sonicData[yVar][i][xVar]) + self.margin.left)
                .attr("cy",self.y(self.sonicData[yVar][i][yVar]) + self.margin.top)
              
              synth.frequency.rampTo(scale(d[yVar]), note);
            }, i * note);
          }

        })
      
        tone.Transport.position = "0:0:0"
        tone.Transport.start()
      
        function clearSynth () {
          console.log("finished")
        }

    }

    function beep(key) {

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
      
    }

    function speaker(text) {

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
    }

    async function noiseLoop() {

      if (!self.isPlaying) {

        self.isPlaying = true

        const text1 = await speaker(`The lowest value on the chart is ${domain[0]}, and it sounds like `)

        const beep1 = await beep(scale(domain[0]))

        await timer(1200);

        const text2 = await speaker(`The highest value on the chart is ${domain[1]}, and it sounds like `)

        const beep2 = await beep(scale(domain[1]))

        await timer(1200);

        for await (const datastream of self.keyOrder) {

              d3.select("#playHead")
                .attr("cx",self.x(self.sonicData[datastream][0][xVar]) + self.margin.left)
                .attr("cy",self.y(self.sonicData[datastream][0][datastream]) + self.margin.top)

          const category = await speaker(datastream)

          makeNoise(xVar, datastream)

          await timer(self.sonicData[datastream].length * note * 1000);

        }

        self.isPlaying = false

      }

    }

  },

  update: function(x, y, svg) {

    self.x = x

    self.y = y

    d3.select(`#${svg}`).append("circle")
        .attr("r",5)
        .attr("stroke", "red")
        .attr("cx",-200)
        .attr("cy",-200)
        .attr("fill","none")
        .attr("id", "playHead")


  }

}