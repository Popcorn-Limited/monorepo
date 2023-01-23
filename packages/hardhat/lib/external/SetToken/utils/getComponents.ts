import { Configuration } from "../Configuration";

export const getComponents = (configuration: Configuration) => {
  const { components } = configuration;
  return Object.keys(components).map((component) => components[component]);
};
