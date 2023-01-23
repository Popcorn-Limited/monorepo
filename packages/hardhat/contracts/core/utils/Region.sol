// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "../interfaces/IRegion.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

contract Region is IRegion {
  IContractRegistry public contractRegistry;

  bytes32 public immutable override defaultRegion = keccak256("World");
  bytes32[] public regions;
  address[] public beneficiaryVaults;
  mapping(bytes32 => bool) public override regionExists;
  mapping(bytes32 => address) public override regionVaults;

  event RegionAdded(bytes32 region);

  constructor(address _beneficiaryVault, IContractRegistry _contractRegistry) {
    regions.push(keccak256("World"));
    regionExists[keccak256("World")] = true;
    beneficiaryVaults.push(_beneficiaryVault);
    regionVaults[keccak256("World")] = _beneficiaryVault;
    contractRegistry = _contractRegistry;
  }

  function getAllRegions() public view override returns (bytes32[] memory) {
    return regions;
  }

  function getAllVaults() public view override returns (address[] memory) {
    return beneficiaryVaults;
  }

  function addRegion(bytes32 region_, address _beneficiaryVault) external override {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    require(regionExists[region_] == false, "region already exists");
    regions.push(region_);
    regionExists[region_] = true;
    beneficiaryVaults.push(_beneficiaryVault);
    regionVaults[region_] = _beneficiaryVault;
    emit RegionAdded(region_);
  }
}
