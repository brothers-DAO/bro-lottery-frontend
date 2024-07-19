import { ref } from 'vue'
import { defineStore } from 'pinia'
import { poll } from '@/functions/pactUtils'
import { useKadenaConnectionStore } from './wallets'

export const useTxStore = defineStore('transactions', () => {
  const transactions = ref<Array<string>>([])

  function init() {
    const storedTXS = window.localStorage.getItem('transactions')
    if (storedTXS) {
      transactions.value = JSON.parse(storedTXS)
    }
    if (transactions.value.length > 0) {
      checkPending()
    }
  }

  function addTransaction(reqKey: string) {
    transactions.value.push(reqKey)
    window.localStorage.setItem('transactions', JSON.stringify(transactions.value))
    checkPending()
  }

  function removeTransaction(tx: string) {
    const newTXS = transactions.value.filter((t) => t !== tx)
    transactions.value = newTXS
    window.localStorage.setItem('transactions', JSON.stringify(transactions.value))
  }

  async function checkPending() {
    while (transactions.value.length > 0) {
      const res = await poll(transactions.value)
      if (Object.keys(res).length != 0) {
        for (const i in res) {
          if (res[i].result.error) {
            alert(`Transaction ${i} failed! Reason: ${res[i].result.error.message}`)
          } else {
            alert(
              `Transaction ${i} has been mined! Result: ${res[i].result.status}, ${res[i].result.data}`
            )
          }
          const newTXS = transactions.value.filter((t) => t !== i)
          transactions.value = newTXS
          window.localStorage.setItem('transactions', JSON.stringify(transactions.value))
        }
        useKadenaConnectionStore().getCurrentTickets()
      }
      await new Promise((r) => setTimeout(r, 10000))
    }
  }

  return { transactions, addTransaction, removeTransaction, init }
})
