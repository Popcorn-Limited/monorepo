import { PickerData } from "@popcorn/app/components/WheelPicker/WheelPicker";
import { RefObject, useCallback, useRef } from "react";
import { PickerItemRef } from "@popcorn/app/hooks/wheelPicker/useObserver";

const easeOutCubic = (t: number, b: number, c: number, d: number) => {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
};

export const setScrollAnimation = (root: HTMLUListElement, currentPosition: number, changingValue: number) => {
  let start = 1;
  let isStop = false;
  const animation = () => {
    if (isStop) return;
    const offset = easeOutCubic(start / 100, currentPosition, changingValue, 0.1);
    requestAnimationFrame(animation);
    root.scrollTo(0, offset);
    const target = currentPosition + changingValue;
    start += 1;
    isStop = offset === target;
  };

  return animation;
};

const useScrollAnimation = (root: RefObject<HTMLUListElement>, refs: PickerItemRef) => {
  const timer = useRef<number | null>(null);

  const onScroll = useCallback(
    (data: PickerData[], itemID: string, hasAnimation?: boolean) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      const firstID = data[0].id;
      const basicElm = refs[firstID].current;
      const currentElm = refs[itemID || firstID].current;
      const _root = root.current;
      if (_root && basicElm && currentElm) {
        timer.current = window.setTimeout(
          () => {
            const basicOffsetTop = basicElm.offsetTop;
            const targetOffsetTop = currentElm.offsetTop - basicOffsetTop;
            const animation = setScrollAnimation(_root, _root.scrollTop, targetOffsetTop - _root.scrollTop);
            requestAnimationFrame(animation);
          },
          hasAnimation ? 300 : 0,
        );
      }
    },
    [refs, root],
  );

  return onScroll;
};

export default useScrollAnimation;
