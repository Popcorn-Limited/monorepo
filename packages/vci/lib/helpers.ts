export function noOp() {}
export const beautifyAddress = (addr: string) => `${addr.substr(0, 4)}...${addr.substr(-5, 5)}`;
