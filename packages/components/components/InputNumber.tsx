import type { HTMLProps } from "react";

function InputNumber(props: HTMLProps<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="block w-full p-0 border-0 text-primaryDark text-lg"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={"0.0"}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  );
}

export default InputNumber;
