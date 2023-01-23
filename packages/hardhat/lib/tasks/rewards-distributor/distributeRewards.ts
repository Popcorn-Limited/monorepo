import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import ask from "readline-sync";
import { getNamedAccountsFromNetwork } from "../../utils/getNamedAccounts";

const REWARDS_DESTINATION_MAP = {
  "0x27A9B8065Af3A678CD121A435BEA9253C53Ab428": "Butter", //eth
  "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45": "LP", // eth
  "0xeEE1d31297B042820349B03027aB3b13a9406184": "POP", // eth
  "0xe8af04AD759Ad790Aa5592f587D3cFB3ecC6A9dA": "POP", // poly
  "0xe6f315f4e0dB78185239fFFb368D6d188f6b926C": "LP", //poly
};

interface Args {
  dryRun?: boolean;
  editOnly?: boolean;
  force?: boolean;
  distributeOnly?: boolean;
  firstRun?: boolean;
  noPrompt?: boolean;
}
export default task(
  "rewards-distributor:distribute",
  "edits reward distributions for current period and invokes reward distribution"
)
  .addFlag("distributeOnly", "will only call distributeRewards function")
  .addFlag("editOnly", "will edit rewards for current period but not distribute rewards")
  .addFlag("dryRun", "will not submit any transactions")
  .addFlag("firstRun", "used when it's the first reward distribution")
  .addFlag("noPrompt", "disables confirmation prompt for distributing rewards")
  .addFlag(
    "force",
    "will force editing distribute rewards and calling distribution function regardless of rewards period"
  )
  .setAction(async (args: Args, hre) => {
    const { editOnly, dryRun, firstRun, distributeOnly, force, noPrompt } = args;
    const popLockerAddress = (await hre.deployments.get("PopLocker")).address;
    const { pop, rewardsDistribution } = getNamedAccountsFromNetwork(hre);

    const popLocker = await hre.ethers.getContractAt("PopLocker", popLockerAddress);

    const rewardsDistributionContract = await hre.ethers.getContractAt("RewardsDistribution", rewardsDistribution);

    const [butterRewards, lpRewards, popRewards] = [
      generateRewardPeriods(hre.network.name, butterTable),
      generateRewardPeriods(hre.network.name, lpTable),
      generateRewardPeriods(hre.network.name, hre.network.name !== "mainnet" ? popLockerTablePoly : popLockerTableEth),
    ];

    const rewardData = await popLocker.rewardData(pop);
    const distributions = await getDistributions(rewardsDistributionContract, hre);
    const latestBlock = await hre.ethers.provider.getBlock("latest");
    console.log({ latestTimestamp: latestBlock.timestamp });

    if (!force && rewardData.periodFinish > latestBlock.timestamp && !editOnly && !distributeOnly && !firstRun) {
      console.log("Nothing to do, exiting ...");
      process.exit();
    }

    const signer = hre.ethers.provider.getSigner();

    if (force || rewardData.periodFinish <= latestBlock.timestamp || editOnly || distributeOnly || firstRun) {
      console.log("Last period finish is in the past, editing new distributions for next reward period ...");

      const editRewardsTxs = [];
      const newRewardsData = [];
      distributions.forEach((distribution, i) => {
        const rewardType = getRewardTypeFromDestination(distribution.destination);

        console.log("getting reward table for ", rewardType);
        let period;
        switch (rewardType) {
          case "Butter":
            period = getNextRewardPeriod(latestBlock.timestamp, butterRewards, "Butter", firstRun);
            break;
          case "LP":
            period = getNextRewardPeriod(latestBlock.timestamp, lpRewards, "LP", firstRun);
            break;
          case "POP":
            period = getNextRewardPeriod(latestBlock.timestamp, popRewards, "POP", firstRun);
            break;
        }
        console.log({ period, rewardType, lastestBlockTimestamp: latestBlock.timestamp });
        const rewardData = {
          index: i,
          destination: distribution.destination,
          amount: formatEther(parseEther(period.amount.toString())),
          isLocker: distribution.isLocker,
        };
        newRewardsData.push(rewardData);

        console.log("editing rewards", { rewardData });

        if (!dryRun && !distributeOnly) {
          editRewardsTxs.push(
            rewardsDistributionContract
              .connect(signer)
              .editRewardDistribution(
                rewardData.index,
                rewardData.destination,
                parseEther(rewardData.amount),
                rewardData.isLocker
              )
          );
        }
      });

      const periodTotalRewards = newRewardsData.reduce((sum, reward) => {
        return parseEther(reward.amount).add(sum);
      }, BigNumber.from(0));

      console.log({ periodTotalRewards: formatEther(periodTotalRewards) });

      console.log("waiting for editRewardDistribution transactions ...");
      const txs = await Promise.all(editRewardsTxs);

      console.log("awaiting confirmations for edit rewards ...");
      await Promise.all(txs.map((tx) => tx.wait(2)));

      if (distributeOnly || (!dryRun && !editOnly)) {
        console.log("distributing rewards ... ");
        const yes = noPrompt
          ? true
          : ask.keyInYN(`Are you sure you want to transfer ${formatEther(periodTotalRewards)} POP rewards?`);
        if (!yes) {
          process.exit();
        }
        console.log(`distributing ${formatEther(periodTotalRewards)} POP rewards`);

        const tx = await rewardsDistributionContract.connect(signer).distributeRewards({ gasLimit: 1000000 });
        const receipt = await tx.wait(2);
        console.log({ receipt });
      } else {
        console.log("not distributing rewards");
      }
    }
  });

const getDistributions = async (rewardsDistributionContract, hre) => {
  const distributions = [0, 1];
  if (hre.network.name === "mainnet") {
    distributions.push(2);
  }
  return Promise.all(
    distributions.map((i) => {
      return rewardsDistributionContract.distributions(i);
    })
  );
};

const getRewardTypeFromDestination = (address) => {
  return getLowerCaseMap()[address.toLowerCase()];
};
const getLowerCaseMap = () => {
  const map = REWARDS_DESTINATION_MAP;
  let lowerCaseMap = {};
  Object.keys(map).map((key) => {
    lowerCaseMap[key.toLowerCase()] = map[key];
  });
  return lowerCaseMap;
};

const getNextRewardPeriod = (timeNow: number, periodTable, type: string, firstRun) => {
  let nextRewardPeriod = 0;
  let i = 0;
  let amount = 0;
  const periods = Object.keys(periodTable);
  if (firstRun) {
    nextRewardPeriod = Number(periods[0]);
    amount = periodTable[nextRewardPeriod];
    return {
      nextRewardPeriod,
      amount,
      type,
    };
  }
  while (nextRewardPeriod == 0 && i < periods.length) {
    if (Number(periods[i]) > timeNow) {
      nextRewardPeriod = Number(periods[i]);
      amount = periodTable[nextRewardPeriod];
      break;
    }
    i++;
  }
  if (!amount) {
    throw new Error("Can't find reward period");
  }
  return { nextRewardPeriod, amount, type };
};

const generateRewardPeriods = (network, table) => {
  const duration = 604800;
  let lastRewardFinish;
  if (network == "mainnet") {
    lastRewardFinish = 1644516983;
  } else {
    lastRewardFinish = 1644516470;
  }

  let periods = {};
  for (let i = 0; i < 25; i++) {
    let nextPeriod;
    if (i === 0) {
      nextPeriod = lastRewardFinish;
    } else {
      nextPeriod = lastRewardFinish + duration;
    }

    periods[nextPeriod] = table[i];
    lastRewardFinish = nextPeriod;
  }
  return periods;
};

export const butterTable = [
  49846.15385, 47852.30769, 45858.46154, 43864.61538, 41870.76923, 39876.92308, 37883.07692, 35889.23077, 33895.38462,
  31901.53846, 29907.69231, 27913.84615, 25920, 23926.15385, 21932.30769, 19938.46154, 17944.61538, 15950.76923,
  13956.92308, 11963.07692, 9969.230769, 7975.384615, 5981.538462, 3987.692308, 1993.846154,
];

export const popLockerTablePoly = [
  27692.30769, 26584.61538, 25476.92308, 24369.23077, 23261.53846, 22153.84615, 21046.15385, 19938.46154, 18830.76923,
  17723.07692, 16615.38462, 15507.69231, 14400, 13292.30769, 12184.61538, 11076.92308, 9969.230769, 8861.538462,
  7753.846154, 6646.153846, 5538.461538, 4430.769231, 3323.076923, 2215.384615, 1107.692308,
];

export const popLockerTableEth = [
  27692.30769, 26584.61538, 25476.92308, 24369.23077, 23261.53846, 22153.84615, 21046.15385, 19938.46154, 18830.76923,
  17723.07692, 16615.38462, 15507.69231, 14400, 13292.30769, 12184.61538, 11076.92308, 9969.230769, 8861.538462,
  7753.846154, 6646.153846, 5538.461538, 4430.769231, 3323.076923, 2215.384615, 1107.692308,
];

export const lpTable = [
  16615.38, 15950.77, 15286.15, 14621.54, 13956.92, 13292.31, 12627.69, 11963.08, 11298.46, 10633.85, 9969.23, 9304.62,
  8640.0, 7975.38, 7310.77, 6646.15, 5981.54, 5316.92, 4652.31, 3987.69, 3323.08, 2658.46, 1993.85, 1329.23, 664.62,
];
