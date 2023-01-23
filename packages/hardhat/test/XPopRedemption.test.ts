import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SignatureLike } from "@setprotocol/set-protocol-v2/node_modules/@ethersproject/contracts/node_modules/@ethersproject/bytes";
import { parseEther, splitSignature } from "ethers/lib/utils";
import { ethers, getChainId } from "hardhat";
import { expectEvent, expectRevert, expectValue } from "../lib/utils/expectValue";
import { MockERC20, RewardsEscrow, XPop, XPopRedemption } from "../typechain";

let owner: SignerWithAddress, redeemer: SignerWithAddress, nonOwner: SignerWithAddress;
let contracts: Contracts;
let chainId: string;

interface Contracts {
  pop: MockERC20;
  xPop: XPop;
  xPopRedemption: XPopRedemption;
  rewardsEscrow: RewardsEscrow;
}

async function deployContracts(): Promise<Contracts> {
  const pop = await (await ethers.getContractFactory("MockERC20")).deploy("TestPOP", "TPOP", 18);
  await pop.deployed();

  const xPop = await (await ethers.getContractFactory("XPop")).deploy(parseEther("500000"));
  await xPop.deployed();

  const rewardsEscrow = await (await ethers.getContractFactory("RewardsEscrow")).deploy(pop.address);
  await rewardsEscrow.deployed();

  const xPopRedemption = await (
    await ethers.getContractFactory("XPopRedemption")
  ).deploy(xPop.address, pop.address, rewardsEscrow.address);
  await xPopRedemption.deployed();
  return { pop, xPop, xPopRedemption, rewardsEscrow };
}

describe("XPopRedemption", () => {
  beforeEach(async () => {
    [owner, redeemer, nonOwner] = await ethers.getSigners();
    contracts = await deployContracts();
    chainId = await getChainId();
  });

  context("Constructor", async () => {
    it("stores address of the xPOP token", async () => {
      expectValue(await contracts.xPopRedemption.xPOP(), contracts.xPop.address);
    });

    it("stores address of the RewardsEscrow contract", async () => {
      expectValue(await contracts.xPopRedemption.rewardsEscrow(), contracts.rewardsEscrow.address);
    });
  });

  context("setApprovals", async () => {
    it("approves max amount of POP to RewardsEscrow", async () => {
      expectValue(await contracts.pop.allowance(contracts.xPopRedemption.address, contracts.rewardsEscrow.address), 0);

      await contracts.xPopRedemption.connect(owner).setApprovals();

      expectValue(
        await contracts.pop.allowance(contracts.xPopRedemption.address, contracts.rewardsEscrow.address),
        ethers.constants.MaxUint256
      );
    });

    it("can only be called by owner", async () => {
      await expectRevert(contracts.xPopRedemption.connect(nonOwner).setApprovals(), "Ownable: caller is not the owner");
    });
  });

  context("revokeApprovals", async () => {
    it("revokes RewardsEscrow approval", async () => {
      await contracts.xPopRedemption.connect(owner).setApprovals();
      expectValue(
        await contracts.pop.allowance(contracts.xPopRedemption.address, contracts.rewardsEscrow.address),
        ethers.constants.MaxUint256
      );

      await contracts.xPopRedemption.connect(owner).revokeApprovals();

      expectValue(await contracts.pop.allowance(contracts.xPopRedemption.address, contracts.rewardsEscrow.address), 0);
    });

    it("is idempotent", async () => {
      expectValue(await contracts.pop.allowance(contracts.xPopRedemption.address, contracts.rewardsEscrow.address), 0);

      await contracts.xPopRedemption.connect(owner).revokeApprovals();

      expectValue(await contracts.pop.allowance(contracts.xPopRedemption.address, contracts.rewardsEscrow.address), 0);
    });

    it("can only be called by owner", async () => {
      await expectRevert(
        contracts.xPopRedemption.connect(nonOwner).revokeApprovals(),
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("redeem", async () => {
    const XPOP_AMOUNT = parseEther("1000");

    beforeEach(async () => {
      await contracts.xPop.connect(owner).mint(redeemer.address, XPOP_AMOUNT);
      await contracts.rewardsEscrow.connect(owner).addAuthorizedContract(contracts.xPopRedemption.address);
      await contracts.xPopRedemption.connect(owner).setApprovals();
    });

    context("successful redemption", async () => {
      beforeEach(async () => {
        await contracts.xPop.connect(redeemer).approve(contracts.xPopRedemption.address, XPOP_AMOUNT);
        await contracts.pop.mint(contracts.xPopRedemption.address, XPOP_AMOUNT);
      });

      it("transfers in xPOP tokens", async () => {
        expectValue(await contracts.xPop.balanceOf(redeemer.address), XPOP_AMOUNT);

        await contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT);

        expectValue(await contracts.xPop.balanceOf(redeemer.address), 0);
      });

      it("burns transferred xPOP", async () => {
        expectValue(await contracts.xPop.totalSupply(), XPOP_AMOUNT);

        await contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT);

        expectValue(await contracts.xPop.totalSupply(), 0);
      });

      it("transfers POP to escrow contract", async () => {
        expectValue(await contracts.pop.balanceOf(contracts.rewardsEscrow.address), 0);

        await contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT);

        expectValue(await contracts.pop.balanceOf(contracts.rewardsEscrow.address), XPOP_AMOUNT);
      });

      it("creates an escrow", async () => {
        let escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(redeemer.address);
        let escrows = await contracts.rewardsEscrow.getEscrows(escrowIds);
        expectValue(escrows.length, 0);

        await contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT);

        escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(redeemer.address);
        escrows = await contracts.rewardsEscrow.getEscrows(escrowIds);
        const [{ balance, account }] = escrows;
        expectValue(escrows.length, 1);
        expectValue(balance, XPOP_AMOUNT);
        expectValue(account, redeemer.address);
      });

      it("emits an event", async () => {
        await expectEvent(
          await contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT),
          contracts.xPopRedemption,
          "Redemption",
          [redeemer.address, XPOP_AMOUNT]
        );
      });
    });

    describe("redeem with signature", async () => {
      const Permit = [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ];

      const defaultDeadline = ethers.constants.MaxUint256;

      const getTypedData = (owner, spender, value, chainId, verifyingContract, deadline = defaultDeadline) => ({
        types: { Permit },
        domain: {
          name: "Popcorn.Network (Redeemable POP)",
          version: "1",
          chainId,
          verifyingContract,
        },
        message: { owner, spender, value, deadline, nonce: 0 },
      });

      let signature: SignatureLike;

      beforeEach(async () => {
        await contracts.pop.mint(contracts.xPopRedemption.address, XPOP_AMOUNT);
        const data = getTypedData(
          redeemer.address,
          contracts.xPopRedemption.address,
          XPOP_AMOUNT,
          chainId,
          contracts.xPop.address
        );
        signature = await redeemer._signTypedData(data.domain, data.types, data.message);
      });

      it("transfers in xPOP tokens", async () => {
        expectValue(await contracts.xPop.balanceOf(redeemer.address), XPOP_AMOUNT);

        const { v, r, s } = splitSignature(signature);
        await contracts.xPopRedemption.connect(redeemer).redeemWithSignature(XPOP_AMOUNT, defaultDeadline, v, r, s);

        expectValue(await contracts.xPop.balanceOf(redeemer.address), 0);
      });

      it("burns transferred xPOP", async () => {
        expectValue(await contracts.xPop.totalSupply(), XPOP_AMOUNT);

        const { v, r, s } = splitSignature(signature);
        await contracts.xPopRedemption.connect(redeemer).redeemWithSignature(XPOP_AMOUNT, defaultDeadline, v, r, s);

        expectValue(await contracts.xPop.totalSupply(), 0);
      });

      it("transfers POP to escrow contract", async () => {
        expectValue(await contracts.pop.balanceOf(contracts.rewardsEscrow.address), 0);

        const { v, r, s } = splitSignature(signature);
        await contracts.xPopRedemption.connect(redeemer).redeemWithSignature(XPOP_AMOUNT, defaultDeadline, v, r, s);

        expectValue(await contracts.pop.balanceOf(contracts.rewardsEscrow.address), XPOP_AMOUNT);
      });

      it("creates an escrow", async () => {
        let escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(redeemer.address);
        let escrows = await contracts.rewardsEscrow.getEscrows(escrowIds);
        expectValue(escrows.length, 0);

        const { v, r, s } = splitSignature(signature);
        await contracts.xPopRedemption.connect(redeemer).redeemWithSignature(XPOP_AMOUNT, defaultDeadline, v, r, s);

        escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(redeemer.address);
        escrows = await contracts.rewardsEscrow.getEscrows(escrowIds);
        const [{ balance, account }] = escrows;
        expectValue(escrows.length, 1);
        expectValue(balance, XPOP_AMOUNT);
        expectValue(account, redeemer.address);
      });

      it("emits an event", async () => {
        const { v, r, s } = splitSignature(signature);
        await expectEvent(
          await contracts.xPopRedemption.connect(redeemer).redeemWithSignature(XPOP_AMOUNT, defaultDeadline, v, r, s),
          contracts.xPopRedemption,
          "Redemption",
          [redeemer.address, XPOP_AMOUNT]
        );
      });
    });

    describe("insufficient POP balance", async () => {
      it("fails fast on insufficient POP balance", async () => {
        await expectRevert(contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT), "Insufficient POP balance");
      });
    });

    describe("redeeming more than XPOP balance", async () => {
      beforeEach(async () => {
        await contracts.pop.mint(contracts.xPopRedemption.address, XPOP_AMOUNT.mul(10));
      });

      it("reverts on attempt to redeem too much XPOP", async () => {
        await expectRevert(
          contracts.xPopRedemption.connect(redeemer).redeem(XPOP_AMOUNT.mul(10)),
          "ERC20: insufficient allowance"
        );
      });
    });
  });
});
