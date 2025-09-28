<script setup>
import { ref } from "vue";
import { ethers } from "ethers";
import counterAbi from "~/abi/Counter.json";

const contractAddress = "0xf98E6cFC31D12d3DfDA439d64f93dC6C340dF07F";
const count = ref(0);

let contract;

async function initContract() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, counterAbi.abi, signer);
    count.value = (await contract.count()).toString();
  }
}

async function increment() {
  if (!contract) return;
  const tx = await contract.increment();
  await tx.wait();
  count.value = (await contract.count()).toString();
}

onMounted(initContract);
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Counter: {{ count }}</h1>
    <button @click="increment" class="px-4 py-2 bg-blue-500 text-white rounded">
      +1
    </button>
  </div>
</template>
