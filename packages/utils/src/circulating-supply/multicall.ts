import { Contract, BigNumber, ethers } from "ethers";

type TargetsArray = [string, Contract][];
type TargetArgs = (string | BigNumber | number | string[][])[];

export class Multicall {
  address: string;
  targets: {
    [key: string]: Contract;
  };
  payload: [string, string][] = [];
  config: {
    batchSize: number;
  } = {
    batchSize: 100,
  };

  constructor({ address, targets }: { address: string; targets: TargetsArray }) {
    this.address = address;
    this.targets = targets.reduce(
      (targets, _target) => ({ ...targets, [_target[0]]: _target[1], [_target[1].address]: _target[1] }),
      {},
    );
  }

  addTarget({ alias, abi, address }) {
    this.targets[alias] = new Contract(address, abi);
    return this;
  }
  push(alias: string, fn: string, args: TargetArgs) {
    const address = this.targets[alias].address;
    this.payload.push([address, this.targets[alias].interface.encodeFunctionData(fn, args)]);
    return this;
  }
  async call(provider?: ethers.providers.Provider) {
    const multi = new ethers.Contract(
      this.address,
      ["function aggregate((address, bytes)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)"],
      provider,
    );

    const batches = Math.ceil(this.payload.length / this.config.batchSize);

    console.log(`aggregating calls, (${batches} batches)`);

    const calls = Array.from({ length: batches }, (_, i) => {
      const batch = this.payload.slice(i * this.config.batchSize, (i + 1) * this.config.batchSize);
      return () => multi.aggregate(batch);
    });

    let results = [];

    for (let i = 0; i < calls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      results = [...results, await calls[i]()];
    }

    return results
      .reduce((_results, result) => [..._results, ...result[1]], [])
      .map((data, i) => {
        const target = this.targets[this.payload[i][0]];
        const fn = target.interface.getFunction(this.payload[i][1].slice(0, 10));
        return target.interface.decodeFunctionResult(fn, data);
      });
  }
}

export default Multicall;
