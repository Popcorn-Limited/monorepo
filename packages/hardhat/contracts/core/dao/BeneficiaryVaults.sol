// SPDX-License-Identifier: MIT

// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../interfaces/IBeneficiaryVaults.sol";
import "../interfaces/IBeneficiaryRegistry.sol";
import "../interfaces/IContractRegistry.sol";
import "../interfaces/IACLRegistry.sol";

contract BeneficiaryVaults is IBeneficiaryVaults, ReentrancyGuard {
  using SafeERC20 for IERC20;

  enum VaultStatus {
    Open,
    Closed
  }

  struct Vault {
    uint256 totalAllocated;
    uint256 currentBalance;
    uint256 unclaimedShare;
    mapping(address => bool) claimed;
    bytes32 merkleRoot;
    VaultStatus status;
  }

  /* ========== STATE VARIABLES ========== */

  IContractRegistry public contractRegistry;
  uint256 public totalDistributedBalance = 0;
  Vault[3] public vaults;

  /* ========== EVENTS ========== */

  event VaultOpened(uint8 vaultId, bytes32 merkleRoot);
  event VaultClosed(uint8 vaultId);
  event RewardsAllocated(uint256 amount);
  event RewardClaimed(uint8 vaultId, address beneficiary, uint256 amount);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
  }

  /* ========== VIEWS ========== */

  function getVault(uint8 _vaultId)
    public
    view
    _vaultExists(_vaultId)
    returns (
      uint256 totalAllocated,
      uint256 currentBalance,
      uint256 unclaimedShare,
      bytes32 merkleRoot,
      VaultStatus status
    )
  {
    Vault storage vault = vaults[_vaultId];
    totalAllocated = vault.totalAllocated;
    currentBalance = vault.currentBalance;
    unclaimedShare = vault.unclaimedShare;
    merkleRoot = vault.merkleRoot;
    status = vault.status;
  }

  function hasClaimed(uint8 _vaultId, address _beneficiary) public view _vaultExists(_vaultId) returns (bool) {
    return vaults[_vaultId].claimed[_beneficiary];
  }

  function vaultExists(uint8 _vaultId) public view override returns (bool) {
    return _vaultId < 3 && vaults[_vaultId].merkleRoot != "";
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice Initializes a vault for beneficiary claims
   * @param _vaultId Vault ID in range 0-2
   * @param _merkleRoot Merkle root to support claims
   * @dev Vault cannot be initialized if it is currently in an open state, otherwise existing data is reset*
   */
  function openVault(uint8 _vaultId, bytes32 _merkleRoot) public override {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(
      keccak256("BeneficiaryGovernance"),
      msg.sender
    );
    require(_vaultId < 3, "Invalid vault id");
    require(
      vaults[_vaultId].merkleRoot == "" || vaults[_vaultId].status == VaultStatus.Closed,
      "Vault must not be open"
    );

    delete vaults[_vaultId];
    Vault storage vault = vaults[_vaultId];
    vault.totalAllocated = 0;
    vault.currentBalance = 0;
    vault.unclaimedShare = 100e18;
    vault.merkleRoot = _merkleRoot;
    vault.status = VaultStatus.Open;

    emit VaultOpened(_vaultId, _merkleRoot);
  }

  /**
   * @notice Close an open vault and redirect rewards to other vaults
   * @dev Vault must be in an open state
   * @param _vaultId Vault ID in range 0-2
   */
  function closeVault(uint8 _vaultId) public override _vaultExists(_vaultId) {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(
      keccak256("BeneficiaryGovernance"),
      msg.sender
    );
    Vault storage vault = vaults[_vaultId];
    require(vault.status == VaultStatus.Open, "Vault must be open");

    uint256 remainingBalance = vault.currentBalance;
    vault.currentBalance = 0;
    vault.status = VaultStatus.Closed;

    if (remainingBalance > 0) {
      totalDistributedBalance = totalDistributedBalance - remainingBalance;
      if (_getOpenVaultCount() > 0) {
        allocateRewards();
      }
    }
    emit VaultClosed(_vaultId);
  }

  /**
   * @notice Verifies a valid claim with no cost
   * @param _vaultId Vault ID in range 0-2
   * @param _proof Merkle proof of path to leaf element
   * @param _beneficiary Beneficiary address encoded in leaf element
   * @param _share Beneficiary expected share encoded in leaf element
   * @return Returns boolean true or false if claim is valid
   */
  function verifyClaim(
    uint8 _vaultId,
    bytes32[] memory _proof,
    address _beneficiary,
    uint256 _share
  ) public view _vaultExists(_vaultId) returns (bool) {
    require(msg.sender == _beneficiary, "Sender must be beneficiary");
    require(vaults[_vaultId].status == VaultStatus.Open, "Vault must be open");
    require(
      IBeneficiaryRegistry(contractRegistry.getContract(keccak256("BeneficiaryRegistry"))).beneficiaryExists(
        _beneficiary
      ) == true,
      "Beneficiary does not exist"
    );

    return
      MerkleProof.verify(
        _proof,
        vaults[_vaultId].merkleRoot,
        bytes32(keccak256(abi.encodePacked(_beneficiary, _share)))
      );
  }

  /**
   * @notice Transfers POP tokens only once to beneficiary on successful claim
   * @dev Applies any outstanding rewards before processing claim
   * @param _vaultId Vault ID in range 0-2
   * @param _proof Merkle proof of path to leaf element
   * @param _beneficiary Beneficiary address encoded in leaf element
   * @param _share Beneficiary expected share encoded in leaf element
   */
  function claimReward(
    uint8 _vaultId,
    bytes32[] memory _proof,
    address _beneficiary,
    uint256 _share
  ) public nonReentrant _vaultExists(_vaultId) {
    require(verifyClaim(_vaultId, _proof, _beneficiary, _share) == true, "Invalid claim");
    require(hasClaimed(_vaultId, _beneficiary) == false, "Already claimed");

    Vault storage vault = vaults[_vaultId];

    uint256 reward = (vault.currentBalance * _share) / vault.unclaimedShare;

    require(reward > 0, "No reward");

    totalDistributedBalance = totalDistributedBalance - reward;
    vault.currentBalance = vault.currentBalance - reward;
    vault.unclaimedShare = vault.unclaimedShare - _share;

    vault.claimed[_beneficiary] = true;

    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(_beneficiary, reward);

    emit RewardClaimed(_vaultId, _beneficiary, reward);
  }

  /**
   * @notice Allocates unallocated POP token balance to vaults
   * @dev Requires at least one open vault
   */
  function allocateRewards() public override nonReentrant {
    uint256 availableReward = IERC20(contractRegistry.getContract(keccak256("POP"))).balanceOf(address(this)) -
      totalDistributedBalance;
    require(availableReward > 0, "no rewards available");

    uint8 openVaultCount = _getOpenVaultCount();
    require(openVaultCount > 0, "no open vaults");

    //@todo handle dust after div
    uint256 allocation = availableReward / openVaultCount;
    for (uint8 vaultId = 0; vaultId < vaults.length; vaultId++) {
      if (vaults[vaultId].status == VaultStatus.Open && vaults[vaultId].merkleRoot != "") {
        vaults[vaultId].totalAllocated = vaults[vaultId].totalAllocated + allocation;
        vaults[vaultId].currentBalance = vaults[vaultId].currentBalance + allocation;
      }
    }
    totalDistributedBalance = totalDistributedBalance + availableReward;
    emit RewardsAllocated(availableReward);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function _getOpenVaultCount() internal view returns (uint8) {
    uint8 openVaultCount = 0;
    for (uint8 i = 0; i < 3; i++) {
      if (vaults[i].merkleRoot != "" && vaults[i].status == VaultStatus.Open) {
        openVaultCount++;
      }
    }
    return openVaultCount;
  }

  /* ========== MODIFIERS ========== */

  modifier _vaultExists(uint8 _vaultId) {
    require(vaultExists(_vaultId), "vault must exist");
    _;
  }
}
