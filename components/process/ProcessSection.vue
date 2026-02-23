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
    title: 'Intention & Feeling',
    description:
      'Every piece starts with a feeling or a question about what it means to be human. I don\'t chase trends — I follow what resonates emotionally and personally.',
  },
  {
    number: '02',
    title: 'Style DNA & Prompt Craft',
    description:
      'Using my Style DNA methodology, I treat prompt engineering as a reproducible craft. Detailed prompts capture mood, composition, and narrative — translating inner vision into language AI can interpret.',
  },
  {
    number: '03',
    title: 'Generation & Dialogue',
    description:
      'Through Midjourney and ImagineArt, I generate and iterate — not randomly, but systematically. Each batch reveals new possibilities, guiding a creative dialogue between human intent and machine capability.',
  },
  {
    number: '04',
    title: 'Curation & Connection',
    description:
      'From hundreds of generations, I select the images that speak without words — the ones that create a quiet connection between people. The final piece is about emotional truth, not technical perfection.',
  },
]
</script>
