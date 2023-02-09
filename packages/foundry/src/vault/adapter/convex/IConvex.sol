// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

interface IConvexBooster {
  function deposit(
    uint256 pid,
    uint256 amount,
    bool stake
  ) external;

  function withdraw(uint256 pid, uint256 amount) external;

  function poolInfo(uint256 pid)
    external
    view
    returns (
      address lpToken,
      address token,
      address gauge,
      address crvRewards,
      address stash,
      bool shutdown
    );
}

interface IBaseRewarder {
  function balanceOf(address addr) external view returns (uint256);

  function stakingToken() external view returns (address);

  function withdrawAndUnwrap(uint256 amount, bool claim) external returns (bool);
}
