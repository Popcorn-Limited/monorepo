import { SearchIcon } from "@heroicons/react/outline";

interface SearchBarProps {
  searchValue: string;
  setSearchValue: (userInput: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchValue, setSearchValue }) => {
  return (
    <div className="px-6 relative rounded-4xl border-customLightGray border flex flex-row items-center w-full">
      {/* <Icon.Search className="left-6 absolute" /> */}
      <SearchIcon className="text-secondaryLight w-6 h-6" />
      <input
        className="w-full h-full pl-2 py-4 placeholder-gray-500 text-black focus:outline-none"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Type to search"
      />
    </div>
  );
};

export default SearchBar;
