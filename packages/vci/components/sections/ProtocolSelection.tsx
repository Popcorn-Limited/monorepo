import { Protocol, protocolAtom, useProtocols } from "@/lib/protocols";
import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";

function ProtocolSelection() {
  const protocols = useProtocols();
  const [protocol, setProtocol] = useAtom<Protocol>(protocolAtom);

  return (
    <Section title="Protocol Selection">
      <Selector
        selected={protocol}
        onSelect={setProtocol}
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
          <Option value={protocol} key={`asset-selc-${protocol.chainId}-${protocol.name}`}>
            <figure className="relative w-6 h-6">
              <Image alt="" className="object-contain" fill src={protocol.logoURI} />
            </figure>
            <span>{protocol.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default ProtocolSelection;
