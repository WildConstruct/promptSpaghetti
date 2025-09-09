/**
 * Comprehensive Test Suite for PrivacyFilter
 * Target Coverage: 80%+
 * Critical Security Component Testing
 */

import { PrivacyFilter } from './PrivacyFilter';

describe('PrivacyFilter', () => {
  let filter: PrivacyFilter;

  beforeEach(() => {
    filter = new PrivacyFilter();
  });

  describe('detectPII', () => {
    describe('Email Detection', () => {
      it('should detect and sanitize email addresses', () => {
        const result = filter.detectPII(
          'Contact me at john.doe@example.com for details'
        );
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('email');
        expect(result.sanitized).toBe('Contact me at [EMAIL] for details');
      });

      it('should detect multiple email addresses', () => {
        const result = filter.detectPII(
          'Primary: admin@company.com, Secondary: support@company.org'
        );
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('email');
        expect(result.sanitized).toBe('Primary: [EMAIL], Secondary: [EMAIL]');
      });

      it('should handle complex email formats', () => {
        const result = filter.detectPII('Email: user+tag@domain.co.uk');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Email: [EMAIL]');
      });
    });

    describe('SSN Detection', () => {
      it('should detect formatted SSN', () => {
        const result = filter.detectPII('SSN: 123-45-6789');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('ssn');
        expect(result.sanitized).toBe('SSN: [SSN]');
      });

      it('should detect unformatted SSN', () => {
        const result = filter.detectPII('SSN: 123456789');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('ssn');
        expect(result.sanitized).toBe('SSN: [SSN]');
      });
    });

    describe('Phone Number Detection', () => {
      it('should detect US phone numbers', () => {
        const result = filter.detectPII('Call me at 555-123-4567');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('phone');
        expect(result.sanitized).toBe('Call me at [PHONE]');
      });

      it('should detect phone with parentheses', () => {
        const result = filter.detectPII('Phone: (555) 987-6543');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Phone: [PHONE]');
      });

      it('should detect international format', () => {
        const result = filter.detectPII('International: +1-555-123-4567');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('International: [PHONE]');
      });
    });

    describe('Credit Card Detection', () => {
      it('should detect credit card numbers', () => {
        const result = filter.detectPII('Card: 4111 1111 1111 1111');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('creditCard');
        expect(result.sanitized).toBe('Card: [CREDIT_CARD]');
      });

      it('should detect cards with dashes', () => {
        const result = filter.detectPII('Payment: 4111-1111-1111-1111');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Payment: [CREDIT_CARD]');
      });

      it('should detect cards without spaces', () => {
        const result = filter.detectPII('Card: 4111111111111111');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Card: [CREDIT_CARD]');
      });
    });

    describe('IP Address Detection', () => {
      it('should detect IPv4 addresses', () => {
        const result = filter.detectPII('Server IP: 192.168.1.1');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('ipAddress');
        expect(result.sanitized).toBe('Server IP: [IP_ADDRESS]');
      });

      it('should detect multiple IPs', () => {
        const result = filter.detectPII('IPs: 10.0.0.1 and 172.16.0.1');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('IPs: [IP_ADDRESS] and [IP_ADDRESS]');
      });
    });

    describe('Name Detection', () => {
      it('should detect formal names with titles', () => {
        const result = filter.detectPII('Contact Mr. John Smith');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('name');
        expect(result.sanitized).toBe('Contact [NAME]');
      });

      it('should detect various titles', () => {
        const result = filter.detectPII('Dr. Jane Doe and Prof. Bob Johnson');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toContain('[NAME]');
      });
    });

    describe('Address Detection', () => {
      it('should detect street addresses', () => {
        const result = filter.detectPII('Address: 123 Main Street');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('address');
        expect(result.sanitized).toBe('Address: [ADDRESS]');
      });

      it('should detect various street types', () => {
        const addresses = [
          '456 Oak Avenue',
          '789 Pine Road',
          '321 Elm Boulevard',
          '654 Maple Lane'
        ];
        addresses.forEach(addr => {
          const result = filter.detectPII(addr);
          expect(result.hasPII).toBe(true);
          expect(result.sanitized).toBe('[ADDRESS]');
        });
      });
    });

    describe('Date of Birth Detection', () => {
      it('should detect dates in MM/DD/YYYY format', () => {
        const result = filter.detectPII('DOB: 01/15/1990');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('dob');
        expect(result.sanitized).toBe('DOB: [DOB]');
      });

      it('should detect dates in YYYY-MM-DD format', () => {
        const result = filter.detectPII('Born: 1990-01-15');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Born: [DOB]');
      });
    });

    describe('Bank Account Detection', () => {
      it('should detect bank account numbers', () => {
        const result = filter.detectPII('Account: 12345678');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('bankAccount');
        expect(result.sanitized).toBe('Account: [BANK_ACCOUNT]');
      });

      it('should detect longer account numbers', () => {
        const result = filter.detectPII('Account: 12345678901234567');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Account: [BANK_ACCOUNT]');
      });
    });

    describe('Passport Detection', () => {
      it('should detect passport numbers', () => {
        const result = filter.detectPII('Passport: US12345678');
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('passport');
        expect(result.sanitized).toBe('Passport: [PASSPORT]');
      });

      it('should detect single letter passports', () => {
        const result = filter.detectPII('Passport: C1234567');
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Passport: [PASSPORT]');
      });
    });

    describe('Multiple PII Types', () => {
      it('should detect and sanitize multiple PII types', () => {
        const text =
          'Email: test@example.com, Phone: 555-1234, SSN: 123-45-6789';
        const result = filter.detectPII(text);
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes).toContain('email');
        expect(result.detectedTypes).toContain('phone');
        expect(result.detectedTypes).toContain('ssn');
        expect(result.sanitized).toBe(
          'Email: [EMAIL], Phone: [PHONE], SSN: [SSN]'
        );
      });

      it('should handle complex documents', () => {
        const text = `
          Personal Information:
          Name: Mr. John Smith
          Email: john.smith@example.com
          Phone: (555) 123-4567
          SSN: 123-45-6789
          Address: 123 Main Street
          DOB: 01/15/1990
        `;
        const result = filter.detectPII(text);
        expect(result.hasPII).toBe(true);
        expect(result.detectedTypes.length).toBeGreaterThan(4);
        expect(result.sanitized).not.toContain('john.smith@example.com');
        expect(result.sanitized).not.toContain('555) 123-4567');
        expect(result.sanitized).not.toContain('123-45-6789');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty strings', () => {
        const result = filter.detectPII('');
        expect(result.hasPII).toBe(false);
        expect(result.detectedTypes).toEqual([]);
        expect(result.sanitized).toBe('');
      });

      it('should handle text with no PII', () => {
        const result = filter.detectPII(
          'This is a normal message with no sensitive data'
        );
        expect(result.hasPII).toBe(false);
        expect(result.detectedTypes).toEqual([]);
        expect(result.sanitized).toBe(
          'This is a normal message with no sensitive data'
        );
      });

      it('should handle special characters', () => {
        const text = 'Special chars: !@#$%^&*() with email@test.com';
        const result = filter.detectPII(text);
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Special chars: !@#$%^&*() with [EMAIL]');
      });

      it('should handle newlines and tabs', () => {
        const text = 'Line 1\nEmail:\ttest@example.com\nLine 3';
        const result = filter.detectPII(text);
        expect(result.hasPII).toBe(true);
        expect(result.sanitized).toBe('Line 1\nEmail:\t[EMAIL]\nLine 3');
      });
    });
  });

  describe('filterRequest', () => {
    it('should filter request text', () => {
      const filtered = filter.filterRequest('Send email to admin@example.com');
      expect(filtered).toBe('Send email to [EMAIL]');
    });

    it('should handle null input', () => {
      const filtered = filter.filterRequest(null as any);
      expect(filtered).toBe('');
    });

    it('should handle undefined input', () => {
      const filtered = filter.filterRequest(undefined as any);
      expect(filtered).toBe('');
    });
  });

  describe('filterResponse', () => {
    it('should filter response text', () => {
      const filtered = filter.filterResponse(
        'Response contains SSN: 123-45-6789'
      );
      expect(filtered).toBe('Response contains SSN: [SSN]');
    });

    it('should preserve JSON structure', () => {
      const json = '{"email": "test@example.com", "name": "John"}';
      const filtered = filter.filterResponse(json);
      expect(filtered).toContain('[EMAIL]');
      expect(() => JSON.parse(filtered)).not.toThrow();
    });
  });

  describe('containsBlockedContent', () => {
    it('should detect blocked content', () => {
      // Note: actual offensive terms would be in the blocklist
      const hasBlocked = filter.containsBlockedContent('offensive_term_1');
      expect(hasBlocked).toBe(true);
    });

    it('should return false for clean content', () => {
      const hasBlocked = filter.containsBlockedContent('This is clean content');
      expect(hasBlocked).toBe(false);
    });

    it('should be case insensitive', () => {
      const hasBlocked = filter.containsBlockedContent('OFFENSIVE_TERM_1');
      expect(hasBlocked).toBe(true);
    });
  });

  describe('addToBlocklist', () => {
    it('should add terms to blocklist', () => {
      filter.addToBlocklist('newbadword');
      const hasBlocked = filter.containsBlockedContent(
        'This contains newbadword'
      );
      expect(hasBlocked).toBe(true);
    });

    it('should add multiple terms', () => {
      filter.addToBlocklist('term1', 'term2', 'term3');
      expect(filter.containsBlockedContent('term1')).toBe(true);
      expect(filter.containsBlockedContent('term2')).toBe(true);
      expect(filter.containsBlockedContent('term3')).toBe(true);
    });
  });

  describe('removeFromBlocklist', () => {
    it('should remove terms from blocklist', () => {
      filter.addToBlocklist('removable');
      expect(filter.containsBlockedContent('removable')).toBe(true);
      filter.removeFromBlocklist('removable');
      expect(filter.containsBlockedContent('removable')).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle large texts efficiently', () => {
      const largeText = 'test@example.com '.repeat(1000);
      const startTime = Date.now();
      filter.detectPII(largeText);
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should cache pattern matches', () => {
      const text = 'email@test.com';

      // First call
      filter.detectPII(text);

      // Subsequent calls should be faster
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        filter.detectPII(text);
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
