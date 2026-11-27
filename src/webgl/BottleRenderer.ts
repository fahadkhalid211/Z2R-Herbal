import profile from "./bottle-profile.json";
import labelBands from "./label-bands.json";
import { arcBand, lathe, type Mesh } from "./geometry";
import {
  identity,
  lookAt,
  multiply,
  normalMatrix,
  perspective,
  rotateX,
  rotateY,
  scale,
  translate,
  type Mat4,
} from "./math";
import { FrameBudget, transitionPoses, type Pose } from "./motion";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

export interface BottleLook {
  slug: string;
  label: string;
  oil: string;
  cap: string;
}

interface GpuMesh {
  vao: WebGLVertexArrayObject;
  buffers: WebGLBuffer[];
  count: number;
}

interface Transition {
  from: BottleLook;
  to: BottleLook;
  start: number;
  dir: 1 | -1;
}

type Rgb = [number, number, number];

const MODE = { glass: 0, oil: 1, label: 2, cap: 3 } as const;
const TRANSITION_MS = 900; // = --dur-slide, so the DOM box layer moves in step
const FADE_MS = 600;
const RING_MS = 3000; // matches the CSS ring pulse
const OIL_TOP = 0.805; // oil level, bottle-height units (up into the shoulder, as in the photos)
const LABEL_RADIUS = 0.1635; // a hair outside the glass (r ≈ 0.161)
const CAMERA_DIST = 2.75;
const FOV = (24 * Math.PI) / 180;
const REST: Pose = { x: 0, rotY: 0, alpha: 1, scale: 1 };
const UNIFORMS = [
  "uModel",
  "uViewProj",
  "uNormalMat",
  "uMode",
  "uBand",
  "uEye",
  "uLabel",
  "uOil",
  "uCap",
  "uRim",
  "uFade",
] as const;
const bands = labelBands.products as Record<string, { top: number; bottom: number }>;

const hexToRgb = (hex: string): Rgb => {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

export class BottleRenderer {
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();
  private readonly textures = new Map<string, WebGLTexture>();
  private readonly budget = new FrameBudget();
  private meshes!: { glass: GpuMesh; oil: GpuMesh; cap: GpuMesh; label: GpuMesh };

  private look: BottleLook | null = null;
  private transition: Transition | null = null;
  private pointer = { x: 0, y: 0 };
  private drag = 0;
  private rot = { x: 0, y: 0 };
  private maxDpr = 1.75;
  private visible = true;
  private running = false;
  private frame = 0;
  private lastTime = 0;
  private firstFrame = 0;

  static async create(canvas: HTMLCanvasElement, onLost: () => void): Promise<BottleRenderer | null> {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return null;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      onLost();
    });
    const program = await linkProgram(gl);
    return new BottleRenderer(canvas, gl, program);
  }

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
  ) {
    for (const name of UNIFORMS) this.uniforms.set(name, gl.getUniformLocation(program, name));
    this.meshes = this.buildMeshes();
  }

  async setLook(look: BottleLook, direction: 1 | -1): Promise<void> {
    await this.loadTexture(look.label);
    if (!this.look) {
      this.look = look;
      return;
    }
    if (look.slug === this.look.slug) return;
    this.transition = { from: this.look, to: look, start: performance.now(), dir: direction };
    this.look = look;
  }

  setPointer(x: number, y: number): void {
    this.pointer.x = Math.max(-1, Math.min(1, x));
    this.pointer.y = Math.max(-1, Math.min(1, y));
  }

  setDrag(rad: number): void {
    this.drag = Math.max(-0.7, Math.min(0.7, rad));
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) this.start();
  }

  start(): void {
    if (this.running || !this.visible) return;
    this.running = true;
    this.lastTime = performance.now();
    const tick = (now: number) => {
      if (!this.visible) {
        this.running = false;
        return;
      }
      this.render(now);
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.running = false;
    const gl = this.gl;
    for (const mesh of Object.values(this.meshes)) {
      gl.deleteVertexArray(mesh.vao);
      mesh.buffers.forEach((b) => gl.deleteBuffer(b));
    }
    this.textures.forEach((t) => gl.deleteTexture(t));
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private upload(mesh: Mesh): GpuMesh {
    const gl = this.gl;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buffers: WebGLBuffer[] = [];
    [mesh.positions, mesh.normals, mesh.uvs].forEach((data, loc) => {
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, loc === 2 ? 2 : 3, gl.FLOAT, false, 0, 0);
      buffers.push(buf);
    });
    const ibo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    buffers.push(ibo);
    gl.bindVertexArray(null);
    return { vao, buffers, count: mesh.indices.length };
  }

  private buildMeshes() {
    const body = profile.body as [number, number][];
    const cap = profile.cap as [number, number][];
    const oilProfile = body
      .filter(([, y]) => y >= 0.012 && y <= OIL_TOP)
      .map(([r, y]) => [r * 0.93, y] as [number, number]);
    return {
      glass: this.upload(lathe(body, 72, { closeBottom: true })),
      oil: this.upload(lathe(oilProfile, 64, { closeBottom: true, closeTop: true })),
      cap: this.upload(lathe(cap, 72, { closeTop: true })),
      label: this.upload(arcBand(LABEL_RADIUS, (labelBands.thetaMaxDeg * Math.PI) / 180, 48, 8)),
    };
  }

  private async loadTexture(url: string): Promise<void> {
    if (this.textures.has(url)) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Label texture ${url}: ${res.status}`);
    const bitmap = await createImageBitmap(await res.blob());
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    bitmap.close();
    this.textures.set(url, tex);
  }

  private resize(): number {
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return w / Math.max(1, h);
  }

  private render(now: number): void {
    if (!this.look) return;
    const gl = this.gl;
    const frameMs = now - this.lastTime;
    const dt = Math.min(0.05, frameMs / 1000);
    this.lastTime = now;
    if (!this.firstFrame) this.firstFrame = now;
    if (this.budget.push(frameMs)) this.maxDpr = 1;

    const idle = Math.sin(now / 2600) * (this.drag === 0 ? 0.2 : 0.05);
    const k = 1 - Math.exp(-dt * 6);
    const target = Math.max(-1.1, Math.min(1.1, this.pointer.x * 0.28 + idle + this.drag));
    this.rot.y += (target - this.rot.y) * k;
    this.rot.x += (this.pointer.y * 0.12 - this.rot.x) * k;

    const aspect = this.resize();
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(this.program);

    const eye = [0, 0.04, CAMERA_DIST] as const;
    const u = (name: (typeof UNIFORMS)[number]) => this.uniforms.get(name) ?? null;
    gl.uniformMatrix4fv(
      u("uViewProj"),
      false,
      multiply(perspective(FOV, aspect, 0.1, 10), lookAt(eye, [0, 0, 0], [0, 1, 0])),
    );
    gl.uniform3f(u("uEye"), eye[0], eye[1], eye[2]);
    gl.uniform1f(u("uRim"), 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((now / RING_MS) * Math.PI * 2)));
    gl.uniform1i(u("uLabel"), 0);
    gl.activeTexture(gl.TEXTURE0);

    const fadeIn = Math.min(1, (now - this.firstFrame) / FADE_MS);
    const bob = Math.sin(now / 900) * 0.006;
    const t = this.transition;
    if (t) {
      const progress = (now - t.start) / TRANSITION_MS;
      const { outgoing, incoming } = transitionPoses(progress, t.dir);
      this.drawBottle(t.from, outgoing, bob, fadeIn);
      this.drawBottle(t.to, incoming, bob, fadeIn);
      if (progress >= 1) this.transition = null;
    } else {
      this.drawBottle(this.look, REST, bob, fadeIn);
    }
    gl.bindVertexArray(null);
  }

  private drawBottle(look: BottleLook, pose: Pose, bob: number, fadeIn: number): void {
    const alpha = pose.alpha * fadeIn;
    if (alpha <= 0.001) return;
    const gl = this.gl;
    const u = (name: (typeof UNIFORMS)[number]) => this.uniforms.get(name) ?? null;

    let model: Mat4 = translate(identity(), [pose.x, bob, 0]);
    model = rotateX(model, this.rot.x);
    model = rotateY(model, this.rot.y + pose.rotY);
    model = scale(model, pose.scale);
    model = translate(model, [0, -0.5, 0]);

    gl.uniformMatrix4fv(u("uModel"), false, model);
    gl.uniformMatrix3fv(u("uNormalMat"), false, normalMatrix(model));
    gl.uniform3fv(u("uOil"), hexToRgb(look.oil));
    gl.uniform3fv(u("uCap"), hexToRgb(look.cap));
    gl.uniform1f(u("uFade"), alpha);
    const band = bands[look.slug] ?? { bottom: 0.08, top: 0.7 };
    gl.uniform2f(u("uBand"), band.bottom, band.top);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.get(look.label) ?? null);

    const draw = (mesh: GpuMesh, mode: number, cull: number, depthWrite: boolean) => {
      gl.uniform1i(u("uMode"), mode);
      gl.cullFace(cull);
      gl.depthMask(depthWrite);
      gl.bindVertexArray(mesh.vao);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    };

    draw(this.meshes.glass, MODE.glass, gl.FRONT, false);
    draw(this.meshes.oil, MODE.oil, gl.BACK, true);
    draw(this.meshes.label, MODE.label, gl.BACK, true);
    draw(this.meshes.cap, MODE.cap, gl.BACK, true);
    draw(this.meshes.glass, MODE.glass, gl.BACK, false);
  }
}

async function linkProgram(gl: WebGL2RenderingContext): Promise<WebGLProgram> {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.bindAttribLocation(program, 1, "aNormal");
  gl.bindAttribLocation(program, 2, "aUv");
  gl.linkProgram(program);

  const parallel = gl.getExtension("KHR_parallel_shader_compile");
  if (parallel) {
    while (!gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) await nextFrame();
  }
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getShaderInfoLog(vs) || gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(program);
    throw new Error(`Bottle shader failed: ${log}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}
