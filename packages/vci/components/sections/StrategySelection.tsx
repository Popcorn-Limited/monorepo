import Section from "@/components/content/Section";
import { beautifyAddress } from "@/lib/helpers";
import { usePersistentAtom } from "@/lib/jotai";

function StrategySelection() {
  const [strategyAddress, setStrategyAddress] = usePersistentAtom<string>("select.strategy");
  const handleSetStrategy = (selectedAddress: string) => {
    setStrategyAddress(strategyAddress === selectedAddress ? "" : selectedAddress);
    // if selected strategy address === selectedAddress, we clear selected state
  };

  return (
    <Section title="Strategy Selection (Optional)">
      {MOCK_STRATEGIES.map(({ address, content, name }) => {
        const isActive = strategyAddress === address;
        return (
          <button
            key={`strategy-select-${address}`}
            onClick={() => handleSetStrategy(address)}
            className={`border rounded-xl p-8 text-left hover:outline outline-blue-600 ${
              isActive && "outline outline-2"
            }`}
          >
            <h2 className="flex gap-2 items-center">
              <span className="text-lg font-semibold">{name}</span>
              <span className="py-1 text-sm px-2 bg-slate-100 rounded-full">{beautifyAddress(address)}</span>
            </h2>
            <p className="mt-4">{content}</p>
          </button>
        );
      })}
    </Section>
  );
}

const MOCK_STRATEGIES = [
  {
    content: `Supplies UNI to Pool Together to earn POOL. Earned tokens are harvested, sold for more UNI which is deposited
    back into the strategy. If strategy wins prize of the week, prize will also be added to the strategy. Last
    report 2 years ago.`,
    name: "PoolTogether Uniswap",
    address: "0x3c0e20fCA6d2E084127D056377a5f35294503447",
  },
];

export default StrategySelection;
