// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";
import "hardhat/console.sol";

contract MockCurveOraclePool {
  using SafeERC20 for MockERC20;

  MockERC20 public tokenA;
  MockERC20 public tokenB;
  MockERC20 public lpToken;

  uint256 virtualPrice = 1e18;
  uint256 lpPrice;
  uint256 forexPrice;

  uint256 withdrawalSlippageBps = 10;

  uint256 BPS_DENOMINATOR = 10000;
  MockERC20[] tokens;

  constructor(
    address tokenA_,
    address tokenB_,
    uint256 _lpPrice,
    uint256 _forexPrice
  ) {
    tokenA = MockERC20(tokenA_);
    tokenB = MockERC20(tokenB_);
    tokens = [tokenA, tokenB];

    lpPrice = _lpPrice;
    forexPrice = _forexPrice;

    lpToken = new MockERC20("crvLP", "crvLP", 18);
  }

  function coins() external view returns (address[2] memory) {
    address[2] memory coinAddresses = [address(tokenA), address(tokenB)];
    return coinAddresses;
  }

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  function lp_price() external view returns (uint256) {
    return lpPrice;
  }

  // Returns the amount of forex token 1 USD buys
  function price_oracle() external view returns (uint256) {
    return forexPrice;
  }

  function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external pure returns (uint256) {
    i;
    return _token_amount;
  }

  function add_liquidity(uint256[2] calldata amounts, uint256) external returns (uint256) {
    uint256 lpTokens;
    for (uint8 i = 0; i < tokens.length; i++) {
      tokens[i].transferFrom(msg.sender, address(this), amounts[i]);
      uint256 lpAmount = i == 0 ? amounts[i] : (amounts[i] * forexPrice) / lpPrice;
      lpToken.mint(msg.sender, lpAmount);
      lpTokens += lpAmount;
    }
    return lpTokens;
  }

  function remove_liquidity_one_coin(
    uint256 _token_amount,
    int128 i,
    uint256
  ) external returns (uint256) {
    lpToken.burn(msg.sender, _token_amount);
    uint256 slippage = (_token_amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = _token_amount - slippage;
    transferOut = i == 0 ? transferOut : (transferOut * lpPrice) / forexPrice;
    tokens[uint128(i)].mint(msg.sender, transferOut);
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
