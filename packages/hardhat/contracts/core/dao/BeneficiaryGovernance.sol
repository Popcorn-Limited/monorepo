// SPDX-License-Identifier: MIT

// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IRegion.sol";
import "../interfaces/IGovStaking.sol";
import "../interfaces/IBeneficiaryRegistry.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";
import "../utils/ParticipationReward.sol";

/**
 * @title BeneficiaryGovernance
 * @notice This contract is for submitting beneficiary nomination proposals and beneficiary takedown proposals
 */
contract BeneficiaryGovernance {
  using SafeERC20 for IERC20;

  /**
   * BNP for Beneficiary Nomination Proposal
   * BTP for Beneficiary Takedown Proposal
   */
  enum ProposalType {
    BeneficiaryNominationProposal,
    BeneficiaryTakedownProposal
  }

  enum ProposalStatus {
    New,
    ChallengePeriod,
    PendingFinalization,
    Passed,
    Failed
  }

  enum VoteOption {
    Yes,
    No
  }

  struct ConfigurationOptions {
    uint256 votingPeriod;
    uint256 vetoPeriod;
    uint256 proposalBond;
  }

  /**
   * @param status status of proposal
   * @param beneficiary the proposal is for this beneficiary address
   * @param voters addresses that have voted for this proposal
   * @param applicationCid the IPFS content identifier
   * @param proposer the address that raised the proposal. this may be different than the beneficiary address
   * @param startTime the time the proposal was submitted
   * @param region the bytes32 value of the region according to the Region contract. Proposals are submitted within a council-controlled region
   * @param yesCount how many yes votes
   * @param noCount how many no votes
   * @param voterCount how many addresses have voted for this proposal
   * @param proposalType either a nomination or a takedown proposal
   * @param configurationOptions configuration for this proposal, e.g. bond required and length of time for each period - challenge, voting
   * @param vaultId the vault id is used for the participation rewards allocated for the proposal
   */
  struct Proposal {
    ProposalStatus status;
    address beneficiary;
    mapping(address => bool) voters;
    string applicationCid;
    address proposer;
    uint256 startTime;
    bytes32 region;
    uint256 yesCount;
    uint256 noCount;
    uint256 voterCount;
    ProposalType proposalType;
    ConfigurationOptions configurationOptions;
    bytes32 vaultId;
  }

  /* ========== STATE VARIABLES ========== */

  IContractRegistry public immutable contractRegistry;

  /**
   * @dev when a proposal is created, the beneficiary for which the proposal has been created for will be added to this mapping to prevent multiple proposals from being raised for the beneficiary
   */
  mapping(address => bool) internal pendingBeneficiaries;

  /**
   * @dev maps beneficiary addresses to the proposal id/index
   * todo: update to map beneficiary addresses to an array of proposal ids otherwise there would be an incomplete mapping if values get overwritten
   */
  mapping(address => uint256) public beneficiaryProposals;

  Proposal[] public proposals;
  uint256[] public nominations;
  uint256[] public takedowns;
  ConfigurationOptions public DefaultConfigurations;
  bytes32 public constant contractName = keccak256("BeneficiaryGovernance");

  error RegionDoesNotExist(bytes32 _region);
  error BeneficiaryExists(address _beneficiary);

  /* ========== EVENTS ========== */

  event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    address indexed beneficiary,
    string applicationCid
  );
  event Vote(uint256 indexed proposalId, address indexed voter, uint256 indexed weight);
  event Finalize(uint256 indexed proposalId);
  event BondWithdrawn(address _address, uint256 amount);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
    _setDefaults();
  }

  /* ========== VIEW FUNCTIONS ========== */

  /**
   * @notice returns number of created proposals
   * @return uint256
   */
  function getNumberOfProposals(ProposalType _type) external view returns (uint256) {
    if (_type == ProposalType.BeneficiaryNominationProposal) {
      return nominations.length;
    }
    return takedowns.length;
  }

  /**
   * @notice gets number of votes
   * @param  _proposalId id of the proposal
   * @return number of votes to a proposal
   */
  function getNumberOfVoters(uint256 _proposalId) external view returns (uint256) {
    return proposals[_proposalId].voterCount;
  }

  /**
   * @notice gets status
   * @param  _proposalId id of the proposal
   * @return status of proposal
   */
  function getStatus(uint256 _proposalId) external view returns (ProposalStatus) {
    return proposals[_proposalId].status;
  }

  /**
   * @notice checks if someone has voted to a specific proposal or not
   * @param  _proposalId id of the proposal
   * @param  _voter address opf voter
   * @return boolean
   */
  function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
    return proposals[_proposalId].voters[_voter];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice creates a beneficiary nomination proposal or a beneficiary takedown proposal
   * @param  _beneficiary address of the beneficiary
   * @param  _region id of region
   * @param  _applicationCid IPFS content hash
   * @param  _type the proposal type (nomination / takedown)
   * @return proposalId
   */
  function createProposal(
    address _beneficiary,
    bytes32 _region,
    string calldata _applicationCid,
    ProposalType _type
  ) external validAddress(_beneficiary) enoughBond(msg.sender) returns (uint256) {
    if (!IRegion(contractRegistry.getContract(keccak256("Region"))).regionExists(_region)) {
      revert RegionDoesNotExist(_region);
    }

    _assertProposalPreconditions(_type, _beneficiary);

    if (DefaultConfigurations.proposalBond > 0) {
      IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransferFrom(
        msg.sender,
        address(this),
        DefaultConfigurations.proposalBond
      );
    }

    uint256 proposalId = proposals.length;
    proposals.push();

    if (_type == ProposalType.BeneficiaryNominationProposal) {
      nominations.push(proposalId);
    } else {
      takedowns.push(proposalId);
    }

    Proposal storage proposal = proposals[proposalId];
    // Create a new proposal
    proposal.status = ProposalStatus.New;
    proposal.beneficiary = _beneficiary;
    proposal.status = ProposalStatus.New;
    proposal.applicationCid = _applicationCid;
    proposal.proposer = msg.sender;
    proposal.startTime = block.timestamp;
    proposal.region = _region;
    proposal.proposalType = _type;
    proposal.configurationOptions = DefaultConfigurations;
    (bool vaultCreated, bytes32 vaultId) = ParticipationReward(
      contractRegistry.getContract(keccak256("ParticipationReward"))
    ).initializeVault(
        contractName,
        keccak256(abi.encodePacked(proposalId, block.timestamp)),
        block.timestamp + DefaultConfigurations.votingPeriod
      );
    if (vaultCreated) {
      proposal.vaultId = vaultId;
    }

    pendingBeneficiaries[_beneficiary] = true;
    beneficiaryProposals[_beneficiary] = proposals.length;
    emit ProposalCreated(proposalId, msg.sender, _beneficiary, _applicationCid);

    return proposalId;
  }

  /**
   * @notice refresh status
   * @param  _proposalId id of the proposal
   */
  function refreshState(uint256 _proposalId) external {
    Proposal storage proposal = proposals[_proposalId];
    _refreshState(proposal);
  }

  /**
   * @notice votes to a specific proposal during the initial voting process
   * @param  _proposalId id of the proposal which you are going to vote
   * @param  _vote a yes or no vote
   */
  function vote(uint256 _proposalId, VoteOption _vote) external {
    Proposal storage proposal = proposals[_proposalId];
    _refreshState(proposal);

    require(
      proposal.status == ProposalStatus.New || proposal.status == ProposalStatus.ChallengePeriod,
      "Proposal is no longer in voting period"
    );
    require(!proposal.voters[msg.sender], "address already voted for the proposal");

    uint256 _voiceCredits = getVoiceCredits(msg.sender);

    proposal.voters[msg.sender] = true;
    proposal.voterCount = proposal.voterCount + 1;

    if (_vote == VoteOption.Yes) {
      require(proposal.status == ProposalStatus.New, "Initial voting period has already finished!");
      proposal.yesCount = proposal.yesCount + _voiceCredits;
    }

    if (_vote == VoteOption.No) {
      proposal.noCount = proposal.noCount + _voiceCredits;
    }

    if (proposal.vaultId != "") {
      ParticipationReward(contractRegistry.getContract(keccak256("ParticipationReward"))).addShares(
        contractName,
        proposal.vaultId,
        msg.sender,
        _voiceCredits
      );
    }

    emit Vote(_proposalId, msg.sender, _voiceCredits);
  }

  /**
   * @notice finalizes the voting process
   * @param  _proposalId id of the proposal
   */
  function finalize(uint256 _proposalId) public {
    Proposal storage proposal = proposals[_proposalId];
    _refreshState(proposal);

    require(proposal.status == ProposalStatus.PendingFinalization, "Finalization not allowed");

    if (proposal.yesCount <= proposal.noCount) {
      proposal.status = ProposalStatus.Failed;
    }

    if (proposal.yesCount > proposal.noCount) {
      proposal.status = ProposalStatus.Passed;

      _handleSuccessfulProposal(proposal);
    }

    _resetBeneficiaryPendingState(proposal.beneficiary);

    if (proposal.vaultId != "") {
      ParticipationReward(contractRegistry.getContract(keccak256("ParticipationReward"))).openVault(
        contractName,
        proposal.vaultId
      );
    }

    emit Finalize(_proposalId);
  }

  /**
   * @notice claims bond after a successful proposal voting
   * @param  _proposalId id of the proposal
   */
  function claimBond(uint256 _proposalId) public {
    Proposal storage proposal = proposals[_proposalId];
    require(msg.sender == proposal.proposer, "only the proposer may call this function");
    require(proposal.status == ProposalStatus.Passed, "Proposal failed or is processing!");
    uint256 amount = proposal.configurationOptions.proposalBond;

    IERC20(contractRegistry.getContract(keccak256("POP"))).approve(address(this), amount);
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransferFrom(address(this), msg.sender, amount);

    emit BondWithdrawn(msg.sender, amount);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  /**
   * @notice gets the voice credits of an address using the staking contract
   * @param  _address address of the voter
   * @return voiceCredits voiceCredits of user
   */
  function getVoiceCredits(address _address) internal view returns (uint256 voiceCredits) {
    voiceCredits = IGovStaking(contractRegistry.getContract(keccak256("GovStaking"))).getVoiceCredits(_address);

    require(voiceCredits > 0, "must have voice credits from staking");
    return voiceCredits;
  }

  /**
   * @notice checks beneficiary exists or doesn't exist before creating beneficiary nomination proposal or takedown proposal
   */
  function _assertProposalPreconditions(ProposalType _type, address _beneficiary) internal view {
    bool bennyExists = IBeneficiaryRegistry(contractRegistry.getContract(keccak256("BeneficiaryRegistry")))
      .beneficiaryExists(_beneficiary);
    if (ProposalType.BeneficiaryTakedownProposal == _type) {
      if (!bennyExists) {
        revert BeneficiaryExists(_beneficiary);
      }
    }
    if (ProposalType.BeneficiaryNominationProposal == _type) {
      if (pendingBeneficiaries[_beneficiary] && bennyExists) {
        revert BeneficiaryExists(_beneficiary);
      }
    }
  }

  function _resetBeneficiaryPendingState(address _beneficiary) internal {
    pendingBeneficiaries[_beneficiary] = false;
  }

  function _handleSuccessfulProposal(Proposal storage proposal) internal {
    if (proposal.proposalType == ProposalType.BeneficiaryNominationProposal) {
      IBeneficiaryRegistry(contractRegistry.getContract(keccak256("BeneficiaryRegistry"))).addBeneficiary(
        proposal.beneficiary,
        proposal.region,
        proposal.applicationCid
      );
    }

    if (proposal.proposalType == ProposalType.BeneficiaryTakedownProposal) {
      IBeneficiaryRegistry(contractRegistry.getContract(keccak256("BeneficiaryRegistry"))).revokeBeneficiary(
        proposal.beneficiary
      );
    }
  }

  /**
   * @notice updates the state of the proposal
   * @param  _proposal passed in proposal
   */
  function _refreshState(Proposal storage _proposal) internal {
    if (_proposal.status == ProposalStatus.Failed || _proposal.status == ProposalStatus.Passed) return;

    uint256 votingPeriod = _proposal.configurationOptions.votingPeriod;
    uint256 vetoPeriod = _proposal.configurationOptions.vetoPeriod;
    uint256 totalVotingPeriod = votingPeriod + vetoPeriod;

    if (
      block.timestamp >= _proposal.startTime + votingPeriod && block.timestamp < _proposal.startTime + totalVotingPeriod
    ) {
      if (_proposal.status != ProposalStatus.ChallengePeriod) {
        if (_proposal.yesCount < _proposal.noCount) {
          _proposal.status = ProposalStatus.PendingFinalization;

          return;
        }

        _proposal.status = ProposalStatus.ChallengePeriod;
      }
    }

    if (block.timestamp >= _proposal.startTime + totalVotingPeriod) {
      _proposal.status = ProposalStatus.PendingFinalization;
    }
  }

  function _setDefaults() internal {
    DefaultConfigurations.votingPeriod = 2 days;
    DefaultConfigurations.vetoPeriod = 2 days;
    DefaultConfigurations.proposalBond = 2000 ether;
  }

  /* ========== SETTER ========== */

  function setConfiguration(uint256 _votingPeriod, uint256 _vetoPeriod, uint256 _proposalBond) public {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    DefaultConfigurations.votingPeriod = _votingPeriod;
    DefaultConfigurations.vetoPeriod = _vetoPeriod;
    DefaultConfigurations.proposalBond = _proposalBond;
  }

  /* ========== MODIFIER ========== */

  modifier validAddress(address _address) {
    require(_address != address(0), "invalid address");
    _;
  }
  modifier enoughBond(address _address) {
    require(
      IERC20(contractRegistry.getContract(keccak256("POP"))).balanceOf(_address) >= DefaultConfigurations.proposalBond,
      "proposal bond is not enough"
    );
    _;
  }
}
