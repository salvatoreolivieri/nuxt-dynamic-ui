<template>
  <div>
    Nuxt module playground!

    <component :is="component" v-bind="props"></component>
  </div>
</template>

<script setup lang="ts">
import { useDynamicUI } from '#imports'

const { generateComponent } = useDynamicUI()
const { component, props } = generateComponent('testComponent', {
  props: {
    id: 'test',
  },
})
</script>
