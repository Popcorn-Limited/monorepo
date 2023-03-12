// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IRewarder {
  function pendingTokens(
    uint256 _pid,
    address _user,
    uint256
  ) external returns (address[] memory rewardTokens, uint256[] memory rewardAmounts);
}
