import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Tabs } from "../components/Tabs";

export default {
  title: "Components/Tabs",
  component: Tabs,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Tabs>;

const Template: ComponentStory<typeof Tabs> = (args) => <Tabs {...args} />;
export const Primary = Template.bind({});

const tabs = [{ label: "All" }, { label: "Products" }, { label: "Rewards" }, { label: "Assets" }];

Primary.args = {
  tabs,
  activeTab: { label: "All" },
  setActiveTab: (value) => console.log(value),
};
