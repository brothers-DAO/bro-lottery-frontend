<script setup lang="ts">
import type { kadenaToken } from '@/config'
import { useOrderStore } from '@/stores/order'

const props = defineProps<{
  token: kadenaToken
}>()

const orderStore = useOrderStore()
</script>

<template>
  <div
    class="flex flex-row w-full items-center justify-between py-[14px] px-[19px] cursor-pointer hover:bg-core"
    @click="orderStore.setNewToken(token.symbol, token.contract)"
  >
    <div class="flex flex-row items-center space-x-[10px]">
      <img :src="token.image" class="w-[32px] h-[32px] rounded-full" />
      <div class="flex flex-col">
        <p class="text-[14px] text-core-darkest font-extrabold">{{ props.token.symbol }}</p>
      </div>
    </div>
  </div>
</template>
