// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.10;

library Errors {
  //
  // COMMON
  //
  string public constant ZERO_ADDRESS_IS_NOT_ALLOWED = "Z0";
  string public constant NOT_IMPLEMENTED = "NI";
  string public constant INCORRECT_PATH_LENGTH = "PL";
  string public constant INCORRECT_ARRAY_LENGTH = "CR";
  string public constant REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY = "CP";
  string public constant REGISTERED_POOLS_ONLY = "RP";
  string public constant INCORRECT_PARAMETER = "IP";

  //
  // MATH
  //
  string public constant MATH_MULTIPLICATION_OVERFLOW = "M1";
  string public constant MATH_ADDITION_OVERFLOW = "M2";
  string public constant MATH_DIVISION_BY_ZERO = "M3";

  //
  // POOL
  //
  string public constant POOL_CONNECTED_CREDIT_MANAGERS_ONLY = "PS0";
  string public constant POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER = "PS1";
  string public constant POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT = "PS2";
  string public constant POOL_INCORRECT_WITHDRAW_FEE = "PS3";
  string public constant POOL_CANT_ADD_CREDIT_MANAGER_TWICE = "PS4";

  //
  // ACCOUNT FACTORY
  //
  string public constant AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK = "AF1";
  string public constant AF_MINING_IS_FINISHED = "AF2";
  string public constant AF_CREDIT_ACCOUNT_NOT_IN_STOCK = "AF3";
  string public constant AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN = "AF4";

  //
  // ADDRESS PROVIDER
  //
  string public constant AS_ADDRESS_NOT_FOUND = "AP1";

  //
  // CONTRACTS REGISTER
  //
  string public constant CR_POOL_ALREADY_ADDED = "CR1";
  string public constant CR_CREDIT_MANAGER_ALREADY_ADDED = "CR2";

  //
  // CREDIT ACCOUNT
  //
  string public constant CA_CONNECTED_CREDIT_MANAGER_ONLY = "CA1";
  string public constant CA_FACTORY_ONLY = "CA2";

  //
  // ACL
  //
  string public constant ACL_CALLER_NOT_PAUSABLE_ADMIN = "ACL1";
  string public constant ACL_CALLER_NOT_CONFIGURATOR = "ACL2";

  //
  // WETH GATEWAY
  //
  string public constant WG_DESTINATION_IS_NOT_WETH_COMPATIBLE = "WG1";
  string public constant WG_RECEIVE_IS_NOT_ALLOWED = "WG2";
  string public constant WG_NOT_ENOUGH_FUNDS = "WG3";

  //
  // TOKEN DISTRIBUTOR
  //
  string public constant TD_WALLET_IS_ALREADY_CONNECTED_TO_VC = "TD1";
  string public constant TD_INCORRECT_WEIGHTS = "TD2";
  string public constant TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION = "TD3";
  string public constant TD_CONTRIBUTOR_IS_NOT_REGISTERED = "TD4";
}

uint16 constant PERCENTAGE_FACTOR = 1e4; //percentage plus two decimals
uint256 constant HALF_PERCENT = PERCENTAGE_FACTOR / 2;

/**
 * @title PercentageMath library
 * @author Aave
 * @notice Provides functions to perform percentage calculations
 * @dev Percentages are defined by default with 2 decimals of precision (100.00). The precision is indicated by PERCENTAGE_FACTOR
 * @dev Operations are rounded half up
 **/

library PercentageMath {
  /**
   * @dev Executes a percentage multiplication
   * @param value The value of which the percentage needs to be calculated
   * @param percentage The percentage of the value to be calculated
   * @return The percentage of value
   **/
  function percentMul(uint256 value, uint256 percentage) internal pure returns (uint256) {
    if (value == 0 || percentage == 0) {
      return 0; // T:[PM-1]
    }

    //        require(
    //            value <= (type(uint256).max - HALF_PERCENT) / percentage,
    //            Errors.MATH_MULTIPLICATION_OVERFLOW
    //        ); // T:[PM-1]

    return (value * percentage + HALF_PERCENT) / PERCENTAGE_FACTOR; // T:[PM-1]
  }

  /**
   * @dev Executes a percentage division
   * @param value The value of which the percentage needs to be calculated
   * @param percentage The percentage of the value to be calculated
   * @return The value divided the percentage
   **/
  function percentDiv(uint256 value, uint256 percentage) internal pure returns (uint256) {
    require(percentage != 0, Errors.MATH_DIVISION_BY_ZERO); // T:[PM-2]
    uint256 halfPercentage = percentage / 2; // T:[PM-2]

    //        require(
    //            value <= (type(uint256).max - halfPercentage) / PERCENTAGE_FACTOR,
    //            Errors.MATH_MULTIPLICATION_OVERFLOW
    //        ); // T:[PM-2]

    return (value * PERCENTAGE_FACTOR + halfPercentage) / percentage;
  }
}
