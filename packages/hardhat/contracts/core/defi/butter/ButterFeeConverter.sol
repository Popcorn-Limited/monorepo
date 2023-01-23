// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "../../utils/ContractRegistryAccess.sol";
import "../../utils/ACLAuth.sol";
import "../../utils/KeeperIncentivized.sol";

import "../../../externals/interfaces/Curve3Pool.sol";
import "../../../externals/interfaces/ISetToken.sol";
import "../../../externals/interfaces/IStreamingFeeModule.sol";

import "../../interfaces/IButterBatchProcessing.sol";
import "../../interfaces/IButterFeeConverter.sol";

contract ButterFeeConverter is IButterFeeConverter, ACLAuth, ContractRegistryAccess, KeeperIncentivized {
  using SafeERC20 for IERC20Metadata;
  using SafeERC20 for ISetToken;

  bytes32 public constant contractName = keccak256("ButterFeeConverter");
  uint256 public constant BPS_DENOMINATOR = 10_000;

  /* ========== STATE VARIABLES ========== */
  IStreamingFeeModule public streamingFeeModule;
  ISetToken public butter;
  Curve3Pool public threePool;
  IERC20Metadata public threeCRV;

  //@dev this is the preferred coin to convert to from 3crv before sending to rewards manager.
  int128 public preferredStableCoinIndex;
  uint256 public maxSlippage = 50;
  uint256 public keeperTip;

  /* ========== EVENTS ========== */
  event FeeTransferredToRewardsManager(
    address indexed keeper,
    int128 preferredStableCoinIndex,
    uint256 threeCrvAmount,
    uint256 keeperTip,
    uint256 stableCoinAmount
  );
  event PreferredStableCoinIndexUpdated(int128 oldIndex, int128 newIndex);
  event MaxSlippageUpdated(uint256 oldSlippage, uint256 newSlippage);
  event KeeperTipUpdated(uint256 oldKeeperTip, uint256 newKeeperTip);

  /* ========== CONSTRUCTOR ========== */
  /**
   * @param _butter address of BTR SetToken
   * @param _streamingFeeModule address of Set streaming fee module
   * @param _contractRegistry Popcorn contract registry address
   * @param _threePool Curve 3pool address
   * @param _threeCRV Curve 3Pool LP token address
   * @param _preferredStableCoinIndex index of a token in the 3Pool. Fees will be converted to this token.
   * @dev The _preferredStableCoinIndex must align with the index in the Curve 3pool.
   */
  constructor(
    ISetToken _butter,
    IStreamingFeeModule _streamingFeeModule,
    IContractRegistry _contractRegistry,
    Curve3Pool _threePool,
    IERC20Metadata _threeCRV,
    int128 _preferredStableCoinIndex,
    uint256 _keeperTip
  ) ContractRegistryAccess(_contractRegistry) {
    streamingFeeModule = _streamingFeeModule;
    butter = _butter;
    threePool = _threePool;
    threeCRV = _threeCRV;
    preferredStableCoinIndex = _preferredStableCoinIndex;
    keeperTip = _keeperTip;
    setApprovals();
  }

  /**
   * @notice accrue fee from Set streaming fee module in BTR and deposit it into the current redeem batch
   * @dev The stableCoinIndex_ must align with the index in the curve three-pool
   */
  function accrueFee() external override keeperIncentive(0) {
    // Claim accrued fees from Set streaming fee module in BTR
    streamingFeeModule.accrueFee(butter);

    // Claim redemption fees (in 3CRV)
    IButterBatchProcessing butterBatchProcessing = _butterBatchProcessing();
    butterBatchProcessing.claimRedemptionFee();

    // Get BTR balance
    uint256 butterBalance = butter.balanceOf(address(this));

    // Deposit BTR balance for redemption
    butterBatchProcessing.depositForRedeem(butterBalance);
    bytes32 redeemBatchId = butterBatchProcessing.currentRedeemBatchId();

    // Process redemption batch and claim 3CRV
    butterBatchProcessing.batchRedeem();
    butterBatchProcessing.claim(redeemBatchId, address(this));

    // Redeem 3CRV for preferred stable
    uint256 threeCrvBalance = threeCRV.balanceOf(address(this));
    IERC20Metadata stableCoin = IERC20Metadata(threePool.coins(uint128(preferredStableCoinIndex)));

    uint256 expectedAmountOut = scaleValue(threeCrvBalance * threePool.get_virtual_price(), stableCoin.decimals());
    uint256 minAmountOut = expectedAmountOut - ((expectedAmountOut * maxSlippage) / BPS_DENOMINATOR);

    threePool.remove_liquidity_one_coin(threeCrvBalance, preferredStableCoinIndex, minAmountOut);

    // Check the amount of returned stables
    uint256 stableCoinBalance = stableCoin.balanceOf(address(this));

    // Calculate keeper tip
    uint256 toKeeper = (keeperTip * stableCoinBalance) / BPS_DENOMINATOR;
    uint256 toRewardsManager = stableCoinBalance - toKeeper;

    // Send keeper tip
    address incentives = address(_keeperIncentive());
    stableCoin.safeApprove(incentives, 0);
    stableCoin.safeApprove(incentives, toKeeper);
    _keeperIncentive().tip(address(stableCoin), msg.sender, 0, toKeeper);

    // Transfer stables to RewardsManager
    stableCoin.safeTransfer(_rewardsManager(), toRewardsManager);
    emit FeeTransferredToRewardsManager(
      msg.sender,
      preferredStableCoinIndex,
      threeCrvBalance,
      toKeeper,
      toRewardsManager
    );
  }

  function setApprovals() public {
    butter.safeApprove(address(_butterBatchProcessing()), type(uint256).max);
  }

  function scaleValue(uint256 value, uint256 decimals) public pure returns (uint256) {
    return value / (10**(36 - decimals));
  }

  /* ========== Authenticated Functions ========== */

  function setPreferredStableCoinIndex(int128 _newIndex) external onlyRole(DAO_ROLE) {
    require(_newIndex >= 0 && _newIndex <= 2, "Invalid index");
    emit PreferredStableCoinIndexUpdated(preferredStableCoinIndex, _newIndex);
    preferredStableCoinIndex = _newIndex;
  }

  function setMaxSlippage(uint256 _newSlippage) external onlyRole(DAO_ROLE) {
    require(_newSlippage <= 10000, "Invalid slippage");
    emit MaxSlippageUpdated(maxSlippage, _newSlippage);
    maxSlippage = _newSlippage;
  }

  function setKeeperTip(uint256 _newKeeperTip) external onlyRole(DAO_ROLE) {
    require(_newKeeperTip <= 10000, "Invalid tip");
    emit KeeperTipUpdated(keeperTip, _newKeeperTip);
    keeperTip = _newKeeperTip;
  }

  /* ========== Getters/View Functions ========== */

  function _rewardsManager() internal view returns (address) {
    return _getContract(keccak256("RewardsManager"));
  }

  function _butterBatchProcessing() internal view returns (IButterBatchProcessing) {
    return IButterBatchProcessing(_getContract(keccak256("ButterBatchProcessing")));
  }

  function _getContract(bytes32 _name)
    internal
    view
    override(ACLAuth, KeeperIncentivized, ContractRegistryAccess)
    returns (address)
  {
    return super._getContract(_name);
  }
}
