export type Mat4 = Float32Array;
export type Mat3 = Float32Array;
export type Vec3 = readonly [number, number, number];

export function identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row]! * b[col * 4 + k]!;
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

export function translate(m: Mat4, [x, y, z]: Vec3): Mat4 {
  const t = identity();
  t[12] = x;
  t[13] = y;
  t[14] = z;
  return multiply(m, t);
}

export function scale(m: Mat4, s: number): Mat4 {
  const t = identity();
  t[0] = t[5] = t[10] = s;
  return multiply(m, t);
}

export function rotateX(m: Mat4, rad: number): Mat4 {
  const r = identity();
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  r[5] = c;
  r[6] = s;
  r[9] = -s;
  r[10] = c;
  return multiply(m, r);
}

export function rotateY(m: Mat4, rad: number): Mat4 {
  const r = identity();
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  r[0] = c;
  r[2] = -s;
  r[8] = s;
  r[10] = c;
  return multiply(m, r);
}

export function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const z = normalize(sub(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  const m = identity();
  m[0] = x[0];
  m[4] = x[1];
  m[8] = x[2];
  m[1] = y[0];
  m[5] = y[1];
  m[9] = y[2];
  m[2] = z[0];
  m[6] = z[1];
  m[10] = z[2];
  m[12] = -dot(x, eye);
  m[13] = -dot(y, eye);
  m[14] = -dot(z, eye);
  return m;
}

export function normalMatrix(m: Mat4): Mat3 {
  const [a, b, c, , d, e, f, , g, h, i] = m as unknown as number[];
  const A = e! * i! - f! * h!;
  const B = -(d! * i! - f! * g!);
  const C = d! * h! - e! * g!;
  const det = a! * A + b! * B + c! * C || 1;
  return new Float32Array([
    A / det,
    B / det,
    C / det,
    -(b! * i! - c! * h!) / det,
    (a! * i! - c! * g!) / det,
    -(a! * h! - b! * g!) / det,
    (b! * f! - c! * e!) / det,
    -(a! * f! - c! * d!) / det,
    (a! * e! - b! * d!) / det,
  ]);
}

export function transformPoint(m: Mat4, [x, y, z]: Vec3): Vec3 {
  const w = m[3]! * x + m[7]! * y + m[11]! * z + m[15]!;
  return [
    (m[0]! * x + m[4]! * y + m[8]! * z + m[12]!) / w,
    (m[1]! * x + m[5]! * y + m[9]! * z + m[13]!) / w,
    (m[2]! * x + m[6]! * y + m[10]! * z + m[14]!) / w,
  ];
}
