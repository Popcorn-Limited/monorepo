// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IGovStaking.sol";
import "../interfaces/IBeneficiaryRegistry.sol";
import "../interfaces/IBeneficiaryVaults.sol";
import "../interfaces/IRandomNumberConsumer.sol";
import "../interfaces/IRegion.sol";
import "../interfaces/IACLRegistry.sol";
import "../utils/ParticipationReward.sol";
import "../interfaces/IContractRegistry.sol";

contract GrantElections {
  using SafeERC20 for IERC20;

  struct Vote {
    address voter;
    address beneficiary;
    uint256 weight;
  }

  struct Election {
    Vote[] votes;
    mapping(address => bool) registeredBeneficiaries;
    mapping(address => bool) voters;
    address[] registeredBeneficiariesList;
    ElectionTerm electionTerm;
    ElectionState electionState;
    ElectionConfiguration electionConfiguration;
    uint256 startTime;
    uint256 randomNumber;
    bytes32 merkleRoot;
    bytes32 vaultId;
    bytes32 region;
  }

  struct ElectionConfiguration {
    uint8 ranking;
    uint8 awardees;
    bool useChainLinkVRF;
    uint256 registrationPeriod;
    uint256 votingPeriod;
    uint256 cooldownPeriod;
    BondRequirements bondRequirements;
    uint256 finalizationIncentive;
    bool enabled;
    ShareType shareType;
  }

  struct BondRequirements {
    bool required;
    uint256 amount;
  }

  enum ShareType {
    EqualWeight,
    DynamicWeight
  }

  enum ElectionTerm {
    Monthly,
    Quarterly,
    Yearly
  }
  enum ElectionState {
    Registration,
    Voting,
    Closed,
    FinalizationProposed,
    Finalized
  }

  /* ========== STATE VARIABLES ========== */

  IContractRegistry internal contractRegistry;

  bytes32 public immutable contractName = "GrantElections";

  Election[] public elections;
  mapping(bytes32 => uint256[3]) public activeElections;
  ElectionConfiguration[3] public electionDefaults;
  uint256 public incentiveBudget;

  /* ========== EVENTS ========== */

  event BeneficiaryRegistered(address _beneficiary, uint256 _electionId);
  event UserVoted(address _user, ElectionTerm _term);
  event ElectionInitialized(ElectionTerm _term, bytes32 _region, uint256 _startTime);
  event FinalizationProposed(uint256 _electionId, bytes32 _merkleRoot);
  event ElectionFinalized(uint256 _electionId, bytes32 _merkleRoot);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
    _setDefaults();
  }

  /* ========== VIEWS ========== */

  function getElectionMetadata(uint256 _electionId)
    public
    view
    returns (
      Vote[] memory votes_,
      ElectionTerm term_,
      address[] memory registeredBeneficiaries_,
      ElectionState state_,
      uint8[2] memory awardeesRanking_,
      bool useChainLinkVRF_,
      uint256[3] memory periods_,
      uint256 startTime_,
      BondRequirements memory bondRequirements_,
      ShareType shareType_,
      uint256 randomNumber_
    )
  {
    Election storage e = elections[_electionId];

    votes_ = e.votes;
    term_ = e.electionTerm;
    registeredBeneficiaries_ = e.registeredBeneficiariesList;
    state_ = e.electionState;
    awardeesRanking_ = [e.electionConfiguration.awardees, e.electionConfiguration.ranking];
    useChainLinkVRF_ = e.electionConfiguration.useChainLinkVRF;
    periods_ = [
      e.electionConfiguration.cooldownPeriod,
      e.electionConfiguration.registrationPeriod,
      e.electionConfiguration.votingPeriod
    ];
    startTime_ = e.startTime;
    bondRequirements_ = e.electionConfiguration.bondRequirements;
    shareType_ = e.electionConfiguration.shareType;
    randomNumber_ = e.randomNumber;
  }

  function electionEnabled(uint256 _electionId) public view returns (bool) {
    return elections[_electionId].electionConfiguration.enabled;
  }

  function getElectionMerkleRoot(uint256 _electionId) public view returns (bytes32 merkleRoot) {
    return elections[_electionId].merkleRoot;
  }

  function getRegisteredBeneficiaries(uint256 _electionId) public view returns (address[] memory beneficiaries) {
    return elections[_electionId].registeredBeneficiariesList;
  }

  function _isEligibleBeneficiary(address _beneficiary, uint256 _electionId) public view returns (bool) {
    return
      elections[_electionId].registeredBeneficiaries[_beneficiary] &&
      IBeneficiaryRegistry(contractRegistry.getContract(keccak256("BeneficiaryRegistry"))).beneficiaryExists(
        _beneficiary
      );
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  // todo: mint POP for caller to incentivize calling function
  // todo: use bonds to incentivize callers instead of minting
  function initialize(ElectionTerm _grantTerm, bytes32 _region) public {
    IRegion region = IRegion(contractRegistry.getContract(keccak256("Region")));
    require(region.regionExists(_region), "region doesnt exist");
    uint8 term = uint8(_grantTerm);
    if (elections.length != 0) {
      Election storage latestElection = elections[activeElections[_region][term]];

      if (latestElection.electionTerm == _grantTerm && latestElection.startTime != 0) {
        require(latestElection.electionState == ElectionState.Finalized, "election not yet finalized");
        require(
          block.timestamp - latestElection.startTime >= latestElection.electionConfiguration.cooldownPeriod,
          "can't start new election, not enough time elapsed since last election"
        );
      }
    }
    address beneficiaryVault = region.regionVaults(_region);
    if (IBeneficiaryVaults(beneficiaryVault).vaultExists(term)) {
      IBeneficiaryVaults(beneficiaryVault).closeVault(term);
    }

    uint256 electionId = elections.length;
    activeElections[_region][term] = electionId;

    elections.push();
    Election storage election = elections[electionId];
    election.electionConfiguration = electionDefaults[term];
    election.electionState = ElectionState.Registration;
    election.electionTerm = _grantTerm;
    election.startTime = block.timestamp;
    election.region = _region;
    (bool vaultCreated, bytes32 vaultId) = ParticipationReward(
      contractRegistry.getContract(keccak256("ParticipationReward"))
    ).initializeVault(
        contractName,
        keccak256(abi.encodePacked(term, block.timestamp)),
        block.timestamp + electionDefaults[term].registrationPeriod + electionDefaults[term].votingPeriod
      );
    if (vaultCreated) {
      election.vaultId = vaultId;
    }

    emit ElectionInitialized(election.electionTerm, _region, election.startTime);
  }

  /**
   * todo: check beneficiary not already registered for this election
   * todo: check beneficiary is not registered for another non-closed election
   * todo: check beneficiary is not currently awarded a grant
   * todo: add claimBond function for beneficiary to receive their bond after the election period has closed
   */
  function registerForElection(address _beneficiary, uint256 _electionId) public {
    Election storage election = elections[_electionId];

    refreshElectionState(_electionId);

    require(election.electionState == ElectionState.Registration, "election not open for registration");
    require(
      IBeneficiaryRegistry(contractRegistry.getContract(keccak256("BeneficiaryRegistry"))).beneficiaryExists(
        _beneficiary
      ),
      "address is not eligible for registration"
    );
    require(election.registeredBeneficiaries[_beneficiary] == false, "only register once");

    _collectRegistrationBond(election);

    election.registeredBeneficiaries[_beneficiary] = true;
    election.registeredBeneficiariesList.push(_beneficiary);

    emit BeneficiaryRegistered(_beneficiary, _electionId);
  }

  function refreshElectionState(uint256 _electionId) public {
    Election storage election = elections[_electionId];
    if (
      block.timestamp >=
      election.startTime +
        election.electionConfiguration.registrationPeriod +
        election.electionConfiguration.votingPeriod
    ) {
      election.electionState = ElectionState.Closed;
      if (election.electionConfiguration.useChainLinkVRF) {
        IRandomNumberConsumer(contractRegistry.getContract(keccak256("RandomNumberConsumer"))).getRandomNumber(
          _electionId,
          uint256(keccak256(abi.encode(block.timestamp, blockhash(block.number))))
        );
      }
    } else if (block.timestamp >= election.startTime + election.electionConfiguration.registrationPeriod) {
      election.electionState = ElectionState.Voting;
    } else if (block.timestamp >= election.startTime) {
      election.electionState = ElectionState.Registration;
    }
  }

  function vote(
    address[] memory _beneficiaries,
    uint256[] memory _voiceCredits,
    uint256 _electionId
  ) public {
    Election storage election = elections[_electionId];
    require(_beneficiaries.length <= 5, "too many beneficiaries");
    require(_voiceCredits.length <= 5, "too many votes");
    require(_voiceCredits.length > 0, "Voice credits are required");
    require(_beneficiaries.length > 0, "Beneficiaries are required");
    refreshElectionState(_electionId);
    require(election.electionState == ElectionState.Voting, "Election not open for voting");
    require(!election.voters[msg.sender], "address already voted for election term");

    uint256 usedVoiceCredits = 0;
    uint256 stakedVoiceCredits = IGovStaking(contractRegistry.getContract(keccak256("GovStaking"))).getVoiceCredits(
      msg.sender
    );

    require(stakedVoiceCredits > 0, "must have voice credits from staking");

    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      // todo: consider skipping iteration instead of throwing since if a beneficiary is removed from the registry during an election, it can prevent votes from being counted
      require(_isEligibleBeneficiary(_beneficiaries[i], _electionId), "ineligible beneficiary");

      usedVoiceCredits = usedVoiceCredits + _voiceCredits[i];
      uint256 sqredVoiceCredits = sqrt(_voiceCredits[i]);

      Vote memory _vote = Vote({ voter: msg.sender, beneficiary: _beneficiaries[i], weight: sqredVoiceCredits });

      election.votes.push(_vote);
      election.voters[msg.sender] = true;
    }
    require(usedVoiceCredits <= stakedVoiceCredits, "Insufficient voice credits");
    if (election.vaultId != "") {
      ParticipationReward(contractRegistry.getContract(keccak256("ParticipationReward"))).addShares(
        contractName,
        election.vaultId,
        msg.sender,
        usedVoiceCredits
      );
    }
    emit UserVoted(msg.sender, election.electionTerm);
  }

  function fundKeeperIncentive(uint256 _amount) public {
    IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
    require(POP.balanceOf(msg.sender) >= _amount, "not enough pop");
    POP.safeTransferFrom(msg.sender, address(this), _amount);
    incentiveBudget = incentiveBudget + _amount;
  }

  function getRandomNumber(uint256 _electionId) public {
    Election storage election = elections[_electionId];
    require(election.electionConfiguration.useChainLinkVRF == true, "election doesnt need random number");
    require(election.electionState == ElectionState.Closed, "election must be closed");
    require(election.randomNumber == 0, "randomNumber already set");
    uint256 randomNumber = IRandomNumberConsumer(contractRegistry.getContract(keccak256("RandomNumberConsumer")))
      .getRandomResult(_electionId);
    require(randomNumber != 0, "random number not yet created");
    election.randomNumber = randomNumber;
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function proposeFinalization(uint256 _electionId, bytes32 _merkleRoot) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(
      keccak256("ElectionResultProposer"),
      msg.sender
    );

    Election storage election = elections[_electionId];
    require(
      election.electionState == ElectionState.Closed || election.electionState == ElectionState.FinalizationProposed,
      "wrong election state"
    );
    require(election.votes.length >= 1, "no elegible awardees");

    if (election.electionConfiguration.useChainLinkVRF) {
      require(election.randomNumber != 0, "randomNumber required");
    }

    uint256 finalizationIncentive = electionDefaults[uint8(election.electionTerm)].finalizationIncentive;

    if (incentiveBudget >= finalizationIncentive && election.electionState != ElectionState.FinalizationProposed) {
      IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
      POP.approve(address(this), finalizationIncentive);
      POP.safeTransferFrom(address(this), msg.sender, finalizationIncentive);
      incentiveBudget = incentiveBudget - finalizationIncentive;
    }

    election.merkleRoot = _merkleRoot;
    election.electionState = ElectionState.FinalizationProposed;

    emit FinalizationProposed(_electionId, _merkleRoot);
  }

  function approveFinalization(uint256 _electionId, bytes32 _merkleRoot) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(
      keccak256("ElectionResultApprover"),
      msg.sender
    );

    Election storage election = elections[_electionId];
    require(election.electionState != ElectionState.Finalized, "election already finalized");
    require(election.electionState == ElectionState.FinalizationProposed, "finalization not yet proposed");
    require(election.merkleRoot == _merkleRoot, "Incorrect root");

    address beneficiaryVault = IRegion(contractRegistry.getContract(keccak256("Region"))).regionVaults(election.region);

    IBeneficiaryVaults(beneficiaryVault).openVault(uint8(election.electionTerm), _merkleRoot);

    ParticipationReward(contractRegistry.getContract(keccak256("ParticipationReward"))).openVault(
      contractName,
      election.vaultId
    );

    election.electionState = ElectionState.Finalized;

    emit ElectionFinalized(_electionId, _merkleRoot);
  }

  function toggleRegistrationBondRequirement(ElectionTerm _term) external {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    electionDefaults[uint8(_term)].bondRequirements.required = !electionDefaults[uint8(_term)]
      .bondRequirements
      .required;
  }

  function _collectRegistrationBond(Election storage _election) internal {
    IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
    if (_election.electionConfiguration.bondRequirements.required == true) {
      require(
        POP.balanceOf(msg.sender) >= _election.electionConfiguration.bondRequirements.amount,
        "insufficient registration bond balance"
      );

      POP.safeTransferFrom(msg.sender, address(this), _election.electionConfiguration.bondRequirements.amount);
    }
  }

  function _setDefaults() internal {
    ElectionConfiguration storage monthlyDefaults = electionDefaults[uint8(ElectionTerm.Monthly)];
    monthlyDefaults.awardees = 1;
    monthlyDefaults.ranking = 3;
    monthlyDefaults.useChainLinkVRF = true;
    monthlyDefaults.bondRequirements.required = true;
    monthlyDefaults.bondRequirements.amount = 50e18;
    monthlyDefaults.votingPeriod = 7 days;
    monthlyDefaults.registrationPeriod = 7 days;
    monthlyDefaults.cooldownPeriod = 21 days;
    monthlyDefaults.finalizationIncentive = 2000e18;
    monthlyDefaults.enabled = true;
    monthlyDefaults.shareType = ShareType.EqualWeight;

    ElectionConfiguration storage quarterlyDefaults = electionDefaults[uint8(ElectionTerm.Quarterly)];
    quarterlyDefaults.awardees = 2;
    quarterlyDefaults.ranking = 5;
    quarterlyDefaults.useChainLinkVRF = true;
    quarterlyDefaults.bondRequirements.required = true;
    quarterlyDefaults.bondRequirements.amount = 100e18;
    quarterlyDefaults.votingPeriod = 14 days;
    quarterlyDefaults.registrationPeriod = 14 days;
    quarterlyDefaults.cooldownPeriod = 83 days;
    quarterlyDefaults.finalizationIncentive = 2000e18;
    quarterlyDefaults.enabled = true;
    quarterlyDefaults.shareType = ShareType.EqualWeight;

    ElectionConfiguration storage yearlyDefaults = electionDefaults[uint8(ElectionTerm.Yearly)];
    yearlyDefaults.awardees = 3;
    yearlyDefaults.ranking = 7;
    yearlyDefaults.useChainLinkVRF = true;
    yearlyDefaults.bondRequirements.required = true;
    yearlyDefaults.bondRequirements.amount = 1000e18;
    yearlyDefaults.votingPeriod = 30 days;
    yearlyDefaults.registrationPeriod = 30 days;
    yearlyDefaults.cooldownPeriod = 358 days;
    yearlyDefaults.finalizationIncentive = 2000e18;
    yearlyDefaults.enabled = true;
    yearlyDefaults.shareType = ShareType.EqualWeight;
  }

  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }

  /* ========== SETTER ========== */

  function setConfiguration(
    ElectionTerm _term,
    uint8 _ranking,
    uint8 _awardees,
    bool _useChainLinkVRF,
    uint256 _registrationPeriod,
    uint256 _votingPeriod,
    uint256 _cooldownPeriod,
    uint256 _bondAmount,
    bool _bondRequired,
    uint256 _finalizationIncentive,
    bool _enabled,
    ShareType _shareType
  ) public {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    ElectionConfiguration storage defaults = electionDefaults[uint8(_term)];
    defaults.ranking = _ranking;
    defaults.awardees = _awardees;
    defaults.useChainLinkVRF = _useChainLinkVRF;
    defaults.registrationPeriod = _registrationPeriod;
    defaults.votingPeriod = _votingPeriod;
    defaults.cooldownPeriod = _cooldownPeriod;
    defaults.bondRequirements.amount = _bondAmount;
    defaults.bondRequirements.required = _bondRequired;
    defaults.finalizationIncentive = _finalizationIncentive;
    defaults.enabled = _enabled;
    defaults.shareType = _shareType;
  }

  /* ========== MODIFIERS ========== */

  modifier validAddress(address _address) {
    require(_address == address(_address), "invalid address");
    _;
  }
}
