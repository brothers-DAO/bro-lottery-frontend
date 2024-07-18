import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLocalData } from '@/functions/pactUtils'
import { nameSpace } from '@/config'

export interface LotteryRound {
  limit: number
  tickets: number
  price_bro: number
  price_kda?: number
  jackpot?: number
  startTime: Date
  endTime: Date
  roundID: string
}

export interface RoundWinners {
  id: string
  endTime: Date
  total_prize: number
  jackpot: number
  jackpot_won: boolean
  winners: Array<Winners>
}

interface Winners {
  account: string
}

export const useLotteryStore = defineStore('lottery', () => {
  const isActive = ref<boolean | undefined>(undefined)
  const currentRound = ref<LotteryRound | undefined>(undefined)

  async function init() {
    await getSaleState()
    await getRound()
    getTicketPriceInKDA()
  }

  async function getTicketPriceInKDA() {
    try {
      const req = await getLocalData(`(${nameSpace}.bro-lottery-helpers.ticket-price-in-kda)`)
      if (req && currentRound.value) {
        currentRound.value.price_kda = req.decimal?parseFloat(req.decimal):req;
      }
    } catch (error) {
      alert(`Error getting ticket price in KDA: ${error}`)
    }
  }

  async function getSaleState() {
    try {
      const req = await getLocalData(`(${nameSpace}.bro-lottery-helpers.tickets-for-sale)`)
      isActive.value = req
    } catch (error) {
      alert(`Error getting ticket price in BRO: ${error}`)
    }
  }

  async function getRound() {
    try {
      // First check if there is a current round active
      if (isActive.value) {
        const req = await getLocalData(`(${nameSpace}.bro-lottery.current-round)`)
        const jackpot = await getLocalData(`(${nameSpace}.bro-lottery.jackpot-balance)`)
        currentRound.value = {
          limit: req['tickets-limit'].int,
          tickets: req['tickets-count'].int,
          price_bro: req['ticket-price'],
          jackpot: jackpot * 0.8,
          startTime: new Date(req['start-time'].timep),
          endTime: new Date(req['end-time'].time),
          roundID: req.id
        }
      }
    } catch (error) {
      alert(`Error getting round data: ${error}`)
    }
  }

  async function getLatestRounds() {
    const rounds: Array<RoundWinners> = []
    const req = (await getLocalData(`(${nameSpace}.bro-lottery.get-all-rounds)`)) as Array<any>
    for (const i in req.slice(0, 4)) {
      const req1 = await getLocalData(`(${nameSpace}.bro-lottery.get-result "${req[i].id}")`)
      const req2 = await getLocalData(
        `(map (${nameSpace}.bro-lottery.get-ticket "${req[i].id}") (at 'winning-tickets (${nameSpace}.bro-lottery.get-result "${req[i].id}")))`
      )
      if (Array.isArray(req2)) {
        rounds.push({
          id: req[i].id,
          endTime: new Date(req[i]['end-time'].time),
          total_prize: req1['final-round-bal'] || 0,
          jackpot: req1['final-jackpot-bal'] || 0,
          jackpot_won: req1['jackpot-won'],
          winners: req2
        })
      }
    }
    return rounds
  }

  return { isActive, currentRound, init, getLatestRounds }
})
