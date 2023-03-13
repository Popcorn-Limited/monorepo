import type { Protocol } from "@/lib/prototols";
import { Fragment } from "react";
import Image from "next/image";
import { useProtocolList } from "@/lib/prototols";
import Selector, { Option } from "./Selector";

function ProtocolSelector({ selected, onSelect }: { selected?: Protocol; onSelect: (value: any) => void }) {
  const protocols = useProtocolList();
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
      {protocols.map((protocol) => (
        <Option value={protocol} key={`asset-selc-${protocol.address}-${protocol.name}`}>
          <figure className="relative w-6 h-6">
            <Image alt="" className="object-contain" fill src={protocol.logoURI} />
          </figure>
          <span>{protocol.name}</span>
        </Option>
      ))}
    </Selector>
  );
}

export default ProtocolSelector;
