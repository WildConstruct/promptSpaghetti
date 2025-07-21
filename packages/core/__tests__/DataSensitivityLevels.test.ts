/**
 * Comprehensive test suite for Data Sensitivity Levels Framework
 * Tests for Epic 19 Task T-1752989143997-86: Define data sensitivity levels
 */

import {
  DataSensitivityLevel,
  DataSensitivityUtils,
  DATA_SENSITIVITY_DEFINITIONS,
  DATA_SENSITIVITY_GUIDELINES,
  DataSensitivityLevelSchema,
  type DataElementClassification,
  type DataHandlingRequirements
} from '../security/DataSensitivityLevels';

describe('DataSensitivityLevels', () => {
  describe('DataSensitivityLevel enum', () => {
    it('should have all required sensitivity levels', () => {
      expect(Object.values(DataSensitivityLevel)).toEqual([
        'public',
        'internal', 
        'confidential',
        'restricted'
      ]);
    });

    it('should be compatible with string values', () => {
      expect(DataSensitivityLevel.PUBLIC).toBe('public');
      expect(DataSensitivityLevel.INTERNAL).toBe('internal');
      expect(DataSensitivityLevel.CONFIDENTIAL).toBe('confidential');
      expect(DataSensitivityLevel.RESTRICTED).toBe('restricted');
    });
  });

  describe('DATA_SENSITIVITY_DEFINITIONS', () => {
    it('should have definitions for all sensitivity levels', () => {
      const levels = Object.values(DataSensitivityLevel);
      levels.forEach(level => {
        expect(DATA_SENSITIVITY_DEFINITIONS[level]).toBeDefined();
        expect(DATA_SENSITIVITY_DEFINITIONS[level].level).toBe(level);
      });
    });

    it('should have proper risk level progression', () => {
      expect(DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.PUBLIC].riskLevel).toBe('low');
      expect(DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.INTERNAL].riskLevel).toBe('medium');
      expect(DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.CONFIDENTIAL].riskLevel).toBe('high');
      expect(DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.RESTRICTED].riskLevel).toBe('critical');
    });

    it('should have appropriate examples for each level', () => {
      Object.values(DataSensitivityLevel).forEach(level => {
        const definition = DATA_SENSITIVITY_DEFINITIONS[level];
        expect(definition.examples).toBeInstanceOf(Array);
        expect(definition.examples.length).toBeGreaterThan(0);
        expect(definition.examples.every(example => typeof example === 'string')).toBe(true);
      });
    });

    describe('handling requirements', () => {
      it('should have progressively stricter access controls', () => {
        const publicReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.PUBLIC].handlingRequirements;
        const internalReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.INTERNAL].handlingRequirements;
        const confidentialReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.CONFIDENTIAL].handlingRequirements;
        const restrictedReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.RESTRICTED].handlingRequirements;

        // Authentication progression
        expect(publicReq.accessControl.authentication).toBe('none');
        expect(internalReq.accessControl.authentication).toBe('basic');
        expect(confidentialReq.accessControl.authentication).toBe('strong');
        expect(restrictedReq.accessControl.authentication).toBe('mfa');

        // Authorization progression
        expect(publicReq.accessControl.authorization).toBe('none');
        expect(internalReq.accessControl.authorization).toBe('role-based');
        expect(confidentialReq.accessControl.authorization).toBe('attribute-based');
        expect(restrictedReq.accessControl.authorization).toBe('need-to-know');
      });

      it('should have appropriate encryption requirements', () => {
        const publicReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.PUBLIC].handlingRequirements;
        const restrictedReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.RESTRICTED].handlingRequirements;

        // Public should not require encryption
        expect(publicReq.encryption.atRest).toBe(false);
        expect(publicReq.encryption.inTransit).toBe(false);

        // Restricted should require strong encryption
        expect(restrictedReq.encryption.atRest).toBe(true);
        expect(restrictedReq.encryption.inTransit).toBe(true);
        expect(restrictedReq.encryption.algorithm).toBe('AES-256-GCM');
        expect(restrictedReq.encryption.keyManagement).toBe('hsm');
      });

      it('should have appropriate disposal methods', () => {
        const publicReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.PUBLIC].handlingRequirements;
        const internalReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.INTERNAL].handlingRequirements;
        const confidentialReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.CONFIDENTIAL].handlingRequirements;
        const restrictedReq = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.RESTRICTED].handlingRequirements;

        expect(publicReq.retention.disposalMethod).toBe('standard');
        expect(internalReq.retention.disposalMethod).toBe('secure');
        expect(confidentialReq.retention.disposalMethod).toBe('secure');
        expect(restrictedReq.retention.disposalMethod).toBe('cryptographic-erasure');
      });
    });

    describe('compliance frameworks', () => {
      it('should have appropriate compliance requirements for each level', () => {
        const restricted = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.RESTRICTED];
        const confidential = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.CONFIDENTIAL];
        const internal = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.INTERNAL];
        const publicDef = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.PUBLIC];

        // Restricted should have most compliance frameworks
        expect(restricted.complianceFrameworks).toContain('GDPR');
        expect(restricted.complianceFrameworks).toContain('HIPAA');
        expect(restricted.complianceFrameworks).toContain('PCI-DSS');

        // Public should have no specific compliance frameworks
        expect(publicDef.complianceFrameworks).toEqual([]);
      });
    });

    describe('marking requirements', () => {
      it('should have appropriate marking requirements', () => {
        const publicMarking = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.PUBLIC].markingRequirements;
        const restrictedMarking = DATA_SENSITIVITY_DEFINITIONS[DataSensitivityLevel.RESTRICTED].markingRequirements;

        // Public should not require marking
        expect(publicMarking.required).toBe(false);
        
        // Restricted should require marking
        expect(restrictedMarking.required).toBe(true);
        expect(restrictedMarking.label).toBe('RESTRICTED');
        expect(restrictedMarking.color).toBe('#dc3545');
        expect(restrictedMarking.displayFormat).toBe('banner');
      });

      it('should have distinct colors for different levels', () => {
        const colors = Object.values(DataSensitivityLevel).map(
          level => DATA_SENSITIVITY_DEFINITIONS[level].markingRequirements.color
        );
        
        // All colors should be unique
        const uniqueColors = new Set(colors);
        expect(uniqueColors.size).toBe(colors.length);
      });
    });
  });

  describe('DataSensitivityLevelSchema', () => {
    it('should validate valid sensitivity levels', () => {
      Object.values(DataSensitivityLevel).forEach(level => {
        expect(() => DataSensitivityLevelSchema.parse(level)).not.toThrow();
      });
    });

    it('should reject invalid sensitivity levels', () => {
      const invalidLevels = ['invalid', 'unknown', '', null, undefined, 123];
      
      invalidLevels.forEach(level => {
        expect(() => DataSensitivityLevelSchema.parse(level)).toThrow();
      });
    });

    it('should provide appropriate error messages', () => {
      try {
        DataSensitivityLevelSchema.parse('invalid');
      } catch (error: unknown) {
        expect(error.message).toContain('Invalid data sensitivity level');
      }
    });
  });

  describe('DataSensitivityUtils', () => {
    describe('getHandlingRequirements', () => {
      it('should return correct handling requirements for each level', () => {
        Object.values(DataSensitivityLevel).forEach(level => {
          const requirements = DataSensitivityUtils.getHandlingRequirements(level);
          expect(requirements).toBeDefined();
          expect(requirements.accessControl).toBeDefined();
          expect(requirements.encryption).toBeDefined();
          expect(requirements.retention).toBeDefined();
          expect(requirements.audit).toBeDefined();
          expect(requirements.transfer).toBeDefined();
          expect(requirements.backup).toBeDefined();
        });
      });
    });

    describe('getRiskLevel', () => {
      it('should return correct risk levels', () => {
        expect(DataSensitivityUtils.getRiskLevel(DataSensitivityLevel.PUBLIC)).toBe('low');
        expect(DataSensitivityUtils.getRiskLevel(DataSensitivityLevel.INTERNAL)).toBe('medium');
        expect(DataSensitivityUtils.getRiskLevel(DataSensitivityLevel.CONFIDENTIAL)).toBe('high');
        expect(DataSensitivityUtils.getRiskLevel(DataSensitivityLevel.RESTRICTED)).toBe('critical');
      });
    });

    describe('getComplianceFrameworks', () => {
      it('should return appropriate compliance frameworks', () => {
        const restrictedFrameworks = DataSensitivityUtils.getComplianceFrameworks(DataSensitivityLevel.RESTRICTED);
        expect(restrictedFrameworks).toContain('GDPR');
        expect(restrictedFrameworks).toContain('HIPAA');

        const publicFrameworks = DataSensitivityUtils.getComplianceFrameworks(DataSensitivityLevel.PUBLIC);
        expect(publicFrameworks).toEqual([]);
      });
    });

    describe('isEncryptionRequired', () => {
      it('should correctly identify encryption requirements', () => {
        expect(DataSensitivityUtils.isEncryptionRequired(DataSensitivityLevel.PUBLIC)).toBe(false);
        expect(DataSensitivityUtils.isEncryptionRequired(DataSensitivityLevel.INTERNAL)).toBe(true); // in-transit
        expect(DataSensitivityUtils.isEncryptionRequired(DataSensitivityLevel.CONFIDENTIAL)).toBe(true);
        expect(DataSensitivityUtils.isEncryptionRequired(DataSensitivityLevel.RESTRICTED)).toBe(true);
      });
    });

    describe('isMFARequired', () => {
      it('should correctly identify MFA requirements', () => {
        expect(DataSensitivityUtils.isMFARequired(DataSensitivityLevel.PUBLIC)).toBe(false);
        expect(DataSensitivityUtils.isMFARequired(DataSensitivityLevel.INTERNAL)).toBe(false);
        expect(DataSensitivityUtils.isMFARequired(DataSensitivityLevel.CONFIDENTIAL)).toBe(false);
        expect(DataSensitivityUtils.isMFARequired(DataSensitivityLevel.RESTRICTED)).toBe(true);
      });
    });

    describe('getMaxRetentionPeriod', () => {
      it('should return correct retention periods', () => {
        expect(DataSensitivityUtils.getMaxRetentionPeriod(DataSensitivityLevel.PUBLIC)).toBe('indefinite');
        expect(DataSensitivityUtils.getMaxRetentionPeriod(DataSensitivityLevel.INTERNAL)).toBe('7 years');
        expect(DataSensitivityUtils.getMaxRetentionPeriod(DataSensitivityLevel.CONFIDENTIAL)).toBe('5 years');
        expect(DataSensitivityUtils.getMaxRetentionPeriod(DataSensitivityLevel.RESTRICTED)).toBe('minimal-necessary');
      });
    });

    describe('validateSensitivityAssignment', () => {
      it('should validate appropriate assignments', () => {
        const result = DataSensitivityUtils.validateSensitivityAssignment(
          'marketing',
          DataSensitivityLevel.PUBLIC
        );
        
        expect(result.valid).toBe(true);
        expect(result.reasons).toContain('Sensitivity level assignment is appropriate');
      });

      it('should reject inappropriate assignments for PII data', () => {
        const result = DataSensitivityUtils.validateSensitivityAssignment(
          'email',
          DataSensitivityLevel.PUBLIC
        );
        
        expect(result.valid).toBe(false);
        expect(result.recommendedLevel).toBe(DataSensitivityLevel.RESTRICTED);
        expect(result.reasons[0]).toContain('email');
      });

      it('should consider context for PII detection', () => {
        const result = DataSensitivityUtils.validateSensitivityAssignment(
          'customer_data',
          DataSensitivityLevel.INTERNAL,
          { containsPII: true }
        );
        
        expect(result.valid).toBe(false);
        expect(result.recommendedLevel).toBe(DataSensitivityLevel.RESTRICTED);
        expect(result.reasons[0]).toContain('PII');
      });

      it('should handle publicly available data', () => {
        const result = DataSensitivityUtils.validateSensitivityAssignment(
          'general_data',
          DataSensitivityLevel.CONFIDENTIAL,
          { publiclyAvailable: true }
        );
        
        expect(result.valid).toBe(false);
        expect(result.recommendedLevel).toBe(DataSensitivityLevel.PUBLIC);
      });
    });

    describe('compareSensitivityLevels', () => {
      it('should correctly compare sensitivity levels', () => {
        // Higher sensitivity should return positive
        expect(DataSensitivityUtils.compareSensitivityLevels(
          DataSensitivityLevel.RESTRICTED,
          DataSensitivityLevel.PUBLIC
        )).toBeGreaterThan(0);

        // Lower sensitivity should return negative  
        expect(DataSensitivityUtils.compareSensitivityLevels(
          DataSensitivityLevel.PUBLIC,
          DataSensitivityLevel.RESTRICTED
        )).toBeLessThan(0);

        // Same level should return 0
        expect(DataSensitivityUtils.compareSensitivityLevels(
          DataSensitivityLevel.CONFIDENTIAL,
          DataSensitivityLevel.CONFIDENTIAL
        )).toBe(0);
      });

      it('should handle all level combinations correctly', () => {
        const levels = Object.values(DataSensitivityLevel);
        
        for (let i = 0; i < levels.length; i++) {
          for (let j = 0; j < levels.length; j++) {
            const comparison = DataSensitivityUtils.compareSensitivityLevels(levels[i], levels[j]);
            
            if (i > j) {
              expect(comparison).toBeGreaterThan(0);
            } else if (i < j) {
              expect(comparison).toBeLessThan(0);
            } else {
              expect(comparison).toBe(0);
            }
          }
        }
      });
    });

    describe('getHigherSensitivityLevel', () => {
      it('should return the higher sensitivity level', () => {
        expect(DataSensitivityUtils.getHigherSensitivityLevel(
          DataSensitivityLevel.PUBLIC,
          DataSensitivityLevel.RESTRICTED
        )).toBe(DataSensitivityLevel.RESTRICTED);

        expect(DataSensitivityUtils.getHigherSensitivityLevel(
          DataSensitivityLevel.CONFIDENTIAL,
          DataSensitivityLevel.INTERNAL
        )).toBe(DataSensitivityLevel.CONFIDENTIAL);

        expect(DataSensitivityUtils.getHigherSensitivityLevel(
          DataSensitivityLevel.INTERNAL,
          DataSensitivityLevel.INTERNAL
        )).toBe(DataSensitivityLevel.INTERNAL);
      });
    });

    describe('generateSecurityMarkings', () => {
      it('should generate appropriate markings for each level', () => {
        Object.values(DataSensitivityLevel).forEach(level => {
          const markings = DataSensitivityUtils.generateSecurityMarkings(level);
          
          expect(markings.label).toBeDefined();
          expect(markings.color).toBeDefined();
          expect(markings.displayFormat).toBeDefined();
          expect(markings.htmlBadge).toContain(markings.label);
          expect(markings.htmlBadge).toContain(markings.color);
          expect(markings.textMarking).toBe(`[${markings.label}]`);
        });
      });

      it('should generate valid HTML badges', () => {
        const markings = DataSensitivityUtils.generateSecurityMarkings(DataSensitivityLevel.RESTRICTED);
        
        expect(markings.htmlBadge).toContain('<span');
        expect(markings.htmlBadge).toContain('sensitivity-badge');
        expect(markings.htmlBadge).toContain('RESTRICTED');
        expect(markings.htmlBadge).toContain('</span>');
      });
    });

    describe('validateClassification', () => {
      const validClassification: DataElementClassification = {
        elementId: 'test-element-1',
        elementName: 'Test Email Field',
        sensitivityLevel: DataSensitivityLevel.RESTRICTED,
        classifiedAt: new Date(),
        classifiedBy: 'automated',
        confidence: 95,
        rationale: ['Contains email address pattern'],
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        metadata: {
          dataCategory: 'pii',
          sourceSystem: 'customer-db',
          businessOwner: 'data-team',
          technicalOwner: 'engineering-team',
          complianceRequirements: ['GDPR']
        }
      };

      it('should validate a correct classification', () => {
        const result = DataSensitivityUtils.validateClassification(validClassification);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should detect missing required fields', () => {
        const invalidClassification = {
          ...validClassification,
          elementId: '',
          elementName: ''
        };
        
        const result = DataSensitivityUtils.validateClassification(invalidClassification);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Element ID is required');
        expect(result.errors).toContain('Element name is required');
      });

      it('should validate confidence scores', () => {
        const lowConfidence = {
          ...validClassification,
          confidence: 50
        };
        
        const result = DataSensitivityUtils.validateClassification(lowConfidence);
        
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Low confidence score - classification may need review');
      });

      it('should detect invalid confidence scores', () => {
        const invalidConfidence = {
          ...validClassification,
          confidence: 150
        };
        
        const result = DataSensitivityUtils.validateClassification(invalidConfidence);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Confidence score must be between 0 and 100');
      });

      it('should warn about missing metadata', () => {
        const missingMetadata = {
          ...validClassification,
          metadata: {
            ...validClassification.metadata,
            businessOwner: '',
            technicalOwner: ''
          }
        };
        
        const result = DataSensitivityUtils.validateClassification(missingMetadata);
        
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Business owner should be specified');
        expect(result.warnings).toContain('Technical owner should be specified');
      });

      it('should warn about past review dates', () => {
        const pastReview = {
          ...validClassification,
          reviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
        };
        
        const result = DataSensitivityUtils.validateClassification(pastReview);
        
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Review date is in the past - classification should be reviewed');
      });
    });
  });

  describe('DATA_SENSITIVITY_GUIDELINES', () => {
    describe('decision tree', () => {
      it('should have a complete decision tree structure', () => {
        const { decisionTree } = DATA_SENSITIVITY_GUIDELINES;
        
        expect(decisionTree.questions).toBeInstanceOf(Array);
        expect(decisionTree.questions.length).toBeGreaterThan(0);
        expect(decisionTree.actions).toBeDefined();
        
        decisionTree.questions.forEach(question => {
          expect(question.id).toBeDefined();
          expect(question.question).toBeDefined();
          expect(question.yesAction).toBeDefined();
          expect(question.noAction).toBeDefined();
        });
      });

      it('should have valid actions for all references', () => {
        const { decisionTree } = DATA_SENSITIVITY_GUIDELINES;
        const validActions = new Set([
          ...Object.keys(decisionTree.actions),
          'continue_assessment'
        ]);
        
        decisionTree.questions.forEach(question => {
          expect(validActions.has(question.yesAction)).toBe(true);
          expect(validActions.has(question.noAction)).toBe(true);
        });
      });

      it('should map actions to valid sensitivity levels', () => {
        const { decisionTree } = DATA_SENSITIVITY_GUIDELINES;
        const validLevels = Object.values(DataSensitivityLevel);
        
        Object.values(decisionTree.actions).forEach(level => {
          expect(validLevels).toContain(level);
        });
      });
    });

    describe('automated classification rules', () => {
      it('should have valid classification rules', () => {
        const { automatedClassificationRules } = DATA_SENSITIVITY_GUIDELINES;
        
        expect(automatedClassificationRules).toBeInstanceOf(Array);
        expect(automatedClassificationRules.length).toBeGreaterThan(0);
        
        automatedClassificationRules.forEach(rule => {
          expect(rule.pattern).toBeInstanceOf(RegExp);
          expect(rule.dataType).toBeDefined();
          expect(Object.values(DataSensitivityLevel)).toContain(rule.recommendedLevel);
          expect(rule.confidence).toBeGreaterThanOrEqual(0);
          expect(rule.confidence).toBeLessThanOrEqual(100);
        });
      });

      it('should correctly identify email patterns', () => {
        const emailRule = DATA_SENSITIVITY_GUIDELINES.automatedClassificationRules
          .find(rule => rule.dataType === 'email');
        
        expect(emailRule).toBeDefined();
        expect(emailRule!.pattern.test('user@example.com')).toBe(true);
        expect(emailRule!.pattern.test('invalid-email')).toBe(false);
        expect(emailRule!.recommendedLevel).toBe(DataSensitivityLevel.RESTRICTED);
      });

      it('should correctly identify SSN patterns', () => {
        const ssnRule = DATA_SENSITIVITY_GUIDELINES.automatedClassificationRules
          .find(rule => rule.dataType === 'ssn');
        
        expect(ssnRule).toBeDefined();
        expect(ssnRule!.pattern.test('123-45-6789')).toBe(true);
        expect(ssnRule!.pattern.test('123456789')).toBe(false);
        expect(ssnRule!.recommendedLevel).toBe(DataSensitivityLevel.RESTRICTED);
      });

      it('should correctly identify credit card patterns', () => {
        const ccRule = DATA_SENSITIVITY_GUIDELINES.automatedClassificationRules
          .find(rule => rule.dataType === 'credit_card');
        
        expect(ccRule).toBeDefined();
        
        // Test valid credit card patterns
        expect(ccRule!.pattern.test('4111111111111111')).toBe(true); // Visa
        expect(ccRule!.pattern.test('5555555555554444')).toBe(true); // MasterCard
        expect(ccRule!.pattern.test('378282246310005')).toBe(true);  // AmEx
        
        // Test invalid patterns
        expect(ccRule!.pattern.test('1234567890123456')).toBe(false);
        expect(ccRule!.recommendedLevel).toBe(DataSensitivityLevel.RESTRICTED);
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complex classification scenarios', () => {
      // Test scenario: Email field in customer database
      const emailValidation = DataSensitivityUtils.validateSensitivityAssignment(
        'email',
        DataSensitivityLevel.RESTRICTED
      );
      
      expect(emailValidation.valid).toBe(true);
      
      const requirements = DataSensitivityUtils.getHandlingRequirements(DataSensitivityLevel.RESTRICTED);
      expect(requirements.encryption.atRest).toBe(true);
      expect(requirements.accessControl.authentication).toBe('mfa');
      
      const markings = DataSensitivityUtils.generateSecurityMarkings(DataSensitivityLevel.RESTRICTED);
      expect(markings.label).toBe('RESTRICTED');
    });

    it('should provide consistent classification recommendations', () => {
      // Test that automated rules and manual validation agree
      const emailRule = DATA_SENSITIVITY_GUIDELINES.automatedClassificationRules
        .find(rule => rule.dataType === 'email');
      
      const manualValidation = DataSensitivityUtils.validateSensitivityAssignment(
        'email',
        emailRule!.recommendedLevel
      );
      
      expect(manualValidation.valid).toBe(true);
    });

    it('should handle edge cases gracefully', () => {
      // Test empty or unusual inputs
      expect(() => DataSensitivityUtils.getHandlingRequirements(DataSensitivityLevel.PUBLIC)).not.toThrow();
      expect(() => DataSensitivityUtils.generateSecurityMarkings(DataSensitivityLevel.INTERNAL)).not.toThrow();
      
      // Test validation with minimal data
      const minimalClassification: DataElementClassification = {
        elementId: 'test',
        elementName: 'test',
        sensitivityLevel: DataSensitivityLevel.PUBLIC,
        classifiedAt: new Date(),
        classifiedBy: 'test',
        confidence: 80,
        rationale: ['test'],
        reviewDate: new Date(Date.now() + 1000),
        metadata: {
          dataCategory: 'test',
          sourceSystem: 'test',
          businessOwner: 'test',
          technicalOwner: 'test',
          complianceRequirements: []
        }
      };
      
      const result = DataSensitivityUtils.validateClassification(minimalClassification);
      expect(result.valid).toBe(true);
    });
  });
});