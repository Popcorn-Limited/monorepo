// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../core/interfaces/IKeeperIncentiveV2.sol";

contract KeeperIncentiveHelper {
  using SafeERC20 for IERC20;

  IKeeperIncentiveV2 public keeperIncentive;
  bytes32 public immutable contractName = "KeeperIncentiveHelper";

  event FunctionCalled(address account);
  event Tipped(address account);

  constructor(IKeeperIncentiveV2 keeperIncentive_) {
    keeperIncentive = keeperIncentive_;
  }

  function incentivisedFunctionLegacy() public {
    keeperIncentive.handleKeeperIncentive(contractName, 0, msg.sender);
    emit FunctionCalled(msg.sender);
  }

  function incentivisedFunction(uint8 i) public {
    keeperIncentive.handleKeeperIncentive(i, msg.sender);
    emit FunctionCalled(msg.sender);
  }

  function tipIncentive(
    address _rewardToken,
    address _keeper,
    uint256 _i,
    uint256 _amount
  ) public {
    IERC20(_rewardToken).safeTransferFrom(msg.sender, address(this), _amount);
    IERC20(_rewardToken).approve(address(keeperIncentive), _amount);
    keeperIncentive.tip(_rewardToken, _keeper, _i, _amount);
    emit Tipped(msg.sender);
  }

  function tipIncentiveWithBurn(
    address _rewardToken,
    address _keeper,
    uint256 _i,
    uint256 _amount,
    uint256 _burnPercentage
  ) public {
    IERC20(_rewardToken).safeTransferFrom(msg.sender, address(this), _amount);
    IERC20(_rewardToken).approve(address(keeperIncentive), _amount);
    keeperIncentive.tipWithBurn(_rewardToken, _keeper, _i, _amount, _burnPercentage);
    emit Tipped(msg.sender);
  }
}
