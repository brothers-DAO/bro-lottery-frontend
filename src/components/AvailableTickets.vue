<script setup lang="ts">
const props = defineProps<{
  tickets: number
  limit: number
}>()
</script>

<template>
  <div>
    <p v-if="props.tickets < props.limit" class="text-black font-extrabold">
      {{ props.limit - props.tickets }} tickets out of {{ props.limit }} tickets available
    </p>
    <p v-else class="text-black font-extrabold">No more tickets available</p>
  </div>
</template>
