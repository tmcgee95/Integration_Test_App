"use strict";

const lodash = require("lodash");

function formatLabel(input) {
  // Same outdated library, but this is not the affected function in CVE-2020-8203.
  return lodash.startCase(String(input).slice(0, 80));
}

module.exports = { formatLabel };
