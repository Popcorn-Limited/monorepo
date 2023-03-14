import Section from "@/components/content/Section";
import { adapterAtom } from "@/lib/adapter";
import { strategyAtom, useStrategies } from "@/lib/strategy";
import { useAtom } from "jotai";

function StrategySelection() {
  const strategies = useStrategies();
  const [adapter,] = useAtom(adapterAtom);
  const [selectedStrategy, setStrategy] = useAtom(strategyAtom);

  return (
    <Section title="Strategy Selection (Optional)">
      {strategies.filter(strategy => strategy.compatibleAdapters.includes(adapter.key)).map((strategy) => {
        const isActive = selectedStrategy.key === strategy.key;
        return (
          <button
            key={`strategy-select-${strategy.key}`}
            onClick={() => setStrategy(strategy)}
            className={`border rounded-xl p-8 text-left hover:outline outline-blue-600 ${isActive && "outline outline-2"
              }`}
          >
            <h2 className="flex gap-2 items-center">
              <span className="text-lg font-semibold">{strategy.name}</span>
            </h2>
            <p className="mt-4">{strategy.description}</p>
          </button>
        );
      })}
    </Section>
  );
}

export default StrategySelection;
