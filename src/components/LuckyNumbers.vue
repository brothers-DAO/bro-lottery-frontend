<script setup lang="ts">
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()

const props = defineProps({
  ticket: Number,
  ind: Number
})
</script>

<template>
  <div class="flex flex-row justify-evenly items-center">
    <p class="text-black">Lucky number {{ props.ind }}</p>
    <button
      @click="orderStore.changeLuckyNumber(props.ind! - 1, false)"
      class="flex bg-black rounded-full h-[25px] w-[25px] justify-center items-center"
    >
      <p class="text-white text-[14px]">-</p>
    </button>
    <div class="flex items-center justify-center h-[20px] w-[20px] border-2 border-black">
      <p class="text-black">{{ ticket }}</p>
    </div>
    <button
      @click="orderStore.changeLuckyNumber(props.ind! - 1, true)"
      class="flex bg-black rounded-full h-[25px] w-[25px] justify-center items-center"
    >
      <p class="text-white text-[14px]">+</p>
    </button>
  </div>
</template>
