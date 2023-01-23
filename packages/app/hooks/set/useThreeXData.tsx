import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { BatchMetadata } from "@popcorn/utils/types";
import useERC20 from "@popcorn/app/hooks/tokens/useERC20";
import useThreePool from "@popcorn/app/hooks/useThreePool";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import useSWR, { SWRResponse } from "swr";
import { getData } from "@popcorn/app/helper/threeXDataUtils";
import useBasicIssuanceModule from "@popcorn/app/hooks/set/useBasicIssuanceModule";
import useSetToken from "@popcorn/app/hooks/set/useSetToken";
import useThreeXBatch from "@popcorn/app/hooks/set/useThreeXBatch";
import useThreeXZapper from "@popcorn/app/hooks/set/useThreeXZapper";

export default function useThreeXData(chainId: ChainId): SWRResponse<BatchMetadata, Error> {
  const { account } = useWeb3();
  const contractAddresses = useDeployment(chainId);

  const dai = useERC20(contractAddresses.dai, chainId);
  const usdc = useERC20(contractAddresses.usdc, chainId);
  const usdt = useERC20(contractAddresses.usdt, chainId);
  const threeX = useSetToken(contractAddresses.threeX, chainId);
  const threeXBatch = useThreeXBatch(contractAddresses.threeXBatch, chainId);
  const threeXZapper = useThreeXZapper(contractAddresses.threeXZapper, chainId);
  const setBasicIssuanceModule = useBasicIssuanceModule(contractAddresses.setBasicIssuanceModule, chainId);
  const threePool = useThreePool(contractAddresses.threePool, chainId);

  const shouldFetch = !!(
    [ChainId.Ethereum, ChainId.Hardhat, ChainId.Localhost].includes(chainId) &&
    contractAddresses.butter &&
    contractAddresses.usdt &&
    contractAddresses.usdc &&
    contractAddresses.dai &&
    dai &&
    usdc &&
    usdt &&
    threePool &&
    threeX &&
    threeXBatch &&
    threeXZapper &&
    setBasicIssuanceModule &&
    isButterSupportedOnCurrentNetwork(chainId)
  );

  return useSWR(shouldFetch ? [`threeX-batch-data`, chainId, account] : null, async () => {
    return getData(account, dai, usdc, usdt, threePool, threeX, setBasicIssuanceModule, threeXBatch, threeXZapper);
  });
}
