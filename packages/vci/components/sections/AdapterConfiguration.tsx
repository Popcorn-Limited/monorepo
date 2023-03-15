import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";
import { adapterAtom, adapterConfigAtom, checkInitParamValidity } from "@/lib/adapter";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { RESET } from "jotai/utils";
import { constants,  } from "ethers";

const DEFAULT_VALUE = {
  address: constants.AddressZero,
  uint256: 0,
}

function AdapterConfiguration() {
  const [adapter,] = useAtom(adapterAtom);
  const [adapterConfig, setAdapterConfig] = useAtom(adapterConfigAtom);

  function handleChange(value: string, index: number, paramType: string) {
    const newConfig = [...adapterConfig];
    if (newConfig.length < index) {
      newConfig.push(value)
    } else {
      newConfig[index] = value;
    }
    setAdapterConfig(newConfig);
  }

  useEffect(() =>
    setAdapterConfig(!!adapter?.initParams && adapter?.initParams.length > 0 ?
      // @ts-ignore
      adapter?.initParams.map((param) => DEFAULT_VALUE[param.type])
      : RESET),
    [adapter])

  return (
    <Section title="Adapter Configuration">
      <section className="flex flex-wrap gap-x-12 gap-y-4">
        {adapter?.initParams && adapter?.initParams?.length > 0 ?
          adapter?.initParams.map((initParam, i) => {
            return (
              <div key={`fee-element-${initParam.name}`} className="flex gap-4">
                <Fieldset className="flex-grow" label={initParam.name}>
                  <Input
                    onChange={e => handleChange((e.target as HTMLInputElement).value, i, String(initParam.type))}
                    defaultValue={adapterConfig[i] || ""}
                    autoComplete="off"
                    autoCorrect="off"
                    type="text"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    placeholder={String(initParam.type) === "address" ? "0x00" : "0.0"}
                    minLength={1}
                    maxLength={79}
                    spellCheck="false"
                    className={checkInitParamValidity(adapterConfig[i], initParam) ? "" : "border border-red-500"}
                  />

                </Fieldset>
              </div>
            );
          }) :
          <p>No configuration required</p>
        }
      </section>
    </Section>
  );
}

export default AdapterConfiguration;
