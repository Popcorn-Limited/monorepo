// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { ILiquidityPool, IStakingRewards } from "./IHop.sol";

/**
 * @title   Hop Protocol Adapter
 * @notice  ERC4626 wrapper for Hop Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/hop-exchange/contracts/blob/28ec0f1a8df497a102c0a3e779a68a81bf69b9ad/contracts/saddle/Swap.sol.
 * Allows wrapping Hop Vaults.
 */
contract HopAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  // @notice The Reward interface
  IStakingRewards public stakingRewards;

  /// @notice The Hop protocol swap contract
  ILiquidityPool public liquidityPool;

  // @notice The address of the LP token
  address public LPToken;

  /**
   * @notice Initialize a new Hop Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(
    bytes memory adapterInitData,
    address registry,
    bytes memory hopInitData
  ) external initializer {
    __AdapterBase_init(adapterInitData);

    (address _liquidityPool, address _stakingRewards) = abi.decode(hopInitData, (address, address));

    liquidityPool = ILiquidityPool(registry);
    stakingRewards = IStakingRewards(_stakingRewards);

    ILiquidityPool.Swap memory swapStorage = liquidityPool.swapStorage();
    LPToken = swapStorage.lpToken;

    _name = string.concat("Popcorn Hop", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    IERC20(LPToken).approve(address(liquidityPool), type(uint256).max);
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

  /// @notice Calculates the total amount of underlying tokens the Vault holds.
  /// @return The total amount of underlying tokens the Vault holds.

  function _totalAssets() internal view override returns (uint256) {
    return paused() ? IERC20(asset()).balanceOf(address(this)) : stakingRewards.balanceOf(address(this));
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  function _protocolDeposit(
    uint256[] calldata amounts,
    uint256 minToMint,
    uint256 deadline
  ) internal virtual {
    liquidityPool.addLiquidity(amounts, minToMint, deadline);
  }

  function _protocolWithdraw(
    uint256 amount,
    uint256[] calldata minAmounts,
    uint256 deadline
  ) internal virtual {
    liquidityPool.removeLiquidity(amount, minAmounts, deadline);
  }

  /*//////////////////////////////////////////////////////////////
                            STRATEGY LOGIC
    //////////////////////////////////////////////////////////////*/
  /// @notice Claim rewards from Hop
  function claim() public override onlyStrategy {
    stakingRewards.getReward();
  }

  /// @notice The token rewarded
  function rewardTokens() external view override returns (address[] memory) {
    address[] memory _rewardTokens = new address[](1);
    _rewardTokens[0] = LPToken;
    // return _rewardTokens;
  }

  function getLPTokenAdress() external view returns (address) {
    return LPToken;
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
