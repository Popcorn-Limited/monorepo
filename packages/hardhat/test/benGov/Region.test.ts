import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { MockContract } from "ethereum-waffle";
import { ethers, waffle } from "hardhat";
import { Region } from "../../typechain";

let owner: SignerWithAddress, nonOwner: SignerWithAddress;

let contract: Region;
let mockBeneficiaryVaults: MockContract;
const DEFAULT_REGION = ethers.utils.id("World");
const newRegion = ethers.utils.id("NewRegion");

describe("Region", function () {
  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const BeneficiaryVaults = await ethers.getContractFactory("BeneficiaryVaults");
    mockBeneficiaryVaults = await waffle.deployMockContract(owner, BeneficiaryVaults.interface.format() as any);

    const aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

    const contractRegistry = await (
      await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
    ).deployed();

    const regionFactory = await ethers.getContractFactory("Region");
    contract = await (await regionFactory.deploy(mockBeneficiaryVaults.address, contractRegistry.address)).deployed();

    await aclRegistry.connect(owner).grantRole(ethers.utils.id("DAO"), owner.address);
  });
  it("initates correct default values", async function () {
    expect(await contract.regionExists(DEFAULT_REGION)).to.be.equal(true);
    expect(await contract.regions(0)).to.be.equal(DEFAULT_REGION);
  });
  context("region creation", function () {
    it("reverts when not called by governance", async function () {
      await expect(contract.connect(nonOwner).addRegion(newRegion, mockBeneficiaryVaults.address)).to.be.revertedWith(
        "you dont have the right role"
      );
    });
    it("reverts when the region already exists", async function () {
      await expect(contract.addRegion(DEFAULT_REGION, mockBeneficiaryVaults.address)).to.be.revertedWith(
        "region already exists"
      );
    });
    it("creates a region", async function () {
      const result = await contract.addRegion(newRegion, mockBeneficiaryVaults.address);
      expect(result).to.emit(contract, "RegionAdded").withArgs(newRegion);
      expect(await contract.getAllRegions()).to.be.deep.equal([DEFAULT_REGION, newRegion]);
      expect(await contract.regionExists(newRegion)).to.be.equal(true);
    });
  });
  it("returns all regions", async function () {
    expect(await contract.getAllRegions()).to.be.deep.equal([DEFAULT_REGION]);
    await contract.addRegion(newRegion, mockBeneficiaryVaults.address);
    expect(await contract.getAllRegions()).to.be.deep.equal([DEFAULT_REGION, newRegion]);
  });
});
