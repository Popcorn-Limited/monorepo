// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface ITokenManager {
  function assignVested(
    address _receiver,
    uint256 _amount,
    uint64 _start,
    uint64 _cliff,
    uint64 _vested,
    bool _revokable
  ) external returns (uint256);

  function revokeVesting(address _holder, uint256 _vestingId) external;
}
