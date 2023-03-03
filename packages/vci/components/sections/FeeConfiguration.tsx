import type { FormattedInput } from "@/lib/inputs";
import { utils } from "ethers";
import { useBigNumberFormattedInput, useFormattedInputHandler } from "@/lib/inputs";
import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";

function FeeConfiguration() {
  const depositFee = useNumberHandler("depositFee");
  const withdrawalFee = useNumberHandler("withdrawalFee");
  const performanceFee = useNumberHandler("performanceFee");
  const managementFee = useNumberHandler("managementFee");

  const feeRecipientHandler = useFormattedInputHandler<string>(undefined, {
    formatter: (t) => (utils.isAddress(t) ? t : ""),
    isPersistent: true,
    stateScopeOrId: `fee.ih.address`,
  });

  const fees: Array<StatefulInput> = [
    {
      label: "1. Deposit fee",
      handler: depositFee,
    },
    {
      label: "2. Withdrawal fee",
      handler: withdrawalFee,
    },
    {
      label: "3. Performance fee",
      handler: performanceFee,
    },
    {
      label: "4. Management fee",
      handler: managementFee,
    },
  ];

  return (
    <Section title="Fee Configuration">
      <section className="flex flex-wrap gap-x-12 gap-y-4">
        {fees.map((fee) => {
          return (
            <div key={`fee-element-${fee.label}`} className="flex gap-4">
              <Fieldset className="flex-grow" label={fee.label}>
                <Input onChange={fee.handler.onChangeHandler} value={fee.handler.value} placeholder="0.00" />
              </Fieldset>
            </div>
          );
        })}
      </section>
      <Fieldset className="font-semibold" label="Fee Recipient">
        <Input
          className="font-normal"
          onChange={feeRecipientHandler.onChangeHandler}
          value={feeRecipientHandler.value}
          placeholder="0x00"
        />
      </Fieldset>
    </Section>
  );
}

type StatefulInput = {
  label: string;
  handler: FormattedInput<any>;
};

function useNumberHandler(stateScopeOrId: string) {
  const numberHandler = useBigNumberFormattedInput<number>(undefined, {
    isPersistent: true,
    stateScopeOrId: `fee.ih.${stateScopeOrId}-number`,
  });

  return numberHandler;
}

export default FeeConfiguration;
