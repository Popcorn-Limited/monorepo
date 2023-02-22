// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IStargateRewarder {
  function deposit(uint256 _pid, uint256 _amount) external;

  function pendingStargate(uint256 _pid, address _user) external view returns (uint256);
}
