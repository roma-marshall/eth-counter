<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
    <h1 class="text-3xl font-bold">⚡ Counter dApp</h1>

    <div v-if="!isConnected">
      <button
          @click="connectWallet"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition cursor-pointer"
      >
        Connect Wallet
      </button>
    </div>

    <div v-else class="text-center">
      <p class="text-gray-700 mb-2">Wallet:</p>
      <p class="text-gray-700 mb-2 font-bold">{{ account }}</p>

      <div v-if="!hasContract">
        <button
            @click="deployCounter"
            class="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition cursor-pointer"
        >
          Deploy Smart Contract
        </button>
      </div>

      <div v-else>
        <div class="text-xl mb-4 font-bold">
          Current value: {{ count }}
        </div>

        <div class="flex justify-center gap-4">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ethers } from "ethers";
import Factory from "../abi/CounterFactory.json";
import Counter from "../abi/Counter.json";

const isConnected = ref(false);
const hasContract = ref(false);
const count = ref(0);
const incrementValue = ref(1);
const account = ref("");

let provider: ethers.BrowserProvider;
let signer: ethers.Signer;
let factory: ethers.Contract;
let contract: ethers.Contract | null = null;

async function connectWallet() {
  if (!(window as any).ethereum) {
    alert("⚠️ Install MetaMask");
    return;
  }

  provider = new ethers.BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  account.value = await signer.getAddress();

  factory = new ethers.Contract(Factory.address, Factory.abi, signer);

  const userCounter = await factory.getCounter(account.value);

  if (userCounter === ethers.ZeroAddress) {
    hasContract.value = false;
    contract = null;
  } else {
    hasContract.value = true;
    contract = new ethers.Contract(userCounter, Counter.abi, signer);
    const value = await contract.x();
    count.value = Number(value);

    contract.on("Increment", async () => {
      const newValue = await contract.x();
      count.value = Number(newValue);
    });
  }

  isConnected.value = true;
}

async function deployCounter() {
  if (!factory) return;
  const tx = await factory.deploy();
  await tx.wait();

  const addr = await factory.getCounter(account.value);
  contract = new ethers.Contract(addr, Counter.abi, signer);
  hasContract.value = true;
  count.value = Number(await contract.x());
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
