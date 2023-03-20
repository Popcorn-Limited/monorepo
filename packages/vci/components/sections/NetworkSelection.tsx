import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";
import { Chain, goerli } from "wagmi";
import { networkAtom } from "@/lib/networks";
import { localhost } from "wagmi/chains";


const networkLogos = {
  1: "/images/icons/ethereum.svg",
  5: "/images/icons/testNetLogo.png",
  137: "/images/icons/polygon.svg",
  42161: "/images/icons/arbitrum.svg",
  1337: "/images/icons/testNetLogo.png",
  31338: "/images/icons/testNetLogo.png",
  10: "/images/icons/optimism-op-logo.svg",
  56: "/images/icons/bsc-logo.png",
  250: "/images/icons/fantom.png"
};

function NetworkSelection() {
  const [network, setNetwork] = useAtom(networkAtom);
  const chains = [goerli, localhost];

  return (
    <Section title="Network Selection">
      <Selector
        selected={network}
        onSelect={setNetwork}
        actionContent={(selected: Chain) => (
          <Fragment>
            {selected && (
              <figure className="relative w-6 h-6">
                <Image className="object-contain" fill alt="logo" src={networkLogos[selected.id]} />
              </figure>
            )}
            <span>{selected?.name || "Click to select"}</span>
          </Fragment>
        )}
      >
        {chains.map((c) => (
          <Option value={c} key={`asset-selc-${c.network}`}>
            <figure className="relative w-6 h-6">
              <Image alt="" className="object-contain" fill src={networkLogos[c.id]} />
            </figure>
            <span>{c.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default NetworkSelection;


