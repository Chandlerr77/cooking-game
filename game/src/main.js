// Boot: canvas, state, input, and the requestAnimationFrame loop. ?scene=NAME loads a staged state.

import { createState } from './state.js';
import { buildScene } from './scenes.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { updateStations } from './kitchen.js';
import { updateOrders, endShift } from './orders.js';
import { SHIFT_SECONDS } from './timer.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const sceneName = new URLSearchParams(location.search).get('scene');
const state = (sceneName && buildScene(sceneName)) || createState();
attachInput(canvas, state);
window.__sizzle = state; // handy for play-testing in the console

function ageList(list, dt, maxAge) {
  for (const item of list) item.age += dt;
  return list.filter((item) => item.age < maxAge);
}

function update(dt) {
  if (state.phase !== 'playing') return;
  state.effects = ageList(state.effects, dt, 1.0);
  state.floaters = ageList(state.floaters, dt, 1.4);
  state.message.ttl -= dt;
  state.bellFlash = Math.max(0, state.bellFlash - dt);
  state.shake = Math.max(0, state.shake - dt);
  state.clock += dt;
  updateStations(state, dt);
  updateOrders(state, dt);
  if (state.phase === 'playing' && state.clock >= SHIFT_SECONDS) endShift(state, 'The three-minute shift is over.');
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!state.frozen) {
    // Freeze animation time while paused so effects and pulsing hold still.
    if (state.phase !== 'paused') state.t += dt;
    try {
      update(dt);
    } catch (err) {
      // One bad frame must not freeze the game: log it and keep the loop alive.
      console.error('Sizzle & Serve update error:', err);
    }
  }
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
