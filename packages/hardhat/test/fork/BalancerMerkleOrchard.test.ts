import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { soliditySha3, toWei } from "web3-utils";
import { expectRevert, expectValue } from "../../lib/utils/expectValue";
import { getNamedAccountsByChainId } from "../../lib/utils/getNamedAccounts";
import { loadTree, MerkleTree } from "../../lib/utils/merkleTree";
import { IMerkleOrchard, MockERC20 } from "../../typechain";

let admin: SignerWithAddress,
  other: SignerWithAddress,
  claimer: SignerWithAddress,
  claimer0: SignerWithAddress,
  claimer1: SignerWithAddress;

let mockToken: MockERC20;
let merkleOrchard: IMerkleOrchard;

describe.skip("Balancer Merkle Orchard", () => {
  beforeEach(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.FORKING_RPC_URL,
            blockNumber: 13450000,
          },
        },
      ],
    });

    const namedAccounts = getNamedAccountsByChainId(1);

    [admin, other, claimer, claimer0, claimer1] = await ethers.getSigners();

    mockToken = await (await ethers.getContractFactory("MockERC20")).deploy("Mock xPOP", "xPOP", 18);
    await mockToken.deployed();

    merkleOrchard = await ethers.getContractAt("IMerkleOrchard", namedAccounts.merkleOrchard);
  });

  describe("two account tree", async () => {
    let tree: MerkleTree;

    beforeEach(async () => {
      tree = loadTree({
        [claimer0.address]: "100",
        [claimer1.address]: "101",
      });
      await mockToken.mint(admin.address, parseEther("201"));
      await mockToken.approve(merkleOrchard.address, parseEther("201"));
      await merkleOrchard.createDistribution(mockToken.address, tree.getHexRoot(), parseEther("201"), 0);
    });

    it("transfers tokens from createDistribution caller", async () => {
      const balance = await mockToken.balanceOf(admin.address);
      expectValue(balance, 0);
    });

    it("validating claims", async () => {
      const leaf0 = soliditySha3(claimer0.address, toWei("100"));
      const proof0 = tree.getHexProof(leaf0);
      const claim0Valid = await merkleOrchard.verifyClaim(
        mockToken.address,
        admin.address,
        0,
        claimer0.address,
        parseEther("100"),
        proof0
      );
      expectValue(claim0Valid, true);

      const leaf1 = soliditySha3(claimer1.address, toWei("101"));
      const proof1 = tree.getHexProof(leaf1);
      const claim1Valid = await merkleOrchard.verifyClaim(
        mockToken.address,
        admin.address,
        0,
        claimer1.address,
        parseEther("101"),
        proof1
      );
      expectValue(claim1Valid, true);
    });

    it("making claims", async () => {
      let balance0 = await mockToken.balanceOf(claimer0.address);
      expectValue(balance0, 0);
      const leaf0 = soliditySha3(claimer0.address, toWei("100"));
      const proof0 = tree.getHexProof(leaf0);
      await merkleOrchard.claimDistributions(
        claimer0.address,
        [
          {
            distributionId: 0,
            balance: parseEther("100"),
            distributor: admin.address,
            tokenIndex: 0,
            merkleProof: proof0,
          },
        ],
        [mockToken.address]
      );
      balance0 = await mockToken.balanceOf(claimer0.address);
      expectValue(balance0, parseEther("100"));

      let balance1 = await mockToken.balanceOf(claimer1.address);
      expectValue(balance1, 0);
      const leaf1 = soliditySha3(claimer1.address, toWei("101"));
      const proof1 = tree.getHexProof(leaf1);
      await merkleOrchard.claimDistributions(
        claimer1.address,
        [
          {
            distributionId: 0,
            balance: parseEther("101"),
            distributor: admin.address,
            tokenIndex: 0,
            merkleProof: proof1,
          },
        ],
        [mockToken.address]
      );
      balance1 = await mockToken.balanceOf(claimer1.address);
      expectValue(balance1, parseEther("101"));
    });

    it("reverts on double claims", async () => {
      const leaf0 = soliditySha3(claimer0.address, toWei("100"));
      const proof0 = tree.getHexProof(leaf0);
      await merkleOrchard.claimDistributions(
        claimer0.address,
        [
          {
            distributionId: 0,
            balance: parseEther("100"),
            distributor: admin.address,
            tokenIndex: 0,
            merkleProof: proof0,
          },
        ],
        [mockToken.address]
      );
      await expectRevert(
        merkleOrchard.claimDistributions(
          claimer0.address,
          [
            {
              distributionId: 0,
              balance: parseEther("100"),
              distributor: admin.address,
              tokenIndex: 0,
              merkleProof: proof0,
            },
          ],
          [mockToken.address]
        ),
        "cannot claim twice"
      );
    });
  });
});
