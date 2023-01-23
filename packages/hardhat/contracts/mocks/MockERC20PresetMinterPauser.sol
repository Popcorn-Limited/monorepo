// SPDX-License-Identifier: AGPL-3.0-only
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import { ERC20PresetMinterPauser } from "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract MockERC20PresetMinterPauser is ERC20PresetMinterPauser {
  constructor(string memory name, string memory symbol) ERC20PresetMinterPauser(name, symbol) {}

  function mint(address to, uint256 amount) public override {
    _mint(to, amount);
  }
}
