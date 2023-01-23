// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../core/dao/GovStaking.sol";

contract StakingDefendedHelper {
  using SafeERC20 for IERC20;

  IERC20 public token;
  GovStaking public staking;

  constructor(IERC20 _token, GovStaking _staking) {
    token = _token;
    staking = _staking;
  }

  function stake(uint256 amount) public {
    token.approve(address(staking), amount);
    staking.stake(amount, 604800);
  }
}
