// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Owned } from "../utils/Owned.sol";
import { IERC20Upgradeable as IERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract FeeRecipientProxy is Owned {
  constructor(address owner) Owned(owner) {}

  uint256 public approvals;

  function approveToken(IERC20[] calldata tokens) external onlyOwner {
    uint8 len = uint8(tokens.length);
    for (uint8 i = 0; i < len; i++) {
      tokens[i].approve(owner, type(uint256).max);
      approvals++;
    }
  }

  function voidTokenApproval(IERC20[] calldata tokens) external onlyOwner {
    uint8 len = uint8(tokens.length);
    for (uint8 i = 0; i < len; i++) {
      tokens[i].approve(owner, 0);
      approvals--;
    }
  }

  function acceptOwnership() external override {
    require(msg.sender == nominatedOwner, "You must be nominated before you can accept ownership");
    require(approvals == 0, "Must void all approvals first");
    emit OwnerChanged(owner, nominatedOwner);
    owner = nominatedOwner;
    nominatedOwner = address(0);
  }
}
