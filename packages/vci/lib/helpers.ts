export function noOp() {}
export const beautifyAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-5, 5)}`;
