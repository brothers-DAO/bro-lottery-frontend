<script setup lang="ts">
import { tokenList } from '@/config'
import { useOrderStore } from '@/stores/order'
import TokenDropdownListItem from '@/components/TokenDropDownListItem.vue'
import { ref } from 'vue'

const dropdownOpen = ref(false)
const orderStore = useOrderStore()
</script>

<template>
  <div v-if="orderStore.order" class="w-full flex flex-row items-center text-black">
    <p class="w-full">I want to buy tickets with:</p>
    <div class="relative w-full">
      <div
        class="w-full flex items-center bg-white border-2 border-black p-[10px] max-h-[52px] justify-between"
        :class="dropdownOpen ? 'rounded-t-lg' : 'rounded-lg'"
        @click="dropdownOpen = !dropdownOpen"
      >
        <div class="flex flex-row items-center space-x-[10px]">
          <img class="h-[32] w-[32px]" :src="orderStore.order.token.image" />
          <p>{{ orderStore.order.token.symbol }}</p>
        </div>
        <img class="h-[32] w-[32px]" src="@/assets/arrow_down.png" />
      </div>
      <div
        v-if="dropdownOpen"
        class="absolute bg-white w-full h-40 border-2 border-gray-700 border-t-0 rounded-b-lg overflow-auto z-10"
      >
        <ul class="divide-y divide-grey-100 text-sm text-gray-700">
          <TokenDropdownListItem
            v-for="token in tokenList"
            v-bind:key="token.id"
            :token="token"
            @click="dropdownOpen = false"
          />
        </ul>
      </div>
    </div>
  </div>
</template>
