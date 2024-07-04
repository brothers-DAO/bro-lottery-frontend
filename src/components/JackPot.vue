<script setup lang="ts">
import { useLotteryStore } from '@/stores/lottery'

const lottery = useLotteryStore()
</script>

<template>
  <section
    v-if="lottery.currentRound?.jackpot"
    class="flex flex-row items-center justify-center w-full py-[16px] space-x-[10px] rounded-lg bg-white text-[20px] h-[50px]"
  >
    <p class="font-extrabold text-accent-1">CURRENT JACKPOT:</p>
    <p>{{ lottery.currentRound.jackpot.toFixed(4) }}</p>
    <img src="@/assets/tokens/bro.png" alt="" class="w-[25px] h-[25px]" />
  </section>
</template>
