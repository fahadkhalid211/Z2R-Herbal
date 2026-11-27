export interface Mesh {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
}

export function lathe(
  profile: readonly (readonly [number, number])[],
  segments: number,
  { closeBottom = false, closeTop = false } = {},
): Mesh {
  const rings = profile.length;
  const cols = segments + 1; // duplicate seam column so UVs wrap cleanly
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const lengths = [0];
  for (let i = 1; i < rings; i++) {
    const [r0, y0] = profile[i - 1]!;
    const [r1, y1] = profile[i]!;
    lengths.push(lengths[i - 1]! + Math.hypot(r1 - r0, y1 - y0));
  }
  const total = lengths[rings - 1] || 1;

  for (let i = 0; i < rings; i++) {
    const [r, y] = profile[i]!;
    const [rp, yp] = profile[Math.max(0, i - 1)]!;
    const [rn, yn] = profile[Math.min(rings - 1, i + 1)]!;
    let nr = yn - yp;
    let ny = -(rn - rp);
    const len = Math.hypot(nr, ny) || 1;
    nr /= len;
    ny /= len;
    for (let j = 0; j < cols; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      positions.push(r * c, y, r * s);
      normals.push(nr * c, ny, nr * s);
      uvs.push(j / segments, lengths[i]! / total);
    }
  }

  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }

  const addCap = (ring: number, y: number, ny: number) => {
    const centre = positions.length / 3;
    positions.push(0, y, 0);
    normals.push(0, ny, 0);
    uvs.push(0.5, ny > 0 ? 1 : 0);
    for (let j = 0; j < segments; j++) {
      const a = ring * cols + j;
      if (ny > 0) indices.push(centre, a + 1, a);
      else indices.push(centre, a, a + 1);
    }
  };
  if (closeBottom) addCap(0, profile[0]![1], -1);
  if (closeTop) addCap(rings - 1, profile[rings - 1]![1], 1);

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

export function arcBand(radius: number, halfAngle: number, segments: number, rows: number): Mesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rows; i++) {
    const v = i / rows;
    for (let j = 0; j <= segments; j++) {
      const u = j / segments;
      const theta = -halfAngle + u * 2 * halfAngle;
      const x = Math.sin(theta);
      const z = Math.cos(theta);
      positions.push(radius * x, v, radius * z);
      normals.push(x, 0, z);
      uvs.push(u, v);
    }
  }
  const cols = segments + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}
