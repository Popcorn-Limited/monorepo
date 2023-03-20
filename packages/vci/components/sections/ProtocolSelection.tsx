import { Protocol, protocolAtom, useProtocols } from "@/lib/protocols";
import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { networkAtom } from "@/lib/networks";

function ProtocolSelection() {
  const [network,] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const protocols = useProtocols();
  const [options, setOptions] = useState<Protocol[]>(protocols);

  useEffect(() => {
    if (network) {
      const filtered = protocols.filter((p) => p.chains.includes(network.id));
      setOptions(filtered);
      setProtocol(filtered[0]);
    }
  }, [network])


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
          <Option value={protocol} key={`asset-selc-${protocol.name}`}>
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
