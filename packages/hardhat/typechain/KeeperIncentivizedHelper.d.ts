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

interface KeeperIncentivizedHelperInterface extends ethers.utils.Interface {
  functions: {
    "KEEPER_INCENTIVE()": FunctionFragment;
    "contractName()": FunctionFragment;
    "handleKeeperIncentiveDirectCall()": FunctionFragment;
    "handleKeeperIncentiveModifierCall()": FunctionFragment;
    "tipIncentiveDirectCall(address,address,uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "KEEPER_INCENTIVE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "contractName",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "handleKeeperIncentiveDirectCall",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "handleKeeperIncentiveModifierCall",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tipIncentiveDirectCall",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "KEEPER_INCENTIVE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "contractName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "handleKeeperIncentiveDirectCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "handleKeeperIncentiveModifierCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tipIncentiveDirectCall",
    data: BytesLike
  ): Result;

  events: {
    "KeeperConfigUpdated(tuple,tuple)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "KeeperConfigUpdated"): EventFragment;
}

export type KeeperConfigUpdatedEvent = TypedEvent<
  [
    [BigNumber, BigNumber, BigNumber] & {
      minWithdrawalAmount: BigNumber;
      incentiveVigBps: BigNumber;
      keeperPayout: BigNumber;
    },
    [BigNumber, BigNumber, BigNumber] & {
      minWithdrawalAmount: BigNumber;
      incentiveVigBps: BigNumber;
      keeperPayout: BigNumber;
    }
  ] & {
    oldConfig: [BigNumber, BigNumber, BigNumber] & {
      minWithdrawalAmount: BigNumber;
      incentiveVigBps: BigNumber;
      keeperPayout: BigNumber;
    };
    newConfig: [BigNumber, BigNumber, BigNumber] & {
      minWithdrawalAmount: BigNumber;
      incentiveVigBps: BigNumber;
      keeperPayout: BigNumber;
    };
  }
>;

export class KeeperIncentivizedHelper extends BaseContract {
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

  interface: KeeperIncentivizedHelperInterface;

  functions: {
    KEEPER_INCENTIVE(overrides?: CallOverrides): Promise<[string]>;

    contractName(overrides?: CallOverrides): Promise<[string]>;

    handleKeeperIncentiveDirectCall(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    handleKeeperIncentiveModifierCall(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    tipIncentiveDirectCall(
      _rewardToken: string,
      _keeper: string,
      _i: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  KEEPER_INCENTIVE(overrides?: CallOverrides): Promise<string>;

  contractName(overrides?: CallOverrides): Promise<string>;

  handleKeeperIncentiveDirectCall(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  handleKeeperIncentiveModifierCall(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  tipIncentiveDirectCall(
    _rewardToken: string,
    _keeper: string,
    _i: BigNumberish,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    KEEPER_INCENTIVE(overrides?: CallOverrides): Promise<string>;

    contractName(overrides?: CallOverrides): Promise<string>;

    handleKeeperIncentiveDirectCall(overrides?: CallOverrides): Promise<void>;

    handleKeeperIncentiveModifierCall(overrides?: CallOverrides): Promise<void>;

    tipIncentiveDirectCall(
      _rewardToken: string,
      _keeper: string,
      _i: BigNumberish,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "KeeperConfigUpdated(tuple,tuple)"(
      oldConfig?: null,
      newConfig?: null
    ): TypedEventFilter<
      [
        [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        },
        [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        }
      ],
      {
        oldConfig: [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        };
        newConfig: [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        };
      }
    >;

    KeeperConfigUpdated(
      oldConfig?: null,
      newConfig?: null
    ): TypedEventFilter<
      [
        [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        },
        [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        }
      ],
      {
        oldConfig: [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        };
        newConfig: [BigNumber, BigNumber, BigNumber] & {
          minWithdrawalAmount: BigNumber;
          incentiveVigBps: BigNumber;
          keeperPayout: BigNumber;
        };
      }
    >;
  };

  estimateGas: {
    KEEPER_INCENTIVE(overrides?: CallOverrides): Promise<BigNumber>;

    contractName(overrides?: CallOverrides): Promise<BigNumber>;

    handleKeeperIncentiveDirectCall(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    handleKeeperIncentiveModifierCall(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    tipIncentiveDirectCall(
      _rewardToken: string,
      _keeper: string,
      _i: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    KEEPER_INCENTIVE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    contractName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    handleKeeperIncentiveDirectCall(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    handleKeeperIncentiveModifierCall(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    tipIncentiveDirectCall(
      _rewardToken: string,
      _keeper: string,
      _i: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
