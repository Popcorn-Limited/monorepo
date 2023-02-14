import type { FormattedInput } from "@/lib/inputs";
import { isAddress } from "ethers";
import { useBigNumberFormattedInput, useFormattedInputHandler } from "@/lib/inputs";
import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";

function FeeConfiguration() {
  const depositFee = useAddressNumberHandlers("depositFee");
  const withdrawalFee = useAddressNumberHandlers("withdrawalFee");
  const performanceFee = useAddressNumberHandlers("performanceFee");
  const managementFee = useAddressNumberHandlers("managementFee");

  const fees: Array<StatefulInput> = [
    {
      label: "1. Deposit fee",
      ...depositFee,
    },
    {
      label: "2. Withdrawal fee",
      ...withdrawalFee,
    },
    {
      label: "3. Performance fee",
      ...performanceFee,
    },
    {
      label: "4. Management fee",
      ...managementFee,
    },
  ];

  return (
    <Section title="Fee Configuration">
      {fees.map((fee) => {
        return (
          <div key={`fee-element-${fee.label}`} className="flex gap-4">
            <Fieldset className="flex-grow" label={fee.label}>
              <Input onChange={fee.numberHandler.onChangeHandler} value={fee.numberHandler.value} placeholder="0x00" />
            </Fieldset>
            <Fieldset label="Fee Recipient">
              <Input
                onChange={fee.addressHandler.onChangeHandler}
                value={fee.addressHandler.value}
                placeholder="0x00"
              />
            </Fieldset>
          </div>
        );
      })}
    </Section>
  );
}

type StatefulInput = {
  label: string;
  numberHandler: FormattedInput<any>;
  addressHandler: FormattedInput<string>;
};

function useAddressNumberHandlers(stateScopeOrId: string) {
  const numberHandler = useBigNumberFormattedInput<number>(undefined, {
    isPersistent: true,
    stateScopeOrId: `fee.ih.${stateScopeOrId}-number`,
  });

  const addressHandler = useFormattedInputHandler<string>(undefined, {
    formatter: (t) => (isAddress(t) ? t : ""),
    isPersistent: true,
    stateScopeOrId: `fee.ih.${stateScopeOrId}-address`,
  });

  return {
    numberHandler,
    addressHandler,
  };
}

export default FeeConfiguration;
