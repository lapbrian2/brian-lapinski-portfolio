import type { Artwork, PromptNode, TechniqueCategory } from '~/types/artwork'
import { artworks as staticArtworks } from '~/data/artworks'

export function useGallery() {
  // Fetch with prompt nodes
  const { data: response, pending, error, refresh } = useFetch('/api/artworks?nodes=true', {
    key: 'gallery-artworks',
    default: () => ({ success: true, data: [] as Artwork[] }),
  })

  // Fall back to static data if API fails or returns empty
  const artworks = computed<Artwork[]>(() => {
    const apiData = (response.value as any)?.data
    if (error.value || !apiData?.length) return staticArtworks as unknown as Artwork[]
    return apiData
  })

  // Seed like counts when artworks data changes
  const likes = useLikes()
  watch(artworks, (arts) => {
    if (arts.length) likes.seedCounts(arts)
  }, { immediate: true })

  // Active technique filter
  const activeTechnique = ref<string | null>(null)

  // All unique techniques across all artworks
  const allTechniques = computed<PromptNode[]>(() => {
    const seen = new Set<string>()
    const nodes: PromptNode[] = []
    for (const art of artworks.value) {
      if (!art.promptNodes) continue
      for (const node of art.promptNodes) {
        if (!seen.has(node.id)) {
          seen.add(node.id)
          nodes.push(node)
        }
      }
    }
    // Sort by category, then name
    return nodes.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
  })

  // Techniques grouped by category
  const techniquesByCategory = computed(() => {
    const groups: Record<string, PromptNode[]> = {}
    for (const node of allTechniques.value) {
      if (!groups[node.category]) groups[node.category] = []
      groups[node.category].push(node)
    }
    return groups
  })

  // Filter artworks by a specific technique
  function filterByTechnique(techniqueId: string | null) {
    activeTechnique.value = techniqueId
  }

  // Artworks filtered by active technique
  const filteredArtworks = computed<Artwork[]>(() => {
    if (!activeTechnique.value) return artworks.value
    return artworks.value.filter((art) =>
      art.promptNodes?.some((node) => node.id === activeTechnique.value),
    )
  })

  // Count how many artworks use a given technique
  function techniqueCount(techniqueId: string): number {
    return artworks.value.filter((art) =>
      art.promptNodes?.some((node) => node.id === techniqueId),
    ).length
  }

  return {
    artworks,
    filteredArtworks,
    allTechniques,
    techniquesByCategory,
    activeTechnique,
    filterByTechnique,
    techniqueCount,
    pending,
    error,
    refresh,
  }
}
