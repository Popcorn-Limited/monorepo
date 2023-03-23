import { Adapter, adapterAtom, useAdapters } from "@/lib/adapter";
import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { protocolAtom } from "@/lib/protocols";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";

function AdapterSelection() {
  const [protocol,] = useAtom(protocolAtom);
  const [adapter, setAdapter] = useAtom(adapterAtom);
  const adapters = useAdapters();
  const [options, setOptions] = useState<Adapter[]>(adapters);

  useEffect(() => {
    if (protocol) {
      const filtered = adapters.filter((adapter) => adapter.protocol === protocol.name);
      setOptions(filtered);
      setAdapter(filtered[0]);
    }
  }, [protocol])


  return (
    <Section title="Adapter Selection">
      <p>Options: {options.length}</p>
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
        {options.map((adapter) => (
          <Option value={adapter} key={`asset-selc-${adapter.key}-${adapter.name}`}>
            <figure className="relative w-6 h-6">
              <Image alt="" className="object-contain" fill src={adapter.logoURI} />
            </figure>
            <span>{adapter.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default AdapterSelection;


