"use strict";

const lodash = require("lodash");

function toNestedDocument(field, value) {
  // REACHABILITY ANCHOR: affected API from CVE-2020-8203.
  // This training app calls the API, but upstream allowlisting prevents
  // arbitrary property paths. Reachability alone does not prove exploitation.
  return lodash.zipObjectDeep([field], [value]);
}

module.exports = { toNestedDocument };
