// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

interface IOusd {
  function vaultAddress() external view returns (address);

  function balanceOf(address _user) external view returns (uint256);
}

interface IOusdVault {
  function mint(address _asset, uint256 _amount, uint256 _expected) external;
}

interface ICurveRouter {
  function exchange_multiple(
    address[9] memory _route,
    uint256[3][4] memory _swap_params,
    uint256 _amount,
    uint256 _expected,
    address[4] memory _pools
  ) external;
}
