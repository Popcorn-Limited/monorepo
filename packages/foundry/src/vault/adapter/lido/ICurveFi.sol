// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

interface ICurveFi {
  function get_virtual_price() external view returns (uint256);

  function add_liquidity(uint256[4] calldata amounts, uint256 min_mint_amount) external;

  function remove_liquidity_imbalance(uint256[4] calldata amounts, uint256 max_burn_amount) external;

  function remove_liquidity(uint256 _amount, uint256[4] calldata amounts) external;

  function exchange(
    int128 from,
    int128 to,
    uint256 _from_amount,
    uint256 _min_to_amount
  ) external returns (uint256);

  function calc_token_amount(uint256[2] calldata amounts, bool deposit) external view returns (uint256);

  function get_dy(
    int128 i,
    int128 j,
    uint256 dx
  ) external view returns (uint256);
}
