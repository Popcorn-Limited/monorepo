import { constants } from "ethers";
import { Address, useContractRead } from "wagmi";
import { Pop } from "../../types";
import { BatchType } from "@popcorn/utils/types";

export const useThreeXBatches: Pop.Hook<any> = ({ chainId, address, account }) => {
  const enabled = !!account && !!address && !!chainId;

  const { data: batchIds, status } = useContractRead({
    address,
    chainId: Number(chainId),
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_account",
            type: "address",
          },
        ],
        name: "getAccountBatches",
        outputs: [
          {
            internalType: "bytes32[]",
            name: "",
            type: "bytes32[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getAccountBatches",
    args: [account as any],
    scopeKey: `getAccountBatches:${chainId}:${address}:${account}`,
    enabled: account ? enabled : false,
  });
  let batches: any[] = [];

  if (batchIds && batchIds.length) {
    batches = batchIds.map((id) => {
      const { data: batch } = useContractRead({
        address,
        chainId: Number(chainId),
        abi: [
          {
            inputs: [
              {
                internalType: "bytes32",
                name: "batchId",
                type: "bytes32",
              },
            ],
            stateMutability: "view",
            type: "function",
            name: "getBatch",
            outputs: [
              {
                internalType: "struct Batch",
                name: "",
                type: "tuple",
                components: [
                  {
                    internalType: "bytes32",
                    name: "id",
                    type: "bytes32",
                  },
                  {
                    internalType: "enum BatchType",
                    name: "batchType",
                    type: "uint8",
                  },
                  {
                    internalType: "bytes32",
                    name: "batchId",
                    type: "bytes32",
                  },
                  {
                    internalType: "bool",
                    name: "claimable",
                    type: "bool",
                  },
                  {
                    internalType: "uint256",
                    name: "unclaimedShares",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "sourceTokenBalance",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "targetTokenBalance",
                    type: "uint256",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "sourceToken",
                    type: "address",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "targetToken",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "owner",
                    type: "address",
                  },
                ],
              },
            ],
          },
        ],
        functionName: "getBatch",
        args: [id],
        scopeKey: `batches:${chainId}:${address}:${account}`,
        enabled: enabled,
      });

      const { data: shares } = useContractRead({
        address,
        chainId: Number(chainId),
        abi: [
          {
            inputs: [
              {
                internalType: "bytes32",
                name: "_id",
                type: "bytes32",
              },
              {
                internalType: "address",
                name: "_owner",
                type: "address",
              },
            ],
            name: "getAccountBalance",
            outputs: [
              {
                internalType: "uint256",
                name: "",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getAccountBalance",
        args: [id, account as Address],
        scopeKey: `accountBalances:${chainId}:${address}:${account}`,
        enabled: account ? enabled : false,
      });
      if (batch && shares) {
        return {
          ...batch,
          accountSuppliedTokenBalance: shares,
          accountClaimableTokenBalance: batch.unclaimedShares.eq(constants.Zero)
            ? 0
            : batch.targetTokenBalance.mul(shares).div(batch.unclaimedShares),
        };
      }
      return {
        accountSuppliedTokenBalance: constants.Zero,
        accountClaimableTokenBalance: 0,
      };
    });
  }

  const filteredBatches = batches.filter((batch) => batch.accountSuppliedTokenBalance > constants.Zero);
  const claimableMintBatches = filteredBatches.filter((batch) => batch.batchType == BatchType.Mint && batch.claimable);
  const claimableRedeemBatches = filteredBatches.filter(
    (batch) => batch.batchType == BatchType.Redeem && batch.claimable,
  );

  return {
    claimableMintBatches,
    claimableRedeemBatches,
    status,
  };
};
