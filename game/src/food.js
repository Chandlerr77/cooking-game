// Vector drawings of every ingredient in every form. s is the nominal size in pixels.

function ellipse(c, x, y, rx, ry, fill, stroke) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = Math.max(1, rx * 0.08);
    c.stroke();
  }
}

function strip(c, x, y, s, base, fat) {
  const w = s * 0.9;
  c.save();
  c.translate(x, y);
  c.rotate(-0.35);
  for (const [color, off, thick] of [[base, 0, s * 0.3], [fat, 0, s * 0.1]]) {
    c.beginPath();
    for (let i = 0; i <= 12; i++) {
      const px = -w / 2 + (w * i) / 12;
      const py = Math.sin(i * 0.9) * s * 0.07 + off;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.strokeStyle = color;
    c.lineWidth = thick;
    c.lineCap = 'round';
    c.stroke();
  }
  c.restore();
}

const drawers = {
  bun(c, x, y, s) {
    ellipse(c, x, y + s * 0.14, s * 0.46, s * 0.14, '#c98a3f');
    c.beginPath();
    c.ellipse(x, y + s * 0.04, s * 0.46, s * 0.36, 0, Math.PI, 0);
    c.closePath();
    c.fillStyle = '#e8aa55';
    c.fill();
    c.fillStyle = '#fff1c9';
    for (const [dx, dy] of [[-0.2, -0.14], [0.02, -0.24], [0.2, -0.12], [-0.05, -0.08]]) ellipse(c, x + dx * s, y + dy * s, s * 0.04, s * 0.025, '#fff1c9');
  },
  patty: {
    raw(c, x, y, s) {
      ellipse(c, x, y, s * 0.44, s * 0.3, '#c9574a', '#8f3328');
      c.fillStyle = '#e48a7f';
      for (const [dx, dy] of [[-0.18, -0.06], [0.1, 0.08], [0.2, -0.1]]) ellipse(c, x + dx * s, y + dy * s, s * 0.05, s * 0.03, '#e48a7f');
    },
    grilled(c, x, y, s) {
      ellipse(c, x, y, s * 0.44, s * 0.3, '#6b3a22', '#3e1f10');
      c.strokeStyle = '#2b140a';
      c.lineWidth = Math.max(2, s * 0.05);
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(x - s * 0.28 + i * s * 0.1, y + s * 0.2);
        c.lineTo(x + s * 0.1 + i * s * 0.1, y - s * 0.2);
        c.stroke();
      }
    },
  },
  lettuce: {
    raw(c, x, y, s) {
      for (const [dx, dy, r, col] of [[-0.18, 0.05, 0.26, '#5fb03a'], [0.16, 0.05, 0.26, '#6dc044'], [0, -0.12, 0.3, '#86d35c'], [0, 0.1, 0.22, '#9be06f']]) ellipse(c, x + dx * s, y + dy * s, r * s, r * s * 0.85, col, '#4a8f2c');
    },
    chopped(c, x, y, s) {
      const bits = [[-0.2, -0.1, 25], [0.08, -0.18, -20], [0.2, 0.05, 40], [-0.08, 0.1, -35], [-0.24, 0.16, 10], [0.02, 0.0, 70]];
      for (const [dx, dy, rot] of bits) {
        c.save();
        c.translate(x + dx * s, y + dy * s);
        c.rotate((rot * Math.PI) / 180);
        c.fillStyle = '#9be06f';
        c.fillRect(-s * 0.1, -s * 0.06, s * 0.2, s * 0.12);
        c.strokeStyle = '#5fb03a';
        c.lineWidth = 1.2;
        c.strokeRect(-s * 0.1, -s * 0.06, s * 0.2, s * 0.12);
        c.restore();
      }
    },
  },
  tomato: {
    raw(c, x, y, s) {
      ellipse(c, x, y + s * 0.03, s * 0.38, s * 0.34, '#e0402f', '#a52a1d');
      c.fillStyle = '#3f9a2a';
      for (let i = 0; i < 5; i++) {
        c.save();
        c.translate(x, y - s * 0.28);
        c.rotate((i * Math.PI * 2) / 5);
        ellipse(c, 0, -s * 0.06, s * 0.05, s * 0.1, '#3f9a2a');
        c.restore();
      }
    },
    chopped(c, x, y, s) {
      for (const [dx, dy] of [[-0.17, 0.05], [0.17, -0.02], [0, 0.15]]) {
        ellipse(c, x + dx * s, y + dy * s, s * 0.2, s * 0.17, '#e8503a', '#a52a1d');
        ellipse(c, x + dx * s, y + dy * s, s * 0.11, s * 0.09, '#f5806a');
      }
    },
  },
  cheese(c, x, y, s) {
    c.beginPath();
    c.moveTo(x - s * 0.4, y + s * 0.22);
    c.lineTo(x + s * 0.4, y + s * 0.22);
    c.lineTo(x + s * 0.4, y - s * 0.04);
    c.lineTo(x - s * 0.4, y - s * 0.3);
    c.closePath();
    c.fillStyle = '#f7c93e';
    c.fill();
    c.strokeStyle = '#c99a12';
    c.lineWidth = Math.max(1.5, s * 0.04);
    c.stroke();
    for (const [dx, dy, r] of [[-0.2, 0.08, 0.06], [0.08, 0.1, 0.05], [0.24, 0.02, 0.04]]) ellipse(c, x + dx * s, y + dy * s, r * s, r * s, '#d9a417');
  },
  pasta: {
    raw(c, x, y, s) {
      c.strokeStyle = '#e8cf7c';
      c.lineWidth = Math.max(2, s * 0.05);
      c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) {
        c.beginPath();
        c.moveTo(x + i * s * 0.07 - s * 0.06, y - s * 0.32);
        c.lineTo(x + i * s * 0.07 + s * 0.06, y + s * 0.32);
        c.stroke();
      }
      c.strokeStyle = '#c0392b';
      c.lineWidth = s * 0.07;
      c.beginPath();
      c.moveTo(x - s * 0.3, y);
      c.lineTo(x + s * 0.3, y);
      c.stroke();
    },
    boiled(c, x, y, s) {
      c.strokeStyle = '#f3dc8c';
      c.lineWidth = Math.max(2.5, s * 0.07);
      c.lineCap = 'round';
      for (let row = -1; row <= 1; row++) {
        c.beginPath();
        for (let i = 0; i <= 16; i++) {
          const px = x - s * 0.36 + (s * 0.72 * i) / 16;
          const py = y + row * s * 0.12 + Math.sin(i * 1.1 + row) * s * 0.07;
          if (i === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.stroke();
      }
    },
  },
  sauce(c, x, y, s) {
    c.beginPath();
    c.roundRect(x - s * 0.2, y - s * 0.12, s * 0.4, s * 0.46, s * 0.1);
    c.fillStyle = '#d32f2f';
    c.fill();
    c.strokeStyle = '#8e1b1b';
    c.lineWidth = Math.max(1.5, s * 0.04);
    c.stroke();
    c.fillStyle = '#f5f5f5';
    c.fillRect(x - s * 0.14, y + s * 0.05, s * 0.28, s * 0.14);
    c.beginPath();
    c.moveTo(x - s * 0.12, y - s * 0.12);
    c.lineTo(x + s * 0.12, y - s * 0.12);
    c.lineTo(x + s * 0.05, y - s * 0.34);
    c.lineTo(x - s * 0.05, y - s * 0.34);
    c.closePath();
    c.fillStyle = '#f6e3b0';
    c.fill();
  },
  egg(c, x, y, s) {
    c.beginPath();
    c.moveTo(x - s * 0.38, y);
    c.bezierCurveTo(x - s * 0.4, y - s * 0.34, x + s * 0.1, y - s * 0.4, x + s * 0.34, y - s * 0.16);
    c.bezierCurveTo(x + s * 0.5, y + s * 0.16, x + s * 0.1, y + s * 0.38, x - s * 0.2, y + s * 0.28);
    c.bezierCurveTo(x - s * 0.36, y + s * 0.24, x - s * 0.38, y + s * 0.1, x - s * 0.38, y);
    c.fillStyle = '#fffdf6';
    c.fill();
    c.strokeStyle = '#d9cfb0';
    c.lineWidth = Math.max(1, s * 0.03);
    c.stroke();
    ellipse(c, x - s * 0.02, y - s * 0.02, s * 0.16, s * 0.15, '#ffb300');
    ellipse(c, x - s * 0.06, y - s * 0.07, s * 0.04, s * 0.03, '#ffe082');
  },
  bacon: {
    raw(c, x, y, s) {
      strip(c, x, y - s * 0.08, s, '#d8706a', '#f6d7d0');
      strip(c, x, y + s * 0.14, s, '#d8706a', '#f6d7d0');
    },
    grilled(c, x, y, s) {
      strip(c, x, y - s * 0.08, s, '#8a2f26', '#c45c3d');
      strip(c, x, y + s * 0.14, s, '#8a2f26', '#c45c3d');
    },
  },
};

export function drawFood(c, id, form, x, y, s) {
  const entry = drawers[id];
  if (!entry) return;
  c.save();
  if (typeof entry === 'function') entry(c, x, y, s);
  else (entry[form] || entry.raw || entry.grilled || entry.chopped || entry.boiled)(c, x, y, s);
  c.restore();
}

export function drawKey(c, key, x, y, s) {
  const [id, form] = key.split('.');
  drawFood(c, id, form || 'raw', x, y, s);
}
