// SPDX-License-Identifier: MIT

// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "../interfaces/IBeneficiaryRegistry.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

contract BeneficiaryRegistry is IBeneficiaryRegistry {
  struct Beneficiary {
    string applicationCid; // ipfs address of application
    bytes32 region;
    uint256 listPointer;
  }

  /* ========== STATE VARIABLES ========== */

  IContractRegistry private contractRegistry;

  mapping(address => Beneficiary) private beneficiariesMap;
  address[] private beneficiariesList;

  /* ========== EVENTS ========== */

  event BeneficiaryAdded(address indexed _address, string indexed _applicationCid);
  event BeneficiaryRevoked(address indexed _address);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
  }

  /* ========== VIEW FUNCTIONS ========== */

  /**
   * @notice check if beneficiary exists in the registry
   */
  function beneficiaryExists(address _address) public view override returns (bool) {
    if (beneficiariesList.length == 0) return false;
    return beneficiariesList[beneficiariesMap[_address].listPointer] == _address;
  }

  /**
   * @notice get beneficiary's application cid from registry. this cid is the address to the beneficiary application that is included in the beneficiary nomination proposal.
   */
  function getBeneficiary(address _address) public view returns (string memory) {
    return beneficiariesMap[_address].applicationCid;
  }

  function getBeneficiaryList() public view returns (address[] memory) {
    return beneficiariesList;
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice add a beneficiary with their IPFS cid to the registry
   * TODO: allow only election contract to modify beneficiary
   */
  function addBeneficiary(
    address _account,
    bytes32 _region,
    string calldata _applicationCid
  ) external override {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(
      keccak256("BeneficiaryGovernance"),
      msg.sender
    );
    require(_account == address(_account), "invalid address");
    require(bytes(_applicationCid).length > 0, "!application");
    require(!beneficiaryExists(_account), "exists");

    beneficiariesList.push(_account);
    beneficiariesMap[_account] = Beneficiary({
      applicationCid: _applicationCid,
      region: _region,
      listPointer: beneficiariesList.length - 1
    });

    emit BeneficiaryAdded(_account, _applicationCid);
  }

  /**
   * @notice remove a beneficiary from the registry. (callable only by council)
   */
  function revokeBeneficiary(address _address) external override {
    IACLRegistry aclRegistry = IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry")));
    require(
      aclRegistry.hasRole(keccak256("BeneficiaryGovernance"), msg.sender) ||
        (aclRegistry.hasRole(keccak256("Council"), msg.sender) &&
          aclRegistry.hasPermission(beneficiariesMap[_address].region, msg.sender)),
      "Only the BeneficiaryGovernance or council may perform this action"
    );
    require(beneficiaryExists(_address), "exists");
    delete beneficiariesList[beneficiariesMap[_address].listPointer];
    delete beneficiariesMap[_address];
    emit BeneficiaryRevoked(_address);
  }

  /* ========== MODIFIER ========== */

  modifier validAddress(address _address) {
    require(_address == address(_address), "invalid address");
    _;
  }
}
