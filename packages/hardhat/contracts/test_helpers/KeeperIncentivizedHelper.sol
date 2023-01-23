// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "../core/interfaces/IContractRegistry.sol";
import "../core/utils/ContractRegistryAccess.sol";
import "../core/utils/KeeperIncentivized.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KeeperIncentivizedHelper is KeeperIncentivized, ContractRegistryAccess {
  bytes32 public immutable contractName = keccak256("KeeperIncentivizedHelper");

  constructor(IContractRegistry _contractRegistry) ContractRegistryAccess(_contractRegistry) {}

  function handleKeeperIncentiveModifierCall() public keeperIncentive(0) {}

  function handleKeeperIncentiveDirectCall() public {
    _handleKeeperIncentive(0, msg.sender);
  }

  function tipIncentiveDirectCall(
    address _rewardToken,
    address _keeper,
    uint256 _i,
    uint256 _amount
  ) public {
    IERC20(_rewardToken).approve(_getContract(keccak256("KeeperIncentive")), _amount);
    IERC20(_rewardToken).transferFrom(msg.sender, address(this), _amount);
    _tip(_rewardToken, _keeper, _i, _amount);
  }

  function _getContract(bytes32 _name)
    internal
    view
    override(KeeperIncentivized, ContractRegistryAccess)
    returns (address)
  {
    return super._getContract(_name);
  }
}
