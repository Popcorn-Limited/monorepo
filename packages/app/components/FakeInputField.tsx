interface FakeInputFieldProps {
  inputValue: string | number;
  children: JSX.Element | React.ReactComponentElement<any>;
}

export default function FakeInputField({ inputValue, children }: FakeInputFieldProps): JSX.Element {
  return (
    <div className="flex flex-row justify-between items-center w-full px-5 py-4 border border-gray-200 rounded-md font-semibold bg-gray-50 text-gray-500 focus:text-gray-800">
      <p className="">{inputValue}</p>
      <>{children}</>
    </div>
  );
}
