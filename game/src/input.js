// Mouse and keyboard handling. Hit-tests the shared layout and calls into kitchen/orders.

import { INGREDIENTS, STATIONS } from './recipes.js';
import { W, H, MAX_TICKETS, ticketRect, stationRects, slotRect, plateCircles, bellRect, binRect, buttons, inRect, inCircle } from './layout.js';
import { startShift } from './state.js';
import { pickBin, useStation, usePlating, dumpPlate } from './kitchen.js';
import { serveOrder, serveBest } from './orders.js';
import { resumeAudio, setMuted } from './audio.js';

function toggleMute(state) {
  state.muted = !state.muted;
  setMuted(state.muted);
}

function togglePause(state) {
  if (state.phase === 'playing') state.phase = 'paused';
  else if (state.phase === 'paused') state.phase = 'playing';
}

function restart(state) {
  startShift(state);
}

function canvasPoint(canvas, event) {
  const box = canvas.getBoundingClientRect();
  return { x: ((event.clientX - box.left) / box.width) * W, y: ((event.clientY - box.top) / box.height) * H };
}

function clickPlaying(state, x, y) {
  if (inRect(buttons.pause, x, y)) return togglePause(state);
  if (inRect(buttons.mute, x, y)) return toggleMute(state);

  for (let i = 0; i < Math.min(state.orders.length, MAX_TICKETS); i++) {
    if (inRect(ticketRect(i), x, y)) return serveOrder(state, state.orders[i]);
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inRect(binRect(i), x, y)) return pickBin(state, i);
  }
  if (inRect(bellRect, x, y)) return serveBest(state);

  for (let i = 0; i < plateCircles.length; i++) {
    if (inCircle(plateCircles[i], x, y)) return usePlating(state, i);
  }
  if (inRect(stationRects.plate, x, y)) return usePlating(state);

  for (const name of Object.keys(STATIONS)) {
    if (!inRect(stationRects[name], x, y)) continue;
    const slots = state.stations[name].slots;
    for (let i = 0; i < slots.length; i++) {
      if (inRect(slotRect(name, i), x, y)) return useStation(state, name, i);
    }
    return useStation(state, name);
  }
  // Clicking the hand box with an item drops it back.
  if (y > 440 && y < 560 && x < 330 && state.hand) state.hand = null;
}

function handleClick(state, x, y) {
  if (state.howto) {
    state.howto = false;
    return;
  }
  if (state.phase === 'title') {
    if (inRect(buttons.start, x, y)) startShift(state);
    else if (inRect(buttons.howto, x, y)) state.howto = true;
  } else if (state.phase === 'paused') {
    if (inRect(buttons.resume, x, y)) state.phase = 'playing';
    else if (inRect(buttons.restart, x, y)) restart(state);
  } else if (state.phase === 'results') {
    if (inRect(buttons.restart, x, y)) restart(state);
  } else if (state.phase === 'playing') {
    clickPlaying(state, x, y);
  }
}

// R plates during play, Shift+R restarts; plain R restarts from the pause and results screens.
function handleKey(state, event) {
  const key = event.key.toLowerCase();
  if (state.howto) {
    if (key === 'escape' || key === 'enter' || key === ' ' || key === 'h') state.howto = false;
    return;
  }
  if (key === 'm') return toggleMute(state);
  if (state.phase === 'title') {
    if (key === 'enter' || key === ' ') startShift(state);
    else if (key === 'h') state.howto = true;
    return;
  }
  if (key === 'r' && event.shiftKey) return restart(state);
  if (state.phase === 'paused' || state.phase === 'results') {
    if (key === 'r' || (state.phase === 'results' && (key === 'enter' || key === ' '))) restart(state);
    else if ((key === 'p' || key === 'escape') && state.phase === 'paused') state.phase = 'playing';
    return;
  }
  if (key === 'p' || key === 'escape') return togglePause(state);
  if (key === 'h') {
    state.howto = true;
    return;
  }
  if (key >= '1' && key <= '9') return pickBin(state, Number(key) - 1);
  if (key === 'q') return useStation(state, 'chop');
  if (key === 'w') return useStation(state, 'grill');
  if (key === 'e') return useStation(state, 'pot');
  if (key === 'r') return usePlating(state);
  if (key === 'x' || key === 'backspace') return dumpPlate(state);
  if (key === ' ' || key === 'enter') return serveBest(state);
}

export function attachInput(canvas, state) {
  const wake = () => {
    resumeAudio();
    state.frozen = false;
  };
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    canvas.focus();
    wake();
    const p = canvasPoint(canvas, event);
    handleClick(state, p.x, p.y);
  });
  canvas.addEventListener('pointermove', (event) => {
    const p = canvasPoint(canvas, event);
    state.mouse = { x: p.x, y: p.y, inside: true };
  });
  canvas.addEventListener('pointerleave', () => {
    state.mouse.inside = false;
  });
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === ' ' || event.key === 'Backspace' || event.key === 'Escape') event.preventDefault();
    if (event.repeat) return;
    wake();
    handleKey(state, event);
  });
  window.addEventListener('blur', () => {
    if (state.phase === 'playing' && !state.frozen) state.phase = 'paused';
  });
}
