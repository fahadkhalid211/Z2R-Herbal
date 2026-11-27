export const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 aPos;
in vec3 aNormal;
in vec2 aUv;

uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMat;
uniform int uMode;
uniform vec2 uBand; // label band: bottom, top (bottle-height units)

out vec3 vNormal;
out vec3 vWorld;
out vec2 vUv;
out float vY;

void main() {
  vec3 p = aPos;
  if (uMode == 2) p.y = mix(uBand.x, uBand.y, aPos.y);
  vec4 world = uModel * vec4(p, 1.0);
  vWorld = world.xyz;
  vNormal = uNormalMat * aNormal;
  vUv = aUv;
  vY = p.y;
  gl_Position = uViewProj * world;
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int; // must match the vertex shader for the shared uMode uniform

in vec3 vNormal;
in vec3 vWorld;
in vec2 vUv;
in float vY;

uniform int uMode;
uniform vec3 uEye;
uniform sampler2D uLabel;
uniform vec3 uOil;
uniform vec3 uCap;
uniform float uRim;  // 0…1, pulses with the golden ring
uniform float uFade; // 0…1 fade-in after the first frame

out vec4 outColor;

const vec3 KEY = normalize(vec3(-0.55, 0.75, 0.6));
const vec3 RIM = normalize(vec3(0.75, 0.2, -0.6));
const vec3 GOLD = vec3(1.0, 0.82, 0.45);

// Studio around the bottle: deep green surround (matches the hero), two tall
// softboxes (left strong, right soft) and a warm top light.
vec3 env(vec3 d) {
  vec3 base = mix(vec3(0.02, 0.07, 0.04), vec3(0.09, 0.17, 0.1), smoothstep(-0.4, 0.8, d.y));
  vec2 h = d.xz / max(length(d.xz), 1e-4);
  float band = smoothstep(-0.45, 0.05, d.y) * (1.0 - smoothstep(0.7, 0.92, d.y));
  float boxL = smoothstep(0.86, 0.97, dot(h, normalize(vec2(-0.78, 0.62)))) * band;
  float boxR = smoothstep(0.92, 0.985, dot(h, normalize(vec2(0.86, 0.5)))) * band;
  float top = smoothstep(0.78, 1.0, d.y);
  return base + vec3(1.0, 0.97, 0.9) * boxL * 1.5 + vec3(0.85, 1.0, 0.8) * boxR * 0.7 + vec3(1.0, 0.9, 0.7) * top * 0.18;
}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(uEye - vWorld);
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  vec3 R = reflect(-V, N);
  float fres = 0.04 + 0.96 * pow(1.0 - NdV, 5.0);
  float diff = clamp(dot(N, KEY), 0.0, 1.0);
  float spec = pow(clamp(dot(R, KEY), 0.0, 1.0), 90.0);
  float rim = pow(1.0 - NdV, 3.0) * clamp(dot(N, RIM) * 0.5 + 0.5, 0.0, 1.0);

  vec4 color;
  if (uMode == 0) {
    // Glass adds reflected light and only slightly darkens what is behind it.
    vec3 light = env(R) * (0.06 + fres) + spec * 1.3 + GOLD * rim * uRim * 0.7;
    float alpha = clamp(fres * 0.55 + 0.035 + spec * 0.5, 0.0, 1.0);
    color = vec4(light, alpha);
  } else if (uMode == 1) {
    // Looking through the centre crosses more oil (deeper colour); edges are backlit.
    vec3 deep = uOil * 0.85;
    vec3 lit = uOil * 1.18 + vec3(0.05, 0.03, 0.0);
    vec3 body = mix(lit, deep, smoothstep(0.15, 0.95, NdV));
    vec3 c = body * (0.78 + 0.22 * diff) + env(R) * fres * 0.35 + spec * 0.6 + GOLD * rim * uRim * 0.35;
    color = vec4(c * 0.93, 0.93);
  } else if (uMode == 2) {
    vec3 tex = texture(uLabel, vec2(vUv.x, 1.0 - vUv.y)).rgb;
    float shade = 0.6 + 0.4 * diff + 0.1 * NdV;
    color = vec4(tex * shade + spec * 0.16 + GOLD * rim * uRim * 0.2, 1.0);
  } else {
    // Ribs: bend the normal around the axis on the cap's side wall.
    vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), N) + 1e-5);
    float angle = atan(vWorld.z, vWorld.x);
    float wall = 1.0 - smoothstep(0.4, 0.7, abs(N.y));
    vec3 Nr = normalize(N + tangent * sin(angle * 60.0) * 0.22 * wall);
    vec3 Rr = reflect(-V, Nr);
    float d = clamp(dot(Nr, KEY), 0.0, 1.0);
    vec3 c = uCap * (0.84 + 0.16 * d) + pow(clamp(dot(Rr, KEY), 0.0, 1.0), 28.0) * 0.2 + env(Rr) * 0.04;
    color = vec4(c, 1.0);
  }
  outColor = color * uFade;
}
`;
