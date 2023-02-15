// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";

// import { ERC4626 } from "solmate/mixins/ERC4626.sol";
// import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";

import { IWETH } from "../../../interfaces/external/IWETH.sol";
import { ILido } from "./ILido.sol";

/// @title LidoAdapter
/// @author zefram.eth
/// @notice ERC4626 wrapper for Lido stETH
/// @dev Uses stETH's internal shares accounting instead of using regular vault accounting
/// since this prevents attackers from atomically increasing the vault's share value
/// and exploiting lending protocols that use this vault as a borrow asset.
contract LidoAdapter is AdapterBase {
  // using FixedPointMathLib for uint256;
  // using SafeMath for uint256;
  // using UnstructuredStorage for bytes32;

  string internal _name;
  string internal _symbol;

  /// @notice The poolId inside Convex booster for relevant Curve lpToken.
  uint256 public pid;

  /// @notice The booster address for Convex
  ILido public lido;

  /// @dev contract for WETH
  // address public immutable weth;
  IWETH public weth;

  address private referal = address(0); //stratms. for recycling and redepositing

  // We need to figure out how to get this referral

  /*//////////////////////////////////////////////////////////////
                                INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  /**
   * @notice Initialize a new Lido Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @param lidoInitData Encoded data for the Lido adapter initialization.
   * @dev `_lidoAddress` - The vault address for Lido.
   * @dev `_pid` - The poolId for lpToken.
   * @dev This function is called by the factory contract when deploying a new vault.
   */
  function initialize(
    bytes memory adapterInitData,
    address _wethAddress,
    bytes memory lidoInitData
  ) public initializer {
    __AdapterBase_init(adapterInitData);

    (address _lidoAddress, uint256 _pid) = abi.decode(lidoInitData, (address, uint256));

    lido = ILido(_lidoAddress);
    pid = _pid;
    weth = IWETH(_wethAddress);

    _name = string.concat("Popcorn Lido", IERC20Metadata(_lidoAddress).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(_lidoAddress).symbol());

    IERC20(_lidoAddress).approve(address(_lidoAddress), type(uint256).max);
  }

  //we get eth
  receive() external payable {}

  function name() public view override(IERC20Metadata, ERC20) returns (string memory) {
    return _name;
  }

  function symbol() public view override(IERC20Metadata, ERC20) returns (string memory) {
    return _symbol;
  }

  /*//////////////////////////////////////////////////////////////
                            ACCOUNTING LOGIC
    //////////////////////////////////////////////////////////////*/

  function _underlyingBalance() internal view override returns (uint256) {
    return lido.sharesOf(address(this));
  }

  function _totalAssets() internal view override returns (uint256) {
    return lido.balanceOf(address(this)); // this can be higher than the total assets deposited due to staking rewards
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  /// @notice Deposit into LIDO pool
  function _protocolDeposit(uint256 assets, uint256) internal virtual override {
    weth.withdraw(assets); // Grab native Eth from Weth contract
    lido.submit{ value: assets }(referal); // Submit to Lido Contract
  }

  /// @notice Withdraw from LIDO pool
  function _protocolWithdraw(uint256 assets, uint256) internal virtual override {
    lido.burnShares(address(this), assets); // burn shares and get Eth back
    weth.deposit{ value: assets }(); // get wrapped eth back
  }
}

// Questions

// 1. the totalAssets function calls IERC20(asset()).balanceOf() to get the totalAssets when the vault is paused. However, the asset in this case is WEth which is always converted to Eth before being deposited/withdrawn from the underlying Lido pool.
