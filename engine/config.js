
/* --------------------------- Base configuration ------------------------- */
const BASE_WIDTH = 1280;   // Fixed internal render resolution (landscape 16:9)
const BASE_HEIGHT = 720;

/* ------------------------------ Utilities -------------------------------- */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStar(ctx, cx, cy, points, outerR, innerR, color) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

function drawPolygon(ctx, cx, cy, r, sides, color) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

function isMobileDevice() {
  const ua = navigator.userAgent || '';
  const uaMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile|webOS/i.test(ua);
  const touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  return uaMobile || (touch && Math.min(window.innerWidth, window.innerHeight) < 900);
}
