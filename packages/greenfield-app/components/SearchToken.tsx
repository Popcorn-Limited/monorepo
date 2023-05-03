import { SearchIcon } from "@heroicons/react/outline";
import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import TokenIcon from "@popcorn/greenfield-app/components/TokenIcon";
import { FC, useState } from "react";
import { useDefaultTokenList } from "@popcorn/greenfield-app/hooks/useDefaultTokenList";
import { Token } from "@popcorn/greenfield-app/lib/types";

interface SearchTokenProps {
  selectToken: (token: Token) => void;
  selectedToken: Token;
  options: Token[];
  chainId: ChainId;
}

export const SearchToken: FC<SearchTokenProps> = ({ options, selectToken, selectedToken, chainId }) => {
  const quickOptionsTokens = useDefaultTokenList(chainId);

  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Token[]>(options);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim().length > 0) {
      setFilteredOptions(options.filter((option) => option.name.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredOptions(options);
    }
  };

  return (
    <>
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full h-14 md:h-14 pb-0 border-customLightGray pl-14 focus:border-customLightGray focus:ring-customLightGray rounded-5xl text-base md:text-xl placeholder:text-base md:placeholder:text-xl pt-0"
          placeholder="Search"
        />
      </div>
      {options
        .filter((option) => quickOptionsTokens.find((token) => token == option.address))
        .map((quickOption) => (
          <div className="inline-flex mr-2 my-3" key={quickOption?.symbol}>
            <button
              className="flex items-center rounded-lg border border-customLightGray font-medium text-gray-800 py-2 px-3 md:py-2.5 md:px-4 text-base md:text-lg hover:bg-customPaleGray"
              onClick={() => {
                selectToken(quickOption);
              }}
            >
              <span className="relative mr-2">
                <TokenIcon token={quickOption?.address} imageSize="w-5 h-5" chainId={chainId} />
              </span>
              <span>{quickOption.name}</span>
            </button>
          </div>
        ))}
      <div className="mt-4">
        <ul className="scrollable__select py-6 overflow-y-auto shadow-scrollableSelect rounded-lg p-6 border border-customPaleGray">
          {filteredOptions.map((option) => (
            <li
              className="my-1 bg-transparent text-base md:text-lg hover:bg-customPaleGray hover:bg-opacity-40 rounded-lg"
              key={option.symbol}
              onClick={() => {
                selectToken(option);
              }}
            >
              <span
                className={`flex items-center py-3 px-3 ${
                  selectedToken.address === option.address
                    ? "text-black font-semibold"
                    : "text-primary font-normal  cursor-pointer"
                }`}
              >
                <span className="w-5 h-5 inline-flex mr-3 flex-shrink-0 cursor-pointer">
                  <img src={option.icon} alt={option.symbol} className="h-full w-full object-contain" />
                </span>
                <span className="cursor-pointer">{option.symbol}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
