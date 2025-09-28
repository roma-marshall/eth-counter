<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4"
  >
    <h1 class="text-3xl font-bold">⚡ Counter dApp</h1>

    <div v-if="!isConnected" class="mt-6">
      <button
        @click="connectWallet"
        class="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition cursor-pointer"
      >
        Connect Wallet
      </button>
    </div>

    <div v-else>
      <div class="text-xl mb-4">
        Current value: <b>{{ count }}</b>
      </div>

      <div class="flex gap-4">
        <button
          @click="inc"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          +1
        </button>

        <input
          v-model.number="incrementValue"
          type="number"
          min="1"
          class="border px-3 py-2 rounded-lg w-24 text-center"
        />

        <button
          @click="incBy"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
        >
          +N
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ethers } from "ethers";
import Counter from "../abi/Counter.json"; // { address, abi }

const count = ref(0);
const incrementValue = ref(1);
const isConnected = ref(false);

let contract: ethers.Contract | null = null;

// Sepolia chainId (hex)
const SEPOLIA_CHAIN_ID = "0xaa36a7";

async function ensureSepolia() {
  const chainId = await (window as any).ethereum.request({
    method: "eth_chainId",
  });

  if (chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Ethereum Sepolia Testnet",
              rpcUrls: ["https://rpc.sepolia.org"],
              nativeCurrency: {
                name: "SepoliaETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }
}

async function connectWallet() {
  if (!(window as any).ethereum) {
    alert("⚠️ Install MetaMask");
    return;
  }

  await ensureSepolia();
  const provider = new ethers.BrowserProvider((window as any).ethereum);

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  contract = new ethers.Contract(Counter.address, Counter.abi, signer);
  const value = await contract.x();
  count.value = Number(value);

  contract.on("Increment", async (by: bigint) => {
    console.log("🔔 incremented by", by.toString());
    const newValue = await contract.x();
    count.value = Number(newValue);
  });

  isConnected.value = true;
}

async function inc() {
  if (!contract) return;
  const tx = await contract.inc();
  await tx.wait();
}

async function incBy() {
  if (!contract) return;
  if (incrementValue.value <= 0) {
    alert("Enter a number greater than zero");
    return;
  }
  const tx = await contract.incBy(incrementValue.value);
  await tx.wait();
}

onMounted(async () => {
  if ((window as any).ethereum) {
    const accounts = await (window as any).ethereum.request({
      method: "eth_accounts",
    });
    if (accounts.length > 0) {
      await connectWallet();
    }
  }
});
</script>
