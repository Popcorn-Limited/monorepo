// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";
import "hardhat/console.sol";

contract MockCurveFactoryMetapool is MockERC20 {
  using SafeERC20 for MockERC20;

  MockERC20 public tokenA;
  MockERC20 public threeCrv;
  MockERC20[3] public baseCoins;
  MockERC20[4] public allCoins;
  uint256 virtualPrice = 1e18;
  uint256 forexPrice;

  uint256 withdrawalSlippageBps = 10;

  uint256 BPS_DENOMINATOR = 10000;
  MockERC20[] tokens;

  constructor(
    MockERC20 tokenA_,
    MockERC20 threeCrv_,
    MockERC20[3] memory baseCoins_,
    uint256 _forexPrice
  ) MockERC20("crvLP", "crvLP", 18) {
    tokenA = tokenA_;
    threeCrv = threeCrv_;
    baseCoins = baseCoins_;
    allCoins = [tokenA_, baseCoins_[0], baseCoins_[1], baseCoins_[2]];

    forexPrice = _forexPrice;

    tokens = [tokenA, threeCrv];
  }

  function coins() external view returns (address[2] memory) {
    address[2] memory coinAddresses = [address(tokenA), address(threeCrv)];
    return coinAddresses;
  }

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  function price_oracle() external view returns (uint256) {
    return forexPrice;
  }

  function calc_withdraw_one_coin(uint256 _token_amount, int128) external pure returns (uint256) {
    return _token_amount;
  }

  function add_liquidity(uint256[2] calldata amounts, uint256) external returns (uint256) {
    uint256 lpTokens;
    for (uint8 i = 0; i < tokens.length; i++) {
      tokens[i].transferFrom(msg.sender, address(this), amounts[i]);
      uint256 amount = amounts[i];
      if (tokens[i].decimals() == 6) amount *= 1e12;
      lpTokens += amount;
    }
    this.mint(msg.sender, lpTokens);
    return lpTokens;
  }

  function add_liquidity(uint256[4] calldata amounts, uint256) external returns (uint256) {
    uint256 lpTokens;

    for (uint8 i = 0; i < amounts.length; i++) {
      allCoins[i].transferFrom(msg.sender, address(this), amounts[i]);
      uint256 amount = amounts[i];
      if (allCoins[i].decimals() == 6) amount *= 1e12;
      lpTokens += amount;
    }
    lpTokens -= (withdrawalSlippageBps * lpTokens) / 100000;
    this.mint(msg.sender, lpTokens);
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
    if (allCoins[uint128(i)].decimals() == 6) transferOut /= 1e12;
    allCoins[uint128(i)].mint(msg.sender, transferOut);
    return transferOut;
  }

  function exchange(
    int128 i,
    int128 j,
    uint256 dx
  )
    external
    returns (
      /* uint256 min_dy */
      uint256
    )
  {
    allCoins[uint128(i)].transferFrom(msg.sender, address(this), dx);
    uint256 amount = dx;
    if (allCoins[uint128(i)].decimals() == 6) {
      amount *= 1e12;
    } else if (allCoins[uint128(j)].decimals() == 6) {
      amount /= 1e12;
    }

    allCoins[uint128(j)].mint(msg.sender, amount);
    return amount;
  }

  function exchange_underlying(
    int128 i,
    int128 j,
    uint256 dx
  )
    external
    returns (
      /* uint256 min_dy */
      uint256
    )
  {
    allCoins[uint128(i)].transferFrom(msg.sender, address(this), dx);
    uint256 amount = dx;

    if (forexPrice != 1e18 && j == 2) {
      amount = (dx * forexPrice) / 1e18;
    }

    if (allCoins[uint128(i)].decimals() == 6) {
      amount *= 1e12;
    } else if (allCoins[uint128(j)].decimals() == 6) {
      amount /= 1e12;
    }

    allCoins[uint128(j)].mint(msg.sender, amount);
    return amount;
  }

  // Test helpers

  function setVirtualPrice(uint256 virtualPrice_) external {
    virtualPrice = virtualPrice_;
  }

  function setWithdrawalSlippage(uint256 withdrawalSlippageBps_) external {
    withdrawalSlippageBps = withdrawalSlippageBps_;
  }
}
