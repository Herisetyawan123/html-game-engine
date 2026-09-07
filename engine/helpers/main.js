
/* ============================ Shared visual helpers ============================ */
function drawBackdrop(ctx, assets) {
  const img = assets.getImage('bg_gradient');
  if (img) ctx.drawImage(img, 0, 0, BASE_WIDTH, BASE_HEIGHT);
  else { ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT); }
}

function setBackgroundImage(ctx, assets, key) {
  const img = assets.getImage(key);
  if (img) ctx.drawImage(img, 0, 0, BASE_WIDTH, BASE_HEIGHT);
  else { ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT); }
}

/* Registers every procedurally-generated asset used by the demo game.
   Replace registerImage(...) calls with registerImageBase64(...) once real
   artwork is embedded - nothing else in the framework needs to change. */
function registerAllAssets(assets, opts = {}) {
  assets.registerImage('bg_gradient', (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  }, BASE_WIDTH, BASE_HEIGHT);

  const shapeDrawers = {
    shape_circle: (ctx, w, h) => { ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); ctx.fill(); },
    shape_square: (ctx, w, h) => { ctx.fillStyle = '#3b82f6'; ctx.fillRect(6, 6, w - 12, h - 12); },
    shape_triangle: (ctx, w, h) => { ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.moveTo(w / 2, 6); ctx.lineTo(w - 6, h - 6); ctx.lineTo(6, h - 6); ctx.closePath(); ctx.fill(); },
    shape_star: (ctx, w, h) => { drawStar(ctx, w / 2, h / 2, 5, w / 2 - 6, w / 4, '#f59e0b'); },
    shape_diamond: (ctx, w, h) => { ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.moveTo(w / 2, 6); ctx.lineTo(w - 6, h / 2); ctx.lineTo(w / 2, h - 6); ctx.lineTo(6, h / 2); ctx.closePath(); ctx.fill(); },
    shape_hex: (ctx, w, h) => { drawPolygon(ctx, w / 2, h / 2, w / 2 - 6, 6, '#14b8a6'); }
  };
  for (const key in shapeDrawers) assets.registerImage(key, shapeDrawers[key], 120, 120);

  const imageBase64 = opts.images || {};
  for(const key in imageBase64) {
    assets.registerImageBase64(key, imageBase64[key]);
  }

  const audioBase64 = opts.audios || {};
  for(const key in audioBase64) {
    assets.registerSound(key, audioBase64[key]);
  }
}