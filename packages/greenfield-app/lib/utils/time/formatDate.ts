import { DateTime } from "luxon";

export const formatDate = (dt: Date, formatString: string = "LLL dd yyyy; HH:mm a") => {
  const date = DateTime.fromJSDate(dt);
  return date.toFormat(formatString);
};
