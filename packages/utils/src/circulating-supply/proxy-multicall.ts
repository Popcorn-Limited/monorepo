import { parseEther } from "ethers/lib/utils";
import { Contract, BigNumber, ethers } from "ethers";

type TargetsArray = [string, Contract][];
type TargetArgs = (string | BigNumber | number | string[][])[];

class ProxyMultiCall {
  proxyAddress: string;
  targets: {
    [key: string]: Contract;
  };
  payload: [string, string][] = [];

  constructor({
    proxyAddress,
    targets,
    multicallAddress,
  }: {
    proxyAddress: string;
    targets: TargetsArray;
    multicallAddress?: string;
  }) {
    this.targets = targets.reduce(
      (targets, _target) => ({ ...targets, [_target[0]]: _target[1], [_target[1].address]: _target[1] }),
      {},
    );
    this.addTarget({
      alias: "__proxy",
      address: proxyAddress,
      abi: ["function execute(address _target, bytes memory _data) public payable returns (bytes memory response)"],
    });

    this.addTarget({
      alias: "__multicall",
      address: multicallAddress || "0xcA11bde05977b3631167028862bE2a173976CA11",
      abi: [
        "function aggregate((address, bytes)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)",
      ],
    });
  }

  addTarget({ alias, abi, address }) {
    this.targets[alias] = new Contract(address, abi);
    this.targets[address] = new Contract(address, abi);
    return this;
  }

  push(alias: string, fn: string, args: TargetArgs) {
    const address = this.targets[alias].address;
    this.payload.push([address, this.targets[alias].interface.encodeFunctionData(fn, args)]);
    return this;
  }

  aggregate() {
    return this.payload;
  }

  async submit(provider: ethers.providers.Provider) {
    return this.targets["__proxy"].execute(
      this.targets["__multicall"].address,
      this.targets["__multicall"].interface.encodeFunctionData("aggregate", [this.payload]),
      provider,
    );
  }

  reset() {
    this.payload = [];
    return this;
  }
}

/**
 * usage example
 */

const abi = "add abis here";
const tx = new ProxyMultiCall({
  proxyAddress: "0x1234",
  targets: [
    ["usdc", new Contract("0x1234", abi)],
    ["usdt", new Contract("0x1234", abi)],
    ["vault", new Contract("0x1234", abi)],
    ["staking", new Contract("0x1234", abi)],
    ["curve", new Contract("0x1234", abi)],
    ["curveThreePoolToken", new Contract("0x1234", abi)],
  ],
});

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/1234");
tx.push("usdc", "transferFrom", ["0x12345", "0x12342", parseEther("100")]);
tx.push("usdt", "transferFrom", ["0x12345", "0x12342", parseEther("100")]);
tx.push("usdc", "approve", ["0x12345", parseEther("100")]);
tx.push("usdt", "approve", ["0x12345", parseEther("100")]);
tx.push("curve3pool", "add_liquidity", [parseEther("100"), parseEther("100"), 0]);
tx.push("curve3poolToken", "approve", ["vault", parseEther("100")]);
tx.push("vault", "deposit", [parseEther("100")]);
tx.push("staking", "depositFor", [parseEther("100"), "0x1234"]);
tx.submit(provider).then(console.log);
