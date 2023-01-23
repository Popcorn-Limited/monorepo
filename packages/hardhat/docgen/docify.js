/**
 * By default this script will compile all contracts using solc 0.7.6
 * If you want to specify a solc version for a contract, please do the followings:
 * 1. add the specified version of solc to package.json. For example: "solc-0.7.6": "npm:solc@0.7.6",
 * 2. run npm install / yarn install,
 * 3. insert `// Docgen-SOLC: x.x.x` to the contract source code. See contracts/core/defi/Pool.sol for a example.
 */

const fs = require("fs");
const path = require("path");
const spawnSync = require("child_process").spawnSync;
const { exec } = require("child_process");

const DEFAULT_SOLC_VERSION = "0.8.0";
const GLOBAL_NODE_DIR = path.resolve(__dirname, "../../../node_modules");
const NODE_DIR = path.resolve(__dirname, "../node_modules");
const INPUT_DIR = path.resolve(__dirname, "../contracts");
const CONFIG_DIR = path.resolve(__dirname, "../docgen");
const OUTPUT_DIR = path.resolve(__dirname, "../docgen/docs");
const OUTPUT_IMAGES_DIR = path.resolve(__dirname, "../docgen/docs/images");
const SUMMARY_FILE = path.resolve(__dirname, "../docgen/SUMMARY.md");
const EXCLUDE_FILE = path.resolve(__dirname, "../docgen/exclude.txt");
const GITBOOK_FILE = path.resolve(__dirname, "../docgen/.gitbook.yaml");
const TOC_HELPER_FILE = path.resolve(__dirname, "./toc_format.js");

const excludeList = lines(EXCLUDE_FILE).map((line) => INPUT_DIR + "/" + line);
const relativePath = path.relative(path.dirname(SUMMARY_FILE), OUTPUT_DIR);

let postCheckPathNameList = [];
let sourcePathNameList = [];
let solcVersionDict = {};

function lines(pathName) {
  return fs
    .readFileSync(pathName, { encoding: "utf8" })
    .split("\r")
    .join("")
    .split("\n");
}

async function scan(pathName, indentation) {
  if (!excludeList.includes(pathName)) {
    if (fs.lstatSync(pathName).isDirectory()) {
      fs.appendFileSync(
        SUMMARY_FILE,
        indentation + "* " + path.basename(pathName) + "\n"
      );

      for (const fileName of fs.readdirSync(pathName))
        scan(pathName + "/" + fileName, indentation + "  ");
    } else if (pathName.endsWith(".sol")) {
      const solcVersion = getDocgenSolcVersion(pathName);

      if (!(solcVersion in solcVersionDict)) {
        solcVersionDict[solcVersion] = {
          "included-pathname": [],
          "excluded-pathname": excludeList,
        };
      }
      solcVersionDict[solcVersion]["included-pathname"].push(pathName);

      const text = path.basename(pathName).slice(0, -4);
      const link = pathName.slice(INPUT_DIR.length, -4);
      fs.appendFileSync(
        SUMMARY_FILE,
        indentation + "* [" + text + "](" + relativePath + link + ".md)\n"
      );
      postCheckPathNameList.push(
        CONFIG_DIR + "/" + relativePath + link + ".md"
      );
      sourcePathNameList.push(pathName);
    }
  }
}

function fix(pathName) {
  if (fs.lstatSync(pathName).isDirectory()) {
    for (const fileName of fs.readdirSync(pathName))
      fix(pathName + "/" + fileName);
  } else if (pathName.endsWith(".md")) {
    fs.writeFileSync(
      pathName,
      lines(pathName)
        .filter((line) => line.trim().length > 0)
        .join("\n") + "\n"
    );
  }
}

function checkDir(pathName) {
  if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName, {
      recursive: true,
    });
  }
}

function generateGraphs(sourcePathNameList) {
  for (const sourcePathName of sourcePathNameList) {
    const contractName = path.basename(sourcePathName).slice(0, -4);
    const inputContractPathName = sourcePathName;
    const outputGraphPathName =
      OUTPUT_IMAGES_DIR + `/${contractName}_dependency_graph.png`;
    const outputInheritancePathName =
      OUTPUT_IMAGES_DIR + `/${contractName}_inheritance_graph.png`;
    const suryaPath = GLOBAL_NODE_DIR + "/surya/bin/surya";
    const dotPath = "/usr/bin/dot";

    exec(
      `${suryaPath} graph ${inputContractPathName} | ${dotPath} -Tpng > ${outputGraphPathName}`,
      (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(`exec error: ${err}`);
        }
      }
    );
    exec(
      `${suryaPath} inheritance ${inputContractPathName} | ${dotPath} -Tpng > ${outputInheritancePathName}`,
      (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(`exec error: ${err}`);
        }
      }
    );
  }
}

function insertLinebreak(docPathNameList) {
  const re = /^\[\[linebreak\]\]/gm;
  for (const docPathName of docPathNameList) {
    let fileContent = fs.readFileSync(docPathName, "utf8");
    let insertedFileContent = fileContent.replace(re, "");
    fs.writeFileSync(docPathName, insertedFileContent, "utf8");
  }
}

function getDocgenSolcVersion(filePath) {
  for (const line of lines(filePath)) {
    if (line.startsWith("//") && line.includes("Docgen-SOLC")) {
      return line.match(/(\d+.\d+.\d+)/)[1];
    }
  }
  return DEFAULT_SOLC_VERSION;
}

checkDir(OUTPUT_IMAGES_DIR);

fs.writeFileSync(SUMMARY_FILE, "# Summary\n");
fs.writeFileSync(GITBOOK_FILE, "root: ./\n");
fs.appendFileSync(GITBOOK_FILE, "structure:\n");
fs.appendFileSync(GITBOOK_FILE, "  readme: README.md\n");
fs.appendFileSync(GITBOOK_FILE, "  summary: SUMMARY.md\n");

scan(INPUT_DIR, "");
for (let [thisSolcVersion, thisObj] of Object.entries(solcVersionDict)) {
  let excludeListPathName = [...thisObj["excluded-pathname"]];
  for (const [thatSolcVersion, thatObj] of Object.entries(solcVersionDict)) {
    if (thisSolcVersion === thatSolcVersion) continue;
    excludeListPathName.push(...thatObj["included-pathname"]);
  }
  if (thisSolcVersion.includes("0.8")) thisSolcVersion = "0.8.17";

  const args = [
    // GLOBAL_NODE_DIR + "/@anthonymartin/solidity-docgen/dist/cli.js",
    GLOBAL_NODE_DIR + "/@soptq/solidity-docgen/dist/cli.js",
    "--input=" + INPUT_DIR,
    "--output=" + OUTPUT_DIR,
    "--templates=" + CONFIG_DIR,
    "--exclude=" + excludeListPathName.toString(),
    "--solc-module=" + GLOBAL_NODE_DIR + "/solc-" + thisSolcVersion,
    "--solc-settings=" +
      JSON.stringify({ optimizer: { enabled: true, runs: 200 } }),
    "--output-structure=" + "contracts",
    "--helpers=" + TOC_HELPER_FILE,
  ];

  const result = spawnSync("node", args, {
    stdio: ["inherit", "inherit", "pipe"],
  });

  if (result.stderr.length > 0) throw new Error(result.stderr);
}

fix(OUTPUT_DIR);

generateGraphs(sourcePathNameList);

insertLinebreak(postCheckPathNameList);
