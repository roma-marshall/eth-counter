import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CounterFactoryModule", (m) => {
    const factory = m.contract("CounterFactory");

    return { factory };
});
