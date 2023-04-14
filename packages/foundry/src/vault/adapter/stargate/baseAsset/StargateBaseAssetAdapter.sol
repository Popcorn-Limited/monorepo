// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../../abstracts/WithRewards.sol";
import { ISToken, IStargateStaking, IStargateRouter } from "../IStargate.sol";

/**
 * @title   Stargate Adapter
 * @author  amatureApe
 * @notice  ERC4626 wrapper for Stargate Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol.
 * Allows wrapping Stargate aTokens with or without an active Liquidity Mining.
 * Allows for additional strategies to use rewardsToken in case of an active Liquidity Mining.
 */

contract StargateBaseAssetAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  uint256 scalar;

  /// @notice The poolId inside Stargate staking contract for relevant sToken.
  uint256 public pid;
  uint256 public stakingPid;

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

  // TODO add fallback for eth

  error StakingIdOutOfBounds();
  error DifferentAssets();

  /**
   * @notice Initialize a new Stargate Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @param stargateInitData Encoded data for the base adapter initialization.
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(
    bytes memory adapterInitData,
    address registry,
    bytes memory stargateInitData
  ) public initializer {
    __AdapterBase_init(adapterInitData);

    uint256 _stakingPid = abi.decode(stargateInitData, (uint256));

    stargateStaking = IStargateStaking(registry);
    if (_stakingPid >= stargateStaking.poolLength()) revert StakingIdOutOfBounds();

    (address _sToken, , , ) = stargateStaking.poolInfo(_stakingPid);
    sToken = ISToken(_sToken);
    if (sToken.token() != asset()) revert DifferentAssets();

    pid = sToken.poolId();
    stakingPid = _stakingPid;

    scalar = 10 ** (sToken.localDecimals() - 6);

    stargateRouter = IStargateRouter(sToken.router());

    IERC20(asset()).approve(address(stargateRouter), 0);
    //IERC20(asset()).approve(address(stargateRouter), type(uint256).max);
    sToken.approve(address(stargateStaking), type(uint256).max);

    _name = string.concat("Popcorn Stargate ", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popStg-", IERC20Metadata(asset()).symbol());
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
    (uint256 stake, ) = stargateStaking.userInfo(stakingPid, address(this));
    return stake * scalar;
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

  /// @notice Deposit into stargate pool
  function _protocolDeposit(uint256 assets, uint256) internal override {
    stargateRouter.addLiquidity(pid, assets, address(this));
    uint256 sTokenBal = sToken.balanceOf(address(this));

    stargateStaking.deposit(stakingPid, sTokenBal);
  }

  event log(uint256);

  /// @notice Withdraw from stargate pool
  function _protocolWithdraw(uint256 assets, uint256) internal override {
    (uint256 stake, ) = stargateStaking.userInfo(stakingPid, address(this));
    stargateStaking.withdraw(stakingPid, assets / scalar);

    uint256 sTokenBal = sToken.balanceOf(address(this));

    stargateRouter.instantRedeemLocal(uint16(pid), sTokenBal, address(this));
    emit log(IERC20(asset()).balanceOf(address(this)));
  }

  /*//////////////////////////////////////////////////////////////
                            STRATEGY LOGIC
    //////////////////////////////////////////////////////////////*/

  function claim() public override onlyStrategy returns (bool success) {
    try stargateStaking.deposit(stakingPid, 0) {
      success = true;
    } catch {}
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
