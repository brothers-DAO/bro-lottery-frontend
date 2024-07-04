<script setup lang="ts">
import { shortenString } from '@/functions/stringUtils'
import { copyToClipboard } from '@/functions/utils'
import { useTxStore } from '@/stores/transactions'

const transactions = useTxStore()
</script>

<template>
  <section
    class="w-full p-[16px] rounded-lg bg-white space-y-[16px] text-[14px]"
    v-if="transactions.transactions.length > 0"
  >
    <div>
      <p class="font-extrabold">
        You have {{ transactions.transactions.length }} pending
        {{ transactions!.transactions.length > 1 ? 'transactions' : 'transaction' }}
      </p>
      <div
        v-for="tx in transactions.transactions"
        v-bind:key="tx"
        class="text-black flex flex-row space-x-[10px] items-center justify-center"
        @click="copyToClipboard(tx)"
      >
        <img src="@/assets/load.png" spin alt="loading" class="w-[20px] h-[20px] animate-spin" />
        <p>{{ shortenString(tx, 10) }}</p>
      </div>
    </div>
  </section>
</template>
