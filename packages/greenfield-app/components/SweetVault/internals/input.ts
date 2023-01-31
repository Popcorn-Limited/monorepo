export const validateInput = (value: string | number) => {
  const formmatted = value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formmatted,
    isValid: value === "" || isFinite(Number(formmatted)),
  };
};
