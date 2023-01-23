// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

/**
 * @dev This Contract holds reference to all our contracts. Every contract A that needs to interact with another contract B calls this contract
 * to ask for the address of B.
 * This allows us to update addresses in one central point and reduces constructing and management overhead.
 */
contract ContractRegistry is IContractRegistry {
  struct Contract {
    address contractAddress;
    bytes32 version;
  }

  /* ========== STATE VARIABLES ========== */

  IACLRegistry public aclRegistry;

  mapping(bytes32 => Contract) public contracts;

  /* Adding a reverse mapping of contract names and versions. */
  // The bytes32 is used as a key in contracts which returns a tuple of name and version.
  mapping(address => bytes32) public contractAddresses;

  bytes32[] public contractNames;

  /* ========== EVENTS ========== */

  event ContractAdded(bytes32 _name, address _address, bytes32 _version);
  event ContractUpdated(bytes32 _name, address _address, bytes32 _version);
  event ContractDeleted(bytes32 _name);

  /* ========== CONSTRUCTOR ========== */

  constructor(IACLRegistry _aclRegistry) {
    aclRegistry = _aclRegistry;
    contracts[keccak256("ACLRegistry")] = Contract({ contractAddress: address(_aclRegistry), version: keccak256("1") });
    contractAddresses[address(_aclRegistry)] = keccak256("ACLRegistry");
    contractNames.push(keccak256("ACLRegistry"));
  }

  /* ========== VIEW FUNCTIONS ========== */

  function getContractNames() external view returns (bytes32[] memory) {
    return contractNames;
  }

  function getContract(bytes32 _name) external view override returns (address) {
    return contracts[_name].contractAddress;
  }

  function getContractIdFromAddress(address _contractAddress) external view override returns (bytes32) {
    return contractAddresses[_contractAddress];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  function addContract(
    bytes32 _name,
    address _address,
    bytes32 _version
  ) external override {
    aclRegistry.requireRole(keccak256("DAO"), msg.sender);
    require(contracts[_name].contractAddress == address(0), "contract already exists");
    require(contractAddresses[_address] == "", "contract address already in use");
    contracts[_name] = Contract({ contractAddress: _address, version: _version });
    contractAddresses[_address] = _name;
    contractNames.push(_name);
    emit ContractAdded(_name, _address, _version);
  }

  function updateContract(
    bytes32 _name,
    address _newAddress,
    bytes32 _version
  ) external {
    aclRegistry.requireRole(keccak256("DAO"), msg.sender);
    require(contracts[_name].contractAddress != address(0), "contract doesnt exist");
    require(contractAddresses[_newAddress] == "", "contract address already in use");
    // update the old address to not show the name anymore.
    delete contractAddresses[contracts[_name].contractAddress];
    // update the contractNames
    contracts[_name] = Contract({ contractAddress: _newAddress, version: _version });
    // update the new address to show the name.
    contractAddresses[_newAddress] = _name;
    emit ContractUpdated(_name, _newAddress, _version);
  }

  function deleteContract(bytes32 _name, uint256 _contractIndex) external {
    aclRegistry.requireRole(keccak256("DAO"), msg.sender);
    require(contracts[_name].contractAddress != address(0), "contract doesnt exist");
    require(contractNames[_contractIndex] == _name, "this is not the contract you are looking for");
    delete contractAddresses[contracts[_name].contractAddress];
    delete contracts[_name];
    delete contractNames[_contractIndex];
    emit ContractDeleted(_name);
  }
}
