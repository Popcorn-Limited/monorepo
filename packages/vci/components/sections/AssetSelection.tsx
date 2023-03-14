import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";
import { assetAtom, useAssets } from "@/lib/assets";

function AssetSelection() {
  const [adapter, setAdapter] = useAtom(assetAtom);
  const assets = useAssets();

  return (
    <Section title="Asset Selection">
      <Selector
        selected={adapter}
        onSelect={setAdapter}
        actionContent={(selected) => (
          <Fragment>
            {selected?.logoURI && (
              <figure className="relative w-6 h-6">
                <Image className="object-contain" fill alt="logo" src={selected?.logoURI} />
              </figure>
            )}
            <span>{selected?.name || "Click to select"}</span>
          </Fragment>
        )}
      >
        {assets.map((asset) => (
          <Option value={asset} key={`asset-selc-${asset.address}`}>
            <figure className="relative w-6 h-6">
              <Image alt="" className="object-contain" fill src={asset.logoURI} />
            </figure>
            <span>{asset.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default AssetSelection;
