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

interface MockCurveThreepoolInterface extends ethers.utils.Interface {
  functions: {
    "add_liquidity(uint256[3],uint256)": FunctionFragment;
    "calc_token_amount(uint256[3])": FunctionFragment;
    "calc_withdraw_one_coin(uint256)": FunctionFragment;
    "coins(uint256)": FunctionFragment;
    "exchange(int128,int128,uint256)": FunctionFragment;
    "get_virtual_price()": FunctionFragment;
    "remove_liquidity_one_coin(uint256,int128,uint256)": FunctionFragment;
    "setVirtualPrice(uint256)": FunctionFragment;
    "setWithdrawalSlippage(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "add_liquidity",
    values: [[BigNumberish, BigNumberish, BigNumberish], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "calc_token_amount",
    values: [[BigNumberish, BigNumberish, BigNumberish]]
  ): string;
  encodeFunctionData(
    functionFragment: "calc_withdraw_one_coin",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "coins", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "exchange",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "get_virtual_price",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "remove_liquidity_one_coin",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setVirtualPrice",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setWithdrawalSlippage",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "add_liquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "calc_token_amount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "calc_withdraw_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "coins", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exchange", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "get_virtual_price",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "remove_liquidity_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setVirtualPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setWithdrawalSlippage",
    data: BytesLike
  ): Result;

  events: {
    "EchoValues(uint256)": EventFragment;
    "LiquidityAdded(uint256,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "EchoValues"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LiquidityAdded"): EventFragment;
}

export type EchoValuesEvent = TypedEvent<[BigNumber] & { amount: BigNumber }>;

export type LiquidityAddedEvent = TypedEvent<
  [BigNumber, string] & { lpToken: BigNumber; account: string }
>;

export class MockCurveThreepool extends BaseContract {
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

  interface: MockCurveThreepoolInterface;

  functions: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      arg1: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    calc_token_amount(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    coins(i: BigNumberish, overrides?: CallOverrides): Promise<[string]>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    get_virtual_price(overrides?: CallOverrides): Promise<[BigNumber]>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      min_amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setVirtualPrice(
      virtualPrice_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setWithdrawalSlippage(
      withdrawalSlippageBps_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  add_liquidity(
    amounts: [BigNumberish, BigNumberish, BigNumberish],
    arg1: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  calc_token_amount(
    amounts: [BigNumberish, BigNumberish, BigNumberish],
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  calc_withdraw_one_coin(
    _token_amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  coins(i: BigNumberish, overrides?: CallOverrides): Promise<string>;

  exchange(
    i: BigNumberish,
    j: BigNumberish,
    dx: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;

  remove_liquidity_one_coin(
    _token_amount: BigNumberish,
    i: BigNumberish,
    min_amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setVirtualPrice(
    virtualPrice_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setWithdrawalSlippage(
    withdrawalSlippageBps_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    calc_token_amount(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    coins(i: BigNumberish, overrides?: CallOverrides): Promise<string>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      min_amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setVirtualPrice(
      virtualPrice_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setWithdrawalSlippage(
      withdrawalSlippageBps_: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "EchoValues(uint256)"(
      amount?: null
    ): TypedEventFilter<[BigNumber], { amount: BigNumber }>;

    EchoValues(
      amount?: null
    ): TypedEventFilter<[BigNumber], { amount: BigNumber }>;

    "LiquidityAdded(uint256,address)"(
      lpToken?: null,
      account?: null
    ): TypedEventFilter<
      [BigNumber, string],
      { lpToken: BigNumber; account: string }
    >;

    LiquidityAdded(
      lpToken?: null,
      account?: null
    ): TypedEventFilter<
      [BigNumber, string],
      { lpToken: BigNumber; account: string }
    >;
  };

  estimateGas: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      arg1: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    calc_token_amount(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    coins(i: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      min_amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setVirtualPrice(
      virtualPrice_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setWithdrawalSlippage(
      withdrawalSlippageBps_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      arg1: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    calc_token_amount(
      amounts: [BigNumberish, BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    coins(
      i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    get_virtual_price(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      min_amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setVirtualPrice(
      virtualPrice_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setWithdrawalSlippage(
      withdrawalSlippageBps_: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
