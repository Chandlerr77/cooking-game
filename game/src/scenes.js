// Staged, deterministic kitchen states for screenshots (?scene=cover|assembly|serve|rush).
// They fill in the real game state, so the real renderer draws them. The state stays frozen
// until the first click or key, then the shift runs live from that point.

import { createState } from './state.js';

const SCENES = {
  cover(s) {
    s.clock = 74;
    s.score = 640;
    s.coins = 505;
    s.combo = 3;
    s.served = 7;
    s.orders = [
      { id: 1, recipe: 'classic', total: 62, left: 41 },
      { id: 2, recipe: 'pasta', total: 50, left: 24 },
      { id: 3, recipe: 'salad', total: 56, left: 49 },
      { id: 4, recipe: 'roll', total: 58, left: 55 },
    ];
    s.stations.chop.slots[0] = { item: { id: 'tomato', form: 'raw' }, progress: 0.45, done: false };
    s.stations.grill.slots[0] = { item: { id: 'patty', form: 'raw' }, progress: 0.6, done: false };
    s.stations.grill.slots[1] = { item: { id: 'bacon', form: 'grilled' }, progress: 1, done: true };
    s.stations.pot.slots[0] = { item: { id: 'pasta', form: 'boiled' }, progress: 1, done: true };
    s.plates[0].items = ['bun', 'patty.grilled', 'lettuce.chopped', 'tomato.chopped'];
    s.plates[1].items = ['cheese', 'tomato.chopped'];
    s.hand = { id: 'sauce', form: 'raw' };
    s.t = 2.1;
  },
  assembly(s) {
    s.clock = 48;
    s.score = 310;
    s.coins = 250;
    s.combo = 1;
    s.served = 4;
    s.orders = [
      { id: 4, recipe: 'classic', total: 62, left: 46 },
      { id: 5, recipe: 'roll', total: 58, left: 33 },
      { id: 6, recipe: 'pasta', total: 50, left: 40 },
      { id: 7, recipe: 'salad', total: 56, left: 52 },
    ];
    s.stations.chop.slots[0] = { item: { id: 'lettuce', form: 'raw' }, progress: 0.55, done: false };
    s.stations.grill.slots[0] = { item: { id: 'patty', form: 'raw' }, progress: 0.3, done: false };
    s.plates[0].items = ['bun', 'patty.grilled'];
    s.hand = { id: 'tomato', form: 'raw' };
    s.mouse = { x: 190, y: 360, inside: true };
    s.effects.push({ kind: 'chips', x: 156, y: 352, age: 0.12, color: '#9be37f' });
    s.t = 1.02;
  },
  serve(s) {
    s.clock = 96;
    s.score = 820;
    s.coins = 690;
    s.combo = 4;
    s.served = 10;
    s.orders = [
      { id: 6, recipe: 'pasta', total: 50, left: 38 },
      { id: 7, recipe: 'cheese', total: 60, left: 44 },
      { id: 8, recipe: 'roll', total: 58, left: 51 },
      { id: 9, recipe: 'classic', total: 62, left: 58 },
    ];
    s.plates[0].items = ['bun', 'patty.grilled', 'cheese', 'tomato.chopped'];
    s.stations.pot.slots[0] = { item: { id: 'pasta', form: 'raw' }, progress: 0.35, done: false };
    s.t = 3.3;
  },
  rush(s) {
    s.clock = 142;
    s.score = 1480;
    s.coins = 1190;
    s.combo = 0;
    s.stars = 2;
    s.served = 15;
    s.orders = [
      { id: 9, recipe: 'deluxe', total: 66, left: 8.4 },
      { id: 10, recipe: 'classic', total: 50, left: 6.1 },
      { id: 11, recipe: 'pasta', total: 44, left: 4.2 },
      { id: 12, recipe: 'salad', total: 50, left: 21 },
    ];
    s.stations.chop.slots[0] = { item: { id: 'lettuce', form: 'raw' }, progress: 0.7, done: false };
    s.stations.grill.slots[0] = { item: { id: 'patty', form: 'raw' }, progress: 0.8, done: false };
    s.stations.grill.slots[1] = { item: { id: 'bacon', form: 'raw' }, progress: 0.2, done: false };
    s.stations.pot.slots[0] = { item: { id: 'pasta', form: 'raw' }, progress: 0.5, done: false };
    s.plates[0].items = ['bun', 'patty.grilled', 'cheese', 'bacon.grilled', 'tomato.chopped'];
    s.plates[1].items = [];
    s.hand = { id: 'lettuce', form: 'chopped' };
    s.rush = true;
    s.t = 4.4;
  },
};

export function sceneNames() {
  return Object.keys(SCENES);
}

export function buildScene(name) {
  const stage = SCENES[name];
  if (!stage) return null;
  const state = createState();
  state.phase = 'playing';
  state.frozen = true;
  stage(state);
  return state;
}
