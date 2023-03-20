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

interface RegionInterface extends ethers.utils.Interface {
  functions: {
    "addRegion(bytes32,address)": FunctionFragment;
    "beneficiaryVaults(uint256)": FunctionFragment;
    "contractRegistry()": FunctionFragment;
    "defaultRegion()": FunctionFragment;
    "getAllRegions()": FunctionFragment;
    "getAllVaults()": FunctionFragment;
    "regionExists(bytes32)": FunctionFragment;
    "regionVaults(bytes32)": FunctionFragment;
    "regions(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addRegion",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "beneficiaryVaults",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "contractRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "defaultRegion",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAllRegions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAllVaults",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "regionExists",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "regionVaults",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "regions",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "addRegion", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "beneficiaryVaults",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "contractRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "defaultRegion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllRegions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllVaults",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "regionExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "regionVaults",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "regions", data: BytesLike): Result;

  events: {
    "RegionAdded(bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "RegionAdded"): EventFragment;
}

export type RegionAddedEvent = TypedEvent<[string] & { region: string }>;

export class Region extends BaseContract {
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

  interface: RegionInterface;

  functions: {
    addRegion(
      region_: BytesLike,
      _beneficiaryVault: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    beneficiaryVaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    contractRegistry(overrides?: CallOverrides): Promise<[string]>;

    defaultRegion(overrides?: CallOverrides): Promise<[string]>;

    getAllRegions(overrides?: CallOverrides): Promise<[string[]]>;

    getAllVaults(overrides?: CallOverrides): Promise<[string[]]>;

    regionExists(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    regionVaults(arg0: BytesLike, overrides?: CallOverrides): Promise<[string]>;

    regions(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
  };

  addRegion(
    region_: BytesLike,
    _beneficiaryVault: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  beneficiaryVaults(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  contractRegistry(overrides?: CallOverrides): Promise<string>;

  defaultRegion(overrides?: CallOverrides): Promise<string>;

  getAllRegions(overrides?: CallOverrides): Promise<string[]>;

  getAllVaults(overrides?: CallOverrides): Promise<string[]>;

  regionExists(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  regionVaults(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;

  regions(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    addRegion(
      region_: BytesLike,
      _beneficiaryVault: string,
      overrides?: CallOverrides
    ): Promise<void>;

    beneficiaryVaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    contractRegistry(overrides?: CallOverrides): Promise<string>;

    defaultRegion(overrides?: CallOverrides): Promise<string>;

    getAllRegions(overrides?: CallOverrides): Promise<string[]>;

    getAllVaults(overrides?: CallOverrides): Promise<string[]>;

    regionExists(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    regionVaults(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;

    regions(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "RegionAdded(bytes32)"(
      region?: null
    ): TypedEventFilter<[string], { region: string }>;

    RegionAdded(region?: null): TypedEventFilter<[string], { region: string }>;
  };

  estimateGas: {
    addRegion(
      region_: BytesLike,
      _beneficiaryVault: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    beneficiaryVaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    contractRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    defaultRegion(overrides?: CallOverrides): Promise<BigNumber>;

    getAllRegions(overrides?: CallOverrides): Promise<BigNumber>;

    getAllVaults(overrides?: CallOverrides): Promise<BigNumber>;

    regionExists(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    regionVaults(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    regions(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    addRegion(
      region_: BytesLike,
      _beneficiaryVault: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    beneficiaryVaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    contractRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    defaultRegion(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAllRegions(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAllVaults(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    regionExists(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    regionVaults(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    regions(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}