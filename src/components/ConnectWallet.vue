<script setup lang="ts">
// import { useWCKadenaStore } from '@/stores/wallets/walletconnect'
import { useEckoWalletStore } from '@/stores/wallets/eckowallet'
import { useLinxWalletStore } from '@/stores/wallets/linx'
import CustomButton from './CustomButton.vue'
import { useAccount } from '@/composables/account'
import { useKadenaConnectionStore } from '@/stores/wallets'
import { ref } from 'vue'
import { shortenString } from '@/functions/stringUtils'

const { account } = useAccount()
const kadenaStore = useKadenaConnectionStore()

// const wcKadena = useWCKadenaStore()
const ecko = useEckoWalletStore()
const linx = useLinxWalletStore()

const isLoading = ref(false)

const linxIsAvailable = (...args: any) => {
  try {
    window.flutter_inappwebview.callHandler('LinxWallet', ...args)
    return true
  } catch (error) {
    // Linx Not Available
    return false
  }
}

// const connectWCKadena = async () => {
//   isLoading.value = true
//   const connected = await wcKadena.connect()
//   if (connected) {
//     isLoading.value = false
//   }
//   kadenaStore.toggleModal()
// }

const connectEcko = async () => {
  isLoading.value = true
  const eckocConnected = await ecko.connect()
  if (eckocConnected) {
    isLoading.value = false
  }
  kadenaStore.toggleModal()
}

const connectLinxWallet = async () => {
  isLoading.value = true
  await linx.connect()
  isLoading.value = false
  kadenaStore.toggleModal()
}

const logout = async () => {
  await kadenaStore.disconnect()
  kadenaStore.toggleModal()
}
</script>

<template>
  <div v-if="!account?.isConnected">
    <div class="flex flex-col gap-4 mt-8">
      <!-- <div @click="connectWCKadena" class="p-4 rounded shadow bg-menu hover:bg-core">
        <img class="inline w-8 h-8 mr-4" src="@/assets/wcLogo.png" />
        <span class="font-extrabold text-white dark:text-white">WalletConnect</span>
      </div> -->
      <div
        v-if="ecko.isAvailable()"
        @click="connectEcko"
        class="p-4 rounded shadow bg-menu hover:bg-core"
      >
        <img class="inline w-8 h-8 mr-4" src="@/assets/ecko-c6f15382.png" />
        <span class="font-extrabold text-white">Ecko Wallet</span>
      </div>
      <div
        v-if="linxIsAvailable()"
        @click="connectLinxWallet"
        class="p-4 rounded shadow bg-menu hover:bg-core"
      >
        <img class="inline w-8 h-8 mr-4" src="../../assets/linx.png" />
        <span class="font-extrabold text-white">Linx Wallet</span>
      </div>
    </div>
    <div @click="kadenaStore.toggleModal()" class="flex items-center justify-center pt-[30px]">
      <CustomButton title="Close" />
    </div>
  </div>
  <div v-else class="space-y-[30px]">
    <div class="space-y-[12px]">
      <p class="text-white">Connected account: {{ shortenString(account.address, 12) }}</p>
      <p class="text-white">Connected wallet: {{ kadenaStore.wallet }}</p>
    </div>
    <p class="text-white">Do you want to logout?</p>
    <div @click="logout()">
      <CustomButton title="Logout" />
    </div>
  </div>
</template>
