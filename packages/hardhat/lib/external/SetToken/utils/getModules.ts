import { Configuration } from "../Configuration";

export const getModules = (configuration: Configuration) => {
  const {
    core: { modules },
  } = configuration;
  return Object.keys(modules).map((moduleName) => modules[moduleName]);
};
