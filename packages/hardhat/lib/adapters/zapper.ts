import { AxiosStatic } from "axios";
import { BigNumber, ethers, constants, utils } from "ethers";
import { ERC20, Vault } from "../../typechain";
import { VaultsV1Zapper } from "../../typechain/VaultsV1Zapper";
import erc20abi from "../external/erc20/abi.json";

const TRI_CRYPTO_POOL_ADDRESS = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDT_DECIMALS = 6;

interface Token {
  address: string;
  decimals: number;
}

export class Zapper {
  private crvRegistryAddress = "0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5";
  private ethAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  private swapTarget = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";
  private endpoint = "https://api.0x.org/swap/v1/quote";

  constructor(private client: AxiosStatic, public zapper: VaultsV1Zapper) { }

  public async zapIn(
    from: Token,
    vault: Vault,
    stableSwapAddress: string,
    fromAmount: BigNumber,
    slippagePercentage: number,
    stake: boolean
  ): Promise<any> {
    const vaultAsset = await vault.asset();

    let buyToken = from;
    let swapData = "0x";
    let swapTarget = this.swapTarget;

    if (stableSwapAddress.toLowerCase() === constants.AddressZero.toLowerCase()) {
      ({ buyToken, swapData } = await this.getDataForSwapZapIn(
        buyToken,
        vaultAsset,
        vault,
        from,
        fromAmount,
        slippagePercentage,
        swapData
      ));
    } else if (stableSwapAddress.toLowerCase() === WETH.toLowerCase()) {
      buyToken = { address: WETH, decimals: 18 };
      swapTarget = WETH;
    } else {
      ({ buyToken, swapData } = await this.getDataForCurveZapIn(
        stableSwapAddress,
        vault,
        from,
        buyToken,
        fromAmount,
        slippagePercentage,
        swapData
      ));
    }

    return this.zapper.zapIn(
      from.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? constants.AddressZero : from.address,
      buyToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? constants.AddressZero : buyToken.address,
      stableSwapAddress,
      vaultAsset,
      fromAmount,
      0,
      swapTarget,
      swapData,
      stake,
      { value: from.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? fromAmount : 0 }
    );
  }

  public async zapOut(
    to: Token,
    vault: Vault,
    stableSwapAddress: string,
    sellAmount: BigNumber,
    slippagePercentage: number,
    unstake: boolean
  ) {
    const vaultAsset = await vault.asset();

    let sellToken = to;
    let swapData = "0x";
    let swapTarget = this.swapTarget;

    if (stableSwapAddress.toLowerCase() === constants.AddressZero.toLowerCase()) {
      ({ sellToken, swapData } = await this.getDataForSwapZapOut(
        sellToken,
        vaultAsset,
        vault,
        sellAmount,
        to,
        slippagePercentage,
        swapData
      ));
    } else if (stableSwapAddress.toLowerCase() === WETH.toLowerCase()) {
      sellToken = { address: WETH, decimals: 18 };
      swapTarget = WETH;
    } else {
      ({ sellToken, swapData } = await this.getDataForCurveZapOut(
        stableSwapAddress,
        vault,
        to,
        sellToken,
        vaultAsset,
        sellAmount,
        swapData,
        slippagePercentage
      ));
    }

    return this.zapper.zapOut(
      vaultAsset,
      stableSwapAddress,
      sellAmount,
      sellToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? constants.AddressZero : sellToken.address,
      to.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? constants.AddressZero : to.address,
      0,
      swapTarget,
      swapData,
      unstake
    );
  }

  private async getDataForCurveZapIn(
    stableSwapAddress: string,
    vault: Vault,
    from: Token,
    buyToken: Token,
    fromAmount: BigNumber,
    slippagePercentage: number,
    swapData: string
  ) {
    const coins = await this.getCoins(stableSwapAddress, vault.provider);

    if (!coins.map((coin) => coin.address).includes(from.address)) {
      buyToken = (await this.getIntermediateToken(stableSwapAddress, coins)).token;
      const quote = await (await this.getQuote(from, fromAmount, buyToken, slippagePercentage)).data;
      swapData = quote.data;
    }
    return { buyToken, swapData };
  }
  private async getDataForCurveZapOut(
    stableSwapAddress: string,
    vault: Vault,
    to: Token,
    sellToken: Token,
    vaultAsset: string,
    sellAmount: BigNumber,
    swapData: string,
    slippagePercentage: number
  ) {
    const coins = await this.getCoins(stableSwapAddress, vault.provider);

    if (!coins.map((coin) => coin.address).includes(to.address)) {
      const { token, i } = await this.getIntermediateToken(stableSwapAddress, coins, true);
      sellToken = token;
      const swapAmount = await this.getSwapAmountCurveZapper(vaultAsset, stableSwapAddress, sellAmount, i);
      swapData = await (await this.getQuote(sellToken, swapAmount, to, slippagePercentage)).data.data;
    }
    return { sellToken, swapData };
  }
  private async getDataForSwapZapOut(
    sellToken: Token,
    vaultAsset: string,
    vault: Vault,
    sellAmount: BigNumber,
    to: Token,
    slippagePercentage: number,
    swapData: string
  ) {
    const swapAmount = await this.getSwapAmountSwapZapper(vault, sellAmount, vaultAsset);
    // Vault inherits the decimals of it's asset so it can be used here
    sellToken = { address: vaultAsset, decimals: await vault.decimals() };
    const quote = await (await this.getQuote(sellToken, swapAmount, to, slippagePercentage)).data;
    swapData = quote.data;
    return { sellToken, swapData };
  }
  private async getDataForSwapZapIn(
    buyToken: Token,
    vaultAsset: string,
    vault: Vault,
    from: Token,
    fromAmount: BigNumber,
    slippagePercentage: number,
    swapData: string
  ) {
    // Vault inherits the decimals of it's asset so it can be used here
    buyToken = { address: vaultAsset, decimals: await vault.decimals() };
    const quote = await (await this.getQuote(from, fromAmount, buyToken, slippagePercentage)).data;
    swapData = quote.data;
    return { buyToken, swapData };
  }

  private async getSwapAmountSwapZapper(vault: Vault, sellAmount: BigNumber, vaultAsset: string) {
    const redeemedAssets = await vault.previewRedeem(sellAmount);
    return this.zapper.previewRedeemFees(vaultAsset, redeemedAssets);
  }
  private async getSwapAmountCurveZapper(
    curveLPAddress: string,
    stableSwapAddress: string,
    sellAmount: BigNumber,
    i: number
  ) {
    let swapAmount;
    let error;
    try {
      swapAmount = await this.zapper["previewZapOutTokenAmount(address,address,uint256,int128)"](
        curveLPAddress,
        stableSwapAddress,
        sellAmount,
        i
      );
    } catch (e) {
      error = e;
    }
    if (!swapAmount) {
      try {
        swapAmount = await this.zapper["previewZapOutTokenAmount(address,address,uint256,uint256)"](
          curveLPAddress,
          stableSwapAddress,
          sellAmount,
          i
        );
      } catch (e) {
        error = e;
      }
    }
    if (!swapAmount && error) {
      throw error;
    }
    return swapAmount;
  }

  public constructSwapUrl(
    buyToken: Token,
    sellToken: Token,
    sellAmount: BigNumber,
    slippagePercentage: number
  ): string {
    return `${this.endpoint}?buyToken=${buyToken.address.toLowerCase() === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase()
        ? "ETH"
        : buyToken.address
      }&sellToken=${sellToken.address.toLowerCase() === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase()
        ? "ETH"
        : sellToken.address
      }&sellAmount=${sellAmount.toString()}&slippagePercentage=${slippagePercentage}`;
  }

  public async getPoolAddress(lpTokenAddress: string, provider): Promise<string> {
    const lpToken = new ethers.Contract(
      lpTokenAddress,
      ["function minter() external view returns (address)"],
      provider
    );
    try {
      return await lpToken.minter();
    } catch (error) {
      return lpTokenAddress;
    }
  }

  public async getCoinAddresses(stableSwapAddress: string, provider): Promise<string[]> {
    const curveRegistry = new ethers.Contract(
      this.crvRegistryAddress,
      [
        "function get_n_coins(address pool) external view returns (uint256[2])",
        "function get_underlying_coins(address pool) external view returns (address[8])",
      ],
      provider
    );
    const [tokenAmount, underlyingTokenAmount] = await curveRegistry.get_n_coins(stableSwapAddress);
    const addresses = await curveRegistry.get_underlying_coins(stableSwapAddress);
    return addresses.slice(0, underlyingTokenAmount);
  }

  public async getCoins(stableSwapAddress: string, provider): Promise<ERC20[]> {
    const coinAddresses = await this.getCoinAddresses(stableSwapAddress, provider);
    return coinAddresses.map((address) => new ethers.Contract(address, erc20abi, provider) as ERC20);
  }

  public async getIntermediateToken(
    stableSwapAddress: string,
    coins: ERC20[],
    sell = false
  ): Promise<{ token: Token; i?: number }> {
    if (stableSwapAddress.toLowerCase() === TRI_CRYPTO_POOL_ADDRESS.toLowerCase()) {
      return { token: { address: USDT_ADDRESS, decimals: USDT_DECIMALS }, i: 0 };
    }

    const coinBals = await Promise.all(
      coins.map(async (coin) =>
        coin.address === this.ethAddress
          ? await coin.provider.getBalance(stableSwapAddress)
          : await coin.balanceOf(stableSwapAddress)
      )
    );
    let coinBal = coinBals[0];
    let coinIndex = 0;
    // Choose buyCoin based on their pool balances to get positive slippage
    coinBals.forEach((bal, i) => {
      if (sell ? bal.gte(coinBal) : bal.lte(coinBal)) {
        coinBal = bal;
        coinIndex = i;
      }
    });

    return {
      token: {
        address: coins[coinIndex].address,
        decimals: coins[coinIndex].address === this.ethAddress ? 18 : await coins[coinIndex].decimals(),
      },
      i: coinIndex,
    };
  }

  private async getQuote(
    from: Token,
    fromAmount: BigNumber,
    buyToken: Token,
    slippagePercentage: number
  ): Promise<QuoteResponse> {
    const swapUrl = this.constructSwapUrl(buyToken, from, fromAmount, slippagePercentage);
    return (await this.client.get(swapUrl)) as QuoteResponse;
  }
}
export default Zapper;

export interface Source {
  name: string;
  proportion: string;
  intermediateToken: string;
  hops: string[];
}

export interface Pool {
  exchangeFunctionSelector: string;
  sellQuoteFunctionSelector: string;
  buyQuoteFunctionSelector: string;
  tokens: string[];
  poolAddress: string;
  gasSchedule: number;
  makerTokenIdx: number;
  takerTokenIdx: number;
}

export interface FillData {
  router: string;
  tokenAddressPath: string[];
  uniswapPath: string;
  gasUsed: number;
  pool: Pool;
  fromTokenIdx?: number;
  toTokenIdx?: number;
}

export interface Order {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  fillData: FillData;
  source: string;
  sourcePathId: string;
  type: number;
}

interface QuoteResponse {
  data: DataResponse;
}

export interface DataResponse {
  chainId: number;
  price: string;
  guaranteedPrice: string;
  estimatedPriceImpact: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  estimatedGas: string;
  gasPrice: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sellAmount: string;
  sources: Source[];
  orders: Order[];
  allowanceTarget: string;
  decodedUniqueId: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
}