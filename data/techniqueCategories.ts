import type { TechniqueCategory } from '~/types/artwork'

/** Shared category color tokens — used by ArchitectPanel + PromptPlayground */
export const categoryColors: Record<TechniqueCategory, { bg: string; text: string; border: string; dot: string }> = {
  lighting: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  camera: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  style: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  mood: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
  composition: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  material: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  color: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  post: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/20', dot: 'bg-pink-400' },
}

/** Shared category display labels */
export const categoryLabels: Record<TechniqueCategory, string> = {
  lighting: 'Lighting',
  camera: 'Camera',
  style: 'Style',
  mood: 'Mood',
  composition: 'Composition',
  material: 'Material',
  color: 'Color',
  post: 'Post-Processing',
}
