import { ChainId } from "@popcorn/utils";

export default function toTitleCase(toConvert: string): string {
  if (toConvert.toLowerCase() === ChainId[56].toLowerCase()) {
    return ChainId[56];
  }
  return toConvert.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}
