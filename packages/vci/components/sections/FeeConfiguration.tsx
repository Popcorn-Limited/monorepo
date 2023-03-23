import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";
import { useAtom } from "jotai";
import { feeAtom, validateBigNumberInput } from "@/lib/fees";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { constants, utils } from "ethers";

const FEE_INPUTS = [
  { name: "Deposit Fee", key: "deposit" },
  { name: "Withdrawal Fee", key: "withdrawal" },
  { name: "Performance Fee", key: "performance" },
  { name: "Management Fee", key: "management" }
]

function FeeConfiguration() {
  const [fees, setFee] = useAtom(feeAtom)

  function handleChange(value: string, key: string) {
    setFee({ ...fees, [key]: parseUnits(validateBigNumberInput(value).formatted) });
  }

  return (
    <Section title="Fee Configuration">
      <section className="flex flex-wrap gap-x-12 gap-y-4">
        {FEE_INPUTS.map((input) => {
          return (
            <div key={`fee-element-${input.name}`} className="flex gap-4">
              <Fieldset className="flex-grow" label={input.name}>
                <Input
                  onChange={e => handleChange((e.target as HTMLInputElement).value, input.key)}
                  // @ts-ignore
                  defaultValue={formatUnits(fees[input.key])}
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  type="text"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder={"0.0"}
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  // @ts-ignore
                  className={Number(formatUnits(fees[input.key])) >= 1 ? "border border-red-500" : ""}
                />
              </Fieldset>
            </div>
          );
        })}
        <div className="flex gap-4">
          <Fieldset className="flex-grow" label="Fee Recipient">
            <Input
              onChange={e => setFee(prefState => { return { ...prefState, recipient: (e.target as HTMLInputElement).value } })}
              defaultValue={fees.recipient}
              placeholder="0x00"
              autoComplete="off"
              autoCorrect="off"
              className={!utils.isAddress(fees.recipient) ||
                // @ts-ignore
                (Object.keys(fees).some(key => Number(formatUnits(fees[key])) > 0) && fees.recipient === constants.AddressZero) ?
                "border border-red-500" : ""
              }
            />
          </Fieldset>
        </div>
      </section>
    </Section>
  );
}

export default FeeConfiguration;
