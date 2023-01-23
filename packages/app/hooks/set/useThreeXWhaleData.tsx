import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { BatchMetadata } from "@popcorn/utils/types";
import useERC20 from "@popcorn/app/hooks/tokens/useERC20";
import useThreePool from "@popcorn/app/hooks/useThreePool";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import useSWR, { SWRResponse } from "swr";
import { getDataWhale } from "@popcorn/app/helper/threeXDataUtils";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import useBasicIssuanceModule from "@popcorn/app/hooks/set/useBasicIssuanceModule";
import useSetToken from "@popcorn/app/hooks/set/useSetToken";
import useThreeXBatch from "@popcorn/app/hooks/set/useThreeXBatch";
import useThreeXWhale from "@popcorn/app/hooks/set/useThreeXWhale";

export default function useThreeXWhaleData(chainId): SWRResponse<BatchMetadata, Error> {
  const { account } = useWeb3();
  const contractAddresses = useDeployment(chainId);

  const dai = useERC20(contractAddresses.dai, chainId);
  const usdc = useERC20(contractAddresses.usdc, chainId);
  const usdt = useERC20(contractAddresses.usdt, chainId);
  const threeX = useSetToken(contractAddresses.threeX, chainId);
  const threeXWhale = useThreeXWhale(contractAddresses.threeXWhale, chainId);
  const threeXBatch = useThreeXBatch(contractAddresses.threeXBatch, chainId);
  const setBasicIssuanceModule = useBasicIssuanceModule(contractAddresses.setBasicIssuanceModule, chainId);
  const threePool = useThreePool(contractAddresses.threePool, chainId);

  const shouldFetch = !!(
    [ChainId.Ethereum, ChainId.Hardhat, ChainId.Localhost].includes(chainId) &&
    contractAddresses.butter &&
    contractAddresses.usdt &&
    contractAddresses.usdc &&
    contractAddresses.dai &&
    isButterSupportedOnCurrentNetwork(chainId) &&
    dai &&
    usdc &&
    usdt &&
    threePool &&
    threeX &&
    threeXWhale &&
    setBasicIssuanceModule
  );

  return useSWR(shouldFetch ? [`threeX-whale-data`, chainId] : null, async () => {
    return getDataWhale(account, dai, usdc, usdt, threePool, threeX, setBasicIssuanceModule, threeXWhale, threeXBatch);
  });
}
