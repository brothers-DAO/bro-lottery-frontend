<script setup lang="ts">
import { useLotteryStore } from '@/stores/lottery'
import { useKadenaConnectionStore } from '@/stores/wallets'
import CustomButton from '@/components/CustomButton.vue'
import CountDown from '@/components/CountDown.vue'
import AvailableTickets from '@/components/AvailableTickets.vue'
import TicketPrice from '@/components/TicketPrice.vue'
import TokenSelector from '@/components/TokenSelector.vue'
import TicketSelector from '@/components/TicketSelector.vue'
import { useOrderStore } from '@/stores/order'

const account = useKadenaConnectionStore()
const lottery = useLotteryStore()
const orderStore = useOrderStore()
</script>

<template>
  <section class="w-full p-[16px] rounded-lg bg-white space-y-[16px] text-white text-[14px]">
    <CountDown
      v-if="lottery.currentRound"
      :timeStart="Date.now()"
      :timeEnd="lottery.currentRound.endTime.getTime()"
    />
    <AvailableTickets
      :tickets="lottery.currentRound.tickets"
      :limit="lottery.currentRound.limit"
      v-if="lottery.currentRound"
    />

    <TokenSelector />
    <TicketPrice />
    <TicketSelector v-if="orderStore.order?.isLoading != undefined" />
    <div v-if="orderStore.order?.isLoading != undefined || orderStore.order?.isLoading">
      <div v-if="account.account.isConnected">
        <CustomButton
          :title="orderStore.order!.tickets > 1 ? 'Buy Tickets' : 'Buy Ticket'"
          @click="orderStore.buyTickets()"
        />
      </div>
      <div v-else @click="account.toggleModal()">
        <CustomButton :title="'Connect Wallet'" />
      </div>
    </div>
  </section>
</template>
