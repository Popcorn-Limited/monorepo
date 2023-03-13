import type { HTMLProps } from "react";

export type InputProps = HTMLProps<HTMLInputElement>;
function Input({ className, ...props }: InputProps) {
  return <input className={`${className} p-2 bg-zinc-500/5 rounded-lg`} type="text" {...props} />;
}

export default Input;
