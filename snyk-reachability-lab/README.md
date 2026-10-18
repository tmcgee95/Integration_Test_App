# Snyk → GitHub Reachability Lab

An intentionally small Node.js application for testing an **AWS AgentCore Harness vulnerability-reachability assistant**.

> **TRAINING ONLY — DO NOT DEPLOY.** Dependencies are intentionally vulnerable. The HTTP server binds to `127.0.0.1` only. See [SECURITY.md](SECURITY.md).

## What your agent should investigate

| Package pinned | Known advisory | Code situation | Correct nuance |
|---|---|---|---|
| `lodash@4.17.15` | CVE-2020-8203 / SNYK-JS-LODASH-567746 | `zipObjectDeep` called via several files | **Called / reachable**, but input property paths are strictly allowlisted; exploitability not demonstrated |
| `lodash@4.17.15` | CVE-2021-23337 / SNYK-JS-LODASH-1040724 | `template` called using a trusted, hardcoded template and fixed `variable` | **Called**, but the risky configuration is not controlled by users |
| `minimist@1.2.5` | CVE-2021-44906 / SNYK-JS-MINIMIST-2429795 | Installed but not imported | **No call observed** in the application's inspected source; do not claim proof of universal nonreachability |

Snyk may report **additional advisories**, especially as the database changes. The three cases above are intentionally constructed examples, not a guarantee of exactly three Snyk findings.

## 1. Extract the ZIP and install dependencies (PowerShell)

```powershell
cd "$HOME\Projects\snyk-reachability-lab"
npm.cmd install --ignore-scripts
npm.cmd run verify:deps
npm.cmd test
```

`npm install` creates `package-lock.json`; commit it along with the application to GitHub. The lock file is not included in the archive because it must be generated against the npm registry and was not fabricated.

## 2. Optionally run the local-only web app

```powershell
npm.cmd start
```

In another PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/health
Invoke-RestMethod 'http://127.0.0.1:3000/api/label?name=example_user'
Invoke-RestMethod 'http://127.0.0.1:3000/api/welcome?name=analyst'

$body = @{ field = 'preferences.theme'; value = 'dark' } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:3000/api/preferences `
  -Method Post -ContentType 'application/json' -Body $body
```

The preference route is traced through:

```
src/server.js (POST /api/preferences)
  -> src/controllers/preferences-controller.js
  -> src/services/preference-service.js
  -> src/lib/legacy-transform.js
  -> lodash.zipObjectDeep()
```

The preference-service allowlist is intentional: the lab demonstrates **function reachability without proving exploitability**.

## 3. Scan with Snyk Free CLI

```powershell
npm.cmd install -g snyk
snyk.cmd auth
New-Item -ItemType Directory -Force .\reports | Out-Null
snyk.cmd test --json-file-output=reports/snyk-results.json
```

**A Snyk exit code of 1 normally means vulnerabilities were found.** An exit code of 2 is a scan error. Snyk's Open Source CLI can write the JSON file even when vulnerabilities are found.

Normalize the resulting JSON for later analysis, if desired:

```powershell
node .\scripts\normalize-snyk.mjs .\reports\snyk-results.json .\reports\normalized-findings.json
```

`reports/` is gitignored. Do **not** push real scan exports unless you deliberately want them public.

## 4. Synthetic results for immediate Lambda testing (no Snyk needed)

The file `fixtures/mock-snyk-findings.json` is clearly labeled as a **synthetic** Snyk-shaped fixture. You can upload it to S3 today to verify your S3 reader Lambda, even without a completed scan:

```powershell
$bucket = 'YOUR_EXISTING_S3_BUCKET'
aws s3 cp .\fixtures\mock-snyk-findings.json "s3://$bucket/scans/latest.json" --region us-west-2
```

Once Snyk scanning works, replace the object with genuine output:

```powershell
aws s3 cp .\reports\snyk-results.json "s3://$bucket/scans/latest.json" --region us-west-2
```

The synthetic sample uses the same top-level `vulnerabilities` structure that your earlier `snyk-findings-reader` Lambda expects; it is **not** an authentic Snyk CLI report.

## 5. Push the lab to GitHub

Create a **new empty** repository named `snyk-reachability-lab` in GitHub first, then run:

```powershell
git init
git add .
git commit -m "Add intentionally vulnerable Snyk reachability lab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/snyk-reachability-lab.git
git push -u origin main
```

The remote URL is a placeholder: replace `YOUR_USERNAME`. Commit after `npm install` so GitHub and Snyk can resolve the same dependency lockfile.

## 6. Configure the GitHub Lambda

Set `GITHUB_REPO` to `YOUR_USERNAME/snyk-reachability-lab`, and `GITHUB_REF` to the output of:

```powershell
git rev-parse HEAD
```

A repository search tool should treat text search as a **candidate discovery mechanism** and confirm all evidence against the pinned commit. It may need to read files under `src/controllers/`, `src/services/`, and `src/lib/` to follow indirect call paths. The original GitHub Lambda example should support these directories.

Use [docs/agent-prompt.md](docs/agent-prompt.md) for the first AgentCore test, and [fixtures/expected-reachability.json](fixtures/expected-reachability.json) to compare the agent's conclusions to the intended source-code scenarios.

## Advisory references

- [Snyk: CVE-2020-8203 / lodash](https://security.snyk.io/vuln/SNYK-JS-LODASH-567746)
- [Snyk: CVE-2021-23337 / lodash](https://security.snyk.io/vuln/SNYK-JS-LODASH-1040724)
- [Snyk: CVE-2021-44906 / minimist](https://security.snyk.io/vuln/SNYK-JS-MINIMIST-2429795)
