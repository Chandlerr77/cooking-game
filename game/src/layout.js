// Screen geometry shared by drawing and hit-testing. Logical canvas is 1280x720.

export const W = 1280;
export const H = 720;
export const MAX_TICKETS = 4;

export const ticketRect = (i) => ({ x: 16 + i * 316, y: 56, w: 300, h: 150 });

export const stationRects = {
  chop: { x: 16, y: 232, w: 280, h: 200 },
  grill: { x: 312, y: 232, w: 340, h: 200 },
  pot: { x: 668, y: 232, w: 240, h: 200 },
  plate: { x: 924, y: 232, w: 340, h: 200 },
};

export function slotRect(name, i) {
  const r = stationRects[name];
  if (name === 'grill') return { x: r.x + i * (r.w / 2), y: r.y + 40, w: r.w / 2, h: r.h - 40 };
  return { x: r.x, y: r.y + 40, w: r.w, h: r.h - 40 };
}

export const plateCircles = [
  { x: 1010, y: 350, r: 72 },
  { x: 1178, y: 350, r: 72 },
];

export const bellRect = { x: 1096, y: 448, w: 168, h: 104 };
export const handRect = { x: 16, y: 448, w: 300, h: 104 };
export const binRect = (i) => ({ x: 16 + i * 140, y: 574, w: 128, h: 130 });

export const buttons = {
  pause: { x: 1146, y: 6, w: 66, h: 34 },
  mute: { x: 1218, y: 6, w: 50, h: 34 },
  start: { x: 490, y: 440, w: 300, h: 70 },
  howto: { x: 490, y: 526, w: 300, h: 56 },
  resume: { x: 490, y: 400, w: 300, h: 64 },
  restart: { x: 490, y: 520, w: 300, h: 64 },
};

export function inRect(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function inCircle(c, x, y) {
  return (x - c.x) ** 2 + (y - c.y) ** 2 <= c.r * c.r;
}
