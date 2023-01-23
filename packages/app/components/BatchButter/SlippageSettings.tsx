import { InfoIconWithModal } from "@popcorn/app/components/InfoIconWithModal";
import PopUpModal from "@popcorn/components/components/Modal/PopUpModal";
import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { escapeRegExp, inputRegex } from "@popcorn/app/helper/inputRegex";
import { Dispatch, useContext, useState } from "react";
import PseudoRadioButton from "@popcorn/app/components/BatchButter/PseudoRadioButton";

interface CustomSlippageInputProps {
  value: string;
  setValue?: Dispatch<string>;
  setSlippage: Dispatch<number>;
}

export const CustomSlippageInput: React.FC<CustomSlippageInputProps> = (props) => {
  const { value, setValue, setSlippage } = props;

  const onUpdate = (nextUserInput: string) => {
    if (inputRegex.test(escapeRegExp(nextUserInput))) {
      setValue?.(nextUserInput);
      setSlippage(Number(nextUserInput));
    }
  };
  return (
    <div>
      <div className="mt-1 relative flex items-center">
        <input
          className="block w-full pl-5 pr-16 py-3.5 border-gray-300 font-medium rounded-lg leading-none text-primaryDark focus:outline-0 focus:ring-0 focus:ring-transparent focus:border-primary shadow-sm"
          value={value}
          onChange={(e) => {
            onUpdate(e.target.value.replace(/,/g, "."));
          }}
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          // text-specific options
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minLength={1}
          maxLength={4}
          spellCheck="false"
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 items-center">
          <p className="px-2 pb-1 pt-1.5 leading-none text-primaryDark font-medium rounded-lg">%</p>
        </div>
      </div>
    </div>
  );
};
interface SlippageSettingsProps {
  slippage: number;
  setSlippage: Dispatch<number>;
  slippageOptions: number[];
}

const SlippageContent: React.FC<SlippageSettingsProps> = ({ slippage, setSlippage, slippageOptions }) => {
  const [value, setValue] = useState<string>(String(slippage));
  return (
    <div className="mt-4 md:border md:border-gray-200 p-2 md:p-6 rounded-lg relative">
      <div className="flex flex-col">
        <div className="flex flex-row items-center">
          <p className="text-left font-medium text-primary leading-7">Slippage Tolerance</p>
          <div className="ml-1">
            <InfoIconWithModal
              title="Slippage Tolerance"
              content="Your transaction will revert if the price changes unfavorably by more than this percentage"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center mt-6">
        {slippageOptions.map((option) => (
          <PseudoRadioButton
            label={`${option} %`}
            isActive={value === String(option)}
            handleClick={() => {
              setValue(String(option));
              setSlippage(option);
            }}
          />
        ))}
      </div>
      <div className="mt-8">
        <div className="flex flex-row items-center">
          <p className="text-left font-medium text-primary leading-7">Custom Adjustments</p>
          <div className="ml-1">
            <InfoIconWithModal title="Custom Adjustments" content="Input a custom slippage tolerance amount" />
          </div>
        </div>

        <CustomSlippageInput value={value} setValue={setValue} setSlippage={setSlippage} />
      </div>
    </div>
  );
};

const SlippageSettings: React.FC<SlippageSettingsProps> = ({ slippage, setSlippage, slippageOptions }) => {
  const { dispatch } = useContext(store);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);

  return (
    <>
      <div
        className="hidden md:flex flex-row items-center group cursor-pointer mt-2"
        onClick={() =>
          dispatch(
            setSingleActionModal({
              title: "Slippage",
              children: (
                <SlippageContent slippage={slippage} setSlippage={setSlippage} slippageOptions={slippageOptions} />
              ),
              onDismiss: {
                label: "Done",
                onClick: () => dispatch(setSingleActionModal(false)),
              },
            }),
          )
        }
      >
        <img className="w-4 h-4" src="/images/icons/slippage.png" />
        <p className={`text-base leading-7 mt-0.5 ml-2 text-primaryDark`}>{`Adjust slippage (${slippage}%)`}</p>
      </div>

      <div
        className="flex md:hidden flex-row items-center group cursor-pointer mt-2"
        onClick={() => setShowPopUp(true)}
      >
        <img className="w-4 h-4" src="/images/icons/slippage.png" />
        <p className={`text-base leading-7 mt-0.5 ml-2 text-primaryDark`}>{`Adjust slippage (${slippage}%)`}</p>
      </div>
      <div className="absolute left-0">
        <PopUpModal visible={showPopUp} onClosePopUpModal={() => setShowPopUp(false)}>
          <SlippageContent slippage={slippage} setSlippage={setSlippage} slippageOptions={slippageOptions} />
        </PopUpModal>
      </div>
    </>
  );
};

export default SlippageSettings;
