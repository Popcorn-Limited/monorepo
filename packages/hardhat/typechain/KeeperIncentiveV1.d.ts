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

interface KeeperIncentiveV1Interface extends ethers.utils.Interface {
  functions: {
    "addControllerContract(bytes32,address)": FunctionFragment;
    "burnRate()": FunctionFragment;
    "controllerContracts(bytes32)": FunctionFragment;
    "createIncentive(bytes32,uint256,bool,bool)": FunctionFragment;
    "fundIncentive(uint256)": FunctionFragment;
    "handleKeeperIncentive(bytes32,uint8,address)": FunctionFragment;
    "incentiveBudget()": FunctionFragment;
    "incentives(bytes32,uint256)": FunctionFragment;
    "requiredKeeperStake()": FunctionFragment;
    "toggleApproval(bytes32,uint8)": FunctionFragment;
    "toggleIncentive(bytes32,uint8)": FunctionFragment;
    "updateBurnRate(uint256)": FunctionFragment;
    "updateIncentive(bytes32,uint8,uint256,bool,bool)": FunctionFragment;
    "updateRequiredKeeperStake(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addControllerContract",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(functionFragment: "burnRate", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "controllerContracts",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "createIncentive",
    values: [BytesLike, BigNumberish, boolean, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "fundIncentive",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "handleKeeperIncentive",
    values: [BytesLike, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "incentiveBudget",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "incentives",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "requiredKeeperStake",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "toggleApproval",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "toggleIncentive",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateBurnRate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateIncentive",
    values: [BytesLike, BigNumberish, BigNumberish, boolean, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "updateRequiredKeeperStake",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "addControllerContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "burnRate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "controllerContracts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createIncentive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "fundIncentive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "handleKeeperIncentive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "incentiveBudget",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "incentives", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "requiredKeeperStake",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "toggleApproval",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "toggleIncentive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateBurnRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateIncentive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateRequiredKeeperStake",
    data: BytesLike
  ): Result;

  events: {
    "ApprovalToggled(bytes32,bool)": EventFragment;
    "BurnRateChanged(uint256,uint256)": EventFragment;
    "Burned(uint256)": EventFragment;
    "ControllerContractAdded(bytes32,address)": EventFragment;
    "IncentiveChanged(bytes32,uint256,uint256,bool,bool)": EventFragment;
    "IncentiveCreated(bytes32,uint256,bool)": EventFragment;
    "IncentiveFunded(uint256)": EventFragment;
    "IncentiveToggled(bytes32,bool)": EventFragment;
    "RequiredKeeperStakeChanged(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ApprovalToggled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BurnRateChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Burned"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ControllerContractAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncentiveChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncentiveCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncentiveFunded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncentiveToggled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RequiredKeeperStakeChanged"): EventFragment;
}

export type ApprovalToggledEvent = TypedEvent<
  [string, boolean] & { contractName: string; openToEveryone: boolean }
>;

export type BurnRateChangedEvent = TypedEvent<
  [BigNumber, BigNumber] & { oldRate: BigNumber; newRate: BigNumber }
>;

export type BurnedEvent = TypedEvent<[BigNumber] & { amount: BigNumber }>;

export type ControllerContractAddedEvent = TypedEvent<
  [string, string] & { contractName: string; contractAddress: string }
>;

export type IncentiveChangedEvent = TypedEvent<
  [string, BigNumber, BigNumber, boolean, boolean] & {
    contractName: string;
    oldReward: BigNumber;
    newReward: BigNumber;
    oldOpenToEveryone: boolean;
    newOpenToEveryone: boolean;
  }
>;

export type IncentiveCreatedEvent = TypedEvent<
  [string, BigNumber, boolean] & {
    contractName: string;
    reward: BigNumber;
    openToEveryone: boolean;
  }
>;

export type IncentiveFundedEvent = TypedEvent<
  [BigNumber] & { amount: BigNumber }
>;

export type IncentiveToggledEvent = TypedEvent<
  [string, boolean] & { contractName: string; enabled: boolean }
>;

export type RequiredKeeperStakeChangedEvent = TypedEvent<
  [BigNumber, BigNumber] & {
    oldRequirement: BigNumber;
    newRequirement: BigNumber;
  }
>;

export class KeeperIncentiveV1 extends BaseContract {
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

  interface: KeeperIncentiveV1Interface;

  functions: {
    addControllerContract(
      _contractName: BytesLike,
      contract_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    burnRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    controllerContracts(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    createIncentive(
      _contractName: BytesLike,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fundIncentive(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    handleKeeperIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _keeper: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    incentiveBudget(overrides?: CallOverrides): Promise<[BigNumber]>;

    incentives(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, boolean, boolean] & {
        reward: BigNumber;
        enabled: boolean;
        openToEveryone: boolean;
      }
    >;

    requiredKeeperStake(overrides?: CallOverrides): Promise<[BigNumber]>;

    toggleApproval(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    toggleIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateBurnRate(
      _burnRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateRequiredKeeperStake(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addControllerContract(
    _contractName: BytesLike,
    contract_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  burnRate(overrides?: CallOverrides): Promise<BigNumber>;

  controllerContracts(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  createIncentive(
    _contractName: BytesLike,
    _reward: BigNumberish,
    _enabled: boolean,
    _openToEveryone: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fundIncentive(
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  handleKeeperIncentive(
    _contractName: BytesLike,
    _i: BigNumberish,
    _keeper: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  incentiveBudget(overrides?: CallOverrides): Promise<BigNumber>;

  incentives(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, boolean, boolean] & {
      reward: BigNumber;
      enabled: boolean;
      openToEveryone: boolean;
    }
  >;

  requiredKeeperStake(overrides?: CallOverrides): Promise<BigNumber>;

  toggleApproval(
    _contractName: BytesLike,
    _i: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  toggleIncentive(
    _contractName: BytesLike,
    _i: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateBurnRate(
    _burnRate: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateIncentive(
    _contractName: BytesLike,
    _i: BigNumberish,
    _reward: BigNumberish,
    _enabled: boolean,
    _openToEveryone: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateRequiredKeeperStake(
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addControllerContract(
      _contractName: BytesLike,
      contract_: string,
      overrides?: CallOverrides
    ): Promise<void>;

    burnRate(overrides?: CallOverrides): Promise<BigNumber>;

    controllerContracts(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    createIncentive(
      _contractName: BytesLike,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    fundIncentive(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    handleKeeperIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _keeper: string,
      overrides?: CallOverrides
    ): Promise<void>;

    incentiveBudget(overrides?: CallOverrides): Promise<BigNumber>;

    incentives(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, boolean, boolean] & {
        reward: BigNumber;
        enabled: boolean;
        openToEveryone: boolean;
      }
    >;

    requiredKeeperStake(overrides?: CallOverrides): Promise<BigNumber>;

    toggleApproval(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    toggleIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    updateBurnRate(
      _burnRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    updateIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    updateRequiredKeeperStake(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "ApprovalToggled(bytes32,bool)"(
      contractName?: null,
      openToEveryone?: null
    ): TypedEventFilter<
      [string, boolean],
      { contractName: string; openToEveryone: boolean }
    >;

    ApprovalToggled(
      contractName?: null,
      openToEveryone?: null
    ): TypedEventFilter<
      [string, boolean],
      { contractName: string; openToEveryone: boolean }
    >;

    "BurnRateChanged(uint256,uint256)"(
      oldRate?: null,
      newRate?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { oldRate: BigNumber; newRate: BigNumber }
    >;

    BurnRateChanged(
      oldRate?: null,
      newRate?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { oldRate: BigNumber; newRate: BigNumber }
    >;

    "Burned(uint256)"(
      amount?: null
    ): TypedEventFilter<[BigNumber], { amount: BigNumber }>;

    Burned(amount?: null): TypedEventFilter<[BigNumber], { amount: BigNumber }>;

    "ControllerContractAdded(bytes32,address)"(
      contractName?: null,
      contractAddress?: null
    ): TypedEventFilter<
      [string, string],
      { contractName: string; contractAddress: string }
    >;

    ControllerContractAdded(
      contractName?: null,
      contractAddress?: null
    ): TypedEventFilter<
      [string, string],
      { contractName: string; contractAddress: string }
    >;

    "IncentiveChanged(bytes32,uint256,uint256,bool,bool)"(
      contractName?: null,
      oldReward?: null,
      newReward?: null,
      oldOpenToEveryone?: null,
      newOpenToEveryone?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, boolean, boolean],
      {
        contractName: string;
        oldReward: BigNumber;
        newReward: BigNumber;
        oldOpenToEveryone: boolean;
        newOpenToEveryone: boolean;
      }
    >;

    IncentiveChanged(
      contractName?: null,
      oldReward?: null,
      newReward?: null,
      oldOpenToEveryone?: null,
      newOpenToEveryone?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, boolean, boolean],
      {
        contractName: string;
        oldReward: BigNumber;
        newReward: BigNumber;
        oldOpenToEveryone: boolean;
        newOpenToEveryone: boolean;
      }
    >;

    "IncentiveCreated(bytes32,uint256,bool)"(
      contractName?: null,
      reward?: null,
      openToEveryone?: null
    ): TypedEventFilter<
      [string, BigNumber, boolean],
      { contractName: string; reward: BigNumber; openToEveryone: boolean }
    >;

    IncentiveCreated(
      contractName?: null,
      reward?: null,
      openToEveryone?: null
    ): TypedEventFilter<
      [string, BigNumber, boolean],
      { contractName: string; reward: BigNumber; openToEveryone: boolean }
    >;

    "IncentiveFunded(uint256)"(
      amount?: null
    ): TypedEventFilter<[BigNumber], { amount: BigNumber }>;

    IncentiveFunded(
      amount?: null
    ): TypedEventFilter<[BigNumber], { amount: BigNumber }>;

    "IncentiveToggled(bytes32,bool)"(
      contractName?: null,
      enabled?: null
    ): TypedEventFilter<
      [string, boolean],
      { contractName: string; enabled: boolean }
    >;

    IncentiveToggled(
      contractName?: null,
      enabled?: null
    ): TypedEventFilter<
      [string, boolean],
      { contractName: string; enabled: boolean }
    >;

    "RequiredKeeperStakeChanged(uint256,uint256)"(
      oldRequirement?: null,
      newRequirement?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { oldRequirement: BigNumber; newRequirement: BigNumber }
    >;

    RequiredKeeperStakeChanged(
      oldRequirement?: null,
      newRequirement?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { oldRequirement: BigNumber; newRequirement: BigNumber }
    >;
  };

  estimateGas: {
    addControllerContract(
      _contractName: BytesLike,
      contract_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    burnRate(overrides?: CallOverrides): Promise<BigNumber>;

    controllerContracts(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createIncentive(
      _contractName: BytesLike,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fundIncentive(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    handleKeeperIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _keeper: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    incentiveBudget(overrides?: CallOverrides): Promise<BigNumber>;

    incentives(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    requiredKeeperStake(overrides?: CallOverrides): Promise<BigNumber>;

    toggleApproval(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    toggleIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateBurnRate(
      _burnRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateRequiredKeeperStake(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addControllerContract(
      _contractName: BytesLike,
      contract_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    burnRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    controllerContracts(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createIncentive(
      _contractName: BytesLike,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fundIncentive(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    handleKeeperIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _keeper: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    incentiveBudget(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    incentives(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    requiredKeeperStake(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    toggleApproval(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    toggleIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateBurnRate(
      _burnRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateIncentive(
      _contractName: BytesLike,
      _i: BigNumberish,
      _reward: BigNumberish,
      _enabled: boolean,
      _openToEveryone: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateRequiredKeeperStake(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
