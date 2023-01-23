// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ContractRegistryAccess.sol";
import "./ACLAuth.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IKeeperIncentiveV2.sol";

contract KeeperIncentiveV2 is IKeeperIncentiveV2, ACLAuth, ContractRegistryAccess {
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */

  /**
   * @dev controllerContract => IKeeperIncentiveV2.Incentive config
   */
  mapping(address => IKeeperIncentiveV2.Incentive[]) public incentivesByController;

  /**
   * @dev all controller contract addresses
   */
  address[] public controllerContracts;

  /**
   * @dev keeperAddress => list of account IDs
   */
  mapping(address => bytes32[]) public keeperAccounts;

  /**
   * @dev tokenAddress => burnBalance
   */
  mapping(address => uint256) public burnBalancesByToken;

  /**
   * @dev incentiveAccountId => owner => Account
   */
  mapping(bytes32 => mapping(address => IKeeperIncentiveV2.Account)) public accounts;

  /**
   * @dev incentiveAccountId => owner => isCached
   */
  mapping(bytes32 => mapping(address => bool)) public cachedAccounts;

  /**
   * @dev contracts allowed to call keeper incentives
   */
  mapping(address => bool) public allowedControllers;

  /**
   * @dev address to send tokens to burn
   */
  address constant burnAddress = 0x000000000000000000000000000000000000dEaD;

  /**
   * @dev required amount of pop tokens staked for a keeper to call handleKeeperIncentive
   */
  uint256 public requiredKeeperStake;

  /**
   * @dev default percentage of tokens burned
   */
  uint256 public defaultBurnPercentage;

  /* ========== EVENTS ========== */

  event IncentiveCreated(address indexed contractAddress, uint256 reward, bool openToEveryone, uint256 index);
  event IncentiveChanged(
    address indexed contractAddress,
    uint256 oldReward,
    uint256 newReward,
    bool oldOpenToEveryone,
    bool newOpenToEveryone,
    address oldRewardToken,
    address newRewardToken,
    uint256 oldCooldown,
    uint256 newCooldown,
    uint256 oldBurnPercentage,
    uint256 newBurnPercentage,
    uint256 index
  );
  event IncentiveFunded(uint256 amount, address indexed rewardToken, uint256 incentiveBalance);
  event IncentiveTipped(uint256 amount, address indexed rewardToken);
  event ApprovalToggled(address indexed contractAddress, bool openToEveryone);
  event IncentiveToggled(address indexed contractAddress, bool enabled);
  event Burned(uint256 amount, address indexed tokenAddress);
  event Claimed(address indexed token, address indexed account, uint256 amount);
  event BurnPercentageChanged(uint256 oldRate, uint256 newRate);
  event RequiredKeeperStakeChanged(uint256 oldRequirement, uint256 newRequirement);

  /* ========== CONSTRUCTOR ========== */

  constructor(
    IContractRegistry _contractRegistry,
    uint256 _burnPercentage,
    uint256 _requiredKeeperStake
  ) ContractRegistryAccess(_contractRegistry) {
    defaultBurnPercentage = _burnPercentage; // 25e16 = 25%
    requiredKeeperStake = _requiredKeeperStake; // 2000 POP
  }

  /* ==========  VIEWS  ========== */

  /**
   * @return true or false if keeper has claimable reward token balance
   * @param keeper address of keeper
   */
  function hasClaimableBalance(address keeper) external view returns (bool) {
    uint256 length = keeperAccounts[keeper].length;
    for (uint256 i; i < length; ++i) {
      bytes32 _incentiveAccountId = keeperAccounts[keeper][i];
      if (_incentiveAccountId == "") continue;
      if (accounts[_incentiveAccountId][keeper].balance > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * @return all accounts associated with keeper
   * @param owner keeper account owner
   */
  function getAccounts(address owner) external view returns (IKeeperIncentiveV2.Account[] memory) {
    uint256 arrLength = keeperAccounts[owner].length;
    IKeeperIncentiveV2.Account[] memory _accounts = new IKeeperIncentiveV2.Account[](arrLength);
    for (uint256 i; i < arrLength; ++i) {
      _accounts[i] = accounts[keeperAccounts[owner][i]][owner];
    }
    return _accounts;
  }

  /**
   * @return all controller contract addresses
   */
  function getControllerContracts() external view returns (address[] memory) {
    return controllerContracts;
  }

  /**
   * @notice Helper function to get incentiveAccountId
   * @param _contractAddress address of controller contract
   * @param _i incentive index
   * @param _rewardsToken token that rewards are paid out with
   */
  function incentiveAccountId(
    address _contractAddress,
    uint256 _i,
    address _rewardsToken
  ) public pure returns (bytes32) {
    return keccak256(abi.encode(_contractAddress, _i, _rewardsToken));
  }

  /* ==========  MUTATIVE FUNCTIONS  ========== */

  /**
   * @notice External function call thats checks requirements for keeper-incentived functions and updates rewards earned
   * @param _i incentive index
   * @param _keeper address of keeper receiving reward
   */
  function handleKeeperIncentive(uint8 _i, address _keeper) external override(IKeeperIncentiveV2) {
    _handleKeeperIncentive(_i, _keeper);
  }

  /**
   * @dev Deprecated, use handleKeeperIncentive(uint8 _i, address _keeper) instead
   */
  function handleKeeperIncentive(
    bytes32,
    uint8 _i,
    address _keeper
  ) external override(IKeeperIncentiveV2) {
    _handleKeeperIncentive(_i, _keeper);
  }

  /**
   * @notice Keeper calls to claim rewards earned
   * @param incentiveAccountIds accountIds associated with keeper caller
   */
  function claim(bytes32[] calldata incentiveAccountIds) external {
    uint256 length = incentiveAccountIds.length;
    for (uint256 i; i < length; ++i) {
      bytes32 _incentiveAccountId = incentiveAccountIds[i];
      _claim(_incentiveAccountId, msg.sender);
    }
  }

  /**
   * @notice External function to send the tokens in burnBalance to burnAddress
   * @param tokenAddress address of reward token to burn
   */
  function burn(address tokenAddress) external {
    uint256 burnBalance = burnBalancesByToken[tokenAddress];
    require(burnBalance > 0, "no burn balance");

    burnBalancesByToken[tokenAddress] = 0;
    IERC20 token = IERC20(tokenAddress);
    token.safeTransfer(burnAddress, burnBalance);

    emit Burned(burnBalance, tokenAddress);
  }

  /* ========== ADMIN FUNCTIONS ========== */

  /**
   * @notice Create Incentives for keeper to call a function. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _address address of contract which owns the incentives
   * @param _reward The amount in reward token the Keeper receives for calling the function
   * @param _enabled Is this Incentive currently enabled?
   * @param _openToEveryone incentive is open to anyone
   * @param _rewardToken token to receive as incentive reward
   * @param _cooldown length of time required to wait until next allowable invocation using handleKeeperIncentives()
   * @param _burnPercentage Percentage in Mantissa. (1e14 = 1 Basis Point) - if rewardToken is POP token and _burnPercentage is 0, will default to contract defined defaultBurnPercentage
   * @dev This function is only for creating unique incentives for future contracts
   * @dev Multiple functions can use the same incentive which can then be updated with one governance vote
   */
  function createIncentive(
    address _address,
    uint256 _reward,
    bool _enabled,
    bool _openToEveryone,
    address _rewardToken,
    uint256 _cooldown,
    uint256 _burnPercentage
  ) public onlyRole(INCENTIVE_MANAGER_ROLE) returns (uint256) {
    require(_cooldown > 0, "must set cooldown");
    require(_rewardToken != address(0), "must set reward token");
    require(_burnPercentage <= 1e18, "burn percentage too high");
    allowedControllers[_address] = true;

    uint256 index = incentivesByController[_address].length;
    bytes32 _incentiveAccountId = incentiveAccountId(_address, index, _rewardToken);
    incentivesByController[_address].push(
      IKeeperIncentiveV2.Incentive({
        id: index,
        reward: _reward,
        rewardToken: _rewardToken,
        enabled: _enabled,
        openToEveryone: _openToEveryone,
        cooldown: _cooldown,
        burnPercentage: _rewardToken == _getContract(keccak256("POP")) && _burnPercentage == 0
          ? defaultBurnPercentage
          : _burnPercentage,
        lastInvocation: 0
      })
    );

    controllerContracts.push(_address);
    __cacheAccount(address(this), _incentiveAccountId);
    accounts[_incentiveAccountId][address(this)].token = _rewardToken;

    emit IncentiveCreated(_address, _reward, _openToEveryone, index);
    return index;
  }

  /**
   * @notice Update the incentive struct values for keeper to call a function. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _contractAddress address of contract which owns the incentives
   * @param _i incentive index
   * @param _reward The amount in reward token the Keeper receives for calling the function
   * @param _enabled Is this Incentive currently enabled?
   * @param _openToEveryone incentive is open to anyone
   * @param _rewardToken token to receive as incentive reward
   * @param _cooldown length of time required to wait until next allowable invocation using handleKeeperIncentives()
   * @param _burnPercentage Percentage in Mantissa. (1e14 = 1 Basis Point) - if rewardToken is POP token and _burnPercentage is 0, will default to contract defined defaultBurnPercentage
   * @dev Multiple functions can use the same incentive which can be updated here with one governance vote
   */
  function updateIncentive(
    address _contractAddress,
    uint8 _i,
    uint256 _reward,
    bool _enabled,
    bool _openToEveryone,
    address _rewardToken,
    uint256 _cooldown,
    uint256 _burnPercentage
  ) external onlyRole(INCENTIVE_MANAGER_ROLE) {
    require(_cooldown > 0, "must set cooldown");
    require(_rewardToken != address(0), "must set reward token");
    require(_burnPercentage <= 1e18, "burn percentage too high");

    IKeeperIncentiveV2.Incentive storage incentive = incentivesByController[_contractAddress][_i];
    _burnPercentage = _rewardToken == _getContract(keccak256("POP")) && _burnPercentage == 0
      ? defaultBurnPercentage
      : _burnPercentage;

    emit IncentiveChanged(
      _contractAddress,
      incentive.reward,
      _reward,
      incentive.openToEveryone,
      _openToEveryone,
      incentive.rewardToken,
      _rewardToken,
      incentive.cooldown,
      _cooldown,
      incentive.burnPercentage,
      _burnPercentage,
      incentive.id
    );

    bytes32 _incentiveAccountId = incentiveAccountId(_contractAddress, _i, _rewardToken);
    incentive.reward = _reward;
    incentive.enabled = _enabled;
    incentive.openToEveryone = _openToEveryone;
    incentive.rewardToken = _rewardToken;
    incentive.cooldown = _cooldown;
    incentive.burnPercentage = _burnPercentage;

    __cacheAccount(address(this), _incentiveAccountId);
    accounts[_incentiveAccountId][address(this)].token = _rewardToken;
  }

  /**
   * @notice Changes whether an incentive is open to anyone. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _contractAddress address of controller contract
   * @param _i incentive index
   */
  function toggleApproval(address _contractAddress, uint8 _i) external onlyRole(INCENTIVE_MANAGER_ROLE) {
    IKeeperIncentiveV2.Incentive storage incentive = incentivesByController[_contractAddress][_i];
    incentive.openToEveryone = !incentive.openToEveryone;

    emit ApprovalToggled(_contractAddress, incentive.openToEveryone);
  }

  /**
   * @notice Changes whether an incentive is currently enabled. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _contractAddress address of controller contract
   * @param _i incentive index
   */
  function toggleIncentive(address _contractAddress, uint8 _i) external onlyRole(INCENTIVE_MANAGER_ROLE) {
    IKeeperIncentiveV2.Incentive storage incentive = incentivesByController[_contractAddress][_i];
    incentive.enabled = !incentive.enabled;

    emit IncentiveToggled(_contractAddress, incentive.enabled);
  }

  /**
   * @notice Funds incentive with reward token
   * @param _contractAddress address of controller contract
   * @param _i incentive index
   * @param _amount amount of reward token to fund incentive with
   */
  function fundIncentive(
    address _contractAddress,
    uint256 _i,
    uint256 _amount
  ) external {
    require(_amount > 0, "must send amount");
    require(incentivesByController[_contractAddress].length > _i, "incentive does not exist");
    IKeeperIncentiveV2.Incentive storage incentive = incentivesByController[_contractAddress][_i];

    bytes32 _incentiveAccountId = incentiveAccountId(_contractAddress, _i, incentive.rewardToken);

    IERC20 token = IERC20(incentive.rewardToken);
    uint256 balanceBefore = token.balanceOf(address(this)); // get balance before
    token.safeTransferFrom(msg.sender, address(this), _amount); // transfer in
    uint256 transferred = token.balanceOf(address(this)) - balanceBefore; // calculate amount transferred

    _internalTransfer(_incentiveAccountId, address(0), address(this), transferred);

    emit IncentiveFunded(_amount, incentive.rewardToken, accounts[_incentiveAccountId][address(this)].balance);
  }

  /**
   * @notice Allows for incentives to be funded with additional tip
   * @param _rewardToken address of token to tip keeper with
   * @param _keeper address of keeper receiving the tip
   * @param _i incentive index
   * @param _amount amount of reward token to tip
   */
  function tip(
    address _rewardToken,
    address _keeper,
    uint256 _i,
    uint256 _amount
  ) external {
    require(_amount > 0, "must send amount");
    require(allowedControllers[msg.sender], "must be controller contract");

    bytes32 _incentiveAccountId = incentiveAccountId(msg.sender, _i, _rewardToken);
    _cacheKeeperAccount(_keeper, _incentiveAccountId);
    accounts[_incentiveAccountId][address(this)].token = _rewardToken;

    _internalTransfer(_incentiveAccountId, address(0), _keeper, _amount);
    IERC20(_rewardToken).safeTransferFrom(msg.sender, address(this), _amount);

    emit IncentiveTipped(_amount, _rewardToken);
  }

  /**
   * @notice Allows for incentives to be funded with additional tip
   * @param _rewardToken address of token to tip keeper with
   * @param _keeper address of keeper receiving the tip
   * @param _i incentive index
   * @param _amount amount of reward token to tip
   * @param _burnPercentage Percentage in Mantissa. (1e14 = 1 Basis Point)
   */
  function tipWithBurn(
    address _rewardToken,
    address _keeper,
    uint256 _i,
    uint256 _amount,
    uint256 _burnPercentage
  ) external {
    require(_amount > 0, "must send amount");
    require(allowedControllers[msg.sender], "must be controller contract");
    require(_burnPercentage <= 1e18, "burn percentage too high");

    bytes32 _incentiveAccountId = incentiveAccountId(msg.sender, _i, _rewardToken);
    _cacheKeeperAccount(_keeper, _incentiveAccountId);
    accounts[_incentiveAccountId][address(this)].token = _rewardToken;

    IERC20(_rewardToken).safeTransferFrom(msg.sender, address(this), _amount);
    _internalTransfer(_incentiveAccountId, address(0), address(this), _amount);

    uint256 burnAmount = (_amount * _burnPercentage) / 1e18;
    uint256 tipPayout = _amount - burnAmount;

    if (burnAmount > 0) {
      _burn(burnAmount, _incentiveAccountId, _rewardToken);
    }

    _internalTransfer(_incentiveAccountId, address(this), _keeper, tipPayout);

    emit IncentiveTipped(tipPayout, _rewardToken);
  }

  /**
   * @notice Sets the current burn rate as a percentage of the incentive reward. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _burnPercentage Percentage in Mantissa. (1e14 = 1 Basis Point)
   */
  function updateBurnPercentage(uint256 _burnPercentage) external onlyRole(INCENTIVE_MANAGER_ROLE) {
    require(_burnPercentage <= 1e18, "burn percentage too high");
    emit BurnPercentageChanged(defaultBurnPercentage, _burnPercentage);
    defaultBurnPercentage = _burnPercentage;
  }

  /**
   * @notice Sets the required amount of POP a keeper needs to have staked to handle incentivized functions. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _amount Amount of POP a keeper needs to stake
   */
  function updateRequiredKeeperStake(uint256 _amount) external onlyRole(INCENTIVE_MANAGER_ROLE) {
    emit RequiredKeeperStakeChanged(requiredKeeperStake, _amount);
    requiredKeeperStake = _amount;
  }

  /* ========== RESTRICTED FUNCTIONS ========== */
  /**
   * @notice Checks requirements for keeper-incentived function calls and updates rewards earned for keeper to claim
   * @param _i incentive index
   * @param _keeper address of keeper receiving reward (must have pop staked)
   * @dev will revert if keeper has not waited cooldown period before calling incentivized function
   * @dev if the incentive is not open to anyone the _keeper must have KEEPER_ROLE from ACLRegistry
   */
  function _handleKeeperIncentive(uint8 _i, address _keeper) internal {
    if (incentivesByController[msg.sender].length == 0 || _i >= incentivesByController[msg.sender].length) {
      return;
    }

    require(allowedControllers[msg.sender], "Can only be called by the controlling contract");

    require(
      IStaking(_getContract(keccak256("PopLocker"))).balanceOf(_keeper) >= requiredKeeperStake,
      "not enough pop staked"
    );

    IKeeperIncentiveV2.Incentive memory incentive = incentivesByController[msg.sender][_i];
    bytes32 _incentiveAccountId = incentiveAccountId(msg.sender, _i, incentive.rewardToken);

    require(block.timestamp - incentive.lastInvocation >= incentive.cooldown, "wait for cooldown period");

    if (!incentive.openToEveryone) {
      _requireRole(KEEPER_ROLE, _keeper);
    }

    incentivesByController[msg.sender][_i].lastInvocation = block.timestamp;

    if (
      incentive.enabled &&
      incentive.reward <= accounts[_incentiveAccountId][address(this)].balance &&
      incentive.reward > 0
    ) {
      _payoutIncentive(_keeper, incentive, _incentiveAccountId);
    }
  }

  /**
   * @notice Deposits rewards for keeper and burns tokens if burnPercentage set for incentive
   * @param _keeper address of keeper receiving reward (must have pop staked)
   * @param incentive incentive struct used to determine reward tokens and burn amount
   * @param _incentiveAccountId id of the incentive to deposit tokens
   */
  function _payoutIncentive(
    address _keeper,
    IKeeperIncentiveV2.Incentive memory incentive,
    bytes32 _incentiveAccountId
  ) internal {
    (uint256 payoutAmount, uint256 burnAmount) = _previewPayout(incentive);
    _deposit(_keeper, payoutAmount, _incentiveAccountId);

    if (burnAmount > 0) {
      _burn(burnAmount, _incentiveAccountId, incentive.rewardToken);
    }
  }

  /**
   * @notice Pure function to calculate and return the amount of tokens to payout to keeper and to burn
   * @return payoutAmount amout of tokens a keeper has earned
   * @return burnAmount amout of tokens to be burned after payout
   * @param incentive incentive struct used to determine reward amount and burn percentage
   */
  function _previewPayout(IKeeperIncentiveV2.Incentive memory incentive)
    internal
    pure
    returns (uint256 payoutAmount, uint256 burnAmount)
  {
    burnAmount = (incentive.reward * incentive.burnPercentage) / 1e18;
    payoutAmount = incentive.reward - burnAmount;
  }

  /**
   * @notice Deposits rewards into keeper account and updates values in storage
   * @param keeper address of keeper receiving reward
   * @param amount amount of reward tokens distributed to keeper
   * @param _incentiveAccountId id of the incentive to deposit tokens
   */
  function _deposit(
    address keeper,
    uint256 amount,
    bytes32 _incentiveAccountId
  ) internal {
    _cacheKeeperAccount(keeper, _incentiveAccountId);
    _internalTransfer(_incentiveAccountId, address(this), keeper, amount);
  }

  /**
   * @notice Internal call that transfers reward tokens out of contract to keeper
   * @param _incentiveAccountId id of the incentive with keeper account balance
   * @param keeper address of keeper receiving reward
   */
  function _claim(bytes32 _incentiveAccountId, address keeper) internal {
    IKeeperIncentiveV2.Account storage account = accounts[_incentiveAccountId][keeper];
    uint256 balance = account.balance;

    require(balance > 0, "nothing to claim");

    _internalTransfer(_incentiveAccountId, keeper, address(0), balance);

    IERC20 token = IERC20(account.token);
    token.safeTransfer(keeper, balance);

    emit Claimed(address(token), keeper, balance);
  }

  /**
   * @notice Updates keeper account balance by transfering balance of tokens out this contract or used to burn tokens
   * @param _incentiveAccountId id of the incentive
   * @param to address receiving transferred tokens
   * @param from address sending tokens
   * @dev if burning tokens, amount is sent to address(0)
   */
  function _internalTransfer(
    bytes32 _incentiveAccountId,
    address from,
    address to,
    uint256 amount
  ) private {
    IKeeperIncentiveV2.Account storage fromAccount = accounts[_incentiveAccountId][from];
    IKeeperIncentiveV2.Account storage toAccount = accounts[_incentiveAccountId][to];
    fromAccount.balance -= from == address(0) ? 0 : amount;
    toAccount.balance += to == address(0) ? 0 : amount;
  }

  /**
   * @notice Burns tokens by transfering amount to address(0)
   * @param amount amount of tokens to burn
   * @param _incentiveAccountId id of the incentive
   * @param tokenAddress address of token to burn
   */
  function _burn(
    uint256 amount,
    bytes32 _incentiveAccountId,
    address tokenAddress
  ) internal {
    burnBalancesByToken[tokenAddress] += amount;
    _internalTransfer(_incentiveAccountId, address(this), burnAddress, amount);
  }

  /**
   * @notice If incentiveAccountId does not have keeper address cached, updates mappings in storage
   * @param keeper address of keeper
   * @param _incentiveAccountId id of the incentive to cache keeper account
   */
  function _cacheKeeperAccount(address keeper, bytes32 _incentiveAccountId) internal {
    if (!cachedAccounts[_incentiveAccountId][keeper]) {
      return __cacheAccount(keeper, _incentiveAccountId);
    }
  }

  /**
   * @notice Updates storage with incentiveAccountId and keeper address
   * @param keeper address of keeper (will be address of this contract when creating and updating incentives)
   * @param _incentiveAccountId id of the incentive to cache as key in mappings
   */
  function __cacheAccount(address keeper, bytes32 _incentiveAccountId) internal {
    keeperAccounts[keeper].push(_incentiveAccountId);
    accounts[_incentiveAccountId][keeper].accountId = _incentiveAccountId;
    cachedAccounts[_incentiveAccountId][keeper] = true;
    accounts[_incentiveAccountId][keeper].token = accounts[_incentiveAccountId][address(this)].token;
  }

  /**
   * @notice Override for ACLAuth and ContractRegistryAccess.
   */
  function _getContract(bytes32 _name) internal view override(ACLAuth, ContractRegistryAccess) returns (address) {
    return super._getContract(_name);
  }
}
