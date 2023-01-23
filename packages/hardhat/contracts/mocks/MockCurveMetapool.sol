// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";

import "hardhat/console.sol";

contract MockCurveMetapool {
  using SafeERC20 for MockERC20;

  MockERC20 public lpToken;
  MockERC20 public threeCrv;
  MockERC20 token;
  MockERC20 dai;
  MockERC20 usdc;
  MockERC20 usdt;
  uint256 virtualPrice = 1e18;

  uint256 withdrawalSlippageBps = 10;
  uint256 mintSlippageBps = 0;

  uint256 BPS_DENOMINATOR = 10000;
  MockERC20[] tokens;

  constructor(
    address token_,
    address lpToken_,
    address threeCrv_,
    address dai_,
    address usdc_,
    address usdt_
  ) {
    token = MockERC20(token_);
    lpToken = MockERC20(lpToken_);
    threeCrv = MockERC20(threeCrv_);
    dai = MockERC20(dai_);
    usdc = MockERC20(usdc_);
    usdt = MockERC20(usdt_);
    tokens = [token, threeCrv];
  }

  function coins() external view returns (address[2] memory) {
    address[2] memory coinAddresses = [address(token), address(threeCrv)];
    return coinAddresses;
  }

  function base_coins() external view returns (address[3] memory) {
    address[3] memory coinAddresses = [address(dai), address(usdc), address(usdt)];
    return coinAddresses;
  }

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external pure returns (uint256) {
    i;
    return _token_amount;
  }

  function add_liquidity(uint256[2] calldata amounts, uint256 min_mint_amounts) external returns (uint256) {
    uint256 lpTokens;
    min_mint_amounts;
    for (uint8 i = 0; i < tokens.length; i++) {
      uint256 mintAmount = amounts[i] - ((amounts[i] * mintSlippageBps) / 10000);
      tokens[i].transferFrom(msg.sender, address(this), amounts[i]);
      lpToken.mint(msg.sender, mintAmount);
      lpTokens += mintAmount;
    }
    return lpTokens;
  }

  function remove_liquidity_one_coin(
    uint256 _token_amount,
    int128 i,
    uint256 _min_amount
  ) external returns (uint256) {
    lpToken.transferFrom(msg.sender, address(this), _token_amount);
    _min_amount;
    uint256 slippage = (_token_amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = _token_amount - slippage;
    uint128 idx = uint128(i);
    tokens[idx].approve(address(this), transferOut);
    tokens[idx].mint(address(this), transferOut);
    tokens[idx].transferFrom(address(this), msg.sender, transferOut);
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
    if (i == 0) {
      dai.transferFrom(msg.sender, address(this), dx);
    } else {
      token.transferFrom(msg.sender, address(this), dx);
    }
    if (j == 0) dai.transfer(msg.sender, dx);
    if (j == 1) usdc.transfer(msg.sender, dx);
    if (j == 3) token.transfer(msg.sender, dx);
    return dx;
  }

  //...And some others use exchange_underlying (mim,3crv)
  function exchange_underlying(
    /* int128 i */
    /* int128 j */
    uint256 dx
  )
    external
    returns (
      /* uint256 min_dy */
      uint256
    )
  {
    usdc.transferFrom(msg.sender, address(this), dx);
    token.transfer(msg.sender, dx);
    return dx;
  }

  // Test helpers

  function setVirtualPrice(uint256 virtualPrice_) external {
    virtualPrice = virtualPrice_;
  }

  function setWithdrawalSlippage(uint256 withdrawalSlippageBps_) external {
    withdrawalSlippageBps = withdrawalSlippageBps_;
  }

  function setMintSlippage(uint256 mintSlippageBps_) external {
    mintSlippageBps = mintSlippageBps_;
  }
}
