<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile, useReducedMotion } from '~/composables/useMediaQuery'
import { categories as allCategories } from '~/data/artworks'

const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()

let ctx: gsap.Context | null = null

const categories = allCategories
  .filter(c => c.id !== 'all')
  .map(c => ({ label: c.label, to: `/${c.id}` }))

onMounted(() => {
  if (!sectionEl.value || !headingEl.value) return
  if (reducedMotion.value) return

  // Query link elements directly from DOM — avoids function-ref timing issues
  const linkElements = Array.from(
    sectionEl.value.querySelectorAll('.collection-cta__link'),
  ) as HTMLElement[]

  ctx = gsap.context(() => {
    // Heading fade-in
    gsap.set(headingEl.value!, { opacity: 0, y: 40 })
    ScrollTrigger.create({
      trigger: sectionEl.value!,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(headingEl.value!, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          force3D: true,
        })

        // Stagger the category links
        if (linkElements.length) {
          gsap.fromTo(
            linkElements,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              delay: 0.3,
              ease: 'power3.out',
              force3D: true,
            },
          )
        }
      },
    })
  }, sectionEl.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="sectionEl" class="collection-cta relative overflow-hidden bg-dark-900">
    <div class="collection-cta__inner relative z-10">
      <!-- Subtle top rule -->
      <div class="w-16 h-px bg-accent-red/40 mx-auto mb-12" />

      <div ref="headingEl" class="text-center mb-16 md:mb-24">
        <p class="font-body text-xs uppercase tracking-[0.25em] text-lavender-400 mb-6">
          Full Collection
        </p>
        <h2 class="font-display font-bold text-lavender-100 leading-none collection-cta__heading">
          Explore by Category
        </h2>
      </div>

      <!-- Category links — large editorial text -->
      <nav class="collection-cta__nav" aria-label="Art categories">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.to"
          :to="cat.to"
          class="collection-cta__link group"
        >
          <span class="collection-cta__link-text font-display font-bold uppercase leading-none">
            {{ cat.label }}
          </span>
          <svg
            class="collection-cta__arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          >
            <line x1="4" y1="20" x2="20" y2="4" />
            <polyline points="8 4 20 4 20 16" />
          </svg>
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.collection-cta {
  padding: 8rem 0;
}

.collection-cta__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.collection-cta__heading {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: -0.03em;
}

.collection-cta__nav {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.collection-cta__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(201, 210, 231, 0.08);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.collection-cta__link:last-child {
  border-bottom: 1px solid rgba(201, 210, 231, 0.08);
}

.collection-cta__link-text {
  font-size: clamp(2.5rem, 8vw, 7rem);
  letter-spacing: -0.03em;
  color: rgba(218, 226, 242, 0.2);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.collection-cta__link:hover .collection-cta__link-text {
  color: #dae2f2;
  letter-spacing: 0.02em;
}

.collection-cta__arrow {
  color: rgba(218, 226, 242, 0.1);
  width: clamp(20px, 3vw, 32px);
  height: clamp(20px, 3vw, 32px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.collection-cta__link:hover .collection-cta__arrow {
  color: #ed544d;
  transform: translate(4px, -4px);
}

/* Mobile */
@media (max-width: 767px) {
  .collection-cta {
    padding: 5rem 0;
  }

  .collection-cta__link {
    padding: 1.25rem 0;
  }
}
</style>
