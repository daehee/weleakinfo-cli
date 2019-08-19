"use strict";

require("dotenv").config();
var inquirer = require("inquirer");
const axios = require("axios");

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

const headers = {
  "User-Agent": "weleakinfo-cli",
  // Authorization: Bearer $key
  Authorization: `Bearer ${options.keys.public}`
  // Accepts application/x-www-form-urlencoded
};

async function search(type, query) {
  try {
    // If private API key exists, switch the url to private endpoint
    // private API is POST; public API is GET

    const url = (type, query) => {
      if (options.keys.private) {
        return `${WELEAKINFO_PRIVATE_BASE}/${type}/${query}`;
      }

      return `${WELEAKINFO_PUBLIC_BASE}/${type}/${query}?details=true`;
    };

    let response = {};

    if (options.keys.private) {
      headers.Authorization = `Bearer ${options.keys.private}`;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      response = await axios.post(url(type, query), { headers });
    } else {
      response = await axios.get(url(type, query), { headers });
    }

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {};
