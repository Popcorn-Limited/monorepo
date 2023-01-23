import ButterBatchAdapter from "@popcorn/hardhat/lib/adapters/ButterBatchAdapter";
import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { BatchMetadata } from "@popcorn/utils/src/types";
import useERC20 from "@popcorn/app/hooks/tokens/useERC20";
import useThreePool from "@popcorn/app/hooks/useThreePool";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import useSWR, { SWRResponse } from "swr";
import { getData } from "@popcorn/app/helper/ButterDataUtils";
import useBasicIssuanceModule from "@popcorn/app/hooks/set/useBasicIssuanceModule";
import useButterBatch from "@popcorn/app/hooks/set/useButterBatch";
import useButterWhaleProcessing from "@popcorn/app/hooks/set/useButterWhaleProcessing";
import useSetToken from "@popcorn/app/hooks/set/useSetToken";

export default function useButterWhaleData(chainId: ChainId): SWRResponse<BatchMetadata, Error> {
  const { account } = useWeb3();
  const addr = useDeployment(chainId);

  const dai = useERC20(addr.dai, chainId);
  const usdc = useERC20(addr.usdc, chainId);
  const usdt = useERC20(addr.usdt, chainId);
  const threeCrv = useERC20(addr.threeCrv, chainId);
  const butter = useSetToken(addr.butter, chainId);
  const butterBatch = useButterBatch(addr.butterBatch, chainId);
  const setBasicIssuanceModule = useBasicIssuanceModule(addr.setBasicIssuanceModule, chainId);
  const whaleButter = useButterWhaleProcessing(addr.butterWhaleProcessing, chainId);
  const threePool = useThreePool(addr.threePool, chainId);

  const butterBatchAdapter = new ButterBatchAdapter(butterBatch);
  const shouldFetch = !!(
    !!butterBatchAdapter &&
    addr.butter &&
    addr.usdt &&
    addr.usdc &&
    addr.dai &&
    isButterSupportedOnCurrentNetwork(chainId) &&
    dai &&
    usdc &&
    usdt &&
    threeCrv &&
    threePool &&
    butter &&
    whaleButter &&
    setBasicIssuanceModule
  );

  return useSWR(shouldFetch ? `butter-whale-data` : null, async () => {
    return getData({
      butterBatchAdapter,
      account,
      dai,
      usdc,
      usdt,
      threeCrv,
      threePool,
      butter,
      setBasicIssuanceModule,
      mainContract: whaleButter,
    });
  });
}
