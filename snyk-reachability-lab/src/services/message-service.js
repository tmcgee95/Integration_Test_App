"use strict";

const lodash = require("lodash");

// CVE-2021-23337 concerns lodash.template() with unsafe options.variable
// (and some prototype-pollution conditions). This demo uses a trusted,
// hard-coded template and a fixed `variable` option.
const trustedWelcomeTemplate = lodash.template("Welcome, <%- data.name %>!", {
  variable: "data"
});

function renderWelcome(name) {
  return trustedWelcomeTemplate({ name: String(name).slice(0, 80) });
}

module.exports = { renderWelcome };
