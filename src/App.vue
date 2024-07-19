<script setup lang="ts">
import { useLotteryStore } from '@/stores/lottery'
import { useKadenaConnectionStore, Wallets } from '@/stores/wallets'
import SelectWallet from '@/components/SelectWallet.vue'
import BuyTicket from '@/components/BuyTicket.vue'
import NoActiveLottery from '@/components/NoActiveLottery.vue'
import { useOrderStore } from './stores/order'
import ActiveTickets from './components/ActiveTickets.vue'
import PendingTransactions from './components/PendingTransactions.vue'
import LatestWinners from './components/LatestWinners.vue'
import { shortenString } from './functions/stringUtils'
import CustomButton from './components/CustomButton.vue'
import { openInNewTab } from './functions/utils'
import Jackpot from '@/components/JackPot.vue'
import { Buffer } from 'buffer'
import process from 'process'

window.Buffer = Buffer
window.process = process

const lotteryStore = useLotteryStore()
lotteryStore.init()
useOrderStore().initOrder()

const account = useKadenaConnectionStore()

function moveInToView() {
  const element = document.getElementById('main')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="max-h-full relative w-full">
    <div class="w-full bg-black mb-auto text-center text-[48px] lg:space-y-[30px] space-y-[16px]">
      <video
        v-if="account.wallet != Wallets.LinxWallet"
        src="@/assets/SuperLottoBRO.mp4"
        autoplay
        muted
        playsinline
        @ended="moveInToView()"
        class="w-full"
      ></video>
      <img v-else src="@/assets/bro_lottery.jpg" alt="" />

      <div id="main" class="w-full p-[30px] space-y-[30px]">
        <div
          class="width-full flex flex-col lg:grid lg:grid-cols-2 gap-2 lg:space-x-[16px] space-y-[16px] lg:space-y-0"
        >
          <NoActiveLottery v-if="lotteryStore.isActive === false" />
          <Jackpot :class="'lg:hidden'" />
          <BuyTicket v-if="lotteryStore.currentRound" />
          <div
            v-if="lotteryStore.isActive && !lotteryStore.currentRound"
            class="w-full flex flex-col items-center justify-center p-[16px] rounded-lg bg-white space-y-[16px] text-black text-[20px]"
          >
            <img
              src="@/assets/load.png"
              spin
              alt="loading"
              class="w-[20px] h-[20px] animate-spin"
            />
            <p>Loading BRO Lottery Round</p>
          </div>
          <div class="flex flex-col space-y-[30px]">
            <Jackpot :class="'hidden lg:flex'" />
            <ActiveTickets />
            <PendingTransactions />
            <LatestWinners />
          </div>
        </div>
      </div>
      <div v-if="account.account.isConnected" class="flex flex-col items-center">
        <p class="text-white text-[12px]" v-if="account.account.isConnected">
          Connected with: {{ shortenString(account.account.address!, 10) }}
        </p>
        <CustomButton :title="'Logout'" @click="account.toggleModal()" />
      </div>
      <div
        class="w-full bg-black flex flex-row justify-center items-center space-x-[10px] py-[30px]"
      >
        <p class="text-white text-[14px]">Brothers DAO</p>
        <img
          src="@/assets/gh.png"
          alt="github"
          class="w-[25px] h-[22px] bg-white rounded-full object-cover"
          @click="openInNewTab('https://github.com/brothers-DAO')"
        />
      </div>
    </div>
    <SelectWallet />
  </div>
</template>
