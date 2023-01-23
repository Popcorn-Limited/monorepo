// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";

import "hardhat/console.sol";

contract MockIbAMM {
  using SafeERC20 for MockERC20;

  MockERC20 public dai;
  mapping(address => MockERC20) tokens;
  mapping(address => uint256) priceInUSD;

  constructor(
    address _dai,
    address _ibEUR,
    address _ibGBP,
    uint256 _eurInUSD,
    uint256 _gbpInUSD
  ) {
    dai = MockERC20(_dai);
    tokens[_ibEUR] = MockERC20(_ibEUR);
    tokens[_ibGBP] = MockERC20(_ibGBP);
    priceInUSD[_ibEUR] = _eurInUSD;
    priceInUSD[_ibGBP] = _gbpInUSD;
  }

  function buy(address to, uint256 amount)
    external
    returns (
      /* uint256 minOut */
      bool
    )
  {
    dai.safeTransferFrom(msg.sender, address(this), amount);
    tokens[to].mint(msg.sender, buy_quote(to, amount));
    return true;
  }

  function buy_quote(address to, uint256 amount) public view returns (uint256) {
    return (amount * 1e18) / priceInUSD[to];
  }
}
