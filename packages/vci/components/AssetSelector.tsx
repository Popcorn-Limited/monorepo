import type { Token } from "@/lib/tokens";
import { Fragment } from "react";
import Image from "next/image";
import { useTokenList } from "@/lib/tokens";
import Selector, { Option } from "./Selector";

function AssetSelector({ selected, onSelect }: { selected?: Token; onSelect: (value: any) => void }) {
  const tokens = useTokenList();
  return (
    <Selector
      onSelect={onSelect}
      selected={selected}
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
      {tokens.map((token) => (
        <Option value={token} key={`asset-selc-${token.address}`}>
          <figure className="relative w-6 h-6">
            <Image alt="" className="object-contain" fill src={token.logoURI} />
          </figure>
          <span>{token.name}</span>
        </Option>
      ))}
    </Selector>
  );
}

export default AssetSelector;
