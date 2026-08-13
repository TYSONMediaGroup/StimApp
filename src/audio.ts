// Audio Context and Nodes
let audioCtx: AudioContext | null = null;
let droneOsc: OscillatorNode | null = null;
let dronePanner: StereoPannerNode | null = null;
let droneGain: GainNode | null = null;

let pinkNoiseSource: AudioBufferSourceNode | null = null;
let pinkNoiseGain: GainNode | null = null;

const pentatonicFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C4, D4, E4, G4, A4, C5, D5, E5

export function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new AudioContextClass();

  // Setup Drone for Fluid Mode
  droneOsc = audioCtx.createOscillator();
  dronePanner = audioCtx.createStereoPanner();
  const droneFilter = audioCtx.createBiquadFilter();
  droneGain = audioCtx.createGain();

  droneOsc.type = 'sine';
  droneOsc.frequency.value = 150;
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 600;
  droneGain.gain.value = 0;

  droneOsc.connect(dronePanner);
  dronePanner.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(audioCtx.destination);
  droneOsc.start();

  // Setup Pink Noise for Aura Mode
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    let white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Compensate for gain
  }

  pinkNoiseSource = audioCtx.createBufferSource();
  pinkNoiseSource.buffer = noiseBuffer;
  pinkNoiseSource.loop = true;
  pinkNoiseGain = audioCtx.createGain();
  pinkNoiseGain.gain.value = 0;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 800; // soft rushing wind

  pinkNoiseSource.connect(noiseFilter);
  noiseFilter.connect(pinkNoiseGain);
  pinkNoiseGain.connect(audioCtx.destination);
  pinkNoiseSource.start();
}

let lastOut = 0;

export function setAudioMode(mode: 'particles' | 'fluid' | 'grid' | 'aura') {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Fade out drone
  if (droneGain) {
    if (mode === 'fluid') {
      droneGain.gain.setTargetAtTime(0.4, now, 0.5);
    } else {
      droneGain.gain.setTargetAtTime(0, now, 0.5);
    }
  }

  // Fade out pink noise
  if (pinkNoiseGain) {
    if (mode === 'aura') {
      pinkNoiseGain.gain.setTargetAtTime(0.2, now, 1.0);
    } else {
      pinkNoiseGain.gain.setTargetAtTime(0, now, 1.0);
    }
  }
}

export function handleAudioPointerMove(x: number, y: number, width: number, height: number, mode: string) {
  if (!audioCtx) return;

  if (mode === 'fluid' && dronePanner && droneOsc) {
    const xRatio = x / width;
    const yRatio = 1 - (y / height); // Invert Y
    
    // Pan from -1 to 1
    const panValue = Math.max(-1, Math.min(1, (xRatio * 2) - 1));
    dronePanner.pan.setTargetAtTime(panValue, audioCtx.currentTime, 0.1);
    
    // Modulate freq based on Y (100Hz to 300Hz)
    const freqValue = 100 + (yRatio * 200);
    droneOsc.frequency.setTargetAtTime(freqValue, audioCtx.currentTime, 0.1);
  }
}

export function playPluck(x: number, width: number) {
  if (!audioCtx || audioCtx.state !== 'running') return;

  const osc = audioCtx.createOscillator();
  const pluckGain = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();
  
  const index = Math.floor(Math.max(0, Math.min(0.999, x / width)) * pentatonicFrequencies.length);
  osc.frequency.value = pentatonicFrequencies[index];
  osc.type = 'sine'; // Softest tone
  
  const panValue = Math.max(-1, Math.min(1, ((x / width) * 2) - 1));
  panner.pan.value = panValue;

  osc.connect(pluckGain);
  pluckGain.connect(panner);
  panner.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  pluckGain.gain.setValueAtTime(0, now);
  pluckGain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Fade in
  pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0); // Slow fade out
  
  osc.start(now);
  osc.stop(now + 2.1);
}
