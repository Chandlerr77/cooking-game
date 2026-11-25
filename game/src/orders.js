// Order tickets: spawning, patience timers, serving, scoring and tips.

import { RECIPES, recipeById } from './recipes.js';
import { difficulty, RUSH_THRESHOLD } from './timer.js';
import { MAX_TICKETS, plateCircles, ticketRect } from './layout.js';
import { floatText, say } from './state.js';
import { sounds } from './audio.js';

export function spawnOrder(state, recipeId) {
  const d = difficulty(state.clock);
  let recipe;
  if (recipeId) {
    recipe = recipeById(recipeId);
  } else {
    const pool = RECIPES.filter((r) => r.tier <= d.tier);
    // Avoid asking for the same dish twice in a row so the board stays varied.
    const last = state.orders[state.orders.length - 1];
    const filtered = pool.filter((r) => !last || r.id !== last.recipe);
    const options = filtered.length ? filtered : pool;
    recipe = options[Math.floor(Math.random() * options.length)];
  }
  const total = d.ticketTime + recipe.needs.length * 3;
  state.orders.push({ id: state.nextOrderId++, recipe: recipe.id, total, left: total });
}

export function updateOrders(state, dt) {
  const d = difficulty(state.clock);
  state.spawnTimer -= dt;
  if ((state.spawnTimer <= 0 && state.orders.length < Math.min(d.maxOrders, MAX_TICKETS)) || state.orders.length === 0) {
    spawnOrder(state);
    state.spawnTimer = d.spawnEvery;
  } else if (state.spawnTimer <= 0) {
    state.spawnTimer = 1;
  }

  for (const order of [...state.orders]) {
    order.left -= dt;
    if (order.left <= 0) loseOrder(state, order);
  }

  const urgent = state.orders.filter((o) => o.left < RUSH_THRESHOLD);
  state.rush = urgent.length >= 2;
  state.tickTimer -= dt;
  if (urgent.length > 0 && state.tickTimer <= 0) {
    sounds.tick();
    state.tickTimer = 1;
  }
}

function loseOrder(state, order) {
  if (state.phase !== 'playing') return;
  const index = state.orders.indexOf(order);
  const rect = ticketRect(index);
  state.orders.splice(index, 1);
  state.stars = Math.max(0, state.stars - 1);
  state.combo = 0;
  state.shake = 0.4;
  floatText(state, 'Order lost!', rect.x + rect.w / 2, rect.y + 90, '#ff6b5e');
  say(state, `${recipeById(order.recipe).name} went cold!`);
  sounds.lost();
  if (state.stars <= 0) endShift(state, 'Three orders lost: the kitchen is closed.');
}

export function endShift(state, reason) {
  if (state.phase === 'results') return;
  state.phase = 'results';
  state.resultReason = reason;
  state.rush = false;
  if (state.stars > 0) sounds.fanfare();
}

export function plateMatches(plate, recipe) {
  if (plate.items.length !== recipe.needs.length) return false;
  const a = [...plate.items].sort().join('|');
  const b = [...recipe.needs].sort().join('|');
  return a === b;
}

export function matchingPlateIndex(state, order) {
  const recipe = recipeById(order.recipe);
  return state.plates.findIndex((p) => plateMatches(p, recipe));
}

export function readyOrder(state) {
  const ready = state.orders.filter((o) => matchingPlateIndex(state, o) >= 0);
  ready.sort((a, b) => a.left - b.left);
  return ready[0] || null;
}

// Serve the plate matching this ticket: base price plus a tip that shrinks as the timer runs down.
export function serveOrder(state, order) {
  const plateIndex = matchingPlateIndex(state, order);
  if (plateIndex < 0) {
    sounds.buzz();
    say(state, 'No plate matches that ticket yet.');
    return false;
  }
  const recipe = recipeById(order.recipe);
  const tip = Math.round(recipe.price * 0.6 * (order.left / order.total));
  const earned = recipe.price + tip;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const multiplier = 1 + Math.min(state.combo - 1, 4) * 0.25;
  state.coins += earned;
  state.score += Math.round(earned * multiplier);
  state.served += 1;
  state.bellFlash = 0.5;
  const circle = plateCircles[plateIndex];
  state.effects.push({ kind: 'dish', recipe: recipe.id, x: circle.x, y: circle.y, age: 0 });
  floatText(state, `+${earned}`, circle.x, circle.y - 40, '#ffd54a');
  if (tip > 0) floatText(state, `tip +${tip}`, circle.x, circle.y - 10, '#9be37f');
  if (state.combo >= 2) floatText(state, `combo x${multiplier.toFixed(2)}`, circle.x, circle.y + 24, '#ff9ad5');
  state.plates[plateIndex].items = [];
  state.orders.splice(state.orders.indexOf(order), 1);
  sounds.ding();
  return true;
}

export function serveBest(state) {
  const order = readyOrder(state);
  if (!order) {
    sounds.buzz();
    say(state, 'Nothing on the plates matches a ticket.');
    return false;
  }
  return serveOrder(state, order);
}
