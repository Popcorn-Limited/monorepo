// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Superseeder {
  function seed(
    ERC20 erc20,
    address[] calldata receivers,
    uint256[] calldata amounts
  ) external {
    for (uint256 i = 0; i < receivers.length; i++) {
      erc20.transferFrom(msg.sender, receivers[i], amounts[i]);
    }
  }
}
