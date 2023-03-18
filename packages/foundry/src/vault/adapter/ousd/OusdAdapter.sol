// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { IOusd, IOusdVault, ICurveRouter } from "./IOusd.sol";

/**
 * @title   MasterChef Adapter
 * @author  amatureApe
 * @notice  ERC4626 wrapper for MasterChef Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/sushiswap/sushiswap/blob/archieve/canary/contracts/MasterChefV2.sol.
 * Allows wrapping MasterChef Vaults.
 */
contract Adapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The OUSD token contract.
  IOusd public ousd;

  /// @notice The address of the OUSD vault.
  IOusdVault public vault;

  /// @notice The Curve Router contract.
  ICurveRouter public curveRouter;

  /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  error InvalidAsset();

  /**
   * @notice Initialize a new MasterChef Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @dev `_ousd` - The address of the OUSD token.
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(bytes memory adapterInitData, address registry, bytes memory ousdInitData) external initializer {
    __AdapterBase_init(adapterInitData);

    (address _ousd, address _curveRouter) = abi.decode(ousdInitData, (address, address));

    ousd = IOusd(_ousd);
    vault = IOusdVault(ousd.vaultAddress());

    curveRouter = ICurveRouter(_curveRouter);

    _name = string.concat("Popcorn MasterChef", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    IERC20(asset()).approve(address(vault), type(uint256).max);
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
    return ousd.balanceOf(address(this));
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  function _protocolDeposit(uint256 amount, uint256) internal override {
    uint256 minOusdAmount = (amount / 100) * 99;
    vault.mint(asset(), amount, minOusdAmount);
  }

  function _protocolWithdraw(uint256 amount, uint256) internal override {
    address[9] memory route;
    route[0] = address(ousd);
    route[1] = 0x87650D7bbfC3A9F10587d7778206671719d9910D; //OUSD3CRV-f
    route[2] = address(asset());

    uint256[3][4] memory swap_params;

    uint256 expected = (amount / 100) * 95;

    address[4] memory pools;

    curveRouter.exchange_multiple(route, swap_params, amount, 0, pools);
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
