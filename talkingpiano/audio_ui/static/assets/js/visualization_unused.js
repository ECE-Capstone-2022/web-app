import {Palette, PianoKeyboard, Spectrogram} from "./visualizer.js";

window.CSRF_TOKEN = "{{ csrf_token }}";
  
function pianoVisualize() {
  console.log("visualizing");
  const paletteData = [[255,0,0],[255,128,0],[255,255,0],[128,255,0],[0,255,0],[0,255,128],[0,255,255],[0,128,255],[0,0,255],[128,0,255],[255,0,255],[255,0,128]];
  let palette = new Palette(paletteData);
  let levels = new Float32Array(61);
  let midi = new Float32Array(61);

  function draw(timeStamp) {
    const audioColors = palette.getKeyColors(levels);
    const midiColors = palette.getKeyColors(midi);
    pianoKeyboard.update(audioColors, midiColors);
    spectrogram.update(audioColors,midiColors);
    window.requestAnimationFrame(draw);
  }

  const pianoKeyboard = new PianoKeyboard(
    document.getElementById('keyboard'));
  
  pianoKeyboard.drawKeyboard();
  const spectrogram = new Spectrogram(
    document.getElementById("spectrogram"),
    pianoKeyboard.keySlices,
    600 //as a baseline height parameter
  );
  window.requestAnimationFrame(draw);

  document.getElementById("pianolizer").innerHTML += "<p>Hello</p>";
}

pianoVisualize();

//document.getElementById("visualButton").addEventListener("click", pianoVisualize);