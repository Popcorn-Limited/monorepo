// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";

import "hardhat/console.sol";

contract MockSynthetix {
  using SafeERC20 for MockERC20;

  mapping(bytes32 => MockERC20) tokens;
  mapping(bytes32 => uint256) priceInUSD;
  uint256 fee = 30;

  constructor(
    address _sEUR,
    address _sGBP,
    address _sUSD,
    uint256 _eurInUSD,
    uint256 _gbpInUSD
  ) {
    tokens["sEUR"] = MockERC20(_sEUR);
    tokens["sGBP"] = MockERC20(_sGBP);
    tokens["sUSD"] = MockERC20(_sUSD);
    priceInUSD["sUSD"] = 1e18;
    priceInUSD["sEUR"] = _eurInUSD;
    priceInUSD["sGBP"] = _gbpInUSD;
  }

  function exchangeAtomically(
    bytes32 sourceCurrencyKey,
    uint256 sourceAmount,
    bytes32 destinationCurrencyKey
  )
    external
    returns (
      /* bytes32 trackingCode */
      /* uint256 minAmount */
      uint256
    )
  {
    tokens[sourceCurrencyKey].safeTransferFrom(msg.sender, address(this), sourceAmount);
    uint256 inputValue = priceInUSD[sourceCurrencyKey] * sourceAmount;
    uint256 outputAmount = inputValue / priceInUSD[destinationCurrencyKey];
    uint256 feeAmount = (outputAmount * fee) / 10_000;
    tokens[destinationCurrencyKey].mint(msg.sender, outputAmount - feeAmount);
    return outputAmount - feeAmount;
  }
}
