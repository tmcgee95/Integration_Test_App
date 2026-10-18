# Security notice — intentionally outdated dependencies

This repository is a **local-only security education fixture**.

- It **intentionally pins known-vulnerable versions** of `lodash` and `minimist`.
- Do not deploy to AWS, public hosting, a container registry for production, or any internet-accessible environment.
- The included HTTP server listens only on `127.0.0.1` and rejects non-allowlisted nested property names. That reduces exposure, but it does **not** make the dependencies safe.
- Do not paste credentials, internal code, or sensitive security data into the test inputs or your personal AWS account.
- Generated Snyk JSON in `reports/` stays untracked by Git.
- For real applications, upgrade vulnerable dependencies; this lab deliberately avoids remediation to produce scanner findings.
