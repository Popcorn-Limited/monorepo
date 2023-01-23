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
contract AddBeneficiariesToRegistry is Script {
  BeneficiaryRegistry internal beneficiaryRegistry = BeneficiaryRegistry(0x4d52E3Ff3B68E8824903e7a5743DD43586aEAF69);

  string[19] internal cids = [
    "QmSzq4gKUk9LhNNCFBVDbkkz26umqu63jx2dXNABBKcgJ9",
    "QmNY4QEKhnreDZHW3yiphXn765im5y8RCGrySKzRoXDPTB",
    "QmZn2p7xrRxqVGhKAtqjMZSY1Z6pW7A6RD7DiK2xt4nYTB",
    "QmUW6peidPvHtbH4P7VNUpPdfaJqv7nmURbpgMcnzUbTtY",
    "QmVAur87rJCyGh2ja1Pg4smAqD6MzXtuTXxWkeCkKYrf3n",
    "QmNu5LeMyvMkP2sTBZhesXp352ihJUmGTPVeRp42Y9caXJ",
    "QmQ3WQK41BozEznephMEh4cwGsRsFuXjFQRM6himtu5kHq",
    "QmRnnDnHnF8uv1oour3oU9s1GmKNggzdEqMJueZViAvSAa",
    "QmdoFZ6DL49SVmXDBv1zpkCngvr6bU7SUgxLbkh6ZM9L2V",
    "QmchtjJsFDWNzLj93gPND1WhYUUGKeznNR6ATUeuaW71uq",
    "QmYJ8KGfKo5iG8EbxZxvNoWiNuEMM4Hx5ok4paZ1F27G1w",
    "QmTf7c3MaHsBR5rdT5CN3m3yZCuf1XkGxhV81GhJKxempA",
    "QmfQ2Ffxw5P6NoKkQvkRoN31mAd65Dp2UBfPMdgzCDCDDx",
    "QmVNQeMrLpvnizudP9kZquFSb28CmH9fHddEpdX7wyADxF",
    "QmTiSvXRwdGFvPMPtKMurh4FJnzq3bZzws63UuErirSMFq",
    "QmSLS4TKBM2M9tXv5CAdFqUQJ9wR8UjjyhtrUxtbRrXE9M",
    "QmaisZuRUE1ndZGSzmvg4Uxr7nsi2ciQ1z9VoDCnpGRADt",
    "Qmc4qtSHikeYvy4WScJWXtUeX2g3Qf6fC4xoJaU3fugQwu",
    "QmcCmaXA3E8nzcBrTejHHjT8svKh6cSTwhKbPNuRyM6uH5"
  ];

  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    beneficiaryRegistry.addBeneficiary(
      0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199,
      DEFAULT_REGION,
      "QmcCmaXA3E8nzcBrTejHHjT8svKh6cSTwhKbPNuRyM6uH5"
    );
    beneficiaryRegistry.addBeneficiary(
      0x2546BcD3c84621e976D8185a91A922aE77ECEc30,
      DEFAULT_REGION,
      "QmSLS4TKBM2M9tXv5CAdFqUQJ9wR8UjjyhtrUxtbRrXE9M"
    );
    beneficiaryRegistry.addBeneficiary(
      0xbDA5747bFD65F08deb54cb465eB87D40e51B197E,
      DEFAULT_REGION,
      "QmaisZuRUE1ndZGSzmvg4Uxr7nsi2ciQ1z9VoDCnpGRADt"
    );

    // for (uint256 i = 9; i < 14; i++) {
    //   beneficiaryRegistry.addBeneficiary(vm.addr(i + 1), DEFAULT_REGION, cids[i]);
    // }
    vm.stopBroadcast();
  }
}

contract RevokeBeneficiariesToRegistry is Script {
  BeneficiaryRegistry internal beneficiaryRegistry = BeneficiaryRegistry(0xc9e244f134824fbd070858ab7A82B0e0B298cD5d);

  address[10] internal addresses = [
    0x0000000000000000000000000000000000000000,
    0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69,
    0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718,
    0xe1AB8145F7E55DC933d51a18c793F901A3A0b276,
    0xE57bFE9F44b819898F47BF37E5AF72a0783e1141,
    0xd41c057fd1c78805AAC12B0A94a405c0461A6FBb,
    0xF1F6619B38A98d6De0800F1DefC0a6399eB6d30C,
    0xF7Edc8FA1eCc32967F827C9043FcAe6ba73afA5c,
    0x4CCeBa2d7D2B4fdcE4304d3e09a1fea9fbEb1528,
    0x3DA8D322CB2435dA26E9C9fEE670f9fB7Fe74E49
  ];

  address[3] internal addx = [
    0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf,
    0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF,
    0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69
  ];

  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    for (uint256 i; i < 3; i++) {
      beneficiaryRegistry.revokeBeneficiary(addx[i]);
    }
    vm.stopBroadcast();
  }
}
