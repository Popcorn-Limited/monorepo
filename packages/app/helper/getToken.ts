import { ERC20 } from "@popcorn/hardhat/typechain";
import { constants } from "ethers/lib/ethers";
import { ERC20__factory } from "@popcorn/hardhat/typechain/factories/ERC20__factory";
import { Token } from "@popcorn/utils/types";

export default async function getToken(
  erc20: ERC20,
  provider,
  chainId: number,
  account?: string,
  spender?: string,
  metadata?: any,
): Promise<Token> {
  // OVERRIDE METADATA WHERE NEEDED.
  if (erc20.address === constants.AddressZero || erc20.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    return {
      contract: erc20,
      address: erc20.address, // Should we force this address to be smth specific like 0x000 | 0xEeee | ETH ?
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      balance: account ? await provider.getBalance(account) : constants.Zero,
      allowance: constants.MaxUint256,
      icon: "/images/tokens/eth.png",
      ...metadata,
    };
  }
  return {
    contract: erc20,
    address: erc20.address,
    name: await erc20.name(),
    symbol: await erc20.symbol(),
    decimals: await erc20.decimals(),
    balance: account ? await erc20.balanceOf(account) : constants.Zero,
    allowance: account && spender ? await erc20.allowance(account, spender) : constants.Zero,
    icon: metadata?.icons?.length > 0 ? metadata.icons[0] : "/images/blackCircle.svg",
    ...metadata,
  };
}

export const getTokenFromAddress = async (
  address: string,
  provider,
  chainId: number,
  account?: string,
  spender?: string,
): Promise<Token> => {
  return getToken(ERC20__factory.connect(address, provider), provider, chainId, account, spender);
};

export async function getMultipleToken(
  multipleErc20: ERC20[],
  provider,
  chainId: number,
  account?: string,
  spender?: string,
): Promise<Token[]> {
  return Promise.all(multipleErc20.map(async (erc20) => await getToken(erc20, provider, chainId, account, spender)));
}
