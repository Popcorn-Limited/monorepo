import { Address } from "wagmi";
import { useStakingToken } from "./hooks/useStakingToken";

interface ContractProps {
  address?: string;
  chainId: number;
  children: (stakingToken?: Address) => React.ReactElement;
}

export const StakingToken: React.FC<ContractProps> = ({ address, chainId, children }) => {
  const { data, status } = useStakingToken({ chainId, address });
  return children(data);
};

export default StakingToken;
