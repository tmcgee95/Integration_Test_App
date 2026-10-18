"use strict";

const { buildPreferenceDocument } = require("../services/preference-service");

function buildPreferenceResponse(payload) {
  // HTTP request -> controller -> service -> legacy helper -> lodash.zipObjectDeep.
  const document = buildPreferenceDocument(payload);
  return { stored: false, preview: document };
}

module.exports = { buildPreferenceResponse };
