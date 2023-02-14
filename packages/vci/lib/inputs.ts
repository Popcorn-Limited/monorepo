import type { BigNumberish } from "ethers";
import { parseUnits } from "ethers";
import { FormEventHandler, useMemo } from "react";
import { usePersistentAtom } from "./jotai";

export type FormattedInput<T, FormattedType = T> = {
  value: T;
  formattedValue: FormattedType;
  resetValue(): void;
  onChangeHandler: FormEventHandler<HTMLInputElement>;
  setValue: (state: T) => void;
};

export const bigNumberFormatter = (value: any) => parseUnits(validateInput(value).formatted);

export const validateInput = (value?: string | number) => {
  const formatted = value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formatted,
    isValid: value === "" || isFinite(Number(formatted)),
  };
};

export const useBigNumberFormattedInput = <T>(
  initState: T | undefined,
  config: {
    isPersistent?: boolean;
    stateScopeOrId?: string;
  },
): FormattedInput<T, BigNumberish> => {
  const isPersistent = config?.isPersistent && config.stateScopeOrId;
  const [value, setValue] = usePersistentAtom(isPersistent ? config.stateScopeOrId : undefined, initState);
  const formattedValue = useMemo(() => bigNumberFormatter(value as any), [value]);

  const onChangeHandler: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setValue(validateInput(value).isValid ? (value as any) : 0);
  };

  const resetValue = () => setValue("" as any);

  return {
    value: value as any,
    resetValue,
    formattedValue,
    onChangeHandler,
    setValue,
  };
};

export const useFormattedInputHandler = <T>(
  initState: T | undefined,
  config: {
    formatter: (value: T) => T;
    isPersistent?: boolean;
    stateScopeOrId?: string;
  },
): FormattedInput<T> => {
  const isPersistent = config?.isPersistent && config.stateScopeOrId;
  const [value, setValue] = usePersistentAtom(isPersistent ? config.stateScopeOrId : undefined, initState);

  const onChangeHandler: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setValue(config.formatter(value as any));
  };

  const resetValue = () => setValue("" as any);

  return {
    value: value as any,
    formattedValue: value as any,
    resetValue,
    onChangeHandler,
    setValue,
  };
};
