<script setup lang="ts">
/**
 * HeroParticles.vue
 * "Neural Constellation" — a 3D particle system rendered as Points
 * with per-particle colors, subtle drift animation, and mouse parallax.
 */
import * as THREE from 'three'
import { useLoop } from '@tresjs/core'

// ---------------------------------------------------------------------------
// Responsive particle count
// ---------------------------------------------------------------------------
const particleCount = ref(2000)

onMounted(() => {
  particleCount.value = window.innerWidth > 1024 ? 2000 : 800
})

// ---------------------------------------------------------------------------
// Programmatic circular-gradient texture (32x32)
// ---------------------------------------------------------------------------
function createParticleTexture(): THREE.CanvasTexture {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// ---------------------------------------------------------------------------
// Color palette (selected per-particle by weighted random)
// ---------------------------------------------------------------------------
const PALETTE = [
  { r: 201 / 255, g: 210 / 255, b: 231 / 255 }, // lavender        60 %
  { r: 218 / 255, g: 226 / 255, b: 242 / 255 }, // light lavender  25 %
  { r: 237 / 255, g: 84 / 255, b: 77 / 255 },   // accent red      10 %
  { r: 1, g: 1, b: 1 },                           // white            5 %
]

function pickColor(): { r: number; g: number; b: number } {
  const r = Math.random()
  if (r < 0.60) return PALETTE[0]
  if (r < 0.85) return PALETTE[1]
  if (r < 0.95) return PALETTE[2]
  return PALETTE[3]
}

// ---------------------------------------------------------------------------
// Gaussian-like random helper  (range approx -1 .. 1, biased toward 0)
// ---------------------------------------------------------------------------
function gaussRand(): number {
  return (Math.random() + Math.random() + Math.random()) / 3 * 2 - 1
}

// ---------------------------------------------------------------------------
// Build geometry + material + Points mesh
// ---------------------------------------------------------------------------
const points = shallowRef<THREE.Points | null>(null)

onMounted(() => {
  const count = particleCount.value

  // Typed arrays for BufferGeometry attributes
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // Positions: x/y in [-8, 8], z in [-3, 3], center-biased
    positions[i3] = gaussRand() * 8
    positions[i3 + 1] = gaussRand() * 8
    positions[i3 + 2] = gaussRand() * 3

    // Colors
    const c = pickColor()
    colors[i3] = c.r
    colors[i3 + 1] = c.g
    colors[i3 + 2] = c.b

    // Sizes
    sizes[i] = 0.015 + Math.random() * 0.045 // 0.015 .. 0.06
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.04,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    vertexColors: true,
    map: createParticleTexture(),
  })

  points.value = new THREE.Points(geometry, material)
})

// ---------------------------------------------------------------------------
// Mouse tracking (normalised -1 .. 1)
// ---------------------------------------------------------------------------
const mouseX = ref(0)
const mouseY = ref(0)

function onMouseMove(e: MouseEvent) {
  mouseX.value = (e.clientX / window.innerWidth) * 2 - 1
  mouseY.value = -((e.clientY / window.innerHeight) * 2 - 1)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)

  // Dispose Three.js resources
  if (points.value) {
    points.value.geometry.dispose()
    ;(points.value.material as THREE.PointsMaterial).map?.dispose()
    ;(points.value.material as THREE.PointsMaterial).dispose()
  }
})

// ---------------------------------------------------------------------------
// Animation loop (useLoop replaces deprecated useRenderLoop in TresJS v4+)
// ---------------------------------------------------------------------------
const { onBeforeRender } = useLoop()

let startTime = 0

onBeforeRender(({ delta }) => {
  if (!points.value) return

  startTime += delta
  const elapsed = startTime

  const posAttr = points.value.geometry.getAttribute('position') as THREE.BufferAttribute
  const positions = posAttr.array as Float32Array
  const count = positions.length / 3

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // Gentle individual drift
    positions[i3] += Math.sin(elapsed * 0.3 + i * 0.1) * 0.0003
    positions[i3 + 1] += Math.cos(elapsed * 0.25 + i * 0.08) * 0.0003
  }

  posAttr.needsUpdate = true

  // Slow global rotation
  points.value.rotation.y += 0.0001

  // Lerp toward mouse for parallax (smooth factor 0.02)
  points.value.position.x += (mouseX.value * 0.3 - points.value.position.x) * 0.02
  points.value.position.y += (mouseY.value * 0.2 - points.value.position.y) * 0.02
})
</script>

<template>
  <primitive v-if="points" :object="points" />
</template>
