/**
 * SoundManager — Synthesized retro sound effects using Web Audio API
 * No external audio files needed.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function resumeAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

function playTone(freq, duration, type = 'square', volume = 0.15, ramp = true) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  if (ramp) {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration, volume = 0.08) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export const Sound = {
  coinPickup() {
    playTone(880, 0.08, 'square', 0.1);
    setTimeout(() => playTone(1320, 0.12, 'square', 0.1), 60);
  },

  heartPickup() {
    playTone(523, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 160);
  },

  damage() {
    playTone(200, 0.15, 'sawtooth', 0.12);
    setTimeout(() => playTone(120, 0.2, 'sawtooth', 0.1), 100);
    playNoise(0.12, 0.06);
  },

  doorOpen() {
    playTone(440, 0.1, 'square', 0.1);
    setTimeout(() => playTone(554, 0.1, 'square', 0.1), 80);
    setTimeout(() => playTone(659, 0.1, 'square', 0.1), 160);
    setTimeout(() => playTone(880, 0.2, 'square', 0.12), 240);
  },

  gameOver() {
    playTone(440, 0.2, 'square', 0.12);
    setTimeout(() => playTone(370, 0.2, 'square', 0.12), 200);
    setTimeout(() => playTone(330, 0.2, 'square', 0.12), 400);
    setTimeout(() => playTone(262, 0.5, 'square', 0.12), 600);
  },

  step() {
    playNoise(0.04, 0.03);
  },

  levelStart() {
    playTone(523, 0.08, 'square', 0.08);
    setTimeout(() => playTone(659, 0.08, 'square', 0.08), 80);
    setTimeout(() => playTone(784, 0.08, 'square', 0.08), 160);
    setTimeout(() => playTone(1047, 0.15, 'square', 0.1), 240);
  },

  menuSelect() {
    playTone(660, 0.06, 'square', 0.08);
  },

  monsterAlert() {
    // Short ascending 3-beep alert
    playTone(440, 0.06, 'square', 0.06);
    setTimeout(() => playTone(554, 0.06, 'square', 0.06), 70);
    setTimeout(() => playTone(659, 0.09, 'square', 0.07), 140);
  },
};
