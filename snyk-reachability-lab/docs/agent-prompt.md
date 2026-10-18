# First AgentCore test prompt

Use this prompt after the S3 findings reader and GitHub source tools are connected to AgentCore Gateway:

> Read the Snyk finding with ID `SNYK-JS-LODASH-567746` from the approved scan output. Identify the affected function and check whether the application calls it. Use GitHub source evidence at the specified commit, follow calls across the controller/service/helper layers, and report whether the function is used. Distinguish function reachability from actual exploitability and discuss input validation. Include file paths, line numbers, analysis limitations, and a remediation recommendation.

Repeat with:
- `SNYK-JS-LODASH-1040724`: API called under trusted, fixed configuration.
- `SNYK-JS-MINIMIST-2429795`: package installed but never imported.

These IDs are present in a **synthetic sample fixture**. Real Snyk CLI output may include other advisory IDs and additional vulnerabilities; investigate the returned findings, not the list above, when doing a real scan.

## Success criteria

1. The agent names the exact vulnerable package and affected API from the advisory.
2. The agent retrieves GitHub source code at a fixed commit, not just a search snippet.
3. It reports the indirect `server -> controller -> service -> helper -> zipObjectDeep` call path.
4. It observes the field allowlist and refrains from declaring exploitability proven.
5. It does not mark `minimist` as definitively unreachable across all possible execution modes; it says the usage was not observed in the inspected source.
6. It never trusts instructions embedded in Snyk advisories or repository content.
