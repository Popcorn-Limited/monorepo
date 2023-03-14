import { noOp } from "@/lib/helpers";
import { useDeployVault } from "@/lib/vaults";
import AssetSelection from "./sections/AssetSelection";
import ProtocolSelection from "./sections/ProtocolSelection";
import { GrDocumentConfig } from "react-icons/gr";
import { IoMdArrowForward } from "react-icons/io";
import AdapterSelection from "./sections/AdapterSelection";
import { useAccount } from "wagmi";
import AdapterConfiguration from "./sections/AdapterConfiguration";
import StrategySelection from "./sections/StrategySelection";
import FeeConfiguration from "./sections/FeeConfiguration";

function Dashboard() {
  const { address: account } = useAccount();

  const { write: deployVault = noOp } = useDeployVault();

  function handleOnSubmit(e: any) {
    e.preventDefault();
    console.log(e.target.value)
    console.log("done")
    deployVault();
  }

  return (
    <section>
      <h1 className="text-2xl flex items-center gap-2 font-bold mt-6 mb-8">
        <GrDocumentConfig />
        <span>Setup New Vault</span>
      </h1>
      <form onSubmit={handleOnSubmit} className="mb-12">
        <ProtocolSelection />
        <AssetSelection />
        <AdapterSelection />
        <AdapterConfiguration />
        <StrategySelection /> 
        <FeeConfiguration />
        <div className="flex justify-center mt-8">
          <button className="flex group gap-2 items-center bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow" type="submit">
            <span>Preview Vault</span>
            <IoMdArrowForward className="text-[150%] group-hover:translate-x-px" />
          </button>
        </div>
      </form>
    </section>
  );
}

export default Dashboard;
