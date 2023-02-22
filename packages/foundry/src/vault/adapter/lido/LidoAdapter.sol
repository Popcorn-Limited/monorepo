// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";

// import { ERC4626 } from "solmate/mixins/ERC4626.sol";
// import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";

import { IWETH } from "../../../interfaces/external/IWETH.sol";
import { ILido, VaultAPI } from "./ILido.sol";
import { ICurveFi } from "./ICurveFi.sol";
import { SafeMath } from "openzeppelin-contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

/// @title LidoAdapter
/// @author zefram.eth
/// @notice ERC4626 wrapper for Lido stETH
/// @dev Uses stETH's internal shares accounting instead of using regular vault accounting
/// since this prevents attackers from atomically increasing the vault's share value
/// and exploiting lending protocols that use this vault as a borrow asset.
contract LidoAdapter is AdapterBase {
  // using FixedPointMathLib for uint256;
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  // using UnstructuredStorage for bytes32;

  string internal _name;
  string internal _symbol;

  int128 private constant WETHID = 0;
  int128 private constant STETHID = 1;
  ICurveFi public constant StableSwapSTETH = ICurveFi(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022);
  uint256 public constant DENOMINATOR = 10000;
  uint256 public slippageProtectionOut = 100; // = 100; //out of 10000. 100 = 1%

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

    lido = ILido(ILido(_lidoAddress).token());
    pid = _pid;
    weth = IWETH(ILido(_lidoAddress).weth());

    _name = string.concat("Popcorn Lido ", IERC20Metadata(address(weth)).name(), " Adapter");
    _symbol = string.concat("popL-", IERC20Metadata(address(weth)).symbol());

    IERC20(address(lido)).approve(address(lido), type(uint256).max);
    IERC20(address(lido)).approve(address(StableSwapSTETH), type(uint256).max);
    IERC20(address(weth)).approve(address(StableSwapSTETH), type(uint256).max);
    IERC20(address(weth)).approve(address(lido), type(uint256).max);
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
  function _protocolWithdraw(uint256 assets, uint256 shares) internal virtual override {
    // lido.burnShares(address(this), assets); // burn shares and get Eth back
    require(assets > 0, "assets cant be 0");
    uint256 slippageAllowance = assets.mul(DENOMINATOR.sub(slippageProtectionOut)).div(DENOMINATOR);
    // uint256 slippageAllowance = 0;
    uint256 amountRecieved = StableSwapSTETH.exchange(STETHID, WETHID, assets, slippageAllowance);

    weth.deposit{ value: amountRecieved }(); // get wrapped eth back
  }

  /**
   * @notice Withdraws `assets` from the underlying protocol and burns vault shares from `owner`.
   * @dev Executes harvest if `harvestCooldown` is passed since last invocation.
   */
  function _withdraw(
    address caller,
    address receiver,
    address owner,
    uint256 assets,
    uint256 shares
  ) internal virtual override {
    if (caller != owner) {
      _spendAllowance(owner, caller, shares);
    }

    uint256 balanceBefore = IERC20(asset()).balanceOf(address(this));

    if (!paused()) {
      _protocolWithdraw(assets, shares);
    }

    _burn(owner, shares);

    uint256 balanceNow = IERC20(asset()).balanceOf(address(this));

    uint256 assetsRecievedFromExchange = balanceNow.sub(balanceBefore);

    IERC20(asset()).safeTransfer(receiver, assetsRecievedFromExchange);

    harvest();

    emit Withdraw(caller, receiver, owner, assetsRecievedFromExchange, shares);
  }

  function previewWithdraw(uint256 assets) public view virtual override returns (uint256) {
    uint256 slippageAllowance = assets.mul(DENOMINATOR.sub(slippageProtectionOut)).div(DENOMINATOR);
    return _previewWithdraw(slippageAllowance);
  }

  /**
   * @notice Withdraws `assets` from the underlying protocol and burns vault shares from `owner`.
   * @param assets Amount of assets to withdraw.
   * @param receiver Receiver of the assets.
   * @param owner Owner of the shares.
   */
  function withdraw(
    uint256 assets,
    address receiver,
    address owner
  ) public virtual override returns (uint256) {
    uint256 slippageAllowance = assets.mul(DENOMINATOR.sub(slippageProtectionOut)).div(DENOMINATOR);
    if (slippageAllowance > maxWithdraw(owner)) revert MaxError(slippageAllowance);

    uint256 shares = _previewWithdraw(slippageAllowance);

    _withdraw(_msgSender(), receiver, owner, slippageAllowance, shares);

    return shares;
  }
}

// Questions

// 1. the totalAssets function calls IERC20(asset()).balanceOf() to get the totalAssets when the vault is paused. However, the asset in this case is WEth which is always converted to Eth before being deposited/withdrawn from the underlying Lido pool.
