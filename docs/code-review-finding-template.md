# Code Review Finding Template

Use this template to document findings from manual code review. Each finding should be a separate entry.

## Finding #[NUMBER]

**Date**: [YYYY-MM-DD]  
**Reviewer**: [Name]  
**Component**: [Tier 1/2/3] - [Component Name]

### Location
**File**: `[file-path]`  
**Lines**: [start-line]:[end-line]  
**Function/Method**: `[function-name]` (if applicable)

### Classification
**Category**: [Architecture | Security | Performance | Quality | Testing | Documentation]  
**Severity**: [Critical | High | Medium | Low]  
**Type**: [Bug | Code Smell | Security Vulnerability | Performance Issue | Architecture Violation]

### Description
[Clear, concise description of the issue found]

### Current Code
```typescript
// Include relevant code snippet showing the issue
```

### Issue Details
**Problem**: [Specific explanation of what's wrong]  
**Root Cause**: [Why this issue exists]  
**Impact**: [Potential consequences if not fixed]

### Recommendation
**Proposed Solution**: [Specific steps to resolve the issue]  
**Alternative Approaches**: [Other possible solutions]  
**Dependencies**: [Any prerequisites for fixing this issue]

### Effort Estimate
**Time Required**: [Hours/Days]  
**Complexity**: [Low | Medium | High]  
**Priority**: [Immediate | Next Sprint | Backlog]

### Related Issues
**Related Findings**: [References to other related findings]  
**Static Analysis**: [Reference to ESLint/other tool findings]  
**Technical Debt**: [Connection to broader technical debt]

### Validation Criteria
**Test Requirements**: [How to verify the fix works]  
**Performance Impact**: [Expected performance improvement]  
**Security Validation**: [Security testing requirements]

---

## Example Finding

## Finding #001

**Date**: 2025-07-18  
**Reviewer**: Dev Agent  
**Component**: Tier 1 - Core Runtime Engine

### Location
**File**: `packages/core/runtime/index.ts`  
**Lines**: 45:67  
**Function/Method**: `executeNode`

### Classification
**Category**: Security  
**Severity**: High  
**Type**: Security Vulnerability

### Description
Input validation bypass in node execution allows potential code injection through malformed node data.

### Current Code
```typescript
public async executeNode(node: any, context: ExecutionContext): Promise<string> {
  // Direct property access without validation
  const nodeType = node.type;
  const nodeData = node.data;
  
  return this.handlers[nodeType](nodeData, context);
}
```

### Issue Details
**Problem**: Node data is accessed directly without validation against schema  
**Root Cause**: Performance optimization bypassed validation layer  
**Impact**: Malicious node data could inject code or cause runtime errors

### Recommendation
**Proposed Solution**: 
1. Add schema validation before node execution
2. Implement input sanitization for all node properties
3. Add error handling for malformed data

**Alternative Approaches**: 
- Pre-validate at graph level (performance impact)
- Implement runtime type guards

**Dependencies**: None

### Effort Estimate
**Time Required**: 4 hours  
**Complexity**: Medium  
**Priority**: Immediate

### Related Issues
**Related Findings**: N/A  
**Static Analysis**: ESLint warning about `any` type usage  
**Technical Debt**: Part of broader input validation improvement

### Validation Criteria
**Test Requirements**: 
- Unit tests with malformed node data
- Security tests with injection attempts
- Performance regression tests

**Performance Impact**: <5ms additional validation overhead  
**Security Validation**: Penetration testing for injection vulnerabilities

---

## Finding Summary Template

Use this template to summarize all findings at the end of review:

# Code Review Summary - [Component Name]

**Review Date**: [YYYY-MM-DD]  
**Reviewer(s)**: [Names]  
**Files Reviewed**: [Count]  
**Total Findings**: [Count]

## Findings by Severity
- **Critical**: [Count] findings
- **High**: [Count] findings  
- **Medium**: [Count] findings
- **Low**: [Count] findings

## Findings by Category
- **Security**: [Count] findings
- **Performance**: [Count] findings
- **Architecture**: [Count] findings
- **Quality**: [Count] findings
- **Testing**: [Count] findings

## Top Priority Issues
1. [Finding #XXX]: [Brief description] - [Severity]
2. [Finding #XXX]: [Brief description] - [Severity]  
3. [Finding #XXX]: [Brief description] - [Severity]

## Overall Assessment
**Code Quality Score**: [1-10]  
**Security Posture**: [Strong | Adequate | Needs Improvement | Poor]  
**Maintainability**: [High | Medium | Low]  
**Performance**: [Excellent | Good | Adequate | Poor]

## Recommendations
1. **Immediate Actions**: [Critical and high-severity items]
2. **Next Sprint**: [Medium-severity improvements]
3. **Technical Debt**: [Long-term architectural improvements]

## Sign-off
**Reviewer Signature**: [Name, Date]  
**Approved for**: [Production | Further Review | Major Refactoring Required]