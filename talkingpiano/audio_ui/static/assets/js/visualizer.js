/*
  visualizer.js has parts from the Pianolizer piano visualization
  application created by Stanislaw Pusep. Github repo linked here: 
  https://github.com/creaktive/pianolizer

  Parts from Pianolizer:
  Palette Class (and methods)
  Piano Keyboard Class (and methods exceput update)
  Spectrogram Class (and methods)
  'pianoVisualize' Function

  For the rest:

  Author: John Martins
  AndrewID: johnmart
  Contact: johnmartins@cmu.edu / jwamartins@gmail.com

*/


var noteAudio = []; //List holding loaded audio elements for each piano note
var noteColors = []; //List holding color information for each piano note
var sampleDelay = 67; //time delay (ms) between each sample of keys




//Attempt to fade note colors
/*
//Returns hex value of red with intensity (0-1) --> 0 is full red and 1 is white
function redToWhite(i){
  let ratio = Math.round(i*255);
  let hex = ratio.toString(16);
  return "#" + "FF" + hex + hex;
}

//Returns hex value of red with intensity (0-1) --> 0 is full red and 1 is black
function redToBlack(i){
  let ratio = Math.round((i-1)*255);
  let hex = ratio.toString(16);
  return "#" + hex + "0000";
}
*/

/**
 * Color management helper class.
 *
 * @class Palette
 */
class Palette {
  /**
   * Creates an instance of Palette.
   * @param {Array} palette RGB tuples; one per semitone.
   * @memberof Palette
   */
  constructor (palette) {
    this.palette = palette
    this.startOffset = 0
  }

  /**
   * Shift the colors around the octave.
   *
   * @memberof Palette
   */
  get rotation () {
    return this.startOffset
  }

  /**
   * Shift the colors around the octave.
   *
   * @memberof Palette
   */
  set rotation (n) {
    this.startOffset = n | 0
  }

  /**
   * Applies the intensity levels to the palette.
   *
   * @param {Float32Array} levels Array with the intensity levels.
   * @return {Uint32Array} Palette with the levels applied, in a format compatible with canvas pixels.
   * @memberof Palette
   */
  getKeyColors (levels) {
    const levelsNum = levels.length
    const keyColors = new Uint32Array(levelsNum)

    const paletteLength = this.palette.length
    for (let key = 0; key < levelsNum; key++) {
      const index = this.startOffset + key // start from C
      const rgbArray = this.palette[index % paletteLength]
        .map(value => Math.round(levels[key] * value) | 0)
      keyColors[key] = (rgbArray[2] << 16) | (rgbArray[1] << 8) | rgbArray[0]
    }

    return keyColors
  }
}

class PianoKeyboard {
  // Shamelessly stolen from http://www.quadibloc.com/other/cnv05.htm
  constructor (svgElement, scale = 1) {
    this.svgElement = svgElement
    this.scale = scale

    this.roundCorners = 2
    this.whiteHeight = 150 * scale
    this.blackHeight = 100 * scale
    this.whiteKeys = [23, 24, 23, 24, 23, 23, 24].map(x => x * scale)
    this.whiteTone = [1, 3, 5, 6, 8, 10, 12]
    this.blackKeys = [14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13].map(x => x * scale)
    this.blackTone = [0, 2, 0, 4, 0, 0, 7, 0, 9, 0, 11, 0]
    this.neutralColor = 0x55

    this.ns = 'http://www.w3.org/2000/svg'
    this.keySlices = null

    this.keysNum = 69
    this.keys = new Array(this.keysNum)
    this.labels = new Array(this.keysNum)
    this.blackOffset = 10
    this.whiteOffset = 0
    this.whiteIndex = 2 // C2
    this.startFrom = 4
    this.startOctave = 2
  }

  drawKey (index, offset, width, height, group, color) {
    const keyElement = document.createElementNS(this.ns, 'rect')
    keyElement.setAttribute('x', offset)
    keyElement.setAttribute('y', 0)
    keyElement.setAttribute('rx', this.roundCorners)
    keyElement.setAttribute('width', width - 1)
    keyElement.setAttribute('height', height)
    keyElement.setAttribute('id', index)
    if(color == 'white'){
      keyElement.setAttribute('style', "fill: white")
      noteColors[index] = 'white'
    }
    else{
      keyElement.setAttribute('style', "fill: black")
      noteColors[index] = 'black'
    }
    keyElement.classList.add('piano-key')
    this.keys[index] = keyElement
    group.appendChild(keyElement)
  }

  drawLabel (index, offset, note, octave, group) {
    const labelElement = document.createElementNS(this.ns, 'text')
    labelElement.setAttribute('x', offset + 5 * this.scale)
    labelElement.setAttribute('y', this.whiteHeight - 6 * this.scale)
    labelElement.classList.add('piano-key-label')
    labelElement.textContent = String.fromCharCode(note + (note < 5 ? 67 : 60)) + octave
    this.labels[index] = labelElement
    group.appendChild(labelElement)
  }

  // Inspired by https://github.com/davidgilbertson/sight-reader/blob/master/app/client/Piano.js
  drawKeyboard () {
    const whiteKeyGroup = document.createElementNS(this.ns, 'g')
    const blackKeyGroup = document.createElementNS(this.ns, 'g')

    let blackOffset = this.blackOffset
    let whiteOffset = this.whiteOffset
    let whiteIndex = this.whiteIndex

    const keySlices = []
    let blackSum = 0
    for (let i = this.startFrom; i < this.keysNum + this.startFrom; i++) {
      // black
      const blackIndex = i % this.blackKeys.length
      const blackWidth = this.blackKeys[blackIndex]
      const index = i - this.startFrom
      keySlices.push(blackWidth)
      blackSum += blackWidth
      if (this.blackTone[blackIndex]) {
        this.drawKey(index, blackOffset, blackWidth, this.blackHeight, blackKeyGroup, 'black')
      } else {
        // white
        const note = whiteIndex % this.whiteKeys.length
        const whiteWidth = this.whiteKeys[note]
        this.drawKey(index, whiteOffset, whiteWidth, this.whiteHeight, whiteKeyGroup, 'white')

        const octave = 0 | whiteIndex / this.whiteKeys.length + this.startOctave
        this.drawLabel(index, whiteOffset, note, octave, whiteKeyGroup)

        whiteIndex++
        whiteOffset += whiteWidth
      }
      blackOffset += blackWidth
    }

    // adjust padding of the key roots
    this.keySlices = new Uint8Array(keySlices)
    this.keySlices[0] += this.blackOffset
    this.keySlices[this.keySlices.length - 1] += whiteOffset - blackSum - this.blackOffset

    this.svgElement.appendChild(whiteKeyGroup)
    this.svgElement.appendChild(blackKeyGroup)

    this.svgElement.setAttribute('width', whiteOffset)
    this.svgElement.setAttribute('height', this.whiteHeight)
  }

  bgrIntegerToHex (bgrInteger, start = 0) {
    const range = (0xff - start) / 0xff
    const rgbArray = [
      (bgrInteger & 0x0000ff),
      (bgrInteger & 0x00ff00) >> 8,
      (bgrInteger & 0xff0000) >> 16
    ].map(c => Math.round(start + c * range) | 0)
    return '#' + rgbArray.map(c => c.toString(16).padStart(2, '0')).join('')
  }

  //update (audioColors, midiColors) {
    update () {

      for (let key = 0; key < 69; key++){
        let keyElem = document.getElementById(key)
        let note = noteAudio[key]
        //let intensity; //for fading

        if(note.paused){
          if(noteColors[key] == 'white'){
            keyElem.style.fill = '#FFFFFF'
          }
          else{
            keyElem.style.fill = '#000000'
          }
        }
        else{
          if(note.currentTime < (note.duration/60)){
            keyElem.style.fill = '#FF0000'
          }
          else{
            if(noteColors[key] == 'white'){
              keyElem.style.fill = '#FFFFFF'
            }
            else{
              keyElem.style.fill = '#000000'
            }
          }
          //for fading
          /*
          intensity = (note.currentTime) / note.duration
          if(intensity > 1){intensity = 1}

          let colorString;
          if(noteColors[key] == 'white'){
            colorString = redToWhite(intensity);
          }
          else{
            colorString = redToBlack(intensity);
          }
          keyElem.style.fill = colorString
          */
        }
        
      }
      
    
    
    /*
    for (let key = 0; key < this.keysNum; key++) {
      this.keys[key].style.fill = this.bgrIntegerToHex(audioColors[key])

      const midiColor = this.bgrIntegerToHex(midiColors[key], this.neutralColor)
      this.keys[key].style.stroke = midiColor
      if (this.labels[key] !== undefined) {
        this.labels[key].style.fill = midiColor
      }
    }
    */
  }
}

/*
class PianoKeyboardFull extends PianoKeyboard {
  constructor (svgElement, scale = 1) {
    super(svgElement, scale)

    this.keysNum = 88
    this.keys = new Array(this.keysNum)
    this.blackOffset = 7 * scale
    this.whiteOffset = 0
    this.whiteIndex = 5 // A0
    this.startFrom = 9
    this.startOctave = 0
  }
}
*/

class Spectrogram {
  constructor (canvasElement, keySlices, height) {
    this.canvasElement = canvasElement
    this.keySlices = keySlices
    this.lastMidiColors = new Uint32Array(keySlices.length)

    this.width = keySlices.reduce((a, b) => a + b)
    this.height = height

    canvasElement.width = this.width
    canvasElement.height = this.height

    this.context = canvasElement.getContext('2d')
    this.imageData = this.context.createImageData(this.width, this.height)

    this.bufArray = new ArrayBuffer(this.width * this.height * 4)
    this.buf8 = new Uint8Array(this.bufArray)
    this.buf32 = new Uint32Array(this.bufArray)

    canvasElement.onclick = event => {
      event.preventDefault()
      const a = document.createElement('a')
      a.href = canvasElement.toDataURL('image/png')
      a.download = 'pianolizer.png'
      a.click()
    }
  }

  update (audioColors, midiColors) {
    // shift the whole buffer 1 line upwards
    const lastLine = this.width * (this.height - 1)
    for (let i = 0; i < lastLine; i++) {
      this.buf32[i] = this.buf32[i + this.width]
    }

    // fill in the bottom line
    const keysNum = this.keySlices.length
    const alphaOpaque = 0xff000000
    for (let key = 0, j = lastLine; key < keysNum; key++) {
      const slice = this.keySlices[key]
      if (this.lastMidiColors[key] !== midiColors[key]) {
        for (let i = 0; i < slice; i++, j++) {
          const bgrInteger = midiColors[key] || this.lastMidiColors[key]
          this.buf32[j] = alphaOpaque | bgrInteger
        }
        this.lastMidiColors[key] = midiColors[key]
      } else {
        for (let i = 0; i < slice; i++, j++) {
          const bgrInteger = i < 1 || i >= slice - 1
            ? midiColors[key]
            : audioColors[key]
          this.buf32[j] = alphaOpaque | bgrInteger
        }
      }
    }

    // render
    this.imageData.data.set(this.buf8)
    this.context.putImageData(this.imageData, 0, 0)
  }
}



window.CSRF_TOKEN = "{{ csrf_token }}";
  
function pianoVisualize() {
  console.log("visualizing");
  const paletteData = [[255,0,0],[255,128,0],[255,255,0],[128,255,0],[0,255,0],[0,255,128],[0,255,255],[0,128,255],[0,0,255],[128,0,255],[255,0,255],[255,0,128]];
  let palette = new Palette(paletteData);
  let levels = new Float32Array(70);
  let midi = new Float32Array(70);

  function draw(timeStamp) {
    //const audioColors = palette.getKeyColors(levels);
    //const midiColors = palette.getKeyColors(midi);
    //console.log(audioColors);
    //console.log(midiColors);
    while(noteAudio.length == 0){} //loop until noteAudio has things in it
    pianoKeyboard.update();
    //pianoKeyboard.update(audioColors, midiColors);
    //spectrogram.update(audioColors,midiColors);
    window.requestAnimationFrame(draw);
  }

  const pianoKeyboard = new PianoKeyboard(
    document.getElementById('keyboard'));
  
  pianoKeyboard.drawKeyboard();
  //const spectrogram = new Spectrogram(
  //  document.getElementById("spectrogram"),
  //  pianoKeyboard.keySlices,
  //  600 //as a baseline height parameter
  //);
  window.requestAnimationFrame(draw);

  document.getElementById("pianolizer").innerHTML += "<p>Hello</p>";
}



//Loads prepaired audio notes of each note into an array of notes 
function loadNotes(){
  for(let i = 0; i < 88; i++){
    let currAudio = new Audio('/media/audio/mp3Notes/' + (i+1).toString() + '.mp3');
    //currAudio.src = '/media/audio/mp3Notes/' + (i+1).toString() + '.mp3';
    currAudio.load();
    noteAudio[i] = currAudio;
  }
}

//Triggers audio file for ith piano note at specified volume
function playNote(i, vol) {
  let note = noteAudio[i];

  if(vol == -1){
    note.paused = true;
    note.currentTime = 0;
  }
  else{  
    note.volume = vol;
    if(note.paused){
      let key = document.getElementById(i);
      key.setAttribute('style', "fill: red")
      note.play();
    }
    else{
      note.currentTime = 0;
    }
  }
}


//'getCookie' function taken from Django AJAX blog on testdriven.io
//link: https://testdriven.io/blog/django-ajax-xhr/
//Author: Yacine Rouizi
//Gets document CSRF token for later Push requests
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


//AJAX call to retrieve input list from views.py
//Triggers playDelayedNotes once note array is retrieved
function getArray(){
  let arr;
  $.ajax({
    url: "getArray",
    type: "POST",
    dataType: "json",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCookie("csrftoken"),  // don't forget to include the 'getCookie' function
    },
    success: (data) => {
      console.log(data.data);
      playDelayedNotes(data.data, 0);
    },
    error: (error) => {
      console.log(error);
      console.log("ERROR")
    }
  });   
}


//Loops through each note in array and calls playNote on each
function playArray(arr){
  var arrayLength = arr.length
  if(arrayLength > 69){
    arrayLength = 69
  }
  for(let note = 0; note < arrayLength; note++){
    if(arr[note] != 0){
      console.log("playing array index");
      //playNote(note, arr[note]);
      playNote(note, .2);
    }
  }
}


function playDelayedNotes(arr, index){
  if((index < arr.length)){
    playArray(arr[index]);
    setTimeout(() => {playDelayedNotes(arr, index+1)}, sampleDelay);
  }
}


window.onload = loadNotes();
document.getElementById("visualButton").addEventListener("click", pianoVisualize);

