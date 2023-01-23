// SPDX-License-Identifier: AGPL-3.0-only
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { BeneficiaryRegistry } from "../../contracts/core/dao/BeneficiaryRegistry.sol";

bytes32 constant DEFAULT_REGION = 0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18; // World

/// @notice Deploys all contracts needed for beneficiary governance and sets the admin functions
/// Beneficiaries:
/// 0 - Nomination Proposal
/// No Takedowns so far
/// 2,3 - Monthly Election
/// 4,5 - Quarterly Election
/// 6,7 - Yearly Election
/// 8-18 - Unused
contract RemoveBeneficiariesFromRegistry is Script {
  BeneficiaryRegistry internal beneficiaryRegistry = BeneficiaryRegistry(0x408Ad169a738E5c4E9dBd2847bc0fD1FF9A8AcBe);

  function run() external {
    vm.startBroadcast();
    for (uint256 i; i < 10; i++) {
      beneficiaryRegistry.revokeBeneficiary(vm.addr(i + 1));
    }
    vm.stopBroadcast();
  }
}
