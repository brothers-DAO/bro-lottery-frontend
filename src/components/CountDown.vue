<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  timeStart: number
  timeEnd: number
}>()

const days = ref()
const hours = ref()
const minutes = ref()
const seconds = ref()

function setTime(timeEnd: number, timeStart: number) {
  var time = timeEnd - timeStart
  setInterval(function () {
    if (time > 0) {
      time = time - 1000
      days.value = Math.floor(time / (1000 * 60 * 60 * 24))
      hours.value = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      minutes.value = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
      seconds.value = Math.floor((time % (1000 * 60)) / 1000)
    }
  }, 1000)
}

onMounted(() => {
  setTime(props.timeEnd, props.timeStart)
})
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <p class="text-black font-extrabold">TICKET SALE CLOSING IN:</p>
    <div class="w-full grid grid-cols-4 gap-2">
      <div class="w-full flex flex-col items-center rounded-lg bg-black p-[8px] space-y-[4px]">
        <p class="text-white">Days</p>
        <div class="flex bg-white h-[30px] w-[30px] rounded-lg items-center justify-center">
          <p class="font-extrabold text-red-800 text-[20px]">{{ days }}</p>
        </div>
      </div>
      <div class="w-full flex flex-col items-center rounded-lg bg-black p-[8px] space-y-[4px]">
        <p class="text-white">Hours</p>
        <div class="flex bg-white h-[30px] w-[30px] rounded-lg items-center justify-center">
          <p class="font-extrabold text-red-800 text-[20px]">{{ hours }}</p>
        </div>
      </div>
      <div class="w-full flex flex-col items-center rounded-lg bg-black p-[8px] space-y-[4px]">
        <p class="text-white">Mins</p>
        <div class="flex bg-white h-[30px] w-[30px] rounded-lg items-center justify-center">
          <p class="font-extrabold text-red-800 text-[20px]">{{ minutes }}</p>
        </div>
      </div>
      <div class="w-full flex flex-col items-center rounded-lg bg-black p-[8px] space-y-[4px]">
        <p class="text-white">Secs</p>
        <div class="flex bg-white h-[30px] w-[30px] rounded-lg items-center justify-center">
          <p class="font-extrabold text-red-800 text-[20px]">{{ seconds }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
