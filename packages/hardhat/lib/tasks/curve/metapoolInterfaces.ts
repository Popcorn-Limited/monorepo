import "@popcorn/utils/src/envLoader";
import axios from "axios";
import fs from "fs";
import { task } from "hardhat/config";
import Web3 from "web3";

const INFURA_MAINNET_ENDPOINT: string = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
const web3 = new Web3(INFURA_MAINNET_ENDPOINT);

function delay(miliseconds: number): Promise<any> {
  return new Promise(function (resolve) {
    setTimeout(resolve, miliseconds);
  });
}

async function abiGetter(contractAddress: string): Promise<any> {
  const response = await axios.get(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  console.log("Wait for 0.2 seconds to not get rate limited!");
  await delay(200);
  return JSON.parse(response.data.result);
}

// let calcWithdrawOneCoinABI = JSON.parse('[{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]}]')
// let calcWithdrawOneCoin2ABI = JSON.parse('[{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_previous","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]}]')
// let justGimmeTheDarnNameABI = JSON.parse('[{"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}],"gas":13488}]')
let gimmeNameAndSecondCoinABI = JSON.parse(
  '[{"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}],"gas":13488},{"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}],"gas":3093}]'
);

async function getCurveMetapoolInfo(safeToFile: boolean) {
  // let provider = await ethers.getDefaultProvider(INFURA_API_KEY)
  // console.log(provider)
  let curveMetapoolRegistry = "0xB9fC157394Af804a3578134A6585C0dc9cc990d4";
  let curveRegistryContractAddress = "0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5";
  let curveMetapoolRegistryABI = await abiGetter(curveMetapoolRegistry);
  let curveRegistryABI = await abiGetter(curveRegistryContractAddress);
  const web3CurveMetapoolRegistry = new web3.eth.Contract(curveMetapoolRegistryABI, curveMetapoolRegistry);
  const web3CurveRegistry = new web3.eth.Contract(curveRegistryABI, curveRegistryContractAddress);
  let numberOfMetapools = await web3CurveMetapoolRegistry.methods.pool_count().call();
  // console.log(`There are ${numberOfMetapools} metapools.`)
  let pools = new Array();
  let calcWithdrawOneCoinMessage = "";
  for (let i = 0; i < numberOfMetapools; i++) {
    let poolAddress = await web3CurveMetapoolRegistry.methods.pool_list(i).call();
    let poolNameAndCoinContractInterface = new web3.eth.Contract(gimmeNameAndSecondCoinABI, poolAddress);
    let poolNameAccordingToRegistry = await web3CurveRegistry.methods.get_pool_name(poolAddress).call();
    let poolTokenName = await poolNameAndCoinContractInterface.methods.name().call();
    let poolSecondTokenAddress = await poolNameAndCoinContractInterface.methods.coins(1).call();
    let poolSecondTokenNameInterface = new web3.eth.Contract(gimmeNameAndSecondCoinABI, poolSecondTokenAddress);
    let poolSecondTokenName = await poolSecondTokenNameInterface.methods.name().call();
    let poolTokenAddress = await web3CurveRegistry.methods.get_lp_token(poolAddress).call();
    // let poolCalcWithdrawOneInterface = new web3.eth.Contract(calcWithdrawOneCoinABI, poolTokenAddress)
    let poolAddressEqualsPoolTokenAddress = poolAddress == poolTokenAddress;
    let calcWithdrawOneCoinExists = false;
    try {
      let poolTokenABI = await abiGetter(poolAddress);
      calcWithdrawOneCoinMessage = "Etherscan ABI request worked.";
      for (let j = 0; j < poolTokenABI.length; j++) {
        if (poolTokenABI[j].name == "calc_withdraw_one_coin") {
          calcWithdrawOneCoinExists = true;
          break;
        }
      }
    } catch (err) {
      calcWithdrawOneCoinMessage = err.toString();
    }

    let isMetapoolAccordingToRegistry = await web3CurveRegistry.methods.is_meta(poolAddress).call();
    let index = i;
    let poolData = {
      poolAddress,
      poolNameAccordingToRegistry,
      poolTokenName,
      poolTokenAddress,
      poolSecondTokenName,
      isMetapoolAccordingToRegistry,
      poolAddressEqualsPoolTokenAddress,
      calcWithdrawOneCoinExists,
      calcWithdrawOneCoinMessage,
      index,
    };
    pools.push(poolData);
    console.log(poolData);
  }
  if (safeToFile) {
    fs.writeFile("../MetaPoolInfo.json", JSON.stringify(pools, null, 2), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("JSON saved");
      }
    });
  }

  return pools;
}

export default task("curve:metapool-interfaces", "get all curve metapool interfaces and save them to a file")
  // .addParam("safe", "a boolean flag that indicates whether the file should be saved.")
  .setAction(async (hre) => {
    await getCurveMetapoolInfo(true);
  });
