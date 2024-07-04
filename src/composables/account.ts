import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { type Account as KadenaAccount } from '@/types/kadena'
import { useKadenaConnectionStore } from '@/stores/wallets'

interface Account {
  address: KadenaAccount
  isConnected: boolean
}

export function useAccount() {
  const account = ref<Account | undefined>()
  const kadenaStore = useKadenaConnectionStore()
  const { account: kadenaAccount } = storeToRefs(kadenaStore)
  watch(
    kadenaAccount,
    (newKadenaAccount) => {
      account.value = {
        // @ts-ignore
        address: newKadenaAccount.address,
        // @ts-ignore
        isConnected: newKadenaAccount.isConnected
      }
    },
    { immediate: true }
  )

  function toggleModal() {
    kadenaStore.toggleModal()
  }

  return { account, toggleModal }
}
