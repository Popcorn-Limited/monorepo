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

interface LBPManagerInterface extends ethers.utils.Interface {
  functions: {
    "balancer()": FunctionFragment;
    "dao()": FunctionFragment;
    "deployLBP()": FunctionFragment;
    "enableTrading()": FunctionFragment;
    "lbp()": FunctionFragment;
    "pause()": FunctionFragment;
    "poolConfig()": FunctionFragment;
    "unpause()": FunctionFragment;
    "withdrawFromPool()": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "balancer", values?: undefined): string;
  encodeFunctionData(functionFragment: "dao", values?: undefined): string;
  encodeFunctionData(functionFragment: "deployLBP", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "enableTrading",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "lbp", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "poolConfig",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdrawFromPool",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "balancer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "dao", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deployLBP", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "enableTrading",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lbp", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "poolConfig", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawFromPool",
    data: BytesLike
  ): Result;

  events: {
    "CreatedPool(address)": EventFragment;
    "ExitedPool(bytes32)": EventFragment;
    "JoinedPool(bytes32)": EventFragment;
    "SwapEnabled(bool)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CreatedPool"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ExitedPool"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "JoinedPool"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SwapEnabled"): EventFragment;
}

export type CreatedPoolEvent = TypedEvent<[string] & { poolAddress: string }>;

export type ExitedPoolEvent = TypedEvent<[string] & { poolID: string }>;

export type JoinedPoolEvent = TypedEvent<[string] & { poolID: string }>;

export type SwapEnabledEvent = TypedEvent<[boolean] & { enabled: boolean }>;

export class LBPManager extends BaseContract {
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

  interface: LBPManagerInterface;

  functions: {
    balancer(
      overrides?: CallOverrides
    ): Promise<[string, string] & { lbpFactory: string; vault: string }>;

    dao(
      overrides?: CallOverrides
    ): Promise<[string, string] & { agent: string; treasury: string }>;

    deployLBP(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    enableTrading(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lbp(overrides?: CallOverrides): Promise<[string]>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    poolConfig(
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        BigNumber,
        BigNumber,
        string,
        boolean,
        BigNumber,
        boolean,
        string
      ] & {
        name: string;
        symbol: string;
        durationInSeconds: BigNumber;
        swapFee: BigNumber;
        owner: string;
        swapEnabledOnStart: boolean;
        startTime: BigNumber;
        deployed: boolean;
        pauser: string;
      }
    >;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawFromPool(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  balancer(
    overrides?: CallOverrides
  ): Promise<[string, string] & { lbpFactory: string; vault: string }>;

  dao(
    overrides?: CallOverrides
  ): Promise<[string, string] & { agent: string; treasury: string }>;

  deployLBP(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  enableTrading(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lbp(overrides?: CallOverrides): Promise<string>;

  pause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  poolConfig(
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      string,
      BigNumber,
      BigNumber,
      string,
      boolean,
      BigNumber,
      boolean,
      string
    ] & {
      name: string;
      symbol: string;
      durationInSeconds: BigNumber;
      swapFee: BigNumber;
      owner: string;
      swapEnabledOnStart: boolean;
      startTime: BigNumber;
      deployed: boolean;
      pauser: string;
    }
  >;

  unpause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawFromPool(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    balancer(
      overrides?: CallOverrides
    ): Promise<[string, string] & { lbpFactory: string; vault: string }>;

    dao(
      overrides?: CallOverrides
    ): Promise<[string, string] & { agent: string; treasury: string }>;

    deployLBP(overrides?: CallOverrides): Promise<void>;

    enableTrading(overrides?: CallOverrides): Promise<void>;

    lbp(overrides?: CallOverrides): Promise<string>;

    pause(overrides?: CallOverrides): Promise<void>;

    poolConfig(
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        BigNumber,
        BigNumber,
        string,
        boolean,
        BigNumber,
        boolean,
        string
      ] & {
        name: string;
        symbol: string;
        durationInSeconds: BigNumber;
        swapFee: BigNumber;
        owner: string;
        swapEnabledOnStart: boolean;
        startTime: BigNumber;
        deployed: boolean;
        pauser: string;
      }
    >;

    unpause(overrides?: CallOverrides): Promise<void>;

    withdrawFromPool(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "CreatedPool(address)"(
      poolAddress?: null
    ): TypedEventFilter<[string], { poolAddress: string }>;

    CreatedPool(
      poolAddress?: null
    ): TypedEventFilter<[string], { poolAddress: string }>;

    "ExitedPool(bytes32)"(
      poolID?: null
    ): TypedEventFilter<[string], { poolID: string }>;

    ExitedPool(poolID?: null): TypedEventFilter<[string], { poolID: string }>;

    "JoinedPool(bytes32)"(
      poolID?: null
    ): TypedEventFilter<[string], { poolID: string }>;

    JoinedPool(poolID?: null): TypedEventFilter<[string], { poolID: string }>;

    "SwapEnabled(bool)"(
      enabled?: null
    ): TypedEventFilter<[boolean], { enabled: boolean }>;

    SwapEnabled(
      enabled?: null
    ): TypedEventFilter<[boolean], { enabled: boolean }>;
  };

  estimateGas: {
    balancer(overrides?: CallOverrides): Promise<BigNumber>;

    dao(overrides?: CallOverrides): Promise<BigNumber>;

    deployLBP(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    enableTrading(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lbp(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    poolConfig(overrides?: CallOverrides): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawFromPool(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balancer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    dao(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    deployLBP(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    enableTrading(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lbp(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    poolConfig(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawFromPool(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}