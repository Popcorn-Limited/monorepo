// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.6.0

pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IGUni is IERC20 {
  function getUnderlyingBalances() external view returns (uint256 amount0Current, uint256 amount1Current);
}
