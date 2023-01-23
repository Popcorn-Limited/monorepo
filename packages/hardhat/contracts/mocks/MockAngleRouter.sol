// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";
import "hardhat/console.sol";

contract MockAngleRouter {
  MockERC20 public agEur;
  MockERC20 public usdc;

  uint256 public eurPrice;

  constructor(
    MockERC20 _agEur,
    MockERC20 _usdc,
    uint256 _eurPrice
  ) {
    agEur = _agEur;
    usdc = _usdc;
    eurPrice = _eurPrice;
  }

  /// @notice Wrapper built on top of the `_mint` method to mint stablecoins
  /// @param user Address to send the stablecoins to
  /// @param amount Amount of collateral to use for the mint
  function mint(
    address user,
    uint256 amount,
    uint256,
    address,
    address
  ) external {
    usdc.transferFrom(msg.sender, address(this), amount);
    agEur.mint(user, (amount * 1e12) / eurPrice);
  }

  /// @notice Wrapper built on top of the `_burn` method to burn stablecoins
  /// @param dest Address to send the collateral to
  /// @param amount Amount of stablecoins to use for the burn
  function burn(
    address dest,
    uint256 amount,
    uint256,
    address,
    address
  ) external {
    agEur.transferFrom(msg.sender, address(this), amount);
    usdc.mint(dest, (amount * eurPrice) / 1e12);
  }
}
