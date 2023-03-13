import { noOp } from "@/lib/helpers";
import { ZERO } from "@/lib/numbers";
import { useDeployVault } from "@/lib/vaults";
import AssetSelection from "./sections/AssetSelection";
import FeeConfiguration from "./sections/FeeConfiguration";
import ProtocolSelection from "./sections/ProtocolSelection";
import { GrDocumentConfig } from "react-icons/gr";
import { IoMdArrowForward } from "react-icons/io";
import AdapterSelection from "./sections/AdapterSelection";
import StrategySelection from "./sections/StrategySelection";

function Dashboard() {
  const { write: deployVault = noOp } = useDeployVault([
    ["", "", [ZERO, ZERO, ZERO, ZERO], "", ""],
    ["", ""],
    ["", ""],
    "",
    "",
    ["", "", "", "", ["", "", "", "", "", "", "", ""], "", ZERO],
    ZERO,
  ]);

  /**
[
  [string, string, [BigNumberish, BigNumberish, BigNumberish, BigNumberish], string, string],
  [any, any],
  [any, any],
  string,
  any,
  [string, string, string, string, string[8], string, BigNumberish],
  BigNumberish,
]
   */
  function handleOnSubmit(e: any) {
    e.preventDefault();
    console.debug("yay!");
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
        <StrategySelection />
        <FeeConfiguration />
        <div className="flex justify-center mt-8">
          <button className="flex group gap-2 items-center bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow">
            <span>Preview Vault</span>
            <IoMdArrowForward className="text-[150%] group-hover:translate-x-px" />
          </button>
        </div>
      </form>
    </section>
  );
}

export default Dashboard;
