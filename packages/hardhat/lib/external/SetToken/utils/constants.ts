import { BigNumber, constants } from "ethers";

const { AddressZero, MaxUint256, One, Two, Zero } = constants;
BigNumber;
export const MODULE_STATE = {
  NONE: 0,
  PENDING: 1,
  INITIALIZED: 2,
};

export const POSITION_STATE = {
  DEFAULT: 0,
  EXTERNAL: 1,
};

export const ADDRESS_ZERO = AddressZero;
export const EMPTY_BYTES = "0x";
export const MAX_UINT_256 = MaxUint256;
export const ONE = One;
export const TWO = Two;
export const ZERO = Zero;
export const MAX_INT_256 =
  "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
export const MIN_INT_256 =
  "-0x8000000000000000000000000000000000000000000000000000000000000000";
export const PRECISE_UNIT = constants.WeiPerEther;
export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
