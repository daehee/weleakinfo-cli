"use strict";

require("dotenv").config();
var inquirer = require("inquirer");
const axios = require("axios");
const qs = require("querystring");

const WELEAKINFO_PUBLIC_BASE = "https://api.weleakinfo.com/v3/public";
const WELEAKINFO_PRIVATE_BASE = "https://api.weleakinfo.com/v3";

const options = {
  keys: {
    public: process.env.WELEAKINFO_PUBLIC,
    private: process.env.WELEAKINFO_PRIVATE
  }
};

var questions = [
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

inquirer.prompt(questions).then(async answers => {
  console.log(
    `\n[*] Searching for "${answers.query}" in ${answers.type} database`
  );
  console.log("\n[*] Results from WeLeakInfo API:");

  const results = await search(answers.type, answers.query);
  // console.log(JSON.stringify(results, null, "  "));
  console.table(results.Data);
});

async function search(type, query) {
  try {
    let response = {};

    if (options.keys.private) {
      // Private API is POST to /search
      const requestBody = {
        type: type,
        query: query
      };

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
    } else {
      // Public API is GET to /public/{type}/{query}
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
    }

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {};
