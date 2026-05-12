import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Lightweight ripple/displacement ocean (single-pass shader).
// Renders a large plane. Uses an array of ripple impulses.

const MAX_RIPPLES = 24;

const oceanVertexShader = `
  uniform float uTime;
  uniform float uScale;

  // Ripple impulses
  uniform int uRippleCount;
  uniform vec2 uRipplePos[${MAX_RIPPLES}];
  uniform float uRippleAmp[${MAX_RIPPLES}];
  uniform float uRippleStart[${MAX_RIPPLES}];
  uniform float uRippleSpeed;
  uniform float uRippleLife;

  varying vec3 vWorldPos;
  varying float vHeight;

  // Smooth-ish wave: base spectral waves
  float baseWave(vec2 xz, float t) {
    float w1 = sin(xz.x * 0.10 + t * 0.9) * 0.20;
    float w2 = sin(xz.y * 0.12 + t * 1.1) * 0.15;
    float w3 = sin((xz.x + xz.y) * 0.08 + t * 0.7) * 0.12;
    return (w1 + w2 + w3);
  }

  float rippleWave(vec2 xz, float t) {
    float h = 0.0;

    // distance-based rings
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      if (i >= uRippleCount) break;

      float age = t - uRippleStart[i];
      if (age < 0.0) continue;

      float life = 1.0 - clamp(age / uRippleLife, 0.0, 1.0);

      vec2 p = uRipplePos[i];
      float dist = distance(xz, p);

      // radial wavefront
      float phase = dist * 2.2 - age * uRippleSpeed;
      float ring = sin(phase) * 0.9;

      // decay with distance and time
      float falloff = 1.0 / (1.0 + dist * dist * 0.06);

      h += uRippleAmp[i] * ring * falloff * life;
    }

    return h;
  }

  void main() {
    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;

    // Convert to xz domain centered on plane
    vec2 xz = worldPos.xz * uScale;

    float t = uTime;

    float h = baseWave(xz, t) + rippleWave(xz, t);
    vHeight = h;
    vWorldPos = worldPos;

    vec3 displaced = position;
    // displacement amplitude in object space; keep small to avoid breaking visuals
    displaced.y += h * 0.55;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displaced, 1.0);
  }
`;

const oceanFragmentShader = `
  precision highp float;

  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uSunDir;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uFogColor;

  varying vec3 vWorldPos;
  varying float vHeight;

  void main() {
    // Fake normals from height variation (cheap approx via gradient in world-space)
    // Since we don't have derivatives reliably, we approximate using height.
    float h = vHeight;

    // Lighting
    float fresnel = pow(1.0 - clamp(dot(normalize(vec3(0.0, 1.0, 0.0)), vec3(0.0, 1.0, 0.0)), 0.0, 1.0), 3.0);
    vec3 albedo = mix(uShallowColor, uDeepColor, clamp((vWorldPos.y * 0.02) + 0.5, 0.0, 1.0));

    // Sun highlight
    float spec = pow(max(dot(normalize(vec3(0.0, 1.0, 0.0)), normalize(uSunDir)), 0.0), 32.0);

    vec3 color = albedo;
    color += vec3(0.8, 0.95, 1.0) * spec * 0.35;

    // Subtle foam where ripple height is large
    float foam = smoothstep(0.22, 0.55, abs(h));
    color = mix(color, vec3(0.85, 0.95, 1.0), foam * 0.35);

    // Fog gradient based on world Z (depth)
    float depth = (vWorldPos.z * 1.0);
    float fogFactor = smoothstep(uFogNear, uFogFar, depth);
    color = mix(color, uFogColor, fogFactor);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function createOcean({
  renderer,
  width = 20,
  depth = 40,
  fogNear = 0.0,
  fogFar = 60.0
} = {}) {
  const scene = new THREE.Scene();
  scene.fog = null; // custom in shader

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
  camera.position.set(0, 10, 25);
  camera.lookAt(0, 0, 0);

  const planeGeo = new THREE.PlaneGeometry(width, depth, 200, 200);
  planeGeo.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uScale: { value: 0.08 },

    uRippleCount: { value: 0 },
    uRipplePos: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector2(9999, 9999)) },
    uRippleAmp: { value: new Float32Array(MAX_RIPPLES) },
    uRippleStart: { value: new Float32Array(MAX_RIPPLES) },

    uRippleSpeed: { value: 6.5 },
    uRippleLife: { value: 2.6 },

    uDeepColor: { value: new THREE.Color('#022a43') },
    uShallowColor: { value: new THREE.Color('#0a5f86') },
    uSunDir: { value: new THREE.Vector3(0.2, 1.0, 0.3).normalize() },

    uFogNear: { value: fogNear },
    uFogFar: { value: fogFar },
    uFogColor: { value: new THREE.Color('#a9d6ff') }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: oceanVertexShader,
    fragmentShader: oceanFragmentShader,
    transparent: false
  });

  const oceanMesh = new THREE.Mesh(planeGeo, mat);
  oceanMesh.position.set(0, 0, 0);

  scene.add(oceanMesh);

  // Basic lighting + background
  const ambient = new THREE.AmbientLight(0x6aa8ff, 0.25);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  function resize(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const api = {
    scene,
    camera,
    oceanMesh,
    uniforms,
    resize,
    // world-domain ripple pos is in xz plane coordinates (same as shader xz after uScale)
    addRipple(worldX, worldZ, amp = 1.0, now = 0) {
      // find first empty or oldest
      const count = uniforms.uRippleCount.value;
      let idx = -1;

      for (let i = 0; i < MAX_RIPPLES; i++) {
        const start = uniforms.uRippleStart.value[i];
        if (start <= -9999) {
          idx = i;
          break;
        }
      }

      if (idx === -1) idx = (count < MAX_RIPPLES) ? count : (Math.random() * MAX_RIPPLES) | 0;

      uniforms.uRipplePos.value[idx].set(worldX, worldZ);
      uniforms.uRippleAmp.value[idx] = amp;
      uniforms.uRippleStart.value[idx] = now;
      if (count < MAX_RIPPLES) uniforms.uRippleCount.value = Math.min(MAX_RIPPLES, count + 1);
    },
    // approximate wave height at world position by sampling shader equations in CPU
    // Keep simple: base waves + sum ripples using same math.
    sampleHeight(x, z, t) {
      const ux = x * uniforms.uScale.value;
      const uz = z * uniforms.uScale.value;

      const w1 = Math.sin(ux * 0.10 + t * 0.9) * 0.20;
      const w2 = Math.sin(uz * 0.12 + t * 1.1) * 0.15;
      const w3 = Math.sin((ux + uz) * 0.08 + t * 0.7) * 0.12;
      let h = w1 + w2 + w3;

      const count = uniforms.uRippleCount.value;
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (i >= count) break;
        const start = uniforms.uRippleStart.value[i];
        const age = t - start;
        if (age < 0) continue;
        const life = 1.0 - Math.min(Math.max(age / uniforms.uRippleLife.value, 0.0), 1.0);
        const p = uniforms.uRipplePos.value[i];
        const dist = Math.hypot(ux - p.x, uz - p.y);
        const phase = dist * 2.2 - age * uniforms.uRippleSpeed.value;
        const ring = Math.sin(phase) * 0.9;
        const falloff = 1.0 / (1.0 + dist * dist * 0.06);
        h += uniforms.uRippleAmp.value[i] * ring * falloff * life;
      }

      return h;
    },
    update(dt, now) {
      uniforms.uTime.value = now;
      // expire ripples by decreasing count when all have faded could be added.
    },
    render() {
      renderer.render(scene, camera);
    }
  };

  // init ripple arrays to sentinel
  for (let i = 0; i < MAX_RIPPLES; i++) {
    uniforms.uRippleStart.value[i] = -9999;
    uniforms.uRippleAmp.value[i] = 0;
    uniforms.uRipplePos.value[i].set(9999, 9999);
  }

  return api;
}

