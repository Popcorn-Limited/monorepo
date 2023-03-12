// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IStargateRouter {
  function addLiquidity(
    uint256 _pid,
    uint256 _amount,
    address _to
  ) external;
}
