// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import { Test } from "forge-std/Test.sol";
import "solmate/src/tokens/ERC20.sol";

import "../../../contracts/core/interfaces/IBatchContract.sol";
import "../../../contracts/externals/interfaces/IBasicIssuanceModule.sol";
import "../../../contracts/externals/interfaces/ISetToken.sol";

//TODO butter needs to be updated so that `setSlippage()` doesnt block any inputs above 2%
abstract contract AbstractSimulateBatchSlippage is Test {
  address public constant DAO = 0x92a1cB552d0e177f3A135B4c87A4160C8f2a485f;
  IBasicIssuanceModule public basicIssuanceModule = IBasicIssuanceModule(0xd8EF3cACe8b4907117a45B0b125c68560532F94D);
  IBatchContract public batchContract;

  // Override with the address of the used batchContract
  function setUp() public virtual {
    //batchContract = IBatchContract(0x42189f909e1EFA409A4509070dDBc31A592422A8);
  }

  function test__simulateMintSlippage() external {
    _runSimulation(true);
  }

  function test__simulateRedeemSlippage() external {
    _runSimulation(false);
  }

  function _runSimulation(bool isMint) internal {
    bytes32 batchId;
    Batch memory currentBatch;
    uint256 sourceBatchValue;
    uint256 targetBatchValue;
    uint256 loss;

    vm.startPrank(DAO);
    batchContract.setSlippage(10000, 10000);

    emit log_named_uint("blockNumber", block.number);
    emit log_named_uint("blockTime", block.timestamp);

    if (isMint) {
      batchId = batchContract.currentMintBatchId();
      currentBatch = batchContract.getBatch(batchId);

      sourceBatchValue = _getUnderlyingBatchValue(address(currentBatch.sourceToken), currentBatch.sourceTokenBalance);
      emit log_named_uint("sourceBatchValue", sourceBatchValue);

      batchContract.batchMint();

      currentBatch = batchContract.getBatch(batchId);
      targetBatchValue = _getSetBatchValue(address(currentBatch.targetToken), currentBatch.targetTokenBalance);
      emit log_named_uint("targetBatchValue", targetBatchValue);
    } else {
      batchId = batchContract.currentRedeemBatchId();
      currentBatch = batchContract.getBatch(batchId);

      sourceBatchValue = _getSetBatchValue(address(currentBatch.sourceToken), currentBatch.sourceTokenBalance);
      emit log_named_uint("sourceBatchValue", sourceBatchValue);

      batchContract.batchRedeem();

      currentBatch = batchContract.getBatch(batchId);
      targetBatchValue = _getUnderlyingBatchValue(address(currentBatch.targetToken), currentBatch.targetTokenBalance);
      emit log_named_uint("targetBatchValue", targetBatchValue);
    }
    loss = sourceBatchValue - targetBatchValue;

    emit log_named_uint("loss", loss);

    // Divide by 1e18 to get proper slippage
    emit log_named_uint("slippage", (loss * 1e18) / sourceBatchValue);

    vm.stopPrank();
  }

  // Override with price calculation depending on what kind of batchContract is used
  function _getUnderlyingBatchValue(address underlyingToken, uint256 batchBalance)
    internal
    view
    virtual
    returns (uint256 value)
  {
    // raise balances that are denominated in anything less than 18 decimals
    // uint256 decimalDiff = 18 - ERC20(underlyingToken).decimals();
    // value = decimalDiff == 0 ? batchBalance : batchBalance * (10**decimalDiff);
  }

  // previous batchContract.currentMintBatchId
  function _getSetBatchValue(address setToken, uint256 batchBalance) internal view returns (uint256 value) {
    (address[] memory tokenAddresses, uint256[] memory quantities) = basicIssuanceModule
      .getRequiredComponentUnitsForIssue(ISetToken(setToken), 1e18);

    value = (batchBalance * batchContract.valueOfComponents(tokenAddresses, quantities)) / 1e18;
  }
}
