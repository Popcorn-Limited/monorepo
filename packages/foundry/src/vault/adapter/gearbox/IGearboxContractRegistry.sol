// SPDX-FileCopyrightText: 2020 Lido <info@lido.fi>

// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.15;

import { ERC4626Upgradeable as ERC4626, IERC20, IERC20Metadata, ERC20, SafeERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";

interface IAddressProviderEvents {
  /// @dev Emits when an address is set for a contract role
  event AddressSet(bytes32 indexed service, address indexed newAddress);
}

/// @title Optimised for front-end Address Provider interface
interface IAddressProvider is IAddressProviderEvents {
  /// @return Address of ACL contract
  function getACL() external view returns (address);

  /// @return Address of ContractsRegister
  function getContractsRegister() external view returns (address);

  /// @return Address of AccountFactory
  function getAccountFactory() external view returns (address);

  /// @return Address of DataCompressor
  function getDataCompressor() external view returns (address);

  /// @return Address of GEAR token
  function getGearToken() external view returns (address);

  /// @return Address of WETH token
  function getWethToken() external view returns (address);

  /// @return Address of WETH Gateway
  function getWETHGateway() external view returns (address);

  /// @return Address of PriceOracle
  function getPriceOracle() external view returns (address);

  /// @return Address of DAO Treasury Multisig
  function getTreasuryContract() external view returns (address);

  /// @return Address of PathFinder
  function getLeveragedActions() external view returns (address);
}

interface IGearboxContractRegistry {
  /// @dev Returns pool address for i-element
  function pools(uint256 i) external returns (address);
}

interface VaultAPI is IERC20 {
  function deposit(uint256 amount) external returns (uint256);

  function withdraw(uint256 maxShares) external returns (uint256);

  function pricePerShare() external view returns (uint256);

  function totalAssets() external view returns (uint256);

  function totalSupply() external view returns (uint256);

  function getTotalShares() external view returns (uint256);

  function balanceOf(address _account) external view returns (uint256);

  function depositLimit() external view returns (uint256);

  function token() external view returns (address);

  function weth() external view returns (address);

  function lastReport() external view returns (uint256);

  function lockedProfit() external view returns (uint256);

  function lockedProfitDegradation() external view returns (uint256);

  function totalDebt() external view returns (uint256);
}

interface IPoolServiceEvents {
  /// @dev Emits on new liquidity being added to the pool
  event AddLiquidity(address indexed sender, address indexed onBehalfOf, uint256 amount, uint256 referralCode);

  /// @dev Emits on liquidity being removed to the pool
  event RemoveLiquidity(address indexed sender, address indexed to, uint256 amount);

  /// @dev Emits on a Credit Manager borrowing funds for a Credit Account
  event Borrow(address indexed creditManager, address indexed creditAccount, uint256 amount);

  /// @dev Emits on repayment of a Credit Account's debt
  event Repay(address indexed creditManager, uint256 borrowedAmount, uint256 profit, uint256 loss);

  /// @dev Emits on updating the interest rate model
  event NewInterestRateModel(address indexed newInterestRateModel);

  /// @dev Emits on connecting a new Credit Manager
  event NewCreditManagerConnected(address indexed creditManager);

  /// @dev Emits when a Credit Manager is forbidden to borrow
  event BorrowForbidden(address indexed creditManager);

  /// @dev Emitted when loss is incurred that can't be covered by treasury funds
  event UncoveredLoss(address indexed creditManager, uint256 loss);

  /// @dev Emits when the liquidity limit is changed
  event NewExpectedLiquidityLimit(uint256 newLimit);

  /// @dev Emits when the withdrawal fee is changed
  event NewWithdrawFee(uint256 fee);
}

/// @title Pool Service Interface
/// @notice Implements business logic:
///   - Adding/removing pool liquidity
///   - Managing diesel tokens & diesel rates
///   - Taking/repaying Credit Manager debt
/// More: https://dev.gearbox.fi/developers/pool/abstractpoolservice
interface IPoolService is IPoolServiceEvents {
  //
  // LIQUIDITY MANAGEMENT
  //

  /**
   * @dev Adds liquidity to pool
   * - transfers the underlying to the pool
   * - mints Diesel (LP) tokens to onBehalfOf
   * @param amount Amount of tokens to be deposited
   * @param onBehalfOf The address that will receive the dToken
   * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
   *   0 if the action is executed directly by the user, without a facilitator.
   */
  function addLiquidity(
    uint256 amount,
    address onBehalfOf,
    uint256 referralCode
  ) external;

  /**
   * @dev Removes liquidity from pool
   * - burns LP's Diesel (LP) tokens
   * - returns the equivalent amount of underlying to 'to'
   * @param amount Amount of Diesel tokens to burn
   * @param to Address to transfer the underlying to
   */

  function removeLiquidity(uint256 amount, address to) external returns (uint256);

  /**
   * @dev Lends pool funds to a Credit Account
   * @param borrowedAmount Credit Account's debt principal
   * @param creditAccount Credit Account's address
   */
  function lendCreditAccount(uint256 borrowedAmount, address creditAccount) external;

  /**
   * @dev Repays the Credit Account's debt
   * @param borrowedAmount Amount of principal ro repay
   * @param profit The treasury profit from repayment
   * @param loss Amount of underlying that the CA wan't able to repay
   * @notice Assumes that the underlying (including principal + interest + fees)
   *         was already transferred
   */
  function repayCreditAccount(
    uint256 borrowedAmount,
    uint256 profit,
    uint256 loss
  ) external;

  //
  // GETTERS
  //

  /**
   * @dev Returns the total amount of liquidity in the pool, including borrowed and available funds
   */
  function expectedLiquidity() external view returns (uint256);

  /**
   * @dev Returns the limit on total liquidity
   */
  function expectedLiquidityLimit() external view returns (uint256);

  /**
   * @dev Returns the available liquidity, which is expectedLiquidity - totalBorrowed
   */
  function availableLiquidity() external view returns (uint256);

  /**
   * @dev Calculates the current interest index, RAY format
   */
  function calcLinearCumulative_RAY() external view returns (uint256);

  /**
   * @dev Calculates the current borrow rate, RAY format
   */
  function borrowAPY_RAY() external view returns (uint256);

  /**
   * @dev Returns the total borrowed amount (includes principal only)
   */
  function totalBorrowed() external view returns (uint256);

  /**
   * ç
   **/

  function getDieselRate_RAY() external view returns (uint256);

  /**
   * @dev Returns the address of the underlying
   */
  function underlyingToken() external view returns (address);

  /**
   * @dev Returns the address of the diesel token
   */
  function dieselToken() external view returns (address);

  /**
   * @dev Returns the address of a Credit Manager by its id
   */
  function creditManagers(uint256 id) external view returns (address);

  /**
   * @dev Returns the number of known Credit Managers
   */
  function creditManagersCount() external view returns (uint256);

  /**
   * @dev Maps Credit Manager addresses to their status as a borrower.
   *      Returns false if borrowing is not allowed.
   */
  function creditManagersCanBorrow(address id) external view returns (bool);

  /// @dev Converts a quantity of the underlying to Diesel tokens
  function toDiesel(uint256 amount) external view returns (uint256);

  /// @dev Converts a quantity of Diesel tokens to the underlying
  function fromDiesel(uint256 amount) external view returns (uint256);

  /// @dev Returns the withdrawal fee
  function withdrawFee() external view returns (uint256);

  /// @dev Returns the timestamp of the pool's last update
  function _timestampLU() external view returns (uint256);

  /// @dev Returns the interest index at the last pool update
  function _cumulativeIndex_RAY() external view returns (uint256);
}
