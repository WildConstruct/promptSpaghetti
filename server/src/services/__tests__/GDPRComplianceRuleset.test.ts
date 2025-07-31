/**
 * GDPR Compliance Ruleset Test Suite
 *
 * Comprehensive tests for GDPR compliance rules covering all major articles
 * and ensuring proper rule generation, categorization, and configuration
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { GDPRComplianceRuleset, GDPRRulesetConfig } from '../GDPRComplianceRuleset';
import { RuleCategory, RulePriority, RuleSeverity } from '../ComplianceRuleEngine';

describe('GDPRComplianceRuleset', () => {
  let ruleset: GDPRComplianceRuleset;
  let config: GDPRRulesetConfig;

  beforeEach(() => {
    config = {
      jurisdiction: 'EU',
      dataSubjectRights: true,
      consentManagement: true,
      dataMinimization: true,
      purposeLimitation: true,
      retentionLimits: true,
      transferRestrictions: true,
      breachNotification: true,
      dpoRequirements: true,
      recordKeeping: true,
      impactAssessments: true,
    };
    ruleset = new GDPRComplianceRuleset(config);
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const defaultRuleset = new GDPRComplianceRuleset();
      const defaultConfig = defaultRuleset.getConfig();

      expect(defaultConfig.jurisdiction).toBe('EU');
      expect(defaultConfig.dataSubjectRights).toBe(true);
      expect(defaultConfig.consentManagement).toBe(true);
      expect(defaultConfig.dataMinimization).toBe(true);
    });

    test('should initialize with custom configuration', () => {
      const customConfig: Partial<GDPRRulesetConfig> = {
        jurisdiction: 'UK',
        dataSubjectRights: false,
        transferRestrictions: false,
      };

      const customRuleset = new GDPRComplianceRuleset(customConfig);
      const actualConfig = customRuleset.getConfig();

      expect(actualConfig.jurisdiction).toBe('UK');
      expect(actualConfig.dataSubjectRights).toBe(false);
      expect(actualConfig.transferRestrictions).toBe(false);
      // Should still have defaults for unspecified values
      expect(actualConfig.consentManagement).toBe(true);
    });

    test('should generate rules automatically on initialization', () => {
      const rules = ruleset.getAllRules();
      expect(rules.length).toBeGreaterThan(0);

      // Should have rules for major GDPR articles
      const ruleIds = rules.map(rule => rule.ruleId);
      expect(ruleIds).toContain('GDPR-ART5-PURPOSE-LIMITATION');
      expect(ruleIds).toContain('GDPR-ART6-LAWFUL-BASIS');
      expect(ruleIds).toContain('GDPR-ART7-VALID-CONSENT');
      expect(ruleIds).toContain('GDPR-ART33-BREACH-NOTIFICATION-SA');
    });
  });

  describe('Article 5 - Data Processing Principles', () => {
    test('should have purpose limitation rule', () => {
      const rule = ruleset.getRule('GDPR-ART5-PURPOSE-LIMITATION');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Purpose Limitation Compliance');
      expect(rule!.framework).toBe('GDPR');
      expect(rule!.category).toBe('DATA_PROTECTION');
      expect(rule!.priority).toBe('HIGH');
      expect(rule!.status).toBe('ACTIVE');
    });

    test('should have data minimization rule', () => {
      const rule = ruleset.getRule('GDPR-ART5-DATA-MINIMIZATION');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Data Minimization Compliance');
      expect(rule!.severity).toBe('WARNING');
      expect(rule!.subcategory).toBe('data_minimization');
    });

    test('should have storage limitation rule', () => {
      const rule = ruleset.getRule('GDPR-ART5-STORAGE-LIMITATION');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Storage Limitation Compliance');
      expect(rule!.category).toBe('RETENTION');
      expect(rule!.priority).toBe('CRITICAL');
      expect(rule!.severity).toBe('BLOCKING');
    });

    test('should have appropriate conditions for data processing principles', () => {
      const purposeRule = ruleset.getRule('GDPR-ART5-PURPOSE-LIMITATION');
      const minimizationRule = ruleset.getRule('GDPR-ART5-DATA-MINIMIZATION');
      const storageRule = ruleset.getRule('GDPR-ART5-STORAGE-LIMITATION');

      expect(purposeRule!.conditions).toHaveLength(1);
      expect(purposeRule!.conditions[0].type).toBe('CUSTOM');

      expect(minimizationRule!.conditions).toHaveLength(1);
      expect(minimizationRule!.conditions[0].negated).toBe(true);

      expect(storageRule!.conditions).toHaveLength(1);
      expect(storageRule!.conditions[0].type).toBe('TIME_BASED');
    });
  });

  describe('Article 6 - Lawful Basis', () => {
    test('should have lawful basis validation rule', () => {
      const rule = ruleset.getRule('GDPR-ART6-LAWFUL-BASIS');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Lawful Basis Validation');
      expect(rule!.priority).toBe('CRITICAL');
      expect(rule!.severity).toBe('BLOCKING');
    });

    test('should check for valid lawful basis', () => {
      const rule = ruleset.getRule('GDPR-ART6-LAWFUL-BASIS');

      expect(rule!.conditions).toHaveLength(1);
      expect(rule!.conditions[0].operator).toBe('IN');
      expect(rule!.conditions[0].negated).toBe(true); // Should fail if NOT in valid basis list
    });

    test('should block processing without lawful basis', () => {
      const rule = ruleset.getRule('GDPR-ART6-LAWFUL-BASIS');

      expect(rule!.actions).toHaveLength(1);
      expect(rule!.actions[0].type).toBe('DENY');
    });
  });

  describe('Article 7 - Consent Management', () => {
    test('should have valid consent requirements rule', () => {
      const rule = ruleset.getRule('GDPR-ART7-VALID-CONSENT');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Valid Consent Requirements');
      expect(rule!.category).toBe('CONSENT');
      expect(rule!.subcategory).toBe('consent_validity');
      expect(rule!.priority).toBe('CRITICAL');
    });

    test('should have consent withdrawal rights rule', () => {
      const rule = ruleset.getRule('GDPR-ART7-CONSENT-WITHDRAWAL');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Consent Withdrawal Rights');
      expect(rule!.subcategory).toBe('consent_withdrawal');
      expect(rule!.priority).toBe('HIGH');
    });

    test('should validate consent requirements', () => {
      const validConsentRule = ruleset.getRule('GDPR-ART7-VALID-CONSENT');
      const withdrawalRule = ruleset.getRule('GDPR-ART7-CONSENT-WITHDRAWAL');

      expect(validConsentRule!.conditions[0].type).toBe('CUSTOM');
      expect(withdrawalRule!.conditions[0].negated).toBe(true);
    });
  });

  describe('Article 8 - Child Consent', () => {
    test('should have child consent protection rule', () => {
      const rule = ruleset.getRule('GDPR-ART8-CHILD-CONSENT');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Child Consent Protection');
      expect(rule!.priority).toBe('CRITICAL');
      expect(rule!.severity).toBe('BLOCKING');
    });

    test('should check age threshold for children', () => {
      const rule = ruleset.getRule('GDPR-ART8-CHILD-CONSENT');

      expect(rule!.conditions).toHaveLength(1);
      expect(rule!.conditions[0].type).toBe('THRESHOLD');
      expect(rule!.conditions[0].operator).toBe('LESS_THAN');
      expect(rule!.conditions[0].operands[0].value).toBe(16);
    });

    test('should require parental consent for children', () => {
      const rule = ruleset.getRule('GDPR-ART8-CHILD-CONSENT');

      expect(rule!.actions).toHaveLength(1);
      expect(rule!.actions[0].type).toBe('REQUIRE');
    });
  });

  describe('Article 9 - Special Category Data', () => {
    test('should have special category data protection rule', () => {
      const rule = ruleset.getRule('GDPR-ART9-SPECIAL-CATEGORY');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Special Category Data Protection');
      expect(rule!.priority).toBe('CRITICAL');
      expect(rule!.severity).toBe('BLOCKING');
    });

    test('should identify and validate special category data', () => {
      const rule = ruleset.getRule('GDPR-ART9-SPECIAL-CATEGORY');

      expect(rule!.conditions).toHaveLength(2);
      expect(rule!.conditions[0].type).toBe('PATTERN');
      expect(rule!.conditions[1].type).toBe('CUSTOM');
      expect(rule!.conditions[1].negated).toBe(true);
    });

    test('should block unauthorized special category processing', () => {
      const rule = ruleset.getRule('GDPR-ART9-SPECIAL-CATEGORY');

      expect(rule!.actions).toHaveLength(1);
      expect(rule!.actions[0].type).toBe('DENY');
    });
  });

  describe('Articles 12-23 - Data Subject Rights', () => {
    test('should have right of access rule', () => {
      const rule = ruleset.getRule('GDPR-ART15-RIGHT-ACCESS');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Right of Access Implementation');
      expect(rule!.category).toBe('RIGHTS');
      expect(rule!.subcategory).toBe('right_of_access');
    });

    test('should have right to rectification rule', () => {
      const rule = ruleset.getRule('GDPR-ART16-RIGHT-RECTIFICATION');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Right to Rectification Implementation');
      expect(rule!.subcategory).toBe('right_to_rectification');
    });

    test('should have right to erasure rule', () => {
      const rule = ruleset.getRule('GDPR-ART17-RIGHT-ERASURE');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Right to Erasure (Right to be Forgotten)');
      expect(rule!.subcategory).toBe('right_to_erasure');
      expect(rule!.priority).toBe('CRITICAL');
    });

    test('should enforce response time limits for rights requests', () => {
      const accessRule = ruleset.getRule('GDPR-ART15-RIGHT-ACCESS');
      const rectificationRule = ruleset.getRule('GDPR-ART16-RIGHT-RECTIFICATION');

      expect(accessRule!.conditions[0].operands[0].value).toBe(30);
      expect(rectificationRule!.conditions[0].operands[0].value).toBe(30);
    });

    test('should escalate overdue rights requests', () => {
      const accessRule = ruleset.getRule('GDPR-ART15-RIGHT-ACCESS');
      const rectificationRule = ruleset.getRule('GDPR-ART16-RIGHT-RECTIFICATION');

      expect(accessRule!.actions[0].type).toBe('ESCALATE');
      expect(rectificationRule!.actions[0].type).toBe('ESCALATE');
    });

    test('should execute data erasure when appropriate', () => {
      const erasureRule = ruleset.getRule('GDPR-ART17-RIGHT-ERASURE');

      expect(erasureRule!.actions[0].type).toBe('DELETE');
      expect(erasureRule!.conditions[0].type).toBe('CUSTOM');
    });
  });

  describe('Article 25 - Privacy by Design', () => {
    test('should have privacy by design rule', () => {
      const rule = ruleset.getRule('GDPR-ART25-PRIVACY-BY-DESIGN');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Privacy by Design and Default');
      expect(rule!.category).toBe('GOVERNANCE');
      expect(rule!.subcategory).toBe('privacy_by_design');
    });

    test('should validate privacy-protective defaults', () => {
      const rule = ruleset.getRule('GDPR-ART25-PRIVACY-BY-DESIGN');

      expect(rule!.conditions[0].type).toBe('CUSTOM');
      expect(rule!.conditions[0].negated).toBe(true);
    });
  });

  describe('Article 30 - Record Keeping', () => {
    test('should have record keeping rule', () => {
      const rule = ruleset.getRule('GDPR-ART30-RECORD-KEEPING');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Records of Processing Activities');
      expect(rule!.category).toBe('GOVERNANCE');
      expect(rule!.subcategory).toBe('record_keeping');
    });

    test('should validate processing records completeness', () => {
      const rule = ruleset.getRule('GDPR-ART30-RECORD-KEEPING');

      expect(rule!.conditions[0].type).toBe('CUSTOM');
      expect(rule!.actions[0].type).toBe('REQUIRE');
    });
  });

  describe('Article 32 - Security of Processing', () => {
    test('should have security of processing rule', () => {
      const rule = ruleset.getRule('GDPR-ART32-SECURITY-PROCESSING');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Security of Processing Requirements');
      expect(rule!.category).toBe('SECURITY');
      expect(rule!.priority).toBe('CRITICAL');
    });

    test('should validate security measures', () => {
      const rule = ruleset.getRule('GDPR-ART32-SECURITY-PROCESSING');

      expect(rule!.conditions[0].type).toBe('CUSTOM');
      expect(rule!.actions[0].type).toBe('DENY');
    });
  });

  describe('Articles 33-34 - Breach Notification', () => {
    test('should have supervisory authority notification rule', () => {
      const rule = ruleset.getRule('GDPR-ART33-BREACH-NOTIFICATION-SA');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Breach Notification to Supervisory Authority');
      expect(rule!.category).toBe('BREACH');
      expect(rule!.subcategory).toBe('authority_notification');
    });

    test('should have data subject notification rule', () => {
      const rule = ruleset.getRule('GDPR-ART34-BREACH-NOTIFICATION-DS');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Breach Notification to Data Subjects');
      expect(rule!.subcategory).toBe('data_subject_notification');
    });

    test('should enforce 72-hour notification deadline', () => {
      const rule = ruleset.getRule('GDPR-ART33-BREACH-NOTIFICATION-SA');

      expect(rule!.conditions[0].operands[0].value).toBe(72);
      expect(rule!.actions[0].type).toBe('ESCALATE');
    });

    test('should assess breach risk for data subject notification', () => {
      const rule = ruleset.getRule('GDPR-ART34-BREACH-NOTIFICATION-DS');

      expect(rule!.conditions[0].type).toBe('CUSTOM');
      expect(rule!.actions[0].type).toBe('NOTIFY');
    });
  });

  describe('Article 35 - DPIA', () => {
    test('should have DPIA requirement rule', () => {
      const rule = ruleset.getRule('GDPR-ART35-DPIA-REQUIREMENT');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Data Protection Impact Assessment Requirement');
      expect(rule!.category).toBe('GOVERNANCE');
      expect(rule!.subcategory).toBe('impact_assessment');
    });

    test('should validate DPIA completion for high-risk processing', () => {
      const rule = ruleset.getRule('GDPR-ART35-DPIA-REQUIREMENT');

      expect(rule!.conditions).toHaveLength(2);
      expect(rule!.conditions[0].type).toBe('CUSTOM'); // requiresDPIA
      expect(rule!.conditions[1].type).toBe('CUSTOM'); // hasDPIACompleted
      expect(rule!.conditions[1].negated).toBe(true);
    });

    test('should block processing without DPIA when required', () => {
      const rule = ruleset.getRule('GDPR-ART35-DPIA-REQUIREMENT');

      expect(rule!.actions[0].type).toBe('DENY');
      expect(rule!.severity).toBe('BLOCKING');
    });
  });

  describe('Articles 44-49 - International Transfers', () => {
    test('should have international transfer rule', () => {
      const rule = ruleset.getRule('GDPR-ART44-INTERNATIONAL-TRANSFERS');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('International Data Transfer Restrictions');
      expect(rule!.category).toBe('TRANSFER');
      expect(rule!.subcategory).toBe('international_transfer');
    });

    test('should validate transfer mechanisms', () => {
      const rule = ruleset.getRule('GDPR-ART44-INTERNATIONAL-TRANSFERS');

      expect(rule!.conditions[0].type).toBe('CUSTOM');
      expect(rule!.conditions[0].negated).toBe(true);
      expect(rule!.actions[0].type).toBe('DENY');
    });
  });

  describe('Article 83 - Administrative Fines', () => {
    test('should have administrative fines assessment rule', () => {
      const rule = ruleset.getRule('GDPR-ART83-ADMINISTRATIVE-FINES');

      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Administrative Fines Assessment');
      expect(rule!.category).toBe('GOVERNANCE');
      expect(rule!.subcategory).toBe('enforcement');
    });

    test('should assess violation severity', () => {
      const rule = ruleset.getRule('GDPR-ART83-ADMINISTRATIVE-FINES');

      expect(rule!.conditions[0].type).toBe('CUSTOM');
      expect(rule!.actions[0].type).toBe('ESCALATE');
    });
  });

  describe('Rule Organization and Querying', () => {
    test('should categorize rules correctly', () => {
      const dataProtectionRules = ruleset.getRulesByCategory('DATA_PROTECTION' as RuleCategory);
      const consentRules = ruleset.getRulesByCategory('CONSENT' as RuleCategory);
      const rightsRules = ruleset.getRulesByCategory('RIGHTS' as RuleCategory);
      const securityRules = ruleset.getRulesByCategory('SECURITY' as RuleCategory);

      expect(dataProtectionRules.length).toBeGreaterThan(0);
      expect(consentRules.length).toBeGreaterThan(0);
      expect(rightsRules.length).toBeGreaterThan(0);
      expect(securityRules.length).toBeGreaterThan(0);

      // Verify specific rules are in correct categories
      expect(dataProtectionRules.some(r => r.ruleId === 'GDPR-ART5-PURPOSE-LIMITATION')).toBe(true);
      expect(consentRules.some(r => r.ruleId === 'GDPR-ART7-VALID-CONSENT')).toBe(true);
      expect(rightsRules.some(r => r.ruleId === 'GDPR-ART15-RIGHT-ACCESS')).toBe(true);
    });

    test('should prioritize rules correctly', () => {
      const criticalRules = ruleset.getRulesByPriority('CRITICAL' as RulePriority);
      const highRules = ruleset.getRulesByPriority('HIGH' as RulePriority);
      const mediumRules = ruleset.getRulesByPriority('MEDIUM' as RulePriority);

      expect(criticalRules.length).toBeGreaterThan(0);
      expect(highRules.length).toBeGreaterThan(0);

      // Critical rules should include blocking rules
      expect(criticalRules.some(r => r.ruleId === 'GDPR-ART6-LAWFUL-BASIS')).toBe(true);
      expect(criticalRules.some(r => r.ruleId === 'GDPR-ART8-CHILD-CONSENT')).toBe(true);
    });

    test('should find rules by article reference', () => {
      const article5Rules = ruleset.getRulesByArticle('Article 5(1)(b)');
      const article7Rules = ruleset.getRulesByArticle('Article 7');
      const article15Rules = ruleset.getRulesByArticle('Article 15');

      expect(article5Rules.length).toBeGreaterThan(0);
      expect(article7Rules.length).toBeGreaterThan(0);
      expect(article15Rules.length).toBeGreaterThan(0);
    });

    test('should provide accurate rule statistics', () => {
      const stats = ruleset.getRuleStats();

      expect(stats.totalRules).toBeGreaterThan(0);
      expect(stats.rulesByCategory).toBeDefined();
      expect(stats.rulesByPriority).toBeDefined();
      expect(stats.rulesBySeverity).toBeDefined();

      // Should have rules in multiple categories
      expect(Object.keys(stats.rulesByCategory).length).toBeGreaterThan(1);
      expect(Object.keys(stats.rulesByPriority).length).toBeGreaterThan(1);
      expect(Object.keys(stats.rulesBySeverity).length).toBeGreaterThan(1);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration and regenerate rules', () => {
      const initialRuleCount = ruleset.getAllRules().length;

      ruleset.updateConfig({
        dataSubjectRights: false,
        transferRestrictions: false,
      });

      const updatedConfig = ruleset.getConfig();
      expect(updatedConfig.dataSubjectRights).toBe(false);
      expect(updatedConfig.transferRestrictions).toBe(false);

      // Rules should be regenerated
      const updatedRuleCount = ruleset.getAllRules().length;
      expect(updatedRuleCount).toBeGreaterThan(0);
    });

    test('should maintain framework consistency across all rules', () => {
      const allRules = ruleset.getAllRules();

      // All rules should be GDPR framework
      expect(allRules.every(rule => rule.framework === 'GDPR')).toBe(true);

      // All rules should have proper metadata
      expect(allRules.every(rule => rule.metadata.author === 'GDPR Compliance Team')).toBe(true);
      expect(allRules.every(rule => rule.metadata.tags.includes('gdpr'))).toBe(true);
    });

    test('should have proper rule versioning and lifecycle', () => {
      const allRules = ruleset.getAllRules();

      // All rules should have version information
      expect(allRules.every(rule => rule.version === '1.0.0')).toBe(true);
      expect(allRules.every(rule => rule.metadata.version === '1.0.0')).toBe(true);

      // All rules should have proper dates
      expect(allRules.every(rule => rule.metadata.createdAt instanceof Date)).toBe(true);
      expect(allRules.every(rule => rule.metadata.lastModified instanceof Date)).toBe(true);
    });
  });

  describe('Rule Scope and Applicability', () => {
    test('should have proper geographic scope for EU jurisdiction', () => {
      const allRules = ruleset.getAllRules();

      // All rules should have EU/EEA geographic scope
      allRules.forEach(rule => {
        expect(rule.scope.geographicScope.countries).toContain('EU');
        expect(rule.scope.geographicScope.countries).toContain('EEA');
      });
    });

    test('should have proper temporal scope starting from GDPR effective date', () => {
      const allRules = ruleset.getAllRules();
      const gdprEffectiveDate = new Date('2018-05-25');

      // All rules should be effective from GDPR date or later
      allRules.forEach(rule => {
        expect(rule.scope.temporalScope.effectiveDate).toEqual(gdprEffectiveDate);
      });
    });

    test('should have universal applicability for core rules', () => {
      const coreRules = ['GDPR-ART6-LAWFUL-BASIS', 'GDPR-ART7-VALID-CONSENT', 'GDPR-ART32-SECURITY-PROCESSING'];

      coreRules.forEach(ruleId => {
        const rule = ruleset.getRule(ruleId);
        expect(rule!.scope.applicability.universal).toBe(true);
      });
    });
  });

  describe('Rule Validation and Quality', () => {
    test('should have non-empty rule IDs and names', () => {
      const allRules = ruleset.getAllRules();

      allRules.forEach(rule => {
        expect(rule.ruleId).toBeTruthy();
        expect(rule.name).toBeTruthy();
        expect(rule.description).toBeTruthy();
      });
    });

    test('should have valid conditions and actions', () => {
      const allRules = ruleset.getAllRules();

      allRules.forEach(rule => {
        expect(rule.conditions.length).toBeGreaterThan(0);
        expect(rule.actions.length).toBeGreaterThan(0);

        rule.conditions.forEach(condition => {
          expect(condition.conditionId).toBeTruthy();
          expect(condition.type).toBeTruthy();
          expect(condition.operator).toBeTruthy();
        });

        rule.actions.forEach(action => {
          expect(action.actionId).toBeTruthy();
          expect(action.type).toBeTruthy();
        });
      });
    });

    test('should have proper compliance framework references', () => {
      const allRules = ruleset.getAllRules();

      allRules.forEach(rule => {
        expect(rule.compliance.frameworks.length).toBeGreaterThan(0);
        expect(rule.compliance.frameworks[0].framework).toBe('GDPR');
        expect(rule.compliance.frameworks[0].articles.length).toBeGreaterThan(0);
      });
    });
  });
});
