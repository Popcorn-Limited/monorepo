import WheelPickerItem from "@popcorn/app/components/WheelPicker/WheelPickerItem";
import useHandleKeyboard from "@popcorn/app/hooks/wheelPicker/useHandleKeyboard";
import useObserver from "@popcorn/app/hooks/wheelPicker/useObserver";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import styled from "styled-components";

export const OPTION_ID = "wheel-picker-option-";

const List = styled.ul`
  position: relative;
  margin: 0;
  padding: 0;
  display: inline-block;
  list-style: none;
  overflow-y: scroll;
  will-change: transform;
  overflow-x: hidden;
  text-align: center;
  padding: 0 20px;
  ${(props: {
    height: number;
    width: string;
    backgroundColor: string;
    shadowColor: string;
    focusColor: string;
  }): string => `
    height: ${props.height}px;
    width: ${props.width};
    background-color: ${props.backgroundColor};
    box-shadow: 1px 3px 10px ${props.shadowColor} inset;
    &:focus {
      outline: 2px solid ${props.focusColor};
    }
  `}
`;

const calculateSpaceHeight = (height: number, itemHeight: number): number => {
  const limit = height / itemHeight / 2 - 0.5;
  return itemHeight * limit;
};

const setStyles = (styles: {
  width?: number;
  color?: string;
  activeColor?: string;
  fontSize?: number;
  backgroundColor?: string;
  shadowColor?: string;
  focusColor?: string;
}) => {
  const _color = styles.color || "#fff";
  return {
    color: _color,
    activeColor: styles.activeColor || _color,
    fontSize: styles.fontSize || 16,
    backgroundColor: styles.backgroundColor || "#555",
    shadowColor: styles.shadowColor || "#333",
    width: styles.width ? `${styles.width}px` : "100%",
    focusColor: styles.focusColor ? styles.focusColor : "blue",
  };
};

// picker data interface
export interface PickerDataWithoutIcon {
  id: string;
  value: string | number;
  icon?: string;
}

export interface PickerDataWithIcon extends PickerDataWithoutIcon {
  icon: string;
}

export type PickerData = PickerDataWithoutIcon | PickerDataWithIcon;

// wheel ref interface
export interface WheelPickerRef {
  focus: () => void;
  blur: () => void;
}

// wheel picker props interface
interface CommonWheelPickerProps {
  selectedID: string;
  onChange: (data: PickerData) => void;
  height: number;
  itemHeight: number;
  idName?: string;
  titleID?: string;
  titleText?: string;
  required?: boolean;
  width?: number;
  color?: string;
  activeColor?: string;
  fontSize?: number;
  backgroundColor?: string;
  shadowColor?: string;
  focusColor?: string;
}

export type WheelPickerProps = CommonWheelPickerProps &
  (
    | {
        renderWithIcon?: never;
        dataWithIcons?: never;
        data: PickerDataWithoutIcon[];
      }
    | {
        renderWithIcon: true;
        data?: never;
        dataWithIcons: PickerDataWithIcon[];
      }
  );

const WheelPicker = forwardRef<WheelPickerRef, WheelPickerProps>((props, ref) => {
  const {
    selectedID,
    onChange,
    height,
    itemHeight,
    idName,
    titleID,
    titleText,
    width,
    color,
    activeColor,
    fontSize,
    backgroundColor,
    shadowColor,
    focusColor,
    required,
    renderWithIcon,
  } = props;

  const data = renderWithIcon ? props.dataWithIcons : props.data;

  const [_itemHeight, setItemHeight] = useState(itemHeight);
  const { onKeyUp, onKeyPress } = useHandleKeyboard(_itemHeight);
  const { root, refs, activeID, onFocus } = useObserver(data, selectedID, _itemHeight, onChange);

  const styles = useMemo(
    () =>
      setStyles({
        width,
        color,
        activeColor,
        fontSize,
        backgroundColor,
        shadowColor,
        focusColor,
      }),
    [activeColor, backgroundColor, color, focusColor, fontSize, shadowColor, width],
  );

  const spaceHeight = useMemo(() => calculateSpaceHeight(height, _itemHeight), [_itemHeight, height]);

  const ariaActivedescendant = useMemo(() => {
    return `${OPTION_ID}${activeID}`;
  }, [activeID]);

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      if (root.current) {
        root.current.scrollTo(0, e.currentTarget.offsetTop - spaceHeight);
      }
    },
    [root, spaceHeight],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        root.current && root.current.focus();
      },
      blur: () => {
        root.current && root.current.blur();
      },
    }),
    [root],
  );

  useEffect(() => {
    const adjustItemHeight = () => {
      let maxHeight = itemHeight;
      Object.keys(refs).forEach((id) => {
        const elm = refs[id].current;
        if (!elm) {
          return;
        }

        const h = elm.clientHeight;
        if (h > maxHeight) {
          maxHeight = h;
        }
      });
      return maxHeight;
    };
    setItemHeight(adjustItemHeight());
  }, [itemHeight, refs]);

  return (
    <List
      id={idName}
      tabIndex={0}
      role="listbox"
      aria-labelledby={titleID}
      aria-label={titleText}
      aria-required={required}
      aria-activedescendant={ariaActivedescendant}
      ref={root}
      data-testid="picker-list"
      height={height}
      width={styles.width}
      backgroundColor={styles.backgroundColor}
      shadowColor={styles.shadowColor}
      focusColor={styles.focusColor}
      onKeyUp={onKeyUp}
      onKeyPress={onKeyPress}
      onKeyDown={onKeyPress}
    >
      <div style={{ height: spaceHeight }} />
      {data.map((item: PickerData) => (
        <WheelPickerItem
          key={item.id}
          {...item}
          {...styles}
          height={_itemHeight}
          activeID={activeID}
          onClick={handleOnClick}
          onFocus={onFocus}
          ref={refs[item.id]}
          renderWithIcon={renderWithIcon}
        />
      ))}
      <div style={{ height: spaceHeight }} />
    </List>
  );
});

export default WheelPicker;
