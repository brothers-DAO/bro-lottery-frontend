<script setup lang="ts">
import { useKadenaConnectionStore } from '@/stores/wallets'
import { useAccount } from '@/composables/account'
import ConnectWallet from './ConnectWallet.vue'

const kadenaStore = useKadenaConnectionStore()

function isConnected(): boolean {
  const { account } = useAccount()
  return account.value?.isConnected || false
}
</script>

<template>
  <div
    v-if="kadenaStore.showModal"
    class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-core-darkest bg-opacity-50 backdrop-blur-md dark:text-core-light"
  >
    <section class="pt-4 pb-12 px-8 space-y-[20px] rounded-lg bg-core-darkest">
      <div>
        <h3
          class="flex justify-between items-baseline text-2xl font-extrabold leading-10 text-white"
        >
          {{ isConnected() ? 'Wallet Connected' : 'Connect Wallet' }}
        </h3>
        <div class="text-start text-white opacity-75" v-if="!isConnected()">
          <p>Select the wallet you want to connect with.</p>
        </div>
      </div>

      <div class="flex space-x-[20px]">
        <div class="font-extrabold text-white">
          <div class="flex-row">
            <div class="flex items-center space-x-[4px]"></div>
          </div>
        </div>
      </div>
      <ConnectWallet />
    </section>
  </div>
</template>
