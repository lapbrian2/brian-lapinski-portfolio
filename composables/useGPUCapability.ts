import { computed, ref } from 'vue'
import { useIsMobile, useReducedMotion } from './useMediaQuery'

export type GPUTier = 'high' | 'medium' | 'none'

/**
 * Detects GPU capability to decide WebGL rendering tier.
 *
 * - 'high'   → discrete GPU, full particle field (800 particles)
 * - 'medium' → integrated GPU, reduced particles (400)
 * - 'none'   → mobile, reduced motion, or no WebGL2 — canvas not rendered
 */
export function useGPUCapability() {
  const tier = ref<GPUTier>('none')
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()

  if (import.meta.client) {
    if (reducedMotion.value) {
      tier.value = 'none'
    } else if (isMobile.value) {
      tier.value = 'none'
    } else {
      // Probe WebGL2 support and GPU info
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null

      if (!gl) {
        tier.value = 'none'
      } else {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const renderer = debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : ''
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)

        // Heuristic: integrated GPUs or low max texture = medium tier
        const isIntegrated = /intel|mesa|swiftshader|llvmpipe/i.test(renderer)
        tier.value = isIntegrated || maxTextureSize < 8192 ? 'medium' : 'high'

        // Clean up the probe context
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
      canvas.remove()
    }
  }

  return {
    tier,
    canRender: computed(() => tier.value !== 'none'),
    particleCount: computed(() => {
      switch (tier.value) {
        case 'high': return 800
        case 'medium': return 400
        default: return 0
      }
    }),
  }
}
