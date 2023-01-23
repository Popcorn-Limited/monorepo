// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

import "../core/interfaces/IButterBatchProcessing.sol";

pragma solidity ^0.8.0;

contract ButterBatchProcessingDefendedHelper {
  IButterBatchProcessing public batchContract;

  constructor(IButterBatchProcessing _batchContract) {
    batchContract = _batchContract;
  }

  function depositMint() external {
    batchContract.depositForMint(0, msg.sender);
  }

  function depositRedeem() external {
    batchContract.depositForRedeem(0);
  }
}
