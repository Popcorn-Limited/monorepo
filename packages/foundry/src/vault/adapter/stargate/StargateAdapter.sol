// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { ISToken, IStargateStaking, IStargateRouter } from "./IStargate.sol";

/**
 * @title   Stargate Adapter
 * @author  amatureApe
 * @notice  ERC4626 wrapper for Stargate Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol.
 * Allows wrapping Stargate aTokens with or without an active Liquidity Mining.
 * Allows for additional strategies to use rewardsToken in case of an active Liquidity Mining.
 */

contract StargateAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The poolId inside Stargate staking contract for relevant sToken.
  uint256 public pid;

  /// @notice The Stargate sToken contract
  ISToken public sToken;

  /// @notice The Stargate router contract
  IStargateRouter public stargateRouter;

  /// @notice The Stargate LpStaking contract
  IStargateStaking public stargateStaking;

  /// @notice Check to see if Stargate incentives are active
  bool public isActiveIncentives;

  /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

  error DifferentAssets(address asset, address underlying);

  /**
   * @notice Initialize a new Stargate Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @param stargateInitData Encoded data for the base adapter initialization.
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(
    bytes memory adapterInitData,
    address,
    bytes memory stargateInitData
  ) public initializer {
    __AdapterBase_init(adapterInitData);

    _name = string.concat("Popcorn Stargate", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    (address _stargateStaking, uint256 _pid) = abi.decode(stargateInitData, (address, uint256));

    stargateStaking = IStargateStaking(_stargateStaking);
    pid = _pid;

    (address _sToken, , , ) = stargateStaking.poolInfo(pid);
    sToken = ISToken(_sToken);

    stargateRouter = IStargateRouter(sToken.router());

    IERC20(asset()).approve(address(stargateRouter), type(uint256).max);
    sToken.approve(address(stargateStaking), type(uint256).max);

    if (address(stargateStaking) != address(0)) {
      isActiveIncentives = stargateStaking.pendingStargate(pid, address(this)) > 0 ? true : false;
    }
  }

  function name() public view override(IERC20Metadata, ERC20) returns (string memory) {
    return _name;
  }

  function symbol() public view override(IERC20Metadata, ERC20) returns (string memory) {
    return _symbol;
  }

  /*//////////////////////////////////////////////////////////////
                            ACCOUNTING LOGIC
  //////////////////////////////////////////////////////////////*/

  function _totalAssets() internal view override returns (uint256) {
    (uint256 stake, ) = stargateStaking.userInfo(pid, address(this));
    return sToken.balanceOf(address(this)) + stake;
  }

  /// @notice The token rewarded if the stargate liquidity mining is active
  function rewardTokens() external view override returns (address[] memory) {
    address[] memory _rewardTokens = new address[](1);
    if (isActiveIncentives == false) return _rewardTokens;
    _rewardTokens[0] = stargateStaking.stargate();
    return _rewardTokens;
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/
  function calculateSTokenConversions(uint256 assets) public view virtual returns (uint256) {
    uint256 BP_DENOMINATOR = 10000;

    uint256 _amountLD = (assets / sToken.convertRate()) * sToken.convertRate();
    uint256 _amountSD = _amountLD / sToken.convertRate();

    uint256 _mintFeeSD = (_amountSD * sToken.mintFeeBP()) / BP_DENOMINATOR;
    _amountSD = _amountSD - _mintFeeSD;

    uint256 amountLPTokens = (_amountSD * sToken.totalSupply()) / sToken.totalLiquidity();
    uint256 conversionRate = _amountSD - amountLPTokens;
    return conversionRate;
  }

  error TestError(uint256 amount);

  function convertToUnderlyingShares(uint256 assets, uint256 shares) public view virtual override returns (uint256) {
    // revert TestError(calculateSTokenMintFee(assets));
    return assets / 10**12 - calculateSTokenConversions(assets);
  }

  /// @notice Deposit into stargate pool
  function _protocolDeposit(uint256 assets, uint256 shares) internal virtual override {
    // liquidity pid = staking pid + 1
    stargateRouter.addLiquidity(pid + 1, assets, address(this));

    uint256 sTokenDeposit = sToken.balanceOf(address(this));
    assets = convertToUnderlyingShares(assets, shares);

    stargateStaking.deposit(pid, assets);
  }

  /// @notice Withdraw from stargate pool
  function _protocolWithdraw(uint256 assets, uint256 shares) internal virtual override {
    shares = convertToUnderlyingShares(assets, shares);
    stargateStaking.withdraw(pid, shares);

    // liquidity pid = staking pid + 1
    uint16 srcPoolId = uint16(pid + 1);
    uint256 sTokenDeposit = sToken.balanceOf(address(this));

    stargateRouter.instantRedeemLocal(srcPoolId, sTokenDeposit, address(this));
  }

  function _convertToShares(uint256 assets, Math.Rounding rounding)
    internal
    view
    virtual
    override
    returns (uint256 shares)
  {
    return
      (assets.mulDiv(totalSupply() + 10**decimalOffset, totalAssets() + 1, rounding) -
        calculateSTokenConversions(assets)) /
      10**12 -
      12000132000;
  }

  function _convertToAssets(uint256 shares, Math.Rounding rounding) internal view virtual override returns (uint256) {
    return
      (shares.mulDiv(totalAssets() + 1, totalSupply() + 10**decimalOffset, rounding) + 12) *
      10**12 +
      sToken.convertRate();
  }

  /*//////////////////////////////////////////////////////////////
                            STRATEGY LOGIC
    //////////////////////////////////////////////////////////////*/

  error IncentivesNotActive();

  /// @notice Claim additional rewards given that it's active.
  function claim() public override onlyStrategy {
    if (isActiveIncentives == false) revert IncentivesNotActive();
    stargateStaking.deposit(pid, 0);
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
