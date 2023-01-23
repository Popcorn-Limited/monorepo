import { add, format } from 'date-fns';
import { isTwilight } from './isTwilight';

export interface Options {
  /**
   * will return today's date if current time is between midnight and 6am.
   */
  twilightAdjusted?: boolean;
}
export const getTomorrowsDate = (_format: string, options: Options): string => {
  return format(
    options?.twilightAdjusted
      ? isTwilight(new Date().getHours())
        ? new Date()
        : add(new Date(), { days: 1 })
      : new Date(),
    _format,
  );
};

export default getTomorrowsDate;
