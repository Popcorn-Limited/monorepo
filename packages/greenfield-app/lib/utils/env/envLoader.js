const findConfig = require("find-config");
require("dotenv").config({ path: findConfig(".env") });
require("dotenv").config({ path: "../../.environment" });

if (process.env.ENV) {
  require("dotenv").config({ path: findConfig(`.env.${process.env.ENV}`) });
}
