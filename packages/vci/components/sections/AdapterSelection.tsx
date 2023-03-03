import type { Token } from "@/lib/tokens";
import { usePersistentAtom } from "@/lib/jotai";
import AdapterSelector from "@/components/AdapterSelector";
import Section from "@/components/content/Section";

function AdapterSelection() {
  const [asset, setAsset] = usePersistentAtom<Token>("select.adapter");
  return (
    <Section title="Adapter Selection">
      <AdapterSelector selected={asset} onSelect={setAsset} />
    </Section>
  );
}

export default AdapterSelection;
