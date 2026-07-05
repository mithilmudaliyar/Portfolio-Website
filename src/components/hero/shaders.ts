/**
 * One custom GLSL shader pair drives the whole dust field: soft, additive
 * glow points with per-particle drift, size and tint. Simple geometry,
 * carefully tuned material — instead of many heavy meshes.
 */
export const dustVertex = /* glsl */ `
attribute float aScale;
attribute float aSeed;
attribute float aTint;

uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;
varying float vTint;

void main() {
  vec3 p = position;
  float t = uTime * 0.12;

  // Slow, seeded drift so the field feels alive but never busy.
  p.x += sin(t + aSeed * 6.2831) * 0.4;
  p.y += cos(t * 0.8 + aSeed * 12.566) * 0.35;
  p.z += sin(t * 0.6 + aSeed * 3.1415) * 0.3;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * uPixelRatio * (42.0 / -mv.z);

  vAlpha = smoothstep(30.0, 6.0, -mv.z) * (0.35 + 0.65 * fract(aSeed * 7.13));
  vTint = aTint;
}
`

export const dustFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vTint;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float glow = pow(max(0.0, 1.0 - d * 2.0), 2.4);
  vec3 color = mix(uColorA, uColorB, vTint);
  gl_FragColor = vec4(color, glow * vAlpha);
}
`
