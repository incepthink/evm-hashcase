(() => {
"use strict";
const TEST = /test/.test(location.search);
const CATS = window.CATS, DEST = window.DEST;
const SW = 1920, SH = 1080, U = 0.05;           // plane px -> world units
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const hex2rgb = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const srgb2lin = c => c.map(v => Math.pow(v, 2.2));
const stage = $("#stage"), glc = $("#gl"), ui = $("#ui"), uctx = ui.getContext("2d");

// ------------------------------------------------------------------ stage fit
let DPR = 1;
function fit() {
  const s = Math.min(innerWidth / SW, innerHeight / SH);
  stage.style.transform = `translate(${(innerWidth - SW * s) / 2}px,${(innerHeight - SH * s) / 2}px) scale(${s})`;
  stage._s = s;
  DPR = clamp(s * (window.devicePixelRatio || 1), 0.5, 1.5);
  if (TEST) DPR = 0.5;
  resize();
}

// ------------------------------------------------------------------ world data (terrain)
const T = window.TER, H = T;
const PW = T.PW, PH = T.PH, CX = PW / 2, CZ = PH / 2;
const wx = px => (px - CX) * U, wz = py => (py - CZ) * U;
const R = 17 * U;                                  // tower footprint radius
const HW = T.HW, HH = T.HH, KH = 4.2, FLOOR = -1.6, TOPB = 0.0;   // height scale, floor level
const hraw = Uint16Array.from(atob(T.h), (c, i) => 0);
{ const b = atob(T.h); const u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i); hraw.set(new Uint16Array(u8.buffer).subarray(0, HW * HH)); }
const HGT = new Float32Array(HW * HH); for (let i = 0; i < HW * HH; i++) HGT[i] = hraw[i] / 65535 * T.HMAX;
// CPU mask + district-id grids at heightfield resolution (drawn on a private canvas: never tainted)
const MASK = new Uint8Array(HW * HH), DID = new Uint8Array(HW * HH);
{
  const cv = document.createElement("canvas"); cv.width = HW; cv.height = HH; const c = cv.getContext("2d");
  const k = HW / PW;
  c.fillStyle = "#000"; c.fillRect(0, 0, HW, HH);
  T.districts.forEach((d, i) => { c.fillStyle = `rgb(${i + 1},0,255)`; c.beginPath(); d.rings.forEach(r => { r.forEach((p, j) => j ? c.lineTo(p[0] * k, p[1] * k) : c.moveTo(p[0] * k, p[1] * k)); c.closePath(); }); c.fill(); });
  const m = c.getImageData(0, 0, HW, HH).data;
  const mc = document.createElement("canvas"); mc.width = HW; mc.height = HH; const mx = mc.getContext("2d");
  mx.fillStyle = "#000"; mx.fillRect(0, 0, HW, HH); mx.fillStyle = "#fff"; mx.beginPath(); T.outline.forEach((p, j) => j ? mx.lineTo(p[0] * k, p[1] * k) : mx.moveTo(p[0] * k, p[1] * k)); mx.closePath(); mx.fill();
  const mm = mx.getImageData(0, 0, HW, HH).data;
  for (let i = 0; i < HW * HH; i++) { const bl = m[i * 4 + 2]; DID[i] = bl > 40 ? Math.round(m[i * 4] * 255 / bl) : 0; MASK[i] = mm[i * 4] > 127 ? 1 : 0; }
  // edge pixels blended between two districts: take the most common clean neighbour
  for (let z = 1; z < HH - 1; z++) for (let x = 1; x < HW - 1; x++) { const i = z * HW + x, bl = m[i * 4 + 2]; if (bl > 40 && bl < 250) { const cnt = {}; for (const o of [-1, 1, -HW, HW, -HW - 1, -HW + 1, HW - 1, HW + 1]) { if (m[(i + o) * 4 + 2] >= 250) { const v = m[(i + o) * 4]; cnt[v] = (cnt[v] || 0) + 1; } } const best = Object.entries(cnt).sort((p, q) => q[1] - p[1])[0]; if (best) DID[i] = +best[0]; } }
}
const gridIdx = (x, z) => { const gx = clamp(Math.floor((x / U + CX) / PW * HW), 0, HW - 1), gz = clamp(Math.floor((z / U + CZ) / PH * HH), 0, HH - 1); return gz * HW + gx; };
function rawH(x, z) {   // bilinear terrain elevation (metres) at world x,z
  const fx = clamp((x / U + CX) / PW * HW - .5, 0, HW - 1.001), fz = clamp((z / U + CZ) / PH * HH - .5, 0, HH - 1.001);
  const x0 = fx | 0, z0 = fz | 0, tx = fx - x0, tz = fz - z0, i = z0 * HW + x0;
  return (HGT[i] * (1 - tx) + HGT[i + 1] * tx) * (1 - tz) + (HGT[i + HW] * (1 - tx) + HGT[i + HW + 1] * tx) * tz;
}
const inside = (x, z) => MASK[gridIdx(x, z)] === 1;
const districtAt = (x, z) => DID[gridIdx(x, z)] - 1;
let selDist = -1, hovDist = -2, liftSel = 0, liftHov = 0;
function surfY(x, z) { if (!inside(x, z)) return FLOOR; const d = districtAt(x, z); return TOPB + rawH(x, z) / T.HMAX * KH + (d === selDist ? liftSel : 0) + (d === hovDist ? liftHov : 0); }
const MUMX = wx(lonlatToPlane(72.88, 19.08)[0]), MUMZ = wz(lonlatToPlane(72.88, 19.08)[1]);

// destinations
for (const k in CATS) { CATS[k].rgb = hex2rgb(CATS[k].color); CATS[k].lin = srgb2lin(CATS[k].rgb); CATS[k].count = 0; }
function lonlatToPlane(lon, lat) {
  const n = 256 * Math.pow(2, T.zoom), s = Math.sin(lat * Math.PI / 180);
  const x = (lon + 180) / 360 * n, y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
  return [(x - T.gx0) * T.sx, (y - T.gy0) * T.sy];
}
DEST.forEach((d, i) => {
  const [px, py] = lonlatToPlane(d.lon, d.lat);
  d.x = wx(px); d.z = wz(py); d.i = i; d.cat = CATS[d.c];
  const nrm = v => v.toLowerCase().replace(/^chh\. /, 'chhatrapati ').replace(/ (city|suburban)$/, '').trim();
  const bi = T.districts.findIndex(dd => nrm(dd.name) === nrm(d.d));
  d.d0 = bi >= 0 ? bi : districtAt(d.x, d.z);
  if (d.d0 < 0) { let best = -1, bd = 1e9; for (let r = 1; r < 12 && best < 0; r++) for (let a = 0; a < 16; a++) { const k = districtAt(d.x + Math.cos(a / 16 * 6.283) * r * .25, d.z + Math.sin(a / 16 * 6.283) * r * .25); if (k >= 0) { best = k; break; } } d.d0 = best; }
  d.dist = T.districts[d.d0] || null;
  d.dist0 = Math.hypot(d.x - MUMX, d.z - MUMZ);
  d.rise = 0; d.sel = 0; d.hov = 0; d.focus = 1; d.seed = Math.random() * 10;
});

// ------------------------------------------------------------------ WebGL2 setup
const gl = glc.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
if (!gl) { document.body.innerHTML = "<p style='color:#fff;padding:40px'>WebGL2 is required.</p>"; return; }
const extCBF = gl.getExtension("EXT_color_buffer_float");
const HDR = !!extCBF;
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + "\n" + src); return s; }
function prog(vs, fs) {
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, "#version 300 es\nprecision highp float;\n" + vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, "#version 300 es\nprecision highp float;\n" + fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  p.u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); p.u[a.name] = gl.getUniformLocation(p, a.name); }
  return p;
}

// ---- hex prism geometry: pos(3) nrm(3) edge(1) top(1)
function hexGeo() {
  const v = [], C = [];
  for (let k = 0; k < 6; k++) { const a = (30 + 60 * k) * Math.PI / 180; C.push([Math.cos(a), Math.sin(a)]); }
  for (let k = 0; k < 6; k++) {
    const a = C[k], b = C[(k + 1) % 6];
    v.push(0, 1, 0, 0, 1, 0, 1, 1, a[0], 1, a[1], 0, 1, 0, 0, 1, b[0], 1, b[1], 0, 1, 0, 0, 1);
    const nx = (a[0] + b[0]) / 2, nz = (a[1] + b[1]) / 2, nl = Math.hypot(nx, nz);
    const n = [nx / nl, 0, nz / nl];
    const q = [[a[0], 0, a[1], 0], [b[0], 0, b[1], 0], [b[0], 1, b[1], 1], [a[0], 0, a[1], 0], [b[0], 1, b[1], 1], [a[0], 1, a[1], 1]];
    for (const p of q) v.push(p[0], p[1], p[2], n[0], n[1], n[2], p[3], 0);
  }
  return new Float32Array(v);
}
const HEXV = hexGeo(), HEXN = HEXV.length / 8;

const P_HEX = prog(`
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in float aEdge; layout(location=3) in float aTop;
layout(location=4) in vec4 iA; layout(location=5) in vec4 iB; layout(location=6) in vec4 iC; layout(location=7) in vec4 iD;
uniform mat4 uVP; uniform float uBase;
out vec3 vN; out vec3 vW; out float vEdge; out float vTop; out vec4 vB; out vec4 vC; out vec4 vD;
void main(){
  vec3 p = vec3(aPos.x*iA.w + iA.x, mix(uBase, iA.z, aPos.y), aPos.z*iA.w + iA.y);
  vW = p; vN = aNrm; vEdge = aEdge; vTop = aTop; vB = iB; vC = iC; vD = iD;
  gl_Position = uVP * vec4(p,1.);
}`, `
in vec3 vN; in vec3 vW; in float vEdge; in float vTop; in vec4 vB; in vec4 vC; in vec4 vD;
uniform vec3 uL; uniform vec3 uCam; uniform vec3 uFog; uniform vec2 uFogR; uniform float uTime;
out vec4 o;
void main(){
  vec3 N = normalize(vN);
  float diff = max(dot(N, uL), 0.);
  float hemi = .55 + .45*N.y;
  vec3 base = vB.rgb; vec3 col;
  if (vTop > .5) {
    float rim = 1. - smoothstep(0.0, 0.085, vEdge);
    float inner = smoothstep(.05, .9, vEdge);
    col = base * (0.30 + 1.05*diff) * hemi;
    col += vD.rgb * vD.a * (0.55 + 0.45*inner);                // territory light
    col += vC.rgb * vC.a * rim * 2.4;                           // glowing tile rim
    col += vec3(.35,.6,1.) * .05 * rim;
  } else {
    float t = vEdge;
    col = base * .32 * (.25 + .9*diff) * (.25 + .75*t);
    col += vC.rgb * vC.a * pow(t, 8.) * 1.6;
    col += vD.rgb * vD.a * pow(t, 2.5) * .45;
  }
  col += vB.a * vD.rgb;                                          // extra emissive (towers)
  float f = smoothstep(uFogR.x, uFogR.y, length(vW - uCam));
  col = mix(col, uFog, f);
  o = vec4(clamp(col, 0., 8.), 1.);
}`);

const P_TER = prog(`
layout(location=0) in vec2 aUV; layout(location=1) in float aH; layout(location=2) in vec3 aN;
uniform mat4 uVP; uniform sampler2D uInfo; uniform sampler2D uDid; uniform vec2 uSize; uniform float uK; uniform float uFloor;
uniform float uSel; uniform float uHov; uniform float uLiftSel; uniform float uLiftHov; uniform float uIntro; uniform vec2 uOrigin;
out vec2 vUV; out vec3 vN; out vec3 vW; out float vIn; out float vId;
void main(){
  float m = texture(uDid, aUV).g;
  float id = floor(texture(uDid, aUV).r*255. + .5) - 1.;
  float inside = step(.5, m);
  vec3 p = vec3((aUV.x - .5)*uSize.x, 0., (aUV.y - .5)*uSize.y);
  float h = aH*uK;
  // intro: land rises out of the floor in a wave from Mumbai
  float wave = clamp((uIntro - length(p.xz - uOrigin)*.022), 0., 1.);
  wave = 1. - pow(1.-wave, 3.);
  float lift = (id == uSel ? uLiftSel : 0.) + (id == uHov ? uLiftHov : 0.);
  p.y = mix(uFloor, mix(uFloor, h + lift, wave), inside);
  vUV = aUV; vN = aN; vW = p; vIn = inside; vId = id;
  gl_Position = uVP*vec4(p,1.);
}`, `
in vec2 vUV; in vec3 vN; in vec3 vW; in float vIn; in float vId;
uniform sampler2D uSat; uniform sampler2D uInfo; uniform vec3 uL; uniform vec3 uCam; uniform vec3 uFog; uniform vec2 uFogR; uniform float uTime;
uniform float uSel; uniform float uHov; uniform float uIntro; uniform vec2 uOrigin; uniform float uDimOthers;
out vec4 o;
void main(){
  vec3 sat = pow(texture(uSat, vUV).rgb, vec3(2.2));
  vec4 inf = texture(uInfo, vUV);
  vec3 N = normalize(vN);
  float diff = max(dot(N, uL), 0.);
  float id = floor(vId + .5);
  vec3 col;
  float top = step(.999, vIn);            // fully inside triangle = land surface
  float wall = (1. - top) * step(.001, vIn);
  if (top > .5) {
    col = sat * (0.42 + 1.2*diff) * 1.12;
    bool isSel = id == uSel, isHov = id == uHov;
    if (uSel >= 0. && !isSel) col *= mix(1., .45, uDimOthers);
    if (isSel) col *= 1.18;
    if (isHov && !isSel) col *= 1.12;
    // district borders + state edge
    float bl = inf.r;
    col += vec3(.25,.75,1.) * bl * (isSel ? 2.4 : (isHov ? 1.4 : .55));
    col += vec3(1.,.42,.08) * inf.g * 3.2;
  } else if (wall > .5) {
    float t = clamp(vIn, 0., 1.);
    col = vec3(.008,.02,.045) * (.4 + .8*diff) + vec3(1.,.42,.08) * pow(t, 7.) * 2.2 + vec3(.1,.35,.9) * pow(t, 2.) * .08;
  } else {
    discard;
  }
  float wave = clamp((uIntro - length(vW.xz - uOrigin)*.022), 0., 1.);
  col += vec3(1.,.6,.25) * exp(-pow((wave - .5)*6., 2.)) * .35 * (1.-step(1., wave)) * vIn;   // rising front glows
  float f = smoothstep(uFogR.x, uFogR.y, length(vW - uCam));
  col = mix(col, uFog, f);
  o = vec4(clamp(col, 0., 8.), 1.);
}`);
const P_BEAM = prog(`
layout(location=0) in vec2 aQ; layout(location=4) in vec4 iA; layout(location=5) in vec4 iB;
uniform mat4 uVP; uniform vec3 uRight;
out vec2 vQ; out vec4 vB;
void main(){
  // iA: x,z, y0, height ; iB: rgb, width
  vec3 p = vec3(iA.x, iA.z + aQ.y*iA.w, iA.y) + uRight * aQ.x * iB.a;
  vQ = aQ; vB = iB; gl_Position = uVP * vec4(p,1.);
}`, `
in vec2 vQ; in vec4 vB; uniform float uTime; out vec4 o;
void main(){
  float x = vQ.x; float y = vQ.y;
  float core = exp(-x*x*60.), halo = exp(-x*x*6.);
  float yy = clamp(y, 0., 1.); float fade = pow(1.-yy, 1.6) * smoothstep(0.,.04,yy);
  float pulse = .75 + .25*sin(uTime*3. - y*12.);
  o = vec4(vB.rgb * (core*2.0 + halo*.12) * fade * pulse, 1.);
}`);

const P_FS = `layout(location=0) in vec2 aQ; out vec2 vUV; void main(){ vUV = aQ*.5+.5; gl_Position = vec4(aQ,0.,1.); }`;
const P_BG = prog(P_FS, `
in vec2 vUV; uniform float uTime; uniform vec2 uRes; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1)))*43758.5); }
void main(){
  vec2 p = vUV - vec2(.52,.5); p.x *= uRes.x/uRes.y;
  vec3 c = mix(vec3(.010,.028,.075), vec3(.0015,.004,.012), smoothstep(0., 1.1, length(p)));
  vec2 g = floor(vUV*uRes/3.); float s = step(.9975, h(g)) * (.5+.5*sin(uTime*1.5 + h(g+3.)*30.));
  c += vec3(.5,.7,1.)*s*.35*(1.-vUV.y*.3);
  o = vec4(c,1.);
}`);
const P_GRID = prog(`
layout(location=0) in vec2 aQ; uniform mat4 uVP; uniform float uY; out vec3 vW;
void main(){ vec3 p = vec3(aQ.x*260., uY, aQ.y*260.); vW = p; gl_Position = uVP*vec4(p,1.); }`, `
in vec3 vW; uniform vec3 uCam; uniform float uTime; out vec4 o;
void main(){
  vec2 g = abs(fract(vW.xz/4.) - .5); float l = 1. - smoothstep(0., .035, min(g.x, g.y));
  vec2 g2 = abs(fract(vW.xz/20.) - .5); float l2 = 1. - smoothstep(0., .012, min(g2.x, g2.y));
  float d = length(vW.xz); float fade = 1. - smoothstep(30., 140., d);
  float scan = smoothstep(.0, 1., 1.-abs(fract(d*.02 - uTime*.08)-.5)*8.);
  vec3 c = vec3(.02,.06,.16) * (l*.25 + l2*.5) * fade + vec3(.05,.2,.5)*scan*.12*fade*(l+l2*.5);
  o = vec4(c, 1.);
}`);
const P_PRE = prog(P_FS, `
in vec2 vUV; uniform sampler2D uT; uniform float uThr; out vec4 o;
void main(){ vec3 c = texture(uT, vUV).rgb; if (any(isnan(c)) || any(isinf(c))) c = vec3(0.); c = min(c, vec3(40.)); float b = max(c.r, max(c.g, c.b));
  float k = max(b - uThr, 0.) / max(b, 1e-4); o = vec4(c*k, 1.); }`);
const P_DOWN = prog(P_FS, `
in vec2 vUV; uniform sampler2D uT; uniform vec2 uPx; out vec4 o;
void main(){ vec2 d = uPx;
  vec3 c = texture(uT, vUV).rgb*.5 + (texture(uT, vUV+vec2(-d.x,-d.y)).rgb + texture(uT, vUV+vec2(d.x,-d.y)).rgb + texture(uT, vUV+vec2(-d.x,d.y)).rgb + texture(uT, vUV+vec2(d.x,d.y)).rgb)*.125;
  o = vec4(c,1.); }`);
const P_UP = prog(P_FS, `
in vec2 vUV; uniform sampler2D uT; uniform vec2 uPx; uniform float uW; out vec4 o;
void main(){ vec2 d = uPx;
  vec3 c = texture(uT, vUV+vec2(-d.x,0)).rgb + texture(uT, vUV+vec2(d.x,0)).rgb + texture(uT, vUV+vec2(0,-d.y)).rgb + texture(uT, vUV+vec2(0,d.y)).rgb;
  c = c*.125 + (texture(uT, vUV+vec2(-d.x,-d.y)).rgb + texture(uT, vUV+vec2(d.x,-d.y)).rgb + texture(uT, vUV+vec2(-d.x,d.y)).rgb + texture(uT, vUV+vec2(d.x,d.y)).rgb)*.0625 + texture(uT,vUV).rgb*.25;
  o = vec4(c*uW,1.); }`);
const P_COMP = prog(P_FS, `
in vec2 vUV; uniform sampler2D uS; uniform sampler2D uB; uniform float uBloom; uniform float uExp; uniform float uTime; out vec4 o;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0., 1.); }
void main(){
  vec3 sc = texture(uS, vUV).rgb; if (any(isnan(sc))) sc = vec3(0.);
  vec3 c = sc + texture(uB, vUV).rgb * uBloom;
  c = aces(c*uExp);
  vec2 p = vUV-.5; c *= 1. - dot(p,p)*.55;
  c = pow(c, vec3(1./2.2));
  c += (fract(sin(dot(vUV*1000.+uTime, vec2(12.9898,78.233)))*43758.5453)-.5)/255.;
  o = vec4(c,1.);
}`);

// ---- buffers / VAOs
const quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
const fsVAO = gl.createVertexArray(); gl.bindVertexArray(fsVAO); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
const beamQ = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, beamQ); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 0, 1, 0, -1, 1, -1, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);

function instVAO(geoBuf, layout, n) {
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, geoBuf);
  layout();
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ib);
  const data = new Float32Array(n * 16); gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
  for (let k = 0; k < 4; k++) { gl.enableVertexAttribArray(4 + k); gl.vertexAttribPointer(4 + k, 4, gl.FLOAT, false, 64, k * 16); gl.vertexAttribDivisor(4 + k, 1); }
  return { vao, ib, data, n };
}
const hexBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, hexBuf); gl.bufferData(gl.ARRAY_BUFFER, HEXV, gl.STATIC_DRAW);
const hexLayout = () => { gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 24); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 32, 28); };
const TOWERS = instVAO(hexBuf, hexLayout, DEST.length);
const BEAMS = instVAO(beamQ, () => { gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); }, DEST.length);
gl.bindVertexArray(null);


// ---- terrain mesh (HW x HH grid)
const terVAO = gl.createVertexArray(); gl.bindVertexArray(terVAO);
{
  const n = HW * HH, uv = new Float32Array(n * 2), hh = new Float32Array(n), nm = new Float32Array(n * 3);
  const sxw = PW * U / HW, szw = PH * U / HH;
  for (let z = 0; z < HH; z++) for (let x = 0; x < HW; x++) {
    const i = z * HW + x; uv[i * 2] = (x + .5) / HW; uv[i * 2 + 1] = (z + .5) / HH; hh[i] = HGT[i] / T.HMAX;
    const hl = HGT[z * HW + Math.max(x - 1, 0)], hr = HGT[z * HW + Math.min(x + 1, HW - 1)], hu = HGT[Math.max(z - 1, 0) * HW + x], hd = HGT[Math.min(z + 1, HH - 1) * HW + x];
    const k = KH / T.HMAX; let ax = -(hr - hl) * k / (2 * sxw), az = -(hd - hu) * k / (2 * szw), l = Math.hypot(ax, 1, az);
    nm[i * 3] = ax / l; nm[i * 3 + 1] = 1 / l; nm[i * 3 + 2] = az / l;
  }
  const idx = new Uint32Array((HW - 1) * (HH - 1) * 6); let k = 0;
  for (let z = 0; z < HH - 1; z++) for (let x = 0; x < HW - 1; x++) { const a = z * HW + x, b = a + 1, c = a + HW, d = c + 1; idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d; }
  const mk = (data, loc, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
  mk(uv, 0, 2); mk(hh, 1, 1); mk(nm, 2, 3);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  terVAO.count = idx.length;
}
gl.bindVertexArray(null);
const TEX = {};
function loadTex(name, src, nearest, mip) {
  return new Promise(res => {
    const im = new Image(); im.onload = () => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (nearest) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); }
      else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          const an = gl.getExtension("EXT_texture_filter_anisotropic"); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }
        else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      TEX[name] = t; res();
    }; im.src = src;
  });
}
// ---- render targets
function tex(w, h) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, HDR ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, HDR ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return { t, f, w, h };
}
let W = 0, Ht = 0, msFB, msColor, msDepth, scene, mips = [];
function resize() {
  const w = Math.round(SW * DPR), h = Math.round(SH * DPR);
  if (w === W && h === Ht) return;
  W = w; Ht = h; glc.width = w; glc.height = h; ui.width = SW; ui.height = SH;
  const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES));
  msFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, msFB);
  msColor = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, msColor);
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, HDR ? gl.RGBA16F : gl.RGBA8, w, h);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msColor);
  msDepth = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, msDepth);
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, w, h);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, msDepth);
  scene = tex(w, h);
  mips = []; let mw = w >> 1, mh = h >> 1;
  for (let i = 0; i < 6 && mw > 8 && mh > 8; i++) { mips.push(tex(mw, mh)); mw >>= 1; mh >>= 1; }
}

// ------------------------------------------------------------------ camera
const cam = { yaw: -0.6, pitch: 1.40, dist: 420, tx: 0, ty: 0, tz: 0 };
const HOME = { yaw: -0.08, pitch: 0.92, dist: 240, tx: 6, ty: 0, tz: 6 };
let camFrom = null, camTo = null, camT = 1, camDur = 1;
function flyTo(t, dur = 1.8) { camFrom = { ...cam }; camTo = { ...cam, ...t }; camT = 0; camDur = dur; }
let VP = new Float32Array(16), camPos = [0, 0, 0], camRight = [1, 0, 0];
function mul(a, b) { const o = new Float32Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
function persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); }
function lookAt(e, c, up) {
  let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2]; let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
  let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  camRight = [xx, xy, xz];
  return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
}
function updateCam() {
  const cp = Math.cos(cam.pitch);
  camPos = [cam.tx + Math.sin(cam.yaw) * cp * cam.dist, cam.ty + Math.sin(cam.pitch) * cam.dist, cam.tz + Math.cos(cam.yaw) * cp * cam.dist];
  const V = lookAt(camPos, [cam.tx, cam.ty, cam.tz], [0, 1, 0]);
  VP = mul(persp(30 * Math.PI / 180, SW / SH, 2, 1200), V);
}
function project(x, y, z) {
  const m = VP; const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [(cx / cw * .5 + .5) * SW, (1 - (cy / cw * .5 + .5)) * SH, cw];
}
function rayAt(sx, sy) {
  // invert by sampling: march along view ray in world using inverse of VP via two unprojections
  const inv = invert(VP); const nx = sx / SW * 2 - 1, ny = 1 - sy / SH * 2;
  const un = (z) => { const v = [nx, ny, z, 1]; const o = [0, 0, 0, 0]; for (let i = 0; i < 4; i++) o[i] = inv[i] * v[0] + inv[4 + i] * v[1] + inv[8 + i] * v[2] + inv[12 + i] * v[3]; return [o[0] / o[3], o[1] / o[3], o[2] / o[3]]; };
  const a = un(-1), b = un(1); return [a, [b[0] - a[0], b[1] - a[1], b[2] - a[2]]];
}
function invert(m) {
  const a = m, o = new Float32Array(16);
  const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6];
  const b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
  const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det; o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
  o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det; o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
  o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det; o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
  o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det; o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
  return o;
}
function pickTile(sx, sy) {
  const [o, d] = rayAt(sx, sy);
  for (let s = 0; s < 1; s += 0.001) {
    const x = o[0] + d[0] * s, y = o[1] + d[1] * s, z = o[2] + d[2] * s;
    if (y > 8) continue; if (y < FLOOR - .1) break;
    if (inside(x, z) && y <= surfY(x, z) + .02) return { x, z, d: districtAt(x, z) };
  }
  return null;
}

// ------------------------------------------------------------------ UI (categories, card, timeline)
const ICON = {
  global: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.6 1.7 2.6 4.5 2.8 7H9.2C9.4 8.5 10.4 5.7 12 4zM4.1 13h3.1c.2 2.4 1 4.7 2.2 6.4A8 8 0 014.1 13zm0-2a8 8 0 015.3-6.4C8.2 6.3 7.4 8.6 7.2 11H4.1zm8 9c-1.6-1.7-2.6-4.5-2.8-7h5.6c-.2 2.5-1.2 5.3-2.8 7zm2.5-.6c1.2-1.7 2-4 2.2-6.4h3.1a8 8 0 01-5.3 6.4zM16.8 11c-.2-2.4-1-4.7-2.2-6.4A8 8 0 0119.9 11h-3.1z",
  heritage: "M3 21V9h2v2h2V9h2v2h2V9h2v2h2V9h2v2h2V9h2v12h-7v-5a2 2 0 00-4 0v5H3z",
  spiritual: "M12 2c2 3 4 4.5 4 8a4 4 0 01-8 0c0-3.5 2-5 4-8zM5 14h14l-1 2H6l-1-2zm2 4h10v3H7v-3z",
  wildlife: "M20 3S9 3 6 9c-2.2 4.4.3 8 .3 8S3 19 3 21h2c0-1 1.6-2.3 3.2-3 1 .4 6.8 1.6 9.8-4.5C21 7.5 20 3 20 3zm-4.5 6.5c-3 1.5-5 4-6.5 6.5 1-3.4 3.4-6 6.5-6.5z",
  aqua: "M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v3c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2v-3zm0-6c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v3c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2V9z",
  island: "M11 10c-1-2-4-3-6-2 2-2 5-2 7 0 1-2.5 4-3.5 6-2-2 0-4 1-5 3 2-1 5 0 6 2-2-1-5-1-6 0l1 8h-2l-1-9zM3 21c3-2.5 15-2.5 18 0H3z",
  mice: "M4 4h16v11H4V4zm2 2v7h12V6H6zm5 10h2v2h4v2H7v-2h4v-2z",
  experiential: "M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z",
};
const ICONP = {}; for (const k in ICON) ICONP[k] = new Path2D(ICON[k]);
const rgbaS = (c, a) => `rgba(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0},${a})`;
const svgIcon = (k, color, s = 18) => `<svg viewBox="0 0 24 24" style="width:${s}px;height:${s}px"><path fill="${color}" d="${ICON[k]}"/></svg>`;
let soloCat = null, selected = null, year = 2026, yearTarget = 2026, playing = false, playT = 0, dirtyTerr = true;
const catlist = $("#catlist");
for (const k in CATS) {
  const c = CATS[k], el = document.createElement("div"); el.className = "cat";
  el.innerHTML = `<div class="ic" style="background:${rgbaS(c.rgb, .16)};box-shadow:0 0 18px ${rgbaS(c.rgb, .35)}">${svgIcon(k, c.color)}</div><div class="nm">${c.name}<small>${c.mr}</small></div><div class="ct" id="ct_${k}">0</div>`;
  el.onclick = () => { poke(); setSolo(soloCat === k ? null : k); };
  catlist.appendChild(el); c.el = el;
}
function setSolo(k) {
  soloCat = k;
  for (const kk in CATS) { CATS[kk].el.classList.toggle("on", kk === k); CATS[kk].el.classList.toggle("dim", !!k && kk !== k); }
  select(null, false);
  if (k) {
    const pts = DEST.filter(d => d.c === k && d.phase <= year + .01);
    if (pts.length) {
      const xs = pts.map(d => d.x), zs = pts.map(d => d.z);
      const span = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...zs) - Math.min(...zs)) * 1.6);
      flyTo({ tx: (Math.max(...xs) + Math.min(...xs)) / 2 + 4, tz: (Math.max(...zs) + Math.min(...zs)) / 2 + 2, dist: clamp(span * 2.6 + 60, 110, 240), pitch: .85, yaw: -0.12 });
    }
  } else flyTo(HOME);
}
const card = $("#card");
function select(d, fly = true) {
  selected = d; selDist = d ? d.d0 : -1;
  if (!d) { card.classList.add("hidden"); return; }
  const c = d.cat;
  $("#mL1").textContent = "Theme"; $("#mL2").textContent = "On the map from"; $("#nL").textContent = "Also in this district";
  $("#cTag").innerHTML = svgIcon(d.c, c.color, 16) + c.name.toUpperCase();
  $("#cTag").style.cssText = `color:${c.color};background:${rgbaS(c.rgb, .14)};border:1px solid ${rgbaS(c.rgb, .4)}`;
  $("#cName").textContent = d.n; $("#cDist").textContent = (d.dist ? d.dist.name : d.d) + " district"; $("#cDesc").textContent = d.t;
  $("#cCat").textContent = c.name; $("#cPhase").textContent = d.phase === 2026 ? "Today (2026)" : d.phase + " · proposed";
  $("#cPhase").style.color = d.phase === 2026 ? "#bfe3ff" : "#ffc46b";
  const near = DEST.filter(o => o !== d && o.d0 === d.d0 && o.phase <= year + .01).slice(0, 6);
  $("#cNear").innerHTML = near.map(o => `<div data-i="${o.i}" style="border-left:3px solid ${o.cat.color}">${o.n}</div>`).join("") || "<div>-</div>";
  [...$("#cNear").children].forEach(el => el.onclick = () => { poke(); const o = DEST[+el.dataset.i]; if (o) select(o); });
  card.classList.remove("hidden");
  if (fly) flyTo({ tx: d.x + 18, ty: 0, tz: d.z + 2, dist: 115, pitch: .78, yaw: cam.yaw * .5 - 0.18 }, 2.0);
}
// ---- district selection: lift it, frame it, list what is there
const DINFO = T.districts.map(dd => {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  dd.rings.forEach(r => r.forEach(p => { const x = wx(p[0]), z = wz(p[1]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }));
  return { cx: wx(dd.c[0]), cz: wz(dd.c[1]), span: Math.max(x1 - x0, (z1 - z0) * 1.4) };
});
function selectDistrict(i, fly = true) {
  selected = null; selDist = i;
  const name = T.districts[i].name, info = DINFO[i];
  const here = DEST.filter(o => o.d0 === i && o.phase <= year + .01).sort((a, b) => b.w - a.w || a.n.localeCompare(b.n));
  const later = DEST.filter(o => o.d0 === i && o.phase > 2026).length;
  const byCat = {}; here.forEach(o => byCat[o.c] = (byCat[o.c] || 0) + 1);
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  $("#cTag").innerHTML = "DISTRICT";
  $("#cTag").style.cssText = "color:#7fd3ff;background:rgba(90,190,255,.12);border:1px solid rgba(90,190,255,.4)";
  $("#cName").textContent = name;
  $("#cDist").textContent = here.length ? `${here.length} destination${here.length > 1 ? "s" : ""} on the map in ${Math.round(year)}` : "No mapped destinations yet";
  $("#cDesc").innerHTML = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, n]) =>
    `<span style="display:inline-flex;align-items:center;gap:6px;margin:0 8px 8px 0;padding:5px 10px;border-radius:16px;font-size:15px;background:${rgbaS(CATS[k].rgb, .14)};border:1px solid ${rgbaS(CATS[k].rgb, .4)};color:${CATS[k].color}">${svgIcon(k, CATS[k].color, 14)}${CATS[k].name} · ${n}</span>`).join("") || "";
  $("#mL1").textContent = "Leading theme"; $("#cCat").textContent = top ? CATS[top[0]].name : "-";
  $("#mL2").textContent = "Proposed by 2047"; $("#cPhase").textContent = later ? `${later} new` : "-"; $("#cPhase").style.color = later ? "#ffc46b" : "#bfe3ff";
  $("#nL").textContent = "Destinations here";
  $("#cNear").innerHTML = here.slice(0, 14).map(o => `<div data-i="${o.i}" style="border-left:3px solid ${o.cat.color}">${o.n}</div>`).join("") || "<div>-</div>";
  [...$("#cNear").children].forEach(el => el.onclick = () => { poke(); const o = DEST[+el.dataset.i]; if (o) select(o); });
  card.classList.remove("hidden");
  if (fly) flyTo({ tx: info.cx + info.span * .35, ty: 0, tz: info.cz + 1, dist: clamp(info.span * 2.6 + 45, 75, 190), pitch: .82, yaw: cam.yaw * .5 - .12 }, 1.8);
}
function clearSelection() { select(null); selDist = -1; flyTo(HOME); }
$("#closeCard").onclick = () => { poke(); clearSelection(); };

const track = $("#track"), knob = $("#knob"), fill = $("#fill");
const yToF = y => (y - 2026) / 21, fToY = f => 2026 + f * 21;
let dragging = false;
function setYearFromEvent(e) { const r = track.getBoundingClientRect(); let y = fToY(clamp((e.clientX - r.left) / r.width, 0, 1)); for (const s of [2026, 2035, 2047]) if (Math.abs(s - y) < 1.2) y = s; yearTarget = y; }
track.addEventListener("pointerdown", e => { poke(); playing = false; dragging = true; track.setPointerCapture(e.pointerId); setYearFromEvent(e); });
track.addEventListener("pointermove", e => { if (dragging) setYearFromEvent(e); });
track.addEventListener("pointerup", () => dragging = false);
document.querySelectorAll(".stop").forEach(s => s.addEventListener("pointerdown", e => { e.stopPropagation(); poke(); playing = false; yearTarget = +s.dataset.y; }));
const playBtn = $("#play"); let atEnd = false;
playBtn.onclick = () => {
  poke();
  if (atEnd) { playing = false; yearTarget = 2026; setPlayIcon(false); return; }   // reset only - does not replay
  select(null, false); selDist = -1; setSolo(null); playing = true; playT = 0; year = yearTarget = 2026;
};
function setPlayIcon(end) { atEnd = end; playBtn.textContent = end ? "↺" : "▶"; playBtn.title = end ? "Back to 2026" : "Play journey"; playBtn.style.fontSize = end ? "26px" : "20px"; }

// ------------------------------------------------------------------ input
let lastInput = performance.now(), hoverT = null, hoverD = null, drag = null;
const attract = { on: false, t: 0, step: 0 };
const poke = () => { lastInput = performance.now(); attract.on = false; };
const toStage = e => { const r = stage.getBoundingClientRect(), s = stage._s; return [(e.clientX - r.left) / s, (e.clientY - r.top) / s]; };
function pickTower(x, y) {
  let best = null, bd = 26;
  for (const d of DEST) { if (d.rise < .5 || !d.scr) continue; const dd = Math.min(Math.hypot(x - d.scr.tx, y - d.scr.ty), Math.hypot(x - d.scr.mx, y - d.scr.my), d.scr.ix != null ? Math.hypot(x - d.scr.ix, y - d.scr.iy) - d.scr.R * .5 : 1e9); if (dd < bd) { bd = dd; best = d; } }
  return best;
}
// map controls: left-drag = pan (grab the land), right-drag / Ctrl-drag = rotate & tilt, wheel = zoom to cursor, pinch on touch
const goal = { ...cam };
const pointers = new Map();
let mouse = [-999, -999];
function syncGoal() { if (camT < 1) { camT = 1; } Object.assign(goal, cam); }
function groundAt(sx, sy, y0 = 1.5) { const [o, d] = rayAt(sx, sy); if (Math.abs(d[1]) < 1e-6) return null; const s = (y0 - o[1]) / d[1]; if (s < 0) return null; return [o[0] + d[0] * s, o[2] + d[2] * s]; }
function clampGoal() { goal.tx = clamp(goal.tx, -62, 62); goal.tz = clamp(goal.tz, -52, 52); goal.dist = clamp(goal.dist, 45, 330); goal.pitch = clamp(goal.pitch, .42, 1.42); }
function panBy(dx, dy) {
  const wpp = 2 * goal.dist * Math.tan(15 * Math.PI / 180) / SH;          // world units per screen px at the target
  const fx = Math.sin(goal.yaw), fz = Math.cos(goal.yaw);                  // camera "back" direction on the ground
  const rx = fz, rz = -fx;                                                  // camera right on the ground
  const fwd = wpp / Math.max(.35, Math.sin(goal.pitch));
  goal.tx -= dx * wpp * rx; goal.tz -= dx * wpp * rz;
  goal.tx -= dy * fwd * fx; goal.tz -= dy * fwd * fz;
  clampGoal();
}
ui.addEventListener("contextmenu", e => e.preventDefault());
ui.addEventListener("pointerdown", e => {
  poke(); const [x, y] = toStage(e); syncGoal();
  pointers.set(e.pointerId, [x, y]); ui.setPointerCapture(e.pointerId);
  drag = { x, y, lx: x, ly: y, moved: false, rot: e.button === 2 || e.ctrlKey || e.altKey };
  ui.style.cursor = drag.rot ? "move" : "grabbing";
});
ui.addEventListener("pointermove", e => {
  const [x, y] = toStage(e); mouse = [x, y];
  if (!drag || !pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId); pointers.set(e.pointerId, [x, y]);
  if (Math.hypot(x - drag.x, y - drag.y) > 6) drag.moved = true;
  if (!drag.moved) return;
  poke();
  if (pointers.size >= 2) {                                                  // pinch zoom + twist
    const [a, b] = [...pointers.values()];
    const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)[1];
    const d0 = Math.hypot(prev[0] - other[0], prev[1] - other[1]), d1 = Math.hypot(x - other[0], y - other[1]);
    if (d0 > 10) goal.dist *= d0 / d1;
    goal.yaw -= (Math.atan2(y - other[1], x - other[0]) - Math.atan2(prev[1] - other[1], prev[0] - other[0]));
    clampGoal(); return;
  }
  const dx = x - prev[0], dy = y - prev[1];
  if (drag.rot) { goal.yaw -= dx * .0045; goal.pitch += dy * .0035; clampGoal(); }
  else panBy(dx, dy);
});
function endPointer(e) {
  const [x, y] = toStage(e); pointers.delete(e.pointerId); ui.style.cursor = "grab";
  if (drag && !drag.moved && pointers.size === 0) {
    const d = pickTower(x, y);
    if (d) select(d);
    else {
      const t = pickTile(x, y);
      if (t && t.d >= 0) { if (t.d === selDist && !selected) clearSelection(); else selectDistrict(t.d); }
      else if (selected || selDist >= 0) clearSelection();
    }
  }
  if (pointers.size === 0) drag = null;
}
ui.addEventListener("pointerup", endPointer);
ui.addEventListener("pointercancel", endPointer);
ui.addEventListener("wheel", e => {
  poke(); syncGoal(); e.preventDefault();
  const [x, y] = toStage(e); const before = groundAt(x, y);
  const f = Math.exp(clamp(e.deltaY, -120, 120) * .0016);
  goal.dist *= f; clampGoal();
  if (before) { const k = 1 - f; goal.tx += (before[0] - goal.tx) * k * .9; goal.tz += (before[1] - goal.tz) * k * .9; clampGoal(); }
}, { passive: false });

// ------------------------------------------------------------------ frame
const T0 = performance.now(); let last = T0, clock = 0;
const kEl = [$("#k1"), $("#k2"), $("#k3")], kVal = [0, 0, 0];
function frame(now) {
  const dt = Math.min(TEST ? 1.0 : .05, (now - last) / 1000); last = now; clock += dt; const t = clock;

  // camera
  if (camT < 1 && camTo) { camT = Math.min(1, camT + dt / camDur); const e = ease(camT); for (const k of ["yaw", "pitch", "dist", "tx", "ty", "tz"]) cam[k] = lerp(camFrom[k], camTo[k], e); if (camT >= 1) Object.assign(goal, cam); }
  else { const kk = Math.min(1, dt * 9); for (const k of ["yaw", "pitch", "dist", "tx", "ty", "tz"]) cam[k] = lerp(cam[k], goal[k], kk); }
  updateCam();

  // timeline
  if (playing) {
    playT += dt; const seq = [[1.5, 2026, 2026], [4, 2026, 2035], [1.5, 2035, 2035], [4, 2035, 2047]]; let acc = 0, y = 2047;
    for (const [du, a, b] of seq) { if (playT < acc + du) { y = lerp(a, b, ease((playT - acc) / du)); break; } acc += du; }
    yearTarget = y; if (playT > 11.5) playing = false;
  }
  const prevY = year;
  year = dragging || playing ? yearTarget : lerp(year, yearTarget, Math.min(1, dt * 6));
  if (!atEnd && yearTarget >= 2046.95 && year >= 2046.9) setPlayIcon(true);
  else if (atEnd && yearTarget < 2046.9) setPlayIcon(false);
  const f = yToF(year); knob.style.left = f * 100 + "%"; fill.style.width = f * 100 + "%";
  document.querySelectorAll(".stop").forEach(s => s.classList.toggle("past", +s.dataset.y <= year + .05));
  $("#yearBig").textContent = Math.round(year);
  const growth = 1 + f * .6;

  // destinations state
  for (const k in CATS) CATS[k].count = 0;
  let liveN = 0, newN = 0; const dset = new Set();
  for (const d of DEST) {
    const ok = d.phase <= year + .01, catOk = !soloCat || soloCat === d.c;
    const appear = 2.6 + d.dist0 * .024;
    const target = clock > appear && ok && catOk ? 1 : 0;
    d.rise = lerp(d.rise, target, Math.min(1, dt * (target > d.rise ? 1.8 : 4)));
    d.sel = lerp(d.sel, selected === d ? 1 : 0, Math.min(1, dt * 6)); d.hov = lerp(d.hov, hoverD === d ? 1 : 0, Math.min(1, dt * 10));
    d.focus = lerp(d.focus, (!selected && selDist < 0) || selected === d || d.d0 === selDist ? 1 : .25, Math.min(1, dt * 4));
    if (ok) { CATS[d.c].count++; liveN++; if (d.dist) dset.add(d.d0); if (d.phase > 2026) newN++; }
  }
  for (const k in CATS) { const el = document.getElementById("ct_" + k); if (+el.textContent !== CATS[k].count) el.textContent = CATS[k].count; }
  [liveN, dset.size, newN].forEach((v, i) => { kVal[i] = lerp(kVal[i], clock > 3 ? v : 0, Math.min(1, dt * 4)); const r = Math.round(kVal[i]); if (+kEl[i].textContent !== r) kEl[i].textContent = r; kEl[i].classList.toggle("up", i === 2 && v > 0); });

  // hover
  if (!drag) { hoverD = pickTower(mouse[0], mouse[1]); const ht = hoverD ? null : pickTile(mouse[0], mouse[1]); hoverT = ht; }
  const tip = $("#tip");
  if (!drag) ui.style.cursor = hoverD || (hoverT && hoverT.d >= 0) ? "pointer" : "grab";
  if (hoverT && !hoverD && hoverT.d >= 0) { tip.innerHTML = `<small>DISTRICT · CLICK TO EXPLORE</small>${T.districts[hoverT.d].name}`; tip.style.left = mouse[0] + 18 + "px"; tip.style.top = mouse[1] + 14 + "px"; tip.style.opacity = 1; }
  else tip.style.opacity = 0;

  // attract mode
  if (!TEST && now - lastInput > 30000 && clock > 9 && !attract.on) { attract.on = true; attract.t = 99; }
  if (attract.on) { attract.t += dt; if (attract.t > 7) { attract.t = 0; attract.step++; const heroes = DEST.filter(d => d.w === 3 && d.phase <= year + .01); if (attract.step % 4 === 0) { select(null, false); flyTo(HOME, 2.4); } else select(heroes[(attract.step * 5) % heroes.length]); } }

  // ---- terrain state
  hovDist = hoverT && hoverT.d !== selDist ? hoverT.d : -2;
  liftSel = lerp(liftSel, selDist >= 0 ? 1.1 : 0, Math.min(1, dt * 4));
  liftHov = lerp(liftHov, hovDist >= 0 ? .35 : 0, Math.min(1, dt * 6));
  dimOthers = lerp(dimOthers, selected || selDist >= 0 ? 1 : 0, Math.min(1, dt * 4));
  // ---- towers + beams
  const TA = TOWERS.data, BA = BEAMS.data; let nT = 0;
  for (const d of DEST) {
    if (d.rise < .01) { d.scr = null; continue; }
    const base = surfY(d.x, d.z);
    const hh = (2.4 + d.w * 1.3) * growth * easeOutBack(clamp(d.rise, 0, 1)) * (1 + d.sel * .35) * (.6 + .4 * d.focus);
    const col = d.cat.lin, glow = (.18 + d.sel * 1.6 + d.hov * 1.0) * d.focus;
    const o = nT * 16;
    TA[o] = d.x; TA[o + 1] = d.z; TA[o + 2] = base + hh; TA[o + 3] = R * (.10 + d.w * .015) * (1 + d.sel * .5 + d.hov * .3);
    TA[o + 4] = .55; TA[o + 5] = .58; TA[o + 6] = .62; TA[o + 7] = glow * .5;
    TA[o + 8] = col[0]; TA[o + 9] = col[1]; TA[o + 10] = col[2]; TA[o + 11] = (.35 + d.sel + d.hov * .6) * d.focus;
    TA[o + 12] = col[0]; TA[o + 13] = col[1]; TA[o + 14] = col[2]; TA[o + 15] = .25;
    BA[o] = d.x; BA[o + 1] = d.z; BA[o + 2] = base + hh; BA[o + 3] = (2.5 + d.w * 1.5) * growth * d.rise * (1 + d.sel * 2 + d.hov);
    const bi = (.06 + d.sel * .5 + d.hov * .3) * d.focus; BA[o + 4] = col[0] * bi; BA[o + 5] = col[1] * bi; BA[o + 6] = col[2] * bi; BA[o + 7] = .18 + d.sel * .3 + d.hov * .15;
    const top = project(d.x, base + hh + .2, d.z), mid = project(d.x, base + hh * .5, d.z), gp = project(d.x, base + .05, d.z);
    d.scr = { tx: top[0], ty: top[1], mx: mid[0], my: mid[1], bx: gp[0], by: gp[1], depth: top[2] };
    nT++;
  }

  draw(nT, t);
  drawUI(t);
  requestAnimationFrame(frame);
}

function upload(I, n) { gl.bindBuffer(gl.ARRAY_BUFFER, I.ib); gl.bufferSubData(gl.ARRAY_BUFFER, 0, I.data, 0, n * 16); }
function fsPass(p, target, w, h) { gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0, 0, w, h); gl.useProgram(p); gl.bindVertexArray(fsVAO); gl.drawArrays(gl.TRIANGLES, 0, 6); }
let dimOthers = 0;
function drawTerrain(t) {
  const p = P_TER; gl.useProgram(p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP);
  gl.uniform2f(p.u.uSize, PW * U, PH * U); gl.uniform1f(p.u.uK, KH); gl.uniform1f(p.u.uFloor, FLOOR);
  gl.uniform1f(p.u.uSel, selDist); gl.uniform1f(p.u.uHov, hovDist); gl.uniform1f(p.u.uLiftSel, liftSel); gl.uniform1f(p.u.uLiftHov, liftHov);
  gl.uniform1f(p.u.uIntro, clock * .9); gl.uniform2f(p.u.uOrigin, MUMX, MUMZ); gl.uniform1f(p.u.uDimOthers, dimOthers);
  const L = [-.55, .75, -.38], ll = Math.hypot(...L); gl.uniform3f(p.u.uL, L[0] / ll, L[1] / ll, L[2] / ll);
  gl.uniform3fv(p.u.uCam, camPos); gl.uniform3f(p.u.uFog, .004, .012, .03); gl.uniform2f(p.u.uFogR, cam.dist * 1.0, cam.dist * 2.8); gl.uniform1f(p.u.uTime, t);

  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TEX.sat); gl.uniform1i(p.u.uSat, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, TEX.info); gl.uniform1i(p.u.uInfo, 1);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, TEX.did); gl.uniform1i(p.u.uDid, 2);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindVertexArray(terVAO); gl.drawElements(gl.TRIANGLES, terVAO.count, gl.UNSIGNED_INT, 0);
}
function draw(nT, t) {
  // scene into MSAA HDR buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, msFB); gl.viewport(0, 0, W, Ht);
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
  gl.useProgram(P_BG); gl.uniform1f(P_BG.u.uTime, t); gl.uniform2f(P_BG.u.uRes, W, Ht); gl.bindVertexArray(fsVAO); gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  gl.useProgram(P_HEX);
  gl.uniformMatrix4fv(P_HEX.u.uVP, false, VP); gl.uniform1f(P_HEX.u.uBase, FLOOR);
  const L = [-.55, .75, -.38], ll = Math.hypot(...L); gl.uniform3f(P_HEX.u.uL, L[0] / ll, L[1] / ll, L[2] / ll);
  gl.uniform3fv(P_HEX.u.uCam, camPos); gl.uniform3f(P_HEX.u.uFog, .004, .012, .03); gl.uniform2f(P_HEX.u.uFogR, cam.dist * .9, cam.dist * 2.6); gl.uniform1f(P_HEX.u.uTime, t);
  drawTerrain(t);
  gl.useProgram(P_HEX);
  const DBG = location.search;
  if (nT && !/notower/.test(DBG)) { upload(TOWERS, nT); gl.bindVertexArray(TOWERS.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, HEXN, nT); }
  if (nT && !/nobeam/.test(DBG)) {
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
    gl.useProgram(P_BEAM); gl.uniformMatrix4fv(P_BEAM.u.uVP, false, VP); gl.uniform3fv(P_BEAM.u.uRight, camRight); gl.uniform1f(P_BEAM.u.uTime, t);
    upload(BEAMS, nT); gl.bindVertexArray(BEAMS.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, nT);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }
  // resolve MSAA
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msFB); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, scene.f);
  gl.blitFramebuffer(0, 0, W, Ht, 0, 0, W, Ht, gl.COLOR_BUFFER_BIT, gl.NEAREST);
  gl.disable(gl.DEPTH_TEST);
  // bloom
  gl.activeTexture(gl.TEXTURE0);
  gl.useProgram(P_PRE); gl.uniform1i(P_PRE.u.uT, 0); gl.uniform1f(P_PRE.u.uThr, 1.0); gl.bindTexture(gl.TEXTURE_2D, scene.t); fsPass(P_PRE, mips[0].f, mips[0].w, mips[0].h);
  for (let m = 1; m < mips.length; m++) { gl.useProgram(P_DOWN); gl.uniform1i(P_DOWN.u.uT, 0); gl.uniform2f(P_DOWN.u.uPx, 1 / mips[m - 1].w, 1 / mips[m - 1].h); gl.bindTexture(gl.TEXTURE_2D, mips[m - 1].t); fsPass(P_DOWN, mips[m].f, mips[m].w, mips[m].h); }
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  for (let m = mips.length - 1; m > 0; m--) { gl.useProgram(P_UP); gl.uniform1i(P_UP.u.uT, 0); gl.uniform1f(P_UP.u.uW, 1.0); gl.uniform2f(P_UP.u.uPx, 1 / mips[m].w, 1 / mips[m].h); gl.bindTexture(gl.TEXTURE_2D, mips[m].t); fsPass(P_UP, mips[m - 1].f, mips[m - 1].w, mips[m - 1].h); }
  gl.disable(gl.BLEND);
  // composite
  gl.useProgram(P_COMP); gl.uniform1i(P_COMP.u.uS, 0); gl.uniform1i(P_COMP.u.uB, 1); gl.uniform1f(P_COMP.u.uBloom, /nobloom/.test(location.search) ? 0 : .42); gl.uniform1f(P_COMP.u.uExp, 1.0); gl.uniform1f(P_COMP.u.uTime, t);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, scene.t); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mips[0].t);
  fsPass(P_COMP, null, W, Ht); gl.activeTexture(gl.TEXTURE0);
}

// ------------------------------------------------------------------ 2D overlay: icon chips + labels
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function drawUI(t) {
  const c = uctx; c.clearRect(0, 0, SW, SH);
  const list = DEST.filter(d => d.scr && d.rise > .3).sort((a, b) => b.scr.depth - a.scr.depth);
  const zoomK = clamp(240 / cam.dist, .75, 1.6);
  for (const d of list) {
    const s = d.scr, col = d.cat.color, a = clamp((d.rise - .3) * 2, 0, 1) * (.4 + .6 * d.focus);
    const R0 = (8.5 + d.w * 2.6) * zoomK * (1 + d.sel * .45 + d.hov * .3);
    const y = s.ty - R0 * .6;
    c.globalAlpha = a;
    // ground marker: glowing ring flattened by perspective
    const fl = clamp(Math.abs(s.by - s.ty) / 120, .25, .55);
    c.lineWidth = 2; c.strokeStyle = col;
    c.beginPath(); c.ellipse(s.bx, s.by, 6 + d.w * 1.5, (6 + d.w * 1.5) * fl, 0, 0, 7); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(s.bx, s.by, 2.2, 0, 7); c.fill();
    // stem: coloured glow + white core
    c.lineCap = "round";
    c.strokeStyle = col; c.globalAlpha = a * .45; c.lineWidth = 5; c.beginPath(); c.moveTo(s.bx, s.by); c.lineTo(s.tx, y + R0); c.stroke();
    c.globalAlpha = a; c.strokeStyle = "rgba(255,255,255,.95)"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(s.bx, s.by); c.lineTo(s.tx, y + R0); c.stroke();
    // pulse on the most important places and the selected one
    if (d.w === 3 || d.sel > .1) {
      const ph = ((t * .7 + d.seed) % 1);
      c.globalAlpha = a * (1 - ph) * .8; c.lineWidth = 2; c.strokeStyle = col;
      c.beginPath(); c.arc(s.tx, y, R0 * (1.15 + ph * 1.1), 0, 7); c.stroke();
    }
    // badge: shadow, solid colour, white ring, white icon
    c.globalAlpha = a;
    c.fillStyle = "rgba(0,0,0,.45)"; c.beginPath(); c.arc(s.tx + 1.5, y + 2.5, R0 + 1.5, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(s.tx, y, R0, 0, 7); c.fill();
    c.lineWidth = d.sel > .5 ? 3 : 2; c.strokeStyle = "#fff"; c.stroke();
    c.save(); c.translate(s.tx - R0 * .58, y - R0 * .58); c.scale(R0 * 1.16 / 24, R0 * 1.16 / 24); c.fillStyle = "#0b1426"; c.fill(ICONP[d.c]); c.restore();
    d.scr.ix = s.tx; d.scr.iy = y; d.scr.R = R0;
  }
  c.globalAlpha = 1;
  const placed = [];
  const lab = list.filter(d => d.focus > .6 && (d.sel > .1 || d.hov > .1 || (d.w === 3 && !selected && selDist < 0) || (selDist < 0 && cam.dist < 170 && d.w >= 2) || (selDist < 0 && cam.dist < 100) || (selDist >= 0 && d.d0 === selDist)))
    .sort((a, b) => (b.sel + b.hov) - (a.sel + a.hov) || b.w - a.w);
  c.textBaseline = "middle";
  for (const d of lab) {
    const s = d.scr, big = d.sel > .5 || d.hov > .5;
    c.font = `${big ? 700 : 600} ${big ? 21 : 15}px Inter,"Segoe UI",sans-serif`;
    const tw = c.measureText(d.n).width, x = s.ix + s.R + 8, y = s.iy, bw = tw + 22, bh = big ? 36 : 27, box = [x, y - bh / 2, bw, bh];
    if (!big && placed.some(p => !(box[0] > p[0] + p[2] || box[0] + box[2] < p[0] || box[1] > p[1] + p[3] || box[1] + box[3] < p[1]))) continue;
    placed.push(box);
    c.globalAlpha = clamp((d.rise - .6) * 2.5, 0, 1);
    c.fillStyle = big ? "rgba(8,22,48,.94)" : "rgba(5,14,32,.82)"; rr(c, box[0], box[1], bw, bh, 8); c.fill();
    c.fillStyle = d.cat.color; c.fillRect(box[0], box[1] + 6, 3, bh - 12);
    c.fillStyle = big ? "#fff" : "#d6e8fb"; c.fillText(d.n, x + 12, y + 1);
  }
  c.globalAlpha = 1;
}

// emblem
(function emblem() {
  const o = H.outline.filter((p, i) => i % 3 === 0).map(p => [(p[0] / PW * 56 + 4).toFixed(1), (p[1] / PW * 56 + 4 + (56 - PH / PW * 56) / 2).toFixed(1)]);
  document.querySelector(".emblem").innerHTML = `<svg viewBox="0 0 64 64" width="64" height="64"><path d="M${o.join("L")}Z" fill="rgba(255,143,31,.18)" stroke="#ffb24a" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
})();

addEventListener("resize", fit); fit();
Promise.all([loadTex("sat", T.sat, false, true), loadTex("info", T.info, false, false), loadTex("did", T.did, true, false)]).then(() => {
  last = performance.now(); flyTo(HOME, 4.2); requestAnimationFrame(frame);
});
window.__app = { checkDistricts: () => DEST.map(d => d.n + ' -> ' + (d.dist ? d.dist.name : '?') + ' (book: ' + d.d + ')'), selectDistrict, pickTile, groundAt, inside, districtAt, surfY, get hoverT() { return hoverT; }, get selDist() { return selDist; }, cam, flyTo, select, DEST, setSolo, setYear: y => { yearTarget = y; }, HOME, get clock() { return clock; } };
})();
