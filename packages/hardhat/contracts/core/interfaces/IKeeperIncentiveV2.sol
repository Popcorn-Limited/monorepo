// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

bytes32 constant INCENTIVE_MANAGER_ROLE = keccak256("INCENTIVE_MANAGER_ROLE");

interface IKeeperIncentiveV2 {
  struct Incentive {
    uint256 reward; //pop reward for calling the function
    bool enabled;
    bool openToEveryone; //can everyone call the function to get the reward or only approved?
    address rewardToken;
    uint256 cooldown; // seconds required between incentive payouts
    uint256 burnPercentage;
    uint256 id;
    uint256 lastInvocation;
  }

  /**
   * @notice keeper account balances are addressesable by the keeper address whereas account balances held by this contract which have not yet been internally transferred to keepers are addressable by this contract's address
   * @param balance balance
   * @param token rewardsToken address
   * @param accountId incentive account id
   **/
  struct Account {
    uint256 balance;
    address token;
    bytes32 accountId;
  }

  /* ==========  VIEWS  ========== */

  /**
   * @return true or false if keeper has claimable reward token balance
   * @param keeper address of keeper
   */
  function hasClaimableBalance(address keeper) external view returns (bool);

  /**
   * @return all accounts associated with keeper
   * @param owner keeper account owner
   */
  function getAccounts(address owner) external view returns (Account[] memory);

  /**
   * @return all controller contract addresses
   */
  function getControllerContracts() external view returns (address[] memory);

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
  ) external pure returns (bytes32);

  /* ==========  MUTATIVE FUNCTIONS  ========== */

  /**
   * @notice External function call thats checks requirements for keeper-incentived functions and updates rewards earned
   * @param _i incentive index
   * @param _keeper address of keeper receiving reward
   */
  function handleKeeperIncentive(uint8 _i, address _keeper) external;

  /**
   * @dev Deprecated, use handleKeeperIncentive(uint8 _i, address _keeper) instead
   */
  function handleKeeperIncentive(
    bytes32,
    uint8 _i,
    address _keeper
  ) external;

  /**
   * @notice Keeper calls to claim rewards earned
   * @param incentiveAccountIds accountIds associated with keeper caller
   */
  function claim(bytes32[] calldata incentiveAccountIds) external;

  /**
   * @notice External function to send the tokens in burnBalance to burnAddress
   * @param tokenAddress address of reward token to burn
   */
  function burn(address tokenAddress) external;

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
  ) external returns (uint256);

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
  ) external;

  /**
   * @notice Changes whether an incentive is open to anyone. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _contractAddress address of controller contract
   * @param _i incentive index
   */
  function toggleApproval(address _contractAddress, uint8 _i) external;

  /**
   * @notice Changes whether an incentive is currently enabled. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _contractAddress address of controller contract
   * @param _i incentive index
   */
  function toggleIncentive(address _contractAddress, uint8 _i) external;

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
  ) external;

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
  ) external;

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
  ) external;

  /**
   * @notice Sets the current burn rate as a percentage of the incentive reward. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _burnPercentage Percentage in Mantissa. (1e14 = 1 Basis Point)
   */
  function updateBurnPercentage(uint256 _burnPercentage) external;

  /**
   * @notice Sets the required amount of POP a keeper needs to have staked to handle incentivized functions. Caller must have INCENTIVE_MANAGER_ROLE from ACLRegistry.
   * @param _amount Amount of POP a keeper needs to stake
   */
  function updateRequiredKeeperStake(uint256 _amount) external;
}
