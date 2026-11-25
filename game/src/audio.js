// Synthesised sound effects (WebAudio only, no audio files).

let ctx = null;
let noiseBuffer = null;
let muted = false;

// Browsers only allow audio after a user gesture, so this is called from input handlers.
export function resumeAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = seed / 2147483648 - 1;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function setMuted(value) {
  muted = value;
}

function tone(freq, dur, { type = 'sine', gain = 0.2, slideTo = null, delay = 0 } = {}) {
  if (!ctx || muted) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noise(dur, { gain = 0.15, freq = 3000, q = 0.7, kind = 'bandpass', delay = 0 } = {}) {
  if (!ctx || muted) return;
  const start = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = kind;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(amp).connect(ctx.destination);
  src.start(start);
  src.stop(start + dur + 0.02);
}

export const sounds = {
  pick: () => tone(520, 0.08, { type: 'triangle', gain: 0.12, slideTo: 760 }),
  chop: () => {
    tone(180, 0.09, { type: 'square', gain: 0.18, slideTo: 70 });
    noise(0.05, { gain: 0.2, freq: 2200, kind: 'highpass' });
  },
  sizzle: () => noise(0.5, { gain: 0.14, freq: 5500, q: 0.4, kind: 'highpass' }),
  bubble: () => tone(260 + Math.random() * 160, 0.12, { type: 'sine', gain: 0.1, slideTo: 520 }),
  place: () => tone(330, 0.1, { type: 'triangle', gain: 0.16, slideTo: 440 }),
  done: () => {
    tone(660, 0.1, { type: 'triangle', gain: 0.14 });
    tone(990, 0.14, { type: 'triangle', gain: 0.14, delay: 0.08 });
  },
  ding: () => {
    tone(1318, 0.5, { type: 'sine', gain: 0.22 });
    tone(1760, 0.7, { type: 'sine', gain: 0.18, delay: 0.1 });
  },
  buzz: () => tone(130, 0.28, { type: 'sawtooth', gain: 0.16, slideTo: 90 }),
  tick: () => tone(1000, 0.05, { type: 'square', gain: 0.09 }),
  lost: () => {
    tone(300, 0.25, { type: 'sawtooth', gain: 0.18, slideTo: 120 });
    tone(200, 0.35, { type: 'sawtooth', gain: 0.18, slideTo: 70, delay: 0.2 });
  },
  fanfare: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, { type: 'triangle', gain: 0.16, delay: i * 0.12 }));
  },
};
