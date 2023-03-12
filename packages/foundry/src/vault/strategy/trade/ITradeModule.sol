// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;

struct Trade {
  address tradeModule;
  address router;
  uint256 minTradeAmount;
  uint256 slippage;
  address[] tradePath;
}

interface ITradeModule {
  function getAmountOut(
    uint256 amountIn,
    address[] calldata tradePath,
    address router
  ) external view returns (uint256);

  function trade(
    uint256 amountIn,
    uint256 amountOut,
    address[] calldata tradePath,
    address router
  ) external returns (uint256);
}