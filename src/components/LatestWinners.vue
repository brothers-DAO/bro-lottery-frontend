<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import { useLotteryStore, type RoundWinners } from '@/stores/lottery'
import { onMounted, ref } from 'vue'

const lottery = useLotteryStore()

const winners = ref<Array<RoundWinners> | undefined>(undefined)

async function getLatestWinners() {
  const res = await lottery.getLatestRounds()
  winners.value = res
}

onMounted(async () => {
  getLatestWinners()
})
</script>

<template>
  <section
    class="relative w-full p-[16px] rounded-lg bg-white space-y-[16px] text-[14px] h-full overflow-y-auto"
  >
    <p class="font-extrabold">Latest Winners</p>
    <div v-if="!winners" class="flex flex-row items-center justify-center">
      <img src="@/assets/load.png" spin alt="loading" class="w-[20px] h-[20px] animate-spin" />
      <p>Getting latest rounds</p>
    </div>
    <div
      v-else
      v-for="round in winners.slice(0, 2)"
      v-bind:key="round.id"
      class="flex flex-col items-center"
    >
      <p class="font-extrabold text-accent-2">Round Ended: {{ round.endTime.toDateString() }}</p>
      <p>Total Prize Pool: {{ round.total_prize }} BRO</p>
      <div class="flex flex-row space-x-[10px] pb-[10px]">
        <p>Jackpot: {{ round.jackpot }} BRO</p>
        <p>Jackpot Won ?</p>
        <p>{{ round.jackpot_won ? 'YES' : 'NO' }}</p>
      </div>
      <div
        v-for="(keys, index) in round.winners"
        v-bind:key="keys.account"
        class="flex flex-row space-x-[10px]"
      >
        <p>{{ index === 0 ? 'First Prize:' : index === 1 ? 'Second Prize:' : 'Third Prize' }}</p>
        <p>{{ shortenString(keys.account, 10) }}</p>
      </div>
    </div>
  </section>
</template>
