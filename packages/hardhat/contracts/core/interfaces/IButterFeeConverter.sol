// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../externals/interfaces/Curve3Pool.sol";
import "../../externals/interfaces/ISetToken.sol";
import "../../externals/interfaces/IStreamingFeeModule.sol";

interface IButterFeeConverter {
  function BPS_DENOMINATOR() external returns (uint256);

  function streamingFeeModule() external returns (IStreamingFeeModule);

  function butter() external returns (ISetToken);

  function threePool() external returns (Curve3Pool);

  function threeCRV() external returns (IERC20Metadata);

  function preferredStableCoinIndex() external returns (int128);

  function maxSlippage() external returns (uint256);

  function keeperTip() external returns (uint256);

  function setApprovals() external;

  function accrueFee() external;

  function scaleValue(uint256 value, uint256 decimals) external pure returns (uint256);

  function setPreferredStableCoinIndex(int128 _newIndex) external;

  function setMaxSlippage(uint256 _newSlippage) external;

  function setKeeperTip(uint256 _newKeeperTip) external;
}
