// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";

import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol";
import { IWETH } from "../../../interfaces/external/IWETH.sol";
import { IGearboxContractRegistry, VaultAPI, IPoolService, IAddressProvider } from "./IGearboxContractRegistry.sol";
import { SafeMath } from "openzeppelin-contracts/utils/math/SafeMath.sol";
import { PercentageMath } from "./PercentageMath.sol";
import "hardhat/console.sol";

/// @title GearboxAdapter
/// @notice ERC4626 wrapper for Gearbox passive pools
contract GearboxAdapter is AdapterBase {
  // using FixedPointMathLib for uint256;
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  using PercentageMath for uint256;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The poolId inside Convex booster for relevant Curve lpToken.
  uint256 public pid;

  /// @notice The booster address for Convex
  IPoolService public pool;

  IAddressProvider public gearboxAddressProvider;

  // IERC20 public asset;
  IERC20 public dieselToken;
  IERC20 public underlyingAsset;

  /*//////////////////////////////////////////////////////////////
                                INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  /**
   * @notice Initialize a new Lido Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @param gearboxInitData Encoded data for the Lido adapter initialization.
   * @dev `_gearboxAddressProvider` - The vault address for Lido.
   * @dev `_pid` - The poolId for lpToken.
   * @dev This function is called by the factory contract when deploying a new vault.
   */
  function initialize(
    bytes memory adapterInitData,
    address _nothing,
    bytes memory gearboxInitData
  ) public initializer {
    __AdapterBase_init(adapterInitData);

    (address _gearboxAddressProvider, uint256 _pid) = abi.decode(gearboxInitData, (address, uint256));

    gearboxAddressProvider = IAddressProvider(_gearboxAddressProvider);

    pool = IPoolService(IGearboxContractRegistry(gearboxAddressProvider.getContractsRegister()).pools(_pid));
    pid = _pid;
    underlyingAsset = IERC20(pool.underlyingToken());
    dieselToken = IERC20(pool.dieselToken());

    _name = string.concat("Popcorn Gearbox ", IERC20Metadata(address(underlyingAsset)).name(), " Adapter");
    _symbol = string.concat("popG-", IERC20Metadata(address(underlyingAsset)).symbol());

    // IERC20(address(underlyingAsset)).approve(address(underlyingAsset), type(uint256).max);
    IERC20(address(underlyingAsset)).approve(address(pool), type(uint256).max);
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

  function _underlyingBalance() internal view returns (uint256) {
    return dieselToken.balanceOf(address(this));
  }

  function _totalAssets() internal view override returns (uint256) {
    console.log("hoix", pool.fromDiesel(dieselToken.balanceOf(address(this))));
    return pool.fromDiesel(dieselToken.balanceOf(address(this)));
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  /// @notice Deposit into Gearbox pool
  function _protocolDeposit(uint256 assets, uint256 shares) internal virtual override {
    pool.addLiquidity(assets, address(this), 0);
  }

  /// @notice Withdraw from LIDO pool
  function _protocolWithdraw(uint256 assets, uint256 shares) internal virtual override {
    // uint256 underlyingShares = convertToUnderlyingShares(0, shares);
    uint256 underlyingShares = pool.toDiesel(assets);
    pool.removeLiquidity(underlyingShares, address(this));
  }

  /** @dev See {IERC4626-maxDeposit}. */
  function maxDeposit(address) public view virtual override returns (uint256) {
    return paused() ? 0 : pool.expectedLiquidityLimit().sub(pool.expectedLiquidity());
  }

  /** @dev See {IERC4626-maxDeposit}. */
  function maxMint(address) public view virtual override returns (uint256) {
    return
      paused()
        ? 0
        : _convertToShares((pool.expectedLiquidityLimit().sub(pool.expectedLiquidity())), Math.Rounding.Down);
  }

  /**
   * @notice Simulate the effects of a withdraw at the current block, given current on-chain conditions.
   * @dev Override this function if the underlying protocol has a unique withdrawal logic and/or withdraw fees.
   */
  function previewWithdraw(uint256 assets) public view virtual override returns (uint256) {
    uint256 feeTaken = assets.percentMul(pool.withdrawFee());
    uint256 amountSent = assets.sub(feeTaken);
    return _convertToShares(amountSent, Math.Rounding.Down);
  }

  /**
   * @notice Simulate the effects of a redeem at the current block, given current on-chain conditions.
   * @dev Override this function if the underlying protocol has a unique redeem logic and/or redeem fees.
   */
  function previewRedeem(uint256 shares) public view virtual override returns (uint256) {
    uint256 assets = _convertToAssets(shares, Math.Rounding.Down);
    uint256 feeTaken = assets.percentMul(pool.withdrawFee());
    uint256 amountSent = assets.sub(feeTaken);
    return amountSent;
  }

  /**
   * @notice Convert either `assets` or `shares` into underlying shares.
   * @dev This is an optional function for underlying protocols that require deposit/withdrawal amounts in their shares.
   * @dev Returns shares if totalSupply is 0.
   */
  function convertToUnderlyingShares(uint256 assets, uint256 shares) public view override returns (uint256) {
    if (shares != 0) {
      if (dieselToken.balanceOf(address(this)) == 0) {
        return shares.div(10**decimalOffset);
      }
      uint256 totalS = totalSupply();
      uint256 multiplier = totalSupply().div(dieselToken.balanceOf(address(this)));
      return shares.div(multiplier);
    }
    return _convertToShares(assets, Math.Rounding.Down);
  }

  /** @dev See {IERC4626-maxWithdraw}. */
  function maxWithdraw(address owner) public view virtual override returns (uint256) {
    // console.log("zavi", pool.fromDiesel(balanceOf(owner)));
    // console.log("DieselMethod", pool.fromDiesel(convertToUnderlyingShares(0, balanceOf(owner))));
    console.log("conv2AssetsMethod", _convertToAssets(balanceOf(owner), Math.Rounding.Down));
    return _convertToAssets(balanceOf(owner), Math.Rounding.Down).add(1);
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
  ) internal override {
    if (caller != owner) {
      _spendAllowance(owner, caller, shares);
    }

    uint256 balanceBefore = IERC20(asset()).balanceOf(address(this));

    if (!paused()) {
      _protocolWithdraw(assets, shares);
    }

    uint256 balancer = balanceOf(owner);
    uint256 totalSupply = totalSupply();
    console.log("balancer", balancer);
    console.log("totalS", totalSupply);
    uint256 sharesToEmit = _convertToShares(assets, Math.Rounding.Down);
    console.log("sh2Emit", sharesToEmit);

    _burn(owner, shares);
    uint256 balanceAfter = IERC20(asset()).balanceOf(address(this));
    uint256 assetsToSend = balanceAfter.sub(balanceBefore);

    IERC20(asset()).safeTransfer(receiver, assetsToSend);

    harvest();

    emit Withdraw(caller, receiver, owner, assets, shares);
  }

  function _convertToShares(uint256 assets, Math.Rounding rounding) internal view virtual override returns (uint256) {
    console.log("totalSupplyxox", totalSupply());
    console.log("totalAssetsxox", totalAssets());
    return assets.mulDiv(totalSupply() + 10**decimalOffset, totalAssets() + 1, rounding);
  }

  function _convertToAssets(uint256 shares, Math.Rounding rounding) internal view virtual override returns (uint256) {
    return shares.mulDiv(totalAssets() + 1, totalSupply() + 10**decimalOffset, rounding);
  }

  /**
   * @notice Simulate the effects of a deposit at the current block, given current on-chain conditions.
   * @dev Return 0 if paused since no further deposits are allowed.
   * @dev Override this function if the underlying protocol has a unique deposit logic and/or deposit fees.
   */
  function previewDeposit(uint256 assets) public view virtual override returns (uint256) {
    return paused() ? 0 : _convertToShares(assets - 1, Math.Rounding.Down);
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
    uint256 adjustedAssetsToReflectMath = assets - 1; // -1 ;
    if (adjustedAssetsToReflectMath > maxWithdraw(owner)) revert MaxError(assets);

    uint256 sharesBefore = dieselToken.balanceOf(address(this));
    uint256 underlyingShares = convertAssetsToUnderlyingShares(adjustedAssetsToReflectMath);
    uint256 shares = _convertToShares(adjustedAssetsToReflectMath, Math.Rounding.Down);

    console.log("shares", shares);
    console.log("underlyingShares", underlyingShares);

    _withdraw(_msgSender(), receiver, owner, assets, shares);
    uint256 sharesAfter = dieselToken.balanceOf(address(this));
    uint256 sharesRecieved = sharesBefore.sub(sharesAfter);
    console.log("sharesRecked", sharesRecieved);

    return shares;
  }

  function convertAssetsToUnderlyingShares(uint256 assets) internal returns (uint256) {
    return pool.toDiesel(assets);
  }

  /**
   * @notice Mints vault shares to `receiver` and deposits assets into the underlying protocol.
   * @param shares Amount of shares to mint.
   * @param receiver Receiver of the shares.
   */
  function mint(uint256 shares, address receiver) public virtual override returns (uint256) {
    if (shares > maxMint(receiver)) revert MaxError(shares);

    uint256 assets = _convertToAssets(shares, Math.Rounding.Down);
    _deposit(_msgSender(), receiver, assets, shares);

    return assets;
  }

  // /**
  //  * @notice Deposits assets into the underlying protocol and mints vault shares to `receiver`.
  //  * @param assets Amount of assets to deposit.
  //  * @param receiver Receiver of the shares.
  //  */
  // function deposit(uint256 assets, address receiver) public virtual override returns (uint256) {
  //   if (assets > maxDeposit(receiver)) revert MaxError(assets);
  //   // uint256 assetsBefore = totalAssets();
  //   uint256 shares = _convertToShares(assets, Math.Rounding.Down);
  //   _deposit(_msgSender(), receiver, assets, shares);
  //   // uint256 assetsAfter = totalAssets();
  //   // uint256 assetsDeposited = assetsAfter.sub(assetsBefore);
  //   // console.log("assetsDeposit", assetsDeposited);
  //   // uint256 shares = _convertToShares(assets, Math.Rounding.Down);

  //   return shares;
  // }

  // /**
  //  * @notice Deposit `assets` into the underlying protocol and mints vault shares to `receiver`.
  //  * @dev Executes harvest if `harvestCooldown` is passed since last invocation.
  //  */
  // function _deposit(
  //   address caller,
  //   address receiver,
  //   uint256 assets,
  //   uint256 shares
  // ) internal virtual override nonReentrant {
  //   IERC20(asset()).safeTransferFrom(caller, address(this), assets);

  //   // uint256 assetsBefore = totalAssets();
  //   _protocolDeposit(assets, shares);
  //   // uint256 assetsAfter = totalAssets();
  //   // uint256 assetsDeposited = assetsAfter.sub(assetsBefore);
  //   // uint256 sharesConverted = _convertToShares(assetsDeposited, Math.Rounding.Down);
  //   // console.log("sharesConv", sharesConverted);
  //   _mint(receiver, shares);

  //   harvest();

  //   emit Deposit(caller, receiver, assets, shares);
  // }

  /**
   * @notice Burns vault shares from `owner` and withdraws `assets` from the underlying protocol.
   * @param shares Amount of shares to burn.
   * @param receiver Receiver of the assets.
   * @param owner Owner of the shares.
   */
  function redeem(
    uint256 shares,
    address receiver,
    address owner
  ) public virtual override returns (uint256) {
    if (shares > maxRedeem(owner)) revert MaxError(shares);

    uint256 assets = _convertToAssets(shares, Math.Rounding.Up);

    uint256 underlyingShares = convertAssetsToUnderlyingShares(assets);
    console.log("assetsXOX", assets);

    _withdraw(_msgSender(), receiver, owner, assets, shares);

    return assets;
  }
}
