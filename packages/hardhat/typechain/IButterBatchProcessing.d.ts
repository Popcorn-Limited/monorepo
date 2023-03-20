/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface IButterBatchProcessingInterface extends ethers.utils.Interface {
  functions: {
    "batchRedeem()": FunctionFragment;
    "batches(bytes32)": FunctionFragment;
    "claim(bytes32,address)": FunctionFragment;
    "claimRedemptionFee()": FunctionFragment;
    "currentRedeemBatchId()": FunctionFragment;
    "depositForMint(uint256,address)": FunctionFragment;
    "depositForRedeem(uint256)": FunctionFragment;
    "lastRedeemedAt()": FunctionFragment;
    "setRedemptionFee(uint256,address)": FunctionFragment;
    "withdrawFromBatch(bytes32,uint256,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "batchRedeem",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "batches", values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: "claim",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "claimRedemptionFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "currentRedeemBatchId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "depositForMint",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "depositForRedeem",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "lastRedeemedAt",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setRedemptionFee",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawFromBatch",
    values: [BytesLike, BigNumberish, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "batchRedeem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "batches", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimRedemptionFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "currentRedeemBatchId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositForMint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositForRedeem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastRedeemedAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setRedemptionFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawFromBatch",
    data: BytesLike
  ): Result;

  events: {};
}

export class IButterBatchProcessing extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IButterBatchProcessingInterface;

  functions: {
    batchRedeem(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    batches(
      batchId: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [
        [
          number,
          string,
          boolean,
          BigNumber,
          BigNumber,
          BigNumber,
          string,
          string
        ] & {
          batchType: number;
          batchId: string;
          claimable: boolean;
          unclaimedShares: BigNumber;
          suppliedTokenBalance: BigNumber;
          claimableTokenBalance: BigNumber;
          suppliedTokenAddress: string;
          claimableTokenAddress: string;
        }
      ]
    >;

    claim(
      batchId_: BytesLike,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    claimRedemptionFee(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    currentRedeemBatchId(overrides?: CallOverrides): Promise<[string]>;

    depositForMint(
      amount_: BigNumberish,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositForRedeem(
      amount_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lastRedeemedAt(overrides?: CallOverrides): Promise<[BigNumber]>;

    setRedemptionFee(
      _feeRate: BigNumberish,
      _recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawFromBatch(
      batchId_: BytesLike,
      amountToWithdraw_: BigNumberish,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  batchRedeem(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  batches(
    batchId: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [
      number,
      string,
      boolean,
      BigNumber,
      BigNumber,
      BigNumber,
      string,
      string
    ] & {
      batchType: number;
      batchId: string;
      claimable: boolean;
      unclaimedShares: BigNumber;
      suppliedTokenBalance: BigNumber;
      claimableTokenBalance: BigNumber;
      suppliedTokenAddress: string;
      claimableTokenAddress: string;
    }
  >;

  claim(
    batchId_: BytesLike,
    account_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  claimRedemptionFee(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  currentRedeemBatchId(overrides?: CallOverrides): Promise<string>;

  depositForMint(
    amount_: BigNumberish,
    account_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositForRedeem(
    amount_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lastRedeemedAt(overrides?: CallOverrides): Promise<BigNumber>;

  setRedemptionFee(
    _feeRate: BigNumberish,
    _recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawFromBatch(
    batchId_: BytesLike,
    amountToWithdraw_: BigNumberish,
    account_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    batchRedeem(overrides?: CallOverrides): Promise<void>;

    batches(
      batchId: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [
        number,
        string,
        boolean,
        BigNumber,
        BigNumber,
        BigNumber,
        string,
        string
      ] & {
        batchType: number;
        batchId: string;
        claimable: boolean;
        unclaimedShares: BigNumber;
        suppliedTokenBalance: BigNumber;
        claimableTokenBalance: BigNumber;
        suppliedTokenAddress: string;
        claimableTokenAddress: string;
      }
    >;

    claim(
      batchId_: BytesLike,
      account_: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimRedemptionFee(overrides?: CallOverrides): Promise<void>;

    currentRedeemBatchId(overrides?: CallOverrides): Promise<string>;

    depositForMint(
      amount_: BigNumberish,
      account_: string,
      overrides?: CallOverrides
    ): Promise<void>;

    depositForRedeem(
      amount_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    lastRedeemedAt(overrides?: CallOverrides): Promise<BigNumber>;

    setRedemptionFee(
      _feeRate: BigNumberish,
      _recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawFromBatch(
      batchId_: BytesLike,
      amountToWithdraw_: BigNumberish,
      account_: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    batchRedeem(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    batches(batchId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    claim(
      batchId_: BytesLike,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    claimRedemptionFee(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    currentRedeemBatchId(overrides?: CallOverrides): Promise<BigNumber>;

    depositForMint(
      amount_: BigNumberish,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositForRedeem(
      amount_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lastRedeemedAt(overrides?: CallOverrides): Promise<BigNumber>;

    setRedemptionFee(
      _feeRate: BigNumberish,
      _recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawFromBatch(
      batchId_: BytesLike,
      amountToWithdraw_: BigNumberish,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    batchRedeem(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    batches(
      batchId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claim(
      batchId_: BytesLike,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    claimRedemptionFee(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    currentRedeemBatchId(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    depositForMint(
      amount_: BigNumberish,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositForRedeem(
      amount_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lastRedeemedAt(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setRedemptionFee(
      _feeRate: BigNumberish,
      _recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawFromBatch(
      batchId_: BytesLike,
      amountToWithdraw_: BigNumberish,
      account_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
