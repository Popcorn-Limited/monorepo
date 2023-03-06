// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";

import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol";
import { IWETH } from "../../../interfaces/external/IWETH.sol";
import { ILido, VaultAPI } from "./ILido.sol";
import { ICurveFi } from "./ICurveFi.sol";
import { SafeMath } from "openzeppelin-contracts/utils/math/SafeMath.sol";

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
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  int128 private constant WETHID = 0;
  int128 private constant STETHID = 1;
  ICurveFi public constant stableSwapSTETH = ICurveFi(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022);
  uint256 public slippage; // 100% = 1e18

  ILido public lido;

  // address public immutable weth;
  IWETH public weth;

  // TODO We need to figure out how to get this referral
  address private referal = address(0); //stratms. for recycling and redepositing

  /*//////////////////////////////////////////////////////////////
                                INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  /**
   * @notice Initialize a new Lido Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @param registry Lido address.
   * @param lidoInitData init data
   * @dev `_slippage` - The poolId for lpToken.
   * @dev This function is called by the factory contract when deploying a new vault.
   */
  function initialize(
    bytes memory adapterInitData,
    address registry,
    bytes memory lidoInitData
  ) public initializer {
    __AdapterBase_init(adapterInitData);
    uint256 _slippage = abi.decode(lidoInitData, (uint256));

    lido = ILido(ILido(registry).token());
    weth = IWETH(ILido(registry).weth());
    slippage = _slippage;

    _name = string.concat("Popcorn Lido ", IERC20Metadata(address(weth)).name(), " Adapter");
    _symbol = string.concat("popL-", IERC20Metadata(address(weth)).symbol());

    IERC20(address(lido)).approve(address(lido), type(uint256).max);
    IERC20(address(lido)).approve(address(stableSwapSTETH), type(uint256).max);
    IERC20(address(weth)).approve(address(lido), type(uint256).max);
    IERC20(address(weth)).approve(address(stableSwapSTETH), type(uint256).max);
  }


  // Lido sends us ETH so we need to have this function
  event Log(string func, uint256 gas);

  // Fallback function must be declared as external.
  fallback() external payable {
    // send / transfer (forwards 2300 gas to this fallback function)
    // call (forwards all of the gas)
    emit Log("fallback", gasleft());
  }

  receive() external payable {
    emit Log("receive", gasleft());
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
    return lido.balanceOf(address(this)); // this can be higher than the total assets deposited due to staking rewards
  }

  /**
   * @notice Simulate the effects of a withdraw at the current block, given current on-chain conditions.
   * @dev Override this function if the underlying protocol has a unique withdrawal logic and/or withdraw fees.
   */
  function previewWithdraw(uint256 assets) public view override returns (uint256) {
    return _convertToShares(assets.mulDiv(slippage, 1e18, Math.Rounding.Down), Math.Rounding.Up);
  }

  /**
   * @notice Simulate the effects of a redeem at the current block, given current on-chain conditions.
   * @dev Override this function if the underlying protocol has a unique redeem logic and/or redeem fees.
   */
  function previewRedeem(uint256 shares) public view override returns (uint256) {
    return _convertToAssets(shares.mulDiv(slippage, 1e18, Math.Rounding.Down), Math.Rounding.Down);
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  event log(uint256);

  /// @notice Deposit into LIDO pool
  function _protocolDeposit(uint256 assets, uint256) internal override {
    emit log(IERC20(address(weth)).balanceOf(address(this)));
    weth.withdraw(assets); // Grab native Eth from Weth contract
    lido.submit{ value: assets }(referal); // Submit to Lido Contract
  }

  /// @notice Withdraw from LIDO pool
  function _protocolWithdraw(uint256 assets, uint256 shares) internal override {
    uint256 slippageAllowance = assets.mulDiv(slippage, 1e18, Math.Rounding.Down);
    uint256 amountRecieved = stableSwapSTETH.exchange(STETHID, WETHID, assets, slippageAllowance);
    weth.deposit{ value: amountRecieved }(); // get wrapped eth back
  }
}
