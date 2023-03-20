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

interface GrantElectionsInterface extends ethers.utils.Interface {
  functions: {
    "_isEligibleBeneficiary(address,uint256)": FunctionFragment;
    "activeElections(bytes32,uint256)": FunctionFragment;
    "approveFinalization(uint256,bytes32)": FunctionFragment;
    "contractName()": FunctionFragment;
    "electionDefaults(uint256)": FunctionFragment;
    "electionEnabled(uint256)": FunctionFragment;
    "elections(uint256)": FunctionFragment;
    "fundKeeperIncentive(uint256)": FunctionFragment;
    "getElectionMerkleRoot(uint256)": FunctionFragment;
    "getElectionMetadata(uint256)": FunctionFragment;
    "getRandomNumber(uint256)": FunctionFragment;
    "getRegisteredBeneficiaries(uint256)": FunctionFragment;
    "incentiveBudget()": FunctionFragment;
    "initialize(uint8,bytes32)": FunctionFragment;
    "proposeFinalization(uint256,bytes32)": FunctionFragment;
    "refreshElectionState(uint256)": FunctionFragment;
    "registerForElection(address,uint256)": FunctionFragment;
    "setConfiguration(uint8,uint8,uint8,bool,uint256,uint256,uint256,uint256,bool,uint256,bool,uint8)": FunctionFragment;
    "toggleRegistrationBondRequirement(uint8)": FunctionFragment;
    "vote(address[],uint256[],uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "_isEligibleBeneficiary",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "activeElections",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "approveFinalization",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "contractName",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "electionDefaults",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "electionEnabled",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "elections",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "fundKeeperIncentive",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getElectionMerkleRoot",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getElectionMetadata",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRandomNumber",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRegisteredBeneficiaries",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "incentiveBudget",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "proposeFinalization",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "refreshElectionState",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "registerForElection",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setConfiguration",
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      boolean,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      boolean,
      BigNumberish,
      boolean,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "toggleRegistrationBondRequirement",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "vote",
    values: [string[], BigNumberish[], BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "_isEligibleBeneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "activeElections",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "approveFinalization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "contractName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "electionDefaults",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "electionEnabled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "elections", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "fundKeeperIncentive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getElectionMerkleRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getElectionMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRandomNumber",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRegisteredBeneficiaries",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "incentiveBudget",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proposeFinalization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "refreshElectionState",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerForElection",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setConfiguration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "toggleRegistrationBondRequirement",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;

  events: {
    "BeneficiaryRegistered(address,uint256)": EventFragment;
    "ElectionFinalized(uint256,bytes32)": EventFragment;
    "ElectionInitialized(uint8,bytes32,uint256)": EventFragment;
    "FinalizationProposed(uint256,bytes32)": EventFragment;
    "UserVoted(address,uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BeneficiaryRegistered"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ElectionFinalized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ElectionInitialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FinalizationProposed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserVoted"): EventFragment;
}

export type BeneficiaryRegisteredEvent = TypedEvent<
  [string, BigNumber] & { _beneficiary: string; _electionId: BigNumber }
>;

export type ElectionFinalizedEvent = TypedEvent<
  [BigNumber, string] & { _electionId: BigNumber; _merkleRoot: string }
>;

export type ElectionInitializedEvent = TypedEvent<
  [number, string, BigNumber] & {
    _term: number;
    _region: string;
    _startTime: BigNumber;
  }
>;

export type FinalizationProposedEvent = TypedEvent<
  [BigNumber, string] & { _electionId: BigNumber; _merkleRoot: string }
>;

export type UserVotedEvent = TypedEvent<
  [string, number] & { _user: string; _term: number }
>;

export class GrantElections extends BaseContract {
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

  interface: GrantElectionsInterface;

  functions: {
    _isEligibleBeneficiary(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    activeElections(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    approveFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    contractName(overrides?: CallOverrides): Promise<[string]>;

    electionDefaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        number,
        number,
        boolean,
        BigNumber,
        BigNumber,
        BigNumber,
        [boolean, BigNumber] & { required: boolean; amount: BigNumber },
        BigNumber,
        boolean,
        number
      ] & {
        ranking: number;
        awardees: number;
        useChainLinkVRF: boolean;
        registrationPeriod: BigNumber;
        votingPeriod: BigNumber;
        cooldownPeriod: BigNumber;
        bondRequirements: [boolean, BigNumber] & {
          required: boolean;
          amount: BigNumber;
        };
        finalizationIncentive: BigNumber;
        enabled: boolean;
        shareType: number;
      }
    >;

    electionEnabled(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    elections(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        number,
        number,
        [
          number,
          number,
          boolean,
          BigNumber,
          BigNumber,
          BigNumber,
          [boolean, BigNumber] & { required: boolean; amount: BigNumber },
          BigNumber,
          boolean,
          number
        ] & {
          ranking: number;
          awardees: number;
          useChainLinkVRF: boolean;
          registrationPeriod: BigNumber;
          votingPeriod: BigNumber;
          cooldownPeriod: BigNumber;
          bondRequirements: [boolean, BigNumber] & {
            required: boolean;
            amount: BigNumber;
          };
          finalizationIncentive: BigNumber;
          enabled: boolean;
          shareType: number;
        },
        BigNumber,
        BigNumber,
        string,
        string,
        string
      ] & {
        electionTerm: number;
        electionState: number;
        electionConfiguration: [
          number,
          number,
          boolean,
          BigNumber,
          BigNumber,
          BigNumber,
          [boolean, BigNumber] & { required: boolean; amount: BigNumber },
          BigNumber,
          boolean,
          number
        ] & {
          ranking: number;
          awardees: number;
          useChainLinkVRF: boolean;
          registrationPeriod: BigNumber;
          votingPeriod: BigNumber;
          cooldownPeriod: BigNumber;
          bondRequirements: [boolean, BigNumber] & {
            required: boolean;
            amount: BigNumber;
          };
          finalizationIncentive: BigNumber;
          enabled: boolean;
          shareType: number;
        };
        startTime: BigNumber;
        randomNumber: BigNumber;
        merkleRoot: string;
        vaultId: string;
        region: string;
      }
    >;

    fundKeeperIncentive(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getElectionMerkleRoot(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { merkleRoot: string }>;

    getElectionMetadata(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        ([string, string, BigNumber] & {
          voter: string;
          beneficiary: string;
          weight: BigNumber;
        })[],
        number,
        string[],
        number,
        [number, number],
        boolean,
        [BigNumber, BigNumber, BigNumber],
        BigNumber,
        [boolean, BigNumber] & { required: boolean; amount: BigNumber },
        number,
        BigNumber
      ] & {
        votes_: ([string, string, BigNumber] & {
          voter: string;
          beneficiary: string;
          weight: BigNumber;
        })[];
        term_: number;
        registeredBeneficiaries_: string[];
        state_: number;
        awardeesRanking_: [number, number];
        useChainLinkVRF_: boolean;
        periods_: [BigNumber, BigNumber, BigNumber];
        startTime_: BigNumber;
        bondRequirements_: [boolean, BigNumber] & {
          required: boolean;
          amount: BigNumber;
        };
        shareType_: number;
        randomNumber_: BigNumber;
      }
    >;

    getRandomNumber(
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getRegisteredBeneficiaries(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]] & { beneficiaries: string[] }>;

    incentiveBudget(overrides?: CallOverrides): Promise<[BigNumber]>;

    initialize(
      _grantTerm: BigNumberish,
      _region: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    proposeFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    refreshElectionState(
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    registerForElection(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setConfiguration(
      _term: BigNumberish,
      _ranking: BigNumberish,
      _awardees: BigNumberish,
      _useChainLinkVRF: boolean,
      _registrationPeriod: BigNumberish,
      _votingPeriod: BigNumberish,
      _cooldownPeriod: BigNumberish,
      _bondAmount: BigNumberish,
      _bondRequired: boolean,
      _finalizationIncentive: BigNumberish,
      _enabled: boolean,
      _shareType: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    toggleRegistrationBondRequirement(
      _term: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    vote(
      _beneficiaries: string[],
      _voiceCredits: BigNumberish[],
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  _isEligibleBeneficiary(
    _beneficiary: string,
    _electionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  activeElections(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  approveFinalization(
    _electionId: BigNumberish,
    _merkleRoot: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  contractName(overrides?: CallOverrides): Promise<string>;

  electionDefaults(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [
      number,
      number,
      boolean,
      BigNumber,
      BigNumber,
      BigNumber,
      [boolean, BigNumber] & { required: boolean; amount: BigNumber },
      BigNumber,
      boolean,
      number
    ] & {
      ranking: number;
      awardees: number;
      useChainLinkVRF: boolean;
      registrationPeriod: BigNumber;
      votingPeriod: BigNumber;
      cooldownPeriod: BigNumber;
      bondRequirements: [boolean, BigNumber] & {
        required: boolean;
        amount: BigNumber;
      };
      finalizationIncentive: BigNumber;
      enabled: boolean;
      shareType: number;
    }
  >;

  electionEnabled(
    _electionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  elections(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [
      number,
      number,
      [
        number,
        number,
        boolean,
        BigNumber,
        BigNumber,
        BigNumber,
        [boolean, BigNumber] & { required: boolean; amount: BigNumber },
        BigNumber,
        boolean,
        number
      ] & {
        ranking: number;
        awardees: number;
        useChainLinkVRF: boolean;
        registrationPeriod: BigNumber;
        votingPeriod: BigNumber;
        cooldownPeriod: BigNumber;
        bondRequirements: [boolean, BigNumber] & {
          required: boolean;
          amount: BigNumber;
        };
        finalizationIncentive: BigNumber;
        enabled: boolean;
        shareType: number;
      },
      BigNumber,
      BigNumber,
      string,
      string,
      string
    ] & {
      electionTerm: number;
      electionState: number;
      electionConfiguration: [
        number,
        number,
        boolean,
        BigNumber,
        BigNumber,
        BigNumber,
        [boolean, BigNumber] & { required: boolean; amount: BigNumber },
        BigNumber,
        boolean,
        number
      ] & {
        ranking: number;
        awardees: number;
        useChainLinkVRF: boolean;
        registrationPeriod: BigNumber;
        votingPeriod: BigNumber;
        cooldownPeriod: BigNumber;
        bondRequirements: [boolean, BigNumber] & {
          required: boolean;
          amount: BigNumber;
        };
        finalizationIncentive: BigNumber;
        enabled: boolean;
        shareType: number;
      };
      startTime: BigNumber;
      randomNumber: BigNumber;
      merkleRoot: string;
      vaultId: string;
      region: string;
    }
  >;

  fundKeeperIncentive(
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getElectionMerkleRoot(
    _electionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  getElectionMetadata(
    _electionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [
      ([string, string, BigNumber] & {
        voter: string;
        beneficiary: string;
        weight: BigNumber;
      })[],
      number,
      string[],
      number,
      [number, number],
      boolean,
      [BigNumber, BigNumber, BigNumber],
      BigNumber,
      [boolean, BigNumber] & { required: boolean; amount: BigNumber },
      number,
      BigNumber
    ] & {
      votes_: ([string, string, BigNumber] & {
        voter: string;
        beneficiary: string;
        weight: BigNumber;
      })[];
      term_: number;
      registeredBeneficiaries_: string[];
      state_: number;
      awardeesRanking_: [number, number];
      useChainLinkVRF_: boolean;
      periods_: [BigNumber, BigNumber, BigNumber];
      startTime_: BigNumber;
      bondRequirements_: [boolean, BigNumber] & {
        required: boolean;
        amount: BigNumber;
      };
      shareType_: number;
      randomNumber_: BigNumber;
    }
  >;

  getRandomNumber(
    _electionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getRegisteredBeneficiaries(
    _electionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  incentiveBudget(overrides?: CallOverrides): Promise<BigNumber>;

  initialize(
    _grantTerm: BigNumberish,
    _region: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  proposeFinalization(
    _electionId: BigNumberish,
    _merkleRoot: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  refreshElectionState(
    _electionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  registerForElection(
    _beneficiary: string,
    _electionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setConfiguration(
    _term: BigNumberish,
    _ranking: BigNumberish,
    _awardees: BigNumberish,
    _useChainLinkVRF: boolean,
    _registrationPeriod: BigNumberish,
    _votingPeriod: BigNumberish,
    _cooldownPeriod: BigNumberish,
    _bondAmount: BigNumberish,
    _bondRequired: boolean,
    _finalizationIncentive: BigNumberish,
    _enabled: boolean,
    _shareType: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  toggleRegistrationBondRequirement(
    _term: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  vote(
    _beneficiaries: string[],
    _voiceCredits: BigNumberish[],
    _electionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _isEligibleBeneficiary(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    activeElections(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approveFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    contractName(overrides?: CallOverrides): Promise<string>;

    electionDefaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        number,
        number,
        boolean,
        BigNumber,
        BigNumber,
        BigNumber,
        [boolean, BigNumber] & { required: boolean; amount: BigNumber },
        BigNumber,
        boolean,
        number
      ] & {
        ranking: number;
        awardees: number;
        useChainLinkVRF: boolean;
        registrationPeriod: BigNumber;
        votingPeriod: BigNumber;
        cooldownPeriod: BigNumber;
        bondRequirements: [boolean, BigNumber] & {
          required: boolean;
          amount: BigNumber;
        };
        finalizationIncentive: BigNumber;
        enabled: boolean;
        shareType: number;
      }
    >;

    electionEnabled(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    elections(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        number,
        number,
        [
          number,
          number,
          boolean,
          BigNumber,
          BigNumber,
          BigNumber,
          [boolean, BigNumber] & { required: boolean; amount: BigNumber },
          BigNumber,
          boolean,
          number
        ] & {
          ranking: number;
          awardees: number;
          useChainLinkVRF: boolean;
          registrationPeriod: BigNumber;
          votingPeriod: BigNumber;
          cooldownPeriod: BigNumber;
          bondRequirements: [boolean, BigNumber] & {
            required: boolean;
            amount: BigNumber;
          };
          finalizationIncentive: BigNumber;
          enabled: boolean;
          shareType: number;
        },
        BigNumber,
        BigNumber,
        string,
        string,
        string
      ] & {
        electionTerm: number;
        electionState: number;
        electionConfiguration: [
          number,
          number,
          boolean,
          BigNumber,
          BigNumber,
          BigNumber,
          [boolean, BigNumber] & { required: boolean; amount: BigNumber },
          BigNumber,
          boolean,
          number
        ] & {
          ranking: number;
          awardees: number;
          useChainLinkVRF: boolean;
          registrationPeriod: BigNumber;
          votingPeriod: BigNumber;
          cooldownPeriod: BigNumber;
          bondRequirements: [boolean, BigNumber] & {
            required: boolean;
            amount: BigNumber;
          };
          finalizationIncentive: BigNumber;
          enabled: boolean;
          shareType: number;
        };
        startTime: BigNumber;
        randomNumber: BigNumber;
        merkleRoot: string;
        vaultId: string;
        region: string;
      }
    >;

    fundKeeperIncentive(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getElectionMerkleRoot(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getElectionMetadata(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        ([string, string, BigNumber] & {
          voter: string;
          beneficiary: string;
          weight: BigNumber;
        })[],
        number,
        string[],
        number,
        [number, number],
        boolean,
        [BigNumber, BigNumber, BigNumber],
        BigNumber,
        [boolean, BigNumber] & { required: boolean; amount: BigNumber },
        number,
        BigNumber
      ] & {
        votes_: ([string, string, BigNumber] & {
          voter: string;
          beneficiary: string;
          weight: BigNumber;
        })[];
        term_: number;
        registeredBeneficiaries_: string[];
        state_: number;
        awardeesRanking_: [number, number];
        useChainLinkVRF_: boolean;
        periods_: [BigNumber, BigNumber, BigNumber];
        startTime_: BigNumber;
        bondRequirements_: [boolean, BigNumber] & {
          required: boolean;
          amount: BigNumber;
        };
        shareType_: number;
        randomNumber_: BigNumber;
      }
    >;

    getRandomNumber(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getRegisteredBeneficiaries(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    incentiveBudget(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _grantTerm: BigNumberish,
      _region: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    proposeFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    refreshElectionState(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    registerForElection(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setConfiguration(
      _term: BigNumberish,
      _ranking: BigNumberish,
      _awardees: BigNumberish,
      _useChainLinkVRF: boolean,
      _registrationPeriod: BigNumberish,
      _votingPeriod: BigNumberish,
      _cooldownPeriod: BigNumberish,
      _bondAmount: BigNumberish,
      _bondRequired: boolean,
      _finalizationIncentive: BigNumberish,
      _enabled: boolean,
      _shareType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    toggleRegistrationBondRequirement(
      _term: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    vote(
      _beneficiaries: string[],
      _voiceCredits: BigNumberish[],
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "BeneficiaryRegistered(address,uint256)"(
      _beneficiary?: null,
      _electionId?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { _beneficiary: string; _electionId: BigNumber }
    >;

    BeneficiaryRegistered(
      _beneficiary?: null,
      _electionId?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { _beneficiary: string; _electionId: BigNumber }
    >;

    "ElectionFinalized(uint256,bytes32)"(
      _electionId?: null,
      _merkleRoot?: null
    ): TypedEventFilter<
      [BigNumber, string],
      { _electionId: BigNumber; _merkleRoot: string }
    >;

    ElectionFinalized(
      _electionId?: null,
      _merkleRoot?: null
    ): TypedEventFilter<
      [BigNumber, string],
      { _electionId: BigNumber; _merkleRoot: string }
    >;

    "ElectionInitialized(uint8,bytes32,uint256)"(
      _term?: null,
      _region?: null,
      _startTime?: null
    ): TypedEventFilter<
      [number, string, BigNumber],
      { _term: number; _region: string; _startTime: BigNumber }
    >;

    ElectionInitialized(
      _term?: null,
      _region?: null,
      _startTime?: null
    ): TypedEventFilter<
      [number, string, BigNumber],
      { _term: number; _region: string; _startTime: BigNumber }
    >;

    "FinalizationProposed(uint256,bytes32)"(
      _electionId?: null,
      _merkleRoot?: null
    ): TypedEventFilter<
      [BigNumber, string],
      { _electionId: BigNumber; _merkleRoot: string }
    >;

    FinalizationProposed(
      _electionId?: null,
      _merkleRoot?: null
    ): TypedEventFilter<
      [BigNumber, string],
      { _electionId: BigNumber; _merkleRoot: string }
    >;

    "UserVoted(address,uint8)"(
      _user?: null,
      _term?: null
    ): TypedEventFilter<[string, number], { _user: string; _term: number }>;

    UserVoted(
      _user?: null,
      _term?: null
    ): TypedEventFilter<[string, number], { _user: string; _term: number }>;
  };

  estimateGas: {
    _isEligibleBeneficiary(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    activeElections(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approveFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    contractName(overrides?: CallOverrides): Promise<BigNumber>;

    electionDefaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    electionEnabled(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    elections(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    fundKeeperIncentive(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getElectionMerkleRoot(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getElectionMetadata(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRandomNumber(
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getRegisteredBeneficiaries(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    incentiveBudget(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _grantTerm: BigNumberish,
      _region: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    proposeFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    refreshElectionState(
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    registerForElection(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setConfiguration(
      _term: BigNumberish,
      _ranking: BigNumberish,
      _awardees: BigNumberish,
      _useChainLinkVRF: boolean,
      _registrationPeriod: BigNumberish,
      _votingPeriod: BigNumberish,
      _cooldownPeriod: BigNumberish,
      _bondAmount: BigNumberish,
      _bondRequired: boolean,
      _finalizationIncentive: BigNumberish,
      _enabled: boolean,
      _shareType: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    toggleRegistrationBondRequirement(
      _term: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    vote(
      _beneficiaries: string[],
      _voiceCredits: BigNumberish[],
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _isEligibleBeneficiary(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    activeElections(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    approveFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    contractName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    electionDefaults(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    electionEnabled(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    elections(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    fundKeeperIncentive(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getElectionMerkleRoot(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getElectionMetadata(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRandomNumber(
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getRegisteredBeneficiaries(
      _electionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    incentiveBudget(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      _grantTerm: BigNumberish,
      _region: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    proposeFinalization(
      _electionId: BigNumberish,
      _merkleRoot: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    refreshElectionState(
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    registerForElection(
      _beneficiary: string,
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setConfiguration(
      _term: BigNumberish,
      _ranking: BigNumberish,
      _awardees: BigNumberish,
      _useChainLinkVRF: boolean,
      _registrationPeriod: BigNumberish,
      _votingPeriod: BigNumberish,
      _cooldownPeriod: BigNumberish,
      _bondAmount: BigNumberish,
      _bondRequired: boolean,
      _finalizationIncentive: BigNumberish,
      _enabled: boolean,
      _shareType: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    toggleRegistrationBondRequirement(
      _term: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    vote(
      _beneficiaries: string[],
      _voiceCredits: BigNumberish[],
      _electionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
