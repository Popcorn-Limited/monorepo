import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "./Selector";

function AdapterSelector({ selected, onSelect }: { selected?: any; onSelect: (value: any) => void }) {
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
      {MOCK_ADAPTERS.map((adapter) => (
        <Option value={adapter} key={`asset-selc-${adapter.address}-${adapter.name}`}>
          <figure className="relative w-6 h-6">
            <Image alt="" className="object-contain" fill src={adapter.logoURI} />
          </figure>
          <span>{adapter.name}</span>
        </Option>
      ))}
    </Selector>
  );
}

const MOCK_ADAPTERS = [
  {
    logoURI:
      "https://forum.popcorn.network/uploads/default/optimized/1X/4ad0b80c41129e6d8b04d49799bbbfcc6c8e9a91_2_32x32.png",
    name: "Popcorn Adapter",
    address: "0x0",
  },
];

export default AdapterSelector;
