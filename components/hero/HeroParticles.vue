<script setup lang="ts">
/**
 * HeroParticles — Canvas 2D particle system for the hero background.
 * Floating luminous dots that drift slowly, connected by faint lines
 * when near each other. Cursor proximity causes particles to scatter
 * gently outward, creating a living, reactive atmosphere.
 */

const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animId: number | null = null
let particles: Particle[] = []
let mouse = { x: -9999, y: -9999 }
let dpr = 1
let w = 0
let h = 0

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  baseVx: number
  baseVy: number
  size: number
  opacity: number
  hue: number
}

const PARTICLE_COUNT = 80
const CONNECTION_DIST = 120
const MOUSE_RADIUS = 180
const MOUSE_PUSH = 0.6

function createParticle(): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.15 + Math.random() * 0.3
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseVx: Math.cos(angle) * speed,
    baseVy: Math.sin(angle) * speed,
    size: 1 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.35,
    hue: Math.random() > 0.7 ? 0 : 260, // red accent or lavender
  }
}

function resize() {
  if (!canvasEl.value) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = canvasEl.value.offsetWidth
  h = canvasEl.value.offsetHeight
  canvasEl.value.width = w * dpr
  canvasEl.value.height = h * dpr
  ctx?.scale(dpr, dpr)
}

function init() {
  if (!canvasEl.value) return
  ctx = canvasEl.value.getContext('2d')
  resize()
  particles = Array.from({ length: PARTICLE_COUNT }, createParticle)
}

function draw() {
  if (!ctx) return

  ctx.clearRect(0, 0, w, h)

  // Update and draw particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // Mouse repulsion
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < MOUSE_RADIUS && dist > 0) {
      const force = (1 - dist / MOUSE_RADIUS) * MOUSE_PUSH
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    // Dampen back to base velocity
    p.vx += (p.baseVx - p.vx) * 0.02
    p.vy += (p.baseVy - p.vy) * 0.02

    p.x += p.vx
    p.y += p.vy

    // Wrap around edges
    if (p.x < -10) p.x = w + 10
    if (p.x > w + 10) p.x = -10
    if (p.y < -10) p.y = h + 10
    if (p.y > h + 10) p.y = -10

    // Draw particle
    const isRed = p.hue === 0
    const r = isRed ? 237 : 165
    const g = isRed ? 84 : 176
    const b = isRed ? 77 : 200
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`
    ctx.fill()

    // Draw connections to nearby particles
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const cdx = p.x - p2.x
      const cdy = p.y - p2.y
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
      if (cdist < CONNECTION_DIST) {
        const alpha = (1 - cdist / CONNECTION_DIST) * 0.08
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(165, 176, 200, ${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }

  animId = requestAnimationFrame(draw)
}

function onMouseMove(e: MouseEvent) {
  const rect = canvasEl.value?.getBoundingClientRect()
  if (!rect) return
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function onMouseLeave() {
  mouse.x = -9999
  mouse.y = -9999
}

onMounted(() => {
  init()
  draw()
  window.addEventListener('resize', resize, { passive: true })
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas
    ref="canvasEl"
    class="absolute inset-0 w-full h-full pointer-events-auto"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  />
</template>
