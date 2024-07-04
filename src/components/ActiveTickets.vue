<script setup lang="ts">
import { useKadenaConnectionStore } from '@/stores/wallets'

const wallet = useKadenaConnectionStore()

function getLuckyNrs() {
  const tickets = []
  for (let ticket in wallet.account.currentTickets) {
    tickets.push(wallet.account.currentTickets[ticket]['star-number'].int)
  }
  return tickets.join(', ')
}
</script>

<template>
  <section
    v-if="wallet.account.currentTickets"
    class="relative w-full p-[16px] rounded-lg bg-white space-y-[16px] text-[14px] h-full overflow-y-auto"
  >
    <p class="font-extrabold">
      You have {{ wallet.account.currentTickets!.length }} active
      {{ wallet.account.currentTickets!.length > 1 ? 'tickets' : 'ticket' }} for this round
    </p>
    <div class="flex flex-row justify-center space-x-[10px]">
      <p class="text-black">Lucky Numbers:</p>
      <p>{{ getLuckyNrs() }}</p>
    </div>
  </section>
</template>
