import { Fragment } from "react";
import { Listbox } from "@headlessui/react";

function Selector({
  selected,
  onSelect,
  children,
  actionContent,
}: {
  selected?: any;
  onSelect: (value: any) => void;
  children: any;
  actionContent: (selected: any) => JSX.Element;
}) {
  return (
    <Listbox className="relative self-start" as="div" value={selected} onChange={onSelect}>
      <Listbox.Button className="border rounded-lg flex gap-2 p-2">{actionContent(selected)}</Listbox.Button>
      <Listbox.Options className="z-[1] absolute flex flex-col min-w-[12rem] rounded-lg ml-[100%] top-0 left-0 p-2 bg-white shadow-xl max-h-[80vh] overflow-auto">
        {children}
      </Listbox.Options>
    </Listbox>
  );
}

export function Option({ value, children }: { value: any; children: any }) {
  return (
    <Listbox.Option value={value} as={Fragment}>
      {({ active }) => {
        return (
          <button
            className={`p-2 flex gap-2 border border-transparent rounded-lg whitespace-nowrap text-left hover:bg-zinc-400/5 ${
              active && "bg-zinc-400/5 border-zinc-400/5"
            }`}
          >
            {children}
          </button>
        );
      }}
    </Listbox.Option>
  );
}

export default Selector;
