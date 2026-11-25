// The whole game state lives in one plain object so scenes, rendering and logic share it.

import { STATIONS } from './recipes.js';

export const MAX_STARS = 3;

function freshStations() {
  const out = {};
  for (const [name, def] of Object.entries(STATIONS)) {
    out[name] = { slots: Array.from({ length: def.slots }, () => ({ item: null, progress: 0, done: false })) };
  }
  return out;
}

export function createState() {
  return {
    phase: 'title', // title | playing | paused | results
    howto: false,
    muted: false,
    frozen: false, // staged scenes hold still until the first input
    t: 0, // animation time, seconds
    clock: 0, // shift time elapsed
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    stars: MAX_STARS,
    resultReason: '',
    orders: [],
    nextOrderId: 1,
    spawnTimer: 2,
    hand: null,
    stations: freshStations(),
    plates: [{ items: [] }, { items: [] }],
    activePlate: 0,
    rush: false,
    tickTimer: 0,
    chopTimer: 0,
    effects: [],
    floaters: [],
    message: { text: '', ttl: 0 },
    bellFlash: 0,
    shake: 0,
    mouse: { x: -100, y: -100, inside: false },
  };
}

// Reset everything for a new shift, keeping the mute setting.
export function startShift(state) {
  const fresh = createState();
  fresh.muted = state.muted;
  fresh.mouse = state.mouse;
  Object.assign(state, fresh, { phase: 'playing' });
}

export function say(state, text, ttl = 2.2) {
  state.message = { text, ttl };
}

export function floatText(state, text, x, y, color = '#fff') {
  state.floaters.push({ text, x, y, color, age: 0 });
}
