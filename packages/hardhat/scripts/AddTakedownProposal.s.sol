// SPDX-License-Identifier: AGPL-3.0-only
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { BeneficiaryGovernance } from "../../contracts/core/dao/BeneficiaryGovernance.sol";

bytes32 constant DEFAULT_REGION = 0xf2208c967df089f60420785795c0a9ba8896b0f6f1867fa7f1f12ad6f79c1a18; // World

/// @notice Deploys all contracts needed for beneficiary governance and sets the admin functions
/// Beneficiaries:
/// 0 - Nomination Proposal
/// No Takedowns so far
/// 2,3 - Monthly Election
/// 4,5 - Quarterly Election
/// 6,7 - Yearly Election
/// 8-18 - Unused
contract AddProposal is Script {
  BeneficiaryGovernance internal beneficiaryGovernance =
    BeneficiaryGovernance(0xD8bE3e1D20C4620eCF7e5196056f9662C0e40E2B);

  bytes[19] internal cids = [
    bytes("0x453686cb1d8c953ded406253aac5c37da2488f7c41c323cbe41be9d1e6936136"),
    bytes("0x02ec2d6316d641dd3bcd5bc8b9c5e1693b4bb18b7b1e45fa237f4d3356d76c06"),
    bytes("0xa9f111b356ed948342c3458b5422ce85831c32cec8a1ec5aafc6d7be29df2aa2"),
    bytes("0x5b91dfed7bbf22163dc420883d9dea83245cb63322921ee9d0dd26f0580a4ab5"),
    bytes("0x65831e033489d630441ba7c1a95206ed20914a9d70f03255a2e247a04c11df11"),
    bytes("0x084e6f61ebc62f6f7830fd038567d3254eba8a50bf99ce12efc91ead08c76b99"),
    bytes("0x19531b897392c00859b8fd8a6203646ac3b000a217f45806d23caac22e31a31c"),
    bytes("0x3344a7be91be7304967d2657d3722ba25eddf3c0c87b546fe3b93b5eac05f127"),
    bytes("0xe5afcdc556dec784675714313ccbdc6ded2d124559d2ee7c3882e0b2f3b7fac2"),
    bytes("0xd574aad0b3ab7d4d57a32474bcf697904196a2aa1d1abca0ab4d9c459b3421d8"),
    bytes("0x93ef576314edf05313724ab46fceb4ffec1a1187790813b5ba6917b3ed837912"),
    bytes("0x4f054cc99fd70f608beeb51c93e2d7234990b643c77214a3b4f2a4bf8cbb0197"),
    bytes("0xfd73c7c373e600eeab92276fb7da703dc0b98d70e003d260dd7491705647bcb7"),
    bytes("0x6875113530fac1aaa15a8432826efeb8430d799ca3c20e1f7ded5ea93d333f5c"),
    bytes("0x4fdfe2d6eb6a11d5fa67e89bf453c1e50aa9689d445803a1d42e55d93035eb84"),
    bytes("0x3b6071fb19f07ac422472bb042b2827e5c715ad2a36f8b50e9b4df4299560178"),
    bytes("0xb7fd8f6704c234984e2a630652a552e8100de0e8ffb06ad12b817851863b6dff"),
    bytes("0xcbf6f690f0d6aab08193341217f157b32c5df7681fd9f8953a8448fee531b6c4"),
    bytes("0xcdfebccf1e220187d76b7bd97b5e0b31ab76e54ad00126cd2936da0511cb92fc")
  ];

  function run() external {
    vm.startBroadcast();
    for (uint256 i = 1; i < 2; i++) {
      beneficiaryGovernance.createProposal(
        vm.addr(i + 1),
        DEFAULT_REGION,
        cids[i],
        BeneficiaryGovernance.ProposalType.BeneficiaryTakedownProposal
      );
    }
    vm.stopBroadcast();
  }
}
