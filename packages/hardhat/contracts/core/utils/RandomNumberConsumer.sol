// SPDX-License-Identifier: MIT
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/dev/VRFConsumerBase.sol";
import "../interfaces/IRandomNumberConsumer.sol";

contract RandomNumberConsumer is VRFConsumerBase {
  /* ========== STATE VARIABLES ========== */

  address public VRFCoordinator;
  // rinkeby: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
  address public LinkToken;
  // rinkeby: 0x01BE23585060835E02B77ef475b0Cc51aA1e0709a
  bytes32 internal keyHash;
  uint256 internal fee;

  uint256[] public randomResult;
  mapping(bytes32 => uint256) requestToElection;

  /* ========== EVENTS ========== */

  /* ========== CONSTRUCTOR ========== */

  /**
   * Constructor inherits VRFConsumerBase
   *
   * Network: Rinkeby
   * Chainlink VRF Coordinator address: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
   * LINK token address:                0x01be23585060835e02b77ef475b0cc51aa1e0709
   * Key Hash: 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311
   */
  constructor(
    address _VRFCoordinator,
    address _LinkToken,
    bytes32 _keyHash
  ) VRFConsumerBase(_VRFCoordinator, _LinkToken) {
    keyHash = _keyHash;
    fee = 0.1 * 10**18; // 0.1 LINK
  }

  /* ========== VIEW FUNCTIONS ========== */

  function getRandomResult(uint256 electionId) public view returns (uint256) {
    return randomResult[electionId];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  function deposit() public payable {}

  /**
   * Requests randomness from a user-provided seed
   */
  // TODO Fix this not using seed but pretending to do so
  function getRandomNumber(uint256 _electionId, uint256) public {
    require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
    requestToElection[requestRandomness(keyHash, fee)] = _electionId;
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  /**
   * Callback function used by VRF Coordinator
   */
  function fulfillRandomness(bytes32 _requestId, uint256 _randomness) internal override {
    //randomResult should not be 0
    _randomness = _randomness + 1;
    randomResult[requestToElection[_requestId]] = _randomness;
  }
}
