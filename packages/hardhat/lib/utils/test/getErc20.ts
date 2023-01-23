import { ethers } from "hardhat";

export const getErc20 = async (address, signer?) => {
  return ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    address,
    signer
  );
};
