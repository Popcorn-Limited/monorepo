// SPDX-License-Identifier: AGPL-3.0-only
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { GrantElections } from "../../contracts/core/dao/GrantElections.sol";

bytes32 constant DEFAULT_REGION = 0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18; // World
uint256 constant DAYS = 60 * 60 * 24;

/// @notice Deploys all contracts needed for beneficiary governance and sets the admin functions
/// Beneficiaries:
/// 0 - Nomination Proposal
/// No Takedowns so far
/// 2,3 - Monthly Election
/// 4,5 - Quarterly Election
/// 6,7 - Yearly Election
/// 8-18 - Unused
contract CreateElection is Script {
  GrantElections internal grantElection = GrantElections(0xF8C417F7a4593a561970358375Fc4b2F6F890E9c);

  GrantElections.ElectionTerm ELECTION_TERM = GrantElections.ElectionTerm.Quarterly;
  address[] votedBeneficiaries;
  uint256[] votes;

  function run() external {
    vm.startBroadcast();
    // TODO set config in coordination with Fan correct for testing
    grantElection.setConfiguration(
      ELECTION_TERM,
      2, // ranking cutoff
      5, // awardees cutoff
      false, // VRF
      30 * 60, // Registration period - default
      1 * DAYS, // Voting period - default
      15, // cooldown period - default
      0, // bondAmount
      false, // bond required
      0, // finalization incentive
      true, // enabled
      GrantElections.ShareType.EqualWeight
    );
    grantElection.initialize(ELECTION_TERM, DEFAULT_REGION);

    for (uint256 i = 2; i < 7; i++) {
      votedBeneficiaries.push(vm.addr(i + 1));
      votes.push(10 ether);
    }
    for (uint256 i = 2; i < 12; i++) {
      grantElection.registerForElection(vm.addr(i + 1), uint256(ELECTION_TERM));
      grantElection.vote(votedBeneficiaries, votes, uint256(ELECTION_TERM));
    }

    vm.stopBroadcast();
  }
}
