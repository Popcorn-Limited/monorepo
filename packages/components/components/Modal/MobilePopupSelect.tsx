import React, { JSXElementConstructor } from "react";
import { List, ListItem } from "../ScrollableSelect";
import PopUpModal from "@popcorn/components/components/Modal/PopUpModal";

interface Category {
  id: any;
  value: any;
}

interface Props {
  title: string;
  categories: Category[];
  visible: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItem: Category;
  switchFilter: (item: Category) => void;
}

export const MobilePopupSelect: React.FC<Props> = (props) => {
  const { categories, visible, onClose, selectedItem, switchFilter, title } = props;

  const handleOnChange = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, value: Category) => {
    e.preventDefault();
    switchFilter(value);
    onClose(false);
  };

  return (
    <PopUpModal visible={visible} onClosePopUpModal={() => onClose(false)}>
      <>
        <p className=" text-black mb-3">{title}</p>
        <List selected={selectedItem.id}>
          {categories.map((category) => (
            <ListItem key={category.id} value={category.id} onClick={(e) => handleOnChange(e, category)}>
              {category.value}
            </ListItem>
          ))}
        </List>
      </>
    </PopUpModal>
  );
};
