<script setup lang="ts">
import type { TestComponentProps } from './TestComponent.props'

defineProps<TestComponentProps>()
</script>

<template>
  <div>
    <p>This is a test component with ID: {{ id }}</p>
  </div>
</template>
