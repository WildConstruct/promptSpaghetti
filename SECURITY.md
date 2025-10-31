# Security Policy

## Supported Versions

Currently, we provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of Prompt Spaghetti seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue for security vulnerabilities
- Post details on social media or public forums
- Exploit the vulnerability beyond what's necessary to demonstrate it

### Please DO:

- **Email us directly** at: security@promptspaghetti.com
- **Include** in your report:
  - Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
  - Affected component(s) and version(s)
  - Step-by-step instructions to reproduce
  - Proof-of-concept or exploit code (if available)
  - Impact assessment and potential attack scenarios
  - Your contact information for follow-up

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Initial Assessment**: Within 5 business days, we'll provide an initial assessment
- **Regular Updates**: We'll keep you informed about our progress
- **Credit**: We'll credit you in our release notes (unless you prefer to remain anonymous)
- **Disclosure Timeline**: We follow a 90-day disclosure timeline

## Security Measures

### Current Security Features

- **Input Validation**: All LLM inputs are sanitized to prevent prompt injection
- **PII Protection**: Optional PII masking in workspace settings
- **Rate Limiting**: API endpoints have rate limiting to prevent abuse
- **Authentication**: Secure authentication via Supabase
- **CORS Configuration**: Strict CORS policies in production
- **Dependency Scanning**: Regular automated dependency updates via Dependabot
- **Code Review**: Security-sensitive changes require review from security team

### Known Security Considerations

#### LLM Parser (Story 2.6)

- Prompts are sanitized to remove injection patterns
- Zod validation on all LLM responses
- Token budget limits to prevent resource exhaustion
- Output safety validation to block dangerous patterns

#### Node Execution Engine

- Sandboxed execution environment
- No eval() or Function() constructor usage
- Strict type validation on all inputs
- Protection against prototype pollution

#### File Upload/Import

- File type validation
- Size limits enforced
- Content scanning for malicious patterns
- Quarantine for suspicious files

## Security Checklist for Contributors

Before submitting a PR, please ensure:

- [ ] No hardcoded secrets or API keys
- [ ] All user inputs are validated and sanitized
- [ ] SQL queries use parameterized statements
- [ ] File uploads are properly validated
- [ ] Authentication checks on all protected endpoints
- [ ] Rate limiting on resource-intensive operations
- [ ] Proper error handling (no stack traces in production)
- [ ] Dependencies are up-to-date and vulnerability-free
- [ ] Security tests pass (`npm run test:security`)

## Third-Party Security

### Dependencies

- Regular Dependabot scans for known vulnerabilities
- Weekly dependency updates reviewed by security team
- High/Critical vulnerabilities addressed within 48 hours

### External Services

- **OpenRouter API**: TLS encryption for all LLM calls
- **Supabase**: SOC 2 compliant authentication service
- **GitHub Actions**: Secrets stored securely, never logged

## Incident Response

In case of a security incident:

1. **Containment**: Immediate action to limit damage
2. **Assessment**: Determine scope and impact
3. **Remediation**: Fix vulnerability and deploy patches
4. **Communication**: Notify affected users within 72 hours
5. **Post-Mortem**: Document lessons learned

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)

## Bug Bounty Program

We currently don't have a formal bug bounty program, but we deeply appreciate security researchers who responsibly disclose vulnerabilities. We're happy to:

- Acknowledge your contribution publicly
- Provide a letter of appreciation
- Consider feature requests from security contributors

## Contact

Security Team Email: security@promptspaghetti.com
PGP Key: [Link to public key]

---

_This security policy is reviewed quarterly and updated as needed._
_Last updated: January 2025_
