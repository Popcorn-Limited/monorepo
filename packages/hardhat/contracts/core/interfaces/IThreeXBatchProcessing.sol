// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { BatchType, IAbstractBatchStorage, Batch, BatchTokens } from "./IBatchStorage.sol";
import "../../externals/interfaces/CurveContracts.sol";
import "../../externals/interfaces/IAngleRouter.sol";

interface IOracle {
  function read() external view returns (uint256);
}

/**
 * @notice each component has dependencies that form a path to aquire and subsequently swap out of the component. these are those dependenices
 * @param lpToken lpToken of the curve metapool
 * @param utilityPool Special curve metapools that are used withdraw sUSD from the pool and get oracle prices for EUR
 * @param oracle Special curve metapools that are used withdraw sUSD from the pool and get oracle prices for EUR
 * @param curveMetaPool A CurveMetaPool that we want to deploy into yearn (SUSD, 3EUR)
 * @param angleRouter The Angle Router to trade USDC against agEUR
 */
struct ComponentDependencies {
  IERC20 lpToken;
  CurveMetapool utilityPool;
  IOracle oracle;
  CurveMetapool curveMetaPool;
  IAngleRouter angleRouter;
}
struct Slippage {
  uint256 mintBps; // in bps
  uint256 redeemBps; // in bps
}

interface IThreeXBatchProcessing {
  function batchStorage() external returns (IAbstractBatchStorage);

  function getBatch(bytes32 batchId) external view returns (Batch memory);

  function depositForMint(uint256 amount_, address account_) external;

  function depositForRedeem(uint256 amount_) external;

  function batchMint() external;

  function batchRedeem() external;

  function claim(bytes32 batchId_, address account_) external returns (uint256);

  function withdrawFromBatch(
    bytes32 batchId_,
    uint256 amountToWithdraw_,
    address account_
  ) external returns (uint256);

  function withdrawFromBatch(
    bytes32 batchId_,
    uint256 amountToWithdraw_,
    address _withdrawFor,
    address _recipient
  ) external returns (uint256);

  function valueOfComponents(address[] memory _tokenAddresses, uint256[] memory _quantities)
    external
    view
    returns (uint256);

  function getMinAmountToMint(
    uint256 _valueOfBatch,
    uint256 _valueOfComponentsPerUnit,
    uint256 _slippage
  ) external pure returns (uint256);

  function getMinAmountFromRedeem(uint256 _valueOfComponents, uint256 _slippage) external pure returns (uint256);

  function slippage() external view returns (Slippage memory);

  function componentDependencies(address yToken) external view returns (ComponentDependencies memory);

  function swapToken() external view returns (IERC20);

  function mintBatchTokens() external view returns (BatchTokens memory);

  function redeemBatchTokens() external view returns (BatchTokens memory);

  function currentMintBatchId() external view returns (bytes32);

  function currentRedeemBatchId() external view returns (bytes32);
}
