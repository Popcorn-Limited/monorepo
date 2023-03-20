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

interface FeeEscrowInterface extends ethers.utils.Interface {
  functions: {
    "addBurnerAddress(address,address)": FunctionFragment;
    "changeBurnerAddress(address,address)": FunctionFragment;
    "feeTokenToBurnerAddress(address)": FunctionFragment;
    "getBurnerAddress(address)": FunctionFragment;
    "removeBurnerAddress(address)": FunctionFragment;
    "transferFees(address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addBurnerAddress",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "changeBurnerAddress",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "feeTokenToBurnerAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getBurnerAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "removeBurnerAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFees",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "addBurnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeBurnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "feeTokenToBurnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBurnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeBurnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFees",
    data: BytesLike
  ): Result;

  events: {
    "BurnerAddressAdded(address,address)": EventFragment;
    "BurnerAddressChanged(address,address)": EventFragment;
    "BurnerAddressRemoved(address)": EventFragment;
    "FeesBurned(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BurnerAddressAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BurnerAddressChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BurnerAddressRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FeesBurned"): EventFragment;
}

export type BurnerAddressAddedEvent = TypedEvent<
  [string, string] & { feeToken: string; burnerAddress: string }
>;

export type BurnerAddressChangedEvent = TypedEvent<
  [string, string] & { feeToken: string; burnerAddress: string }
>;

export type BurnerAddressRemovedEvent = TypedEvent<
  [string] & { feeToken: string }
>;

export type FeesBurnedEvent = TypedEvent<
  [string, BigNumber] & { feeToken: string; burnAmount: BigNumber }
>;

export class FeeEscrow extends BaseContract {
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

  interface: FeeEscrowInterface;

  functions: {
    addBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    changeBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    feeTokenToBurnerAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getBurnerAddress(
      _feeToken: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    removeBurnerAddress(
      _feeToken: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferFees(
      _feeToken: string,
      _burnAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addBurnerAddress(
    _feeToken: string,
    _burnerAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  changeBurnerAddress(
    _feeToken: string,
    _burnerAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  feeTokenToBurnerAddress(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getBurnerAddress(
    _feeToken: string,
    overrides?: CallOverrides
  ): Promise<string>;

  removeBurnerAddress(
    _feeToken: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferFees(
    _feeToken: string,
    _burnAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    changeBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    feeTokenToBurnerAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getBurnerAddress(
      _feeToken: string,
      overrides?: CallOverrides
    ): Promise<string>;

    removeBurnerAddress(
      _feeToken: string,
      overrides?: CallOverrides
    ): Promise<void>;

    transferFees(
      _feeToken: string,
      _burnAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "BurnerAddressAdded(address,address)"(
      feeToken?: string | null,
      burnerAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { feeToken: string; burnerAddress: string }
    >;

    BurnerAddressAdded(
      feeToken?: string | null,
      burnerAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { feeToken: string; burnerAddress: string }
    >;

    "BurnerAddressChanged(address,address)"(
      feeToken?: string | null,
      burnerAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { feeToken: string; burnerAddress: string }
    >;

    BurnerAddressChanged(
      feeToken?: string | null,
      burnerAddress?: string | null
    ): TypedEventFilter<
      [string, string],
      { feeToken: string; burnerAddress: string }
    >;

    "BurnerAddressRemoved(address)"(
      feeToken?: string | null
    ): TypedEventFilter<[string], { feeToken: string }>;

    BurnerAddressRemoved(
      feeToken?: string | null
    ): TypedEventFilter<[string], { feeToken: string }>;

    "FeesBurned(address,uint256)"(
      feeToken?: string | null,
      burnAmount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { feeToken: string; burnAmount: BigNumber }
    >;

    FeesBurned(
      feeToken?: string | null,
      burnAmount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { feeToken: string; burnAmount: BigNumber }
    >;
  };

  estimateGas: {
    addBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    changeBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    feeTokenToBurnerAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBurnerAddress(
      _feeToken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    removeBurnerAddress(
      _feeToken: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferFees(
      _feeToken: string,
      _burnAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    changeBurnerAddress(
      _feeToken: string,
      _burnerAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    feeTokenToBurnerAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBurnerAddress(
      _feeToken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    removeBurnerAddress(
      _feeToken: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferFees(
      _feeToken: string,
      _burnAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}