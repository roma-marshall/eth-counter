import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// путь до адресов
const ADDRESSES_PATH = path.join(
  __dirname,
  "../ignition/deployments/chain-11155111/deployed_addresses.json"
);

// путь до ABI
const ABI_PATH = path.join(
  __dirname,
  "../artifacts/contracts/Counter.sol/Counter.json"
);

// путь куда кладём для Nuxt
const FRONTEND_PATH = path.join(__dirname, "../../frontend/nuxt-counter/abi/");

function exportDeployment() {
  // читаем адрес
  const addresses = JSON.parse(fs.readFileSync(ADDRESSES_PATH, "utf8"));
  const address = addresses["CounterModule#Counter"];

  // читаем ABI
  const artifact = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));
  const abi = artifact.abi;

  // итоговый JSON
  const output = { address, abi };

  if (!fs.existsSync(FRONTEND_PATH)) {
    fs.mkdirSync(FRONTEND_PATH, { recursive: true });
  }

  fs.writeFileSync(
    path.join(FRONTEND_PATH, "Counter.json"),
    JSON.stringify(output, null, 2)
  );

  console.log(
    "✅ Exported ABI + address to frontend/nuxt-counter/abi/Counter.json"
  );
}

exportDeployment();
