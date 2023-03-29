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

interface MockCurveMetapoolInterface extends ethers.utils.Interface {
  functions: {
    "add_liquidity(uint256[2],uint256)": FunctionFragment;
    "base_coins()": FunctionFragment;
    "calc_withdraw_one_coin(uint256,int128)": FunctionFragment;
    "coins()": FunctionFragment;
    "exchange(int128,int128,uint256)": FunctionFragment;
    "exchange_underlying(uint256)": FunctionFragment;
    "get_virtual_price()": FunctionFragment;
    "lpToken()": FunctionFragment;
    "remove_liquidity_one_coin(uint256,int128,uint256)": FunctionFragment;
    "setMintSlippage(uint256)": FunctionFragment;
    "setVirtualPrice(uint256)": FunctionFragment;
    "setWithdrawalSlippage(uint256)": FunctionFragment;
    "threeCrv()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "add_liquidity",
    values: [[BigNumberish, BigNumberish], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "base_coins",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "calc_withdraw_one_coin",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "coins", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "exchange",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange_underlying",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "get_virtual_price",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "lpToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "remove_liquidity_one_coin",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMintSlippage",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setVirtualPrice",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setWithdrawalSlippage",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "threeCrv", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "add_liquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "base_coins", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "calc_withdraw_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "coins", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exchange", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "exchange_underlying",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "get_virtual_price",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lpToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "remove_liquidity_one_coin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMintSlippage",
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
  decodeFunctionResult(functionFragment: "threeCrv", data: BytesLike): Result;

  events: {};
}

export class MockCurveMetapool extends BaseContract {
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

  interface: MockCurveMetapoolInterface;

  functions: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish],
      min_mint_amounts: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    base_coins(overrides?: CallOverrides): Promise<[[string, string, string]]>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    coins(overrides?: CallOverrides): Promise<[[string, string]]>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    exchange_underlying(
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    get_virtual_price(overrides?: CallOverrides): Promise<[BigNumber]>;

    lpToken(overrides?: CallOverrides): Promise<[string]>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      _min_amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMintSlippage(
      mintSlippageBps_: BigNumberish,
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

    threeCrv(overrides?: CallOverrides): Promise<[string]>;
  };

  add_liquidity(
    amounts: [BigNumberish, BigNumberish],
    min_mint_amounts: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  base_coins(overrides?: CallOverrides): Promise<[string, string, string]>;

  calc_withdraw_one_coin(
    _token_amount: BigNumberish,
    i: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  coins(overrides?: CallOverrides): Promise<[string, string]>;

  exchange(
    i: BigNumberish,
    j: BigNumberish,
    dx: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  exchange_underlying(
    dx: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;

  lpToken(overrides?: CallOverrides): Promise<string>;

  remove_liquidity_one_coin(
    _token_amount: BigNumberish,
    i: BigNumberish,
    _min_amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMintSlippage(
    mintSlippageBps_: BigNumberish,
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

  threeCrv(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish],
      min_mint_amounts: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    base_coins(overrides?: CallOverrides): Promise<[string, string, string]>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    coins(overrides?: CallOverrides): Promise<[string, string]>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exchange_underlying(
      dx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;

    lpToken(overrides?: CallOverrides): Promise<string>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      _min_amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setMintSlippage(
      mintSlippageBps_: BigNumberish,
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

    threeCrv(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish],
      min_mint_amounts: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    base_coins(overrides?: CallOverrides): Promise<BigNumber>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    coins(overrides?: CallOverrides): Promise<BigNumber>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    exchange_underlying(
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    get_virtual_price(overrides?: CallOverrides): Promise<BigNumber>;

    lpToken(overrides?: CallOverrides): Promise<BigNumber>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      _min_amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMintSlippage(
      mintSlippageBps_: BigNumberish,
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

    threeCrv(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    add_liquidity(
      amounts: [BigNumberish, BigNumberish],
      min_mint_amounts: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    base_coins(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    calc_withdraw_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    coins(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    exchange(
      i: BigNumberish,
      j: BigNumberish,
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    exchange_underlying(
      dx: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    get_virtual_price(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lpToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    remove_liquidity_one_coin(
      _token_amount: BigNumberish,
      i: BigNumberish,
      _min_amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMintSlippage(
      mintSlippageBps_: BigNumberish,
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

    threeCrv(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
