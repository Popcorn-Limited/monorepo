// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

// this is the LP token
// https://github.com/hop-exchange/contracts/blob/28ec0f1a8df497a102c0a3e779a68a81bf69b9ad/contracts/saddle/LPToken.sol

interface ILiquidityPool {
  struct Swap {
    uint256 initialA;
    uint256 futureA;
    uint256 initialATime;
    uint256 futureATime;
    uint256 swapFee;
    uint256 adminFee;
    uint256 defaultWithdrawFee;
    address lpToken;
    // LPToken lpToken;
    // IERC20[] pooledTokens;
    uint256[] tokenPrecisionMultipliers;
    uint256[] balances;
    // mapping(address => uint256) depositTimestamp;
    // mapping(address => uint256) withdrawFeeMultiplier;
  }

  function addLiquidity(
    uint256[] calldata amounts,
    uint256 minToMint,
    uint256 deadline
  ) external returns (uint256);

  function removeLiquidity(
    uint256 amount,
    uint256[] calldata minAmounts,
    uint256 deadline
  ) external returns (uint256[] memory);

  function getVirtualPrice() external view returns (uint256);

  function swapStorage() external view returns (ILiquidityPool.Swap memory);
}

// this is lp token on arbitrum  https://arbiscan.io/address/0xb0cabfe930642ad3e7decdc741884d8c3f7ebc70#writeContract

// they are using this contract https://github.com/Synthetixio/synthetix/blob/develop/contracts/StakingRewards.sol
interface IStakingRewards {
  // Views
  function lastTimeRewardApplicable() external view returns (uint256);

  function rewardPerToken() external view returns (uint256);

  function earned(address account) external view returns (uint256);

  function getRewardForDuration() external view returns (uint256);

  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);

  // Mutative

  function stake(uint256 amount) external;

  function withdraw(uint256 amount) external;

  function getReward() external;

  function exit() external;
}
