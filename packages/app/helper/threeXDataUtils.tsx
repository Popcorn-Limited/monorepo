import { parseEther } from "@ethersproject/units";
import ButterBatchAdapter from "@popcorn/hardhat/lib/adapters/ButterBatchAdapter";
import ThreeXBatchAdapter from "@popcorn/hardhat/lib/adapters/ThreeXBatchAdapter";
import {
  Curve3Pool,
  ERC20,
  IBasicIssuanceModule,
  ISetToken,
  ThreeXBatchProcessing,
  ThreeXWhaleProcessing,
  ThreeXZapper,
} from "@popcorn/hardhat/typechain";
import { AccountBatch, Address, BatchMetadata, BatchType, Token } from "@popcorn/utils/src/types";
import { BigNumber, ethers } from "ethers";

interface Stables {
  dai: Token;
  usdc: Token;
  usdt: Token;
}

async function getToken(
  butterAdapter: ButterBatchAdapter,
  account: string | undefined,
  tokens: Stables,
  threeXClaimableBalance: BigNumber,
  usdcClaimableBalance: BigNumber,
  threePool: Curve3Pool,
  threeX: ISetToken,
  setBasicIssuanceModule: IBasicIssuanceModule,
  mainContract: ThreeXBatchProcessing,
  instantContract?: ThreeXWhaleProcessing,
  zapperContract?: ThreeXZapper,
): Promise<Token[]> {
  const defaultErc20Decimals = 18;
  return [
    {
      name: "3X",
      address: threeX.address,
      symbol: "3X",
      balance: account ? await threeX.balanceOf(account) : ethers.constants.Zero,
      allowance: account
        ? await threeX.allowance(account, instantContract ? instantContract.address : mainContract.address)
        : ethers.constants.Zero,
      claimableBalance: account ? threeXClaimableBalance : ethers.constants.Zero,
      price: await mainContract.valueOfComponents(
        ...(await setBasicIssuanceModule.getRequiredComponentUnitsForIssue(threeX.address, parseEther("1"))),
      ),
      decimals: defaultErc20Decimals,
      icon: "/images/tokens/3X.svg",
      contract: threeX as unknown as ERC20,
    },
    {
      ...tokens.dai,
      price: await butterAdapter.getStableCoinPrice(threePool, [
        parseEther("1"),
        BigNumber.from("0"),
        BigNumber.from("0"),
      ]),
      balance: account ? await tokens.dai.contract.balanceOf(account) : ethers.constants.Zero,
      allowance: account
        ? await tokens.dai.contract.allowance(
            account,
            instantContract ? instantContract.address : zapperContract?.address,
          )
        : ethers.constants.Zero,
      decimals: defaultErc20Decimals,
    },
    {
      ...tokens.usdc,
      price: await butterAdapter.getStableCoinPrice(threePool, [
        BigNumber.from("0"),
        BigNumber.from("0"),
        BigNumber.from(1e6),
      ]),
      balance: account
        ? (await tokens.usdc.contract.balanceOf(account)).mul(BigNumber.from(1e12))
        : ethers.constants.Zero,
      allowance: account
        ? await tokens.usdc.contract.allowance(
            account,
            instantContract ? instantContract.address : mainContract.address,
          )
        : ethers.constants.Zero,
      decimals: defaultErc20Decimals,
      claimableBalance: usdcClaimableBalance,
    },
    {
      ...tokens.usdt,
      price: await butterAdapter.getStableCoinPrice(threePool, [
        BigNumber.from("0"),
        BigNumber.from("0"),
        BigNumber.from(1e6),
      ]),
      balance: account
        ? (await tokens.usdt.contract.balanceOf(account)).mul(BigNumber.from(1e12))
        : ethers.constants.Zero,
      allowance: account
        ? await tokens.usdt.contract.allowance(
            account,
            instantContract ? instantContract.address : zapperContract?.address,
          )
        : ethers.constants.Zero,
      decimals: defaultErc20Decimals,
    },
  ];
}
function getClaimableBalance(claimableBatches: AccountBatch[]): BigNumber {
  return claimableBatches.reduce(
    (acc: BigNumber, batch: AccountBatch) => acc.add(batch.accountClaimableTokenBalance),
    ethers.constants.Zero,
  );
}
export async function getData(
  account: Address | undefined,
  dai: Token,
  usdc: Token,
  usdt: Token,
  threePool: Curve3Pool,
  butter: ISetToken,
  setBasicIssuanceModule: IBasicIssuanceModule,
  mainContract: ThreeXBatchProcessing,
  zapperContract?: ThreeXZapper,
): Promise<BatchMetadata> {
  const threeXBatchAdapter = new ThreeXBatchAdapter(mainContract);
  const currentBatches = await threeXBatchAdapter.getCurrentBatches();
  const totalSupply = await butter.totalSupply();
  const accountBatches = account ? await threeXBatchAdapter.getBatches(account) : [];

  const claimableMintBatches = accountBatches.filter((batch) => batch.batchType == BatchType.Mint && batch.claimable);
  const claimableRedeemBatches = accountBatches.filter(
    (batch) => batch.batchType == BatchType.Redeem && batch.claimable,
  );

  const tokenResponse = await getToken(
    threeXBatchAdapter,
    account,
    { dai, usdc, usdt },
    getClaimableBalance(claimableMintBatches),
    getClaimableBalance(claimableRedeemBatches).mul(BigNumber.from(1e12)),
    threePool,
    butter,
    setBasicIssuanceModule,
    mainContract,
    null,
    zapperContract,
  );

  const response: BatchMetadata = {
    accountBatches,
    currentBatches,
    totalSupply,
    claimableMintBatches,
    claimableRedeemBatches,
    tokens: tokenResponse,
  };
  console.log({ response });
  return response;
}

export async function getDataWhale(
  account: Address,
  dai: Token,
  usdc: Token,
  usdt: Token,
  threePool: Curve3Pool,
  butter: ISetToken,
  setBasicIssuanceModule: IBasicIssuanceModule,
  instantContract: ThreeXWhaleProcessing,
  batchContract: ThreeXBatchProcessing,
): Promise<BatchMetadata> {
  const threeXBatchAdapter = new ThreeXBatchAdapter(batchContract);
  const currentBatches = await threeXBatchAdapter.getCurrentBatches();
  const totalSupply = await butter.totalSupply();
  const accountBatches = account ? await threeXBatchAdapter.getBatches(account) : [];

  const claimableMintBatches = accountBatches.filter((batch) => batch.batchType == BatchType.Mint && batch.claimable);
  const claimableRedeemBatches = accountBatches.filter(
    (batch) => batch.batchType == BatchType.Redeem && batch.claimable,
  );

  const tokenResponse = await getToken(
    threeXBatchAdapter,
    account,
    { dai, usdc, usdt },
    getClaimableBalance(claimableMintBatches),
    getClaimableBalance(claimableRedeemBatches).mul(BigNumber.from(1e12)),
    threePool,
    butter,
    setBasicIssuanceModule,
    batchContract,
    instantContract,
  );

  const response: BatchMetadata = {
    accountBatches,
    currentBatches,
    totalSupply,
    claimableMintBatches,
    claimableRedeemBatches,
    tokens: tokenResponse,
  };
  return response;
}
