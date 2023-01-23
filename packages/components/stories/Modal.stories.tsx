import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import SingleActionModal from "../components/SingleActionModal";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Example/Modal",
  component: SingleActionModal,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof SingleActionModal>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SingleActionModal> = (args) => <SingleActionModal {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  title: "Test Modal",
  content: "This is a modal to show our Single Action Modal in Story book",
  visible: true,
  onConfirm: { label: "Close", onClick: () => console.log("close") },
};

// export const Secondary = Template.bind({});
// Secondary.args = {
// 	label: 'Button',
// };

// export const Large = Template.bind({});
// Large.args = {
// 	size: 'large',
// 	label: 'Button',
// };

// export const Small = Template.bind({});
// Small.args = {
// 	size: 'small',
// 	label: 'Button',
// };
