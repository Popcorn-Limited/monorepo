import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";
import { useAtom } from "jotai";
import { feeAtom } from "@/lib/fees";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

const FEE_INPUTS = [
  { name: "Deposit Fee", key: "deposit" },
  { name: "Withdrawal Fee", key: "withdrawal" },
  { name: "Performance Fee", key: "performance" },
  { name: "Management Fee", key: "management" }
]

function FeeConfiguration() {
  const [fees, setFee] = useAtom(feeAtom)

  function handleChange(value: string, key: string) {
    setFee({ ...fees, [key]: value });
  }

  return (
    <Section title="Fee Configuration">
      <section className="flex flex-wrap gap-x-12 gap-y-4">
        {FEE_INPUTS.map((input) => {
          return (
            <div key={`fee-element-${input.name}`} className="flex gap-4">
              <Fieldset className="flex-grow" label={input.name}>
                <Input onChange={e => handleChange((e.target as HTMLInputElement).value, input.key)} value={"0"} placeholder="0.00" />
              </Fieldset>
            </div>
          );
        })}
        <div className="flex gap-4">
          <Fieldset className="flex-grow" label="Fee Recipient">
            <Input onChange={e => setFee(prefState => { return { ...prefState, recipient: (e.target as HTMLInputElement).value } })} value={fees.recipient} placeholder="0x00" />
          </Fieldset>
        </div>
      </section>
    </Section>
  );
}

export default FeeConfiguration;
