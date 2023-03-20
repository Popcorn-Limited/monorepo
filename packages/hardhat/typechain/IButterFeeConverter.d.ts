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

interface IButterFeeConverterInterface extends ethers.utils.Interface {
  functions: {
    "BPS_DENOMINATOR()": FunctionFragment;
    "accrueFee()": FunctionFragment;
    "butter()": FunctionFragment;
    "keeperTip()": FunctionFragment;
    "maxSlippage()": FunctionFragment;
    "preferredStableCoinIndex()": FunctionFragment;
    "scaleValue(uint256,uint256)": FunctionFragment;
    "setApprovals()": FunctionFragment;
    "setKeeperTip(uint256)": FunctionFragment;
    "setMaxSlippage(uint256)": FunctionFragment;
    "setPreferredStableCoinIndex(int128)": FunctionFragment;
    "streamingFeeModule()": FunctionFragment;
    "threeCRV()": FunctionFragment;
    "threePool()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "BPS_DENOMINATOR",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "accrueFee", values?: undefined): string;
  encodeFunctionData(functionFragment: "butter", values?: undefined): string;
  encodeFunctionData(functionFragment: "keeperTip", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "maxSlippage",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "preferredStableCoinIndex",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "scaleValue",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setApprovals",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setKeeperTip",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMaxSlippage",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setPreferredStableCoinIndex",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "streamingFeeModule",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "threeCRV", values?: undefined): string;
  encodeFunctionData(functionFragment: "threePool", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "BPS_DENOMINATOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "accrueFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "butter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "keeperTip", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "maxSlippage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "preferredStableCoinIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "scaleValue", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setApprovals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setKeeperTip",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMaxSlippage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPreferredStableCoinIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "streamingFeeModule",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "threeCRV", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "threePool", data: BytesLike): Result;

  events: {};
}

export class IButterFeeConverter extends BaseContract {
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

  interface: IButterFeeConverterInterface;

  functions: {
    BPS_DENOMINATOR(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    accrueFee(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    butter(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    keeperTip(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    maxSlippage(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    preferredStableCoinIndex(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    scaleValue(
      value: BigNumberish,
      decimals: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    setApprovals(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setKeeperTip(
      _newKeeperTip: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMaxSlippage(
      _newSlippage: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setPreferredStableCoinIndex(
      _newIndex: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    streamingFeeModule(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    threeCRV(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    threePool(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  BPS_DENOMINATOR(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  accrueFee(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  butter(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  keeperTip(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  maxSlippage(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  preferredStableCoinIndex(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  scaleValue(
    value: BigNumberish,
    decimals: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  setApprovals(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setKeeperTip(
    _newKeeperTip: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMaxSlippage(
    _newSlippage: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setPreferredStableCoinIndex(
    _newIndex: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  streamingFeeModule(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  threeCRV(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  threePool(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    BPS_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;

    accrueFee(overrides?: CallOverrides): Promise<void>;

    butter(overrides?: CallOverrides): Promise<string>;

    keeperTip(overrides?: CallOverrides): Promise<BigNumber>;

    maxSlippage(overrides?: CallOverrides): Promise<BigNumber>;

    preferredStableCoinIndex(overrides?: CallOverrides): Promise<BigNumber>;

    scaleValue(
      value: BigNumberish,
      decimals: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setApprovals(overrides?: CallOverrides): Promise<void>;

    setKeeperTip(
      _newKeeperTip: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setMaxSlippage(
      _newSlippage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setPreferredStableCoinIndex(
      _newIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    streamingFeeModule(overrides?: CallOverrides): Promise<string>;

    threeCRV(overrides?: CallOverrides): Promise<string>;

    threePool(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    BPS_DENOMINATOR(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    accrueFee(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    butter(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    keeperTip(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    maxSlippage(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    preferredStableCoinIndex(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    scaleValue(
      value: BigNumberish,
      decimals: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setApprovals(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setKeeperTip(
      _newKeeperTip: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMaxSlippage(
      _newSlippage: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setPreferredStableCoinIndex(
      _newIndex: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    streamingFeeModule(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    threeCRV(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    threePool(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BPS_DENOMINATOR(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    accrueFee(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    butter(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    keeperTip(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    maxSlippage(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    preferredStableCoinIndex(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    scaleValue(
      value: BigNumberish,
      decimals: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setApprovals(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setKeeperTip(
      _newKeeperTip: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMaxSlippage(
      _newSlippage: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setPreferredStableCoinIndex(
      _newIndex: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    streamingFeeModule(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    threeCRV(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    threePool(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
