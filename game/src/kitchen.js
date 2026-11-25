// Station logic: picking ingredients, chop/grill/boil processing, and plating.

import { INGREDIENTS, STATIONS, PLATE_CAPACITY, canPlate, itemKey } from './recipes.js';
import { slotRect, plateCircles } from './layout.js';
import { floatText, say } from './state.js';
import { sounds } from './audio.js';

function reject(state, text, x, y) {
  sounds.buzz();
  say(state, text);
  if (x !== undefined) floatText(state, text, x, y, '#ff8a80');
}

export function pickBin(state, index) {
  const ingredient = INGREDIENTS[index];
  if (!ingredient) return;
  if (state.hand && state.hand.id === ingredient.id && state.hand.form === 'raw') {
    state.hand = null; // clicking the same bin again puts it back
    sounds.place();
    return;
  }
  state.hand = { id: ingredient.id, form: 'raw' };
  sounds.pick();
}

// Click (or Q/W/E) on a station. slotIndex is optional; without it the first suitable slot is used.
export function useStation(state, name, slotIndex) {
  const def = STATIONS[name];
  const station = state.stations[name];
  const slots = station.slots;
  const aim = (i) => slotRect(name, i);
  const center = (i) => ({ x: aim(i).x + aim(i).w / 2, y: aim(i).y + 20 });

  if (state.hand) {
    if (!def.accepts.includes(state.hand.id) || state.hand.form !== 'raw') {
      const c = center(slotIndex ?? 0);
      return reject(state, `The ${def.name.toLowerCase()} can't take that.`, c.x, c.y);
    }
    let i;
    if (slotIndex !== undefined) {
      // A clicked slot is honoured strictly: no silent fallback to another slot.
      if (slots[slotIndex].item) {
        const c = center(slotIndex);
        return reject(state, `That ${def.name.toLowerCase()} slot is full.`, c.x, c.y);
      }
      i = slotIndex;
    } else {
      i = slots.findIndex((s) => !s.item);
    }
    if (i < 0) {
      const c = center(0);
      return reject(state, `${def.name} is full.`, c.x, c.y);
    }
    slots[i] = { item: state.hand, progress: 0, done: false };
    state.hand = null;
    if (name === 'chop') sounds.chop();
    else if (name === 'grill') sounds.sizzle();
    else sounds.bubble();
    return;
  }

  let i;
  if (slotIndex !== undefined) {
    // A clicked slot is honoured strictly: an empty or unfinished slot is
    // reported, never silently swapped for a done slot elsewhere.
    if (!slots[slotIndex].item) {
      return reject(state, `Pick an ingredient for the ${def.name.toLowerCase()} first.`);
    }
    if (!slots[slotIndex].done) {
      say(state, `${def.verb}ing, hang on...`, 1.2);
      return;
    }
    i = slotIndex;
  } else {
    i = slots.findIndex((s) => s.item && s.done);
  }
  if (i < 0 || !slots[i].item) {
    return reject(state, `Pick an ingredient for the ${def.name.toLowerCase()} first.`);
  }
  if (!slots[i].done) {
    say(state, `${def.verb}ing, hang on...`, 1.2);
    return;
  }
  state.hand = slots[i].item;
  slots[i] = { item: null, progress: 0, done: false };
  sounds.pick();
}

export function updateStations(state, dt) {
  state.chopTimer -= dt;
  let sizzling = false;
  for (const [name, def] of Object.entries(STATIONS)) {
    state.stations[name].slots.forEach((slot, i) => {
      if (!slot.item || slot.done) return;
      slot.progress += dt / def.time;
      if (name === 'chop' && state.chopTimer <= 0) {
        sounds.chop();
        state.chopTimer = 0.28;
        const r = slotRect(name, i);
        state.effects.push({ kind: 'chips', x: r.x + r.w / 2, y: r.y + r.h / 2, age: 0, color: '#9be37f' });
      }
      if (name === 'grill') sizzling = true;
      if (slot.progress >= 1) {
        slot.progress = 1;
        slot.done = true;
        slot.item = { id: slot.item.id, form: def.form };
        sounds.done();
        const r = slotRect(name, i);
        floatText(state, `${def.verb === 'Chop' ? 'Chopped' : def.verb === 'Grill' ? 'Grilled' : 'Boiled'}!`, r.x + r.w / 2, r.y + 10, '#fff7a8');
      }
    });
  }
  if (sizzling && Math.floor(state.t * 2) !== Math.floor((state.t - dt) * 2)) sounds.sizzle();
}

// Click (or R) on the plating counter. plateIndex picks which plate; default is the active one.
export function usePlating(state, plateIndex) {
  if (plateIndex !== undefined) state.activePlate = plateIndex;
  const plate = state.plates[state.activePlate];
  const circle = plateCircles[state.activePlate];
  if (!state.hand) {
    if (plateIndex === undefined) {
      state.activePlate = (state.activePlate + 1) % state.plates.length;
      sounds.pick();
      say(state, `Plate ${state.activePlate + 1} selected.`, 1);
    } else {
      sounds.pick();
    }
    return;
  }
  if (!canPlate(state.hand)) {
    return reject(state, 'Needs prepping first!', circle.x, circle.y - 80);
  }
  if (plate.items.length >= PLATE_CAPACITY) {
    return reject(state, 'Plate is full.', circle.x, circle.y - 80);
  }
  plate.items.push(itemKey(state.hand));
  state.effects.push({ kind: 'chips', x: circle.x, y: circle.y, age: 0, color: '#ffe082' });
  state.hand = null;
  sounds.place();
}

export function dumpPlate(state) {
  const plate = state.plates[state.activePlate];
  if (!plate.items.length) return;
  plate.items = [];
  sounds.buzz();
  say(state, 'Plate cleared.', 1.2);
}
