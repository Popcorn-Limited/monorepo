import { useContractRead, useContractReads } from "wagmi";
import { Pop } from "../../types";

export const useButterBatches: Pop.Hook<any> = ({ chainId, address, account }) => {
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

  console.log(batchIds);

  let batches: any[] = [];
  if (batchIds && batchIds.length) {
    const { data: batches } = useContractReads({
      scopeKey: `batches:${chainId}:${address}:${account}`,
      enabled: enabled,
      contracts: batchIds.map((id) => ({
        address,
        chainId: Number(chainId),
        abi: [
          {
            inputs: [
              {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
              },
            ],
            name: "batches",
            outputs: [
              {
                internalType: "enum ButterBatchProcessing.BatchType",
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
                name: "suppliedTokenBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "claimableTokenBalance",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "suppliedTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "claimableTokenAddress",
                type: "address",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "batches",
        args: [id],
      })),
    });
    console.log(batches);
  }
  //     const { data: shares } = useContractRead({
  //       address,
  //       chainId: Number(chainId),
  //       abi: [
  //         {
  //           inputs: [
  //             {
  //               internalType: "bytes32",
  //               name: "",
  //               type: "bytes32",
  //             },
  //             {
  //               internalType: "address",
  //               name: "",
  //               type: "address",
  //             },
  //           ],
  //           name: "accountBalances",
  //           outputs: [
  //             {
  //               internalType: "uint256",
  //               name: "",
  //               type: "uint256",
  //             },
  //           ],
  //           stateMutability: "view",
  //           type: "function",
  //         },
  //       ],
  //       functionName: "accountBalances",
  //       args: [id, account as any],
  //       scopeKey: `accountBalances:${chainId}:${address}:${account}`,
  //       enabled: account ? enabled : false,
  //     });
  //     if (batch && shares) {
  //       return {
  //         ...batch,
  //         accountSuppliedTokenBalance: shares,
  //       };
  //     }
  //     return {
  //       accountSuppliedTokenBalance: constants.Zero,
  //     };
  //   });
  // }

  // const filteredBatches = batches.filter((batch) => batch.accountSuppliedTokenBalance > constants.Zero);
  // const claimableMintBatches = filteredBatches.filter((batch) => batch.batchType == BatchType.Mint && batch.claimable);
  // const claimableRedeemBatches = filteredBatches.filter(
  //   (batch) => batch.batchType == BatchType.Redeem && batch.claimable,
  // );

  return {
    claimableMintBatches: [],
    claimableRedeemBatches: [],
    status: "success",
  };
};
