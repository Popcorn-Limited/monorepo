import { ethers } from "hardhat";

export const DAO_ROLE = ethers.utils.id("DAO");
export const KEEPER_ROLE = ethers.utils.id("Keeper");
export const BUTTER_ZAPPER = ethers.utils.id("ButterZapper");
export const INCENTIVE_MANAGER_ROLE = ethers.utils.id("INCENTIVE_MANAGER_ROLE");
export const VAULTS_CONTROLLER = ethers.utils.id("VaultsController");
