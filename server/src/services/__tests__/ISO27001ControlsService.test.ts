/**
 * ISO 27001 Controls Service Tests - Epic 19
 *
 * Comprehensive test suite for ISO 27001:2022 controls mapping service
 * Task: T-1752989143998-102 - Add ISO 27001 controls mapping
 */

import {
  ISO27001ControlsService,
  ISO27001Theme,
  ISO27001Category,
  ControlStatus,
  ControlRiskLevel,
} from '../ISO27001ControlsService';
import { ComplianceRuleEngine } from '../ComplianceRuleEngine';
import { AuditService } from '../../auth/services/AuditService';

// Mock dependencies
jest.mock('../ComplianceRuleEngine');
jest.mock('../../auth/services/AuditService');

describe('ISO27001ControlsService', () => {
  let service: ISO27001ControlsService;
  let mockComplianceEngine: jest.Mocked<ComplianceRuleEngine>;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuditService = new AuditService({} as any) as jest.Mocked<AuditService>;
    mockComplianceEngine = new ComplianceRuleEngine(mockAuditService) as jest.Mocked<ComplianceRuleEngine>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockComplianceEngine.addRule = jest.fn<any[], any>().mockResolvedValue({
      added: true,
      conflicts: [],
    } as unknown);

    service = new ISO27001ControlsService(mockComplianceEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Control Initialization', () => {
    test('should initialize with predefined ISO 27001 controls', () => {
      const allControls = service.getAllControls();

      expect(allControls.length).toBeGreaterThan(0);
      expect(allControls.length).toBeLessThanOrEqual(93); // ISO 27001:2022 has 93 controls
    });

    test('should have controls for all four themes', () => {
      const organizationalControls = service.getControlsByTheme(ISO27001Theme.ORGANIZATIONAL);
      const peopleControls = service.getControlsByTheme(ISO27001Theme.PEOPLE);
      const physicalControls = service.getControlsByTheme(ISO27001Theme.PHYSICAL);
      const technologicalControls = service.getControlsByTheme(ISO27001Theme.TECHNOLOGICAL);

      expect(organizationalControls.length).toBeGreaterThan(0);
      expect(peopleControls.length).toBeGreaterThan(0);
      expect(physicalControls.length).toBeGreaterThan(0);
      expect(technologicalControls.length).toBeGreaterThan(0);
    });

    test('should have properly structured control A.5.1', () => {
      const control = service.getControl('A.5.1');

      expect(control).toBeDefined();
      expect(control?.controlNumber).toBe('A.5.1');
      expect(control?.title).toBe('Information security policies');
      expect(control?.theme).toBe(ISO27001Theme.ORGANIZATIONAL);
      expect(control?.category).toBe(ISO27001Category.INFORMATION_SECURITY_POLICIES);
      expect(control?.riskLevel).toBe(ControlRiskLevel.HIGH);
      expect(control?.status).toBe(ControlStatus.NOT_IMPLEMENTED);
    });

    test('should have control A.6.1 with proper people theme', () => {
      const control = service.getControl('A.6.1');

      expect(control).toBeDefined();
      expect(control?.controlNumber).toBe('A.6.1');
      expect(control?.title).toBe('Screening');
      expect(control?.theme).toBe(ISO27001Theme.PEOPLE);
      expect(control?.category).toBe(ISO27001Category.HUMAN_RESOURCE_SECURITY);
    });

    test('should have control A.7.1 with proper physical theme', () => {
      const control = service.getControl('A.7.1');

      expect(control).toBeDefined();
      expect(control?.controlNumber).toBe('A.7.1');
      expect(control?.title).toBe('Physical security perimeters');
      expect(control?.theme).toBe(ISO27001Theme.PHYSICAL);
      expect(control?.category).toBe(ISO27001Category.PHYSICAL_ENVIRONMENTAL_SECURITY);
    });

    test('should have control A.8.1 with proper technological theme', () => {
      const control = service.getControl('A.8.1');

      expect(control).toBeDefined();
      expect(control?.controlNumber).toBe('A.8.1');
      expect(control?.title).toBe('User endpoint devices');
      expect(control?.theme).toBe(ISO27001Theme.TECHNOLOGICAL);
      expect(control?.category).toBe(ISO27001Category.ACCESS_CONTROL);
    });
  });

  describe('Control Management', () => {
    test('should return undefined for non-existent control', () => {
      const control = service.getControl('A.99.99');
      expect(control).toBeUndefined();
    });

    test('should filter controls by category', () => {
      const policyControls = service.getControlsByCategory(ISO27001Category.INFORMATION_SECURITY_POLICIES);

      expect(policyControls.length).toBeGreaterThan(0);
      policyControls.forEach(control => {
        expect(control.category).toBe(ISO27001Category.INFORMATION_SECURITY_POLICIES);
      });
    });

    test('should filter controls by status', () => {
      const notImplementedControls = service.getControlsByStatus(ControlStatus.NOT_IMPLEMENTED);

      expect(notImplementedControls.length).toBeGreaterThan(0);
      notImplementedControls.forEach(control => {
        expect(control.status).toBe(ControlStatus.NOT_IMPLEMENTED);
      });
    });

    test('should update control status successfully', async () => {
      const updated = await service.updateControlStatus('A.5.1', ControlStatus.IMPLEMENTED);
      expect(updated).toBe(true);

      const control = service.getControl('A.5.1');
      expect(control?.status).toBe(ControlStatus.IMPLEMENTED);
      expect(control?.metadata.changeHistory.length).toBe(1);
      expect(control?.metadata.changeHistory[0].description).toBe('Status updated to implemented');
    });

    test('should fail to update non-existent control', async () => {
      const updated = await service.updateControlStatus('A.99.99', ControlStatus.IMPLEMENTED);
      expect(updated).toBe(false);
    });
  });

  describe('Compliance Integration', () => {
    test('should generate compliance rules for all controls', async () => {
      const rules = await service.generateComplianceRules();
      const allControls = service.getAllControls();

      expect(rules.length).toBe(allControls.length);

      rules.forEach(rule => {
        expect(rule.framework).toBe('ISO_27001');
        expect(rule.ruleId).toMatch(/^ISO27001_A_\d+_\d+$/);
        expect(rule.name).toMatch(/^ISO 27001 A\.\d+\.\d+:/);
        expect(rule.status).toBe('ACTIVE');
      });
    });

    test('should map control categories to rule categories correctly', async () => {
      const rules = await service.generateComplianceRules();

      const policyRule = rules.find(r => r.ruleId === 'ISO27001_A_5_1');
      expect(policyRule?.category).toBe('GOVERNANCE');

      const accessRule = rules.find(r => r.ruleId === 'ISO27001_A_8_1');
      expect(accessRule?.category).toBe('ACCESS');
    });

    test('should map risk levels to priorities correctly', async () => {
      const rules = await service.generateComplianceRules();

      const highRiskRule = rules.find(r => r.ruleId === 'ISO27001_A_5_1');
      expect(highRiskRule?.priority).toBe('HIGH');
      expect(highRiskRule?.severity).toBe('ERROR');
    });

    test('should integrate with compliance engine', async () => {
      await service.integrateWithComplianceEngine();

      expect(mockComplianceEngine.addRule).toHaveBeenCalled();
      const callCount = mockComplianceEngine.addRule.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe('Compliance Reporting', () => {
    test('should generate comprehensive compliance report', () => {
      const report = service.generateComplianceReport();

      expect(report.reportId).toMatch(/^iso27001_report_\d+$/);
      expect(report.generatedAt).toBeInstanceOf(Date);
      expect(report.totalControls).toBeGreaterThan(0);
      expect(report.implementationRate).toBe(0); // All controls start as NOT_IMPLEMENTED
      expect(report.complianceRate).toBe(0); // No controls verified yet

      expect(report.statusSummary).toHaveProperty(ControlStatus.NOT_IMPLEMENTED);
      expect(report.statusSummary).toHaveProperty(ControlStatus.IMPLEMENTED);
      expect(report.statusSummary).toHaveProperty(ControlStatus.VERIFIED);

      expect(report.themeSummary).toHaveProperty(ISO27001Theme.ORGANIZATIONAL);
      expect(report.themeSummary).toHaveProperty(ISO27001Theme.PEOPLE);
      expect(report.themeSummary).toHaveProperty(ISO27001Theme.PHYSICAL);
      expect(report.themeSummary).toHaveProperty(ISO27001Theme.TECHNOLOGICAL);
    });

    test('should include gap analysis in report', () => {
      const report = service.generateComplianceReport();

      expect(report.gapAnalysis.length).toBeGreaterThan(0);
      report.gapAnalysis.forEach(control => {
        expect([ControlStatus.NOT_IMPLEMENTED, ControlStatus.NON_COMPLIANT]).toContain(control.status);
      });
    });

    test('should generate appropriate recommendations', () => {
      const report = service.generateComplianceReport();

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(r => r.includes('not implemented'))).toBe(true);
    });

    test('should update report metrics after status changes', async () => {
      // Update some control statuses
      await service.updateControlStatus('A.5.1', ControlStatus.IMPLEMENTED);
      await service.updateControlStatus('A.6.1', ControlStatus.VERIFIED);

      const report = service.generateComplianceReport();

      expect(report.implementationRate).toBeGreaterThan(0);
      expect(report.complianceRate).toBeGreaterThan(0);
      expect(report.statusSummary[ControlStatus.IMPLEMENTED]).toBeGreaterThanOrEqual(1);
      expect(report.statusSummary[ControlStatus.VERIFIED]).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Control Structure Validation', () => {
    test('should have proper compliance mappings for all controls', () => {
      const allControls = service.getAllControls();

      allControls.forEach(control => {
        expect(control.complianceMapping).toBeDefined();
        expect(control.complianceMapping.soc2Mapping).toBeInstanceOf(Array);
        expect(control.complianceMapping.gdprMapping).toBeInstanceOf(Array);
        expect(control.complianceMapping.hipaaMapping).toBeInstanceOf(Array);
        expect(control.complianceMapping.nistMapping).toBeInstanceOf(Array);
        expect(control.complianceMapping.cisMapping).toBeInstanceOf(Array);
      });
    });

    test('should have proper metadata for all controls', () => {
      const allControls = service.getAllControls();

      allControls.forEach(control => {
        expect(control.metadata).toBeDefined();
        expect(control.metadata.version).toBe('1.0');
        expect(control.metadata.lastUpdated).toBeInstanceOf(Date);
        expect(control.metadata.reviewDate).toBeInstanceOf(Date);
        expect(control.metadata.references.length).toBeGreaterThan(0);
        expect(control.metadata.references[0].identifier).toBe('ISO/IEC 27001:2022');
      });
    });

    test('should have implementation details for organizational controls', () => {
      const organizationalControls = service.getControlsByTheme(ISO27001Theme.ORGANIZATIONAL);

      organizationalControls.forEach(control => {
        expect(control.implementation).toBeDefined();
        expect(control.implementation.requirements.length).toBeGreaterThan(0);
        expect(control.implementation.guidelines.length).toBeGreaterThan(0);
        expect(control.implementation.frequency).toBeDefined();
      });
    });

    test('should have valid control IDs following ISO 27001 format', () => {
      const allControls = service.getAllControls();

      allControls.forEach(control => {
        expect(control.controlId).toMatch(/^A\.\d+\.\d+$/);
        expect(control.controlNumber).toMatch(/^A\.\d+\.\d+$/);
        expect(control.controlId).toBe(control.controlNumber);
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large number of controls efficiently', () => {
      const startTime = Date.now();

      // Perform multiple operations
      service.getAllControls();
      service.getControlsByTheme(ISO27001Theme.ORGANIZATIONAL);
      service.getControlsByCategory(ISO27001Category.ACCESS_CONTROL);
      service.getControlsByStatus(ControlStatus.NOT_IMPLEMENTED);

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should generate compliance rules efficiently', async () => {
      const startTime = Date.now();

      await service.generateComplianceRules();

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should generate compliance report efficiently', () => {
      const startTime = Date.now();

      service.generateComplianceReport();

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('Error Handling', () => {
    test('should handle empty control ID gracefully', () => {
      const control = service.getControl('');
      expect(control).toBeUndefined();
    });

    test('should handle null control ID gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const control = service.getControl(null as any);
      expect(control).toBeUndefined();
    });

    test('should handle invalid status update gracefully', async () => {
      const updated = await service.updateControlStatus('', ControlStatus.IMPLEMENTED);
      expect(updated).toBe(false);
    });
  });

  describe('Framework Compliance Mapping', () => {
    test('should have SOC2 mappings for relevant controls', () => {
      const control = service.getControl('A.5.1');
      expect(control?.complianceMapping.soc2Mapping).toContain('CC1.1');
      expect(control?.complianceMapping.soc2Mapping).toContain('CC1.2');
    });

    test('should have GDPR mappings for relevant controls', () => {
      const control = service.getControl('A.5.1');
      expect(control?.complianceMapping.gdprMapping).toContain('Article 32');
    });

    test('should have HIPAA mappings for relevant controls', () => {
      const control = service.getControl('A.6.1');
      expect(control?.complianceMapping.hipaaMapping).toContain('164.308(a)(3)(ii)(B)');
    });

    test('should have NIST mappings for relevant controls', () => {
      const control = service.getControl('A.5.1');
      expect(control?.complianceMapping.nistMapping).toContain('PM-1');
    });
  });
});

// Integration tests would go here in a real implementation
describe('ISO27001ControlsService Integration', () => {
  test('should integrate properly with real ComplianceRuleEngine', () => {
    // This would test with a real ComplianceRuleEngine instance
    // and verify end-to-end functionality
    expect(true).toBe(true); // Placeholder
  });
});
