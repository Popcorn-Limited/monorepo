// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

contract ParticipationReward is ReentrancyGuard {
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */
  enum VaultStatus {
    Init,
    Open
  }

  struct Vault {
    VaultStatus status;
    uint256 endTime;
    uint256 shares;
    uint256 tokenBalance;
    mapping(address => uint256) shareBalances;
    mapping(address => bool) claimed;
  }

  IContractRegistry public contractRegistry;

  uint256 public rewardBalance;
  uint256 public totalVaultsBudget;
  mapping(bytes32 => uint256) public rewardBudgets;
  mapping(bytes32 => Vault) public vaults;
  mapping(address => bytes32[]) public userVaults;
  mapping(bytes32 => address) public controllerContracts;
  mapping(bytes32 => bool) public rewardsEnabled;

  /* ========== EVENTS ========== */
  event RewardBudgetChanged(bytes32 _contractName, uint256 amount);
  event VaultInitialized(bytes32 vaultId);
  event VaultOpened(bytes32 vaultId);
  event VaultClosed(bytes32 vaultId);
  event RewardClaimed(bytes32 vaultId, address _account, uint256 amount);
  event RewardsClaimed(address _account, uint256 amount);
  event SharesAdded(bytes32 _vaultId, address _account, uint256 _shares);
  event RewardBalanceIncreased(address account, uint256 amount);
  event ControllerContractAdded(bytes32 _contractName, address _contract);
  event RewardsToggled(bytes32 _contractName, bool prevState, bool newState);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
  }

  /* ========== VIEWS ========== */

  function isClaimable(bytes32 _vaultId, address _beneficiary) public view vaultExists(_vaultId) returns (bool) {
    return
      vaults[_vaultId].status == VaultStatus.Open &&
      vaults[_vaultId].shareBalances[_beneficiary] > 0 &&
      vaults[_vaultId].claimed[_beneficiary] == false;
  }

  /**
   * @notice Checks if a beneficiary has a claim in the specified vault
   * @param _vaultId Bytes32
   * @param _beneficiary address of the beneficiary
   */
  function hasClaim(bytes32 _vaultId, address _beneficiary) public view vaultExists(_vaultId) returns (bool) {
    return vaults[_vaultId].shareBalances[_beneficiary] > 0 && vaults[_vaultId].claimed[_beneficiary] == false;
  }

  /**
   * @notice Returns the vault status
   * @param _vaultId Bytes32
   */
  function getVaultStatus(bytes32 _vaultId) external view returns (VaultStatus) {
    return vaults[_vaultId].status;
  }

  /**
   * @notice Returns all vaultIds which an account has/had claims in
   * @param _account address
   */
  function getUserVaults(address _account) external view returns (bytes32[] memory) {
    return userVaults[_account];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice Initializes a vault for voting claims
   * @param _contractName Name of contract that uses ParticipationRewards in bytes32
   * @param _vaultId Bytes32
   * @param _endTime Unix timestamp in seconds after which a vault can be closed
   * @dev There must be enough funds in this contract to support opening another vault
   */
  function initializeVault(
    bytes32 _contractName,
    bytes32 _vaultId,
    uint256 _endTime
  ) external onlyControllerContract(_contractName) returns (bool, bytes32) {
    require(rewardsEnabled[_contractName], "participationRewards are not enabled for this contract");
    require(vaults[_vaultId].endTime == 0, "Vault must not exist");
    require(_endTime > block.timestamp, "end must be in the future");

    uint256 expectedVaultBudget = totalVaultsBudget + rewardBudgets[_contractName];
    if (expectedVaultBudget > rewardBalance || rewardBalance == 0) {
      return (false, "");
    }

    totalVaultsBudget = expectedVaultBudget;

    Vault storage vault = vaults[_vaultId];
    vault.endTime = _endTime;
    vault.tokenBalance = rewardBudgets[_contractName];

    emit VaultInitialized(_vaultId);
    return (true, _vaultId);
  }

  /**
   * @notice Open a vault it can receive rewards and accept claims
   * @dev Vault must be in an initialized state
   * @param _contractName the controller contract
   * @param _vaultId Vault ID in bytes32
   */
  function openVault(bytes32 _contractName, bytes32 _vaultId)
    external
    onlyControllerContract(_contractName)
    vaultExists(_vaultId)
  {
    require(vaults[_vaultId].status == VaultStatus.Init, "Vault must be initialized");
    require(vaults[_vaultId].endTime <= block.timestamp, "wait till endTime is over");
    //TODO should vaults also be mapped to contracts? Currently contract A could technically open vaults for contract B the only protection against that is governance who decides which contracts get added
    vaults[_vaultId].status = VaultStatus.Open;

    emit VaultOpened(_vaultId);
  }

  /**
   * @notice Adds Shares of an account to the current vault
   * @param _contractName the controller contract
   * @param _vaultId Bytes32
   * @param _account address
   * @param _shares uint256
   * @dev This will be called by contracts after an account has voted in order to add them to the vault of the specified election.
   */
  function addShares(
    bytes32 _contractName,
    bytes32 _vaultId,
    address _account,
    uint256 _shares
  ) external onlyControllerContract(_contractName) vaultExists(_vaultId) {
    require(vaults[_vaultId].status == VaultStatus.Init, "Vault must be initialized");
    vaults[_vaultId].shares = vaults[_vaultId].shares + _shares;
    vaults[_vaultId].shareBalances[_account] = _shares;

    userVaults[_account].push(_vaultId);

    emit SharesAdded(_vaultId, _account, _shares);
  }

  /**
   * @notice Claim rewards of a vault
   * @param _index uint256
   * @dev Uses the vaultId at the specified index of userVaults.
   * @dev This function is used when a user only wants to claim a specific vault or if they decide the gas cost of claimRewards are to high for now.
   * @dev (lower cost but also lower reward)
   */
  function claimReward(uint256 _index) external nonReentrant {
    bytes32 vaultId = userVaults[msg.sender][_index];
    require(vaults[vaultId].status == VaultStatus.Open, "vault is not open");
    require(!vaults[vaultId].claimed[msg.sender], "already claimed");
    uint256 reward = _claimVaultReward(vaultId, _index, msg.sender);
    require(reward > 0, "no rewards");
    require(reward <= rewardBalance, "not enough funds for payout");

    totalVaultsBudget = totalVaultsBudget - reward;
    rewardBalance = rewardBalance - reward;

    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransfer(msg.sender, reward);

    emit RewardsClaimed(msg.sender, reward);
  }

  /**
   * @notice Claim rewards of a a number of vaults
   * @param _indices uint256[]
   * @dev Uses the vaultIds at the specified indices of userVaults.
   * @dev This function is used when a user only wants to claim multiple vaults at once (probably most of the time)
   * @dev The array of indices is limited to 19 as we want to prevent gas overflow of looping through too many vaults
   */
  function claimRewards(uint256[] calldata _indices) external nonReentrant {
    require(_indices.length < 20, "claiming too many vaults");
    uint256 total;

    for (uint256 i = 0; i < _indices.length; i++) {
      bytes32 vaultId = userVaults[msg.sender][_indices[i]];
      if (vaults[vaultId].status == VaultStatus.Open && !vaults[vaultId].claimed[msg.sender]) {
        total = total + _claimVaultReward(vaultId, _indices[i], msg.sender);
      }
    }

    require(total > 0, "no rewards");
    require(total <= rewardBalance, "not enough funds for payout");

    totalVaultsBudget = totalVaultsBudget - total;
    rewardBalance = rewardBalance - total;

    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransfer(msg.sender, total);

    emit RewardsClaimed(msg.sender, total);
  }

  /**
   * @notice Underlying function to calculate the rewards that a user gets and set the vault to claimed
   * @param _vaultId Bytes32
   * @param _index uint256
   * @param _account address
   * @dev We dont want it to error when a vault is empty for the user as this would terminate the entire loop when used in claimRewards()
   */
  function _claimVaultReward(
    bytes32 _vaultId,
    uint256 _index,
    address _account
  ) internal returns (uint256) {
    uint256 userShares = vaults[_vaultId].shareBalances[_account];
    if (userShares > 0) {
      uint256 reward = (vaults[_vaultId].tokenBalance * userShares) / vaults[_vaultId].shares;
      vaults[_vaultId].tokenBalance = vaults[_vaultId].tokenBalance - reward;
      vaults[_vaultId].claimed[_account] = true;

      delete userVaults[_account][_index];
      return reward;
    }
    return 0;
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  /**
   * @notice Sets the budget of rewards in POP per vault
   * @param _contractName the name of the controller contract in bytes32
   * @param _amount uint256 reward amount in POP per vault
   * @dev When opening a vault this contract must have enough POP to fund the rewardBudgets of the new vault
   * @dev Every controller contract has their own rewardsBudget to set indivual rewards per controller contract
   */
  function setRewardsBudget(bytes32 _contractName, uint256 _amount) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    require(_amount > 0, "must be larger 0");
    rewardBudgets[_contractName] = _amount;
    emit RewardBudgetChanged(_contractName, _amount);
  }

  /**
   * @notice In order to allow a contract to use ParticipationReward they need to be added as a controller contract
   * @param _contractName the name of the controller contract in bytes32
   * @param _contract the address of the controller contract
   * @dev all critical functions to init/open vaults and add shares to them can only be called by controller contracts
   */
  function addControllerContract(bytes32 _contractName, address _contract) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    controllerContracts[_contractName] = _contract;
    rewardsEnabled[_contractName] = true;
    emit ControllerContractAdded(_contractName, _contract);
  }

  /**
   * @notice Governance can disable rewards for a controller contract in order to stop an unused contract to leech rewards
   * @param _contractName the address of the controller contract
   * @dev all critical functions to init/open vaults and add shares to them can only be called by controller contracts
   */
  function toggleRewards(bytes32 _contractName) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    bool prevState = rewardsEnabled[_contractName];
    rewardsEnabled[_contractName] = !prevState;
    emit RewardsToggled(_contractName, prevState, rewardsEnabled[_contractName]);
  }

  /**
   * @notice Transfer POP to the contract for vault rewards
   * @param _amount uint256 amount in POP to be used for vault rewards
   * @dev Sufficient RewardsBalance will be checked when opening a new vault to see if enough POP exist to support the new Vault
   */
  function contributeReward(uint256 _amount) external {
    require(_amount > 0, "must be larger 0");
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransferFrom(msg.sender, address(this), _amount);
    rewardBalance = rewardBalance + _amount;
    emit RewardBalanceIncreased(msg.sender, _amount);
  }

  /* ========== MODIFIERS ========== */

  /**
   * @notice Modifier to check if a vault exists
   * @param _vaultId Bytes32
   */
  modifier vaultExists(bytes32 _vaultId) {
    require(vaults[_vaultId].endTime > 0, "Uninitialized vault slot");
    _;
  }

  /**
   * @notice Checks if the msg.sender is the controllerContract
   * @param _contractName Bytes32
   */
  modifier onlyControllerContract(bytes32 _contractName) {
    require(msg.sender == controllerContracts[_contractName], "Can only be called by the controlling contract");
    _;
  }
}
