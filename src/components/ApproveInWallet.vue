<script setup lang="ts">
import { useKadenaConnectionStore } from '@/stores/wallets'

const kadenaStore = useKadenaConnectionStore()
</script>

<template>
  <div
    v-if="kadenaStore.showApprove"
    class="absolute max-h-full top-0 left-0 w-full h-full flex justify-center items-center bg-core-darkest bg-opacity-50 backdrop-blur-md dark:text-core-light"
  >
    <section
      class="flex flex-col items-center justify-center pt-4 pb-12 px-8 space-y-[20px] rounded-lg bg-core-darkest"
    >
      <div>
        <h3
          class="flex justify-between items-baseline text-2xl font-extrabold leading-10 text-white"
        >
          Approve transaction
        </h3>
      </div>
      <img src="@/assets/load.png" spin alt="loading" class="w-[50px] h-[50px] animate-spin" />

      <div class="flex space-x-[20px]">
        <div class="font-extrabold text-white">
          <div class="flex-row">
            <div class="flex items-center space-x-[4px]">
              <p class="text-[14px]">Please open your wallet to approve the transaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
