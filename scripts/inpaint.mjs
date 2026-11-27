function relax(img, mask, w, h, iterations) {
  for (let it = 0; it < iterations; it++)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (!mask[p]) continue;
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let n = 0;
          for (const [ok, q] of [
            [x > 0, p - 1],
            [x < w - 1, p + 1],
            [y > 0, p - w],
            [y < h - 1, p + w],
          ]) {
            if (!ok) continue;
            sum += img[q * 3 + c];
            n++;
          }
          img[p * 3 + c] = sum / n;
        }
      }
}

export function inpaint(img, mask, w, h) {
  if (Math.min(w, h) <= 24) {
    relax(img, mask, w, h, 600);
    return;
  }
  const w2 = Math.ceil(w / 2);
  const h2 = Math.ceil(h / 2);
  const img2 = new Float32Array(w2 * h2 * 3);
  const mask2 = new Uint8Array(w2 * h2);
  for (let y = 0; y < h2; y++)
    for (let x = 0; x < w2; x++) {
      const acc = [0, 0, 0];
      let n = 0;
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++) {
          const sx = 2 * x + dx;
          const sy = 2 * y + dy;
          if (sx >= w || sy >= h || mask[sy * w + sx]) continue;
          for (let c = 0; c < 3; c++) acc[c] += img[(sy * w + sx) * 3 + c];
          n++;
        }
      const q = y * w2 + x;
      if (n === 0) mask2[q] = 1;
      else for (let c = 0; c < 3; c++) img2[q * 3 + c] = acc[c] / n;
    }
  inpaint(img2, mask2, w2, h2);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (!mask[p]) continue;
      const fx = Math.min(Math.max((x - 0.5) / 2, 0), w2 - 1);
      const fy = Math.min(Math.max((y - 0.5) / 2, 0), h2 - 1);
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const x1 = Math.min(x0 + 1, w2 - 1);
      const y1 = Math.min(y0 + 1, h2 - 1);
      const ax = fx - x0;
      const ay = fy - y0;
      for (let c = 0; c < 3; c++) {
        const top = img2[(y0 * w2 + x0) * 3 + c] * (1 - ax) + img2[(y0 * w2 + x1) * 3 + c] * ax;
        const bottom = img2[(y1 * w2 + x0) * 3 + c] * (1 - ax) + img2[(y1 * w2 + x1) * 3 + c] * ax;
        img[p * 3 + c] = top * (1 - ay) + bottom * ay;
      }
    }
  relax(img, mask, w, h, 30);
}
