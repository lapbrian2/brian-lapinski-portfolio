<script setup lang="ts">
/**
 * StackedAurora — Three.js flowing mesh backdrop for StackedTypography
 *
 * Uses the immersive-3d-web skill pattern:
 *   Raw Three.js (imperative) → GSAP proxy objects → scroll-driven updates
 *
 * A large PlaneGeometry with vertex displacement driven by simplex noise,
 * creating an organic, flowing aurora/gradient surface behind the text.
 * Reacts to scroll position and mouse movement via proxy objects.
 */
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// Proxy object pattern (from skill: never animate Three.js objects directly)
const proxy = reactive({
  scrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  waveAmplitude: 1.0,
  colorMix: 0,
})

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let mesh: THREE.Mesh | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null

// Simplex-like noise (fast 3D gradient noise for vertex displacement)
function hash(x: number, y: number, z: number): number {
  let h = x * 374761393 + y * 668265263 + z * 1274126177
  h = (h ^ (h >> 13)) * 1274126177
  return (h ^ (h >> 16)) / 2147483648
}

function smoothNoise(x: number, y: number, z: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = x - ix
  const fy = y - iy
  const fz = z - iz

  // Smoothstep interpolation
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const uz = fz * fz * (3 - 2 * fz)

  const a = hash(ix, iy, iz)
  const b = hash(ix + 1, iy, iz)
  const c = hash(ix, iy + 1, iz)
  const d = hash(ix + 1, iy + 1, iz)
  const e = hash(ix, iy, iz + 1)
  const f = hash(ix + 1, iy, iz + 1)
  const g = hash(ix, iy + 1, iz + 1)
  const h2 = hash(ix + 1, iy + 1, iz + 1)

  const x1 = a + ux * (b - a) + uy * (c - a) + ux * uy * (a - b - c + d)
  const x2 = e + ux * (f - e) + uy * (g - e) + ux * uy * (e - f - g + h2)

  return x1 + uz * (x2 - x1)
}

function fbm(x: number, y: number, z: number): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let i = 0; i < 4; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, z * frequency)
    amplitude *= 0.5
    frequency *= 2.0
  }
  return value
}

// Custom shader material for the aurora gradient
const vertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uWaveAmplitude;
  uniform vec2 uMouse;

  varying vec2 vUv;
  varying float vDisplacement;

  // Simplex-style noise in GLSL
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x2_ = x_ * ns.x + ns.yyyy;
    vec4 y2_ = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x2_) - abs(y2_);
    vec4 b0 = vec4(x2_.xy, y2_.xy);
    vec4 b1 = vec4(x2_.zw, y2_.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Mouse influence — tangible push on the mesh surface
    float mouseInfluence = snoise(vec3(pos.x * 0.3 + uMouse.x * 0.8, pos.y * 0.3 + uMouse.y * 0.8, uTime * 0.15)) * 0.5;

    // Multi-layered noise displacement — dramatic, rolling waves
    float noise1 = snoise(vec3(pos.x * 0.35, pos.y * 0.35, uTime * 0.1 + uScrollProgress * 3.0)) * uWaveAmplitude;
    float noise2 = snoise(vec3(pos.x * 0.7 + 5.0, pos.y * 0.7, uTime * 0.07 - uScrollProgress * 1.5)) * uWaveAmplitude * 0.55;
    float noise3 = snoise(vec3(pos.x * 1.3 + 10.0, pos.y * 1.3, uTime * 0.18)) * uWaveAmplitude * 0.25;

    float displacement = noise1 + noise2 + noise3 + mouseInfluence;
    pos.z += displacement;

    vDisplacement = displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uColorMix;

  varying vec2 vUv;
  varying float vDisplacement;

  // Simplex noise in fragment for aurora ribbons
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x2_ = x_ * ns.x + ns.yyyy;
    vec4 y2_ = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x2_) - abs(y2_);
    vec4 b0 = vec4(x2_.xy, y2_.xy);
    vec4 b1 = vec4(x2_.zw, y2_.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // ── Palette ──
    vec3 lavender400 = vec3(0.655, 0.545, 0.980);  // #a78bfa
    vec3 lavender300 = vec3(0.769, 0.710, 0.992);  // #c4b5fd
    vec3 lavender100 = vec3(0.913, 0.882, 1.0);    // #e9e1ff bright highlight
    vec3 dark800    = vec3(0.137, 0.106, 0.208);   // #231b35
    vec3 dark900    = vec3(0.094, 0.082, 0.125);   // #181520
    vec3 accentRed  = vec3(0.929, 0.329, 0.302);   // #ed544d
    vec3 deepViolet = vec3(0.35, 0.15, 0.65);      // rich violet for depth
    vec3 hotMagenta = vec3(0.85, 0.2, 0.55);       // electric magenta accent

    float gradientY = vUv.y;
    float gradientX = vUv.x;

    // ── Aurora ribbon noise (fragment-level, independent of vertex displacement) ──
    float ribbon1 = snoise(vec3(vUv.x * 3.0, vUv.y * 1.5 + uTime * 0.08, uTime * 0.05));
    float ribbon2 = snoise(vec3(vUv.x * 2.0 + 5.0, vUv.y * 2.0 - uTime * 0.06, uTime * 0.07 + 3.0));
    float ribbon3 = snoise(vec3(vUv.x * 4.0 + 10.0, vUv.y * 0.8 + uTime * 0.1, uTime * 0.04 + 7.0));

    // Sharp aurora bands — pow concentrates brightness into narrow ribbons
    float band1 = pow(max(0.0, ribbon1), 3.0) * 1.6;
    float band2 = pow(max(0.0, ribbon2), 3.0) * 1.1;
    float band3 = pow(max(0.0, ribbon3), 4.0) * 1.2;

    // ── Base: deep dark with subtle violet undertone ──
    vec3 baseColor = mix(dark900, mix(dark800, deepViolet * 0.3, 0.4), gradientY * 0.5 + vDisplacement * 0.4);

    // ── Primary lavender aurora glow ──
    float glowIntensity = smoothstep(-0.3, 0.6, vDisplacement) * 0.5;
    vec3 glowColor = mix(lavender400, lavender300, gradientX + sin(uTime * 0.25) * 0.4);
    baseColor = mix(baseColor, glowColor, glowIntensity);

    // ── Aurora ribbon overlays — dramatic colored bands ──
    vec3 ribbon1Color = mix(lavender400, deepViolet, 0.3 + sin(uTime * 0.15) * 0.2);
    vec3 ribbon2Color = mix(lavender300, hotMagenta, 0.4);
    vec3 ribbon3Color = mix(lavender100, accentRed, 0.25 + cos(uTime * 0.12) * 0.15);

    baseColor += ribbon1Color * band1 * 0.35;
    baseColor += ribbon2Color * band2 * 0.25;
    baseColor += ribbon3Color * band3 * 0.15;

    // ── Bright peaks — hot spots where displacement is strongest ──
    float peakIntensity = smoothstep(0.4, 1.0, vDisplacement);
    vec3 peakColor = mix(lavender300, lavender100, peakIntensity);
    baseColor = mix(baseColor, peakColor, peakIntensity * 0.3);

    // ── Accent red ember glow on highest peaks ──
    float emberIntensity = smoothstep(0.7, 1.4, vDisplacement) * 0.25;
    baseColor = mix(baseColor, accentRed, emberIntensity);

    // ── Scroll-driven color evolution: warmer as user scrolls ──
    float warmth = uScrollProgress * 0.18;
    baseColor += vec3(warmth * 0.3, warmth * 0.06, -warmth * 0.1);
    // Gentle saturation boost with scroll
    float luminance = dot(baseColor, vec3(0.299, 0.587, 0.114));
    baseColor = mix(vec3(luminance), baseColor, 1.0 + uScrollProgress * 0.15);

    // ── Edge fade — wider visible area, softer fade ──
    float edgeFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x)
                   * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

    // ── Alpha: visible but not overwhelming, displacement adds punch ──
    float displacementBoost = smoothstep(-0.2, 0.8, vDisplacement) * 0.15;
    float alpha = edgeFade * (0.65 + displacementBoost);

    gl_FragColor = vec4(baseColor, alpha);
  }
`

function resizeRenderer(w: number, h: number) {
  if (!renderer || !camera || w === 0 || h === 0) return
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function initScene() {
  if (!canvasRef.value || !containerRef.value) return

  const isMobile = window.innerWidth < 768

  // Scene
  scene = new THREE.Scene()

  // Camera (per skill: PerspectiveCamera for depth)
  // Use window dimensions as safe initial aspect — ResizeObserver corrects immediately
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 3

  // Renderer (per skill: alpha true, capped pixel ratio)
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: !isMobile,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)

  // Set initial size from container (may be 0 if layout hasn't settled)
  const { width, height } = containerRef.value.getBoundingClientRect()
  if (width > 0 && height > 0) {
    resizeRenderer(width, height)
  }

  // Geometry — large plane with many segments for smooth displacement
  const segments = isMobile ? 48 : 96
  const geometry = new THREE.PlaneGeometry(8, 6, segments, segments)

  // Material — custom shader
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uWaveAmplitude: { value: 1.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorMix: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // ResizeObserver handles both initial sizing (when layout settles)
  // and responsive updates (per skill: handle resize)
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width: w, height: h } = entry.contentRect
      resizeRenderer(w, h)
    }
  })
  resizeObserver.observe(containerRef.value)
}

function setupScrollAnimation() {
  if (!containerRef.value) return

  // Per skill: GSAP animates proxy, render loop reads proxy
  gsap.to(proxy, {
    scrollProgress: 1,
    waveAmplitude: 1.5,
    colorMix: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: containerRef.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
  })
}

function setupMouseTracking() {
  const onMouseMove = (e: MouseEvent) => {
    // Normalize to -1..1 range
    const targetX = (e.clientX / window.innerWidth) * 2 - 1
    const targetY = -(e.clientY / window.innerHeight) * 2 + 1

    // Lerped via GSAP for smooth following
    gsap.to(proxy, {
      mouseX: targetX,
      mouseY: targetY,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: true,
    })
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
  })
}

let startTime = 0

function animate() {
  if (!renderer || !scene || !camera || !mesh) return

  animationId = requestAnimationFrame(animate)

  const elapsed = (performance.now() - startTime) / 1000

  // Per skill: render loop reads proxy values
  const mat = mesh.material as THREE.ShaderMaterial
  mat.uniforms.uTime.value = elapsed
  mat.uniforms.uScrollProgress.value = proxy.scrollProgress
  mat.uniforms.uWaveAmplitude.value = proxy.waveAmplitude
  mat.uniforms.uMouse.value.set(proxy.mouseX, proxy.mouseY)
  mat.uniforms.uColorMix.value = proxy.colorMix

  renderer.render(scene, camera)
}

onMounted(async () => {
  // Wait for layout to settle before measuring container
  await nextTick()
  startTime = performance.now()
  initScene()
  setupScrollAnimation()
  setupMouseTracking()
  animate()
})

// Per skill: dispose everything on unmount to prevent memory leaks
onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)

  if (resizeObserver && containerRef.value) {
    resizeObserver.disconnect()
  }

  if (mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.ShaderMaterial).dispose()
  }

  renderer?.dispose()

  // Kill scroll-driven tweens
  gsap.killTweensOf(proxy)
})
</script>

<template>
  <div ref="containerRef" class="absolute inset-0 z-0 pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full" />
  </div>
</template>
