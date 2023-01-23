import React, { createContext, FC, useContext } from "react";

const ListContext = createContext({
  selected: "",
});

interface ListProps {
  children: React.ReactNode;
  selected: string;
}

const List: FC<ListProps> = ({ children, selected }) => (
  <ul className="scrollable__select overflow-y-auto shadow-scrollable-select rounded-lg px-6 py-4 border border-customPaleGray h-[200px]">
    <ListContext.Provider value={{ selected }}>{children}</ListContext.Provider>
  </ul>
);

interface ListItemProps {
  children: React.ReactNode;
  value: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const ListItem: FC<ListItemProps> = ({ children, value, onClick }) => {
  const { selected } = useContext(ListContext);
  return (
    <li
      value={value}
      className="my-1 bg-transparent text-base md:text-lg hover:bg-customPaleGray hover:bg-opacity-40 rounded-lg"
    >
      <button
        className={`w-full flex items-center py-3 px-3 ${
          selected === value ? "text-black font-[500]" : "text-primary font-normal"
        }`}
        onClick={onClick}
      >
        <>{children}</>
      </button>
    </li>
  );
};

export { List, ListItem };
