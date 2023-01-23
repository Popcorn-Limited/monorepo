// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "solmate/src/tokens/ERC20.sol";
import "./AbstractSimulateBatchSlippage.t.sol";

contract SimulateThreeXBatchSlippage is AbstractSimulateBatchSlippage {
  function setUp() public override {
    batchContract = IBatchContract(0x42189f909e1EFA409A4509070dDBc31A592422A8);
  }

  function _getUnderlyingBatchValue(address underlyingToken, uint256 batchBalance)
    internal
    view
    override
    returns (uint256 value)
  {
    // raise balances that are denominated in anything less than 18 decimals
    uint256 decimalDiff = 18 - ERC20(underlyingToken).decimals();
    value = decimalDiff == 0 ? batchBalance : batchBalance * (10**decimalDiff);
  }
}
