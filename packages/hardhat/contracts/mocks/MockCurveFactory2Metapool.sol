// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";
import "hardhat/console.sol";

contract MockCurveFactory2Metapool is MockERC20 {
  using SafeERC20 for MockERC20;

  MockERC20 public tokenA;
  MockERC20 public tokenB;
  uint256 virtualPrice = 1e18;

  uint256 withdrawalSlippageBps = 10;

  uint256 BPS_DENOMINATOR = 10000;
  MockERC20[] tokens;

  constructor(address tokenA_, address tokenB_) MockERC20("crvLP", "crvLP", 18) {
    tokenA = MockERC20(tokenA_);
    tokenB = MockERC20(tokenB_);
    tokens = [tokenA, tokenB];
  }

  function coins(uint256 i) external view returns (address) {
    return address(tokens[i]);
  }

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  function calc_withdraw_one_coin(uint256 _token_amount, int128) external pure returns (uint256) {
    return _token_amount;
  }

  function add_liquidity(uint256[2] calldata amounts, uint256) external returns (uint256) {
    uint256 lpTokens;
    for (uint8 i = 0; i < tokens.length; i++) {
      tokens[i].transferFrom(msg.sender, address(this), amounts[i]);
      this.mint(msg.sender, amounts[i]);
      lpTokens += amounts[i];
    }
    return lpTokens;
  }

  function remove_liquidity_one_coin(
    uint256 _token_amount,
    int128 i,
    uint256 _min_amount
  ) external returns (uint256) {
    this.transferFrom(msg.sender, address(this), _token_amount);
    _min_amount;
    uint256 slippage = (_token_amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = _token_amount - slippage;
    uint128 idx = uint128(i);
    tokens[idx].approve(address(this), transferOut);
    tokens[idx].mint(address(this), transferOut);
    tokens[idx].transferFrom(address(this), msg.sender, transferOut);
    return transferOut;
  }

  // Test helpers

  function setVirtualPrice(uint256 virtualPrice_) external {
    virtualPrice = virtualPrice_;
  }

  function setWithdrawalSlippage(uint256 withdrawalSlippageBps_) external {
    withdrawalSlippageBps = withdrawalSlippageBps_;
  }
}
