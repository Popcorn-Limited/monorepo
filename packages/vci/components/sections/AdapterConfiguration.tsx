import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";
import { adapterAtom, adapterConfigAtom, InitParamRequirement } from "@/lib/adapter";
import { useAtom } from "jotai";

function AdapterConfiguration() {
  const [adapter,] = useAtom(adapterAtom);
  const [adapterConfig, setAdapterConfig] = useAtom(adapterConfigAtom);

  function handleChange(value: string, index: number) {
    const newConfig = [...adapterConfig];
    if (newConfig.length < index) {
      newConfig.push(value)
    } else {
      newConfig[index] = value;
    }
    setAdapterConfig(newConfig);
  }

  return (
    <Section title="Adapter Configuration">
      <section className="flex flex-wrap gap-x-12 gap-y-4">
        {adapter?.initParams && adapter?.initParams?.length > 0 ?
          adapter?.initParams.map((initParam, i) => {
            return (
              <div key={`fee-element-${initParam.name}`} className="flex gap-4">
                <Fieldset className="flex-grow" label={initParam.name}>
                  <Input
                    onChange={e => handleChange((e.target as HTMLInputElement).value, i)}
                    value={adapterConfig[i] || ""}
                    placeholder={initParam.type.name === "address" ? "0x00" : "0.00"}
                    required={initParam.requirements?.includes(InitParamRequirement.Required)} />
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
