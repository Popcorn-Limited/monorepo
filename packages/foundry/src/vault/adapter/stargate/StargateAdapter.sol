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

  /// @notice Check to see if Stargate incentives are active
  bool public isActiveIncentives;

  /// @notice The Stargate LpStaking contract
  IStargateStaking public stargateStaking;

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
    bytes memory stargateInitData,
    bytes memory
  ) public initializer {
    __AdapterBase_init(adapterInitData);

    _name = string.concat("Popcorn Stargate", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    (address _stargateStaking, uint256 _pid) = abi.decode(stargateInitData, (address, uint256));

    stargateStaking = IStargateStaking(_stargateStaking);
    pid = _pid;

    (address _sToken, , , ) = stargateStaking.poolInfo(pid);
    sToken = ISToken(_sToken);

    IERC20(asset()).approve(address(sToken), type(uint256).max);
    sToken.approve(address(stargateStaking), type(uint256).max);

    stargateRouter = IStargateRouter(sToken.router());

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
    return sToken.balanceOf(address(this));
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

  /// @notice Deposit into stargate lending pool
  function _protocolDeposit(uint256 assets, uint256) internal virtual override {
    stargateRouter.addLiquidity(pid, assets, address(this));
    stargateStaking.deposit(pid, sToken.balanceOf(address(this)));
  }

  /// @notice Withdraw from lending pool
  function _protocolWithdraw(uint256 assets, uint256) internal virtual override {
    stargateStaking.withdraw(pid, assets);

    uint16 srcPoolId = uint16(pid);
    stargateRouter.instantRedeemLocal(srcPoolId, assets, address(this));
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
