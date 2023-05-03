import { formatDate } from "@popcorn/greenfield-app/lib/utils";
import { LockedBalance } from "@popcorn/greenfield-app/lib/types";
import { useState } from "react";
import * as Icon from "react-feather";

interface DropDownProps {
  label?: string;
  options: LockedBalance[];
  selectedOption: LockedBalance;
  selectOption: Function;
}

export default function VestingRecordDropDown({
  label,
  options,
  selectedOption,
  selectOption,
}: DropDownProps): JSX.Element {
  const [showDropdown, setDropdown] = useState<Boolean>(false);

  return (
    <div className="relative w-auto justify-end" onMouseLeave={() => setDropdown(false)}>
      <div className="flex flex-row items-center justify-between mb-1">
        <p className="text-primary">{label}</p>
      </div>
      <span
        className={`flex border-gray-200 border p-3.5 rounded-md flex-row items-center justify-between ${"cursor-pointer group"}`}
        onClick={() => setDropdown(!showDropdown)}
      >
        <p className="font-semibold leading-none text-gray-900 group-hover:text-blue-700">
          {selectedOption?.unlockTime &&
            formatDate(
              // Subtract 84 days (12 weeks) from the date to find the lock time from the unlock time.
              new Date(new Date().setDate(new Date(selectedOption.unlockTime * 1000).getDate() - 84)),
              "MMM dd, yyyy",
            )}
        </p>

        <>
          {showDropdown ? (
            <Icon.ChevronUp className="w-5 h-6 mb-1 ml-2 group-hover:text-blue-700" />
          ) : (
            <Icon.ChevronDown className="w-5 h-6 mb-1 ml-2 group-hover:text-blue-700" />
          )}
        </>
      </span>
      {showDropdown && (
        <div className="absolute overflow-scroll left-0 items-start w-full z-20 flex flex-col h-fit max-h-36 px-2 pt-2 pb-2 top-18 space-y-1 bg-white shadow-md rounded-b-md">
          {options
            .filter((vestingRecord) => vestingRecord.unlockTime !== selectedOption.unlockTime)
            .map((vestingRecord) => (
              <a
                key={vestingRecord.unlockTime}
                className="cursor-pointer group h-full w-full justify-start flex flex-row items-center hover:bg-gray-100 rounded-md"
                onClick={() => {
                  selectOption(vestingRecord);
                  setDropdown(false);
                }}
              >
                <p className="font-medium px-2 group-hover:text-blue-700 mt-1.5">
                  {formatDate(
                    // Subtract 84 days (12 weeks) from the date to find the lock time from the unlock time.
                    new Date(new Date().setDate(new Date(vestingRecord.unlockTime * 1000).getDate() - 84)),
                    "MMM dd, yyyy",
                  )}
                </p>
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
