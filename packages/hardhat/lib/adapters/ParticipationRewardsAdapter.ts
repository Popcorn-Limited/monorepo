export const ParticipationRewardsAdapter = function (contract?) {
  return {
    claimableVaultIds: async function (account) {
      const allVaults = await contract.getUserVaults(account);
      const claimableVaults = await Promise.all(
        allVaults
          .filter((id) => id !== "0x0000000000000000000000000000000000000000000000000000000000000000")
          .map(async (vaultId) => {
            if (await contract.isClaimable(vaultId, account)) {
              return vaultId;
            }
          })
      );
      return claimableVaults.filter((vaultId) => vaultId !== undefined);
    },
    claimableVaults: async function (account) {
      const vaultIds = await this.claimableVaultIds(account);
      return await Promise.all(
        vaultIds.map(async (vaultId) => {
          return await contract.vaults(vaultId);
        })
      );
    },
  };
};
export default ParticipationRewardsAdapter;
