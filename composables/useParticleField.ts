import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  Color,
  Vector2,
  AdditiveBlending,
} from 'three'
import gsap from 'gsap'
import type { Ref } from 'vue'
import { watch } from 'vue'
import { particleVertexShader, particleFragmentShader } from './useParticleShaders'
import { useActiveSectionValue } from './useActiveSection'
import type { GPUTier } from './useGPUCapability'

/* ── Section color/density configs ─────────────────────────────── */

interface SectionConfig {
  colorA: [number, number, number]
  colorB: [number, number, number]
  density: number
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  '': {
    // Hero / no section active
    colorA: [0.93, 0.33, 0.30], // #ed544d warm red
    colorB: [0.50, 0.45, 0.55], // muted lavender
    density: 0.3,
  },
  work: {
    colorA: [0.93, 0.33, 0.30],
    colorB: [0.80, 0.55, 0.45], // warm amber
    density: 0.6,
  },
  about: {
    colorA: [0.0, 0.48, 1.0], // #007aff cool blue
    colorB: [0.50, 0.55, 0.70], // cool lavender
    density: 0.8,
  },
  process: {
    colorA: [0.60, 0.50, 0.65], // muted purple
    colorB: [0.40, 0.45, 0.55], // steel
    density: 0.5,
  },
  contact: {
    colorA: [0.93, 0.33, 0.30],
    colorB: [0.80, 0.70, 0.60], // warm cream
    density: 0.3,
  },
}

/* ── Lerp helper ───────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/* ── Main composable ───────────────────────────────────────────── */

export function useParticleField(
  canvasEl: Ref<HTMLCanvasElement | null>,
  options: { particleCount: number; gpuTier: GPUTier },
) {
  // Three.js objects
  let renderer: WebGLRenderer | null = null
  let scene: Scene | null = null
  let camera: OrthographicCamera | null = null
  let points: Points | null = null
  let geometry: BufferGeometry | null = null
  let material: ShaderMaterial | null = null

  // GSAP ticker + event handlers
  let tickerFn: ((time: number) => void) | null = null
  let resizeHandler: (() => void) | null = null
  let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
  let lenisScrollHandler: ((e: any) => void) | null = null
  let lenisInstance: any = null
  let contextLostHandler: ((e: Event) => void) | null = null
  let contextRestoredHandler: ((e: Event) => void) | null = null

  // Smoothed state (lerped each frame toward raw targets)
  const state = {
    scrollVelocityRaw: 0,
    scrollVelocity: 0,
    mouseXRaw: 0,
    mouseYRaw: 0,
    mouseX: 0,
    mouseY: 0,
    colorA: new Color(0.93, 0.33, 0.30),
    colorB: new Color(0.50, 0.45, 0.55),
    targetColorA: new Color(0.93, 0.33, 0.30),
    targetColorB: new Color(0.50, 0.45, 0.55),
    density: 0.3,
    targetDensity: 0.3,
    colorMix: 0,
    targetColorMix: 0,
  }

  /* ── Particle geometry generation ────────────────────────────── */

  function createParticles(count: number): BufferGeometry {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)
    const depths = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Spread across NDC space with slight overflow for edge coverage
      positions[i * 3] = (Math.random() - 0.5) * 2.4
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.4
      positions[i * 3 + 2] = 0

      sizes[i] = 1.0 + Math.random() * 3.0
      speeds[i] = 0.3 + Math.random() * 0.7
      phases[i] = Math.random() * Math.PI * 2

      // Depth distribution: ~33% each tier
      const depthBucket = Math.floor(Math.random() * 3)
      depths[i] = depthBucket === 0 ? 0.2 : depthBucket === 1 ? 0.5 : 0.9
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1))
    geo.setAttribute('aSpeed', new BufferAttribute(speeds, 1))
    geo.setAttribute('aPhase', new BufferAttribute(phases, 1))
    geo.setAttribute('aDepth', new BufferAttribute(depths, 1))

    return geo
  }

  /* ── Setup ───────────────────────────────────────────────────── */

  function setup() {
    if (!canvasEl.value || options.particleCount === 0) return

    const canvas = canvasEl.value
    const w = window.innerWidth
    const h = window.innerHeight

    // Renderer — transparent bg so HTML black shows through
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)

    // Orthographic camera in NDC space
    camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    scene = new Scene()

    // Geometry
    geometry = createParticles(options.particleCount)

    // Material with shared uniforms
    material = new ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uScrollVelocity: { value: 0 },
        uDensity: { value: 0.3 },
        uResolution: { value: new Vector2(w, h) },
        uMouseRadius: { value: options.gpuTier === 'high' ? 0.2 : 0.15 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA: { value: new Color(0.93, 0.33, 0.30) },
        uColorB: { value: new Color(0.50, 0.45, 0.55) },
        uColorMix: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })

    points = new Points(geometry, material)
    scene.add(points)

    // ── Lenis scroll velocity (same pattern as useVelocitySkew) ──
    try {
      const { $lenis } = useNuxtApp()
      if ($lenis) {
        lenisInstance = $lenis
        lenisScrollHandler = (e: any) => {
          state.scrollVelocityRaw = e.velocity || 0
        }
        ;($lenis as any).on('scroll', lenisScrollHandler)
      }
    } catch {
      // Lenis not available
    }

    // ── Mouse position ──
    if (options.gpuTier === 'high') {
      mouseMoveHandler = (e: MouseEvent) => {
        state.mouseXRaw = (e.clientX / window.innerWidth) * 2 - 1
        state.mouseYRaw = -(e.clientY / window.innerHeight) * 2 + 1
      }
      window.addEventListener('mousemove', mouseMoveHandler, { passive: true })
    }

    // ── Section-aware color transitions ──
    const { activeSection } = useActiveSectionValue()
    watch(activeSection, (sectionId) => {
      const config = SECTION_CONFIGS[sectionId] || SECTION_CONFIGS['']
      state.targetColorA.setRGB(config.colorA[0], config.colorA[1], config.colorA[2])
      state.targetColorB.setRGB(config.colorB[0], config.colorB[1], config.colorB[2])
      state.targetDensity = config.density
      // Cycle color mix to create a breathing blend
      state.targetColorMix = state.targetColorMix > 0.5 ? 0.0 : 1.0
    }, { immediate: true })

    // ── Resize handler ──
    resizeHandler = () => {
      if (!renderer || !material) return
      const rw = window.innerWidth
      const rh = window.innerHeight
      renderer.setSize(rw, rh)
      material.uniforms.uResolution.value.set(rw, rh)
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }
    window.addEventListener('resize', resizeHandler, { passive: true })

    // ── WebGL context loss handling ──
    contextLostHandler = (e: Event) => {
      e.preventDefault()
      if (tickerFn) gsap.ticker.remove(tickerFn)
    }
    contextRestoredHandler = () => {
      if (tickerFn) gsap.ticker.add(tickerFn)
    }
    canvas.addEventListener('webglcontextlost', contextLostHandler)
    canvas.addEventListener('webglcontextrestored', contextRestoredHandler)

    // ── Render loop on shared GSAP ticker ──
    const startTime = performance.now()
    tickerFn = () => {
      if (!renderer || !scene || !camera || !material) return
      if (document.hidden) return // Skip rendering in background tabs

      const elapsed = (performance.now() - startTime) / 1000

      // Smooth all inputs
      state.scrollVelocity = lerp(state.scrollVelocity, state.scrollVelocityRaw, 0.08)
      state.scrollVelocityRaw *= 0.95 // Decay toward zero
      state.mouseX = lerp(state.mouseX, state.mouseXRaw, 0.1)
      state.mouseY = lerp(state.mouseY, state.mouseYRaw, 0.1)
      state.density = lerp(state.density, state.targetDensity, 0.03)
      state.colorMix = lerp(state.colorMix, state.targetColorMix, 0.03)
      state.colorA.lerp(state.targetColorA, 0.02)
      state.colorB.lerp(state.targetColorB, 0.02)

      // Write uniforms
      material.uniforms.uTime.value = elapsed
      material.uniforms.uMouse.value.set(state.mouseX, state.mouseY)
      material.uniforms.uScrollVelocity.value = Math.max(-1, Math.min(1, state.scrollVelocity * 0.3))
      material.uniforms.uDensity.value = state.density
      material.uniforms.uColorA.value.copy(state.colorA)
      material.uniforms.uColorB.value.copy(state.colorB)
      material.uniforms.uColorMix.value = state.colorMix

      renderer.render(scene!, camera!)
    }
    gsap.ticker.add(tickerFn)
  }

  /* ── Cleanup ─────────────────────────────────────────────────── */

  function cleanup() {
    if (tickerFn) gsap.ticker.remove(tickerFn)
    if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler)
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
    if (lenisScrollHandler && lenisInstance) {
      lenisInstance.off('scroll', lenisScrollHandler)
    }
    if (canvasEl.value) {
      if (contextLostHandler) canvasEl.value.removeEventListener('webglcontextlost', contextLostHandler)
      if (contextRestoredHandler) canvasEl.value.removeEventListener('webglcontextrestored', contextRestoredHandler)
    }

    // Dispose Three.js resources
    if (points && scene) scene.remove(points)
    geometry?.dispose()
    material?.dispose()
    renderer?.dispose()

    // Null everything
    renderer = null
    scene = null
    camera = null
    points = null
    geometry = null
    material = null
    tickerFn = null
    resizeHandler = null
    mouseMoveHandler = null
    lenisScrollHandler = null
    lenisInstance = null
    contextLostHandler = null
    contextRestoredHandler = null
  }

  return { setup, cleanup }
}
