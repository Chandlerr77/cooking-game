// Shift clock and difficulty ramp.

export const SHIFT_SECONDS = 180;
export const RUSH_THRESHOLD = 10;

// Orders arrive faster, recipes get bigger, and tickets get less patient as the shift goes on.
export function difficulty(clock) {
  const p = Math.min(1, Math.max(0, clock / SHIFT_SECONDS));
  return {
    tier: clock < 35 ? 0 : clock < 100 ? 1 : 2,
    spawnEvery: 15 - 8 * p,
    ticketTime: 70 - 28 * p,
    maxOrders: clock < 60 ? 3 : 4,
  };
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// 0..1 fraction of patience left, and a colour for it: green, then amber, then red.
export function patienceFraction(order) {
  return Math.max(0, Math.min(1, order.left / order.total));
}

export function timerColor(order) {
  if (order.left < RUSH_THRESHOLD) return '#e53935';
  const f = patienceFraction(order);
  return f > 0.5 ? '#43b04a' : f > 0.25 ? '#f5a623' : '#e8582b';
}
