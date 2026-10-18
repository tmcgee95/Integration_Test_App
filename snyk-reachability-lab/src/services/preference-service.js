"use strict";

const { toNestedDocument } = require("../lib/legacy-transform");

const ALLOWED_FIELDS = new Set([
  "profile.displayName",
  "preferences.theme",
  "preferences.notifications"
]);

function buildPreferenceDocument(payload) {
  const { field, value } = payload || {};
  // Intentional mitigation: only fixed nested paths are permitted, even though
  // a vulnerable dependency version and affected function are used below.
  if (typeof field !== "string" || !ALLOWED_FIELDS.has(field)) {
    const err = new Error("Field is not in the approved training allowlist");
    err.statusCode = 400;
    throw err;
  }
  if (typeof value !== "string" || value.length > 120) {
    const err = new Error("Value must be a string of at most 120 characters");
    err.statusCode = 400;
    throw err;
  }
  return toNestedDocument(field, value);
}

module.exports = { buildPreferenceDocument, ALLOWED_FIELDS };
