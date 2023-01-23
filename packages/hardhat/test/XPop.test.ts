import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { fromRpcSig } from "ethereumjs-util";
import { BigNumber } from "ethers";
import { ethers, getChainId } from "hardhat";
import { MAX_UINT_256 } from "../lib/external/SetToken/utils/constants";
import { expectRevert, expectValue } from "../lib/utils/expectValue";
import { XPop } from "../typechain";

let admin: SignerWithAddress, other: SignerWithAddress, approver: SignerWithAddress, spender: SignerWithAddress;
let xPop: XPop;
let chainId: string;

describe("XPop", () => {
  beforeEach(async () => {
    [admin, other, approver, spender] = await ethers.getSigners();

    chainId = await getChainId();

    xPop = await (await ethers.getContractFactory("XPop")).deploy(parseEther("500000"));
    await xPop.deployed();
  });

  context("Constructor", async () => {
    it("must be created with a nonzero mint cap", async () => {
      await expectRevert((await ethers.getContractFactory("XPop")).deploy(0), "Mint cap is 0");
    });
  });

  context("Token parameters", async () => {
    it("has a name", async () => {
      expectValue(await xPop.name(), "Popcorn.Network (Redeemable POP)");
    });

    it("has a symbol", async () => {
      expectValue(await xPop.symbol(), "xPOP");
    });

    it("has 18 decimals", async () => {
      expectValue(await xPop.decimals(), 18);
    });
  });

  context("Minting", async () => {
    it("approver can mint", async () => {
      expectValue(await xPop.balanceOf(other.address), 0);
      await xPop.connect(admin).mint(other.address, parseEther("100"));
      expectValue(await xPop.balanceOf(other.address), parseEther("100"));
    });

    it("Non-approver cannot mint", async () => {
      await expectRevert(
        xPop.connect(other).mint(other.address, parseEther("100")),
        "Ownable: caller is not the owner"
      );
    });
  });

  context("Mint cap", async () => {
    it("has a mint cap", async () => {
      expectValue(await xPop.mintCap(), parseEther("500000"));
    });

    it("owner can mint up to mint cap", async () => {
      expectValue(await xPop.balanceOf(other.address), 0);
      await xPop.connect(admin).mint(other.address, parseEther("500000"));
      expectValue(await xPop.balanceOf(other.address), parseEther("500000"));
    });

    it("owner cannot mint above mint cap", async () => {
      await expectRevert(xPop.connect(admin).mint(other.address, parseEther("500001")), "Mint cap exceeded");
    });

    it("owner cannot exceed mint cap after burns", async () => {
      expectValue(await xPop.balanceOf(other.address), 0);

      await xPop.connect(admin).mint(other.address, parseEther("500000"));
      expectValue(await xPop.totalSupply(), parseEther("500000"));
      expectValue(await xPop.totalMinted(), parseEther("500000"));

      await xPop.connect(other).burn(parseEther("100"));
      expectValue(await xPop.totalSupply(), parseEther("499900"));
      expectValue(await xPop.totalMinted(), parseEther("500000"));

      await expectRevert(xPop.connect(admin).mint(other.address, parseEther("1")), "Mint cap exceeded");
    });
  });

  context("Burning", async () => {
    beforeEach(async () => {
      await xPop.connect(admin).mint(other.address, parseEther("100"));
    });

    it("token owner can burn owned tokens", async () => {
      expectValue(await xPop.balanceOf(other.address), parseEther("100"));
      await xPop.connect(other).burn(parseEther("50"));
      expectValue(await xPop.balanceOf(other.address), parseEther("50"));
    });

    it("non-owner cannot burn others tokens", async () => {
      await expectRevert(
        xPop.connect(other).burnFrom(admin.address, parseEther("50")),
        "ERC20: insufficient allowance"
      );
    });

    it("burns reduce totalSupply", async () => {
      expectValue(await xPop.totalSupply(), parseEther("100"));
      await xPop.connect(other).burn(parseEther("50"));
      expectValue(await xPop.totalSupply(), parseEther("50"));
    });

    it("burns do not reduce totalMinted", async () => {
      expectValue(await xPop.totalSupply(), parseEther("100"));
      await xPop.connect(other).burn(parseEther("50"));
      expectValue(await xPop.totalMinted(), parseEther("100"));
    });
  });

  context("Permit", async () => {
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const defaultDeadline = MAX_UINT_256;

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

    const amount = parseEther("100");

    it("sets initial nonce to 0", async () => {
      expectValue(await xPop.nonces(approver.address), 0);
    });

    it("accepts approver signature", async () => {
      const data = getTypedData(approver.address, spender.address, amount, chainId, xPop.address);
      const signature = await approver._signTypedData(data.domain, data.types, data.message);
      const { v, r, s } = fromRpcSig(signature);

      await xPop.permit(approver.address, spender.address, amount, defaultDeadline, v, r, s);

      expectValue(await xPop.nonces(approver.address), 1);
      expectValue(await xPop.allowance(approver.address, spender.address), amount);
    });

    it("rejects replayed signature", async () => {
      const data = getTypedData(approver.address, spender.address, amount, chainId, xPop.address);
      const signature = await approver._signTypedData(data.domain, data.types, data.message);
      const { v, r, s } = fromRpcSig(signature);

      await xPop.permit(approver.address, spender.address, amount, defaultDeadline, v, r, s);

      await expectRevert(
        xPop.permit(approver.address, spender.address, amount, defaultDeadline, v, r, s),
        "ERC20Permit: invalid signature"
      );
    });

    it("rejects other account signature", async () => {
      const data = getTypedData(approver.address, spender.address, amount, chainId, xPop.address);
      const signature = await spender._signTypedData(data.domain, data.types, data.message);
      const { v, r, s } = fromRpcSig(signature);

      await expectRevert(
        xPop.permit(approver.address, spender.address, amount, defaultDeadline, v, r, s),
        "ERC20Permit: invalid signature"
      );
    });

    it("rejects expired signature", async () => {
      const latestBlock = await ethers.provider.getBlock("latest");
      const now = latestBlock.timestamp;
      const deadline = BigNumber.from(now - 1000);

      const data = getTypedData(approver.address, spender.address, amount, chainId, xPop.address, deadline);
      const signature = await approver._signTypedData(data.domain, data.types, data.message);
      const { v, r, s } = fromRpcSig(signature);

      await expectRevert(
        xPop.permit(approver.address, spender.address, amount, deadline, v, r, s),
        "ERC20Permit: expired deadline"
      );
    });
  });
});
