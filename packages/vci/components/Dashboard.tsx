import AssetSelection from "./sections/AssetSelection";
import ProtocolSelection from "./sections/ProtocolSelection";
import { GrDocumentConfig } from "react-icons/gr";
import { IoMdArrowForward } from "react-icons/io";
import AdapterSelection from "./sections/AdapterSelection";
import AdapterConfiguration from "./sections/AdapterConfiguration";
import StrategySelection from "./sections/StrategySelection";
import FeeConfiguration from "./sections/FeeConfiguration";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { adapterAtom, adapterConfigAtom, checkInitParamValidity } from "@/lib/adapter";
import { feeAtom } from "@/lib/fees";
import { constants, utils } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";

function Dashboard() {
  const router = useRouter();
  const [adapter,] = useAtom(adapterAtom);
  const [adapterConfig,] = useAtom(adapterConfigAtom);
  const [fees,] = useAtom(feeAtom)

  const validFees = ([fees.deposit, fees.withdrawal, fees.management, fees.performance].some(fee => Number(formatUnits(fee)) >= 1) && fees.recipient != constants.AddressZero)
    && utils.isAddress(fees.recipient)
  const validAdapter = !!adapter
  const validAdapterConfig = typeof adapter.initParams === "undefined"
    || (!!adapter.initParams && adapter.initParams.length > 0 && adapterConfig.length === adapter.initParams.length &&
      // @ts-ignore
      (adapterConfig.every((config, i) => checkInitParamValidity(config, adapter.initParams[i])))
    )

  return (
    <section>
      <h1 className="text-2xl flex items-center gap-2 font-bold mt-6 mb-8">
        <GrDocumentConfig />
        <span>Setup New Vault</span>
      </h1>
      <div className="mb-12">
        <ProtocolSelection />
        <AssetSelection />
        <AdapterSelection />
        <AdapterConfiguration />
        <StrategySelection />
        <FeeConfiguration />
      </div>
      <div className="flex justify-center mt-8">
        <button
          className="flex group gap-2 items-center bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow disabled:bg-gray-500"
          onClick={() => router.push("/vault-preview")}
          disabled={!validFees || !validAdapter || !validAdapterConfig}
        >
          <span>Preview Vault</span>
          <IoMdArrowForward className="text-[150%] group-hover:translate-x-px" />
        </button>
      </div>
    </section>
  );
}

export default Dashboard;
