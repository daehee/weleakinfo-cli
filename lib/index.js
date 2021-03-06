#!/usr/bin/env node
"use strict";

require("dotenv").config();
var inquirer = require("inquirer");
const axios = require("axios");
const qs = require("querystring");
const debug = require("debug")("weleakinfo");

const WELEAKINFO_PUBLIC_BASE = "https://api.weleakinfo.com/v3/public";
const WELEAKINFO_PRIVATE_BASE = "https://api.weleakinfo.com/v3";

const options = {
  keys: {
    public: process.env.WELEAKINFO_PUBLIC,
    private: process.env.WELEAKINFO_PRIVATE
  }
};

const searchPrompt = [
  {
    type: "list",
    name: "type",
    message: "What would you like to search?",
    choices: [
      "username",
      "email",
      "password",
      "hash",
      "ip",
      "name",
      "phone",
      "domain"
    ],
    filter: function(val) {
      return val.toLowerCase();
    }
  },
  {
    type: "input",
    name: "query",
    message: "Enter your query:"
  }
];

const main = () => {
  inquirer.prompt(searchPrompt).then(async answers => {
    console.log(
      `\n[*] Searching for "${answers.query}" in ${answers.type} database`
    );

    const results = await search(answers.type, answers.query);

    console.log(JSON.stringify(results, null, "  "));
    console.log("\n");

    if (options.keys.private) {
      askExport(results);
    }
  });
};

const exportPrompt = {
  type: "confirm",
  name: "export",
  message: "Export these results?",
  default: false
};

const askExport = data => {
  inquirer.prompt(exportPrompt).then(async answers => {
    try {
      // Abort program if no export
      if (!answers.export) {
        console.log(`[*] Exiting...`);
        return;
      }

      // JSON to CSV export with papa parse module
      const fsp = require("fs").promises;
      const path = require("path");
      const Papa = require("papaparse");
      // Export file to process.cwd() to handle case of running as bin
      const exportFileName = `weleakinfo_${Math.floor(Date.now() / 1000)}.csv`;
      const exportFilePath = path.join(process.cwd(), exportFileName);
      // Promisify papa parse's unparse() for async/await usage
      const unparsePromise = data => {
        return new Promise(resolve => {
          resolve(Papa.unparse(data, papaConfig));
        });
      };

      // Configure papa parse to use specific columns as headings
      const papaConfig = {
        header: true,
        columns: [
          "Database",
          "Username",
          "Email",
          "Password",
          "Hash",
          "Salt",
          "First Name",
          "First Last",
          "Registered IP Address"
        ]
      };
      // Unparse JSON to CSV data
      const fileContent = await unparsePromise(data.Data);
      // Write unparsed data to file using fs promise version of writeFile
      await fsp.writeFile(exportFilePath, fileContent);

      console.log(`\n[+] Exported results to ${exportFileName}!\n`);
    } catch (error) {
      debug(error);
    }
  });
};

const search = async (type, query) => {
  try {
    let response = {};

    if (options.keys.private) {
      // Private API is POST to /search
      const requestBody = {
        type: type,
        query: query
      };

      debug("[~] Calling Private API Endpoint");
      response = await axios({
        method: "post",
        url: `${WELEAKINFO_PRIVATE_BASE}/search`,
        headers: {
          Authorization: `Bearer ${options.keys.private}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "weleakinfo-cli"
        },
        data: qs.stringify(requestBody)
      });

      console.log("\n[*] Results from WeLeakInfo Private API:\n");
    } else {
      // Public API is GET to /public/{type}/{query}
      debug("[~] Calling Public API Endpoint");
      response = await axios({
        method: "get",
        url: `${WELEAKINFO_PUBLIC_BASE}/${type}/${query}?details=true`,
        params: {
          details: "true"
        },
        headers: {
          Authorization: `Bearer ${options.keys.public}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "weleakinfo-cli"
        }
      });

      console.log("\n[*] Results from WeLeakInfo Public API:\n");
    }

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

main();
