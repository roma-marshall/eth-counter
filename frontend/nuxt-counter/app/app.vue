<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4"
  >
    <h1 class="text-3xl font-bold">⚡ Counter dApp</h1>

    <div class="text-xl">
      Current value: <b>{{ count }}</b>
    </div>

    <div class="flex gap-4">
      <button
        @click="inc"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        +N
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ethers } from "ethers";
import Counter from "../abi/Counter.json"; // { address, abi }

const count = ref(0);
const incrementValue = ref(1);
let contract: ethers.Contract | null = null;
``;

// Sepolia chainId (hex)
const SEPOLIA_CHAIN_ID = "0xaa36a7";

async function ensureSepolia() {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });

  if (chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
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

async function initContract() {
  if (!window.ethereum) {
    alert("⚠️ Установите MetaMask");
    return;
  }

  await ensureSepolia();
  const provider = new ethers.BrowserProvider(window.ethereum);

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
}

async function inc() {
  if (!contract) return;
  const tx = await contract.inc();
  await tx.wait();
}

async function incBy() {
  if (!contract) return;
  if (incrementValue.value <= 0) {
    alert("Введите число больше нуля");
    return;
  }
  const tx = await contract.incBy(incrementValue.value);
  await tx.wait();
}

onMounted(initContract);
</script>
