// All canvas drawing: kitchen, counters, food on stations and plates, HUD, order board, effects, overlays.

import { INGREDIENTS, STATIONS, RECIPES, recipeById, stationFor } from './recipes.js';
import { W, H, MAX_TICKETS, ticketRect, stationRects, slotRect, plateCircles, bellRect, handRect, binRect, buttons, inRect } from './layout.js';
import { drawFood, drawKey } from './food.js';
import { formatClock, patienceFraction, timerColor, SHIFT_SECONDS, RUSH_THRESHOLD } from './timer.js';
import { MAX_STARS } from './state.js';
import { plateMatches, readyOrder } from './orders.js';

function rrect(c, x, y, w, h, r, fill, stroke, lw = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = lw;
    c.stroke();
  }
}

function txt(c, s, x, y, size, color = '#fff', align = 'left', weight = 'bold') {
  c.font = `${weight} ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
  c.textAlign = align;
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.fillText(s, x, y);
}

function star(c, x, y, r, fill, stroke) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = stroke;
  c.lineWidth = 2;
  c.stroke();
}

function ring(c, x, y, r, fraction, color) {
  c.lineWidth = 8;
  c.strokeStyle = 'rgba(0,0,0,0.35)';
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = color;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
  c.stroke();
  c.lineCap = 'butt';
}

// ---------- background and HUD ----------

function drawBackground(c) {
  const wall = c.createLinearGradient(0, 0, 0, 230);
  wall.addColorStop(0, '#2f6f73');
  wall.addColorStop(1, '#3c8a8c');
  c.fillStyle = wall;
  c.fillRect(0, 0, W, 232);
  c.strokeStyle = 'rgba(255,255,255,0.08)';
  c.lineWidth = 2;
  for (let x = 0; x < W; x += 64) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, 232);
    c.stroke();
  }
  for (let y = 0; y < 232; y += 48) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(W, y);
    c.stroke();
  }
  const counter = c.createLinearGradient(0, 232, 0, H);
  counter.addColorStop(0, '#8a5a3a');
  counter.addColorStop(1, '#5e3b25');
  c.fillStyle = counter;
  c.fillRect(0, 232, W, H - 232);
  c.fillStyle = '#c99a6a';
  c.fillRect(0, 436, W, 6);
  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.fillRect(0, 560, W, 160);
}

function drawHud(c, state) {
  c.fillStyle = '#1d1512';
  c.fillRect(0, 0, W, 48);
  txt(c, 'SIZZLE & SERVE', 16, 24, 20, '#ffcf5a');
  txt(c, `Score ${state.score}`, 230, 24, 22, '#fff');
  txt(c, `Coins ${state.coins}`, 400, 24, 22, '#ffd54a');
  const comboColor = state.combo >= 2 ? '#ff9ad5' : '#b9a79a';
  txt(c, `Combo x${state.combo}`, 560, 24, 22, comboColor);
  for (let i = 0; i < MAX_STARS; i++) star(c, 735 + i * 34, 25, 14, i < state.stars ? '#ffc933' : '#4a3d36', i < state.stars ? '#b8860b' : '#2d241f');
  const left = SHIFT_SECONDS - state.clock;
  txt(c, formatClock(left), 930, 24, 26, left < 30 ? '#ff6b5e' : '#fff', 'center');
  rrect(c, 986, 8, 140, 12, 6, '#3a2d27');
  rrect(c, 986, 8, Math.max(8, 140 * Math.min(1, state.clock / SHIFT_SECONDS)), 12, 6, '#ffb300');
  txt(c, 'shift', 1056, 34, 11, '#b9a79a', 'center', 'normal');
  for (const [name, label] of [['pause', state.phase === 'paused' ? 'Play' : 'Pause'], ['mute', state.muted ? 'Mute' : 'Snd']]) {
    const b = buttons[name];
    rrect(c, b.x, b.y, b.w, b.h, 8, '#4a3a32', '#8a6e5c');
    txt(c, label, b.x + b.w / 2, b.y + b.h / 2, 15, '#fff', 'center');
  }
}

// ---------- order board ----------

function drawTicket(c, state, order, index, ready) {
  const r = ticketRect(index);
  const recipe = recipeById(order.recipe);
  const pulse = 0.5 + 0.5 * Math.sin(state.t * 7);
  const urgent = order.left < 10;
  c.save();
  if (ready) {
    c.shadowColor = '#ffe066';
    c.shadowBlur = 18 + 10 * pulse;
  }
  rrect(c, r.x, r.y, r.w, r.h, 12, urgent ? '#ffe9e4' : '#fff8e6', ready ? '#ffc400' : urgent ? '#e53935' : '#d8c9a6', ready ? 5 : 3);
  c.restore();
  c.fillStyle = '#d9534f';
  c.fillRect(r.x + 14, r.y - 6, 40, 12); // pin
  txt(c, recipe.name, r.x + 14, r.y + 26, 21, '#3b2a20');
  txt(c, `${recipe.price}c`, r.x + r.w - 14, r.y + 26, 19, '#9a6b00', 'right');
  const n = recipe.needs.length;
  const step = Math.min(48, (r.w - 28) / n);
  recipe.needs.forEach((key, i) => {
    const cx = r.x + 14 + step / 2 + i * step;
    rrect(c, cx - step / 2 + 2, r.y + 44, step - 4, 54, 8, '#f1e6c8');
    drawKey(c, key, cx, r.y + 71, Math.min(42, step - 6));
  });
  const bx = r.x + 14, by = r.y + 108, bw = r.w - 28;
  rrect(c, bx, by, bw, 26, 13, '#d9ccb0');
  const f = patienceFraction(order);
  rrect(c, bx, by, Math.max(14, bw * f), 26, 13, timerColor(order));
  txt(c, `${Math.ceil(order.left)}s`, bx + bw / 2, by + 13, 16, '#fff', 'center');
  if (ready) txt(c, 'READY: click or press Space', r.x + r.w / 2, r.y + 142, 12, '#a06a00', 'center');
}

function drawOrderBoard(c, state) {
  const ready = new Set();
  const first = readyOrder(state);
  for (const o of state.orders) {
    if (state.plates.some((p) => plateMatches(p, recipeById(o.recipe)))) ready.add(o.id);
  }
  state.orders.slice(0, MAX_TICKETS).forEach((o, i) => drawTicket(c, state, o, i, ready.has(o.id)));
  for (let i = state.orders.length; i < MAX_TICKETS; i++) {
    const r = ticketRect(i);
    rrect(c, r.x, r.y, r.w, r.h, 12, 'rgba(0,0,0,0.18)', 'rgba(255,255,255,0.18)', 2);
    txt(c, 'waiting for orders...', r.x + r.w / 2, r.y + r.h / 2, 16, 'rgba(255,255,255,0.4)', 'center', 'normal');
  }
  return first;
}

// ---------- stations ----------

function stationFrame(c, name, def, fill) {
  const r = stationRects[name];
  rrect(c, r.x, r.y, r.w, r.h, 14, fill, 'rgba(0,0,0,0.5)', 3);
  rrect(c, r.x, r.y, r.w, 34, 14, 'rgba(0,0,0,0.45)');
  txt(c, def.name, r.x + 14, r.y + 17, 17, '#fff');
  rrect(c, r.x + r.w - 40, r.y + 5, 28, 24, 6, '#ffcf5a');
  txt(c, def.key, r.x + r.w - 26, r.y + 17, 16, '#3b2a20', 'center');
}

function slotCenter(name, i) {
  const s = slotRect(name, i);
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 + 4 };
}

function drawProgress(c, slot, x, y, color) {
  if (slot.item && !slot.done) ring(c, x, y, 54, slot.progress, color);
  if (slot.done) {
    c.beginPath();
    c.arc(x + 44, y - 44, 15, 0, Math.PI * 2);
    c.fillStyle = '#43b04a';
    c.fill();
    c.strokeStyle = '#fff';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x + 37, y - 44);
    c.lineTo(x + 42, y - 38);
    c.lineTo(x + 52, y - 51);
    c.stroke();
  }
}

function drawChop(c, state) {
  stationFrame(c, 'chop', STATIONS.chop, '#a8794a');
  const slot = state.stations.chop.slots[0];
  const { x, y } = slotCenter('chop', 0);
  rrect(c, x - 118, y - 66, 236, 132, 16, '#d9a766', '#8a5e32', 3);
  c.strokeStyle = 'rgba(120,80,40,0.35)';
  c.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    c.beginPath();
    c.moveTo(x - 110, y - 66 + i * 26);
    c.lineTo(x + 110, y - 66 + i * 26);
    c.stroke();
  }
  if (slot.item) {
    drawFood(c, slot.item.id, slot.item.form, x, y + 4, 88);
    drawProgress(c, slot, x, y + 4, '#9be37f');
    if (!slot.done) {
      const dip = Math.abs(Math.sin(state.t * 11));
      c.save();
      c.translate(x + 6, y - 58 + dip * 40);
      c.rotate(-0.15);
      c.fillStyle = '#e8edf0';
      c.beginPath();
      c.moveTo(-8, 0);
      c.lineTo(52, 0);
      c.lineTo(52, 22);
      c.lineTo(-8, 30);
      c.closePath();
      c.fill();
      c.strokeStyle = '#8795a1';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#4b2e1b';
      c.fillRect(52, 2, 34, 18);
      c.restore();
    }
  } else {
    txt(c, 'Drop lettuce or tomato', x, y, 15, 'rgba(60,40,20,0.55)', 'center', 'normal');
  }
}

function drawFlames(c, x, y, t, seed) {
  for (let i = 0; i < 5; i++) {
    const h = 16 + 10 * Math.sin(t * 13 + i * 2 + seed);
    c.beginPath();
    c.moveTo(x - 44 + i * 22, y + 40);
    c.quadraticCurveTo(x - 50 + i * 22, y + 40 - h, x - 44 + i * 22, y + 40 - h * 1.5);
    c.quadraticCurveTo(x - 38 + i * 22, y + 40 - h, x - 34 + i * 22, y + 40);
    c.fillStyle = i % 2 ? '#ffb300' : '#ff6f1a';
    c.fill();
  }
}

function drawGrill(c, state) {
  stationFrame(c, 'grill', STATIONS.grill, '#3a3a40');
  const r = slotRect('grill', 0);
  rrect(c, stationRects.grill.x + 10, r.y + 4, stationRects.grill.w - 20, r.h - 12, 10, '#26262b');
  c.strokeStyle = '#6b6b73';
  c.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(stationRects.grill.x + 24 + i * 36, r.y + 10);
    c.lineTo(stationRects.grill.x + 24 + i * 36, r.y + r.h - 18);
    c.stroke();
  }
  state.stations.grill.slots.forEach((slot, i) => {
    const { x, y } = slotCenter('grill', i);
    if (slot.item && !slot.done) drawFlames(c, x, y, state.t, i);
    if (slot.item) {
      const wob = slot.done ? 0 : Math.sin(state.t * 30 + i) * 1.5;
      drawFood(c, slot.item.id, slot.item.form, x, y + wob, 84);
      drawProgress(c, slot, x, y, '#ffb74d');
    } else {
      txt(c, 'patty / bacon', x, y, 14, 'rgba(255,255,255,0.4)', 'center', 'normal');
    }
  });
}

function drawPot(c, state) {
  stationFrame(c, 'pot', STATIONS.pot, '#4a5560');
  const slot = state.stations.pot.slots[0];
  const { x, y } = slotCenter('pot', 0);
  c.fillStyle = '#9aa6b0';
  c.beginPath();
  c.roundRect(x - 78, y - 22, 156, 84, [4, 4, 30, 30]);
  c.fill();
  c.strokeStyle = '#6a7680';
  c.lineWidth = 3;
  c.stroke();
  rrect(c, x - 92, y - 14, 22, 10, 5, '#6a7680');
  rrect(c, x + 70, y - 14, 22, 10, 5, '#6a7680');
  c.beginPath();
  c.ellipse(x, y - 22, 78, 16, 0, 0, Math.PI * 2);
  c.fillStyle = slot.item ? '#6fb7e8' : '#2f3a44';
  c.fill();
  c.strokeStyle = '#6a7680';
  c.stroke();
  if (slot.item) {
    drawFood(c, slot.item.id, slot.item.form, x, y - 30, 70);
    drawProgress(c, slot, x, y - 4, '#7fd0ff');
    if (!slot.done) {
      for (let i = 0; i < 3; i++) {
        const k = (state.t * 0.8 + i / 3) % 1;
        c.fillStyle = `rgba(255,255,255,${0.5 * (1 - k)})`;
        c.beginPath();
        c.arc(x - 24 + i * 24 + Math.sin(k * 6 + i) * 6, y - 52 - k * 40, 7 + k * 6, 0, Math.PI * 2);
        c.fill();
      }
    }
  } else {
    txt(c, 'pasta', x, y + 20, 14, 'rgba(255,255,255,0.5)', 'center', 'normal');
  }
}

function drawPlateContents(c, plate, circle) {
  const n = plate.items.length;
  plate.items.forEach((key, i) => {
    const topRow = i < 3;
    const rowCount = topRow ? Math.min(3, n) : n - 3;
    const col = (topRow ? i : i - 3) - (rowCount - 1) / 2;
    drawKey(c, key, circle.x + col * 44, circle.y + (n > 3 ? (topRow ? -22 : 22) : 0), 40);
  });
}

function drawPlating(c, state) {
  stationFrame(c, 'plate', { name: 'Plating Counter', key: 'R' }, '#cfd6d9');
  const t = state.t;
  plateCircles.forEach((circle, i) => {
    const plate = state.plates[i];
    const active = state.activePlate === i;
    c.beginPath();
    c.arc(circle.x, circle.y + 4, circle.r + 4, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.fill();
    c.beginPath();
    c.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    c.fillStyle = '#fbfbfb';
    c.fill();
    c.strokeStyle = active ? '#ff9800' : '#b7c0c4';
    c.lineWidth = active ? 6 : 3;
    c.stroke();
    c.beginPath();
    c.arc(circle.x, circle.y, circle.r - 12, 0, Math.PI * 2);
    c.strokeStyle = '#e1e6e8';
    c.lineWidth = 2;
    c.stroke();
    drawPlateContents(c, plate, circle);
    txt(c, `${i + 1}`, circle.x - circle.r + 6, circle.y - circle.r + 10, 14, active ? '#e65100' : '#6a767c', 'center');
    const done = RECIPES.find((r) => plateMatches(plate, r));
    if (done) {
      const glow = 0.5 + 0.5 * Math.sin(t * 6);
      c.beginPath();
      c.arc(circle.x, circle.y, circle.r + 8, 0, Math.PI * 2);
      c.strokeStyle = `rgba(67,176,74,${0.5 + 0.5 * glow})`;
      c.lineWidth = 5;
      c.stroke();
      rrect(c, circle.x - 66, circle.y + circle.r - 2, 132, 24, 12, '#43b04a');
      txt(c, done.name, circle.x, circle.y + circle.r + 10, 12, '#fff', 'center');
    }
  });
}

// ---------- middle strip and bins ----------

function hintFor(state) {
  const h = state.hand;
  if (!h) return 'Pick an ingredient: click a bin or press 1-9';
  const name = INGREDIENTS.find((i) => i.id === h.id).name.toLowerCase();
  if (h.form === 'raw') {
    const st = stationFor(h.id);
    if (st) return `${name}: take it to the ${STATIONS[st].name.toLowerCase()} (${STATIONS[st].key})`;
    return `${name}: add it to a plate (R)`;
  }
  return `${h.form} ${name}: add it to a plate (R)`;
}

function drawHand(c, state) {
  const r = handRect;
  rrect(c, r.x, r.y, r.w, r.h, 14, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.25)', 2);
  txt(c, 'IN HAND', r.x + 14, r.y + 18, 13, '#ffcf5a');
  if (state.hand) {
    rrect(c, r.x + 14, r.y + 30, 64, 64, 12, '#fff8e6');
    drawFood(c, state.hand.id, state.hand.form, r.x + 46, r.y + 62, 56);
    const nm = INGREDIENTS.find((i) => i.id === state.hand.id).name;
    txt(c, state.hand.form === 'raw' ? nm : `${state.hand.form} ${nm}`, r.x + 92, r.y + 54, 18, '#fff');
    txt(c, 'click here to put back', r.x + 92, r.y + 78, 12, 'rgba(255,255,255,0.55)', 'left', 'normal');
  } else {
    txt(c, 'empty', r.x + 14, r.y + 62, 20, 'rgba(255,255,255,0.45)', 'left', 'normal');
  }
}

function drawBell(c, state, hot) {
  const r = bellRect;
  const flash = state.bellFlash > 0;
  const glow = hot ? 0.5 + 0.5 * Math.sin(state.t * 8) : 0;
  c.save();
  if (hot || flash) {
    c.shadowColor = '#ffe066';
    c.shadowBlur = 20 + 14 * glow;
  }
  rrect(c, r.x, r.y, r.w, r.h, 14, hot ? '#6b4d00' : 'rgba(0,0,0,0.3)', hot ? '#ffc400' : 'rgba(255,255,255,0.25)', hot ? 5 : 2);
  c.restore();
  const bx = r.x + 52, by = r.y + 54;
  c.beginPath();
  c.arc(bx, by + 2, 28, Math.PI, 0);
  c.lineTo(bx + 34, by + 18);
  c.lineTo(bx - 34, by + 18);
  c.closePath();
  c.fillStyle = hot ? '#ffd54a' : '#d4a937';
  c.fill();
  c.strokeStyle = '#8a6a10';
  c.lineWidth = 3;
  c.stroke();
  c.beginPath();
  c.arc(bx, by - 28, 5, 0, Math.PI * 2);
  c.fillStyle = '#8a6a10';
  c.fill();
  txt(c, 'SERVE', r.x + 118, r.y + 40, 20, hot ? '#ffe066' : '#fff', 'center');
  txt(c, 'Space', r.x + 118, r.y + 68, 15, 'rgba(255,255,255,0.7)', 'center', 'normal');
}

function drawMiddle(c, state, ready) {
  drawHand(c, state);
  drawBell(c, state, !!ready);
  const cx = 706;
  if (state.rush) {
    const urgent = state.orders.filter((o) => o.left < RUSH_THRESHOLD).length;
    const p = 1 + 0.07 * Math.sin(state.t * 9);
    c.save();
    c.translate(cx, 498);
    c.scale(p, p);
    rrect(c, -170, -42, 340, 84, 16, '#c62828', '#ffeb3b', 5);
    txt(c, 'RUSH!', 0, -4, 46, '#fff', 'center');
    txt(c, `${urgent} order${urgent === 1 ? '' : 's'} almost out of time`, 0, 30, 14, '#ffe0dc', 'center', 'normal');
    c.restore();
  } else {
    const text = state.message.ttl > 0 ? state.message.text : hintFor(state);
    txt(c, text, cx, 498, 20, state.message.ttl > 0 ? '#ffe9a8' : '#f5e6d0', 'center');
  }
}

function drawBins(c, state) {
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const held = state.hand && state.hand.id === ing.id && state.hand.form === 'raw';
    rrect(c, r.x, r.y + 14, r.w, r.h - 14, 12, '#7a5233', held ? '#ffcf5a' : '#3f2815', held ? 5 : 3);
    rrect(c, r.x + 8, r.y + 22, r.w - 16, r.h - 52, 10, '#2c1c10');
    drawFood(c, ing.id, 'raw', r.x + r.w / 2, r.y + 62, 78);
    rrect(c, r.x, r.y + 14, r.w, 22, [12, 12, 0, 0], 'rgba(0,0,0,0.0)');
    txt(c, ing.name, r.x + r.w / 2, r.y + r.h - 14, 17, '#fff', 'center');
    rrect(c, r.x + 6, r.y + 2, 28, 26, 7, '#ffcf5a', '#8a6a10', 2);
    txt(c, `${i + 1}`, r.x + 20, r.y + 16, 16, '#3b2a20', 'center');
  });
}

// ---------- effects ----------

function drawEffects(c, state) {
  for (const e of state.effects) {
    if (e.kind === 'chips') {
      const k = e.age / 0.5;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        c.fillStyle = e.color;
        c.globalAlpha = Math.max(0, 1 - k);
        c.fillRect(e.x + Math.cos(a) * (14 + 50 * k) - 3, e.y + Math.sin(a) * (10 + 40 * k) - 3 - 20 * k + 40 * k * k, 7, 7);
      }
      c.globalAlpha = 1;
    } else if (e.kind === 'dish') {
      const k = Math.min(1, e.age / 1.0);
      const scale = 1 + 0.5 * Math.sin(Math.min(1, k * 2) * Math.PI * 0.5);
      c.save();
      c.globalAlpha = 1 - k * k;
      c.translate(e.x, e.y - 70 * k);
      c.scale(scale, scale);
      c.beginPath();
      c.arc(0, 0, 66, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,224,102,0.55)';
      c.fill();
      const needs = recipeById(e.recipe).needs;
      needs.forEach((key, i) => drawKey(c, key, (i - (needs.length - 1) / 2) * 24, 0, 34));
      c.restore();
    }
  }
  for (const f of state.floaters) {
    const k = f.age / 1.4;
    c.globalAlpha = Math.max(0, 1 - k * k);
    c.font = 'bold 26px system-ui, Arial, sans-serif';
    c.textAlign = 'center';
    c.lineWidth = 5;
    c.strokeStyle = 'rgba(0,0,0,0.7)';
    c.strokeText(f.text, f.x, f.y - 50 * k);
    c.fillStyle = f.color;
    c.fillText(f.text, f.x, f.y - 50 * k);
  }
  c.globalAlpha = 1;
}

function drawRushEdge(c, state) {
  const pulse = 0.5 + 0.5 * Math.sin(state.t * 8);
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(229,57,53,0)');
  g.addColorStop(1, `rgba(229,57,53,${0.35 + 0.3 * pulse})`);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.strokeStyle = `rgba(255,60,50,${0.5 + 0.4 * pulse})`;
  c.lineWidth = 10;
  c.strokeRect(5, 5, W - 10, H - 10);
}

// ---------- overlays ----------

function dim(c, a = 0.6) {
  c.fillStyle = `rgba(15,10,8,${a})`;
  c.fillRect(0, 0, W, H);
}

function button(c, b, label, fill = '#e8782a') {
  rrect(c, b.x, b.y, b.w, b.h, 14, fill, '#fff3d6', 3);
  txt(c, label, b.x + b.w / 2, b.y + b.h / 2, 26, '#fff', 'center');
}

function drawTitle(c, state) {
  dim(c, 0.62);
  txt(c, 'Sizzle & Serve', W / 2, 190, 92, '#ffcf5a', 'center');
  txt(c, 'A rush-hour kitchen. Chop it, grill it, plate it, ring it.', W / 2, 262, 26, '#fff3d6', 'center', 'normal');
  const icons = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'bacon', 'egg'];
  icons.forEach((id, i) => drawFood(c, id, id === 'patty' || id === 'bacon' ? 'grilled' : id === 'lettuce' || id === 'tomato' ? 'chopped' : 'raw', W / 2 + (i - 3) * 110, 350 + Math.sin(state.t * 3 + i) * 8, 76));
  button(c, buttons.start, 'Start Shift');
  button(c, buttons.howto, 'How to Play', '#4a7f9a');
  txt(c, 'Enter to start  |  H for help  |  M to mute', W / 2, 620, 18, '#d8c9b0', 'center', 'normal');
}

function drawHowTo(c) {
  dim(c, 0.8);
  rrect(c, 150, 70, 980, 580, 20, '#fff8e6', '#e8782a', 5);
  txt(c, 'How to Play', W / 2, 118, 42, '#3b2a20', 'center');
  const lines = [
    '1. Read the tickets on top. Each shows the dish and the ingredients it needs.',
    '2. Pick an ingredient from a bin (click or keys 1-9). You hold one at a time.',
    '3. Lettuce & tomato: chopping board (Q). Patty & bacon: grill (W). Pasta: pot (E).',
    '4. Wait for the green tick, then pick the food up again (click it or press the key).',
    '5. Put finished food on a plate (click the plate or press R). Bun, cheese, sauce',
    '    and egg go on raw. Press R with an empty hand to switch plates, X clears a plate.',
    '6. When a plate matches a ticket it glows green. Click the ticket, ring the bell,',
    '    or press Space to serve. Faster service earns bigger tips and combos.',
    '7. A ticket that runs out of time costs a star. Lose all 3, or finish 3 minutes, to end the shift.',
  ];
  lines.forEach((l, i) => txt(c, l, 190, 180 + i * 38, 19, '#3b2a20', 'left', 'normal'));
  txt(c, 'Keys: 1-9 bins | Q chop | W grill | E pot | R plate | Space serve | P pause | M mute | Shift+R restart', W / 2, 560, 16, '#7a5233', 'center');
  txt(c, 'Click anywhere to close', W / 2, 610, 20, '#e8782a', 'center');
}

function drawPause(c) {
  dim(c, 0.7);
  txt(c, 'Paused', W / 2, 290, 80, '#ffcf5a', 'center');
  txt(c, 'P resume  |  R restart', W / 2, 350, 22, '#fff3d6', 'center', 'normal');
  button(c, buttons.resume, 'Resume', '#43b04a');
  button(c, buttons.restart, 'Restart (R)', '#c0562a');
}

function drawResults(c, state) {
  dim(c, 0.78);
  rrect(c, 340, 80, 600, 540, 22, '#fff8e6', '#e8782a', 5);
  const won = state.stars > 0;
  txt(c, won ? 'Shift Complete!' : 'Kitchen Closed', W / 2, 140, 48, '#3b2a20', 'center');
  txt(c, state.resultReason, W / 2, 190, 18, '#7a5233', 'center', 'normal');
  for (let i = 0; i < MAX_STARS; i++) star(c, W / 2 + (i - 1) * 70, 262, 30, i < state.stars ? '#ffc933' : '#d9ccb0', '#b8860b');
  const rows = [['Score', state.score], ['Coins earned', state.coins], ['Dishes served', state.served], ['Best combo', `x${state.bestCombo}`]];
  rows.forEach(([k, v], i) => {
    txt(c, k, 420, 340 + i * 44, 24, '#3b2a20', 'left', 'normal');
    txt(c, String(v), 860, 340 + i * 44, 26, '#b86a00', 'right');
  });
  button(c, buttons.restart, 'Play Again (R)');
}

// ---------- main entry ----------

export function render(c, state) {
  c.save();
  if (state.shake > 0) c.translate((Math.random() - 0.5) * state.shake * 24, (Math.random() - 0.5) * state.shake * 24);
  drawBackground(c);
  const ready = drawOrderBoard(c, state);
  drawChop(c, state);
  drawGrill(c, state);
  drawPot(c, state);
  drawPlating(c, state);
  drawMiddle(c, state, ready);
  drawBins(c, state);
  drawHud(c, state);
  drawEffects(c, state);
  if (state.hand && state.mouse.inside && state.phase === 'playing') drawFood(c, state.hand.id, state.hand.form, state.mouse.x + 18, state.mouse.y + 18, 60);
  c.restore();
  if (state.rush && state.phase === 'playing') drawRushEdge(c, state);
  if (state.phase === 'title') drawTitle(c, state);
  else if (state.phase === 'paused') drawPause(c);
  else if (state.phase === 'results') drawResults(c, state);
  if (state.howto) drawHowTo(c);
}
