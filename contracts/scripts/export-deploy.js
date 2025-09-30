import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADDRESSES_PATH = path.join(
  __dirname,
  "../ignition/deployments/chain-11155111/deployed_addresses.json"
);

const FRONTEND_PATH = path.join(__dirname, "../../frontend/nuxt-counter/abi/");

const CONTRACTS = [
  {
    key: "CounterModule#Counter",
    artifact: "../artifacts/contracts/Counter.sol/Counter.json",
    output: "Counter.json",
  },
  {
    key: "CounterFactoryModule#CounterFactory",
    artifact: "../artifacts/contracts/CounterFactory.sol/CounterFactory.json",
    output: "CounterFactory.json",
  },
];

function exportDeployment() {
  const addresses = JSON.parse(fs.readFileSync(ADDRESSES_PATH, "utf8"));

  if (!fs.existsSync(FRONTEND_PATH)) {
    fs.mkdirSync(FRONTEND_PATH, { recursive: true });
  }

  CONTRACTS.forEach(({ key, artifact, output }) => {
    const address = addresses[key];
    if (!address) {
      console.warn(`⚠️ Address not found for key: ${key}`);
      return;
    }

    const artifactPath = path.join(__dirname, artifact);
    const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifactJson.abi;

    const data = { address, abi };

    fs.writeFileSync(
      path.join(FRONTEND_PATH, output),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Exported ${key} → ${output}`);
  });
}

exportDeployment();
