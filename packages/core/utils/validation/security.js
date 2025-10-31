"use strict";
/**
 * Security Validation Framework
 * Provides sanitisation and validation helpers to prevent code injection,
 * prototype pollution, and other dangerous patterns when handling user data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityTesting = exports.SecureValidation = exports.SecurityValidation = exports.VARIABLE_NAME_MAX_LENGTH = exports.VARIABLE_NAME_PATTERN = void 0;
const zod_1 = require("zod");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

exports.VARIABLE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
exports.VARIABLE_NAME_MAX_LENGTH = 64;

const DANGEROUS_PATTERNS = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /constructor/gi,
  /prototype/gi,
  /__proto__/gi,
  /\.__defineGetter__/gi,
  /\.__defineSetter__/gi,
  /\.__lookupGetter__/gi,
  /\.__lookupSetter__/gi,
  /require\s*\(/gi,
  /import\s*\(/gi,
  /process\./gi,
  /global\./gi,
  /Buffer\./gi,
  /`.*\$\{.*\}/gi,
  /\$\{.*\}/gi,
  /new\s+Function/gi,
  /=>\s*{?/gi,
  /\bwith\s*\(/gi,
  /\bdocument\./gi,
  /\bwindow\./gi,
  /\blocation\./gi,
  /\bhistory\./gi,
  /\bnavigator\./gi,
  /\bfs\./gi,
  /\bpath\./gi,
  /\bos\./gi,
  /\bchild_process\b/gi,
  /\bcluster\b/gi,
  /\bcrypto\b/gi,
  /\bhttp\b/gi,
  /\bhttps\b/gi,
  /\bnet\b/gi,
  /\burl\b/gi,
  /\butil\b/gi,
  /\bvm\b/gi,
  /\bworker_threads\b/gi,
];

const DANGEROUS_EXPRESSION_PATTERNS = [
  /function\s*\(/gi,
  /=\s*>/gi,
  /\bthis\b/gi,
  /\bself\b/gi,
  /\btop\b/gi,
  /\bparent\b/gi,
  /\bframes\b/gi,
  /\balert\b/gi,
  /\bconfirm\b/gi,
  /\bprompt\b/gi,
  /\bsetTimeout\b/gi,
  /\bsetInterval\b/gi,
  /\bsetImmediate\b/gi,
  /\brequestAnimationFrame\b/gi,
];

const BASIC_SAFE_EXPRESSION_PATTERN =
  /^[a-zA-Z0-9_$\s.[\]()=<>!+\-*/%&|'"?,:]+$/;

const DANGEROUS_PROPERTY_NAMES = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf",
  "eval",
  "Function",
]);

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

class SecurityValidation {
  static validateSafeString(value) {
    if (typeof value !== "string") {
      return false;
    }

    for (const pattern of DANGEROUS_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(value)) {
        return false;
      }
    }

    return true;
  }

  static validateSafeExpression(expression) {
    if (typeof expression !== "string") {
      return false;
    }

    if (expression.length === 0) {
      return true;
    }

    if (expression.length > 500) {
      return false;
    }

    if (!SecurityValidation.validateSafeString(expression)) {
      return false;
    }

    for (const pattern of DANGEROUS_EXPRESSION_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(expression)) {
        return false;
      }
    }

    if (!BASIC_SAFE_EXPRESSION_PATTERN.test(expression)) {
      return false;
    }

    return true;
  }

  static validateVariableName(name) {
    if (typeof name !== "string") {
      return false;
    }

    if (
      name.length === 0 ||
      name.length > exports.VARIABLE_NAME_MAX_LENGTH ||
      !exports.VARIABLE_NAME_PATTERN.test(name)
    ) {
      return false;
    }

    return SecurityValidation.validateSafePropertyKey(name);
  }

  static validateSafePropertyKey(key) {
    if (typeof key !== "string") {
      return false;
    }

    if (
      key.length === 0 ||
      key.length > exports.VARIABLE_NAME_MAX_LENGTH ||
      !exports.VARIABLE_NAME_PATTERN.test(key)
    ) {
      return false;
    }

    if (DANGEROUS_PROPERTY_NAMES.has(key)) {
      return false;
    }

    if (
      key.includes("__proto__") ||
      key.includes("constructor") ||
      key.includes("prototype")
    ) {
      return false;
    }

    return true;
  }

  static validateSafeValue(value) {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === "string") {
      return (
        value.length <= 10000 &&
        SecurityValidation.validateSafeString(value)
      );
    }

    if (typeof value === "number") {
      return Number.isFinite(value);
    }

    if (typeof value === "boolean") {
      return true;
    }

    if (Array.isArray(value)) {
      if (value.length > 1000) {
        return false;
      }

      return value.every((item) => SecurityValidation.validateSafeValue(item));
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length > 100) {
        return false;
      }

      for (const key of keys) {
        if (
          !SecurityValidation.validateSafePropertyKey(key) ||
          !SecurityValidation.validateSafeValue(value[key])
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  static sanitizeString(value) {
    if (typeof value !== "string") {
      return "";
    }

    let sanitized = value;

    for (const pattern of DANGEROUS_PATTERNS) {
      pattern.lastIndex = 0;
      sanitized = sanitized.replace(pattern, "");
    }

    sanitized = sanitized.trim();

    if (sanitized.length > 10000) {
      sanitized = sanitized.slice(0, 10000);
    }

    return sanitized;
  }

  static safePropertyAccess(obj, key, fallback = null) {
    if (!obj || typeof obj !== "object") {
      return fallback;
    }

    if (!SecurityValidation.validateSafePropertyKey(key)) {
      return fallback;
    }

    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      return fallback;
    }

    return obj[key];
  }
}

exports.SecurityValidation = SecurityValidation;

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

exports.SecureValidation = {
  safeString: (maxLength = 10000) =>
    zod_1.z
      .string()
      .max(maxLength, `String must be no longer than ${maxLength} characters`)
      .refine(SecurityValidation.validateSafeString, {
        message: "String contains dangerous patterns",
      }),

  safeExpression: (maxLength = 500) =>
    zod_1.z
      .string()
      .max(
        maxLength,
        `Expression must be no longer than ${maxLength} characters`
      )
      .refine(SecurityValidation.validateSafeExpression, {
        message: "Expression contains unsafe patterns",
      }),

  safePropertyKey: (maxLength = exports.VARIABLE_NAME_MAX_LENGTH) =>
    zod_1.z
      .string()
      .max(
        maxLength,
        `Property key must be no longer than ${maxLength} characters`
      )
      .refine(SecurityValidation.validateSafePropertyKey, {
        message: "Property key contains dangerous patterns",
      }),

  variableName: () =>
    zod_1.z
      .string()
      .min(1, "Variable name cannot be empty")
      .max(
        exports.VARIABLE_NAME_MAX_LENGTH,
        `Variable name must be no longer than ${exports.VARIABLE_NAME_MAX_LENGTH} characters`
      )
      .regex(
        exports.VARIABLE_NAME_PATTERN,
        "Variable name must contain only letters, numbers, underscore, or dash"
      )
      .refine(SecurityValidation.validateVariableName, {
        message: "Variable name contains reserved keywords or dangerous patterns",
      }),

  safeValue: () =>
    zod_1.z.union([
      zod_1.z
        .string()
        .max(10000)
        .refine(SecurityValidation.validateSafeString, {
          message: "String value contains dangerous patterns",
        }),
      zod_1.z
        .number()
        .finite()
        .refine((val) => !Number.isNaN(val), {
          message: "Number value must be finite",
        }),
      zod_1.z.boolean(),
      zod_1.z
        .array(zod_1.z.any())
        .max(1000)
        .refine(
          (values) =>
            values.every((item) => SecurityValidation.validateSafeValue(item)),
          { message: "Array contains dangerous values" }
        ),
      zod_1.z
        .record(zod_1.z.any())
        .refine(
          (record) => {
            const keys = Object.keys(record);
            if (keys.length > 100) {
              return false;
            }

            return keys.every((key) =>
              SecurityValidation.validateSafePropertyKey(key)
            );
          },
          { message: "Object contains dangerous property keys" }
        )
        .refine(
          (record) =>
            Object.values(record).every((value) =>
              SecurityValidation.validateSafeValue(value)
            ),
          { message: "Object contains dangerous values" }
        ),
      zod_1.z.null(),
      zod_1.z.undefined(),
    ]),

  safeArray: (itemSchema, maxLength = 1000) =>
    zod_1.z.array(itemSchema).max(maxLength, `Array must contain no more than ${maxLength} items`),

  safeObject: (valueSchema, maxKeys = 100) =>
    zod_1.z
      .record(valueSchema)
      .refine(
        (value) => Object.keys(value).length <= maxKeys,
        { message: `Object must contain no more than ${maxKeys} properties` }
      )
      .refine(
        (value) =>
          Object.keys(value).every((key) =>
            SecurityValidation.validateSafePropertyKey(key)
          ),
        { message: "Object contains dangerous property keys" }
      ),
};

// ---------------------------------------------------------------------------
// Testing helpers
// ---------------------------------------------------------------------------

class SecurityTesting {
  static testInjectionProtection(validator, testName = "Unknown") {
    let passed = 0;
    let failed = 0;
    const failedPatterns = [];

    for (const pattern of SecurityTesting.INJECTION_PATTERNS) {
      const isBlocked = !validator(pattern);
      if (isBlocked) {
        passed += 1;
      } else {
        failed += 1;
        failedPatterns.push(pattern);
      }
    }

    return {
      passed,
      failed,
      failedPatterns,
      summary: `Security Test [${testName}]: ${passed} passed, ${failed} failed`,
    };
  }

  static runSecurityTests() {
    const stringTest = SecurityTesting.testInjectionProtection(
      SecurityValidation.validateSafeString,
      "Safe String Validation"
    );

    const expressionTest = SecurityTesting.testInjectionProtection(
      SecurityValidation.validateSafeExpression,
      "Safe Expression Validation"
    );

    const keyTest = SecurityTesting.testInjectionProtection(
      SecurityValidation.validateSafePropertyKey,
      "Safe Property Key Validation"
    );

    const totalPassed =
      stringTest.passed + expressionTest.passed + keyTest.passed;
    const totalFailed =
      stringTest.failed + expressionTest.failed + keyTest.failed;

    return {
      totalPassed,
      totalFailed,
      results: {
        stringTest,
        expressionTest,
        keyTest,
      },
      success: totalFailed === 0,
    };
  }
}

exports.SecurityTesting = SecurityTesting;

SecurityTesting.INJECTION_PATTERNS = [
  'eval("alert(1)")',
  'constructor.constructor("alert(1)")()',
  "__proto__.polluted = true",
  "prototype.polluted = true",
  'this.constructor.constructor("alert(1)")()',
  'Function("alert(1)")()',
  "(() => { alert(1); })()",
  "`${alert(1)}`",
  "document.cookie",
  "window.location",
  'require("fs")',
  'import("fs")',
  "process.exit()",
  "global.process",
  'Buffer.from("test")',
];

exports.default = SecurityValidation;
