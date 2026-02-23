<template>
  <section id="process" class="py-24 md:py-32 overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-12">
      <h2 class="font-display text-section font-bold text-lavender-100 mb-4">
        Process
      </h2>
      <p class="font-body text-lg text-lavender-300 mb-12 max-w-2xl">
        From concept to final piece — how AI art comes to life.
      </p>
    </div>

    <!-- Desktop: horizontal scroll with Swiper -->
    <div class="hidden md:block">
      <ClientOnly>
        <Swiper
          :slides-per-view="'auto'"
          :space-between="24"
          :free-mode="true"
          :grab-cursor="true"
          class="px-12 !overflow-visible"
        >
          <SwiperSlide
            v-for="step in steps"
            :key="step.number"
            class="!w-[380px]"
          >
            <ProcessStep :step="step" />
          </SwiperSlide>
        </Swiper>
        <template #fallback>
          <div class="flex gap-6 px-12 overflow-x-auto">
            <div v-for="step in steps" :key="step.number" class="min-w-[380px]">
              <ProcessStep :step="step" />
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Mobile: vertical stack -->
    <div class="md:hidden px-6 space-y-6">
      <ProcessStep v-for="step in steps" :key="step.number" :step="step" />
    </div>
  </section>
</template>

<script setup lang="ts">
interface ProcessStepData {
  number: string
  title: string
  description: string
}

const steps: ProcessStepData[] = [
  {
    number: '01',
    title: 'Concept & Prompt Engineering',
    description:
      'Every piece begins with an idea. I craft detailed prompts that capture mood, composition, style, and narrative — translating vision into language that AI systems can interpret.',
  },
  {
    number: '02',
    title: 'Generation & Iteration',
    description:
      'Through iterative generation cycles, I explore variations and push the AI in unexpected directions. Each batch reveals new possibilities, guiding the creative dialogue forward.',
  },
  {
    number: '03',
    title: 'Curation & Selection',
    description:
      'From hundreds of generations, I curate the pieces that resonate most — selecting for emotional impact, technical quality, and artistic coherence.',
  },
  {
    number: '04',
    title: 'Post-Processing & Refinement',
    description:
      'The final stage involves careful refinement in Photoshop and Topaz AI — enhancing details, correcting artifacts, and bringing the piece to its fullest expression.',
  },
]
</script>
