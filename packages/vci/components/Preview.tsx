import Section from "@/components/content/Section";
import { constants, ethers } from "ethers";
import { useAccount } from "wagmi";
import { adapterAtom, adapterConfigAtom, adapterDeploymentAtom } from "@/lib/adapter";
import { useAtom } from "jotai";
import { assetAtom } from "@/lib/assets";
import { feeAtom } from "@/lib/fees";
import { useEffect } from "react";
import { useDeployVault } from "@/lib/vaults";
import { noOp } from "@/lib/helpers";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useRouter } from "next/router";


export default function Preview(): JSX.Element {
  const { address: account } = useAccount();
  const router = useRouter();
  const [asset,] = useAtom(assetAtom);
  const [adapter,] = useAtom(adapterAtom);
  const [adapterConfig,] = useAtom(adapterConfigAtom);
  const [adapterData,] = useAtom(adapterDeploymentAtom);
  const [fees,] = useAtom(feeAtom);

  const { write: deployVault = noOp } = useDeployVault();


  useEffect(() => { }, [adapterConfig]);

  return (
    <section>
      <div>
        <h1 className="text-2xl flex items-center gap-2 font-bold mt-6 mb-8">
          Review Vault
        </h1>
        <Section title="Vault Configuration">
          <p>Asset: {asset?.address || constants.AddressZero}</p>
          <p>Adapter: {constants.AddressZero}</p>
          <p>Owner: {account}</p>
          <p>Deposit Limit: {constants.MaxUint256.toString()}</p>
          <div>
            <p>Fees: </p>
            <div>
              <p>Deposit: {fees.deposit.toString()}</p>
              <p>Withdrawal: {fees.withdrawal.toString()}</p>
              <p>Management: {fees.management.toString()}</p>
              <p>Performance: {fees.performance.toString()}</p>
              <p>Recipient: {fees.recipient}</p>
            </div>
          </div>
        </Section>
        <Section title="Adapter Configuration">
          <p>Name: {adapter.name}</p>
          <p>Id: {ethers.utils.formatBytes32String("")}</p>
          <p>Data: 0x</p>
          <div>
            <p>Params: </p>
            <div>
              {adapterConfig?.map((param, i) => <p>{i}: {param}</p>)}
            </div>
          </div>
        </Section>
        <Section title="Strategy Configuration">
          <p>Id: {ethers.utils.formatBytes32String("")}</p>
          <p>Data: 0x</p>
          <div>
            <p>Params: </p>
          </div>
        </Section>
        <Section title="Staking Configuration">
          <p>Deploy Staking: false </p>
          <p>RewardsData: 0x</p>
        </Section>
        <Section title="Vault Metadata">
          <p>Vault: {constants.AddressZero}</p>
          <p>Adapter: {constants.AddressZero}</p>
          <p>Creator: {account}</p>
          <p>MetadataCID: ""</p>
          <p>SwapAddress: {constants.AddressZero}</p>
          <p>Exchange: 0</p>
          <div>
            <p>SwapTokenAddresses: </p>
            <div>
              <p>0: {constants.AddressZero}</p>
              <p>1: {constants.AddressZero}</p>
              <p>2: {constants.AddressZero}</p>
              <p>3: {constants.AddressZero}</p>
              <p>4: {constants.AddressZero}</p>
              <p>5: {constants.AddressZero}</p>
              <p>6: {constants.AddressZero}</p>
              <p>7: {constants.AddressZero}</p>
            </div>
          </div>
        </Section>
        <Section title="InitialDeposit">
          <p>InitialDeposit: 0</p>
        </Section>
        <div className="flex justify-center mt-8">
          <div className="flex flex-row items-center space-x-4">
            <button
              className="flex group gap-2 items-center bg-red-500 text-white font-bold px-6 py-4 rounded-xl shadow"
              onClick={() => router.push("/")}
            >
              <IoMdArrowBack className="text-[150%] group-hover:translate-x-px" />
              <span>Change Stuff</span>
            </button>
            <button
              className="flex group gap-2 items-center bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow"
              onClick={() => deployVault()}
            >
              <span>Deploy Vault</span>
              <IoMdArrowForward className="text-[150%] group-hover:translate-x-px" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}