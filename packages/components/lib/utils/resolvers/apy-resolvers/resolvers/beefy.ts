

import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

export const beefy = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  const vault = new Contract(address, ["function adapter() external view returns (address)"], rpc);
  const adapter = await vault.adapter();
  const adapterContract = new Contract(adapter, ["function beefyVault() external view returns (address)"], rpc);
  const beefyVault = (await adapterContract.beefyVault()).toLowerCase();
  
  const beefyVaults = await (await fetch("https://api.beefy.finance/vaults")).json();
  const apyRes = await (await fetch("https://api.beefy.finance/apy/breakdown")).json();

  const beefyVaultObj = beefyVaults.find((vault) => vault.earnContractAddress.toLowerCase() === beefyVault);
  const apy = apyRes[Object.keys(apyRes).find((key) => key === beefyVaultObj.id)];
  return { value: parseUnits(String(apy.totalApy * 100)), decimals: 18 };
};
