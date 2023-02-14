import type { Token } from "@/lib/tokens";
import { usePersistentAtom } from "@/lib/jotai";
import AssetSelector from "@/components/AssetSelector";
import Section from "@/components/content/Section";

function AssetSelection() {
  const [asset, setAsset] = usePersistentAtom<Token>("select.asset");
  return (
    <Section title="Asset Selection">
      <AssetSelector selected={asset} onSelect={setAsset} />
    </Section>
  );
}

export default AssetSelection;
