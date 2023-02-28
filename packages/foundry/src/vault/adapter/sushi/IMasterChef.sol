// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { IERC20Upgradeable as IERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface IMasterChef {
  struct PoolInfo {
    IERC20 lpToken; // Address of LP token contract.
    uint256 allocPoint; // How many allocation points assigned to this pool. SUSHI to distribute per block.
    uint256 lastRewardBlock; // Last block number that SUSHI distribution occurs.
    uint256 accSushiPerShare; // Accumulated SUSHI per share, times 1e12. See below.
  }

  struct UserInfo {
    uint256 amount; // How many LP tokens the user has provided.
    uint256 rewardDebt; // Reward debt. See explanation below.
  }

  function poolInfo(uint256 pid) external view returns (IMasterChef.PoolInfo memory);

  function userInfo(uint256 pid, address adapterAddress) external view returns (IMasterChef.UserInfo memory);

  function totalAllocPoint() external view returns (uint256);

  function deposit(uint256 _pid, uint256 _amount) external;

  function withdraw(uint256 _pid, uint256 _amount) external;

  function enterStaking(uint256 _amount) external;

  function leaveStaking(uint256 _amount) external;

  function emergencyWithdraw(uint256 _pid) external;
}
