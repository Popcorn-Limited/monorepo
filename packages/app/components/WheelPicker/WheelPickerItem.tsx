import React, { FocusEventHandler, forwardRef, MouseEventHandler, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { OPTION_ID } from "@popcorn/app/components/WheelPicker/WheelPicker";

const Item = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: left;
  cursor: pointer;
  ${(props: { height: number }): string => `
    min-height: ${props.height}px;
  `}
  &:focus {
    outline: none;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ICON_WIDTH = 20;
const Icon = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  left: -10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${ICON_WIDTH}px;
  opacity: 0;
  animation: ${fadeIn} 200ms ease-in;
  animation-fill-mode: forwards;
  animation-delay: 200ms;
  ${(props: { fontSize: number }) => `
    font-size: ${props.fontSize};
  `}
`;

const Text = styled.p`
  margin: 0;
  text-align: left;
  word-wrap: break-word;
  padding-left: 10px;
`;

export interface WheelPickerItemProps {
  id: string;
  value: string | number;
  activeID: string;
  height: number;
  color: string;
  activeColor: string;
  fontSize: number;
  onClick?: MouseEventHandler;
  onFocus?: FocusEventHandler;
  renderWithIcon?: boolean;
  icon?: string;
}

const WheelPickerItem = forwardRef<HTMLLIElement, WheelPickerItemProps>((props, ref) => {
  const { id, value, icon, activeID, height, color, activeColor, fontSize, onClick, onFocus, renderWithIcon } = props;

  const selected = useMemo(() => id === activeID, [id, activeID]);
  const textColor = useMemo(() => (selected ? activeColor : color), [activeColor, color, selected]);
  const textStyle = useMemo(
    () => ({
      color: textColor,
      fontSize,
    }),
    [fontSize, textColor],
  );
  return (
    <Item
      role="option"
      aria-selected={selected}
      aria-label={value.toString()}
      ref={ref}
      id={`${OPTION_ID}${id}`}
      data-itemid={id}
      data-itemvalue={value}
      height={height}
      onClick={onClick}
      onFocus={onFocus}
      tabIndex={0}
    >
      {selected && <Icon fontSize={fontSize}>&#10003;</Icon>}
      <span style={{ width: ICON_WIDTH }}></span>
      {renderWithIcon && icon && (
        <div className="w-5 h-5 inline-flex ml-3 flex-shrink-0">
          <img src={`/images/tokens/${icon}`} alt={value.toString()} className="h-full w-full object-contain" />
        </div>
      )}
      <Text style={textStyle}>{value}</Text>
    </Item>
  );
});

export default WheelPickerItem;
