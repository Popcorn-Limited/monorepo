import { IIpfsClient } from "@popcorn/utils";
import { BeneficiaryApplication } from "../types";

export const BeneficiaryRegistryAdapter = (contract: any, IpfsClient: IIpfsClient) => {
  return {
    getBeneficiaryApplication: async (id: string): Promise<BeneficiaryApplication> => {
      const ipfsHash = await contract.getBeneficiary(id);
      const beneficiaryApplication = await IpfsClient.get<BeneficiaryApplication>(ipfsHash);
      return beneficiaryApplication;
    },
    getAllBeneficiaryApplications: async (): Promise<BeneficiaryApplication[]> => {
      const beneficiaryAddresses = await contract.getBeneficiaryList();
      const ipfsHashes = await Promise.all(
        beneficiaryAddresses
          .filter((address) => address !== "0x0000000000000000000000000000000000000000")
          .map(async (address) => {
            return contract.getBeneficiary(address);
          }),
      );
      return await await Promise.all(ipfsHashes.map(async (cid: string) => await IpfsClient.get(cid)));
    },
  };
};
