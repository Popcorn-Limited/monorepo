export const isDaytime = (hour: number): boolean => {
  return hour >= 6 && hour <= 18;
}

export default isDaytime;
