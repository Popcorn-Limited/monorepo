import type { Protocol } from "@/lib/prototols";
import { usePersistentAtom } from "@/lib/jotai";
import Section from "@/components/content/Section";
import ProtocolSelector from "@/components/ProtocolSelector";

function ProtocolSelection() {
  const [asset, setAsset] = usePersistentAtom<Protocol>("select.protocol");
  return (
    <Section title="Protocol Selection">
      <ProtocolSelector selected={asset} onSelect={setAsset} />
    </Section>
  );
}

export default ProtocolSelection;
