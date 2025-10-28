/**
 * Simple privacy filter to redact common PII patterns.
 * This is a best-effort mask suitable for demo/staging; upgrade as needed.
 */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Very loose international phone pattern (digits, spaces, symbols)
const PHONE_RE =
  /(?:(?:\+?\d{1,3}[\s-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s-]?)?\d{3,}[\s-]?\d{2,}[\s-]?\d{2,}/g;
// Key-like secrets (e.g., sk-..., api_key=..., token: ...)
const SECRET_RE =
  /(sk|pk|rk|token|bearer|api[_-]?key)\s*[:=]\s*[A-Za-z0-9\-_]{10,}/gi;
// Credit card (basic luhn-like length pattern, not strict)
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;

export function redactPII(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(EMAIL_RE, '[REDACTED_EMAIL]')
    .replace(SECRET_RE, '[REDACTED_SECRET]')
    .replace(CARD_RE, '[REDACTED_CARD]')
    .replace(PHONE_RE, m => m.replace(/\d/g, 'x'));
}
