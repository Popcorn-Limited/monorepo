// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./IBatchStorage.sol";

interface IBatchContract is IViewableBatchStorage {
  function currentMintBatchId() external view returns (bytes32);

  function currentRedeemBatchId() external view returns (bytes32);

  function batchMint() external;

  function batchRedeem() external;

  function setSlippage(uint256 _mintSlippage, uint256 _redeemSlippage) external;

  function valueOfComponents(address[] memory _tokenAddresses, uint256[] memory _quantities)
    external
    view
    returns (uint256);
}
