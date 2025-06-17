oldChordIdx = 0
chordHistorial = []

let essentia;
let isEssentiaInstance = false;

let btn_status = false

function micFunction(e) {
    const tag = e.children[0]
    if (btn_status) {
        stopMicRecordStream();
        tag.classList.remove('bi-mic-fill')
        tag.classList.add('bi-mic-mute-fill')
        document.getElementById(`CH-${oldChordIdx}`).classList.remove('selected-chord')
        btn_status = false
        return;
    }
    document.getElementById(`CH-${oldChordIdx}`).classList.add('selected-chord')
    EssentiaWASM().then(function (essentiaModule) {
        if (!isEssentiaInstance) {
            essentia = new Essentia(essentiaModule);
            isEssentiaInstance = true;
        }
        // create Web Audio API audio context. Throw an error if the browser has no support
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        } catch (e) {
            throw "Could not instantiate AudioContext: " + e.message;
        }
        startMicRecordStream(
            audioCtx,
            bufferSize,
            onRecordFeatureExtractor
        );
    })
    tag.classList.remove('bi-mic-mute-fill')
    tag.classList.add('bi-mic-fill')
    btn_status = true
}
// global var for web audio api AudioContext
let audioCtx;

// buffer size microphone stream
let bufferSize = 4096;
// threshold for filtering the chord detection results
let chordThreshold = 0.6;
// global var getUserMedia mic stream
let gumStream;

// record native microphone input and do further audio processing on each audio buffer using the given callback functions
function startMicRecordStream(
    audioCtx,
    bufferSize,
    onProcessCallback,
    callback
) {
    // cross-browser support for getUserMedia
    navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    
    if (navigator.getUserMedia) {
        console.log("Initializing audio...");
        navigator.getUserMedia(
            { audio: true, video: false },
            function (stream) {
                gumStream = stream;
                if (gumStream.active) {
                    console.log("Audio context sample rate = " + audioCtx.sampleRate);
                    var mic = audioCtx.createMediaStreamSource(stream);
                    // We need the buffer size that is a power of two
                    if (bufferSize % 2 != 0 || bufferSize < 256) {
                        throw "Choose a buffer size that is a power of two and greater than 256";
                    }
                    const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
                    // onprocess callback (here we can use essentia.js algos)
                    scriptNode.onaudioprocess = onProcessCallback;
                    // It seems necessary to connect the stream to a sink for the pipeline to work, contrary to documentataions.
                    // As a workaround, here we create a gain node with zero gain, and connect temp to the system audio output.
                    const gain = audioCtx.createGain();
                    gain.gain.setValueAtTime(0, audioCtx.currentTime);
                    mic.connect(scriptNode);
                    scriptNode.connect(gain);
                    gain.connect(audioCtx.destination);

                    if (callback) {
                        callback();
                    }
                } else {
                    throw "Mic stream not active";
                }
            },
            function (message) {
                throw "Could not access microphone - " + message;
            }
        );
    } else {
        throw "Could not access microphone - getUserMedia not available";
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}


// stop mic recording
function stopMicRecordStream() {
    console.log("Stopped recording ...");
    // stop mic stream
    gumStream.getAudioTracks().forEach(function (track) {
        track.stop();
    });
    // Cierra el AudioContext por completo y libera sus recursos
    if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
    }
    // Limpia las referencias
    audioCtx = null; 
    chordHistorial.length = 0;
}

// ScriptNodeProcessor callback function to extract pitchyin feature using essentia.js and plotting it on the front-end
function onRecordFeatureExtractor(event) {
    // convert the float32 audio data into std::vector<float> for using essentia algos
    let bufferSignal = essentia.arrayToVector(
        event.inputBuffer.getChannelData(0)
    );

    if (!bufferSignal) {
        throw "onRecordingError: empty audio signal input found!";
    }

    let chordFeatures = computeChords(bufferSignal, bufferSize);
    if (chordHistorial.length < 3) {
        chordHistorial.push(chordFeatures.chord) 
    } else {
        chordHistorial.shift()
        chordHistorial.push(chordFeatures.chord)
    }
    if (new Set(chordHistorial).size === 1) {
        newChordIdx = nearSearch(oldChordIdx, chordHistorial[0], chordsList);
        changeChord(newChordIdx,oldChordIdx);
        oldChordIdx = newChordIdx;
    }

}

// compute chords from an audio buffer vector
const computeChords = function (audioVectorBuffer, frameSize) {

    let hpcpPool = new essentia.module.VectorVectorFloat();

    // we need to compute the following signal process chain
    // audio frame => windowing => spectrum => spectral peak => spectral whitening => HPCP => ChordDetection
    let windowOut = essentia.Windowing(
        audioVectorBuffer,
        true,
        frameSize,
        "blackmanharris62"
    );

    let spectrumOut = essentia.Spectrum(windowOut.frame, frameSize);

    let peaksOut = essentia.SpectralPeaks(
        spectrumOut.spectrum,
        0,
        4000,
        100,
        60,
        "frequency",
        audioCtx.sampleRate
    );

    let whiteningOut = essentia.SpectralWhitening(
        spectrumOut.spectrum,
        peaksOut.frequencies,
        peaksOut.magnitudes,
        4000,
        audioCtx.sampleRate
    );

    let hpcpOut = essentia.HPCP(
        peaksOut.frequencies,
        whiteningOut.magnitudes,
        true,
        500,
        0,
        4000,
        false,
        60,
        true,
        "unitMax",
        440,
        audioCtx.sampleRate,
        12
    );

    hpcpPool.push_back(hpcpOut.hpcp);

    let chordDetect = essentia.ChordsDetection(hpcpPool, bufferSize, audioCtx.sampleRate);

    let chords = chordDetect.chords.get(0);

    let chordsStrength = chordDetect.strength.get(0);

    return { chord: chords, strength: chordsStrength };
};

function nearSearch(actualIdx, chord, chordArray) {
    result = chordArray.slice(actualIdx, actualIdx + 4).indexOf(chord)
    if (result === -1) {
        return actualIdx
    }
    return result + actualIdx
}

function changeChord(newIdx,oldIdx){
    const oldCh = document.getElementById(`CH-${oldIdx}`)
    oldCh.classList.remove('selected-chord')
    
    const newCh = document.getElementById(`CH-${newIdx}`)
    newCh.classList.add('selected-chord')
    newCh.parentElement.scrollIntoView({block:'center', behavior: 'smooth'})
}

function changeByUserSelectedChord(idx){
    changeChord(idx,oldChordIdx)
    oldChordIdx = idx
}