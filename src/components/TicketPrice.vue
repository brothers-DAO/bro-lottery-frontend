<script setup lang="ts">
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()
</script>

<template>
  <div
    v-if="orderStore.order && orderStore.order.isLoading === undefined"
    class="w-full flex flex-col text-center text-black font-extrabold"
  >
    <p>Price pair does not exist</p>
    <p>Choose a different token</p>
  </div>
  <div
    v-if="orderStore.order && orderStore.order.isLoading"
    class="w-full flex flex-row items-center justify-center text-black font-extrabold space-x-[30px]"
  >
    <img src="@/assets/load.png" spin alt="loading" class="w-[20px] h-[20px] animate-spin" />
    <p>Getting Ticketprice...</p>
  </div>
  <div
    v-if="orderStore.order && orderStore.order.isLoading === false"
    class="w-full flex flex-row items-center justify-evenly text-black font-extrabold"
  >
    <p>1 TICKET</p>
    <p>=</p>
    <div class="flex flex-row items-center space-x-[10px]">
      <p>{{ orderStore.order.price.toLocaleString() }}</p>
      <img :src="orderStore.order.token.image" alt="token logo" class="w-[50px] h-[50px]" />
    </div>
  </div>
  <div v-if="orderStore.tokenBalance != undefined">
    <p
      class="font-extrabold"
      :class="orderStore.tokenBalance === 0 ? 'text-red-600' : 'text-black'"
    >
      Balance (Chain 2) : {{ orderStore.tokenBalance }} {{ orderStore.order!.token.symbol }}
    </p>
  </div>
</template>
