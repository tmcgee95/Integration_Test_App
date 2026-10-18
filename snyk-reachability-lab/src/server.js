"use strict";

// Local-only training server. NEVER expose this vulnerable-dependency lab publicly.
const http = require("node:http");
const { URL } = require("node:url");
const { buildPreferenceResponse } = require("./controllers/preferences-controller");
const { formatLabel } = require("./services/label-service");
const { renderWelcome } = require("./services/message-service");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 8192;

function send(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (!(req.headers["content-type"] || "").startsWith("application/json")) {
    const err = new Error("Content-Type must be application/json");
    err.statusCode = 415;
    throw err;
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) {
      const err = new Error("JSON body exceeds training limit");
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("JSON object expected");
    }
    return parsed;
  } catch (_) {
    const err = new Error("Invalid JSON object");
    err.statusCode = 400;
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { ok: true, lab: "snyk-reachability-lab" });
    }
    if (req.method === "POST" && url.pathname === "/api/preferences") {
      const input = await readJson(req);
      return send(res, 200, buildPreferenceResponse(input));
    }
    if (req.method === "GET" && url.pathname === "/api/label") {
      return send(res, 200, { label: formatLabel(url.searchParams.get("name") || "demo user") });
    }
    if (req.method === "GET" && url.pathname === "/api/welcome") {
      return send(res, 200, { message: renderWelcome(url.searchParams.get("name") || "developer") });
    }
    return send(res, 404, { error: "Not found" });
  } catch (err) {
    return send(res, err.statusCode || 400, { error: err.message });
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Training lab listening at http://${HOST}:${PORT}`);
    console.log("Do not expose this intentionally outdated dependency lab to a network.");
  });
}

module.exports = { server };
