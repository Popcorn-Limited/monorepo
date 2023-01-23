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
import useButterBatchZapper from "@popcorn/app/hooks/set/useButterBatchZapper";
import useSetToken from "@popcorn/app/hooks/set/useSetToken";

export default function useButterBatchData(chainId: ChainId): SWRResponse<BatchMetadata, Error> {
  const { account } = useWeb3();
  const addr = useDeployment(chainId);
  const dai = useERC20(addr.dai, chainId);
  const usdc = useERC20(addr.usdc, chainId);
  const usdt = useERC20(addr.usdt, chainId);
  const threeCrv = useERC20(addr.threeCrv, chainId);
  const butter = useSetToken(addr.butter, chainId);
  const butterBatch = useButterBatch(addr.butterBatch, chainId);
  const butterBatchZapper = useButterBatchZapper(addr.butterBatchZapper, chainId);
  const setBasicIssuanceModule = useBasicIssuanceModule(addr.setBasicIssuanceModule, chainId);
  const threePool = useThreePool(addr.threePool, chainId);

  const butterBatchAdapter = new ButterBatchAdapter(butterBatch);
  const shouldFetch = !!(
    !!butterBatchAdapter &&
    addr.butter &&
    addr.usdt &&
    addr.usdc &&
    addr.dai &&
    dai &&
    usdc &&
    usdt &&
    threeCrv &&
    threePool &&
    butter &&
    butterBatch &&
    butterBatchZapper &&
    setBasicIssuanceModule &&
    isButterSupportedOnCurrentNetwork(chainId)
  );

  return useSWR(shouldFetch ? `butter-batch-data` : null, async () => {
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
      mainContract: butterBatch,
      zapperContract: butterBatchZapper,
    });
  });
}
