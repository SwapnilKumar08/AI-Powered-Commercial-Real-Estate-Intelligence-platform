# Security policy

Report vulnerabilities privately to the repository maintainers. Do not include
credentials, personal data, licensed market data or exploitable production
details in a public issue.

Production controls must include:

- secrets in a managed vault rather than source control;
- tenant and row-level authorisation;
- malware scanning and content-type validation for uploads;
- encryption in transit and at rest;
- immutable evidence hashes and access logs;
- retention and deletion policies for personal data;
- prompt-injection filtering and citation validation;
- human approval and suppression checks for outreach;
- model and retrieval evaluations before release.

This demonstration does not ship authentication or a multi-tenant
authorisation layer. Add those controls before exposing customer data.

