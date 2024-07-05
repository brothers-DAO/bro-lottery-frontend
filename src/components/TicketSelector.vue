<script setup lang="ts">
import { useOrderStore } from '@/stores/order'
import LuckyNumbers from '@/components/LuckyNumbers.vue'

const orderStore = useOrderStore()
</script>

<template>
  <section class="w-full flex flex-col space-y-[10px]">
    <div class="flex flex-row items-center justify-evenly">
      <p class="text-black">
        {{ orderStore.order?.tickets }} {{ orderStore.order!.tickets > 1 ? 'Tickets' : 'Ticket' }}
      </p>
      <p class="text-black">
        Price: {{ (orderStore.order!.price * orderStore.order!.tickets).toLocaleString() }}
        {{ orderStore.order?.token.symbol }}
      </p>
      <div
        class="flex flex-row items-center space-x-[10px]"
        v-if="orderStore.order?.token.symbol === 'BRO'"
      >
        <button
          @click="orderStore.removeTicket()"
          class="flex bg-black rounded-full h-[50px] w-[50px] justify-center items-center"
        >
          <p class="text-white text-[36px]">-</p>
        </button>
        <button
          @click="orderStore.addTicket()"
          class="flex bg-black rounded-full h-[50px] w-[50px] justify-center items-center"
        >
          <p class="text-white text-[36px]">+</p>
        </button>
      </div>
    </div>
    <p class="text-accent-1">Choose your lucky number(s) between 0 and 9</p>
    <div class="flex flex-col space-y-[10px]">
      <LuckyNumbers
        v-for="(ticket, index) in orderStore.order?.luckyNumbers"
        v-bind:key="index"
        :ticket="ticket"
        :ind="index + 1"
      />
    </div>
  </section>
</template>
