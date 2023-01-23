import React, { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Dropdown from "../components/Dropdown";

export default {
  title: "Components/Dropdown",
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>;

const options = [
  { id: "1", value: "50%" },
  { id: "2", value: "100%" },
];
let selectedOption = { id: "1", value: "50" };
const setSelectedOption = (item) => {
  selectedOption = item;
};

const Template: ComponentStory<typeof Dropdown> = (args) => <Dropdown {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  options,
  position: "absolute top-14 left-0 z-40",
  width: "w-full",
  selectedItem: selectedOption,
  switchFilter: setSelectedOption,
  label: "Highest holding %",
};
