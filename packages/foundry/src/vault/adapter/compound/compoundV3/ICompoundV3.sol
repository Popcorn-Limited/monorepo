// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.15;

interface ICToken {
  function baseTrackingBorrowSpeed() external view returns (uint256);

  function balanceOf(address _user) external view returns (uint256);

  function governor() external view returns (address);

  function isSupplyPaused() external view returns (bool);

  function supply(address _asset, uint256 _amount) external;

  function isWithdrawPaused() external view returns (bool);

  function withdraw(address _asset, uint256 _amount) external;
}

interface ICometRewarder {
  function claim(address _cToken, address _owner, bool _accrue) external;
}

interface IGovernor {
  function admin() external view returns (address);
}

interface IAdmin {
  function comp() external view returns (address);
}
