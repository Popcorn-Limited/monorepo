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

interface BeneficiaryRegistryInterface extends ethers.utils.Interface {
  functions: {
    "addBeneficiary(address,bytes32,string)": FunctionFragment;
    "beneficiaryExists(address)": FunctionFragment;
    "getBeneficiary(address)": FunctionFragment;
    "getBeneficiaryList()": FunctionFragment;
    "revokeBeneficiary(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addBeneficiary",
    values: [string, BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "beneficiaryExists",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getBeneficiary",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getBeneficiaryList",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "revokeBeneficiary",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "addBeneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "beneficiaryExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBeneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBeneficiaryList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "revokeBeneficiary",
    data: BytesLike
  ): Result;

  events: {
    "BeneficiaryAdded(address,string)": EventFragment;
    "BeneficiaryRevoked(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BeneficiaryAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BeneficiaryRevoked"): EventFragment;
}

export type BeneficiaryAddedEvent = TypedEvent<
  [string, string] & { _address: string; _applicationCid: string }
>;

export type BeneficiaryRevokedEvent = TypedEvent<
  [string] & { _address: string }
>;

export class BeneficiaryRegistry extends BaseContract {
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

  interface: BeneficiaryRegistryInterface;

  functions: {
    addBeneficiary(
      _account: string,
      _region: BytesLike,
      _applicationCid: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    beneficiaryExists(
      _address: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getBeneficiary(
      _address: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getBeneficiaryList(overrides?: CallOverrides): Promise<[string[]]>;

    revokeBeneficiary(
      _address: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addBeneficiary(
    _account: string,
    _region: BytesLike,
    _applicationCid: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  beneficiaryExists(
    _address: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  getBeneficiary(_address: string, overrides?: CallOverrides): Promise<string>;

  getBeneficiaryList(overrides?: CallOverrides): Promise<string[]>;

  revokeBeneficiary(
    _address: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addBeneficiary(
      _account: string,
      _region: BytesLike,
      _applicationCid: string,
      overrides?: CallOverrides
    ): Promise<void>;

    beneficiaryExists(
      _address: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getBeneficiary(
      _address: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getBeneficiaryList(overrides?: CallOverrides): Promise<string[]>;

    revokeBeneficiary(
      _address: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "BeneficiaryAdded(address,string)"(
      _address?: string | null,
      _applicationCid?: string | null
    ): TypedEventFilter<
      [string, string],
      { _address: string; _applicationCid: string }
    >;

    BeneficiaryAdded(
      _address?: string | null,
      _applicationCid?: string | null
    ): TypedEventFilter<
      [string, string],
      { _address: string; _applicationCid: string }
    >;

    "BeneficiaryRevoked(address)"(
      _address?: string | null
    ): TypedEventFilter<[string], { _address: string }>;

    BeneficiaryRevoked(
      _address?: string | null
    ): TypedEventFilter<[string], { _address: string }>;
  };

  estimateGas: {
    addBeneficiary(
      _account: string,
      _region: BytesLike,
      _applicationCid: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    beneficiaryExists(
      _address: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBeneficiary(
      _address: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBeneficiaryList(overrides?: CallOverrides): Promise<BigNumber>;

    revokeBeneficiary(
      _address: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addBeneficiary(
      _account: string,
      _region: BytesLike,
      _applicationCid: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    beneficiaryExists(
      _address: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBeneficiary(
      _address: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBeneficiaryList(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    revokeBeneficiary(
      _address: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
