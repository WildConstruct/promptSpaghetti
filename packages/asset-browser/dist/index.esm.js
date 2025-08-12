import h, { useEffect as ot, useRef as ts, useState as Z, useMemo as ss, createContext as Tr } from "react";
import { create as Ar } from "zustand";
import Cr from "fuse.js";
import { FixedSizeGrid as Or } from "react-window";
var D;
(function(r) {
  r.assertEqual = (n) => {
  };
  function e(n) {
  }
  r.assertIs = e;
  function t(n) {
    throw new Error();
  }
  r.assertNever = t, r.arrayToEnum = (n) => {
    const i = {};
    for (const a of n)
      i[a] = a;
    return i;
  }, r.getValidEnumValues = (n) => {
    const i = r.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), a = {};
    for (const o of i)
      a[o] = n[o];
    return r.objectValues(a);
  }, r.objectValues = (n) => r.objectKeys(n).map(function(i) {
    return n[i];
  }), r.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const i = [];
    for (const a in n)
      Object.prototype.hasOwnProperty.call(n, a) && i.push(a);
    return i;
  }, r.find = (n, i) => {
    for (const a of n)
      if (i(a))
        return a;
  }, r.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function s(n, i = " | ") {
    return n.map((a) => typeof a == "string" ? `'${a}'` : a).join(i);
  }
  r.joinValues = s, r.jsonStringifyReplacer = (n, i) => typeof i == "bigint" ? i.toString() : i;
})(D || (D = {}));
var us;
(function(r) {
  r.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(us || (us = {}));
const A = D.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), fe = (r) => {
  switch (typeof r) {
    case "undefined":
      return A.undefined;
    case "string":
      return A.string;
    case "number":
      return Number.isNaN(r) ? A.nan : A.number;
    case "boolean":
      return A.boolean;
    case "function":
      return A.function;
    case "bigint":
      return A.bigint;
    case "symbol":
      return A.symbol;
    case "object":
      return Array.isArray(r) ? A.array : r === null ? A.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? A.promise : typeof Map < "u" && r instanceof Map ? A.map : typeof Set < "u" && r instanceof Set ? A.set : typeof Date < "u" && r instanceof Date ? A.date : A.object;
    default:
      return A.unknown;
  }
}, _ = D.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class ue extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (s) => {
      this.issues = [...this.issues, s];
    }, this.addIssues = (s = []) => {
      this.issues = [...this.issues, ...s];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(i) {
      return i.message;
    }, s = { _errors: [] }, n = (i) => {
      for (const a of i.issues)
        if (a.code === "invalid_union")
          a.unionErrors.map(n);
        else if (a.code === "invalid_return_type")
          n(a.returnTypeError);
        else if (a.code === "invalid_arguments")
          n(a.argumentsError);
        else if (a.path.length === 0)
          s._errors.push(t(a));
        else {
          let o = s, l = 0;
          for (; l < a.path.length; ) {
            const c = a.path[l];
            l === a.path.length - 1 ? (o[c] = o[c] || { _errors: [] }, o[c]._errors.push(t(a))) : o[c] = o[c] || { _errors: [] }, o = o[c], l++;
          }
        }
    };
    return n(this), s;
  }
  static assert(e) {
    if (!(e instanceof ue))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, D.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, s = [];
    for (const n of this.issues)
      if (n.path.length > 0) {
        const i = n.path[0];
        t[i] = t[i] || [], t[i].push(e(n));
      } else
        s.push(e(n));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
ue.create = (r) => new ue(r);
const Nt = (r, e) => {
  let t;
  switch (r.code) {
    case _.invalid_type:
      r.received === A.undefined ? t = "Required" : t = `Expected ${r.expected}, received ${r.received}`;
      break;
    case _.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(r.expected, D.jsonStringifyReplacer)}`;
      break;
    case _.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${D.joinValues(r.keys, ", ")}`;
      break;
    case _.invalid_union:
      t = "Invalid input";
      break;
    case _.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${D.joinValues(r.options)}`;
      break;
    case _.invalid_enum_value:
      t = `Invalid enum value. Expected ${D.joinValues(r.options)}, received '${r.received}'`;
      break;
    case _.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case _.invalid_return_type:
      t = "Invalid function return type";
      break;
    case _.invalid_date:
      t = "Invalid date";
      break;
    case _.invalid_string:
      typeof r.validation == "object" ? "includes" in r.validation ? (t = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? t = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? t = `Invalid input: must end with "${r.validation.endsWith}"` : D.assertNever(r.validation) : r.validation !== "regex" ? t = `Invalid ${r.validation}` : t = "Invalid";
      break;
    case _.too_small:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "bigint" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : t = "Invalid input";
      break;
    case _.too_big:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? t = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : t = "Invalid input";
      break;
    case _.custom:
      t = "Invalid input";
      break;
    case _.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case _.not_multiple_of:
      t = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case _.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, D.assertNever(r);
  }
  return { message: t };
};
let jr = Nt;
function Rr() {
  return jr;
}
const Ir = (r) => {
  const { data: e, path: t, errorMaps: s, issueData: n } = r, i = [...t, ...n.path || []], a = {
    ...n,
    path: i
  };
  if (n.message !== void 0)
    return {
      ...n,
      path: i,
      message: n.message
    };
  let o = "";
  const l = s.filter((c) => !!c).slice().reverse();
  for (const c of l)
    o = c(a, { data: e, defaultError: o }).message;
  return {
    ...n,
    path: i,
    message: o
  };
};
function E(r, e) {
  const t = Rr(), s = Ir({
    issueData: e,
    data: r.data,
    path: r.path,
    errorMaps: [
      r.common.contextualErrorMap,
      // contextual error map is first priority
      r.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === Nt ? void 0 : Nt
      // then global default map
    ].filter((n) => !!n)
  });
  r.common.issues.push(s);
}
class H {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    const s = [];
    for (const n of t) {
      if (n.status === "aborted")
        return I;
      n.status === "dirty" && e.dirty(), s.push(n.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const n of t) {
      const i = await n.key, a = await n.value;
      s.push({
        key: i,
        value: a
      });
    }
    return H.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const n of t) {
      const { key: i, value: a } = n;
      if (i.status === "aborted" || a.status === "aborted")
        return I;
      i.status === "dirty" && e.dirty(), a.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof a.value < "u" || n.alwaysSet) && (s[i.value] = a.value);
    }
    return { status: e.value, value: s };
  }
}
const I = Object.freeze({
  status: "aborted"
}), ze = (r) => ({ status: "dirty", value: r }), ee = (r) => ({ status: "valid", value: r }), ds = (r) => r.status === "aborted", hs = (r) => r.status === "dirty", Pe = (r) => r.status === "valid", lt = (r) => typeof Promise < "u" && r instanceof Promise;
var O;
(function(r) {
  r.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, r.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(O || (O = {}));
class ie {
  constructor(e, t, s, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const fs = (r, e) => {
  if (Pe(e))
    return { success: !0, data: e.value };
  if (!r.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new ue(r.common.issues);
      return this._error = t, this._error;
    }
  };
};
function N(r) {
  if (!r)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: n } = r;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (a, o) => {
    const { message: l } = r;
    return a.code === "invalid_enum_value" ? { message: l ?? o.defaultError } : typeof o.data > "u" ? { message: l ?? s ?? o.defaultError } : a.code !== "invalid_type" ? { message: o.defaultError } : { message: l ?? t ?? o.defaultError };
  }, description: n };
}
class U {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return fe(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: fe(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new H(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: fe(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (lt(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const s = this.safeParse(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  safeParse(e, t) {
    const s = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: fe(e)
    }, n = this._parseSync({ data: e, path: s.path, parent: s });
    return fs(s, n);
  }
  "~validate"(e) {
    var s, n;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: fe(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return Pe(i) ? {
          value: i.value
        } : {
          issues: t.common.issues
        };
      } catch (i) {
        (n = (s = i == null ? void 0 : i.message) == null ? void 0 : s.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => Pe(i) ? {
      value: i.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const s = await this.safeParseAsync(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  async safeParseAsync(e, t) {
    const s = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: fe(e)
    }, n = this._parse({ data: e, path: s.path, parent: s }), i = await (lt(n) ? n : Promise.resolve(n));
    return fs(s, i);
  }
  refine(e, t) {
    const s = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, i) => {
      const a = e(n), o = () => i.addIssue({
        code: _.custom,
        ...s(n)
      });
      return typeof Promise < "u" && a instanceof Promise ? a.then((l) => l ? !0 : (o(), !1)) : a ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, n) => e(s) ? !0 : (n.addIssue(typeof t == "function" ? t(s, n) : t), !1));
  }
  _refinement(e) {
    return new Le({
      schema: this,
      typeName: R.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (t) => this["~validate"](t)
    };
  }
  optional() {
    return ge.create(this, this._def);
  }
  nullable() {
    return Ue.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ne.create(this);
  }
  promise() {
    return ft.create(this, this._def);
  }
  or(e) {
    return ut.create([this, e], this._def);
  }
  and(e) {
    return dt.create(this, e, this._def);
  }
  transform(e) {
    return new Le({
      ...N(this._def),
      schema: this,
      typeName: R.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Bt({
      ...N(this._def),
      innerType: this,
      defaultValue: t,
      typeName: R.ZodDefault
    });
  }
  brand() {
    return new tn({
      typeName: R.ZodBranded,
      type: this,
      ...N(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Ft({
      ...N(this._def),
      innerType: this,
      catchValue: t,
      typeName: R.ZodCatch
    });
  }
  describe(e) {
    const t = this.constructor;
    return new t({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return rs.create(this, e);
  }
  readonly() {
    return qt.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Pr = /^c[^\s-]{8,}$/i, $r = /^[0-9a-z]+$/, Nr = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Lr = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Ur = /^[a-z0-9_-]{21}$/i, Dr = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Mr = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Br = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Fr = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let xt;
const qr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, zr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Wr = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Vr = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Zr = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Kr = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Ks = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Hr = new RegExp(`^${Ks}$`);
function Hs(r) {
  let e = "[0-5]\\d";
  r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = r.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Gr(r) {
  return new RegExp(`^${Hs(r)}$`);
}
function Jr(r) {
  let e = `${Ks}T${Hs(r)}`;
  const t = [];
  return t.push(r.local ? "Z?" : "Z"), r.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Qr(r, e) {
  return !!((e === "v4" || !e) && qr.test(r) || (e === "v6" || !e) && Wr.test(r));
}
function Yr(r, e) {
  if (!Dr.test(r))
    return !1;
  try {
    const [t] = r.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(s));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function Xr(r, e) {
  return !!((e === "v4" || !e) && zr.test(r) || (e === "v6" || !e) && Vr.test(r));
}
class ce extends U {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== A.string) {
      const i = this._getOrReturnCtx(e);
      return E(i, {
        code: _.invalid_type,
        expected: A.string,
        received: i.parsedType
      }), I;
    }
    const s = new H();
    let n;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (n = this._getOrReturnCtx(e, n), E(n, {
          code: _.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), s.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (n = this._getOrReturnCtx(e, n), E(n, {
          code: _.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), s.dirty());
      else if (i.kind === "length") {
        const a = e.data.length > i.value, o = e.data.length < i.value;
        (a || o) && (n = this._getOrReturnCtx(e, n), a ? E(n, {
          code: _.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : o && E(n, {
          code: _.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), s.dirty());
      } else if (i.kind === "email")
        Br.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "email",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "emoji")
        xt || (xt = new RegExp(Fr, "u")), xt.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "emoji",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "uuid")
        Lr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "uuid",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "nanoid")
        Ur.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "nanoid",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid")
        Pr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "cuid",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "cuid2")
        $r.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "cuid2",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "ulid")
        Nr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
          validation: "ulid",
          code: _.invalid_string,
          message: i.message
        }), s.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), E(n, {
            validation: "url",
            code: _.invalid_string,
            message: i.message
          }), s.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "regex",
        code: _.invalid_string,
        message: i.message
      }), s.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), s.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), s.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), s.dirty()) : i.kind === "datetime" ? Jr(i).test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.invalid_string,
        validation: "datetime",
        message: i.message
      }), s.dirty()) : i.kind === "date" ? Hr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.invalid_string,
        validation: "date",
        message: i.message
      }), s.dirty()) : i.kind === "time" ? Gr(i).test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.invalid_string,
        validation: "time",
        message: i.message
      }), s.dirty()) : i.kind === "duration" ? Mr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "duration",
        code: _.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "ip" ? Qr(e.data, i.version) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "ip",
        code: _.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "jwt" ? Yr(e.data, i.alg) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "jwt",
        code: _.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "cidr" ? Xr(e.data, i.version) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "cidr",
        code: _.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64" ? Zr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "base64",
        code: _.invalid_string,
        message: i.message
      }), s.dirty()) : i.kind === "base64url" ? Kr.test(e.data) || (n = this._getOrReturnCtx(e, n), E(n, {
        validation: "base64url",
        code: _.invalid_string,
        message: i.message
      }), s.dirty()) : D.assertNever(i);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: _.invalid_string,
      ...O.errToObj(s)
    });
  }
  _addCheck(e) {
    return new ce({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...O.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...O.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...O.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...O.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...O.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...O.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...O.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...O.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...O.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...O.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...O.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...O.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...O.errToObj(e) });
  }
  datetime(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      offset: (e == null ? void 0 : e.offset) ?? !1,
      local: (e == null ? void 0 : e.local) ?? !1,
      ...O.errToObj(e == null ? void 0 : e.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      ...O.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...O.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...O.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...O.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...O.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...O.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...O.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...O.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...O.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, O.errToObj(e));
  }
  trim() {
    return new ce({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ce({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ce({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((e) => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((e) => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
ce.create = (r) => new ce({
  checks: [],
  typeName: R.ZodString,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...N(r)
});
function en(r, e) {
  const t = (r.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, n = t > s ? t : s, i = Number.parseInt(r.toFixed(n).replace(".", "")), a = Number.parseInt(e.toFixed(n).replace(".", ""));
  return i % a / 10 ** n;
}
class $e extends U {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== A.number) {
      const i = this._getOrReturnCtx(e);
      return E(i, {
        code: _.invalid_type,
        expected: A.number,
        received: i.parsedType
      }), I;
    }
    let s;
    const n = new H();
    for (const i of this._def.checks)
      i.kind === "int" ? D.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), n.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), n.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), n.dirty()) : i.kind === "multipleOf" ? en(e.data, i.value) !== 0 && (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), n.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.not_finite,
        message: i.message
      }), n.dirty()) : D.assertNever(i);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, O.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, O.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, O.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, O.toString(t));
  }
  setLimit(e, t, s, n) {
    return new $e({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: O.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new $e({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: O.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: O.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: O.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: O.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: O.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: O.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: O.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: O.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: O.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && D.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const s of this._def.checks) {
      if (s.kind === "finite" || s.kind === "int" || s.kind === "multipleOf")
        return !0;
      s.kind === "min" ? (t === null || s.value > t) && (t = s.value) : s.kind === "max" && (e === null || s.value < e) && (e = s.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
$e.create = (r) => new $e({
  checks: [],
  typeName: R.ZodNumber,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...N(r)
});
class He extends U {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce)
      try {
        e.data = BigInt(e.data);
      } catch {
        return this._getInvalidInput(e);
      }
    if (this._getType(e) !== A.bigint)
      return this._getInvalidInput(e);
    let s;
    const n = new H();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), n.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), n.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), E(s, {
        code: _.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), n.dirty()) : D.assertNever(i);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return E(t, {
      code: _.invalid_type,
      expected: A.bigint,
      received: t.parsedType
    }), I;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, O.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, O.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, O.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, O.toString(t));
  }
  setLimit(e, t, s, n) {
    return new He({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: O.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new He({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: O.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: O.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: O.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: O.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: O.toString(t)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
He.create = (r) => new He({
  checks: [],
  typeName: R.ZodBigInt,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...N(r)
});
class ps extends U {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== A.boolean) {
      const s = this._getOrReturnCtx(e);
      return E(s, {
        code: _.invalid_type,
        expected: A.boolean,
        received: s.parsedType
      }), I;
    }
    return ee(e.data);
  }
}
ps.create = (r) => new ps({
  typeName: R.ZodBoolean,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...N(r)
});
class ct extends U {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== A.date) {
      const i = this._getOrReturnCtx(e);
      return E(i, {
        code: _.invalid_type,
        expected: A.date,
        received: i.parsedType
      }), I;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return E(i, {
        code: _.invalid_date
      }), I;
    }
    const s = new H();
    let n;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), s.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (n = this._getOrReturnCtx(e, n), E(n, {
        code: _.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), s.dirty()) : D.assertNever(i);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new ct({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: O.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: O.toString(t)
    });
  }
  get minDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
}
ct.create = (r) => new ct({
  checks: [],
  coerce: (r == null ? void 0 : r.coerce) || !1,
  typeName: R.ZodDate,
  ...N(r)
});
class gs extends U {
  _parse(e) {
    if (this._getType(e) !== A.symbol) {
      const s = this._getOrReturnCtx(e);
      return E(s, {
        code: _.invalid_type,
        expected: A.symbol,
        received: s.parsedType
      }), I;
    }
    return ee(e.data);
  }
}
gs.create = (r) => new gs({
  typeName: R.ZodSymbol,
  ...N(r)
});
class ms extends U {
  _parse(e) {
    if (this._getType(e) !== A.undefined) {
      const s = this._getOrReturnCtx(e);
      return E(s, {
        code: _.invalid_type,
        expected: A.undefined,
        received: s.parsedType
      }), I;
    }
    return ee(e.data);
  }
}
ms.create = (r) => new ms({
  typeName: R.ZodUndefined,
  ...N(r)
});
class ys extends U {
  _parse(e) {
    if (this._getType(e) !== A.null) {
      const s = this._getOrReturnCtx(e);
      return E(s, {
        code: _.invalid_type,
        expected: A.null,
        received: s.parsedType
      }), I;
    }
    return ee(e.data);
  }
}
ys.create = (r) => new ys({
  typeName: R.ZodNull,
  ...N(r)
});
class Lt extends U {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return ee(e.data);
  }
}
Lt.create = (r) => new Lt({
  typeName: R.ZodAny,
  ...N(r)
});
class Ut extends U {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return ee(e.data);
  }
}
Ut.create = (r) => new Ut({
  typeName: R.ZodUnknown,
  ...N(r)
});
class me extends U {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return E(t, {
      code: _.invalid_type,
      expected: A.never,
      received: t.parsedType
    }), I;
  }
}
me.create = (r) => new me({
  typeName: R.ZodNever,
  ...N(r)
});
class vs extends U {
  _parse(e) {
    if (this._getType(e) !== A.undefined) {
      const s = this._getOrReturnCtx(e);
      return E(s, {
        code: _.invalid_type,
        expected: A.void,
        received: s.parsedType
      }), I;
    }
    return ee(e.data);
  }
}
vs.create = (r) => new vs({
  typeName: R.ZodVoid,
  ...N(r)
});
class ne extends U {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== A.array)
      return E(t, {
        code: _.invalid_type,
        expected: A.array,
        received: t.parsedType
      }), I;
    if (n.exactLength !== null) {
      const a = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (a || o) && (E(t, {
        code: a ? _.too_big : _.too_small,
        minimum: o ? n.exactLength.value : void 0,
        maximum: a ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), s.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (E(t, {
      code: _.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), s.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (E(t, {
      code: _.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((a, o) => n.type._parseAsync(new ie(t, a, t.path, o)))).then((a) => H.mergeArray(s, a));
    const i = [...t.data].map((a, o) => n.type._parseSync(new ie(t, a, t.path, o)));
    return H.mergeArray(s, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new ne({
      ...this._def,
      minLength: { value: e, message: O.toString(t) }
    });
  }
  max(e, t) {
    return new ne({
      ...this._def,
      maxLength: { value: e, message: O.toString(t) }
    });
  }
  length(e, t) {
    return new ne({
      ...this._def,
      exactLength: { value: e, message: O.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ne.create = (r, e) => new ne({
  type: r,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: R.ZodArray,
  ...N(e)
});
function je(r) {
  if (r instanceof z) {
    const e = {};
    for (const t in r.shape) {
      const s = r.shape[t];
      e[t] = ge.create(je(s));
    }
    return new z({
      ...r._def,
      shape: () => e
    });
  } else return r instanceof ne ? new ne({
    ...r._def,
    type: je(r.element)
  }) : r instanceof ge ? ge.create(je(r.unwrap())) : r instanceof Ue ? Ue.create(je(r.unwrap())) : r instanceof ke ? ke.create(r.items.map((e) => je(e))) : r;
}
class z extends U {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = D.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== A.object) {
      const c = this._getOrReturnCtx(e);
      return E(c, {
        code: _.invalid_type,
        expected: A.object,
        received: c.parsedType
      }), I;
    }
    const { status: s, ctx: n } = this._processInputParams(e), { shape: i, keys: a } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof me && this._def.unknownKeys === "strip"))
      for (const c in n.data)
        a.includes(c) || o.push(c);
    const l = [];
    for (const c of a) {
      const u = i[c], d = n.data[c];
      l.push({
        key: { status: "valid", value: c },
        value: u._parse(new ie(n, d, n.path, c)),
        alwaysSet: c in n.data
      });
    }
    if (this._def.catchall instanceof me) {
      const c = this._def.unknownKeys;
      if (c === "passthrough")
        for (const u of o)
          l.push({
            key: { status: "valid", value: u },
            value: { status: "valid", value: n.data[u] }
          });
      else if (c === "strict")
        o.length > 0 && (E(n, {
          code: _.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (c !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const c = this._def.catchall;
      for (const u of o) {
        const d = n.data[u];
        l.push({
          key: { status: "valid", value: u },
          value: c._parse(
            new ie(n, d, n.path, u)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: u in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const c = [];
      for (const u of l) {
        const d = await u.key, f = await u.value;
        c.push({
          key: d,
          value: f,
          alwaysSet: u.alwaysSet
        });
      }
      return c;
    }).then((c) => H.mergeObjectSync(s, c)) : H.mergeObjectSync(s, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return O.errToObj, new z({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var i, a;
          const n = ((a = (i = this._def).errorMap) == null ? void 0 : a.call(i, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: O.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new z({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new z({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new z({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new z({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: R.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new z({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of D.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new z({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of D.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new z({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return je(this);
  }
  partial(e) {
    const t = {};
    for (const s of D.objectKeys(this.shape)) {
      const n = this.shape[s];
      e && !e[s] ? t[s] = n : t[s] = n.optional();
    }
    return new z({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of D.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let i = this.shape[s];
        for (; i instanceof ge; )
          i = i._def.innerType;
        t[s] = i;
      }
    return new z({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Gs(D.objectKeys(this.shape));
  }
}
z.create = (r, e) => new z({
  shape: () => r,
  unknownKeys: "strip",
  catchall: me.create(),
  typeName: R.ZodObject,
  ...N(e)
});
z.strictCreate = (r, e) => new z({
  shape: () => r,
  unknownKeys: "strict",
  catchall: me.create(),
  typeName: R.ZodObject,
  ...N(e)
});
z.lazycreate = (r, e) => new z({
  shape: r,
  unknownKeys: "strip",
  catchall: me.create(),
  typeName: R.ZodObject,
  ...N(e)
});
class ut extends U {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function n(i) {
      for (const o of i)
        if (o.result.status === "valid")
          return o.result;
      for (const o of i)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const a = i.map((o) => new ue(o.ctx.common.issues));
      return E(t, {
        code: _.invalid_union,
        unionErrors: a
      }), I;
    }
    if (t.common.async)
      return Promise.all(s.map(async (i) => {
        const a = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await i._parseAsync({
            data: t.data,
            path: t.path,
            parent: a
          }),
          ctx: a
        };
      })).then(n);
    {
      let i;
      const a = [];
      for (const l of s) {
        const c = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, u = l._parseSync({
          data: t.data,
          path: t.path,
          parent: c
        });
        if (u.status === "valid")
          return u;
        u.status === "dirty" && !i && (i = { result: u, ctx: c }), c.common.issues.length && a.push(c.common.issues);
      }
      if (i)
        return t.common.issues.push(...i.ctx.common.issues), i.result;
      const o = a.map((l) => new ue(l));
      return E(t, {
        code: _.invalid_union,
        unionErrors: o
      }), I;
    }
  }
  get options() {
    return this._def.options;
  }
}
ut.create = (r, e) => new ut({
  options: r,
  typeName: R.ZodUnion,
  ...N(e)
});
function Dt(r, e) {
  const t = fe(r), s = fe(e);
  if (r === e)
    return { valid: !0, data: r };
  if (t === A.object && s === A.object) {
    const n = D.objectKeys(e), i = D.objectKeys(r).filter((o) => n.indexOf(o) !== -1), a = { ...r, ...e };
    for (const o of i) {
      const l = Dt(r[o], e[o]);
      if (!l.valid)
        return { valid: !1 };
      a[o] = l.data;
    }
    return { valid: !0, data: a };
  } else if (t === A.array && s === A.array) {
    if (r.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i], o = e[i], l = Dt(a, o);
      if (!l.valid)
        return { valid: !1 };
      n.push(l.data);
    }
    return { valid: !0, data: n };
  } else return t === A.date && s === A.date && +r == +e ? { valid: !0, data: r } : { valid: !1 };
}
class dt extends U {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = (i, a) => {
      if (ds(i) || ds(a))
        return I;
      const o = Dt(i.value, a.value);
      return o.valid ? ((hs(i) || hs(a)) && t.dirty(), { status: t.value, value: o.data }) : (E(s, {
        code: _.invalid_intersection_types
      }), I);
    };
    return s.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      }),
      this._def.right._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      })
    ]).then(([i, a]) => n(i, a)) : n(this._def.left._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }), this._def.right._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }));
  }
}
dt.create = (r, e, t) => new dt({
  left: r,
  right: e,
  typeName: R.ZodIntersection,
  ...N(t)
});
class ke extends U {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== A.array)
      return E(s, {
        code: _.invalid_type,
        expected: A.array,
        received: s.parsedType
      }), I;
    if (s.data.length < this._def.items.length)
      return E(s, {
        code: _.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), I;
    !this._def.rest && s.data.length > this._def.items.length && (E(s, {
      code: _.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...s.data].map((a, o) => {
      const l = this._def.items[o] || this._def.rest;
      return l ? l._parse(new ie(s, a, s.path, o)) : null;
    }).filter((a) => !!a);
    return s.common.async ? Promise.all(i).then((a) => H.mergeArray(t, a)) : H.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new ke({
      ...this._def,
      rest: e
    });
  }
}
ke.create = (r, e) => {
  if (!Array.isArray(r))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new ke({
    items: r,
    typeName: R.ZodTuple,
    rest: null,
    ...N(e)
  });
};
class ht extends U {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== A.object)
      return E(s, {
        code: _.invalid_type,
        expected: A.object,
        received: s.parsedType
      }), I;
    const n = [], i = this._def.keyType, a = this._def.valueType;
    for (const o in s.data)
      n.push({
        key: i._parse(new ie(s, o, s.path, o)),
        value: a._parse(new ie(s, s.data[o], s.path, o)),
        alwaysSet: o in s.data
      });
    return s.common.async ? H.mergeObjectAsync(t, n) : H.mergeObjectSync(t, n);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, s) {
    return t instanceof U ? new ht({
      keyType: e,
      valueType: t,
      typeName: R.ZodRecord,
      ...N(s)
    }) : new ht({
      keyType: ce.create(),
      valueType: e,
      typeName: R.ZodRecord,
      ...N(t)
    });
  }
}
class _s extends U {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== A.map)
      return E(s, {
        code: _.invalid_type,
        expected: A.map,
        received: s.parsedType
      }), I;
    const n = this._def.keyType, i = this._def.valueType, a = [...s.data.entries()].map(([o, l], c) => ({
      key: n._parse(new ie(s, o, s.path, [c, "key"])),
      value: i._parse(new ie(s, l, s.path, [c, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const l of a) {
          const c = await l.key, u = await l.value;
          if (c.status === "aborted" || u.status === "aborted")
            return I;
          (c.status === "dirty" || u.status === "dirty") && t.dirty(), o.set(c.value, u.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const l of a) {
        const c = l.key, u = l.value;
        if (c.status === "aborted" || u.status === "aborted")
          return I;
        (c.status === "dirty" || u.status === "dirty") && t.dirty(), o.set(c.value, u.value);
      }
      return { status: t.value, value: o };
    }
  }
}
_s.create = (r, e, t) => new _s({
  valueType: e,
  keyType: r,
  typeName: R.ZodMap,
  ...N(t)
});
class Ge extends U {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== A.set)
      return E(s, {
        code: _.invalid_type,
        expected: A.set,
        received: s.parsedType
      }), I;
    const n = this._def;
    n.minSize !== null && s.data.size < n.minSize.value && (E(s, {
      code: _.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && s.data.size > n.maxSize.value && (E(s, {
      code: _.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const i = this._def.valueType;
    function a(l) {
      const c = /* @__PURE__ */ new Set();
      for (const u of l) {
        if (u.status === "aborted")
          return I;
        u.status === "dirty" && t.dirty(), c.add(u.value);
      }
      return { status: t.value, value: c };
    }
    const o = [...s.data.values()].map((l, c) => i._parse(new ie(s, l, s.path, c)));
    return s.common.async ? Promise.all(o).then((l) => a(l)) : a(o);
  }
  min(e, t) {
    return new Ge({
      ...this._def,
      minSize: { value: e, message: O.toString(t) }
    });
  }
  max(e, t) {
    return new Ge({
      ...this._def,
      maxSize: { value: e, message: O.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
Ge.create = (r, e) => new Ge({
  valueType: r,
  minSize: null,
  maxSize: null,
  typeName: R.ZodSet,
  ...N(e)
});
class bs extends U {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
bs.create = (r, e) => new bs({
  getter: r,
  typeName: R.ZodLazy,
  ...N(e)
});
class Mt extends U {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return E(t, {
        received: t.data,
        code: _.invalid_literal,
        expected: this._def.value
      }), I;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Mt.create = (r, e) => new Mt({
  value: r,
  typeName: R.ZodLiteral,
  ...N(e)
});
function Gs(r, e) {
  return new Ne({
    values: r,
    typeName: R.ZodEnum,
    ...N(e)
  });
}
class Ne extends U {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return E(t, {
        expected: D.joinValues(s),
        received: t.parsedType,
        code: _.invalid_type
      }), I;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return E(t, {
        received: t.data,
        code: _.invalid_enum_value,
        options: s
      }), I;
    }
    return ee(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Values() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  extract(e, t = this._def) {
    return Ne.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return Ne.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
Ne.create = Gs;
class ws extends U {
  _parse(e) {
    const t = D.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== A.string && s.parsedType !== A.number) {
      const n = D.objectValues(t);
      return E(s, {
        expected: D.joinValues(n),
        received: s.parsedType,
        code: _.invalid_type
      }), I;
    }
    if (this._cache || (this._cache = new Set(D.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = D.objectValues(t);
      return E(s, {
        received: s.data,
        code: _.invalid_enum_value,
        options: n
      }), I;
    }
    return ee(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
ws.create = (r, e) => new ws({
  values: r,
  typeName: R.ZodNativeEnum,
  ...N(e)
});
class ft extends U {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== A.promise && t.common.async === !1)
      return E(t, {
        code: _.invalid_type,
        expected: A.promise,
        received: t.parsedType
      }), I;
    const s = t.parsedType === A.promise ? t.data : Promise.resolve(t.data);
    return ee(s.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
ft.create = (r, e) => new ft({
  type: r,
  typeName: R.ZodPromise,
  ...N(e)
});
class Le extends U {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === R.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = this._def.effect || null, i = {
      addIssue: (a) => {
        E(s, a), a.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), n.type === "preprocess") {
      const a = n.transform(s.data, i);
      if (s.common.async)
        return Promise.resolve(a).then(async (o) => {
          if (t.value === "aborted")
            return I;
          const l = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return l.status === "aborted" ? I : l.status === "dirty" || t.value === "dirty" ? ze(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return I;
        const o = this._def.schema._parseSync({
          data: a,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? I : o.status === "dirty" || t.value === "dirty" ? ze(o.value) : o;
      }
    }
    if (n.type === "refinement") {
      const a = (o) => {
        const l = n.refinement(o, i);
        if (s.common.async)
          return Promise.resolve(l);
        if (l instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? I : (o.status === "dirty" && t.dirty(), a(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => o.status === "aborted" ? I : (o.status === "dirty" && t.dirty(), a(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (n.type === "transform")
      if (s.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!Pe(a))
          return I;
        const o = n.transform(a.value, i);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((a) => Pe(a) ? Promise.resolve(n.transform(a.value, i)).then((o) => ({
          status: t.value,
          value: o
        })) : I);
    D.assertNever(n);
  }
}
Le.create = (r, e, t) => new Le({
  schema: r,
  typeName: R.ZodEffects,
  effect: e,
  ...N(t)
});
Le.createWithPreprocess = (r, e, t) => new Le({
  schema: e,
  effect: { type: "preprocess", transform: r },
  typeName: R.ZodEffects,
  ...N(t)
});
class ge extends U {
  _parse(e) {
    return this._getType(e) === A.undefined ? ee(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ge.create = (r, e) => new ge({
  innerType: r,
  typeName: R.ZodOptional,
  ...N(e)
});
class Ue extends U {
  _parse(e) {
    return this._getType(e) === A.null ? ee(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ue.create = (r, e) => new Ue({
  innerType: r,
  typeName: R.ZodNullable,
  ...N(e)
});
class Bt extends U {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === A.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Bt.create = (r, e) => new Bt({
  innerType: r,
  typeName: R.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...N(e)
});
class Ft extends U {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return lt(n) ? n.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new ue(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new ue(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Ft.create = (r, e) => new Ft({
  innerType: r,
  typeName: R.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...N(e)
});
class ks extends U {
  _parse(e) {
    if (this._getType(e) !== A.nan) {
      const s = this._getOrReturnCtx(e);
      return E(s, {
        code: _.invalid_type,
        expected: A.nan,
        received: s.parsedType
      }), I;
    }
    return { status: "valid", value: e.data };
  }
}
ks.create = (r) => new ks({
  typeName: R.ZodNaN,
  ...N(r)
});
class tn extends U {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = t.data;
    return this._def.type._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class rs extends U {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return i.status === "aborted" ? I : i.status === "dirty" ? (t.dirty(), ze(i.value)) : this._def.out._parseAsync({
          data: i.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return n.status === "aborted" ? I : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new rs({
      in: e,
      out: t,
      typeName: R.ZodPipeline
    });
  }
}
class qt extends U {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (n) => (Pe(n) && (n.value = Object.freeze(n.value)), n);
    return lt(t) ? t.then((n) => s(n)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
qt.create = (r, e) => new qt({
  innerType: r,
  typeName: R.ZodReadonly,
  ...N(e)
});
var R;
(function(r) {
  r.ZodString = "ZodString", r.ZodNumber = "ZodNumber", r.ZodNaN = "ZodNaN", r.ZodBigInt = "ZodBigInt", r.ZodBoolean = "ZodBoolean", r.ZodDate = "ZodDate", r.ZodSymbol = "ZodSymbol", r.ZodUndefined = "ZodUndefined", r.ZodNull = "ZodNull", r.ZodAny = "ZodAny", r.ZodUnknown = "ZodUnknown", r.ZodNever = "ZodNever", r.ZodVoid = "ZodVoid", r.ZodArray = "ZodArray", r.ZodObject = "ZodObject", r.ZodUnion = "ZodUnion", r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", r.ZodIntersection = "ZodIntersection", r.ZodTuple = "ZodTuple", r.ZodRecord = "ZodRecord", r.ZodMap = "ZodMap", r.ZodSet = "ZodSet", r.ZodFunction = "ZodFunction", r.ZodLazy = "ZodLazy", r.ZodLiteral = "ZodLiteral", r.ZodEnum = "ZodEnum", r.ZodEffects = "ZodEffects", r.ZodNativeEnum = "ZodNativeEnum", r.ZodOptional = "ZodOptional", r.ZodNullable = "ZodNullable", r.ZodDefault = "ZodDefault", r.ZodCatch = "ZodCatch", r.ZodPromise = "ZodPromise", r.ZodBranded = "ZodBranded", r.ZodPipeline = "ZodPipeline", r.ZodReadonly = "ZodReadonly";
})(R || (R = {}));
const $ = ce.create, at = $e.create, Es = Lt.create, Je = Ut.create;
me.create;
const Y = ne.create, K = z.create, sn = ut.create;
dt.create;
ke.create;
const pt = ht.create, rn = Mt.create;
Ne.create;
ft.create;
ge.create;
Ue.create;
K({
  id: $().min(1),
  name: $().min(1).optional(),
  tags: Y($()).default([]),
  nodeTypes: Y($()).default([]),
  engineVersion: $().optional(),
  thumbnail: $().optional(),
  lastModified: sn([$(), at()]).optional(),
  author: $().optional(),
  outputType: $().optional()
});
const nn = K({
  presets: Y(
    K({
      id: $().min(1),
      path: $().min(1),
      tags: Y($()).optional(),
      nodeTypes: Y($()).optional(),
      thumbnail: $().optional()
    })
  )
}), an = K({
  name: $().optional(),
  version: $().optional(),
  presetLibrary: K({
    presets: Y(
      K({
        id: $().min(1),
        path: $().min(1),
        tags: Y($()).optional(),
        nodeTypes: Y($()).optional(),
        thumbnail: $().optional()
      })
    )
  })
});
function on(r) {
  return nn.parse(r);
}
function ln(r) {
  return an.parse(r);
}
function Js(r) {
  try {
    return {
      type: "minimal",
      presets: on(r).presets.map((s) => ({
        id: s.id,
        path: s.path,
        tags: s.tags ?? [],
        nodeTypes: s.nodeTypes ?? [],
        thumbnail: s.thumbnail
      }))
    };
  } catch {
  }
  return {
    type: "npm-style",
    presets: ln(r).presetLibrary.presets.map((t) => ({
      id: t.id,
      path: t.path,
      tags: t.tags ?? [],
      nodeTypes: t.nodeTypes ?? [],
      thumbnail: t.thumbnail
    }))
  };
}
const cn = {
  async listPresets() {
    return [
      { id: "p1", name: "Medieval Castle", tags: ["demo", "medieval"], type: "image" },
      { id: "p2", name: "Forest Path", tags: ["nature"], type: "image" },
      { id: "p3", name: "Ocean Waves", tags: ["nature", "demo"], type: "video" }
    ];
  },
  async scanLibraries(r) {
    const e = [], t = [];
    for (const s of r)
      try {
        const n = Js(s);
        e.push(...n.presets);
      } catch (n) {
        t.push(n instanceof Error ? n.message : "Unknown manifest error");
      }
    if (t.length)
      throw new Error(`${t.length} error(s) during scan`);
    return e;
  }
}, un = {
  presets: [],
  filteredPresets: [],
  availableTags: [],
  activeTags: [],
  query: "",
  scanStatus: "idle",
  error: null,
  libraryIndex: [],
  focusArea: "sidebar",
  focusIndex: 0,
  sidebarCount: 0,
  gridColumnCount: 1,
  gridItemCount: 0,
  selectedPresetId: null,
  detailsOpen: !1
}, F = Ar((r, e) => ({
  ...un,
  setDetailsOpen: (t) => r({ detailsOpen: t }),
  selectPreset: (t) => r({ selectedPresetId: t }),
  scan: async (t) => {
    r({ scanStatus: "scanning", error: null });
    const s = [], n = [];
    for (const l of t)
      try {
        const c = Js(l);
        n.push(...c.presets);
      } catch (c) {
        s.push(c instanceof Error ? c.message : "Unknown manifest error");
      }
    if (s.length) {
      r({ scanStatus: "error", error: `${s.length} error(s) during scan` });
      return;
    }
    const i = n.map((l) => ({
      id: l.id,
      name: l.id,
      tags: l.tags,
      type: "unknown"
    })), a = Array.from(new Set(i.flatMap((l) => l.tags))).sort(), o = Tt(i, e().activeTags, e().query);
    r({
      libraryIndex: n,
      presets: i,
      filteredPresets: o,
      availableTags: a,
      scanStatus: "done",
      error: null,
      gridItemCount: o.length
    });
  },
  moveSelection: (t) => {
    const {
      focusArea: s,
      focusIndex: n,
      sidebarCount: i,
      gridColumnCount: a,
      gridItemCount: o
    } = e();
    if (s === "sidebar") {
      if (t === "up") return r({ focusIndex: Math.max(0, n - 1) });
      if (t === "down") return r({ focusIndex: Math.min(Math.max(0, i - 1), n + 1) });
      if (t === "right") {
        const l = e().filteredPresets[0];
        return r(l ? { focusArea: "grid", focusIndex: 0, selectedPresetId: l.id } : { focusArea: "grid", focusIndex: 0 });
      }
      return;
    } else {
      const l = Math.max(1, a);
      let c = n;
      if (t === "left") {
        if (n % l === 0) return r({ focusArea: "sidebar", focusIndex: 0 });
        c = Math.max(0, n - 1);
      } else t === "right" ? c = Math.min(o - 1, n + 1) : t === "up" ? c = Math.max(0, n - l) : t === "down" && (c = Math.min(o - 1, n + l));
      r({ focusIndex: c });
      const u = e().filteredPresets[c];
      u && r({ selectedPresetId: u.id });
    }
  },
  toggleTag: (t) => {
    const { activeTags: s } = e(), n = s.includes(t) ? s.filter((a) => a !== t) : [...s, t], i = Tt(e().presets, n, e().query);
    r({ activeTags: n, filteredPresets: i });
  },
  setQuery: (t) => {
    const s = Tt(e().presets, e().activeTags, t);
    r({ query: t, filteredPresets: s });
  },
  setSidebarCount: (t) => r({ sidebarCount: t, focusIndex: Math.min(e().focusIndex, Math.max(0, t - 1)) }),
  setGridMetrics: ({ columnCount: t, itemCount: s }) => r({ gridColumnCount: t, gridItemCount: s }),
  setFocus: (t, s) => r({ focusArea: t, focusIndex: s })
}));
function Tt(r, e, t) {
  let s = r;
  return e.length && (s = s.filter((n) => e.every((i) => n.tags.includes(i)))), t && t.trim().length > 0 ? new Cr(s, {
    keys: ["name", "tags"],
    threshold: 0.4,
    ignoreLocation: !0
  }).search(t).map((i) => i.item) : s;
}
(async () => {
  const r = await cn.listPresets(), e = Array.from(new Set(r.flatMap((t) => t.tags))).sort();
  F.setState({ presets: r, filteredPresets: r, availableTags: e });
})();
function dn() {
  const r = F((d) => d.availableTags), e = F((d) => d.activeTags), t = F((d) => d.toggleTag), s = F((d) => d.query), n = F((d) => d.setQuery), i = F((d) => d.scanStatus), a = F((d) => d.error), o = F((d) => d.focusArea), l = F((d) => d.focusIndex), c = F((d) => d.setSidebarCount), u = F((d) => d.setFocus);
  return ot(() => {
    c(r.length);
  }, [r.length, c]), /* @__PURE__ */ h.createElement("aside", { "aria-label": "Asset Libraries", role: "navigation", style: { borderRight: "1px solid #eee", padding: 8 } }, /* @__PURE__ */ h.createElement("div", { "aria-live": "polite", style: { fontSize: 12, color: "#555" } }, i === "scanning" && /* @__PURE__ */ h.createElement("span", null, "Scanning…"), i === "error" && /* @__PURE__ */ h.createElement("span", { role: "alert", style: { color: "#b00" } }, "Scan error: ", a)), /* @__PURE__ */ h.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ h.createElement("label", { htmlFor: "asset-search", style: { display: "block", fontWeight: 600 } }, "Search"), /* @__PURE__ */ h.createElement(
    "input",
    {
      id: "asset-search",
      type: "search",
      value: s,
      onChange: (d) => n(d.target.value),
      placeholder: "Search presets",
      "aria-label": "Search presets",
      style: { width: "100%", padding: "6px 8px" }
    }
  )), /* @__PURE__ */ h.createElement("h3", { id: "tags" }, "Tags"), i === "done" && r.length === 0 ? /* @__PURE__ */ h.createElement("div", { role: "status", "aria-live": "polite", style: { fontSize: 12, color: "#555", padding: "4px 0" } }, "No tags available.") : /* @__PURE__ */ h.createElement("ul", { role: "listbox", "aria-labelledby": "tags" }, r.map((d, f) => /* @__PURE__ */ h.createElement("li", { key: d, role: "option", "aria-selected": e.includes(d) }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => t(d),
      "aria-pressed": e.includes(d),
      tabIndex: o === "sidebar" && l === f ? 0 : -1,
      onFocus: () => u("sidebar", f)
    },
    e.includes(d) ? "✓ " : "",
    d
  )))));
}
function hn({ preset: r, onClick: e, onInsert: t, tabIndex: s, onFocus: n }) {
  const i = (a) => {
    try {
      const o = JSON.stringify({ id: r.id, name: r.name, tags: r.tags, type: r.type });
      a.dataTransfer.setData("application/x-preset", o), a.dataTransfer.effectAllowed = "copy";
    } catch {
    }
  };
  return /* @__PURE__ */ h.createElement(
    "div",
    {
      role: "button",
      tabIndex: s ?? 0,
      "aria-label": `Preset ${r.name}`,
      onClick: e,
      onFocus: n,
      onKeyDown: (a) => {
        (a.key === "Enter" || a.key === " ") && (e == null || e());
      },
      style: { display: "block", width: 160, height: 140, margin: 8, border: "1px solid #ddd", borderRadius: 6, padding: 8 }
    },
    /* @__PURE__ */ h.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, r.name),
    /* @__PURE__ */ h.createElement("div", { style: { fontSize: 12, color: "#666" } }, r.tags.join(", ")),
    /* @__PURE__ */ h.createElement("div", { style: { marginTop: 8, display: "flex", alignItems: "center" } }, /* @__PURE__ */ h.createElement(
      "span",
      {
        role: "button",
        "aria-label": "drag handle",
        draggable: !0,
        onDragStart: i,
        style: { cursor: "grab" },
        "data-testid": "preset-drag-handle"
      },
      "⠿"
    ), /* @__PURE__ */ h.createElement("button", { type: "button", onClick: (a) => {
      a.stopPropagation(), t == null || t(r);
    }, "aria-label": "Insert preset", style: { marginLeft: 8 } }, "Insert"))
  );
}
const Ss = 180, fn = 160;
function pn({ onInsert: r }) {
  const e = F((y) => y.filteredPresets), t = F((y) => y.scanStatus), s = F((y) => y.error), n = F((y) => y.selectPreset), i = F((y) => y.focusArea), a = F((y) => y.focusIndex), o = F((y) => y.setGridMetrics), l = F((y) => y.setFocus), c = ts(null), [u, d] = Z({ w: 900, h: 600 });
  ot(() => {
    if (!c.current) return;
    const y = c.current, k = () => d({ w: y.clientWidth || 900, h: y.clientHeight || 600 });
    if (k(), typeof ResizeObserver == "function") {
      const j = new ResizeObserver(k);
      return j.observe(y), () => j.disconnect();
    }
    return window.addEventListener("resize", k), () => window.removeEventListener("resize", k);
  }, []);
  const f = u.w, p = u.h, g = Math.max(1, Math.floor(f / Ss)), w = Math.ceil(e.length / g);
  ot(() => {
    o({ columnCount: g, itemCount: e.length });
  }, [g, e.length, o]);
  const S = ss(() => {
    function y({ columnIndex: k, rowIndex: j, style: m }) {
      const v = j * g + k, x = e[v];
      if (!x) return /* @__PURE__ */ h.createElement("div", { style: m });
      const G = i === "grid" && a === v;
      return /* @__PURE__ */ h.createElement("div", { style: m, "data-grid-index": v, role: "gridcell", "aria-selected": G }, /* @__PURE__ */ h.createElement(
        hn,
        {
          preset: x,
          onClick: () => n(x.id),
          onInsert: r,
          tabIndex: i === "grid" && a === v ? 0 : -1,
          onFocus: () => l("grid", v)
        }
      ));
    }
    return y.displayName = "GridCell", y;
  }, [e, n, r, g, i, a, l]), b = t === "done" && e.length === 0, C = t === "error";
  return /* @__PURE__ */ h.createElement("div", { "aria-label": "Preset Grid", role: "grid", ref: c, style: { width: "100%", height: "100%", overflow: "hidden" } }, C ? /* @__PURE__ */ h.createElement("div", { role: "alert", "aria-live": "assertive", style: { padding: 16, color: "#b00" } }, "Failed to scan libraries: ", s) : b ? /* @__PURE__ */ h.createElement("div", { role: "status", "aria-live": "polite", style: { padding: 16, color: "#555" } }, "No presets found. Adjust your search or filters.") : /* @__PURE__ */ h.createElement(
    Or,
    {
      height: p,
      width: f,
      columnWidth: Ss,
      rowHeight: fn,
      columnCount: g,
      rowCount: w
    },
    S
  ));
}
function gn({ data: r }) {
  const s = r.nodes.reduce((n, i, a) => (n[i.id] = { x: 40 + a * 120, y: 60 }, n), {});
  return /* @__PURE__ */ h.createElement("svg", { width: 320, height: 120, role: "img", "aria-label": "Branch visualization" }, r.edges.map((n, i) => {
    const a = s[n.from], o = s[n.to];
    return !a || !o ? null : /* @__PURE__ */ h.createElement("line", { key: i, x1: a.x, y1: a.y, x2: o.x, y2: o.y, stroke: "#999", strokeWidth: 2 });
  }), r.nodes.map((n) => {
    const i = s[n.id];
    return /* @__PURE__ */ h.createElement("g", { key: n.id }, /* @__PURE__ */ h.createElement("circle", { cx: i.x, cy: i.y, r: 12, fill: "#4a90e2" }), /* @__PURE__ */ h.createElement("text", { x: i.x, y: i.y - 16, textAnchor: "middle", fontSize: 10, fill: "#333" }, n.id));
  }));
}
const xs = {
  async simulate(r, e) {
    const { seeds: t } = e;
    return t.map((s) => ({ seed: s, text: `Sample for ${r.name} (seed ${s})` }));
  },
  async branchMap(r) {
    const e = r.id.slice(0, 3) || "pre", t = [
      { id: `${e}-A` },
      { id: `${e}-B` },
      { id: `${e}-C` }
    ], s = [
      { from: t[0].id, to: t[1].id, weight: 1 },
      { from: t[1].id, to: t[2].id, weight: 2 }
    ];
    return { nodes: t, edges: s };
  }
};
function mn() {
  return null;
}
function yn() {
  const r = ss(() => mn(), []);
  return {
    async simulate(e, t) {
      return r ? r.simulate(e, t) : xs.simulate(e, t);
    },
    async branchMap(e) {
      return r ? r.branchMap(e) : xs.branchMap(e);
    }
  };
}
function vn() {
  const r = ts(/* @__PURE__ */ new Map());
  return {
    get(e) {
      return r.current.get(e);
    },
    set(e, t) {
      r.current.set(e, t);
    },
    has(e) {
      return r.current.has(e);
    }
  };
}
function _n({ open: r, selectedId: e }) {
  const s = F((v) => v.filteredPresets).find((v) => v.id === e) || null, [n, i] = Z(!1), [a, o] = Z(null), [l, c] = Z(null), [u, d] = Z(!1), [f, p] = Z(!1), [g, w] = Z(null), [S, b] = Z(null), { simulate: C, branchMap: y } = yn(), k = vn(), j = async () => {
    if (s) {
      o(null), i(!0);
      try {
        const v = `sim:${s.id}`, x = k.get(v), G = x || await C(s, { seeds: [0, 1, 2] });
        x || k.set(v, G), c(G);
      } catch (v) {
        const x = v instanceof Error ? v.message : "Simulation failed";
        o(x);
      } finally {
        i(!1);
      }
    }
  }, m = async () => {
    const v = !u;
    if (d(v), v && !S && s) {
      w(null), p(!0);
      try {
        const x = `branch:${s.id}`, G = k.get(x), T = G || await y(s);
        G || k.set(x, T), b(T);
      } catch (x) {
        const G = x instanceof Error ? x.message : "Branch map failed";
        w(G);
      } finally {
        p(!1);
      }
    }
  };
  return /* @__PURE__ */ h.createElement(
    "aside",
    {
      "aria-label": "Details Drawer",
      "aria-hidden": !r,
      style: {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: r ? 360 : 0,
        overflow: "hidden",
        transition: "width 150ms",
        borderLeft: "1px solid #eee",
        background: "#fff",
        padding: r ? 12 : 0
      }
    },
    r && /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("h3", { style: { marginTop: 0 } }, "Details ", s ? `— ${s.name}` : ""), /* @__PURE__ */ h.createElement("section", { "aria-labelledby": "simulate-title", "aria-busy": n }, /* @__PURE__ */ h.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ h.createElement("h4", { id: "simulate-title", style: { margin: "8px 0" } }, "Sample Outputs"), /* @__PURE__ */ h.createElement(
      "button",
      {
        type: "button",
        onClick: j,
        disabled: !s || n,
        "aria-label": "Simulate"
      },
      n ? "Simulating…" : "Simulate"
    )), a && /* @__PURE__ */ h.createElement("div", { role: "status", "aria-live": "polite", style: { color: "crimson" } }, a), l && /* @__PURE__ */ h.createElement("ul", null, l.map((v) => /* @__PURE__ */ h.createElement("li", { key: v.seed }, /* @__PURE__ */ h.createElement("code", null, "#", v.seed), " ", v.text)))), /* @__PURE__ */ h.createElement("section", { "aria-labelledby": "branch-title", "aria-busy": f, style: { marginTop: 16 } }, /* @__PURE__ */ h.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ h.createElement("h4", { id: "branch-title", style: { margin: "8px 0" } }, "Branch Viz"), /* @__PURE__ */ h.createElement(
      "button",
      {
        type: "button",
        onClick: m,
        "aria-pressed": u,
        "aria-label": "Toggle branch visualization"
      },
      u ? "Hide" : "Show"
    )), g && /* @__PURE__ */ h.createElement("div", { role: "status", "aria-live": "polite", style: { color: "crimson" } }, g), u && S && /* @__PURE__ */ h.createElement(gn, { data: S })))
  );
}
const bn = Tr({
  toggleOpen: () => {
  },
  isWithinBounds: () => !1
});
function wn({ children: r }) {
  const e = ts(null), t = F((o) => o.detailsOpen), s = F((o) => o.setDetailsOpen), n = F((o) => o.moveSelection), i = () => s(!t), a = () => {
    if (!e.current) return !1;
    const o = document.activeElement;
    return e.current.contains(o);
  };
  return ot(() => {
    const o = (l) => {
      if (!a()) return;
      const c = l.target;
      if (c.tagName === "INPUT" || c.tagName === "TEXTAREA" || c.contentEditable === "true")
        return;
      let u = !0;
      ["ArrowUp", "k"].includes(l.key) ? n("up") : ["ArrowDown", "j"].includes(l.key) ? n("down") : ["ArrowLeft", "h"].includes(l.key) ? n("left") : ["ArrowRight", "l"].includes(l.key) ? n("right") : l.key === "Enter" && !l.ctrlKey && !l.metaKey ? s(!0) : l.key === "Escape" ? s(!1) : u = !1, u && (l.preventDefault(), l.stopPropagation());
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [n, s]), /* @__PURE__ */ h.createElement("div", { ref: e }, /* @__PURE__ */ h.createElement(bn.Provider, { value: { toggleOpen: i, isWithinBounds: a } }, r));
}
function go({ onInsert: r }) {
  const e = F((s) => s.selectedPresetId), t = F((s) => s.detailsOpen);
  return /* @__PURE__ */ h.createElement(wn, null, /* @__PURE__ */ h.createElement("div", { className: "asset-browser", style: { display: "grid", gridTemplateColumns: "280px 1fr" } }, /* @__PURE__ */ h.createElement(dn, null), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement(pn, { onInsert: r })), /* @__PURE__ */ h.createElement(_n, { open: t, selectedId: e })));
}
async function zt(r = "") {
  const e = r ? `${r.replace(/\/$/, "")}/graphs/manifest.json` : "/graphs/manifest.json", t = await fetch(e);
  if (!t.ok)
    throw new Error(`Failed to load graph manifest: ${t.status}`);
  const s = await t.json();
  return Array.isArray(s) ? s.filter((n) => typeof (n == null ? void 0 : n.filename) == "string" && typeof (n == null ? void 0 : n.title) == "string") : [];
}
function ns({ title: r = "Nothing here yet", message: e, helpUrl: t, actionLabel: s, onAction: n }) {
  return /* @__PURE__ */ h.createElement("div", { role: "status", "aria-live": "polite", style: { padding: 12, color: "#555", border: "1px dashed #ddd", borderRadius: 6, marginTop: 8 } }, r && /* @__PURE__ */ h.createElement("strong", { style: { display: "block", marginBottom: 4 } }, r), /* @__PURE__ */ h.createElement("div", null, e), /* @__PURE__ */ h.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } }, s && n && /* @__PURE__ */ h.createElement("button", { type: "button", onClick: n }, s), t && /* @__PURE__ */ h.createElement("a", { href: t, target: "_blank", rel: "noreferrer" }, "Learn more")));
}
function yt({ title: r = "Something went wrong", message: e, retryLabel: t = "Retry", onRetry: s }) {
  return /* @__PURE__ */ h.createElement("div", { role: "alert", "aria-live": "assertive", style: { padding: 12, color: "#b00", border: "1px solid #f3c2c2", background: "#fff6f6", borderRadius: 6, marginTop: 8 } }, r && /* @__PURE__ */ h.createElement("strong", { style: { display: "block", marginBottom: 4 } }, r), /* @__PURE__ */ h.createElement("div", null, e), s && /* @__PURE__ */ h.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: s }, t)));
}
async function kn(r, e = {}) {
  const {
    retries: t = 2,
    minDelayMs: s = 200,
    maxDelayMs: n = 1500,
    factor: i = 2,
    jitter: a = !0,
    isRetryable: o = () => !0
  } = e;
  let l = 0;
  for (; ; )
    try {
      return await r();
    } catch (c) {
      if (!(l < t && o(c))) throw c;
      const d = Math.min(n, s * Math.pow(i, l)), f = a ? d * (0.5 + Math.random()) : d;
      await new Promise((p) => setTimeout(p, f)), l += 1;
    }
}
function En() {
  const [r, e] = h.useState("idle"), [t, s] = h.useState(null), [n, i] = h.useState(!1), [a, o] = h.useState([]), l = h.useCallback(async () => {
    e("loading"), s(null), i(!1);
    try {
      const u = await zt("");
      o(u), e("done");
    } catch (u) {
      const d = u instanceof Error ? u.message : String(u ?? "Failed to load graph manifest");
      typeof d == "string" && /404/.test(d) ? (i(!0), o([]), e("done")) : (s(d), e("error"));
    }
  }, []), c = h.useCallback(async () => {
    e("loading"), s(null), i(!1);
    try {
      const u = await kn(() => zt(""), {
        retries: 2,
        isRetryable: (d) => {
          const f = d instanceof Error ? d.message : String(d ?? "");
          return !/404/.test(f);
        }
      });
      o(u), e("done");
    } catch (u) {
      const d = u instanceof Error ? u.message : String(u ?? "Failed to load graph manifest");
      /404/.test(d) ? (i(!0), o([]), e("done")) : (s(d), e("error"));
    }
  }, []);
  return h.useEffect(() => {
    l();
  }, [l]), /* @__PURE__ */ h.createElement("section", { "aria-label": "Server Graphs", style: { padding: 12 } }, /* @__PURE__ */ h.createElement("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ h.createElement("h2", { style: { margin: 0 } }, "Server"), /* @__PURE__ */ h.createElement("button", { type: "button", onClick: c, disabled: r === "loading" }, r === "loading" ? "Loading…" : "Retry")), r === "error" && /* @__PURE__ */ h.createElement(yt, { message: t || "Failed to load graph manifest", onRetry: c }), r === "done" && a.length === 0 ? /* @__PURE__ */ h.createElement(
    ns,
    {
      title: n ? "No server manifest found" : "No server graphs",
      message: "No server graphs available. See docs for adding demo assets.",
      helpUrl: n ? "docs/stories/1.15.error-empty-states-and-fallbacks.md" : void 0,
      actionLabel: n ? "Retry" : void 0,
      onAction: n ? c : void 0
    }
  ) : null, r === "done" && a.length > 0 && /* @__PURE__ */ h.createElement("ul", { "aria-label": "Server Graph List", style: { marginTop: 8 } }, a.map((u) => /* @__PURE__ */ h.createElement("li", { key: u.filename }, /* @__PURE__ */ h.createElement("strong", null, u.title), /* @__PURE__ */ h.createElement("div", { style: { fontSize: 12, color: "#555" } }, u.filename, " • ", new Date(u.updatedAt).toLocaleString())))));
}
function mo({ libraryView: r }) {
  const [e, t] = h.useState("library");
  return /* @__PURE__ */ h.createElement("section", { "aria-label": "Asset Browser Tabs" }, /* @__PURE__ */ h.createElement("nav", { "aria-label": "Asset Views", style: { display: "flex", gap: 8, borderBottom: "1px solid #ddd", padding: 8 } }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      "aria-selected": e === "library",
      onClick: () => t("library")
    },
    "Library"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      "aria-selected": e === "server",
      onClick: () => t("server")
    },
    "Server"
  )), /* @__PURE__ */ h.createElement("div", { style: { padding: 8 } }, e === "library" && /* @__PURE__ */ h.createElement("div", { "aria-label": "Library View" }, r ?? /* @__PURE__ */ h.createElement("em", null, "No library view provided.")), e === "server" && /* @__PURE__ */ h.createElement(En, null)));
}
const Sn = [
  {
    id: "1",
    name: "Medieval Castle",
    category: "Location",
    tags: ["demo", "medieval"],
    complexity: "medium",
    nodes: 12,
    type: "graph"
  },
  {
    id: "2",
    name: "Forest Path",
    category: "Nature",
    tags: ["nature"],
    complexity: "simple",
    nodes: 8,
    type: "graph"
  },
  {
    id: "3",
    name: "Character Dialogue",
    category: "Character",
    tags: ["dialogue"],
    complexity: "complex",
    nodes: 15,
    type: "graph"
  },
  {
    id: "4",
    name: "Action Scene",
    category: "Action",
    tags: ["action", "combat"],
    complexity: "complex",
    nodes: 20,
    type: "graph"
  },
  {
    id: "5",
    name: "Emotional Moment",
    category: "Emotion",
    tags: ["emotion", "character"],
    complexity: "medium",
    nodes: 10,
    type: "graph"
  },
  {
    id: "6",
    name: "Mystery Setup",
    category: "Plot",
    tags: ["mystery", "plot"],
    complexity: "medium",
    nodes: 14,
    type: "graph"
  },
  {
    id: "7",
    name: "Urban Setting",
    category: "Location",
    tags: ["urban", "modern"],
    complexity: "simple",
    nodes: 7,
    type: "graph"
  },
  {
    id: "8",
    name: "Magic System",
    category: "Fantasy",
    tags: ["magic", "fantasy"],
    complexity: "complex",
    nodes: 18,
    type: "graph"
  }
], xn = [
  "All",
  "Location",
  "Character",
  "Nature",
  "Action",
  "Emotion",
  "Plot",
  "Fantasy"
], Tn = [
  "demo",
  "medieval",
  "nature",
  "dialogue",
  "action",
  "combat",
  "emotion",
  "character",
  "mystery",
  "plot",
  "urban",
  "modern",
  "magic",
  "fantasy"
];
function An({ onInsert: r }) {
  var j, m, v, x, G;
  const [e, t] = Z("list"), [s, n] = Z("All"), [i, a] = Z([]), [o, l] = Z(""), [c, u] = Z(null), [d, f] = Z("name"), [p, g] = Z("asc"), [w, S] = Z(!1), b = ss(() => {
    let T = [...Sn];
    if (s !== "All" && (T = T.filter((M) => M.category === s)), i.length > 0 && (T = T.filter(
      (M) => i.some((q) => M.tags.includes(q))
    )), o) {
      const M = o.toLowerCase();
      T = T.filter(
        (q) => q.name.toLowerCase().includes(M) || (q.category || "").toLowerCase().includes(M) || q.tags.some((te) => te.toLowerCase().includes(M))
      );
    }
    return T.sort((M, q) => {
      let te = 0;
      switch (d) {
        case "name":
          te = M.name.localeCompare(q.name);
          break;
        case "category":
          te = (M.category || "").localeCompare(q.category || "");
          break;
        case "complexity":
          te = (M.complexity || "").localeCompare(q.complexity || "");
          break;
        case "nodes":
          te = (M.nodes || 0) - (q.nodes || 0);
          break;
      }
      return p === "asc" ? te : -te;
    }), T;
  }, [s, i, o, d, p]), C = (T) => {
    T === d ? g(p === "asc" ? "desc" : "asc") : (f(T), g("asc"));
  }, y = (T) => {
    a(
      (M) => M.includes(T) ? M.filter((q) => q !== T) : [...M, T]
    );
  }, k = (T) => {
    r == null || r(T);
  };
  return /* @__PURE__ */ h.createElement("div", { className: "asset-browser-pro-horizontal" }, /* @__PURE__ */ h.createElement("div", { className: "browser-top-controls" }, /* @__PURE__ */ h.createElement("div", { className: "search-section" }, /* @__PURE__ */ h.createElement("div", { className: "browser-search-field" }, /* @__PURE__ */ h.createElement("span", { className: "browser-search-icon" }, "🔍"), /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "text",
      className: "browser-search-input",
      placeholder: "Search presets...",
      value: o,
      onChange: (T) => l(T.target.value)
    }
  ))), /* @__PURE__ */ h.createElement("div", { className: "keyword-buttons-section" }, /* @__PURE__ */ h.createElement("div", { className: "keyword-row" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      className: `keyword-btn ${s === "All" ? "active" : ""}`,
      onClick: () => n("All")
    },
    "All"
  ), xn.slice(1).map((T) => /* @__PURE__ */ h.createElement(
    "button",
    {
      key: T,
      className: `keyword-btn ${s === T ? "active" : ""}`,
      onClick: () => n(T)
    },
    T
  ))), /* @__PURE__ */ h.createElement("div", { className: "keyword-row" }, Tn.map((T) => /* @__PURE__ */ h.createElement(
    "button",
    {
      key: T,
      className: `keyword-btn tag ${i.includes(T) ? "active" : ""}`,
      onClick: () => y(T)
    },
    T
  )))), /* @__PURE__ */ h.createElement("div", { className: "view-controls-section" }, /* @__PURE__ */ h.createElement("button", { className: "toolbar-button active" }, "Library"), /* @__PURE__ */ h.createElement("button", { className: "toolbar-button" }, "Server"), /* @__PURE__ */ h.createElement("span", { className: "divider" }, "|"), /* @__PURE__ */ h.createElement(
    "button",
    {
      className: `view-toggle-btn ${e === "list" ? "active" : ""}`,
      onClick: () => t("list"),
      title: "List View"
    },
    "☰"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      className: `view-toggle-btn ${e === "grid" ? "active" : ""}`,
      onClick: () => t("grid"),
      title: "Grid View"
    },
    "⊞"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      className: `view-toggle-btn ${w ? "active" : ""}`,
      onClick: () => S(!w),
      title: "Show Details"
    },
    "ℹ"
  ))), /* @__PURE__ */ h.createElement("div", { className: "browser-main-content" }, /* @__PURE__ */ h.createElement("div", { className: "content-wrapper" }, e === "list" ? /* @__PURE__ */ h.createElement("div", { className: "preset-list-container" }, /* @__PURE__ */ h.createElement("div", { className: "preset-list-header" }, /* @__PURE__ */ h.createElement("div", { className: "column-header icon-col" }), /* @__PURE__ */ h.createElement(
    "div",
    {
      className: `column-header sortable ${d === "name" ? `sorted-${p}` : ""}`,
      onClick: () => C("name")
    },
    "Name"
  ), /* @__PURE__ */ h.createElement(
    "div",
    {
      className: `column-header sortable ${d === "category" ? `sorted-${p}` : ""}`,
      onClick: () => C("category")
    },
    "Category"
  ), /* @__PURE__ */ h.createElement(
    "div",
    {
      className: `column-header sortable ${d === "complexity" ? `sorted-${p}` : ""}`,
      onClick: () => C("complexity")
    },
    "Level"
  ), /* @__PURE__ */ h.createElement(
    "div",
    {
      className: `column-header sortable ${d === "nodes" ? `sorted-${p}` : ""}`,
      onClick: () => C("nodes")
    },
    "Nodes"
  ), /* @__PURE__ */ h.createElement("div", { className: "column-header action-col" }, "Action")), /* @__PURE__ */ h.createElement("div", { className: "preset-list-body" }, b.map((T) => /* @__PURE__ */ h.createElement(
    "div",
    {
      key: T.id,
      className: `preset-list-item ${c === T.id ? "selected" : ""}`,
      onClick: () => u(T.id),
      onDoubleClick: () => k(T)
    },
    /* @__PURE__ */ h.createElement("div", { className: "preset-icon" }, "📄"),
    /* @__PURE__ */ h.createElement("div", { className: "preset-name" }, T.name),
    /* @__PURE__ */ h.createElement("div", { className: "preset-category" }, T.category || ""),
    /* @__PURE__ */ h.createElement("div", { className: "preset-meta" }, T.complexity || ""),
    /* @__PURE__ */ h.createElement("div", { className: "preset-meta" }, T.nodes || 0),
    /* @__PURE__ */ h.createElement("div", { className: "preset-action" }, /* @__PURE__ */ h.createElement(
      "button",
      {
        className: "insert-btn",
        onClick: (M) => {
          M.stopPropagation(), k(T);
        }
      },
      "+"
    ))
  )))) : /* @__PURE__ */ h.createElement("div", { className: "preset-grid-container" }, b.map((T) => /* @__PURE__ */ h.createElement(
    "div",
    {
      key: T.id,
      className: `preset-card-compact ${c === T.id ? "selected" : ""}`,
      onClick: () => u(T.id),
      onDoubleClick: () => k(T)
    },
    /* @__PURE__ */ h.createElement(
      "button",
      {
        className: "preset-insert-btn",
        onClick: (M) => {
          M.stopPropagation(), k(T);
        }
      },
      "+"
    ),
    /* @__PURE__ */ h.createElement("div", { className: "preset-card-header" }, /* @__PURE__ */ h.createElement("div", { className: "preset-card-icon" }, "📄"), /* @__PURE__ */ h.createElement("div", { className: "preset-card-title" }, T.name)),
    /* @__PURE__ */ h.createElement("div", { className: "preset-card-meta" }, /* @__PURE__ */ h.createElement("span", { className: "preset-card-tag" }, T.category || "Uncategorized"), /* @__PURE__ */ h.createElement("span", { className: "preset-card-tag" }, T.nodes || 0, " nodes"))
  )))), w && c && /* @__PURE__ */ h.createElement("div", { className: "details-panel-horizontal" }, /* @__PURE__ */ h.createElement("div", { className: "details-header" }, /* @__PURE__ */ h.createElement("div", { className: "details-title" }, ((j = b.find((T) => T.id === c)) == null ? void 0 : j.name) || ""), /* @__PURE__ */ h.createElement("div", { className: "details-subtitle" }, ((m = b.find((T) => T.id === c)) == null ? void 0 : m.category) || "")), /* @__PURE__ */ h.createElement("div", { className: "details-content" }, /* @__PURE__ */ h.createElement("div", { className: "details-row" }, /* @__PURE__ */ h.createElement("span", { className: "details-label" }, "Complexity:"), /* @__PURE__ */ h.createElement("span", { className: "details-value" }, ((v = b.find((T) => T.id === c)) == null ? void 0 : v.complexity) || "N/A")), /* @__PURE__ */ h.createElement("div", { className: "details-row" }, /* @__PURE__ */ h.createElement("span", { className: "details-label" }, "Nodes:"), /* @__PURE__ */ h.createElement("span", { className: "details-value" }, ((x = b.find((T) => T.id === c)) == null ? void 0 : x.nodes) || 0)), /* @__PURE__ */ h.createElement("div", { className: "details-row" }, /* @__PURE__ */ h.createElement("span", { className: "details-label" }, "Tags:"), /* @__PURE__ */ h.createElement("span", { className: "details-value" }, ((G = b.find((T) => T.id === c)) == null ? void 0 : G.tags.join(", ")) || "None"))), /* @__PURE__ */ h.createElement("div", { className: "details-actions" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      className: "action-btn primary",
      onClick: () => {
        const T = b.find((M) => M.id === c);
        T && k(T);
      }
    },
    "Insert"
  ), /* @__PURE__ */ h.createElement("button", { className: "action-btn" }, "Preview")))));
}
const Cn = (r) => /* @__PURE__ */ h.createElement(An, { ...r }), On = (r) => {
  let e;
  return r ? e = r : typeof fetch > "u" ? e = (...t) => Promise.resolve().then(() => Me).then(({ default: s }) => s(...t)) : e = fetch, (...t) => e(...t);
};
class is extends Error {
  constructor(e, t = "FunctionsError", s) {
    super(e), this.name = t, this.context = s;
  }
}
class jn extends is {
  constructor(e) {
    super("Failed to send a request to the Edge Function", "FunctionsFetchError", e);
  }
}
class Ts extends is {
  constructor(e) {
    super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
  }
}
class As extends is {
  constructor(e) {
    super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e);
  }
}
var Wt;
(function(r) {
  r.Any = "any", r.ApNortheast1 = "ap-northeast-1", r.ApNortheast2 = "ap-northeast-2", r.ApSouth1 = "ap-south-1", r.ApSoutheast1 = "ap-southeast-1", r.ApSoutheast2 = "ap-southeast-2", r.CaCentral1 = "ca-central-1", r.EuCentral1 = "eu-central-1", r.EuWest1 = "eu-west-1", r.EuWest2 = "eu-west-2", r.EuWest3 = "eu-west-3", r.SaEast1 = "sa-east-1", r.UsEast1 = "us-east-1", r.UsWest1 = "us-west-1", r.UsWest2 = "us-west-2";
})(Wt || (Wt = {}));
var Rn = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
class In {
  constructor(e, { headers: t = {}, customFetch: s, region: n = Wt.Any } = {}) {
    this.url = e, this.headers = t, this.region = n, this.fetch = On(s);
  }
  /**
   * Updates the authorization header
   * @param token - the new jwt token sent in the authorisation header
   */
  setAuth(e) {
    this.headers.Authorization = `Bearer ${e}`;
  }
  /**
   * Invokes a function
   * @param functionName - The name of the Function to invoke.
   * @param options - Options for invoking the Function.
   */
  invoke(e, t = {}) {
    var s;
    return Rn(this, void 0, void 0, function* () {
      try {
        const { headers: n, method: i, body: a } = t;
        let o = {}, { region: l } = t;
        l || (l = this.region);
        const c = new URL(`${this.url}/${e}`);
        l && l !== "any" && (o["x-region"] = l, c.searchParams.set("forceFunctionRegion", l));
        let u;
        a && (n && !Object.prototype.hasOwnProperty.call(n, "Content-Type") || !n) && (typeof Blob < "u" && a instanceof Blob || a instanceof ArrayBuffer ? (o["Content-Type"] = "application/octet-stream", u = a) : typeof a == "string" ? (o["Content-Type"] = "text/plain", u = a) : typeof FormData < "u" && a instanceof FormData ? u = a : (o["Content-Type"] = "application/json", u = JSON.stringify(a)));
        const d = yield this.fetch(c.toString(), {
          method: i || "POST",
          // headers priority is (high to low):
          // 1. invoke-level headers
          // 2. client-level headers
          // 3. default Content-Type header
          headers: Object.assign(Object.assign(Object.assign({}, o), this.headers), n),
          body: u
        }).catch((w) => {
          throw new jn(w);
        }), f = d.headers.get("x-relay-error");
        if (f && f === "true")
          throw new Ts(d);
        if (!d.ok)
          throw new As(d);
        let p = ((s = d.headers.get("Content-Type")) !== null && s !== void 0 ? s : "text/plain").split(";")[0].trim(), g;
        return p === "application/json" ? g = yield d.json() : p === "application/octet-stream" ? g = yield d.blob() : p === "text/event-stream" ? g = d : p === "multipart/form-data" ? g = yield d.formData() : g = yield d.text(), { data: g, error: null, response: d };
      } catch (n) {
        return {
          data: null,
          error: n,
          response: n instanceof As || n instanceof Ts ? n.context : void 0
        };
      }
    });
  }
}
var X = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Pn(r) {
  if (r.__esModule) return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function s() {
      return this instanceof s ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(s) {
    var n = Object.getOwnPropertyDescriptor(r, s);
    Object.defineProperty(t, s, n.get ? n : {
      enumerable: !0,
      get: function() {
        return r[s];
      }
    });
  }), t;
}
var Q = {}, as = {}, vt = {}, Ye = {}, _t = {}, bt = {}, $n = function() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("unable to locate global object");
}, De = $n();
const Nn = De.fetch, Qs = De.fetch.bind(De), Ys = De.Headers, Ln = De.Request, Un = De.Response, Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Headers: Ys,
  Request: Ln,
  Response: Un,
  default: Qs,
  fetch: Nn
}, Symbol.toStringTag, { value: "Module" })), Dn = /* @__PURE__ */ Pn(Me);
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
let Mn = class extends Error {
  constructor(e) {
    super(e.message), this.name = "PostgrestError", this.details = e.details, this.hint = e.hint, this.code = e.code;
  }
};
wt.default = Mn;
var Xs = X && X.__importDefault || function(r) {
  return r && r.__esModule ? r : { default: r };
};
Object.defineProperty(bt, "__esModule", { value: !0 });
const Bn = Xs(Dn), Fn = Xs(wt);
let qn = class {
  constructor(e) {
    this.shouldThrowOnError = !1, this.method = e.method, this.url = e.url, this.headers = e.headers, this.schema = e.schema, this.body = e.body, this.shouldThrowOnError = e.shouldThrowOnError, this.signal = e.signal, this.isMaybeSingle = e.isMaybeSingle, e.fetch ? this.fetch = e.fetch : typeof fetch > "u" ? this.fetch = Bn.default : this.fetch = fetch;
  }
  /**
   * If there's an error with the query, throwOnError will reject the promise by
   * throwing the error instead of returning it as part of a successful response.
   *
   * {@link https://github.com/supabase/supabase-js/issues/92}
   */
  throwOnError() {
    return this.shouldThrowOnError = !0, this;
  }
  /**
   * Set an HTTP header for the request.
   */
  setHeader(e, t) {
    return this.headers = Object.assign({}, this.headers), this.headers[e] = t, this;
  }
  then(e, t) {
    this.schema === void 0 || (["GET", "HEAD"].includes(this.method) ? this.headers["Accept-Profile"] = this.schema : this.headers["Content-Profile"] = this.schema), this.method !== "GET" && this.method !== "HEAD" && (this.headers["Content-Type"] = "application/json");
    const s = this.fetch;
    let n = s(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal
    }).then(async (i) => {
      var a, o, l;
      let c = null, u = null, d = null, f = i.status, p = i.statusText;
      if (i.ok) {
        if (this.method !== "HEAD") {
          const b = await i.text();
          b === "" || (this.headers.Accept === "text/csv" || this.headers.Accept && this.headers.Accept.includes("application/vnd.pgrst.plan+text") ? u = b : u = JSON.parse(b));
        }
        const w = (a = this.headers.Prefer) === null || a === void 0 ? void 0 : a.match(/count=(exact|planned|estimated)/), S = (o = i.headers.get("content-range")) === null || o === void 0 ? void 0 : o.split("/");
        w && S && S.length > 1 && (d = parseInt(S[1])), this.isMaybeSingle && this.method === "GET" && Array.isArray(u) && (u.length > 1 ? (c = {
          // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
          code: "PGRST116",
          details: `Results contain ${u.length} rows, application/vnd.pgrst.object+json requires 1 row`,
          hint: null,
          message: "JSON object requested, multiple (or no) rows returned"
        }, u = null, d = null, f = 406, p = "Not Acceptable") : u.length === 1 ? u = u[0] : u = null);
      } else {
        const w = await i.text();
        try {
          c = JSON.parse(w), Array.isArray(c) && i.status === 404 && (u = [], c = null, f = 200, p = "OK");
        } catch {
          i.status === 404 && w === "" ? (f = 204, p = "No Content") : c = {
            message: w
          };
        }
        if (c && this.isMaybeSingle && (!((l = c == null ? void 0 : c.details) === null || l === void 0) && l.includes("0 rows")) && (c = null, f = 200, p = "OK"), c && this.shouldThrowOnError)
          throw new Fn.default(c);
      }
      return {
        error: c,
        data: u,
        count: d,
        status: f,
        statusText: p
      };
    });
    return this.shouldThrowOnError || (n = n.catch((i) => {
      var a, o, l;
      return {
        error: {
          message: `${(a = i == null ? void 0 : i.name) !== null && a !== void 0 ? a : "FetchError"}: ${i == null ? void 0 : i.message}`,
          details: `${(o = i == null ? void 0 : i.stack) !== null && o !== void 0 ? o : ""}`,
          hint: "",
          code: `${(l = i == null ? void 0 : i.code) !== null && l !== void 0 ? l : ""}`
        },
        data: null,
        count: null,
        status: 0,
        statusText: ""
      };
    })), n.then(e, t);
  }
  /**
   * Override the type of the returned `data`.
   *
   * @typeParam NewResult - The new result type to override with
   * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
   */
  returns() {
    return this;
  }
  /**
   * Override the type of the returned `data` field in the response.
   *
   * @typeParam NewResult - The new type to cast the response data to
   * @typeParam Options - Optional type configuration (defaults to { merge: true })
   * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
   * @example
   * ```typescript
   * // Merge with existing types (default behavior)
   * const query = supabase
   *   .from('users')
   *   .select()
   *   .overrideTypes<{ custom_field: string }>()
   *
   * // Replace existing types completely
   * const replaceQuery = supabase
   *   .from('users')
   *   .select()
   *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
   * ```
   * @returns A PostgrestBuilder instance with the new type
   */
  overrideTypes() {
    return this;
  }
};
bt.default = qn;
var zn = X && X.__importDefault || function(r) {
  return r && r.__esModule ? r : { default: r };
};
Object.defineProperty(_t, "__esModule", { value: !0 });
const Wn = zn(bt);
let Vn = class extends Wn.default {
  /**
   * Perform a SELECT on the query result.
   *
   * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
   * return modified rows. By calling this method, modified rows are returned in
   * `data`.
   *
   * @param columns - The columns to retrieve, separated by commas
   */
  select(e) {
    let t = !1;
    const s = (e ?? "*").split("").map((n) => /\s/.test(n) && !t ? "" : (n === '"' && (t = !t), n)).join("");
    return this.url.searchParams.set("select", s), this.headers.Prefer && (this.headers.Prefer += ","), this.headers.Prefer += "return=representation", this;
  }
  /**
   * Order the query result by `column`.
   *
   * You can call this method multiple times to order by multiple columns.
   *
   * You can order referenced tables, but it only affects the ordering of the
   * parent table if you use `!inner` in the query.
   *
   * @param column - The column to order by
   * @param options - Named parameters
   * @param options.ascending - If `true`, the result will be in ascending order
   * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
   * `null`s appear last.
   * @param options.referencedTable - Set this to order a referenced table by
   * its columns
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  order(e, { ascending: t = !0, nullsFirst: s, foreignTable: n, referencedTable: i = n } = {}) {
    const a = i ? `${i}.order` : "order", o = this.url.searchParams.get(a);
    return this.url.searchParams.set(a, `${o ? `${o},` : ""}${e}.${t ? "asc" : "desc"}${s === void 0 ? "" : s ? ".nullsfirst" : ".nullslast"}`), this;
  }
  /**
   * Limit the query result by `count`.
   *
   * @param count - The maximum number of rows to return
   * @param options - Named parameters
   * @param options.referencedTable - Set this to limit rows of referenced
   * tables instead of the parent table
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  limit(e, { foreignTable: t, referencedTable: s = t } = {}) {
    const n = typeof s > "u" ? "limit" : `${s}.limit`;
    return this.url.searchParams.set(n, `${e}`), this;
  }
  /**
   * Limit the query result by starting at an offset `from` and ending at the offset `to`.
   * Only records within this range are returned.
   * This respects the query order and if there is no order clause the range could behave unexpectedly.
   * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
   * and fourth rows of the query.
   *
   * @param from - The starting index from which to limit the result
   * @param to - The last index to which to limit the result
   * @param options - Named parameters
   * @param options.referencedTable - Set this to limit rows of referenced
   * tables instead of the parent table
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  range(e, t, { foreignTable: s, referencedTable: n = s } = {}) {
    const i = typeof n > "u" ? "offset" : `${n}.offset`, a = typeof n > "u" ? "limit" : `${n}.limit`;
    return this.url.searchParams.set(i, `${e}`), this.url.searchParams.set(a, `${t - e + 1}`), this;
  }
  /**
   * Set the AbortSignal for the fetch request.
   *
   * @param signal - The AbortSignal to use for the fetch request
   */
  abortSignal(e) {
    return this.signal = e, this;
  }
  /**
   * Return `data` as a single object instead of an array of objects.
   *
   * Query result must be one row (e.g. using `.limit(1)`), otherwise this
   * returns an error.
   */
  single() {
    return this.headers.Accept = "application/vnd.pgrst.object+json", this;
  }
  /**
   * Return `data` as a single object instead of an array of objects.
   *
   * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
   * this returns an error.
   */
  maybeSingle() {
    return this.method === "GET" ? this.headers.Accept = "application/json" : this.headers.Accept = "application/vnd.pgrst.object+json", this.isMaybeSingle = !0, this;
  }
  /**
   * Return `data` as a string in CSV format.
   */
  csv() {
    return this.headers.Accept = "text/csv", this;
  }
  /**
   * Return `data` as an object in [GeoJSON](https://geojson.org) format.
   */
  geojson() {
    return this.headers.Accept = "application/geo+json", this;
  }
  /**
   * Return `data` as the EXPLAIN plan for the query.
   *
   * You need to enable the
   * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
   * setting before using this method.
   *
   * @param options - Named parameters
   *
   * @param options.analyze - If `true`, the query will be executed and the
   * actual run time will be returned
   *
   * @param options.verbose - If `true`, the query identifier will be returned
   * and `data` will include the output columns of the query
   *
   * @param options.settings - If `true`, include information on configuration
   * parameters that affect query planning
   *
   * @param options.buffers - If `true`, include information on buffer usage
   *
   * @param options.wal - If `true`, include information on WAL record generation
   *
   * @param options.format - The format of the output, can be `"text"` (default)
   * or `"json"`
   */
  explain({ analyze: e = !1, verbose: t = !1, settings: s = !1, buffers: n = !1, wal: i = !1, format: a = "text" } = {}) {
    var o;
    const l = [
      e ? "analyze" : null,
      t ? "verbose" : null,
      s ? "settings" : null,
      n ? "buffers" : null,
      i ? "wal" : null
    ].filter(Boolean).join("|"), c = (o = this.headers.Accept) !== null && o !== void 0 ? o : "application/json";
    return this.headers.Accept = `application/vnd.pgrst.plan+${a}; for="${c}"; options=${l};`, a === "json" ? this : this;
  }
  /**
   * Rollback the query.
   *
   * `data` will still be returned, but the query is not committed.
   */
  rollback() {
    var e;
    return ((e = this.headers.Prefer) !== null && e !== void 0 ? e : "").trim().length > 0 ? this.headers.Prefer += ",tx=rollback" : this.headers.Prefer = "tx=rollback", this;
  }
  /**
   * Override the type of the returned `data`.
   *
   * @typeParam NewResult - The new result type to override with
   * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
   */
  returns() {
    return this;
  }
};
_t.default = Vn;
var Zn = X && X.__importDefault || function(r) {
  return r && r.__esModule ? r : { default: r };
};
Object.defineProperty(Ye, "__esModule", { value: !0 });
const Kn = Zn(_t);
let Hn = class extends Kn.default {
  /**
   * Match only rows where `column` is equal to `value`.
   *
   * To check if the value of `column` is NULL, you should use `.is()` instead.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  eq(e, t) {
    return this.url.searchParams.append(e, `eq.${t}`), this;
  }
  /**
   * Match only rows where `column` is not equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  neq(e, t) {
    return this.url.searchParams.append(e, `neq.${t}`), this;
  }
  /**
   * Match only rows where `column` is greater than `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  gt(e, t) {
    return this.url.searchParams.append(e, `gt.${t}`), this;
  }
  /**
   * Match only rows where `column` is greater than or equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  gte(e, t) {
    return this.url.searchParams.append(e, `gte.${t}`), this;
  }
  /**
   * Match only rows where `column` is less than `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  lt(e, t) {
    return this.url.searchParams.append(e, `lt.${t}`), this;
  }
  /**
   * Match only rows where `column` is less than or equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  lte(e, t) {
    return this.url.searchParams.append(e, `lte.${t}`), this;
  }
  /**
   * Match only rows where `column` matches `pattern` case-sensitively.
   *
   * @param column - The column to filter on
   * @param pattern - The pattern to match with
   */
  like(e, t) {
    return this.url.searchParams.append(e, `like.${t}`), this;
  }
  /**
   * Match only rows where `column` matches all of `patterns` case-sensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  likeAllOf(e, t) {
    return this.url.searchParams.append(e, `like(all).{${t.join(",")}}`), this;
  }
  /**
   * Match only rows where `column` matches any of `patterns` case-sensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  likeAnyOf(e, t) {
    return this.url.searchParams.append(e, `like(any).{${t.join(",")}}`), this;
  }
  /**
   * Match only rows where `column` matches `pattern` case-insensitively.
   *
   * @param column - The column to filter on
   * @param pattern - The pattern to match with
   */
  ilike(e, t) {
    return this.url.searchParams.append(e, `ilike.${t}`), this;
  }
  /**
   * Match only rows where `column` matches all of `patterns` case-insensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  ilikeAllOf(e, t) {
    return this.url.searchParams.append(e, `ilike(all).{${t.join(",")}}`), this;
  }
  /**
   * Match only rows where `column` matches any of `patterns` case-insensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  ilikeAnyOf(e, t) {
    return this.url.searchParams.append(e, `ilike(any).{${t.join(",")}}`), this;
  }
  /**
   * Match only rows where `column` IS `value`.
   *
   * For non-boolean columns, this is only relevant for checking if the value of
   * `column` is NULL by setting `value` to `null`.
   *
   * For boolean columns, you can also set `value` to `true` or `false` and it
   * will behave the same way as `.eq()`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  is(e, t) {
    return this.url.searchParams.append(e, `is.${t}`), this;
  }
  /**
   * Match only rows where `column` is included in the `values` array.
   *
   * @param column - The column to filter on
   * @param values - The values array to filter with
   */
  in(e, t) {
    const s = Array.from(new Set(t)).map((n) => typeof n == "string" && new RegExp("[,()]").test(n) ? `"${n}"` : `${n}`).join(",");
    return this.url.searchParams.append(e, `in.(${s})`), this;
  }
  /**
   * Only relevant for jsonb, array, and range columns. Match only rows where
   * `column` contains every element appearing in `value`.
   *
   * @param column - The jsonb, array, or range column to filter on
   * @param value - The jsonb, array, or range value to filter with
   */
  contains(e, t) {
    return typeof t == "string" ? this.url.searchParams.append(e, `cs.${t}`) : Array.isArray(t) ? this.url.searchParams.append(e, `cs.{${t.join(",")}}`) : this.url.searchParams.append(e, `cs.${JSON.stringify(t)}`), this;
  }
  /**
   * Only relevant for jsonb, array, and range columns. Match only rows where
   * every element appearing in `column` is contained by `value`.
   *
   * @param column - The jsonb, array, or range column to filter on
   * @param value - The jsonb, array, or range value to filter with
   */
  containedBy(e, t) {
    return typeof t == "string" ? this.url.searchParams.append(e, `cd.${t}`) : Array.isArray(t) ? this.url.searchParams.append(e, `cd.{${t.join(",")}}`) : this.url.searchParams.append(e, `cd.${JSON.stringify(t)}`), this;
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is greater than any element in `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeGt(e, t) {
    return this.url.searchParams.append(e, `sr.${t}`), this;
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is either contained in `range` or greater than any element in
   * `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeGte(e, t) {
    return this.url.searchParams.append(e, `nxl.${t}`), this;
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is less than any element in `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeLt(e, t) {
    return this.url.searchParams.append(e, `sl.${t}`), this;
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is either contained in `range` or less than any element in
   * `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeLte(e, t) {
    return this.url.searchParams.append(e, `nxr.${t}`), this;
  }
  /**
   * Only relevant for range columns. Match only rows where `column` is
   * mutually exclusive to `range` and there can be no element between the two
   * ranges.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeAdjacent(e, t) {
    return this.url.searchParams.append(e, `adj.${t}`), this;
  }
  /**
   * Only relevant for array and range columns. Match only rows where
   * `column` and `value` have an element in common.
   *
   * @param column - The array or range column to filter on
   * @param value - The array or range value to filter with
   */
  overlaps(e, t) {
    return typeof t == "string" ? this.url.searchParams.append(e, `ov.${t}`) : this.url.searchParams.append(e, `ov.{${t.join(",")}}`), this;
  }
  /**
   * Only relevant for text and tsvector columns. Match only rows where
   * `column` matches the query string in `query`.
   *
   * @param column - The text or tsvector column to filter on
   * @param query - The query text to match with
   * @param options - Named parameters
   * @param options.config - The text search configuration to use
   * @param options.type - Change how the `query` text is interpreted
   */
  textSearch(e, t, { config: s, type: n } = {}) {
    let i = "";
    n === "plain" ? i = "pl" : n === "phrase" ? i = "ph" : n === "websearch" && (i = "w");
    const a = s === void 0 ? "" : `(${s})`;
    return this.url.searchParams.append(e, `${i}fts${a}.${t}`), this;
  }
  /**
   * Match only rows where each column in `query` keys is equal to its
   * associated value. Shorthand for multiple `.eq()`s.
   *
   * @param query - The object to filter with, with column names as keys mapped
   * to their filter values
   */
  match(e) {
    return Object.entries(e).forEach(([t, s]) => {
      this.url.searchParams.append(t, `eq.${s}`);
    }), this;
  }
  /**
   * Match only rows which doesn't satisfy the filter.
   *
   * Unlike most filters, `opearator` and `value` are used as-is and need to
   * follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure they are properly sanitized.
   *
   * @param column - The column to filter on
   * @param operator - The operator to be negated to filter with, following
   * PostgREST syntax
   * @param value - The value to filter with, following PostgREST syntax
   */
  not(e, t, s) {
    return this.url.searchParams.append(e, `not.${t}.${s}`), this;
  }
  /**
   * Match only rows which satisfy at least one of the filters.
   *
   * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure it's properly sanitized.
   *
   * It's currently not possible to do an `.or()` filter across multiple tables.
   *
   * @param filters - The filters to use, following PostgREST syntax
   * @param options - Named parameters
   * @param options.referencedTable - Set this to filter on referenced tables
   * instead of the parent table
   * @param options.foreignTable - Deprecated, use `referencedTable` instead
   */
  or(e, { foreignTable: t, referencedTable: s = t } = {}) {
    const n = s ? `${s}.or` : "or";
    return this.url.searchParams.append(n, `(${e})`), this;
  }
  /**
   * Match only rows which satisfy the filter. This is an escape hatch - you
   * should use the specific filter methods wherever possible.
   *
   * Unlike most filters, `opearator` and `value` are used as-is and need to
   * follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure they are properly sanitized.
   *
   * @param column - The column to filter on
   * @param operator - The operator to filter with, following PostgREST syntax
   * @param value - The value to filter with, following PostgREST syntax
   */
  filter(e, t, s) {
    return this.url.searchParams.append(e, `${t}.${s}`), this;
  }
};
Ye.default = Hn;
var Gn = X && X.__importDefault || function(r) {
  return r && r.__esModule ? r : { default: r };
};
Object.defineProperty(vt, "__esModule", { value: !0 });
const qe = Gn(Ye);
let Jn = class {
  constructor(e, { headers: t = {}, schema: s, fetch: n }) {
    this.url = e, this.headers = t, this.schema = s, this.fetch = n;
  }
  /**
   * Perform a SELECT query on the table or view.
   *
   * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
   *
   * @param options - Named parameters
   *
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   *
   * @param options.count - Count algorithm to use to count rows in the table or view.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  select(e, { head: t = !1, count: s } = {}) {
    const n = t ? "HEAD" : "GET";
    let i = !1;
    const a = (e ?? "*").split("").map((o) => /\s/.test(o) && !i ? "" : (o === '"' && (i = !i), o)).join("");
    return this.url.searchParams.set("select", a), s && (this.headers.Prefer = `count=${s}`), new qe.default({
      method: n,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
  /**
   * Perform an INSERT into the table or view.
   *
   * By default, inserted rows are not returned. To return it, chain the call
   * with `.select()`.
   *
   * @param values - The values to insert. Pass an object to insert a single row
   * or an array to insert multiple rows.
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count inserted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @param options.defaultToNull - Make missing fields default to `null`.
   * Otherwise, use the default value for the column. Only applies for bulk
   * inserts.
   */
  insert(e, { count: t, defaultToNull: s = !0 } = {}) {
    const n = "POST", i = [];
    if (this.headers.Prefer && i.push(this.headers.Prefer), t && i.push(`count=${t}`), s || i.push("missing=default"), this.headers.Prefer = i.join(","), Array.isArray(e)) {
      const a = e.reduce((o, l) => o.concat(Object.keys(l)), []);
      if (a.length > 0) {
        const o = [...new Set(a)].map((l) => `"${l}"`);
        this.url.searchParams.set("columns", o.join(","));
      }
    }
    return new qe.default({
      method: n,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
  /**
   * Perform an UPSERT on the table or view. Depending on the column(s) passed
   * to `onConflict`, `.upsert()` allows you to perform the equivalent of
   * `.insert()` if a row with the corresponding `onConflict` columns doesn't
   * exist, or if it does exist, perform an alternative action depending on
   * `ignoreDuplicates`.
   *
   * By default, upserted rows are not returned. To return it, chain the call
   * with `.select()`.
   *
   * @param values - The values to upsert with. Pass an object to upsert a
   * single row or an array to upsert multiple rows.
   *
   * @param options - Named parameters
   *
   * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
   * duplicate rows are determined. Two rows are duplicates if all the
   * `onConflict` columns are equal.
   *
   * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
   * `false`, duplicate rows are merged with existing rows.
   *
   * @param options.count - Count algorithm to use to count upserted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @param options.defaultToNull - Make missing fields default to `null`.
   * Otherwise, use the default value for the column. This only applies when
   * inserting new rows, not when merging with existing rows under
   * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
   */
  upsert(e, { onConflict: t, ignoreDuplicates: s = !1, count: n, defaultToNull: i = !0 } = {}) {
    const a = "POST", o = [`resolution=${s ? "ignore" : "merge"}-duplicates`];
    if (t !== void 0 && this.url.searchParams.set("on_conflict", t), this.headers.Prefer && o.push(this.headers.Prefer), n && o.push(`count=${n}`), i || o.push("missing=default"), this.headers.Prefer = o.join(","), Array.isArray(e)) {
      const l = e.reduce((c, u) => c.concat(Object.keys(u)), []);
      if (l.length > 0) {
        const c = [...new Set(l)].map((u) => `"${u}"`);
        this.url.searchParams.set("columns", c.join(","));
      }
    }
    return new qe.default({
      method: a,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
  /**
   * Perform an UPDATE on the table or view.
   *
   * By default, updated rows are not returned. To return it, chain the call
   * with `.select()` after filters.
   *
   * @param values - The values to update with
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count updated rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  update(e, { count: t } = {}) {
    const s = "PATCH", n = [];
    return this.headers.Prefer && n.push(this.headers.Prefer), t && n.push(`count=${t}`), this.headers.Prefer = n.join(","), new qe.default({
      method: s,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
  /**
   * Perform a DELETE on the table or view.
   *
   * By default, deleted rows are not returned. To return it, chain the call
   * with `.select()` after filters.
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count deleted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  delete({ count: e } = {}) {
    const t = "DELETE", s = [];
    return e && s.push(`count=${e}`), this.headers.Prefer && s.unshift(this.headers.Prefer), this.headers.Prefer = s.join(","), new qe.default({
      method: t,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
};
vt.default = Jn;
var kt = {}, Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.version = void 0;
Et.version = "0.0.0-automated";
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.DEFAULT_HEADERS = void 0;
const Qn = Et;
kt.DEFAULT_HEADERS = { "X-Client-Info": `postgrest-js/${Qn.version}` };
var er = X && X.__importDefault || function(r) {
  return r && r.__esModule ? r : { default: r };
};
Object.defineProperty(as, "__esModule", { value: !0 });
const Yn = er(vt), Xn = er(Ye), ei = kt;
let ti = class tr {
  // TODO: Add back shouldThrowOnError once we figure out the typings
  /**
   * Creates a PostgREST client.
   *
   * @param url - URL of the PostgREST endpoint
   * @param options - Named parameters
   * @param options.headers - Custom headers
   * @param options.schema - Postgres schema to switch to
   * @param options.fetch - Custom fetch
   */
  constructor(e, { headers: t = {}, schema: s, fetch: n } = {}) {
    this.url = e, this.headers = Object.assign(Object.assign({}, ei.DEFAULT_HEADERS), t), this.schemaName = s, this.fetch = n;
  }
  /**
   * Perform a query on a table or a view.
   *
   * @param relation - The table or view name to query
   */
  from(e) {
    const t = new URL(`${this.url}/${e}`);
    return new Yn.default(t, {
      headers: Object.assign({}, this.headers),
      schema: this.schemaName,
      fetch: this.fetch
    });
  }
  /**
   * Select a schema to query or perform an function (rpc) call.
   *
   * The schema needs to be on the list of exposed schemas inside Supabase.
   *
   * @param schema - The schema to query
   */
  schema(e) {
    return new tr(this.url, {
      headers: this.headers,
      schema: e,
      fetch: this.fetch
    });
  }
  /**
   * Perform a function call.
   *
   * @param fn - The function name to call
   * @param args - The arguments to pass to the function call
   * @param options - Named parameters
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   * @param options.get - When set to `true`, the function will be called with
   * read-only access mode.
   * @param options.count - Count algorithm to use to count rows returned by the
   * function. Only applicable for [set-returning
   * functions](https://www.postgresql.org/docs/current/functions-srf.html).
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  rpc(e, t = {}, { head: s = !1, get: n = !1, count: i } = {}) {
    let a;
    const o = new URL(`${this.url}/rpc/${e}`);
    let l;
    s || n ? (a = s ? "HEAD" : "GET", Object.entries(t).filter(([u, d]) => d !== void 0).map(([u, d]) => [u, Array.isArray(d) ? `{${d.join(",")}}` : `${d}`]).forEach(([u, d]) => {
      o.searchParams.append(u, d);
    })) : (a = "POST", l = t);
    const c = Object.assign({}, this.headers);
    return i && (c.Prefer = `count=${i}`), new Xn.default({
      method: a,
      url: o,
      headers: c,
      schema: this.schemaName,
      body: l,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
};
as.default = ti;
var Be = X && X.__importDefault || function(r) {
  return r && r.__esModule ? r : { default: r };
};
Object.defineProperty(Q, "__esModule", { value: !0 });
Q.PostgrestError = Q.PostgrestBuilder = Q.PostgrestTransformBuilder = Q.PostgrestFilterBuilder = Q.PostgrestQueryBuilder = Q.PostgrestClient = void 0;
const sr = Be(as);
Q.PostgrestClient = sr.default;
const rr = Be(vt);
Q.PostgrestQueryBuilder = rr.default;
const nr = Be(Ye);
Q.PostgrestFilterBuilder = nr.default;
const ir = Be(_t);
Q.PostgrestTransformBuilder = ir.default;
const ar = Be(bt);
Q.PostgrestBuilder = ar.default;
const or = Be(wt);
Q.PostgrestError = or.default;
var si = Q.default = {
  PostgrestClient: sr.default,
  PostgrestQueryBuilder: rr.default,
  PostgrestFilterBuilder: nr.default,
  PostgrestTransformBuilder: ir.default,
  PostgrestBuilder: ar.default,
  PostgrestError: or.default
};
const {
  PostgrestClient: ri,
  PostgrestQueryBuilder: ko,
  PostgrestFilterBuilder: Eo,
  PostgrestTransformBuilder: So,
  PostgrestBuilder: xo,
  PostgrestError: To
} = si;
class ni {
  /**
   * Dynamic require that works in both CJS and ESM environments
   * Bulletproof against strict ESM environments where require might not be in scope
   * @private
   */
  static dynamicRequire(e) {
    try {
      return typeof process < "u" && process.versions && process.versions.node && typeof require < "u" ? require(e) : null;
    } catch {
      return null;
    }
  }
  static detectEnvironment() {
    var e, t;
    if (typeof WebSocket < "u")
      return { type: "native", constructor: WebSocket };
    if (typeof globalThis < "u" && typeof globalThis.WebSocket < "u")
      return { type: "native", constructor: globalThis.WebSocket };
    if (typeof global < "u" && typeof global.WebSocket < "u")
      return { type: "native", constructor: global.WebSocket };
    if (typeof globalThis < "u" && typeof globalThis.WebSocketPair < "u" && typeof globalThis.WebSocket > "u")
      return {
        type: "cloudflare",
        error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
        workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
      };
    if (typeof globalThis < "u" && globalThis.EdgeRuntime || typeof navigator < "u" && (!((e = navigator.userAgent) === null || e === void 0) && e.includes("Vercel-Edge")))
      return {
        type: "unsupported",
        error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
        workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
      };
    if (typeof process < "u" && process.versions && process.versions.node) {
      const s = parseInt(process.versions.node.split(".")[0]);
      if (s >= 22)
        try {
          if (typeof globalThis.WebSocket < "u")
            return { type: "native", constructor: globalThis.WebSocket };
          const n = this.dynamicRequire("undici");
          if (n && n.WebSocket)
            return { type: "native", constructor: n.WebSocket };
          throw new Error("undici not available");
        } catch {
          return {
            type: "unsupported",
            error: `Node.js ${s} detected but native WebSocket not found.`,
            workaround: 'Install the "ws" package or check your Node.js installation.'
          };
        }
      try {
        const n = this.dynamicRequire("ws");
        if (n)
          return { type: "ws", constructor: (t = n.WebSocket) !== null && t !== void 0 ? t : n };
        throw new Error("ws package not available");
      } catch {
        return {
          type: "unsupported",
          error: `Node.js ${s} detected without WebSocket support.`,
          workaround: 'Install the "ws" package: npm install ws'
        };
      }
    }
    return {
      type: "unsupported",
      error: "Unknown JavaScript runtime without WebSocket support.",
      workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
    };
  }
  static getWebSocketConstructor() {
    const e = this.detectEnvironment();
    if (e.constructor)
      return e.constructor;
    let t = e.error || "WebSocket not supported in this environment.";
    throw e.workaround && (t += `

Suggested solution: ${e.workaround}`), new Error(t);
  }
  static createWebSocket(e, t) {
    const s = this.getWebSocketConstructor();
    return new s(e, t);
  }
  static isWebSocketSupported() {
    try {
      const e = this.detectEnvironment();
      return e.type === "native" || e.type === "ws";
    } catch {
      return !1;
    }
  }
}
const ii = "2.15.0", ai = `realtime-js/${ii}`, oi = "1.0.0", Vt = 1e4, li = 1e3, ci = 100;
var Ve;
(function(r) {
  r[r.connecting = 0] = "connecting", r[r.open = 1] = "open", r[r.closing = 2] = "closing", r[r.closed = 3] = "closed";
})(Ve || (Ve = {}));
var W;
(function(r) {
  r.closed = "closed", r.errored = "errored", r.joined = "joined", r.joining = "joining", r.leaving = "leaving";
})(W || (W = {}));
var re;
(function(r) {
  r.close = "phx_close", r.error = "phx_error", r.join = "phx_join", r.reply = "phx_reply", r.leave = "phx_leave", r.access_token = "access_token";
})(re || (re = {}));
var Zt;
(function(r) {
  r.websocket = "websocket";
})(Zt || (Zt = {}));
var we;
(function(r) {
  r.Connecting = "connecting", r.Open = "open", r.Closing = "closing", r.Closed = "closed";
})(we || (we = {}));
class ui {
  constructor() {
    this.HEADER_LENGTH = 1;
  }
  decode(e, t) {
    return e.constructor === ArrayBuffer ? t(this._binaryDecode(e)) : t(typeof e == "string" ? JSON.parse(e) : {});
  }
  _binaryDecode(e) {
    const t = new DataView(e), s = new TextDecoder();
    return this._decodeBroadcast(e, t, s);
  }
  _decodeBroadcast(e, t, s) {
    const n = t.getUint8(1), i = t.getUint8(2);
    let a = this.HEADER_LENGTH + 2;
    const o = s.decode(e.slice(a, a + n));
    a = a + n;
    const l = s.decode(e.slice(a, a + i));
    a = a + i;
    const c = JSON.parse(s.decode(e.slice(a, e.byteLength)));
    return { ref: null, topic: o, event: l, payload: c };
  }
}
class lr {
  constructor(e, t) {
    this.callback = e, this.timerCalc = t, this.timer = void 0, this.tries = 0, this.callback = e, this.timerCalc = t;
  }
  reset() {
    this.tries = 0, clearTimeout(this.timer), this.timer = void 0;
  }
  // Cancels any previous scheduleTimeout and schedules callback
  scheduleTimeout() {
    clearTimeout(this.timer), this.timer = setTimeout(() => {
      this.tries = this.tries + 1, this.callback();
    }, this.timerCalc(this.tries + 1));
  }
}
var B;
(function(r) {
  r.abstime = "abstime", r.bool = "bool", r.date = "date", r.daterange = "daterange", r.float4 = "float4", r.float8 = "float8", r.int2 = "int2", r.int4 = "int4", r.int4range = "int4range", r.int8 = "int8", r.int8range = "int8range", r.json = "json", r.jsonb = "jsonb", r.money = "money", r.numeric = "numeric", r.oid = "oid", r.reltime = "reltime", r.text = "text", r.time = "time", r.timestamp = "timestamp", r.timestamptz = "timestamptz", r.timetz = "timetz", r.tsrange = "tsrange", r.tstzrange = "tstzrange";
})(B || (B = {}));
const Cs = (r, e, t = {}) => {
  var s;
  const n = (s = t.skipTypes) !== null && s !== void 0 ? s : [];
  return Object.keys(e).reduce((i, a) => (i[a] = di(a, r, e, n), i), {});
}, di = (r, e, t, s) => {
  const n = e.find((o) => o.name === r), i = n == null ? void 0 : n.type, a = t[r];
  return i && !s.includes(i) ? cr(i, a) : Kt(a);
}, cr = (r, e) => {
  if (r.charAt(0) === "_") {
    const t = r.slice(1, r.length);
    return gi(e, t);
  }
  switch (r) {
    case B.bool:
      return hi(e);
    case B.float4:
    case B.float8:
    case B.int2:
    case B.int4:
    case B.int8:
    case B.numeric:
    case B.oid:
      return fi(e);
    case B.json:
    case B.jsonb:
      return pi(e);
    case B.timestamp:
      return mi(e);
    // Format to be consistent with PostgREST
    case B.abstime:
    // To allow users to cast it based on Timezone
    case B.date:
    // To allow users to cast it based on Timezone
    case B.daterange:
    case B.int4range:
    case B.int8range:
    case B.money:
    case B.reltime:
    // To allow users to cast it based on Timezone
    case B.text:
    case B.time:
    // To allow users to cast it based on Timezone
    case B.timestamptz:
    // To allow users to cast it based on Timezone
    case B.timetz:
    // To allow users to cast it based on Timezone
    case B.tsrange:
    case B.tstzrange:
      return Kt(e);
    default:
      return Kt(e);
  }
}, Kt = (r) => r, hi = (r) => {
  switch (r) {
    case "t":
      return !0;
    case "f":
      return !1;
    default:
      return r;
  }
}, fi = (r) => {
  if (typeof r == "string") {
    const e = parseFloat(r);
    if (!Number.isNaN(e))
      return e;
  }
  return r;
}, pi = (r) => {
  if (typeof r == "string")
    try {
      return JSON.parse(r);
    } catch (e) {
      return console.log(`JSON parse error: ${e}`), r;
    }
  return r;
}, gi = (r, e) => {
  if (typeof r != "string")
    return r;
  const t = r.length - 1, s = r[t];
  if (r[0] === "{" && s === "}") {
    let i;
    const a = r.slice(1, t);
    try {
      i = JSON.parse("[" + a + "]");
    } catch {
      i = a ? a.split(",") : [];
    }
    return i.map((o) => cr(e, o));
  }
  return r;
}, mi = (r) => typeof r == "string" ? r.replace(" ", "T") : r, ur = (r) => {
  let e = r;
  return e = e.replace(/^ws/i, "http"), e = e.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, ""), e.replace(/\/+$/, "") + "/api/broadcast";
};
class At {
  /**
   * Initializes the Push
   *
   * @param channel The Channel
   * @param event The event, for example `"phx_join"`
   * @param payload The payload, for example `{user_id: 123}`
   * @param timeout The push timeout in milliseconds
   */
  constructor(e, t, s = {}, n = Vt) {
    this.channel = e, this.event = t, this.payload = s, this.timeout = n, this.sent = !1, this.timeoutTimer = void 0, this.ref = "", this.receivedResp = null, this.recHooks = [], this.refEvent = null;
  }
  resend(e) {
    this.timeout = e, this._cancelRefEvent(), this.ref = "", this.refEvent = null, this.receivedResp = null, this.sent = !1, this.send();
  }
  send() {
    this._hasReceived("timeout") || (this.startTimeout(), this.sent = !0, this.channel.socket.push({
      topic: this.channel.topic,
      event: this.event,
      payload: this.payload,
      ref: this.ref,
      join_ref: this.channel._joinRef()
    }));
  }
  updatePayload(e) {
    this.payload = Object.assign(Object.assign({}, this.payload), e);
  }
  receive(e, t) {
    var s;
    return this._hasReceived(e) && t((s = this.receivedResp) === null || s === void 0 ? void 0 : s.response), this.recHooks.push({ status: e, callback: t }), this;
  }
  startTimeout() {
    if (this.timeoutTimer)
      return;
    this.ref = this.channel.socket._makeRef(), this.refEvent = this.channel._replyEventName(this.ref);
    const e = (t) => {
      this._cancelRefEvent(), this._cancelTimeout(), this.receivedResp = t, this._matchReceive(t);
    };
    this.channel._on(this.refEvent, {}, e), this.timeoutTimer = setTimeout(() => {
      this.trigger("timeout", {});
    }, this.timeout);
  }
  trigger(e, t) {
    this.refEvent && this.channel._trigger(this.refEvent, { status: e, response: t });
  }
  destroy() {
    this._cancelRefEvent(), this._cancelTimeout();
  }
  _cancelRefEvent() {
    this.refEvent && this.channel._off(this.refEvent, {});
  }
  _cancelTimeout() {
    clearTimeout(this.timeoutTimer), this.timeoutTimer = void 0;
  }
  _matchReceive({ status: e, response: t }) {
    this.recHooks.filter((s) => s.status === e).forEach((s) => s.callback(t));
  }
  _hasReceived(e) {
    return this.receivedResp && this.receivedResp.status === e;
  }
}
var Os;
(function(r) {
  r.SYNC = "sync", r.JOIN = "join", r.LEAVE = "leave";
})(Os || (Os = {}));
class Ze {
  /**
   * Initializes the Presence.
   *
   * @param channel - The RealtimeChannel
   * @param opts - The options,
   *        for example `{events: {state: 'state', diff: 'diff'}}`
   */
  constructor(e, t) {
    this.channel = e, this.state = {}, this.pendingDiffs = [], this.joinRef = null, this.enabled = !1, this.caller = {
      onJoin: () => {
      },
      onLeave: () => {
      },
      onSync: () => {
      }
    };
    const s = (t == null ? void 0 : t.events) || {
      state: "presence_state",
      diff: "presence_diff"
    };
    this.channel._on(s.state, {}, (n) => {
      const { onJoin: i, onLeave: a, onSync: o } = this.caller;
      this.joinRef = this.channel._joinRef(), this.state = Ze.syncState(this.state, n, i, a), this.pendingDiffs.forEach((l) => {
        this.state = Ze.syncDiff(this.state, l, i, a);
      }), this.pendingDiffs = [], o();
    }), this.channel._on(s.diff, {}, (n) => {
      const { onJoin: i, onLeave: a, onSync: o } = this.caller;
      this.inPendingSyncState() ? this.pendingDiffs.push(n) : (this.state = Ze.syncDiff(this.state, n, i, a), o());
    }), this.onJoin((n, i, a) => {
      this.channel._trigger("presence", {
        event: "join",
        key: n,
        currentPresences: i,
        newPresences: a
      });
    }), this.onLeave((n, i, a) => {
      this.channel._trigger("presence", {
        event: "leave",
        key: n,
        currentPresences: i,
        leftPresences: a
      });
    }), this.onSync(() => {
      this.channel._trigger("presence", { event: "sync" });
    });
  }
  /**
   * Used to sync the list of presences on the server with the
   * client's state.
   *
   * An optional `onJoin` and `onLeave` callback can be provided to
   * react to changes in the client's local presences across
   * disconnects and reconnects with the server.
   *
   * @internal
   */
  static syncState(e, t, s, n) {
    const i = this.cloneDeep(e), a = this.transformState(t), o = {}, l = {};
    return this.map(i, (c, u) => {
      a[c] || (l[c] = u);
    }), this.map(a, (c, u) => {
      const d = i[c];
      if (d) {
        const f = u.map((S) => S.presence_ref), p = d.map((S) => S.presence_ref), g = u.filter((S) => p.indexOf(S.presence_ref) < 0), w = d.filter((S) => f.indexOf(S.presence_ref) < 0);
        g.length > 0 && (o[c] = g), w.length > 0 && (l[c] = w);
      } else
        o[c] = u;
    }), this.syncDiff(i, { joins: o, leaves: l }, s, n);
  }
  /**
   * Used to sync a diff of presence join and leave events from the
   * server, as they happen.
   *
   * Like `syncState`, `syncDiff` accepts optional `onJoin` and
   * `onLeave` callbacks to react to a user joining or leaving from a
   * device.
   *
   * @internal
   */
  static syncDiff(e, t, s, n) {
    const { joins: i, leaves: a } = {
      joins: this.transformState(t.joins),
      leaves: this.transformState(t.leaves)
    };
    return s || (s = () => {
    }), n || (n = () => {
    }), this.map(i, (o, l) => {
      var c;
      const u = (c = e[o]) !== null && c !== void 0 ? c : [];
      if (e[o] = this.cloneDeep(l), u.length > 0) {
        const d = e[o].map((p) => p.presence_ref), f = u.filter((p) => d.indexOf(p.presence_ref) < 0);
        e[o].unshift(...f);
      }
      s(o, u, l);
    }), this.map(a, (o, l) => {
      let c = e[o];
      if (!c)
        return;
      const u = l.map((d) => d.presence_ref);
      c = c.filter((d) => u.indexOf(d.presence_ref) < 0), e[o] = c, n(o, c, l), c.length === 0 && delete e[o];
    }), e;
  }
  /** @internal */
  static map(e, t) {
    return Object.getOwnPropertyNames(e).map((s) => t(s, e[s]));
  }
  /**
   * Remove 'metas' key
   * Change 'phx_ref' to 'presence_ref'
   * Remove 'phx_ref' and 'phx_ref_prev'
   *
   * @example
   * // returns {
   *  abc123: [
   *    { presence_ref: '2', user_id: 1 },
   *    { presence_ref: '3', user_id: 2 }
   *  ]
   * }
   * RealtimePresence.transformState({
   *  abc123: {
   *    metas: [
   *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
   *      { phx_ref: '3', user_id: 2 }
   *    ]
   *  }
   * })
   *
   * @internal
   */
  static transformState(e) {
    return e = this.cloneDeep(e), Object.getOwnPropertyNames(e).reduce((t, s) => {
      const n = e[s];
      return "metas" in n ? t[s] = n.metas.map((i) => (i.presence_ref = i.phx_ref, delete i.phx_ref, delete i.phx_ref_prev, i)) : t[s] = n, t;
    }, {});
  }
  /** @internal */
  static cloneDeep(e) {
    return JSON.parse(JSON.stringify(e));
  }
  /** @internal */
  onJoin(e) {
    this.caller.onJoin = e;
  }
  /** @internal */
  onLeave(e) {
    this.caller.onLeave = e;
  }
  /** @internal */
  onSync(e) {
    this.caller.onSync = e;
  }
  /** @internal */
  inPendingSyncState() {
    return !this.joinRef || this.joinRef !== this.channel._joinRef();
  }
}
var js;
(function(r) {
  r.ALL = "*", r.INSERT = "INSERT", r.UPDATE = "UPDATE", r.DELETE = "DELETE";
})(js || (js = {}));
var Ke;
(function(r) {
  r.BROADCAST = "broadcast", r.PRESENCE = "presence", r.POSTGRES_CHANGES = "postgres_changes", r.SYSTEM = "system";
})(Ke || (Ke = {}));
var oe;
(function(r) {
  r.SUBSCRIBED = "SUBSCRIBED", r.TIMED_OUT = "TIMED_OUT", r.CLOSED = "CLOSED", r.CHANNEL_ERROR = "CHANNEL_ERROR";
})(oe || (oe = {}));
class os {
  constructor(e, t = { config: {} }, s) {
    this.topic = e, this.params = t, this.socket = s, this.bindings = {}, this.state = W.closed, this.joinedOnce = !1, this.pushBuffer = [], this.subTopic = e.replace(/^realtime:/i, ""), this.params.config = Object.assign({
      broadcast: { ack: !1, self: !1 },
      presence: { key: "", enabled: !1 },
      private: !1
    }, t.config), this.timeout = this.socket.timeout, this.joinPush = new At(this, re.join, this.params, this.timeout), this.rejoinTimer = new lr(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs), this.joinPush.receive("ok", () => {
      this.state = W.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((n) => n.send()), this.pushBuffer = [];
    }), this._onClose(() => {
      this.rejoinTimer.reset(), this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`), this.state = W.closed, this.socket._remove(this);
    }), this._onError((n) => {
      this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, n), this.state = W.errored, this.rejoinTimer.scheduleTimeout());
    }), this.joinPush.receive("timeout", () => {
      this._isJoining() && (this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), this.state = W.errored, this.rejoinTimer.scheduleTimeout());
    }), this.joinPush.receive("error", (n) => {
      this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, n), this.state = W.errored, this.rejoinTimer.scheduleTimeout());
    }), this._on(re.reply, {}, (n, i) => {
      this._trigger(this._replyEventName(i), n);
    }), this.presence = new Ze(this), this.broadcastEndpointURL = ur(this.socket.endPoint), this.private = this.params.config.private || !1;
  }
  /** Subscribe registers your client with the server */
  subscribe(e, t = this.timeout) {
    var s, n;
    if (this.socket.isConnected() || this.socket.connect(), this.state == W.closed) {
      const { config: { broadcast: i, presence: a, private: o } } = this.params, l = (n = (s = this.bindings.postgres_changes) === null || s === void 0 ? void 0 : s.map((f) => f.filter)) !== null && n !== void 0 ? n : [], c = !!this.bindings[Ke.PRESENCE] && this.bindings[Ke.PRESENCE].length > 0, u = {}, d = {
        broadcast: i,
        presence: Object.assign(Object.assign({}, a), { enabled: c }),
        postgres_changes: l,
        private: o
      };
      this.socket.accessTokenValue && (u.access_token = this.socket.accessTokenValue), this._onError((f) => e == null ? void 0 : e(oe.CHANNEL_ERROR, f)), this._onClose(() => e == null ? void 0 : e(oe.CLOSED)), this.updateJoinPayload(Object.assign({ config: d }, u)), this.joinedOnce = !0, this._rejoin(t), this.joinPush.receive("ok", async ({ postgres_changes: f }) => {
        var p;
        if (this.socket.setAuth(), f === void 0) {
          e == null || e(oe.SUBSCRIBED);
          return;
        } else {
          const g = this.bindings.postgres_changes, w = (p = g == null ? void 0 : g.length) !== null && p !== void 0 ? p : 0, S = [];
          for (let b = 0; b < w; b++) {
            const C = g[b], { filter: { event: y, schema: k, table: j, filter: m } } = C, v = f && f[b];
            if (v && v.event === y && v.schema === k && v.table === j && v.filter === m)
              S.push(Object.assign(Object.assign({}, C), { id: v.id }));
            else {
              this.unsubscribe(), this.state = W.errored, e == null || e(oe.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
              return;
            }
          }
          this.bindings.postgres_changes = S, e && e(oe.SUBSCRIBED);
          return;
        }
      }).receive("error", (f) => {
        this.state = W.errored, e == null || e(oe.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(f).join(", ") || "error")));
      }).receive("timeout", () => {
        e == null || e(oe.TIMED_OUT);
      });
    }
    return this;
  }
  presenceState() {
    return this.presence.state;
  }
  async track(e, t = {}) {
    return await this.send({
      type: "presence",
      event: "track",
      payload: e
    }, t.timeout || this.timeout);
  }
  async untrack(e = {}) {
    return await this.send({
      type: "presence",
      event: "untrack"
    }, e);
  }
  on(e, t, s) {
    return this.state === W.joined && e === Ke.PRESENCE && (this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`), this.unsubscribe().then(() => this.subscribe())), this._on(e, t, s);
  }
  /**
   * Sends a message into the channel.
   *
   * @param args Arguments to send to channel
   * @param args.type The type of event to send
   * @param args.event The name of the event being sent
   * @param args.payload Payload to be sent
   * @param opts Options to be used during the send process
   */
  async send(e, t = {}) {
    var s, n;
    if (!this._canPush() && e.type === "broadcast") {
      const { event: i, payload: a } = e, l = {
        method: "POST",
        headers: {
          Authorization: this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "",
          apikey: this.socket.apiKey ? this.socket.apiKey : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              topic: this.subTopic,
              event: i,
              payload: a,
              private: this.private
            }
          ]
        })
      };
      try {
        const c = await this._fetchWithTimeout(this.broadcastEndpointURL, l, (s = t.timeout) !== null && s !== void 0 ? s : this.timeout);
        return await ((n = c.body) === null || n === void 0 ? void 0 : n.cancel()), c.ok ? "ok" : "error";
      } catch (c) {
        return c.name === "AbortError" ? "timed out" : "error";
      }
    } else
      return new Promise((i) => {
        var a, o, l;
        const c = this._push(e.type, e, t.timeout || this.timeout);
        e.type === "broadcast" && !(!((l = (o = (a = this.params) === null || a === void 0 ? void 0 : a.config) === null || o === void 0 ? void 0 : o.broadcast) === null || l === void 0) && l.ack) && i("ok"), c.receive("ok", () => i("ok")), c.receive("error", () => i("error")), c.receive("timeout", () => i("timed out"));
      });
  }
  updateJoinPayload(e) {
    this.joinPush.updatePayload(e);
  }
  /**
   * Leaves the channel.
   *
   * Unsubscribes from server events, and instructs channel to terminate on server.
   * Triggers onClose() hooks.
   *
   * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
   * channel.unsubscribe().receive("ok", () => alert("left!") )
   */
  unsubscribe(e = this.timeout) {
    this.state = W.leaving;
    const t = () => {
      this.socket.log("channel", `leave ${this.topic}`), this._trigger(re.close, "leave", this._joinRef());
    };
    this.joinPush.destroy();
    let s = null;
    return new Promise((n) => {
      s = new At(this, re.leave, {}, e), s.receive("ok", () => {
        t(), n("ok");
      }).receive("timeout", () => {
        t(), n("timed out");
      }).receive("error", () => {
        n("error");
      }), s.send(), this._canPush() || s.trigger("ok", {});
    }).finally(() => {
      s == null || s.destroy();
    });
  }
  /**
   * Teardown the channel.
   *
   * Destroys and stops related timers.
   */
  teardown() {
    this.pushBuffer.forEach((e) => e.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = W.closed, this.bindings = {};
  }
  /** @internal */
  async _fetchWithTimeout(e, t, s) {
    const n = new AbortController(), i = setTimeout(() => n.abort(), s), a = await this.socket.fetch(e, Object.assign(Object.assign({}, t), { signal: n.signal }));
    return clearTimeout(i), a;
  }
  /** @internal */
  _push(e, t, s = this.timeout) {
    if (!this.joinedOnce)
      throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
    let n = new At(this, e, t, s);
    return this._canPush() ? n.send() : this._addToPushBuffer(n), n;
  }
  /** @internal */
  _addToPushBuffer(e) {
    if (e.startTimeout(), this.pushBuffer.push(e), this.pushBuffer.length > ci) {
      const t = this.pushBuffer.shift();
      t && (t.destroy(), this.socket.log("channel", `discarded push due to buffer overflow: ${t.event}`, t.payload));
    }
  }
  /**
   * Overridable message hook
   *
   * Receives all events for specialized message handling before dispatching to the channel callbacks.
   * Must return the payload, modified or unmodified.
   *
   * @internal
   */
  _onMessage(e, t, s) {
    return t;
  }
  /** @internal */
  _isMember(e) {
    return this.topic === e;
  }
  /** @internal */
  _joinRef() {
    return this.joinPush.ref;
  }
  /** @internal */
  _trigger(e, t, s) {
    var n, i;
    const a = e.toLocaleLowerCase(), { close: o, error: l, leave: c, join: u } = re;
    if (s && [o, l, c, u].indexOf(a) >= 0 && s !== this._joinRef())
      return;
    let f = this._onMessage(a, t, s);
    if (t && !f)
      throw "channel onMessage callbacks must return the payload, modified or unmodified";
    ["insert", "update", "delete"].includes(a) ? (n = this.bindings.postgres_changes) === null || n === void 0 || n.filter((p) => {
      var g, w, S;
      return ((g = p.filter) === null || g === void 0 ? void 0 : g.event) === "*" || ((S = (w = p.filter) === null || w === void 0 ? void 0 : w.event) === null || S === void 0 ? void 0 : S.toLocaleLowerCase()) === a;
    }).map((p) => p.callback(f, s)) : (i = this.bindings[a]) === null || i === void 0 || i.filter((p) => {
      var g, w, S, b, C, y;
      if (["broadcast", "presence", "postgres_changes"].includes(a))
        if ("id" in p) {
          const k = p.id, j = (g = p.filter) === null || g === void 0 ? void 0 : g.event;
          return k && ((w = t.ids) === null || w === void 0 ? void 0 : w.includes(k)) && (j === "*" || (j == null ? void 0 : j.toLocaleLowerCase()) === ((S = t.data) === null || S === void 0 ? void 0 : S.type.toLocaleLowerCase()));
        } else {
          const k = (C = (b = p == null ? void 0 : p.filter) === null || b === void 0 ? void 0 : b.event) === null || C === void 0 ? void 0 : C.toLocaleLowerCase();
          return k === "*" || k === ((y = t == null ? void 0 : t.event) === null || y === void 0 ? void 0 : y.toLocaleLowerCase());
        }
      else
        return p.type.toLocaleLowerCase() === a;
    }).map((p) => {
      if (typeof f == "object" && "ids" in f) {
        const g = f.data, { schema: w, table: S, commit_timestamp: b, type: C, errors: y } = g;
        f = Object.assign(Object.assign({}, {
          schema: w,
          table: S,
          commit_timestamp: b,
          eventType: C,
          new: {},
          old: {},
          errors: y
        }), this._getPayloadRecords(g));
      }
      p.callback(f, s);
    });
  }
  /** @internal */
  _isClosed() {
    return this.state === W.closed;
  }
  /** @internal */
  _isJoined() {
    return this.state === W.joined;
  }
  /** @internal */
  _isJoining() {
    return this.state === W.joining;
  }
  /** @internal */
  _isLeaving() {
    return this.state === W.leaving;
  }
  /** @internal */
  _replyEventName(e) {
    return `chan_reply_${e}`;
  }
  /** @internal */
  _on(e, t, s) {
    const n = e.toLocaleLowerCase(), i = {
      type: n,
      filter: t,
      callback: s
    };
    return this.bindings[n] ? this.bindings[n].push(i) : this.bindings[n] = [i], this;
  }
  /** @internal */
  _off(e, t) {
    const s = e.toLocaleLowerCase();
    return this.bindings[s] && (this.bindings[s] = this.bindings[s].filter((n) => {
      var i;
      return !(((i = n.type) === null || i === void 0 ? void 0 : i.toLocaleLowerCase()) === s && os.isEqual(n.filter, t));
    })), this;
  }
  /** @internal */
  static isEqual(e, t) {
    if (Object.keys(e).length !== Object.keys(t).length)
      return !1;
    for (const s in e)
      if (e[s] !== t[s])
        return !1;
    return !0;
  }
  /** @internal */
  _rejoinUntilConnected() {
    this.rejoinTimer.scheduleTimeout(), this.socket.isConnected() && this._rejoin();
  }
  /**
   * Registers a callback that will be executed when the channel closes.
   *
   * @internal
   */
  _onClose(e) {
    this._on(re.close, {}, e);
  }
  /**
   * Registers a callback that will be executed when the channel encounteres an error.
   *
   * @internal
   */
  _onError(e) {
    this._on(re.error, {}, (t) => e(t));
  }
  /**
   * Returns `true` if the socket is connected and the channel has been joined.
   *
   * @internal
   */
  _canPush() {
    return this.socket.isConnected() && this._isJoined();
  }
  /** @internal */
  _rejoin(e = this.timeout) {
    this._isLeaving() || (this.socket._leaveOpenTopic(this.topic), this.state = W.joining, this.joinPush.resend(e));
  }
  /** @internal */
  _getPayloadRecords(e) {
    const t = {
      new: {},
      old: {}
    };
    return (e.type === "INSERT" || e.type === "UPDATE") && (t.new = Cs(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (t.old = Cs(e.columns, e.old_record)), t;
  }
}
const Rs = () => {
}, et = {
  HEARTBEAT_INTERVAL: 25e3,
  RECONNECT_DELAY: 10,
  HEARTBEAT_TIMEOUT_FALLBACK: 100
}, yi = [1e3, 2e3, 5e3, 1e4], vi = 1e4, _i = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class bi {
  /**
   * Initializes the Socket.
   *
   * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
   * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
   * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
   * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
   * @param options.params The optional params to pass when connecting.
   * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
   * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
   * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
   * @param options.logLevel Sets the log level for Realtime
   * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
   * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
   * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
   * @param options.worker Use Web Worker to set a side flow. Defaults to false.
   * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
   */
  constructor(e, t) {
    var s;
    if (this.accessTokenValue = null, this.apiKey = null, this.channels = new Array(), this.endPoint = "", this.httpEndpoint = "", this.headers = {}, this.params = {}, this.timeout = Vt, this.transport = null, this.heartbeatIntervalMs = et.HEARTBEAT_INTERVAL, this.heartbeatTimer = void 0, this.pendingHeartbeatRef = null, this.heartbeatCallback = Rs, this.ref = 0, this.reconnectTimer = null, this.logger = Rs, this.conn = null, this.sendBuffer = [], this.serializer = new ui(), this.stateChangeCallbacks = {
      open: [],
      close: [],
      error: [],
      message: []
    }, this.accessToken = null, this._connectionState = "disconnected", this._wasManualDisconnect = !1, this._authPromise = null, this._resolveFetch = (n) => {
      let i;
      return n ? i = n : typeof fetch > "u" ? i = (...a) => Promise.resolve().then(() => Me).then(({ default: o }) => o(...a)).catch((o) => {
        throw new Error(`Failed to load @supabase/node-fetch: ${o.message}. This is required for HTTP requests in Node.js environments without native fetch.`);
      }) : i = fetch, (...a) => i(...a);
    }, !(!((s = t == null ? void 0 : t.params) === null || s === void 0) && s.apikey))
      throw new Error("API key is required to connect to Realtime");
    this.apiKey = t.params.apikey, this.endPoint = `${e}/${Zt.websocket}`, this.httpEndpoint = ur(e), this._initializeOptions(t), this._setupReconnectionTimer(), this.fetch = this._resolveFetch(t == null ? void 0 : t.fetch);
  }
  /**
   * Connects the socket, unless already connected.
   */
  connect() {
    if (!(this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected())) {
      if (this._setConnectionState("connecting"), this._setAuthSafely("connect"), this.transport)
        this.conn = new this.transport(this.endpointURL());
      else
        try {
          this.conn = ni.createWebSocket(this.endpointURL());
        } catch (e) {
          throw this._setConnectionState("disconnected"), new Error(`WebSocket not available: ${e.message}`);
        }
      this._setupConnectionHandlers();
    }
  }
  /**
   * Returns the URL of the websocket.
   * @returns string The URL of the websocket.
   */
  endpointURL() {
    return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: oi }));
  }
  /**
   * Disconnects the socket.
   *
   * @param code A numeric status code to send on disconnect.
   * @param reason A custom reason for the disconnect.
   */
  disconnect(e, t) {
    if (!this.isDisconnecting())
      if (this._setConnectionState("disconnecting", !0), this.conn) {
        const s = setTimeout(() => {
          this._setConnectionState("disconnected");
        }, 100);
        this.conn.onclose = () => {
          clearTimeout(s), this._setConnectionState("disconnected");
        }, e ? this.conn.close(e, t ?? "") : this.conn.close(), this._teardownConnection();
      } else
        this._setConnectionState("disconnected");
  }
  /**
   * Returns all created channels
   */
  getChannels() {
    return this.channels;
  }
  /**
   * Unsubscribes and removes a single channel
   * @param channel A RealtimeChannel instance
   */
  async removeChannel(e) {
    const t = await e.unsubscribe();
    return this.channels.length === 0 && this.disconnect(), t;
  }
  /**
   * Unsubscribes and removes all channels
   */
  async removeAllChannels() {
    const e = await Promise.all(this.channels.map((t) => t.unsubscribe()));
    return this.channels = [], this.disconnect(), e;
  }
  /**
   * Logs the message.
   *
   * For customized logging, `this.logger` can be overridden.
   */
  log(e, t, s) {
    this.logger(e, t, s);
  }
  /**
   * Returns the current state of the socket.
   */
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case Ve.connecting:
        return we.Connecting;
      case Ve.open:
        return we.Open;
      case Ve.closing:
        return we.Closing;
      default:
        return we.Closed;
    }
  }
  /**
   * Returns `true` is the connection is open.
   */
  isConnected() {
    return this.connectionState() === we.Open;
  }
  /**
   * Returns `true` if the connection is currently connecting.
   */
  isConnecting() {
    return this._connectionState === "connecting";
  }
  /**
   * Returns `true` if the connection is currently disconnecting.
   */
  isDisconnecting() {
    return this._connectionState === "disconnecting";
  }
  channel(e, t = { config: {} }) {
    const s = `realtime:${e}`, n = this.getChannels().find((i) => i.topic === s);
    if (n)
      return n;
    {
      const i = new os(`realtime:${e}`, t, this);
      return this.channels.push(i), i;
    }
  }
  /**
   * Push out a message if the socket is connected.
   *
   * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
   */
  push(e) {
    const { topic: t, event: s, payload: n, ref: i } = e, a = () => {
      this.encode(e, (o) => {
        var l;
        (l = this.conn) === null || l === void 0 || l.send(o);
      });
    };
    this.log("push", `${t} ${s} (${i})`, n), this.isConnected() ? a() : this.sendBuffer.push(a);
  }
  /**
   * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
   *
   * If param is null it will use the `accessToken` callback function or the token set on the client.
   *
   * On callback used, it will set the value of the token internal to the client.
   *
   * @param token A JWT string to override the token set on the client.
   */
  async setAuth(e = null) {
    this._authPromise = this._performAuth(e);
    try {
      await this._authPromise;
    } finally {
      this._authPromise = null;
    }
  }
  /**
   * Sends a heartbeat message if the socket is connected.
   */
  async sendHeartbeat() {
    var e;
    if (!this.isConnected()) {
      this.heartbeatCallback("disconnected");
      return;
    }
    if (this.pendingHeartbeatRef) {
      this.pendingHeartbeatRef = null, this.log("transport", "heartbeat timeout. Attempting to re-establish connection"), this.heartbeatCallback("timeout"), this._wasManualDisconnect = !1, (e = this.conn) === null || e === void 0 || e.close(li, "heartbeat timeout"), setTimeout(() => {
        var t;
        this.isConnected() || (t = this.reconnectTimer) === null || t === void 0 || t.scheduleTimeout();
      }, et.HEARTBEAT_TIMEOUT_FALLBACK);
      return;
    }
    this.pendingHeartbeatRef = this._makeRef(), this.push({
      topic: "phoenix",
      event: "heartbeat",
      payload: {},
      ref: this.pendingHeartbeatRef
    }), this.heartbeatCallback("sent"), this._setAuthSafely("heartbeat");
  }
  onHeartbeat(e) {
    this.heartbeatCallback = e;
  }
  /**
   * Flushes send buffer
   */
  flushSendBuffer() {
    this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((e) => e()), this.sendBuffer = []);
  }
  /**
   * Return the next message ref, accounting for overflows
   *
   * @internal
   */
  _makeRef() {
    let e = this.ref + 1;
    return e === this.ref ? this.ref = 0 : this.ref = e, this.ref.toString();
  }
  /**
   * Unsubscribe from channels with the specified topic.
   *
   * @internal
   */
  _leaveOpenTopic(e) {
    let t = this.channels.find((s) => s.topic === e && (s._isJoined() || s._isJoining()));
    t && (this.log("transport", `leaving duplicate topic "${e}"`), t.unsubscribe());
  }
  /**
   * Removes a subscription from the socket.
   *
   * @param channel An open subscription.
   *
   * @internal
   */
  _remove(e) {
    this.channels = this.channels.filter((t) => t.topic !== e.topic);
  }
  /** @internal */
  _onConnMessage(e) {
    this.decode(e.data, (t) => {
      t.topic === "phoenix" && t.event === "phx_reply" && this.heartbeatCallback(t.payload.status === "ok" ? "ok" : "error"), t.ref && t.ref === this.pendingHeartbeatRef && (this.pendingHeartbeatRef = null);
      const { topic: s, event: n, payload: i, ref: a } = t, o = a ? `(${a})` : "", l = i.status || "";
      this.log("receive", `${l} ${s} ${n} ${o}`.trim(), i), this.channels.filter((c) => c._isMember(s)).forEach((c) => c._trigger(n, i, a)), this._triggerStateCallbacks("message", t);
    });
  }
  /**
   * Clear specific timer
   * @internal
   */
  _clearTimer(e) {
    var t;
    e === "heartbeat" && this.heartbeatTimer ? (clearInterval(this.heartbeatTimer), this.heartbeatTimer = void 0) : e === "reconnect" && ((t = this.reconnectTimer) === null || t === void 0 || t.reset());
  }
  /**
   * Clear all timers
   * @internal
   */
  _clearAllTimers() {
    this._clearTimer("heartbeat"), this._clearTimer("reconnect");
  }
  /**
   * Setup connection handlers for WebSocket events
   * @internal
   */
  _setupConnectionHandlers() {
    this.conn && ("binaryType" in this.conn && (this.conn.binaryType = "arraybuffer"), this.conn.onopen = () => this._onConnOpen(), this.conn.onerror = (e) => this._onConnError(e), this.conn.onmessage = (e) => this._onConnMessage(e), this.conn.onclose = (e) => this._onConnClose(e));
  }
  /**
   * Teardown connection and cleanup resources
   * @internal
   */
  _teardownConnection() {
    this.conn && (this.conn.onopen = null, this.conn.onerror = null, this.conn.onmessage = null, this.conn.onclose = null, this.conn = null), this._clearAllTimers(), this.channels.forEach((e) => e.teardown());
  }
  /** @internal */
  _onConnOpen() {
    this._setConnectionState("connected"), this.log("transport", `connected to ${this.endpointURL()}`), this.flushSendBuffer(), this._clearTimer("reconnect"), this.worker ? this.workerRef || this._startWorkerHeartbeat() : this._startHeartbeat(), this._triggerStateCallbacks("open");
  }
  /** @internal */
  _startHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
  }
  /** @internal */
  _startWorkerHeartbeat() {
    this.workerUrl ? this.log("worker", `starting worker for from ${this.workerUrl}`) : this.log("worker", "starting default worker");
    const e = this._workerObjectUrl(this.workerUrl);
    this.workerRef = new Worker(e), this.workerRef.onerror = (t) => {
      this.log("worker", "worker error", t.message), this.workerRef.terminate();
    }, this.workerRef.onmessage = (t) => {
      t.data.event === "keepAlive" && this.sendHeartbeat();
    }, this.workerRef.postMessage({
      event: "start",
      interval: this.heartbeatIntervalMs
    });
  }
  /** @internal */
  _onConnClose(e) {
    var t;
    this._setConnectionState("disconnected"), this.log("transport", "close", e), this._triggerChanError(), this._clearTimer("heartbeat"), this._wasManualDisconnect || (t = this.reconnectTimer) === null || t === void 0 || t.scheduleTimeout(), this._triggerStateCallbacks("close", e);
  }
  /** @internal */
  _onConnError(e) {
    this._setConnectionState("disconnected"), this.log("transport", `${e}`), this._triggerChanError(), this._triggerStateCallbacks("error", e);
  }
  /** @internal */
  _triggerChanError() {
    this.channels.forEach((e) => e._trigger(re.error));
  }
  /** @internal */
  _appendParams(e, t) {
    if (Object.keys(t).length === 0)
      return e;
    const s = e.match(/\?/) ? "&" : "?", n = new URLSearchParams(t);
    return `${e}${s}${n}`;
  }
  _workerObjectUrl(e) {
    let t;
    if (e)
      t = e;
    else {
      const s = new Blob([_i], { type: "application/javascript" });
      t = URL.createObjectURL(s);
    }
    return t;
  }
  /**
   * Set connection state with proper state management
   * @internal
   */
  _setConnectionState(e, t = !1) {
    this._connectionState = e, e === "connecting" ? this._wasManualDisconnect = !1 : e === "disconnecting" && (this._wasManualDisconnect = t);
  }
  /**
   * Perform the actual auth operation
   * @internal
   */
  async _performAuth(e = null) {
    let t;
    e ? t = e : this.accessToken ? t = await this.accessToken() : t = this.accessTokenValue, this.accessTokenValue != t && (this.accessTokenValue = t, this.channels.forEach((s) => {
      const n = {
        access_token: t,
        version: ai
      };
      t && s.updateJoinPayload(n), s.joinedOnce && s._isJoined() && s._push(re.access_token, {
        access_token: t
      });
    }));
  }
  /**
   * Wait for any in-flight auth operations to complete
   * @internal
   */
  async _waitForAuthIfNeeded() {
    this._authPromise && await this._authPromise;
  }
  /**
   * Safely call setAuth with standardized error handling
   * @internal
   */
  _setAuthSafely(e = "general") {
    this.setAuth().catch((t) => {
      this.log("error", `error setting auth in ${e}`, t);
    });
  }
  /**
   * Trigger state change callbacks with proper error handling
   * @internal
   */
  _triggerStateCallbacks(e, t) {
    try {
      this.stateChangeCallbacks[e].forEach((s) => {
        try {
          s(t);
        } catch (n) {
          this.log("error", `error in ${e} callback`, n);
        }
      });
    } catch (s) {
      this.log("error", `error triggering ${e} callbacks`, s);
    }
  }
  /**
   * Setup reconnection timer with proper configuration
   * @internal
   */
  _setupReconnectionTimer() {
    this.reconnectTimer = new lr(async () => {
      setTimeout(async () => {
        await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
      }, et.RECONNECT_DELAY);
    }, this.reconnectAfterMs);
  }
  /**
   * Initialize client options with defaults
   * @internal
   */
  _initializeOptions(e) {
    var t, s, n, i, a, o, l, c;
    if (this.transport = (t = e == null ? void 0 : e.transport) !== null && t !== void 0 ? t : null, this.timeout = (s = e == null ? void 0 : e.timeout) !== null && s !== void 0 ? s : Vt, this.heartbeatIntervalMs = (n = e == null ? void 0 : e.heartbeatIntervalMs) !== null && n !== void 0 ? n : et.HEARTBEAT_INTERVAL, this.worker = (i = e == null ? void 0 : e.worker) !== null && i !== void 0 ? i : !1, this.accessToken = (a = e == null ? void 0 : e.accessToken) !== null && a !== void 0 ? a : null, e != null && e.params && (this.params = e.params), e != null && e.logger && (this.logger = e.logger), (e != null && e.logLevel || e != null && e.log_level) && (this.logLevel = e.logLevel || e.log_level, this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel })), this.reconnectAfterMs = (o = e == null ? void 0 : e.reconnectAfterMs) !== null && o !== void 0 ? o : (u) => yi[u - 1] || vi, this.encode = (l = e == null ? void 0 : e.encode) !== null && l !== void 0 ? l : (u, d) => d(JSON.stringify(u)), this.decode = (c = e == null ? void 0 : e.decode) !== null && c !== void 0 ? c : this.serializer.decode.bind(this.serializer), this.worker) {
      if (typeof window < "u" && !window.Worker)
        throw new Error("Web Worker is not supported");
      this.workerUrl = e == null ? void 0 : e.workerUrl;
    }
  }
}
class ls extends Error {
  constructor(e) {
    super(e), this.__isStorageError = !0, this.name = "StorageError";
  }
}
function V(r) {
  return typeof r == "object" && r !== null && "__isStorageError" in r;
}
class wi extends ls {
  constructor(e, t, s) {
    super(e), this.name = "StorageApiError", this.status = t, this.statusCode = s;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode
    };
  }
}
class Ht extends ls {
  constructor(e, t) {
    super(e), this.name = "StorageUnknownError", this.originalError = t;
  }
}
var ki = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
const dr = (r) => {
  let e;
  return r ? e = r : typeof fetch > "u" ? e = (...t) => Promise.resolve().then(() => Me).then(({ default: s }) => s(...t)) : e = fetch, (...t) => e(...t);
}, Ei = () => ki(void 0, void 0, void 0, function* () {
  return typeof Response > "u" ? (yield Promise.resolve().then(() => Me)).Response : Response;
}), Gt = (r) => {
  if (Array.isArray(r))
    return r.map((t) => Gt(t));
  if (typeof r == "function" || r !== Object(r))
    return r;
  const e = {};
  return Object.entries(r).forEach(([t, s]) => {
    const n = t.replace(/([-_][a-z])/gi, (i) => i.toUpperCase().replace(/[-_]/g, ""));
    e[n] = Gt(s);
  }), e;
}, Si = (r) => {
  if (typeof r != "object" || r === null)
    return !1;
  const e = Object.getPrototypeOf(r);
  return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(Symbol.toStringTag in r) && !(Symbol.iterator in r);
};
var Ee = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
const Ct = (r) => r.msg || r.message || r.error_description || r.error || JSON.stringify(r), xi = (r, e, t) => Ee(void 0, void 0, void 0, function* () {
  const s = yield Ei();
  r instanceof s && !(t != null && t.noResolveJson) ? r.json().then((n) => {
    const i = r.status || 500, a = (n == null ? void 0 : n.statusCode) || i + "";
    e(new wi(Ct(n), i, a));
  }).catch((n) => {
    e(new Ht(Ct(n), n));
  }) : e(new Ht(Ct(r), r));
}), Ti = (r, e, t, s) => {
  const n = { method: r, headers: (e == null ? void 0 : e.headers) || {} };
  return r === "GET" || !s ? n : (Si(s) ? (n.headers = Object.assign({ "Content-Type": "application/json" }, e == null ? void 0 : e.headers), n.body = JSON.stringify(s)) : n.body = s, Object.assign(Object.assign({}, n), t));
};
function Xe(r, e, t, s, n, i) {
  return Ee(this, void 0, void 0, function* () {
    return new Promise((a, o) => {
      r(t, Ti(e, s, n, i)).then((l) => {
        if (!l.ok)
          throw l;
        return s != null && s.noResolveJson ? l : l.json();
      }).then((l) => a(l)).catch((l) => xi(l, o, s));
    });
  });
}
function gt(r, e, t, s) {
  return Ee(this, void 0, void 0, function* () {
    return Xe(r, "GET", e, t, s);
  });
}
function le(r, e, t, s, n) {
  return Ee(this, void 0, void 0, function* () {
    return Xe(r, "POST", e, s, n, t);
  });
}
function Jt(r, e, t, s, n) {
  return Ee(this, void 0, void 0, function* () {
    return Xe(r, "PUT", e, s, n, t);
  });
}
function Ai(r, e, t, s) {
  return Ee(this, void 0, void 0, function* () {
    return Xe(r, "HEAD", e, Object.assign(Object.assign({}, t), { noResolveJson: !0 }), s);
  });
}
function hr(r, e, t, s, n) {
  return Ee(this, void 0, void 0, function* () {
    return Xe(r, "DELETE", e, s, n, t);
  });
}
var J = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
const Ci = {
  limit: 100,
  offset: 0,
  sortBy: {
    column: "name",
    order: "asc"
  }
}, Is = {
  cacheControl: "3600",
  contentType: "text/plain;charset=UTF-8",
  upsert: !1
};
class Oi {
  constructor(e, t = {}, s, n) {
    this.url = e, this.headers = t, this.bucketId = s, this.fetch = dr(n);
  }
  /**
   * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
   *
   * @param method HTTP method.
   * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param fileBody The body of the file to be stored in the bucket.
   */
  uploadOrUpdate(e, t, s, n) {
    return J(this, void 0, void 0, function* () {
      try {
        let i;
        const a = Object.assign(Object.assign({}, Is), n);
        let o = Object.assign(Object.assign({}, this.headers), e === "POST" && { "x-upsert": String(a.upsert) });
        const l = a.metadata;
        typeof Blob < "u" && s instanceof Blob ? (i = new FormData(), i.append("cacheControl", a.cacheControl), l && i.append("metadata", this.encodeMetadata(l)), i.append("", s)) : typeof FormData < "u" && s instanceof FormData ? (i = s, i.append("cacheControl", a.cacheControl), l && i.append("metadata", this.encodeMetadata(l))) : (i = s, o["cache-control"] = `max-age=${a.cacheControl}`, o["content-type"] = a.contentType, l && (o["x-metadata"] = this.toBase64(this.encodeMetadata(l)))), n != null && n.headers && (o = Object.assign(Object.assign({}, o), n.headers));
        const c = this._removeEmptyFolders(t), u = this._getFinalPath(c), d = yield (e == "PUT" ? Jt : le)(this.fetch, `${this.url}/object/${u}`, i, Object.assign({ headers: o }, a != null && a.duplex ? { duplex: a.duplex } : {}));
        return {
          data: { path: c, id: d.Id, fullPath: d.Key },
          error: null
        };
      } catch (i) {
        if (V(i))
          return { data: null, error: i };
        throw i;
      }
    });
  }
  /**
   * Uploads a file to an existing bucket.
   *
   * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param fileBody The body of the file to be stored in the bucket.
   */
  upload(e, t, s) {
    return J(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("POST", e, t, s);
    });
  }
  /**
   * Upload a file with a token generated from `createSignedUploadUrl`.
   * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param token The token generated from `createSignedUploadUrl`
   * @param fileBody The body of the file to be stored in the bucket.
   */
  uploadToSignedUrl(e, t, s, n) {
    return J(this, void 0, void 0, function* () {
      const i = this._removeEmptyFolders(e), a = this._getFinalPath(i), o = new URL(this.url + `/object/upload/sign/${a}`);
      o.searchParams.set("token", t);
      try {
        let l;
        const c = Object.assign({ upsert: Is.upsert }, n), u = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(c.upsert) });
        typeof Blob < "u" && s instanceof Blob ? (l = new FormData(), l.append("cacheControl", c.cacheControl), l.append("", s)) : typeof FormData < "u" && s instanceof FormData ? (l = s, l.append("cacheControl", c.cacheControl)) : (l = s, u["cache-control"] = `max-age=${c.cacheControl}`, u["content-type"] = c.contentType);
        const d = yield Jt(this.fetch, o.toString(), l, { headers: u });
        return {
          data: { path: i, fullPath: d.Key },
          error: null
        };
      } catch (l) {
        if (V(l))
          return { data: null, error: l };
        throw l;
      }
    });
  }
  /**
   * Creates a signed upload URL.
   * Signed upload URLs can be used to upload files to the bucket without further authentication.
   * They are valid for 2 hours.
   * @param path The file path, including the current file name. For example `folder/image.png`.
   * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
   */
  createSignedUploadUrl(e, t) {
    return J(this, void 0, void 0, function* () {
      try {
        let s = this._getFinalPath(e);
        const n = Object.assign({}, this.headers);
        t != null && t.upsert && (n["x-upsert"] = "true");
        const i = yield le(this.fetch, `${this.url}/object/upload/sign/${s}`, {}, { headers: n }), a = new URL(this.url + i.url), o = a.searchParams.get("token");
        if (!o)
          throw new ls("No token returned by API");
        return { data: { signedUrl: a.toString(), path: e, token: o }, error: null };
      } catch (s) {
        if (V(s))
          return { data: null, error: s };
        throw s;
      }
    });
  }
  /**
   * Replaces an existing file at the specified path with a new one.
   *
   * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
   * @param fileBody The body of the file to be stored in the bucket.
   */
  update(e, t, s) {
    return J(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("PUT", e, t, s);
    });
  }
  /**
   * Moves an existing file to a new path in the same bucket.
   *
   * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
   * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
   * @param options The destination options.
   */
  move(e, t, s) {
    return J(this, void 0, void 0, function* () {
      try {
        return { data: yield le(this.fetch, `${this.url}/object/move`, {
          bucketId: this.bucketId,
          sourceKey: e,
          destinationKey: t,
          destinationBucket: s == null ? void 0 : s.destinationBucket
        }, { headers: this.headers }), error: null };
      } catch (n) {
        if (V(n))
          return { data: null, error: n };
        throw n;
      }
    });
  }
  /**
   * Copies an existing file to a new path in the same bucket.
   *
   * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
   * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
   * @param options The destination options.
   */
  copy(e, t, s) {
    return J(this, void 0, void 0, function* () {
      try {
        return { data: { path: (yield le(this.fetch, `${this.url}/object/copy`, {
          bucketId: this.bucketId,
          sourceKey: e,
          destinationKey: t,
          destinationBucket: s == null ? void 0 : s.destinationBucket
        }, { headers: this.headers })).Key }, error: null };
      } catch (n) {
        if (V(n))
          return { data: null, error: n };
        throw n;
      }
    });
  }
  /**
   * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
   *
   * @param path The file path, including the current file name. For example `folder/image.png`.
   * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
   * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
   * @param options.transform Transform the asset before serving it to the client.
   */
  createSignedUrl(e, t, s) {
    return J(this, void 0, void 0, function* () {
      try {
        let n = this._getFinalPath(e), i = yield le(this.fetch, `${this.url}/object/sign/${n}`, Object.assign({ expiresIn: t }, s != null && s.transform ? { transform: s.transform } : {}), { headers: this.headers });
        const a = s != null && s.download ? `&download=${s.download === !0 ? "" : s.download}` : "";
        return i = { signedUrl: encodeURI(`${this.url}${i.signedURL}${a}`) }, { data: i, error: null };
      } catch (n) {
        if (V(n))
          return { data: null, error: n };
        throw n;
      }
    });
  }
  /**
   * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
   *
   * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
   * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
   * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
   */
  createSignedUrls(e, t, s) {
    return J(this, void 0, void 0, function* () {
      try {
        const n = yield le(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn: t, paths: e }, { headers: this.headers }), i = s != null && s.download ? `&download=${s.download === !0 ? "" : s.download}` : "";
        return {
          data: n.map((a) => Object.assign(Object.assign({}, a), { signedUrl: a.signedURL ? encodeURI(`${this.url}${a.signedURL}${i}`) : null })),
          error: null
        };
      } catch (n) {
        if (V(n))
          return { data: null, error: n };
        throw n;
      }
    });
  }
  /**
   * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
   *
   * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
   * @param options.transform Transform the asset before serving it to the client.
   */
  download(e, t) {
    return J(this, void 0, void 0, function* () {
      const n = typeof (t == null ? void 0 : t.transform) < "u" ? "render/image/authenticated" : "object", i = this.transformOptsToQueryString((t == null ? void 0 : t.transform) || {}), a = i ? `?${i}` : "";
      try {
        const o = this._getFinalPath(e);
        return { data: yield (yield gt(this.fetch, `${this.url}/${n}/${o}${a}`, {
          headers: this.headers,
          noResolveJson: !0
        })).blob(), error: null };
      } catch (o) {
        if (V(o))
          return { data: null, error: o };
        throw o;
      }
    });
  }
  /**
   * Retrieves the details of an existing file.
   * @param path
   */
  info(e) {
    return J(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e);
      try {
        const s = yield gt(this.fetch, `${this.url}/object/info/${t}`, {
          headers: this.headers
        });
        return { data: Gt(s), error: null };
      } catch (s) {
        if (V(s))
          return { data: null, error: s };
        throw s;
      }
    });
  }
  /**
   * Checks the existence of a file.
   * @param path
   */
  exists(e) {
    return J(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e);
      try {
        return yield Ai(this.fetch, `${this.url}/object/${t}`, {
          headers: this.headers
        }), { data: !0, error: null };
      } catch (s) {
        if (V(s) && s instanceof Ht) {
          const n = s.originalError;
          if ([400, 404].includes(n == null ? void 0 : n.status))
            return { data: !1, error: s };
        }
        throw s;
      }
    });
  }
  /**
   * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
   * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
   *
   * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
   * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
   * @param options.transform Transform the asset before serving it to the client.
   */
  getPublicUrl(e, t) {
    const s = this._getFinalPath(e), n = [], i = t != null && t.download ? `download=${t.download === !0 ? "" : t.download}` : "";
    i !== "" && n.push(i);
    const o = typeof (t == null ? void 0 : t.transform) < "u" ? "render/image" : "object", l = this.transformOptsToQueryString((t == null ? void 0 : t.transform) || {});
    l !== "" && n.push(l);
    let c = n.join("&");
    return c !== "" && (c = `?${c}`), {
      data: { publicUrl: encodeURI(`${this.url}/${o}/public/${s}${c}`) }
    };
  }
  /**
   * Deletes files within the same bucket
   *
   * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
   */
  remove(e) {
    return J(this, void 0, void 0, function* () {
      try {
        return { data: yield hr(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: e }, { headers: this.headers }), error: null };
      } catch (t) {
        if (V(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
  /**
   * Get file metadata
   * @param id the file id to retrieve metadata
   */
  // async getMetadata(
  //   id: string
  // ): Promise<
  //   | {
  //       data: Metadata
  //       error: null
  //     }
  //   | {
  //       data: null
  //       error: StorageError
  //     }
  // > {
  //   try {
  //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
  //     return { data, error: null }
  //   } catch (error) {
  //     if (isStorageError(error)) {
  //       return { data: null, error }
  //     }
  //     throw error
  //   }
  // }
  /**
   * Update file metadata
   * @param id the file id to update metadata
   * @param meta the new file metadata
   */
  // async updateMetadata(
  //   id: string,
  //   meta: Metadata
  // ): Promise<
  //   | {
  //       data: Metadata
  //       error: null
  //     }
  //   | {
  //       data: null
  //       error: StorageError
  //     }
  // > {
  //   try {
  //     const data = await post(
  //       this.fetch,
  //       `${this.url}/metadata/${id}`,
  //       { ...meta },
  //       { headers: this.headers }
  //     )
  //     return { data, error: null }
  //   } catch (error) {
  //     if (isStorageError(error)) {
  //       return { data: null, error }
  //     }
  //     throw error
  //   }
  // }
  /**
   * Lists all the files within a bucket.
   * @param path The folder path.
   * @param options Search options including limit (defaults to 100), offset, sortBy, and search
   */
  list(e, t, s) {
    return J(this, void 0, void 0, function* () {
      try {
        const n = Object.assign(Object.assign(Object.assign({}, Ci), t), { prefix: e || "" });
        return { data: yield le(this.fetch, `${this.url}/object/list/${this.bucketId}`, n, { headers: this.headers }, s), error: null };
      } catch (n) {
        if (V(n))
          return { data: null, error: n };
        throw n;
      }
    });
  }
  encodeMetadata(e) {
    return JSON.stringify(e);
  }
  toBase64(e) {
    return typeof Buffer < "u" ? Buffer.from(e).toString("base64") : btoa(e);
  }
  _getFinalPath(e) {
    return `${this.bucketId}/${e.replace(/^\/+/, "")}`;
  }
  _removeEmptyFolders(e) {
    return e.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
  }
  transformOptsToQueryString(e) {
    const t = [];
    return e.width && t.push(`width=${e.width}`), e.height && t.push(`height=${e.height}`), e.resize && t.push(`resize=${e.resize}`), e.format && t.push(`format=${e.format}`), e.quality && t.push(`quality=${e.quality}`), t.join("&");
  }
}
const ji = "2.10.4", Ri = { "X-Client-Info": `storage-js/${ji}` };
var Se = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
class Ii {
  constructor(e, t = {}, s, n) {
    const i = new URL(e);
    n != null && n.useNewHostname && /supabase\.(co|in|red)$/.test(i.hostname) && !i.hostname.includes("storage.supabase.") && (i.hostname = i.hostname.replace("supabase.", "storage.supabase.")), this.url = i.href, this.headers = Object.assign(Object.assign({}, Ri), t), this.fetch = dr(s);
  }
  /**
   * Retrieves the details of all Storage buckets within an existing project.
   */
  listBuckets() {
    return Se(this, void 0, void 0, function* () {
      try {
        return { data: yield gt(this.fetch, `${this.url}/bucket`, { headers: this.headers }), error: null };
      } catch (e) {
        if (V(e))
          return { data: null, error: e };
        throw e;
      }
    });
  }
  /**
   * Retrieves the details of an existing Storage bucket.
   *
   * @param id The unique identifier of the bucket you would like to retrieve.
   */
  getBucket(e) {
    return Se(this, void 0, void 0, function* () {
      try {
        return { data: yield gt(this.fetch, `${this.url}/bucket/${e}`, { headers: this.headers }), error: null };
      } catch (t) {
        if (V(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
  /**
   * Creates a new Storage bucket
   *
   * @param id A unique identifier for the bucket you are creating.
   * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
   * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
   * The global file size limit takes precedence over this value.
   * The default value is null, which doesn't set a per bucket file size limit.
   * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
   * The default value is null, which allows files with all mime types to be uploaded.
   * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
   * @returns newly created bucket id
   * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
   *   - default bucket type is `STANDARD`
   */
  createBucket(e, t = {
    public: !1
  }) {
    return Se(this, void 0, void 0, function* () {
      try {
        return { data: yield le(this.fetch, `${this.url}/bucket`, {
          id: e,
          name: e,
          type: t.type,
          public: t.public,
          file_size_limit: t.fileSizeLimit,
          allowed_mime_types: t.allowedMimeTypes
        }, { headers: this.headers }), error: null };
      } catch (s) {
        if (V(s))
          return { data: null, error: s };
        throw s;
      }
    });
  }
  /**
   * Updates a Storage bucket
   *
   * @param id A unique identifier for the bucket you are updating.
   * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
   * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
   * The global file size limit takes precedence over this value.
   * The default value is null, which doesn't set a per bucket file size limit.
   * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
   * The default value is null, which allows files with all mime types to be uploaded.
   * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
   */
  updateBucket(e, t) {
    return Se(this, void 0, void 0, function* () {
      try {
        return { data: yield Jt(this.fetch, `${this.url}/bucket/${e}`, {
          id: e,
          name: e,
          public: t.public,
          file_size_limit: t.fileSizeLimit,
          allowed_mime_types: t.allowedMimeTypes
        }, { headers: this.headers }), error: null };
      } catch (s) {
        if (V(s))
          return { data: null, error: s };
        throw s;
      }
    });
  }
  /**
   * Removes all objects inside a single bucket.
   *
   * @param id The unique identifier of the bucket you would like to empty.
   */
  emptyBucket(e) {
    return Se(this, void 0, void 0, function* () {
      try {
        return { data: yield le(this.fetch, `${this.url}/bucket/${e}/empty`, {}, { headers: this.headers }), error: null };
      } catch (t) {
        if (V(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
  /**
   * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
   * You must first `empty()` the bucket.
   *
   * @param id The unique identifier of the bucket you would like to delete.
   */
  deleteBucket(e) {
    return Se(this, void 0, void 0, function* () {
      try {
        return { data: yield hr(this.fetch, `${this.url}/bucket/${e}`, {}, { headers: this.headers }), error: null };
      } catch (t) {
        if (V(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
}
class Pi extends Ii {
  constructor(e, t = {}, s, n) {
    super(e, t, s, n);
  }
  /**
   * Perform file operation in a bucket.
   *
   * @param id The bucket id to operate on.
   */
  from(e) {
    return new Oi(this.url, this.headers, e, this.fetch);
  }
}
const $i = "2.54.0";
let We = "";
typeof Deno < "u" ? We = "deno" : typeof document < "u" ? We = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? We = "react-native" : We = "node";
const Ni = { "X-Client-Info": `supabase-js-${We}/${$i}` }, Li = {
  headers: Ni
}, Ui = {
  schema: "public"
}, Di = {
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  flowType: "implicit"
}, Mi = {};
var Bi = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
const Fi = (r) => {
  let e;
  return r ? e = r : typeof fetch > "u" ? e = Qs : e = fetch, (...t) => e(...t);
}, qi = () => typeof Headers > "u" ? Ys : Headers, zi = (r, e, t) => {
  const s = Fi(t), n = qi();
  return (i, a) => Bi(void 0, void 0, void 0, function* () {
    var o;
    const l = (o = yield e()) !== null && o !== void 0 ? o : r;
    let c = new n(a == null ? void 0 : a.headers);
    return c.has("apikey") || c.set("apikey", r), c.has("Authorization") || c.set("Authorization", `Bearer ${l}`), s(i, Object.assign(Object.assign({}, a), { headers: c }));
  });
};
var Wi = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
function Vi(r) {
  return r.endsWith("/") ? r : r + "/";
}
function Zi(r, e) {
  var t, s;
  const { db: n, auth: i, realtime: a, global: o } = r, { db: l, auth: c, realtime: u, global: d } = e, f = {
    db: Object.assign(Object.assign({}, l), n),
    auth: Object.assign(Object.assign({}, c), i),
    realtime: Object.assign(Object.assign({}, u), a),
    storage: {},
    global: Object.assign(Object.assign(Object.assign({}, d), o), { headers: Object.assign(Object.assign({}, (t = d == null ? void 0 : d.headers) !== null && t !== void 0 ? t : {}), (s = o == null ? void 0 : o.headers) !== null && s !== void 0 ? s : {}) }),
    accessToken: () => Wi(this, void 0, void 0, function* () {
      return "";
    })
  };
  return r.accessToken ? f.accessToken = r.accessToken : delete f.accessToken, f;
}
const fr = "2.71.1", Re = 30 * 1e3, Qt = 3, Ot = Qt * Re, Ki = "http://localhost:9999", Hi = "supabase.auth.token", Gi = { "X-Client-Info": `gotrue-js/${fr}` }, Yt = "X-Supabase-Api-Version", pr = {
  "2024-01-01": {
    timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
    name: "2024-01-01"
  }
}, Ji = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, Qi = 600 * 1e3;
class cs extends Error {
  constructor(e, t, s) {
    super(e), this.__isAuthError = !0, this.name = "AuthError", this.status = t, this.code = s;
  }
}
function P(r) {
  return typeof r == "object" && r !== null && "__isAuthError" in r;
}
class Yi extends cs {
  constructor(e, t, s) {
    super(e, t, s), this.name = "AuthApiError", this.status = t, this.code = s;
  }
}
function Xi(r) {
  return P(r) && r.name === "AuthApiError";
}
class gr extends cs {
  constructor(e, t) {
    super(e), this.name = "AuthUnknownError", this.originalError = t;
  }
}
class ye extends cs {
  constructor(e, t, s, n) {
    super(e, s, n), this.name = t, this.status = s;
  }
}
class he extends ye {
  constructor() {
    super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
  }
}
function ea(r) {
  return P(r) && r.name === "AuthSessionMissingError";
}
class tt extends ye {
  constructor() {
    super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
  }
}
class st extends ye {
  constructor(e) {
    super(e, "AuthInvalidCredentialsError", 400, void 0);
  }
}
class rt extends ye {
  constructor(e, t = null) {
    super(e, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = t;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
}
function ta(r) {
  return P(r) && r.name === "AuthImplicitGrantRedirectError";
}
class Ps extends ye {
  constructor(e, t = null) {
    super(e, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = t;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
}
class Xt extends ye {
  constructor(e, t) {
    super(e, "AuthRetryableFetchError", t, void 0);
  }
}
function jt(r) {
  return P(r) && r.name === "AuthRetryableFetchError";
}
class $s extends ye {
  constructor(e, t, s) {
    super(e, "AuthWeakPasswordError", t, "weak_password"), this.reasons = s;
  }
}
class es extends ye {
  constructor(e) {
    super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
  }
}
const mt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), Ns = ` 	
\r=`.split(""), sa = (() => {
  const r = new Array(128);
  for (let e = 0; e < r.length; e += 1)
    r[e] = -1;
  for (let e = 0; e < Ns.length; e += 1)
    r[Ns[e].charCodeAt(0)] = -2;
  for (let e = 0; e < mt.length; e += 1)
    r[mt[e].charCodeAt(0)] = e;
  return r;
})();
function Ls(r, e, t) {
  if (r !== null)
    for (e.queue = e.queue << 8 | r, e.queuedBits += 8; e.queuedBits >= 6; ) {
      const s = e.queue >> e.queuedBits - 6 & 63;
      t(mt[s]), e.queuedBits -= 6;
    }
  else if (e.queuedBits > 0)
    for (e.queue = e.queue << 6 - e.queuedBits, e.queuedBits = 6; e.queuedBits >= 6; ) {
      const s = e.queue >> e.queuedBits - 6 & 63;
      t(mt[s]), e.queuedBits -= 6;
    }
}
function mr(r, e, t) {
  const s = sa[r];
  if (s > -1)
    for (e.queue = e.queue << 6 | s, e.queuedBits += 6; e.queuedBits >= 8; )
      t(e.queue >> e.queuedBits - 8 & 255), e.queuedBits -= 8;
  else {
    if (s === -2)
      return;
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(r)}"`);
  }
}
function Us(r) {
  const e = [], t = (a) => {
    e.push(String.fromCodePoint(a));
  }, s = {
    utf8seq: 0,
    codepoint: 0
  }, n = { queue: 0, queuedBits: 0 }, i = (a) => {
    ia(a, s, t);
  };
  for (let a = 0; a < r.length; a += 1)
    mr(r.charCodeAt(a), n, i);
  return e.join("");
}
function ra(r, e) {
  if (r <= 127) {
    e(r);
    return;
  } else if (r <= 2047) {
    e(192 | r >> 6), e(128 | r & 63);
    return;
  } else if (r <= 65535) {
    e(224 | r >> 12), e(128 | r >> 6 & 63), e(128 | r & 63);
    return;
  } else if (r <= 1114111) {
    e(240 | r >> 18), e(128 | r >> 12 & 63), e(128 | r >> 6 & 63), e(128 | r & 63);
    return;
  }
  throw new Error(`Unrecognized Unicode codepoint: ${r.toString(16)}`);
}
function na(r, e) {
  for (let t = 0; t < r.length; t += 1) {
    let s = r.charCodeAt(t);
    if (s > 55295 && s <= 56319) {
      const n = (s - 55296) * 1024 & 65535;
      s = (r.charCodeAt(t + 1) - 56320 & 65535 | n) + 65536, t += 1;
    }
    ra(s, e);
  }
}
function ia(r, e, t) {
  if (e.utf8seq === 0) {
    if (r <= 127) {
      t(r);
      return;
    }
    for (let s = 1; s < 6; s += 1)
      if ((r >> 7 - s & 1) === 0) {
        e.utf8seq = s;
        break;
      }
    if (e.utf8seq === 2)
      e.codepoint = r & 31;
    else if (e.utf8seq === 3)
      e.codepoint = r & 15;
    else if (e.utf8seq === 4)
      e.codepoint = r & 7;
    else
      throw new Error("Invalid UTF-8 sequence");
    e.utf8seq -= 1;
  } else if (e.utf8seq > 0) {
    if (r <= 127)
      throw new Error("Invalid UTF-8 sequence");
    e.codepoint = e.codepoint << 6 | r & 63, e.utf8seq -= 1, e.utf8seq === 0 && t(e.codepoint);
  }
}
function aa(r) {
  const e = [], t = { queue: 0, queuedBits: 0 }, s = (n) => {
    e.push(n);
  };
  for (let n = 0; n < r.length; n += 1)
    mr(r.charCodeAt(n), t, s);
  return new Uint8Array(e);
}
function oa(r) {
  const e = [];
  return na(r, (t) => e.push(t)), new Uint8Array(e);
}
function la(r) {
  const e = [], t = { queue: 0, queuedBits: 0 }, s = (n) => {
    e.push(n);
  };
  return r.forEach((n) => Ls(n, t, s)), Ls(null, t, s), e.join("");
}
function ca(r) {
  return Math.round(Date.now() / 1e3) + r;
}
function ua() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(r) {
    const e = Math.random() * 16 | 0;
    return (r == "x" ? e : e & 3 | 8).toString(16);
  });
}
const se = () => typeof window < "u" && typeof document < "u", ve = {
  tested: !1,
  writable: !1
}, yr = () => {
  if (!se())
    return !1;
  try {
    if (typeof globalThis.localStorage != "object")
      return !1;
  } catch {
    return !1;
  }
  if (ve.tested)
    return ve.writable;
  const r = `lswt-${Math.random()}${Math.random()}`;
  try {
    globalThis.localStorage.setItem(r, r), globalThis.localStorage.removeItem(r), ve.tested = !0, ve.writable = !0;
  } catch {
    ve.tested = !0, ve.writable = !1;
  }
  return ve.writable;
};
function da(r) {
  const e = {}, t = new URL(r);
  if (t.hash && t.hash[0] === "#")
    try {
      new URLSearchParams(t.hash.substring(1)).forEach((n, i) => {
        e[i] = n;
      });
    } catch {
    }
  return t.searchParams.forEach((s, n) => {
    e[n] = s;
  }), e;
}
const vr = (r) => {
  let e;
  return r ? e = r : typeof fetch > "u" ? e = (...t) => Promise.resolve().then(() => Me).then(({ default: s }) => s(...t)) : e = fetch, (...t) => e(...t);
}, ha = (r) => typeof r == "object" && r !== null && "status" in r && "ok" in r && "json" in r && typeof r.json == "function", Ie = async (r, e, t) => {
  await r.setItem(e, JSON.stringify(t));
}, _e = async (r, e) => {
  const t = await r.getItem(e);
  if (!t)
    return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}, de = async (r, e) => {
  await r.removeItem(e);
};
class St {
  constructor() {
    this.promise = new St.promiseConstructor((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
St.promiseConstructor = Promise;
function Rt(r) {
  const e = r.split(".");
  if (e.length !== 3)
    throw new es("Invalid JWT structure");
  for (let s = 0; s < e.length; s++)
    if (!Ji.test(e[s]))
      throw new es("JWT not in base64url format");
  return {
    // using base64url lib
    header: JSON.parse(Us(e[0])),
    payload: JSON.parse(Us(e[1])),
    signature: aa(e[2]),
    raw: {
      header: e[0],
      payload: e[1]
    }
  };
}
async function fa(r) {
  return await new Promise((e) => {
    setTimeout(() => e(null), r);
  });
}
function pa(r, e) {
  return new Promise((s, n) => {
    (async () => {
      for (let i = 0; i < 1 / 0; i++)
        try {
          const a = await r(i);
          if (!e(i, null, a)) {
            s(a);
            return;
          }
        } catch (a) {
          if (!e(i, a)) {
            n(a);
            return;
          }
        }
    })();
  });
}
function ga(r) {
  return ("0" + r.toString(16)).substr(-2);
}
function ma() {
  const e = new Uint32Array(56);
  if (typeof crypto > "u") {
    const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", s = t.length;
    let n = "";
    for (let i = 0; i < 56; i++)
      n += t.charAt(Math.floor(Math.random() * s));
    return n;
  }
  return crypto.getRandomValues(e), Array.from(e, ga).join("");
}
async function ya(r) {
  const t = new TextEncoder().encode(r), s = await crypto.subtle.digest("SHA-256", t), n = new Uint8Array(s);
  return Array.from(n).map((i) => String.fromCharCode(i)).join("");
}
async function va(r) {
  if (!(typeof crypto < "u" && typeof crypto.subtle < "u" && typeof TextEncoder < "u"))
    return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), r;
  const t = await ya(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function xe(r, e, t = !1) {
  const s = ma();
  let n = s;
  t && (n += "/PASSWORD_RECOVERY"), await Ie(r, `${e}-code-verifier`, n);
  const i = await va(s);
  return [i, s === i ? "plain" : "s256"];
}
const _a = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function ba(r) {
  const e = r.headers.get(Yt);
  if (!e || !e.match(_a))
    return null;
  try {
    return /* @__PURE__ */ new Date(`${e}T00:00:00.0Z`);
  } catch {
    return null;
  }
}
function wa(r) {
  if (!r)
    throw new Error("Missing exp claim");
  const e = Math.floor(Date.now() / 1e3);
  if (r <= e)
    throw new Error("JWT has expired");
}
function ka(r) {
  switch (r) {
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" }
      };
    case "ES256":
      return {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: { name: "SHA-256" }
      };
    default:
      throw new Error("Invalid alg claim");
  }
}
const Ea = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function Te(r) {
  if (!Ea.test(r))
    throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
}
function It() {
  const r = {};
  return new Proxy(r, {
    get: (e, t) => {
      if (t === "__isUserNotAvailableProxy")
        return !0;
      if (typeof t == "symbol") {
        const s = t.toString();
        if (s === "Symbol(Symbol.toPrimitive)" || s === "Symbol(Symbol.toStringTag)" || s === "Symbol(util.inspect.custom)")
          return;
      }
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${t}" property of the session object is not supported. Please use getUser() instead.`);
    },
    set: (e, t) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    },
    deleteProperty: (e, t) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    }
  });
}
function Ds(r) {
  return JSON.parse(JSON.stringify(r));
}
var Sa = function(r, e) {
  var t = {};
  for (var s in r) Object.prototype.hasOwnProperty.call(r, s) && e.indexOf(s) < 0 && (t[s] = r[s]);
  if (r != null && typeof Object.getOwnPropertySymbols == "function")
    for (var n = 0, s = Object.getOwnPropertySymbols(r); n < s.length; n++)
      e.indexOf(s[n]) < 0 && Object.prototype.propertyIsEnumerable.call(r, s[n]) && (t[s[n]] = r[s[n]]);
  return t;
};
const be = (r) => r.msg || r.message || r.error_description || r.error || JSON.stringify(r), xa = [502, 503, 504];
async function Ms(r) {
  var e;
  if (!ha(r))
    throw new Xt(be(r), 0);
  if (xa.includes(r.status))
    throw new Xt(be(r), r.status);
  let t;
  try {
    t = await r.json();
  } catch (i) {
    throw new gr(be(i), i);
  }
  let s;
  const n = ba(r);
  if (n && n.getTime() >= pr["2024-01-01"].timestamp && typeof t == "object" && t && typeof t.code == "string" ? s = t.code : typeof t == "object" && t && typeof t.error_code == "string" && (s = t.error_code), s) {
    if (s === "weak_password")
      throw new $s(be(t), r.status, ((e = t.weak_password) === null || e === void 0 ? void 0 : e.reasons) || []);
    if (s === "session_not_found")
      throw new he();
  } else if (typeof t == "object" && t && typeof t.weak_password == "object" && t.weak_password && Array.isArray(t.weak_password.reasons) && t.weak_password.reasons.length && t.weak_password.reasons.reduce((i, a) => i && typeof a == "string", !0))
    throw new $s(be(t), r.status, t.weak_password.reasons);
  throw new Yi(be(t), r.status || 500, s);
}
const Ta = (r, e, t, s) => {
  const n = { method: r, headers: (e == null ? void 0 : e.headers) || {} };
  return r === "GET" ? n : (n.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, e == null ? void 0 : e.headers), n.body = JSON.stringify(s), Object.assign(Object.assign({}, n), t));
};
async function L(r, e, t, s) {
  var n;
  const i = Object.assign({}, s == null ? void 0 : s.headers);
  i[Yt] || (i[Yt] = pr["2024-01-01"].name), s != null && s.jwt && (i.Authorization = `Bearer ${s.jwt}`);
  const a = (n = s == null ? void 0 : s.query) !== null && n !== void 0 ? n : {};
  s != null && s.redirectTo && (a.redirect_to = s.redirectTo);
  const o = Object.keys(a).length ? "?" + new URLSearchParams(a).toString() : "", l = await Aa(r, e, t + o, {
    headers: i,
    noResolveJson: s == null ? void 0 : s.noResolveJson
  }, {}, s == null ? void 0 : s.body);
  return s != null && s.xform ? s == null ? void 0 : s.xform(l) : { data: Object.assign({}, l), error: null };
}
async function Aa(r, e, t, s, n, i) {
  const a = Ta(e, s, n, i);
  let o;
  try {
    o = await r(t, Object.assign({}, a));
  } catch (l) {
    throw console.error(l), new Xt(be(l), 0);
  }
  if (o.ok || await Ms(o), s != null && s.noResolveJson)
    return o;
  try {
    return await o.json();
  } catch (l) {
    await Ms(l);
  }
}
function ae(r) {
  var e;
  let t = null;
  Ra(r) && (t = Object.assign({}, r), r.expires_at || (t.expires_at = ca(r.expires_in)));
  const s = (e = r.user) !== null && e !== void 0 ? e : r;
  return { data: { session: t, user: s }, error: null };
}
function Bs(r) {
  const e = ae(r);
  return !e.error && r.weak_password && typeof r.weak_password == "object" && Array.isArray(r.weak_password.reasons) && r.weak_password.reasons.length && r.weak_password.message && typeof r.weak_password.message == "string" && r.weak_password.reasons.reduce((t, s) => t && typeof s == "string", !0) && (e.data.weak_password = r.weak_password), e;
}
function pe(r) {
  var e;
  return { data: { user: (e = r.user) !== null && e !== void 0 ? e : r }, error: null };
}
function Ca(r) {
  return { data: r, error: null };
}
function Oa(r) {
  const { action_link: e, email_otp: t, hashed_token: s, redirect_to: n, verification_type: i } = r, a = Sa(r, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]), o = {
    action_link: e,
    email_otp: t,
    hashed_token: s,
    redirect_to: n,
    verification_type: i
  }, l = Object.assign({}, a);
  return {
    data: {
      properties: o,
      user: l
    },
    error: null
  };
}
function ja(r) {
  return r;
}
function Ra(r) {
  return r.access_token && r.refresh_token && r.expires_in;
}
const Pt = ["global", "local", "others"];
var Ia = function(r, e) {
  var t = {};
  for (var s in r) Object.prototype.hasOwnProperty.call(r, s) && e.indexOf(s) < 0 && (t[s] = r[s]);
  if (r != null && typeof Object.getOwnPropertySymbols == "function")
    for (var n = 0, s = Object.getOwnPropertySymbols(r); n < s.length; n++)
      e.indexOf(s[n]) < 0 && Object.prototype.propertyIsEnumerable.call(r, s[n]) && (t[s[n]] = r[s[n]]);
  return t;
};
class Pa {
  constructor({ url: e = "", headers: t = {}, fetch: s }) {
    this.url = e, this.headers = t, this.fetch = vr(s), this.mfa = {
      listFactors: this._listFactors.bind(this),
      deleteFactor: this._deleteFactor.bind(this)
    };
  }
  /**
   * Removes a logged-in session.
   * @param jwt A valid, logged-in JWT.
   * @param scope The logout sope.
   */
  async signOut(e, t = Pt[0]) {
    if (Pt.indexOf(t) < 0)
      throw new Error(`@supabase/auth-js: Parameter scope must be one of ${Pt.join(", ")}`);
    try {
      return await L(this.fetch, "POST", `${this.url}/logout?scope=${t}`, {
        headers: this.headers,
        jwt: e,
        noResolveJson: !0
      }), { data: null, error: null };
    } catch (s) {
      if (P(s))
        return { data: null, error: s };
      throw s;
    }
  }
  /**
   * Sends an invite link to an email address.
   * @param email The email address of the user.
   * @param options Additional options to be included when inviting.
   */
  async inviteUserByEmail(e, t = {}) {
    try {
      return await L(this.fetch, "POST", `${this.url}/invite`, {
        body: { email: e, data: t.data },
        headers: this.headers,
        redirectTo: t.redirectTo,
        xform: pe
      });
    } catch (s) {
      if (P(s))
        return { data: { user: null }, error: s };
      throw s;
    }
  }
  /**
   * Generates email links and OTPs to be sent via a custom email provider.
   * @param email The user's email.
   * @param options.password User password. For signup only.
   * @param options.data Optional user metadata. For signup only.
   * @param options.redirectTo The redirect url which should be appended to the generated link
   */
  async generateLink(e) {
    try {
      const { options: t } = e, s = Ia(e, ["options"]), n = Object.assign(Object.assign({}, s), t);
      return "newEmail" in s && (n.new_email = s == null ? void 0 : s.newEmail, delete n.newEmail), await L(this.fetch, "POST", `${this.url}/admin/generate_link`, {
        body: n,
        headers: this.headers,
        xform: Oa,
        redirectTo: t == null ? void 0 : t.redirectTo
      });
    } catch (t) {
      if (P(t))
        return {
          data: {
            properties: null,
            user: null
          },
          error: t
        };
      throw t;
    }
  }
  // User Admin API
  /**
   * Creates a new user.
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async createUser(e) {
    try {
      return await L(this.fetch, "POST", `${this.url}/admin/users`, {
        body: e,
        headers: this.headers,
        xform: pe
      });
    } catch (t) {
      if (P(t))
        return { data: { user: null }, error: t };
      throw t;
    }
  }
  /**
   * Get a list of users.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
   */
  async listUsers(e) {
    var t, s, n, i, a, o, l;
    try {
      const c = { nextPage: null, lastPage: 0, total: 0 }, u = await L(this.fetch, "GET", `${this.url}/admin/users`, {
        headers: this.headers,
        noResolveJson: !0,
        query: {
          page: (s = (t = e == null ? void 0 : e.page) === null || t === void 0 ? void 0 : t.toString()) !== null && s !== void 0 ? s : "",
          per_page: (i = (n = e == null ? void 0 : e.perPage) === null || n === void 0 ? void 0 : n.toString()) !== null && i !== void 0 ? i : ""
        },
        xform: ja
      });
      if (u.error)
        throw u.error;
      const d = await u.json(), f = (a = u.headers.get("x-total-count")) !== null && a !== void 0 ? a : 0, p = (l = (o = u.headers.get("link")) === null || o === void 0 ? void 0 : o.split(",")) !== null && l !== void 0 ? l : [];
      return p.length > 0 && (p.forEach((g) => {
        const w = parseInt(g.split(";")[0].split("=")[1].substring(0, 1)), S = JSON.parse(g.split(";")[1].split("=")[1]);
        c[`${S}Page`] = w;
      }), c.total = parseInt(f)), { data: Object.assign(Object.assign({}, d), c), error: null };
    } catch (c) {
      if (P(c))
        return { data: { users: [] }, error: c };
      throw c;
    }
  }
  /**
   * Get user by id.
   *
   * @param uid The user's unique identifier
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async getUserById(e) {
    Te(e);
    try {
      return await L(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        xform: pe
      });
    } catch (t) {
      if (P(t))
        return { data: { user: null }, error: t };
      throw t;
    }
  }
  /**
   * Updates the user data.
   *
   * @param attributes The data you want to update.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async updateUserById(e, t) {
    Te(e);
    try {
      return await L(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
        body: t,
        headers: this.headers,
        xform: pe
      });
    } catch (s) {
      if (P(s))
        return { data: { user: null }, error: s };
      throw s;
    }
  }
  /**
   * Delete a user. Requires a `service_role` key.
   *
   * @param id The user id you want to remove.
   * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
   * Defaults to false for backward compatibility.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async deleteUser(e, t = !1) {
    Te(e);
    try {
      return await L(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        body: {
          should_soft_delete: t
        },
        xform: pe
      });
    } catch (s) {
      if (P(s))
        return { data: { user: null }, error: s };
      throw s;
    }
  }
  async _listFactors(e) {
    Te(e.userId);
    try {
      const { data: t, error: s } = await L(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, {
        headers: this.headers,
        xform: (n) => ({ data: { factors: n }, error: null })
      });
      return { data: t, error: s };
    } catch (t) {
      if (P(t))
        return { data: null, error: t };
      throw t;
    }
  }
  async _deleteFactor(e) {
    Te(e.userId), Te(e.id);
    try {
      return { data: await L(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, {
        headers: this.headers
      }), error: null };
    } catch (t) {
      if (P(t))
        return { data: null, error: t };
      throw t;
    }
  }
}
function Fs(r = {}) {
  return {
    getItem: (e) => r[e] || null,
    setItem: (e, t) => {
      r[e] = t;
    },
    removeItem: (e) => {
      delete r[e];
    }
  };
}
function $a() {
  if (typeof globalThis != "object")
    try {
      Object.defineProperty(Object.prototype, "__magic__", {
        get: function() {
          return this;
        },
        configurable: !0
      }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
    } catch {
      typeof self < "u" && (self.globalThis = self);
    }
}
const Ae = {
  /**
   * @experimental
   */
  debug: !!(globalThis && yr() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
};
class _r extends Error {
  constructor(e) {
    super(e), this.isAcquireTimeout = !0;
  }
}
class Na extends _r {
}
async function La(r, e, t) {
  Ae.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", r, e);
  const s = new globalThis.AbortController();
  return e > 0 && setTimeout(() => {
    s.abort(), Ae.debug && console.log("@supabase/gotrue-js: navigatorLock acquire timed out", r);
  }, e), await Promise.resolve().then(() => globalThis.navigator.locks.request(r, e === 0 ? {
    mode: "exclusive",
    ifAvailable: !0
  } : {
    mode: "exclusive",
    signal: s.signal
  }, async (n) => {
    if (n) {
      Ae.debug && console.log("@supabase/gotrue-js: navigatorLock: acquired", r, n.name);
      try {
        return await t();
      } finally {
        Ae.debug && console.log("@supabase/gotrue-js: navigatorLock: released", r, n.name);
      }
    } else {
      if (e === 0)
        throw Ae.debug && console.log("@supabase/gotrue-js: navigatorLock: not immediately available", r), new Na(`Acquiring an exclusive Navigator LockManager lock "${r}" immediately failed`);
      if (Ae.debug)
        try {
          const i = await globalThis.navigator.locks.query();
          console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(i, null, "  "));
        } catch (i) {
          console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", i);
        }
      return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"), await t();
    }
  }));
}
$a();
const Ua = {
  url: Ki,
  storageKey: Hi,
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  headers: Gi,
  flowType: "implicit",
  debug: !1,
  hasCustomAuthorizationHeader: !1
};
async function qs(r, e, t) {
  return await t();
}
const Ce = {};
class Qe {
  /**
   * Create a new client for use in the browser.
   */
  constructor(e) {
    var t, s;
    this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = !0, this.hasCustomAuthorizationHeader = !1, this.suppressGetSessionWarning = !1, this.lockAcquired = !1, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log, this.instanceID = Qe.nextInstanceID, Qe.nextInstanceID += 1, this.instanceID > 0 && se() && console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
    const n = Object.assign(Object.assign({}, Ua), e);
    if (this.logDebugMessages = !!n.debug, typeof n.debug == "function" && (this.logger = n.debug), this.persistSession = n.persistSession, this.storageKey = n.storageKey, this.autoRefreshToken = n.autoRefreshToken, this.admin = new Pa({
      url: n.url,
      headers: n.headers,
      fetch: n.fetch
    }), this.url = n.url, this.headers = n.headers, this.fetch = vr(n.fetch), this.lock = n.lock || qs, this.detectSessionInUrl = n.detectSessionInUrl, this.flowType = n.flowType, this.hasCustomAuthorizationHeader = n.hasCustomAuthorizationHeader, n.lock ? this.lock = n.lock : se() && (!((t = globalThis == null ? void 0 : globalThis.navigator) === null || t === void 0) && t.locks) ? this.lock = La : this.lock = qs, this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = {
      verify: this._verify.bind(this),
      enroll: this._enroll.bind(this),
      unenroll: this._unenroll.bind(this),
      challenge: this._challenge.bind(this),
      listFactors: this._listFactors.bind(this),
      challengeAndVerify: this._challengeAndVerify.bind(this),
      getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this)
    }, this.persistSession ? (n.storage ? this.storage = n.storage : yr() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = Fs(this.memoryStorage)), n.userStorage && (this.userStorage = n.userStorage)) : (this.memoryStorage = {}, this.storage = Fs(this.memoryStorage)), se() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
      try {
        this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
      } catch (i) {
        console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", i);
      }
      (s = this.broadcastChannel) === null || s === void 0 || s.addEventListener("message", async (i) => {
        this._debug("received broadcast notification from other tab or client", i), await this._notifyAllSubscribers(i.data.event, i.data.session, !1);
      });
    }
    this.initialize();
  }
  /**
   * The JWKS used for verifying asymmetric JWTs
   */
  get jwks() {
    var e, t;
    return (t = (e = Ce[this.storageKey]) === null || e === void 0 ? void 0 : e.jwks) !== null && t !== void 0 ? t : { keys: [] };
  }
  set jwks(e) {
    Ce[this.storageKey] = Object.assign(Object.assign({}, Ce[this.storageKey]), { jwks: e });
  }
  get jwks_cached_at() {
    var e, t;
    return (t = (e = Ce[this.storageKey]) === null || e === void 0 ? void 0 : e.cachedAt) !== null && t !== void 0 ? t : Number.MIN_SAFE_INTEGER;
  }
  set jwks_cached_at(e) {
    Ce[this.storageKey] = Object.assign(Object.assign({}, Ce[this.storageKey]), { cachedAt: e });
  }
  _debug(...e) {
    return this.logDebugMessages && this.logger(`GoTrueClient@${this.instanceID} (${fr}) ${(/* @__PURE__ */ new Date()).toISOString()}`, ...e), this;
  }
  /**
   * Initializes the client session either from the url or from storage.
   * This method is automatically called when instantiating the client, but should also be called
   * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
   */
  async initialize() {
    return this.initializePromise ? await this.initializePromise : (this.initializePromise = (async () => await this._acquireLock(-1, async () => await this._initialize()))(), await this.initializePromise);
  }
  /**
   * IMPORTANT:
   * 1. Never throw in this method, as it is called from the constructor
   * 2. Never return a session from this method as it would be cached over
   *    the whole lifetime of the client
   */
  async _initialize() {
    var e;
    try {
      const t = da(window.location.href);
      let s = "none";
      if (this._isImplicitGrantCallback(t) ? s = "implicit" : await this._isPKCECallback(t) && (s = "pkce"), se() && this.detectSessionInUrl && s !== "none") {
        const { data: n, error: i } = await this._getSessionFromURL(t, s);
        if (i) {
          if (this._debug("#_initialize()", "error detecting session from URL", i), ta(i)) {
            const l = (e = i.details) === null || e === void 0 ? void 0 : e.code;
            if (l === "identity_already_exists" || l === "identity_not_found" || l === "single_identity_not_deletable")
              return { error: i };
          }
          return await this._removeSession(), { error: i };
        }
        const { session: a, redirectType: o } = n;
        return this._debug("#_initialize()", "detected session in URL", a, "redirect type", o), await this._saveSession(a), setTimeout(async () => {
          o === "recovery" ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", a) : await this._notifyAllSubscribers("SIGNED_IN", a);
        }, 0), { error: null };
      }
      return await this._recoverAndRefresh(), { error: null };
    } catch (t) {
      return P(t) ? { error: t } : {
        error: new gr("Unexpected error during initialization", t)
      };
    } finally {
      await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
    }
  }
  /**
   * Creates a new anonymous user.
   *
   * @returns A session where the is_anonymous claim in the access token JWT set to true
   */
  async signInAnonymously(e) {
    var t, s, n;
    try {
      const i = await L(this.fetch, "POST", `${this.url}/signup`, {
        headers: this.headers,
        body: {
          data: (s = (t = e == null ? void 0 : e.options) === null || t === void 0 ? void 0 : t.data) !== null && s !== void 0 ? s : {},
          gotrue_meta_security: { captcha_token: (n = e == null ? void 0 : e.options) === null || n === void 0 ? void 0 : n.captchaToken }
        },
        xform: ae
      }), { data: a, error: o } = i;
      if (o || !a)
        return { data: { user: null, session: null }, error: o };
      const l = a.session, c = a.user;
      return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers("SIGNED_IN", l)), { data: { user: c, session: l }, error: null };
    } catch (i) {
      if (P(i))
        return { data: { user: null, session: null }, error: i };
      throw i;
    }
  }
  /**
   * Creates a new user.
   *
   * Be aware that if a user account exists in the system you may get back an
   * error message that attempts to hide this information from the user.
   * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
   *
   * @returns A logged-in session if the server has "autoconfirm" ON
   * @returns A user if the server has "autoconfirm" OFF
   */
  async signUp(e) {
    var t, s, n;
    try {
      let i;
      if ("email" in e) {
        const { email: u, password: d, options: f } = e;
        let p = null, g = null;
        this.flowType === "pkce" && ([p, g] = await xe(this.storage, this.storageKey)), i = await L(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          redirectTo: f == null ? void 0 : f.emailRedirectTo,
          body: {
            email: u,
            password: d,
            data: (t = f == null ? void 0 : f.data) !== null && t !== void 0 ? t : {},
            gotrue_meta_security: { captcha_token: f == null ? void 0 : f.captchaToken },
            code_challenge: p,
            code_challenge_method: g
          },
          xform: ae
        });
      } else if ("phone" in e) {
        const { phone: u, password: d, options: f } = e;
        i = await L(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            phone: u,
            password: d,
            data: (s = f == null ? void 0 : f.data) !== null && s !== void 0 ? s : {},
            channel: (n = f == null ? void 0 : f.channel) !== null && n !== void 0 ? n : "sms",
            gotrue_meta_security: { captcha_token: f == null ? void 0 : f.captchaToken }
          },
          xform: ae
        });
      } else
        throw new st("You must provide either an email or phone number and a password");
      const { data: a, error: o } = i;
      if (o || !a)
        return { data: { user: null, session: null }, error: o };
      const l = a.session, c = a.user;
      return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers("SIGNED_IN", l)), { data: { user: c, session: l }, error: null };
    } catch (i) {
      if (P(i))
        return { data: { user: null, session: null }, error: i };
      throw i;
    }
  }
  /**
   * Log in an existing user with an email and password or phone and password.
   *
   * Be aware that you may get back an error message that will not distinguish
   * between the cases where the account does not exist or that the
   * email/phone and password combination is wrong or that the account can only
   * be accessed via social login.
   */
  async signInWithPassword(e) {
    try {
      let t;
      if ("email" in e) {
        const { email: i, password: a, options: o } = e;
        t = await L(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
          headers: this.headers,
          body: {
            email: i,
            password: a,
            gotrue_meta_security: { captcha_token: o == null ? void 0 : o.captchaToken }
          },
          xform: Bs
        });
      } else if ("phone" in e) {
        const { phone: i, password: a, options: o } = e;
        t = await L(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
          headers: this.headers,
          body: {
            phone: i,
            password: a,
            gotrue_meta_security: { captcha_token: o == null ? void 0 : o.captchaToken }
          },
          xform: Bs
        });
      } else
        throw new st("You must provide either an email or phone number and a password");
      const { data: s, error: n } = t;
      return n ? { data: { user: null, session: null }, error: n } : !s || !s.session || !s.user ? { data: { user: null, session: null }, error: new tt() } : (s.session && (await this._saveSession(s.session), await this._notifyAllSubscribers("SIGNED_IN", s.session)), {
        data: Object.assign({ user: s.user, session: s.session }, s.weak_password ? { weakPassword: s.weak_password } : null),
        error: n
      });
    } catch (t) {
      if (P(t))
        return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  /**
   * Log in an existing user via a third-party provider.
   * This method supports the PKCE flow.
   */
  async signInWithOAuth(e) {
    var t, s, n, i;
    return await this._handleProviderSignIn(e.provider, {
      redirectTo: (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo,
      scopes: (s = e.options) === null || s === void 0 ? void 0 : s.scopes,
      queryParams: (n = e.options) === null || n === void 0 ? void 0 : n.queryParams,
      skipBrowserRedirect: (i = e.options) === null || i === void 0 ? void 0 : i.skipBrowserRedirect
    });
  }
  /**
   * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
   */
  async exchangeCodeForSession(e) {
    return await this.initializePromise, this._acquireLock(-1, async () => this._exchangeCodeForSession(e));
  }
  /**
   * Signs in a user by verifying a message signed by the user's private key.
   * Only Solana supported at this time, using the Sign in with Solana standard.
   */
  async signInWithWeb3(e) {
    const { chain: t } = e;
    if (t === "solana")
      return await this.signInWithSolana(e);
    throw new Error(`@supabase/auth-js: Unsupported chain "${t}"`);
  }
  async signInWithSolana(e) {
    var t, s, n, i, a, o, l, c, u, d, f, p;
    let g, w;
    if ("message" in e)
      g = e.message, w = e.signature;
    else {
      const { chain: S, wallet: b, statement: C, options: y } = e;
      let k;
      if (se())
        if (typeof b == "object")
          k = b;
        else {
          const m = window;
          if ("solana" in m && typeof m.solana == "object" && ("signIn" in m.solana && typeof m.solana.signIn == "function" || "signMessage" in m.solana && typeof m.solana.signMessage == "function"))
            k = m.solana;
          else
            throw new Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
        }
      else {
        if (typeof b != "object" || !(y != null && y.url))
          throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
        k = b;
      }
      const j = new URL((t = y == null ? void 0 : y.url) !== null && t !== void 0 ? t : window.location.href);
      if ("signIn" in k && k.signIn) {
        const m = await k.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, y == null ? void 0 : y.signInWithSolana), {
          // non-overridable properties
          version: "1",
          domain: j.host,
          uri: j.href
        }), C ? { statement: C } : null));
        let v;
        if (Array.isArray(m) && m[0] && typeof m[0] == "object")
          v = m[0];
        else if (m && typeof m == "object" && "signedMessage" in m && "signature" in m)
          v = m;
        else
          throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
        if ("signedMessage" in v && "signature" in v && (typeof v.signedMessage == "string" || v.signedMessage instanceof Uint8Array) && v.signature instanceof Uint8Array)
          g = typeof v.signedMessage == "string" ? v.signedMessage : new TextDecoder().decode(v.signedMessage), w = v.signature;
        else
          throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
      } else {
        if (!("signMessage" in k) || typeof k.signMessage != "function" || !("publicKey" in k) || typeof k != "object" || !k.publicKey || !("toBase58" in k.publicKey) || typeof k.publicKey.toBase58 != "function")
          throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
        g = [
          `${j.host} wants you to sign in with your Solana account:`,
          k.publicKey.toBase58(),
          ...C ? ["", C, ""] : [""],
          "Version: 1",
          `URI: ${j.href}`,
          `Issued At: ${(n = (s = y == null ? void 0 : y.signInWithSolana) === null || s === void 0 ? void 0 : s.issuedAt) !== null && n !== void 0 ? n : (/* @__PURE__ */ new Date()).toISOString()}`,
          ...!((i = y == null ? void 0 : y.signInWithSolana) === null || i === void 0) && i.notBefore ? [`Not Before: ${y.signInWithSolana.notBefore}`] : [],
          ...!((a = y == null ? void 0 : y.signInWithSolana) === null || a === void 0) && a.expirationTime ? [`Expiration Time: ${y.signInWithSolana.expirationTime}`] : [],
          ...!((o = y == null ? void 0 : y.signInWithSolana) === null || o === void 0) && o.chainId ? [`Chain ID: ${y.signInWithSolana.chainId}`] : [],
          ...!((l = y == null ? void 0 : y.signInWithSolana) === null || l === void 0) && l.nonce ? [`Nonce: ${y.signInWithSolana.nonce}`] : [],
          ...!((c = y == null ? void 0 : y.signInWithSolana) === null || c === void 0) && c.requestId ? [`Request ID: ${y.signInWithSolana.requestId}`] : [],
          ...!((d = (u = y == null ? void 0 : y.signInWithSolana) === null || u === void 0 ? void 0 : u.resources) === null || d === void 0) && d.length ? [
            "Resources",
            ...y.signInWithSolana.resources.map((v) => `- ${v}`)
          ] : []
        ].join(`
`);
        const m = await k.signMessage(new TextEncoder().encode(g), "utf8");
        if (!m || !(m instanceof Uint8Array))
          throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
        w = m;
      }
    }
    try {
      const { data: S, error: b } = await L(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
        headers: this.headers,
        body: Object.assign({ chain: "solana", message: g, signature: la(w) }, !((f = e.options) === null || f === void 0) && f.captchaToken ? { gotrue_meta_security: { captcha_token: (p = e.options) === null || p === void 0 ? void 0 : p.captchaToken } } : null),
        xform: ae
      });
      if (b)
        throw b;
      return !S || !S.session || !S.user ? {
        data: { user: null, session: null },
        error: new tt()
      } : (S.session && (await this._saveSession(S.session), await this._notifyAllSubscribers("SIGNED_IN", S.session)), { data: Object.assign({}, S), error: b });
    } catch (S) {
      if (P(S))
        return { data: { user: null, session: null }, error: S };
      throw S;
    }
  }
  async _exchangeCodeForSession(e) {
    const t = await _e(this.storage, `${this.storageKey}-code-verifier`), [s, n] = (t ?? "").split("/");
    try {
      const { data: i, error: a } = await L(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
        headers: this.headers,
        body: {
          auth_code: e,
          code_verifier: s
        },
        xform: ae
      });
      if (await de(this.storage, `${this.storageKey}-code-verifier`), a)
        throw a;
      return !i || !i.session || !i.user ? {
        data: { user: null, session: null, redirectType: null },
        error: new tt()
      } : (i.session && (await this._saveSession(i.session), await this._notifyAllSubscribers("SIGNED_IN", i.session)), { data: Object.assign(Object.assign({}, i), { redirectType: n ?? null }), error: a });
    } catch (i) {
      if (P(i))
        return { data: { user: null, session: null, redirectType: null }, error: i };
      throw i;
    }
  }
  /**
   * Allows signing in with an OIDC ID token. The authentication provider used
   * should be enabled and configured.
   */
  async signInWithIdToken(e) {
    try {
      const { options: t, provider: s, token: n, access_token: i, nonce: a } = e, o = await L(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
        headers: this.headers,
        body: {
          provider: s,
          id_token: n,
          access_token: i,
          nonce: a,
          gotrue_meta_security: { captcha_token: t == null ? void 0 : t.captchaToken }
        },
        xform: ae
      }), { data: l, error: c } = o;
      return c ? { data: { user: null, session: null }, error: c } : !l || !l.session || !l.user ? {
        data: { user: null, session: null },
        error: new tt()
      } : (l.session && (await this._saveSession(l.session), await this._notifyAllSubscribers("SIGNED_IN", l.session)), { data: l, error: c });
    } catch (t) {
      if (P(t))
        return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  /**
   * Log in a user using magiclink or a one-time password (OTP).
   *
   * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
   * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
   * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
   *
   * Be aware that you may get back an error message that will not distinguish
   * between the cases where the account does not exist or, that the account
   * can only be accessed via social login.
   *
   * Do note that you will need to configure a Whatsapp sender on Twilio
   * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
   * channel is not supported on other providers
   * at this time.
   * This method supports PKCE when an email is passed.
   */
  async signInWithOtp(e) {
    var t, s, n, i, a;
    try {
      if ("email" in e) {
        const { email: o, options: l } = e;
        let c = null, u = null;
        this.flowType === "pkce" && ([c, u] = await xe(this.storage, this.storageKey));
        const { error: d } = await L(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            email: o,
            data: (t = l == null ? void 0 : l.data) !== null && t !== void 0 ? t : {},
            create_user: (s = l == null ? void 0 : l.shouldCreateUser) !== null && s !== void 0 ? s : !0,
            gotrue_meta_security: { captcha_token: l == null ? void 0 : l.captchaToken },
            code_challenge: c,
            code_challenge_method: u
          },
          redirectTo: l == null ? void 0 : l.emailRedirectTo
        });
        return { data: { user: null, session: null }, error: d };
      }
      if ("phone" in e) {
        const { phone: o, options: l } = e, { data: c, error: u } = await L(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            phone: o,
            data: (n = l == null ? void 0 : l.data) !== null && n !== void 0 ? n : {},
            create_user: (i = l == null ? void 0 : l.shouldCreateUser) !== null && i !== void 0 ? i : !0,
            gotrue_meta_security: { captcha_token: l == null ? void 0 : l.captchaToken },
            channel: (a = l == null ? void 0 : l.channel) !== null && a !== void 0 ? a : "sms"
          }
        });
        return { data: { user: null, session: null, messageId: c == null ? void 0 : c.message_id }, error: u };
      }
      throw new st("You must provide either an email or phone number.");
    } catch (o) {
      if (P(o))
        return { data: { user: null, session: null }, error: o };
      throw o;
    }
  }
  /**
   * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
   */
  async verifyOtp(e) {
    var t, s;
    try {
      let n, i;
      "options" in e && (n = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo, i = (s = e.options) === null || s === void 0 ? void 0 : s.captchaToken);
      const { data: a, error: o } = await L(this.fetch, "POST", `${this.url}/verify`, {
        headers: this.headers,
        body: Object.assign(Object.assign({}, e), { gotrue_meta_security: { captcha_token: i } }),
        redirectTo: n,
        xform: ae
      });
      if (o)
        throw o;
      if (!a)
        throw new Error("An error occurred on token verification.");
      const l = a.session, c = a.user;
      return l != null && l.access_token && (await this._saveSession(l), await this._notifyAllSubscribers(e.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", l)), { data: { user: c, session: l }, error: null };
    } catch (n) {
      if (P(n))
        return { data: { user: null, session: null }, error: n };
      throw n;
    }
  }
  /**
   * Attempts a single-sign on using an enterprise Identity Provider. A
   * successful SSO attempt will redirect the current page to the identity
   * provider authorization page. The redirect URL is implementation and SSO
   * protocol specific.
   *
   * You can use it by providing a SSO domain. Typically you can extract this
   * domain by asking users for their email address. If this domain is
   * registered on the Auth instance the redirect will use that organization's
   * currently active SSO Identity Provider for the login.
   *
   * If you have built an organization-specific login page, you can use the
   * organization's SSO Identity Provider UUID directly instead.
   */
  async signInWithSSO(e) {
    var t, s, n;
    try {
      let i = null, a = null;
      return this.flowType === "pkce" && ([i, a] = await xe(this.storage, this.storageKey)), await L(this.fetch, "POST", `${this.url}/sso`, {
        body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? { provider_id: e.providerId } : null), "domain" in e ? { domain: e.domain } : null), { redirect_to: (s = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo) !== null && s !== void 0 ? s : void 0 }), !((n = e == null ? void 0 : e.options) === null || n === void 0) && n.captchaToken ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } } : null), { skip_http_redirect: !0, code_challenge: i, code_challenge_method: a }),
        headers: this.headers,
        xform: Ca
      });
    } catch (i) {
      if (P(i))
        return { data: null, error: i };
      throw i;
    }
  }
  /**
   * Sends a reauthentication OTP to the user's email or phone number.
   * Requires the user to be signed-in.
   */
  async reauthenticate() {
    return await this.initializePromise, await this._acquireLock(-1, async () => await this._reauthenticate());
  }
  async _reauthenticate() {
    try {
      return await this._useSession(async (e) => {
        const { data: { session: t }, error: s } = e;
        if (s)
          throw s;
        if (!t)
          throw new he();
        const { error: n } = await L(this.fetch, "GET", `${this.url}/reauthenticate`, {
          headers: this.headers,
          jwt: t.access_token
        });
        return { data: { user: null, session: null }, error: n };
      });
    } catch (e) {
      if (P(e))
        return { data: { user: null, session: null }, error: e };
      throw e;
    }
  }
  /**
   * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
   */
  async resend(e) {
    try {
      const t = `${this.url}/resend`;
      if ("email" in e) {
        const { email: s, type: n, options: i } = e, { error: a } = await L(this.fetch, "POST", t, {
          headers: this.headers,
          body: {
            email: s,
            type: n,
            gotrue_meta_security: { captcha_token: i == null ? void 0 : i.captchaToken }
          },
          redirectTo: i == null ? void 0 : i.emailRedirectTo
        });
        return { data: { user: null, session: null }, error: a };
      } else if ("phone" in e) {
        const { phone: s, type: n, options: i } = e, { data: a, error: o } = await L(this.fetch, "POST", t, {
          headers: this.headers,
          body: {
            phone: s,
            type: n,
            gotrue_meta_security: { captcha_token: i == null ? void 0 : i.captchaToken }
          }
        });
        return { data: { user: null, session: null, messageId: a == null ? void 0 : a.message_id }, error: o };
      }
      throw new st("You must provide either an email or phone number and a type");
    } catch (t) {
      if (P(t))
        return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  /**
   * Returns the session, refreshing it if necessary.
   *
   * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
   *
   * **IMPORTANT:** This method loads values directly from the storage attached
   * to the client. If that storage is based on request cookies for example,
   * the values in it may not be authentic and therefore it's strongly advised
   * against using this method and its results in such circumstances. A warning
   * will be emitted if this is detected. Use {@link #getUser()} instead.
   */
  async getSession() {
    return await this.initializePromise, await this._acquireLock(-1, async () => this._useSession(async (t) => t));
  }
  /**
   * Acquires a global lock based on the storage key.
   */
  async _acquireLock(e, t) {
    this._debug("#_acquireLock", "begin", e);
    try {
      if (this.lockAcquired) {
        const s = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), n = (async () => (await s, await t()))();
        return this.pendingInLock.push((async () => {
          try {
            await n;
          } catch {
          }
        })()), n;
      }
      return await this.lock(`lock:${this.storageKey}`, e, async () => {
        this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
        try {
          this.lockAcquired = !0;
          const s = t();
          for (this.pendingInLock.push((async () => {
            try {
              await s;
            } catch {
            }
          })()), await s; this.pendingInLock.length; ) {
            const n = [...this.pendingInLock];
            await Promise.all(n), this.pendingInLock.splice(0, n.length);
          }
          return await s;
        } finally {
          this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = !1;
        }
      });
    } finally {
      this._debug("#_acquireLock", "end");
    }
  }
  /**
   * Use instead of {@link #getSession} inside the library. It is
   * semantically usually what you want, as getting a session involves some
   * processing afterwards that requires only one client operating on the
   * session at once across multiple tabs or processes.
   */
  async _useSession(e) {
    this._debug("#_useSession", "begin");
    try {
      const t = await this.__loadSession();
      return await e(t);
    } finally {
      this._debug("#_useSession", "end");
    }
  }
  /**
   * NEVER USE DIRECTLY!
   *
   * Always use {@link #_useSession}.
   */
  async __loadSession() {
    this._debug("#__loadSession()", "begin"), this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
    try {
      let e = null;
      const t = await _e(this.storage, this.storageKey);
      if (this._debug("#getSession()", "session from storage", t), t !== null && (this._isValidSession(t) ? e = t : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e)
        return { data: { session: null }, error: null };
      const s = e.expires_at ? e.expires_at * 1e3 - Date.now() < Ot : !1;
      if (this._debug("#__loadSession()", `session has${s ? "" : " not"} expired`, "expires_at", e.expires_at), !s) {
        if (this.userStorage) {
          const a = await _e(this.userStorage, this.storageKey + "-user");
          a != null && a.user ? e.user = a.user : e.user = It();
        }
        if (this.storage.isServer && e.user) {
          let a = this.suppressGetSessionWarning;
          e = new Proxy(e, {
            get: (l, c, u) => (!a && c === "user" && (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), a = !0, this.suppressGetSessionWarning = !0), Reflect.get(l, c, u))
          });
        }
        return { data: { session: e }, error: null };
      }
      const { session: n, error: i } = await this._callRefreshToken(e.refresh_token);
      return i ? { data: { session: null }, error: i } : { data: { session: n }, error: null };
    } finally {
      this._debug("#__loadSession()", "end");
    }
  }
  /**
   * Gets the current user details if there is an existing session. This method
   * performs a network request to the Supabase Auth server, so the returned
   * value is authentic and can be used to base authorization rules on.
   *
   * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
   */
  async getUser(e) {
    return e ? await this._getUser(e) : (await this.initializePromise, await this._acquireLock(-1, async () => await this._getUser()));
  }
  async _getUser(e) {
    try {
      return e ? await L(this.fetch, "GET", `${this.url}/user`, {
        headers: this.headers,
        jwt: e,
        xform: pe
      }) : await this._useSession(async (t) => {
        var s, n, i;
        const { data: a, error: o } = t;
        if (o)
          throw o;
        return !(!((s = a.session) === null || s === void 0) && s.access_token) && !this.hasCustomAuthorizationHeader ? { data: { user: null }, error: new he() } : await L(this.fetch, "GET", `${this.url}/user`, {
          headers: this.headers,
          jwt: (i = (n = a.session) === null || n === void 0 ? void 0 : n.access_token) !== null && i !== void 0 ? i : void 0,
          xform: pe
        });
      });
    } catch (t) {
      if (P(t))
        return ea(t) && (await this._removeSession(), await de(this.storage, `${this.storageKey}-code-verifier`)), { data: { user: null }, error: t };
      throw t;
    }
  }
  /**
   * Updates user data for a logged in user.
   */
  async updateUser(e, t = {}) {
    return await this.initializePromise, await this._acquireLock(-1, async () => await this._updateUser(e, t));
  }
  async _updateUser(e, t = {}) {
    try {
      return await this._useSession(async (s) => {
        const { data: n, error: i } = s;
        if (i)
          throw i;
        if (!n.session)
          throw new he();
        const a = n.session;
        let o = null, l = null;
        this.flowType === "pkce" && e.email != null && ([o, l] = await xe(this.storage, this.storageKey));
        const { data: c, error: u } = await L(this.fetch, "PUT", `${this.url}/user`, {
          headers: this.headers,
          redirectTo: t == null ? void 0 : t.emailRedirectTo,
          body: Object.assign(Object.assign({}, e), { code_challenge: o, code_challenge_method: l }),
          jwt: a.access_token,
          xform: pe
        });
        if (u)
          throw u;
        return a.user = c.user, await this._saveSession(a), await this._notifyAllSubscribers("USER_UPDATED", a), { data: { user: a.user }, error: null };
      });
    } catch (s) {
      if (P(s))
        return { data: { user: null }, error: s };
      throw s;
    }
  }
  /**
   * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
   * If the refresh token or access token in the current session is invalid, an error will be thrown.
   * @param currentSession The current session that minimally contains an access token and refresh token.
   */
  async setSession(e) {
    return await this.initializePromise, await this._acquireLock(-1, async () => await this._setSession(e));
  }
  async _setSession(e) {
    try {
      if (!e.access_token || !e.refresh_token)
        throw new he();
      const t = Date.now() / 1e3;
      let s = t, n = !0, i = null;
      const { payload: a } = Rt(e.access_token);
      if (a.exp && (s = a.exp, n = s <= t), n) {
        const { session: o, error: l } = await this._callRefreshToken(e.refresh_token);
        if (l)
          return { data: { user: null, session: null }, error: l };
        if (!o)
          return { data: { user: null, session: null }, error: null };
        i = o;
      } else {
        const { data: o, error: l } = await this._getUser(e.access_token);
        if (l)
          throw l;
        i = {
          access_token: e.access_token,
          refresh_token: e.refresh_token,
          user: o.user,
          token_type: "bearer",
          expires_in: s - t,
          expires_at: s
        }, await this._saveSession(i), await this._notifyAllSubscribers("SIGNED_IN", i);
      }
      return { data: { user: i.user, session: i }, error: null };
    } catch (t) {
      if (P(t))
        return { data: { session: null, user: null }, error: t };
      throw t;
    }
  }
  /**
   * Returns a new session, regardless of expiry status.
   * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
   * If the current session's refresh token is invalid, an error will be thrown.
   * @param currentSession The current session. If passed in, it must contain a refresh token.
   */
  async refreshSession(e) {
    return await this.initializePromise, await this._acquireLock(-1, async () => await this._refreshSession(e));
  }
  async _refreshSession(e) {
    try {
      return await this._useSession(async (t) => {
        var s;
        if (!e) {
          const { data: a, error: o } = t;
          if (o)
            throw o;
          e = (s = a.session) !== null && s !== void 0 ? s : void 0;
        }
        if (!(e != null && e.refresh_token))
          throw new he();
        const { session: n, error: i } = await this._callRefreshToken(e.refresh_token);
        return i ? { data: { user: null, session: null }, error: i } : n ? { data: { user: n.user, session: n }, error: null } : { data: { user: null, session: null }, error: null };
      });
    } catch (t) {
      if (P(t))
        return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  /**
   * Gets the session data from a URL string
   */
  async _getSessionFromURL(e, t) {
    try {
      if (!se())
        throw new rt("No browser detected.");
      if (e.error || e.error_description || e.error_code)
        throw new rt(e.error_description || "Error in URL with unspecified error_description", {
          error: e.error || "unspecified_error",
          code: e.error_code || "unspecified_code"
        });
      switch (t) {
        case "implicit":
          if (this.flowType === "pkce")
            throw new Ps("Not a valid PKCE flow url.");
          break;
        case "pkce":
          if (this.flowType === "implicit")
            throw new rt("Not a valid implicit grant flow url.");
          break;
        default:
      }
      if (t === "pkce") {
        if (this._debug("#_initialize()", "begin", "is PKCE flow", !0), !e.code)
          throw new Ps("No code detected.");
        const { data: C, error: y } = await this._exchangeCodeForSession(e.code);
        if (y)
          throw y;
        const k = new URL(window.location.href);
        return k.searchParams.delete("code"), window.history.replaceState(window.history.state, "", k.toString()), { data: { session: C.session, redirectType: null }, error: null };
      }
      const { provider_token: s, provider_refresh_token: n, access_token: i, refresh_token: a, expires_in: o, expires_at: l, token_type: c } = e;
      if (!i || !o || !a || !c)
        throw new rt("No session defined in URL");
      const u = Math.round(Date.now() / 1e3), d = parseInt(o);
      let f = u + d;
      l && (f = parseInt(l));
      const p = f - u;
      p * 1e3 <= Re && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${p}s, should have been closer to ${d}s`);
      const g = f - d;
      u - g >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", g, f, u) : u - g < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", g, f, u);
      const { data: w, error: S } = await this._getUser(i);
      if (S)
        throw S;
      const b = {
        provider_token: s,
        provider_refresh_token: n,
        access_token: i,
        expires_in: d,
        expires_at: f,
        refresh_token: a,
        token_type: c,
        user: w.user
      };
      return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), { data: { session: b, redirectType: e.type }, error: null };
    } catch (s) {
      if (P(s))
        return { data: { session: null, redirectType: null }, error: s };
      throw s;
    }
  }
  /**
   * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
   */
  _isImplicitGrantCallback(e) {
    return !!(e.access_token || e.error_description);
  }
  /**
   * Checks if the current URL and backing storage contain parameters given by a PKCE flow
   */
  async _isPKCECallback(e) {
    const t = await _e(this.storage, `${this.storageKey}-code-verifier`);
    return !!(e.code && t);
  }
  /**
   * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
   *
   * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
   * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
   *
   * If using `others` scope, no `SIGNED_OUT` event is fired!
   */
  async signOut(e = { scope: "global" }) {
    return await this.initializePromise, await this._acquireLock(-1, async () => await this._signOut(e));
  }
  async _signOut({ scope: e } = { scope: "global" }) {
    return await this._useSession(async (t) => {
      var s;
      const { data: n, error: i } = t;
      if (i)
        return { error: i };
      const a = (s = n.session) === null || s === void 0 ? void 0 : s.access_token;
      if (a) {
        const { error: o } = await this.admin.signOut(a, e);
        if (o && !(Xi(o) && (o.status === 404 || o.status === 401 || o.status === 403)))
          return { error: o };
      }
      return e !== "others" && (await this._removeSession(), await de(this.storage, `${this.storageKey}-code-verifier`)), { error: null };
    });
  }
  /**
   * Receive a notification every time an auth event happens.
   * @param callback A callback function to be invoked when an auth event happens.
   */
  onAuthStateChange(e) {
    const t = ua(), s = {
      id: t,
      callback: e,
      unsubscribe: () => {
        this._debug("#unsubscribe()", "state change callback with id removed", t), this.stateChangeEmitters.delete(t);
      }
    };
    return this._debug("#onAuthStateChange()", "registered callback with id", t), this.stateChangeEmitters.set(t, s), (async () => (await this.initializePromise, await this._acquireLock(-1, async () => {
      this._emitInitialSession(t);
    })))(), { data: { subscription: s } };
  }
  async _emitInitialSession(e) {
    return await this._useSession(async (t) => {
      var s, n;
      try {
        const { data: { session: i }, error: a } = t;
        if (a)
          throw a;
        await ((s = this.stateChangeEmitters.get(e)) === null || s === void 0 ? void 0 : s.callback("INITIAL_SESSION", i)), this._debug("INITIAL_SESSION", "callback id", e, "session", i);
      } catch (i) {
        await ((n = this.stateChangeEmitters.get(e)) === null || n === void 0 ? void 0 : n.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", e, "error", i), console.error(i);
      }
    });
  }
  /**
   * Sends a password reset request to an email address. This method supports the PKCE flow.
   *
   * @param email The email address of the user.
   * @param options.redirectTo The URL to send the user to after they click the password reset link.
   * @param options.captchaToken Verification token received when the user completes the captcha on the site.
   */
  async resetPasswordForEmail(e, t = {}) {
    let s = null, n = null;
    this.flowType === "pkce" && ([s, n] = await xe(
      this.storage,
      this.storageKey,
      !0
      // isPasswordRecovery
    ));
    try {
      return await L(this.fetch, "POST", `${this.url}/recover`, {
        body: {
          email: e,
          code_challenge: s,
          code_challenge_method: n,
          gotrue_meta_security: { captcha_token: t.captchaToken }
        },
        headers: this.headers,
        redirectTo: t.redirectTo
      });
    } catch (i) {
      if (P(i))
        return { data: null, error: i };
      throw i;
    }
  }
  /**
   * Gets all the identities linked to a user.
   */
  async getUserIdentities() {
    var e;
    try {
      const { data: t, error: s } = await this.getUser();
      if (s)
        throw s;
      return { data: { identities: (e = t.user.identities) !== null && e !== void 0 ? e : [] }, error: null };
    } catch (t) {
      if (P(t))
        return { data: null, error: t };
      throw t;
    }
  }
  /**
   * Links an oauth identity to an existing user.
   * This method supports the PKCE flow.
   */
  async linkIdentity(e) {
    var t;
    try {
      const { data: s, error: n } = await this._useSession(async (i) => {
        var a, o, l, c, u;
        const { data: d, error: f } = i;
        if (f)
          throw f;
        const p = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, e.provider, {
          redirectTo: (a = e.options) === null || a === void 0 ? void 0 : a.redirectTo,
          scopes: (o = e.options) === null || o === void 0 ? void 0 : o.scopes,
          queryParams: (l = e.options) === null || l === void 0 ? void 0 : l.queryParams,
          skipBrowserRedirect: !0
        });
        return await L(this.fetch, "GET", p, {
          headers: this.headers,
          jwt: (u = (c = d.session) === null || c === void 0 ? void 0 : c.access_token) !== null && u !== void 0 ? u : void 0
        });
      });
      if (n)
        throw n;
      return se() && !(!((t = e.options) === null || t === void 0) && t.skipBrowserRedirect) && window.location.assign(s == null ? void 0 : s.url), { data: { provider: e.provider, url: s == null ? void 0 : s.url }, error: null };
    } catch (s) {
      if (P(s))
        return { data: { provider: e.provider, url: null }, error: s };
      throw s;
    }
  }
  /**
   * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
   */
  async unlinkIdentity(e) {
    try {
      return await this._useSession(async (t) => {
        var s, n;
        const { data: i, error: a } = t;
        if (a)
          throw a;
        return await L(this.fetch, "DELETE", `${this.url}/user/identities/${e.identity_id}`, {
          headers: this.headers,
          jwt: (n = (s = i.session) === null || s === void 0 ? void 0 : s.access_token) !== null && n !== void 0 ? n : void 0
        });
      });
    } catch (t) {
      if (P(t))
        return { data: null, error: t };
      throw t;
    }
  }
  /**
   * Generates a new JWT.
   * @param refreshToken A valid refresh token that was returned on login.
   */
  async _refreshAccessToken(e) {
    const t = `#_refreshAccessToken(${e.substring(0, 5)}...)`;
    this._debug(t, "begin");
    try {
      const s = Date.now();
      return await pa(async (n) => (n > 0 && await fa(200 * Math.pow(2, n - 1)), this._debug(t, "refreshing attempt", n), await L(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
        body: { refresh_token: e },
        headers: this.headers,
        xform: ae
      })), (n, i) => {
        const a = 200 * Math.pow(2, n);
        return i && jt(i) && // retryable only if the request can be sent before the backoff overflows the tick duration
        Date.now() + a - s < Re;
      });
    } catch (s) {
      if (this._debug(t, "error", s), P(s))
        return { data: { session: null, user: null }, error: s };
      throw s;
    } finally {
      this._debug(t, "end");
    }
  }
  _isValidSession(e) {
    return typeof e == "object" && e !== null && "access_token" in e && "refresh_token" in e && "expires_at" in e;
  }
  async _handleProviderSignIn(e, t) {
    const s = await this._getUrlForProvider(`${this.url}/authorize`, e, {
      redirectTo: t.redirectTo,
      scopes: t.scopes,
      queryParams: t.queryParams
    });
    return this._debug("#_handleProviderSignIn()", "provider", e, "options", t, "url", s), se() && !t.skipBrowserRedirect && window.location.assign(s), { data: { provider: e, url: s }, error: null };
  }
  /**
   * Recovers the session from LocalStorage and refreshes the token
   * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
   */
  async _recoverAndRefresh() {
    var e, t;
    const s = "#_recoverAndRefresh()";
    this._debug(s, "begin");
    try {
      const n = await _e(this.storage, this.storageKey);
      if (n && this.userStorage) {
        let a = await _e(this.userStorage, this.storageKey + "-user");
        !this.storage.isServer && Object.is(this.storage, this.userStorage) && !a && (a = { user: n.user }, await Ie(this.userStorage, this.storageKey + "-user", a)), n.user = (e = a == null ? void 0 : a.user) !== null && e !== void 0 ? e : It();
      } else if (n && !n.user && !n.user) {
        const a = await _e(this.storage, this.storageKey + "-user");
        a && (a != null && a.user) ? (n.user = a.user, await de(this.storage, this.storageKey + "-user"), await Ie(this.storage, this.storageKey, n)) : n.user = It();
      }
      if (this._debug(s, "session from storage", n), !this._isValidSession(n)) {
        this._debug(s, "session is not valid"), n !== null && await this._removeSession();
        return;
      }
      const i = ((t = n.expires_at) !== null && t !== void 0 ? t : 1 / 0) * 1e3 - Date.now() < Ot;
      if (this._debug(s, `session has${i ? "" : " not"} expired with margin of ${Ot}s`), i) {
        if (this.autoRefreshToken && n.refresh_token) {
          const { error: a } = await this._callRefreshToken(n.refresh_token);
          a && (console.error(a), jt(a) || (this._debug(s, "refresh failed with a non-retryable error, removing the session", a), await this._removeSession()));
        }
      } else if (n.user && n.user.__isUserNotAvailableProxy === !0)
        try {
          const { data: a, error: o } = await this._getUser(n.access_token);
          !o && (a != null && a.user) ? (n.user = a.user, await this._saveSession(n), await this._notifyAllSubscribers("SIGNED_IN", n)) : this._debug(s, "could not get user data, skipping SIGNED_IN notification");
        } catch (a) {
          console.error("Error getting user data:", a), this._debug(s, "error getting user data, skipping SIGNED_IN notification", a);
        }
      else
        await this._notifyAllSubscribers("SIGNED_IN", n);
    } catch (n) {
      this._debug(s, "error", n), console.error(n);
      return;
    } finally {
      this._debug(s, "end");
    }
  }
  async _callRefreshToken(e) {
    var t, s;
    if (!e)
      throw new he();
    if (this.refreshingDeferred)
      return this.refreshingDeferred.promise;
    const n = `#_callRefreshToken(${e.substring(0, 5)}...)`;
    this._debug(n, "begin");
    try {
      this.refreshingDeferred = new St();
      const { data: i, error: a } = await this._refreshAccessToken(e);
      if (a)
        throw a;
      if (!i.session)
        throw new he();
      await this._saveSession(i.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", i.session);
      const o = { session: i.session, error: null };
      return this.refreshingDeferred.resolve(o), o;
    } catch (i) {
      if (this._debug(n, "error", i), P(i)) {
        const a = { session: null, error: i };
        return jt(i) || await this._removeSession(), (t = this.refreshingDeferred) === null || t === void 0 || t.resolve(a), a;
      }
      throw (s = this.refreshingDeferred) === null || s === void 0 || s.reject(i), i;
    } finally {
      this.refreshingDeferred = null, this._debug(n, "end");
    }
  }
  async _notifyAllSubscribers(e, t, s = !0) {
    const n = `#_notifyAllSubscribers(${e})`;
    this._debug(n, "begin", t, `broadcast = ${s}`);
    try {
      this.broadcastChannel && s && this.broadcastChannel.postMessage({ event: e, session: t });
      const i = [], a = Array.from(this.stateChangeEmitters.values()).map(async (o) => {
        try {
          await o.callback(e, t);
        } catch (l) {
          i.push(l);
        }
      });
      if (await Promise.all(a), i.length > 0) {
        for (let o = 0; o < i.length; o += 1)
          console.error(i[o]);
        throw i[0];
      }
    } finally {
      this._debug(n, "end");
    }
  }
  /**
   * set currentSession and currentUser
   * process to _startAutoRefreshToken if possible
   */
  async _saveSession(e) {
    this._debug("#_saveSession()", e), this.suppressGetSessionWarning = !0;
    const t = Object.assign({}, e), s = t.user && t.user.__isUserNotAvailableProxy === !0;
    if (this.userStorage) {
      !s && t.user && await Ie(this.userStorage, this.storageKey + "-user", {
        user: t.user
      });
      const n = Object.assign({}, t);
      delete n.user;
      const i = Ds(n);
      await Ie(this.storage, this.storageKey, i);
    } else {
      const n = Ds(t);
      await Ie(this.storage, this.storageKey, n);
    }
  }
  async _removeSession() {
    this._debug("#_removeSession()"), await de(this.storage, this.storageKey), await de(this.storage, this.storageKey + "-code-verifier"), await de(this.storage, this.storageKey + "-user"), this.userStorage && await de(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
  }
  /**
   * Removes any registered visibilitychange callback.
   *
   * {@see #startAutoRefresh}
   * {@see #stopAutoRefresh}
   */
  _removeVisibilityChangedCallback() {
    this._debug("#_removeVisibilityChangedCallback()");
    const e = this.visibilityChangedCallback;
    this.visibilityChangedCallback = null;
    try {
      e && se() && (window != null && window.removeEventListener) && window.removeEventListener("visibilitychange", e);
    } catch (t) {
      console.error("removing visibilitychange callback failed", t);
    }
  }
  /**
   * This is the private implementation of {@link #startAutoRefresh}. Use this
   * within the library.
   */
  async _startAutoRefresh() {
    await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
    const e = setInterval(() => this._autoRefreshTokenTick(), Re);
    this.autoRefreshTicker = e, e && typeof e == "object" && typeof e.unref == "function" ? e.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(e), setTimeout(async () => {
      await this.initializePromise, await this._autoRefreshTokenTick();
    }, 0);
  }
  /**
   * This is the private implementation of {@link #stopAutoRefresh}. Use this
   * within the library.
   */
  async _stopAutoRefresh() {
    this._debug("#_stopAutoRefresh()");
    const e = this.autoRefreshTicker;
    this.autoRefreshTicker = null, e && clearInterval(e);
  }
  /**
   * Starts an auto-refresh process in the background. The session is checked
   * every few seconds. Close to the time of expiration a process is started to
   * refresh the session. If refreshing fails it will be retried for as long as
   * necessary.
   *
   * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
   * to call this function, it will be called for you.
   *
   * On browsers the refresh process works only when the tab/window is in the
   * foreground to conserve resources as well as prevent race conditions and
   * flooding auth with requests. If you call this method any managed
   * visibility change callback will be removed and you must manage visibility
   * changes on your own.
   *
   * On non-browser platforms the refresh process works *continuously* in the
   * background, which may not be desirable. You should hook into your
   * platform's foreground indication mechanism and call these methods
   * appropriately to conserve resources.
   *
   * {@see #stopAutoRefresh}
   */
  async startAutoRefresh() {
    this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
  }
  /**
   * Stops an active auto refresh process running in the background (if any).
   *
   * If you call this method any managed visibility change callback will be
   * removed and you must manage visibility changes on your own.
   *
   * See {@link #startAutoRefresh} for more details.
   */
  async stopAutoRefresh() {
    this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
  }
  /**
   * Runs the auto refresh token tick.
   */
  async _autoRefreshTokenTick() {
    this._debug("#_autoRefreshTokenTick()", "begin");
    try {
      await this._acquireLock(0, async () => {
        try {
          const e = Date.now();
          try {
            return await this._useSession(async (t) => {
              const { data: { session: s } } = t;
              if (!s || !s.refresh_token || !s.expires_at) {
                this._debug("#_autoRefreshTokenTick()", "no session");
                return;
              }
              const n = Math.floor((s.expires_at * 1e3 - e) / Re);
              this._debug("#_autoRefreshTokenTick()", `access token expires in ${n} ticks, a tick lasts ${Re}ms, refresh threshold is ${Qt} ticks`), n <= Qt && await this._callRefreshToken(s.refresh_token);
            });
          } catch (t) {
            console.error("Auto refresh tick failed with error. This is likely a transient error.", t);
          }
        } finally {
          this._debug("#_autoRefreshTokenTick()", "end");
        }
      });
    } catch (e) {
      if (e.isAcquireTimeout || e instanceof _r)
        this._debug("auto refresh token tick lock not available");
      else
        throw e;
    }
  }
  /**
   * Registers callbacks on the browser / platform, which in-turn run
   * algorithms when the browser window/tab are in foreground. On non-browser
   * platforms it assumes always foreground.
   */
  async _handleVisibilityChange() {
    if (this._debug("#_handleVisibilityChange()"), !se() || !(window != null && window.addEventListener))
      return this.autoRefreshToken && this.startAutoRefresh(), !1;
    try {
      this.visibilityChangedCallback = async () => await this._onVisibilityChanged(!1), window == null || window.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(!0);
    } catch (e) {
      console.error("_handleVisibilityChange", e);
    }
  }
  /**
   * Callback registered with `window.addEventListener('visibilitychange')`.
   */
  async _onVisibilityChanged(e) {
    const t = `#_onVisibilityChanged(${e})`;
    this._debug(t, "visibilityState", document.visibilityState), document.visibilityState === "visible" ? (this.autoRefreshToken && this._startAutoRefresh(), e || (await this.initializePromise, await this._acquireLock(-1, async () => {
      if (document.visibilityState !== "visible") {
        this._debug(t, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
        return;
      }
      await this._recoverAndRefresh();
    }))) : document.visibilityState === "hidden" && this.autoRefreshToken && this._stopAutoRefresh();
  }
  /**
   * Generates the relevant login URL for a third-party provider.
   * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
   * @param options.scopes A space-separated list of scopes granted to the OAuth application.
   * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
   */
  async _getUrlForProvider(e, t, s) {
    const n = [`provider=${encodeURIComponent(t)}`];
    if (s != null && s.redirectTo && n.push(`redirect_to=${encodeURIComponent(s.redirectTo)}`), s != null && s.scopes && n.push(`scopes=${encodeURIComponent(s.scopes)}`), this.flowType === "pkce") {
      const [i, a] = await xe(this.storage, this.storageKey), o = new URLSearchParams({
        code_challenge: `${encodeURIComponent(i)}`,
        code_challenge_method: `${encodeURIComponent(a)}`
      });
      n.push(o.toString());
    }
    if (s != null && s.queryParams) {
      const i = new URLSearchParams(s.queryParams);
      n.push(i.toString());
    }
    return s != null && s.skipBrowserRedirect && n.push(`skip_http_redirect=${s.skipBrowserRedirect}`), `${e}?${n.join("&")}`;
  }
  async _unenroll(e) {
    try {
      return await this._useSession(async (t) => {
        var s;
        const { data: n, error: i } = t;
        return i ? { data: null, error: i } : await L(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, {
          headers: this.headers,
          jwt: (s = n == null ? void 0 : n.session) === null || s === void 0 ? void 0 : s.access_token
        });
      });
    } catch (t) {
      if (P(t))
        return { data: null, error: t };
      throw t;
    }
  }
  async _enroll(e) {
    try {
      return await this._useSession(async (t) => {
        var s, n;
        const { data: i, error: a } = t;
        if (a)
          return { data: null, error: a };
        const o = Object.assign({ friendly_name: e.friendlyName, factor_type: e.factorType }, e.factorType === "phone" ? { phone: e.phone } : { issuer: e.issuer }), { data: l, error: c } = await L(this.fetch, "POST", `${this.url}/factors`, {
          body: o,
          headers: this.headers,
          jwt: (s = i == null ? void 0 : i.session) === null || s === void 0 ? void 0 : s.access_token
        });
        return c ? { data: null, error: c } : (e.factorType === "totp" && (!((n = l == null ? void 0 : l.totp) === null || n === void 0) && n.qr_code) && (l.totp.qr_code = `data:image/svg+xml;utf-8,${l.totp.qr_code}`), { data: l, error: null });
      });
    } catch (t) {
      if (P(t))
        return { data: null, error: t };
      throw t;
    }
  }
  /**
   * {@see GoTrueMFAApi#verify}
   */
  async _verify(e) {
    return this._acquireLock(-1, async () => {
      try {
        return await this._useSession(async (t) => {
          var s;
          const { data: n, error: i } = t;
          if (i)
            return { data: null, error: i };
          const { data: a, error: o } = await L(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, {
            body: { code: e.code, challenge_id: e.challengeId },
            headers: this.headers,
            jwt: (s = n == null ? void 0 : n.session) === null || s === void 0 ? void 0 : s.access_token
          });
          return o ? { data: null, error: o } : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + a.expires_in }, a)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", a), { data: a, error: o });
        });
      } catch (t) {
        if (P(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
  /**
   * {@see GoTrueMFAApi#challenge}
   */
  async _challenge(e) {
    return this._acquireLock(-1, async () => {
      try {
        return await this._useSession(async (t) => {
          var s;
          const { data: n, error: i } = t;
          return i ? { data: null, error: i } : await L(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, {
            body: { channel: e.channel },
            headers: this.headers,
            jwt: (s = n == null ? void 0 : n.session) === null || s === void 0 ? void 0 : s.access_token
          });
        });
      } catch (t) {
        if (P(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
  /**
   * {@see GoTrueMFAApi#challengeAndVerify}
   */
  async _challengeAndVerify(e) {
    const { data: t, error: s } = await this._challenge({
      factorId: e.factorId
    });
    return s ? { data: null, error: s } : await this._verify({
      factorId: e.factorId,
      challengeId: t.id,
      code: e.code
    });
  }
  /**
   * {@see GoTrueMFAApi#listFactors}
   */
  async _listFactors() {
    const { data: { user: e }, error: t } = await this.getUser();
    if (t)
      return { data: null, error: t };
    const s = (e == null ? void 0 : e.factors) || [], n = s.filter((a) => a.factor_type === "totp" && a.status === "verified"), i = s.filter((a) => a.factor_type === "phone" && a.status === "verified");
    return {
      data: {
        all: s,
        totp: n,
        phone: i
      },
      error: null
    };
  }
  /**
   * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
   */
  async _getAuthenticatorAssuranceLevel() {
    return this._acquireLock(-1, async () => await this._useSession(async (e) => {
      var t, s;
      const { data: { session: n }, error: i } = e;
      if (i)
        return { data: null, error: i };
      if (!n)
        return {
          data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
          error: null
        };
      const { payload: a } = Rt(n.access_token);
      let o = null;
      a.aal && (o = a.aal);
      let l = o;
      ((s = (t = n.user.factors) === null || t === void 0 ? void 0 : t.filter((d) => d.status === "verified")) !== null && s !== void 0 ? s : []).length > 0 && (l = "aal2");
      const u = a.amr || [];
      return { data: { currentLevel: o, nextLevel: l, currentAuthenticationMethods: u }, error: null };
    }));
  }
  async fetchJwk(e, t = { keys: [] }) {
    let s = t.keys.find((o) => o.kid === e);
    if (s)
      return s;
    const n = Date.now();
    if (s = this.jwks.keys.find((o) => o.kid === e), s && this.jwks_cached_at + Qi > n)
      return s;
    const { data: i, error: a } = await L(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
      headers: this.headers
    });
    if (a)
      throw a;
    return !i.keys || i.keys.length === 0 || (this.jwks = i, this.jwks_cached_at = n, s = i.keys.find((o) => o.kid === e), !s) ? null : s;
  }
  /**
   * Extracts the JWT claims present in the access token by first verifying the
   * JWT against the server's JSON Web Key Set endpoint
   * `/.well-known/jwks.json` which is often cached, resulting in significantly
   * faster responses. Prefer this method over {@link #getUser} which always
   * sends a request to the Auth server for each JWT.
   *
   * If the project is not using an asymmetric JWT signing key (like ECC or
   * RSA) it always sends a request to the Auth server (similar to {@link
   * #getUser}) to verify the JWT.
   *
   * @param jwt An optional specific JWT you wish to verify, not the one you
   *            can obtain from {@link #getSession}.
   * @param options Various additional options that allow you to customize the
   *                behavior of this method.
   */
  async getClaims(e, t = {}) {
    try {
      let s = e;
      if (!s) {
        const { data: p, error: g } = await this.getSession();
        if (g || !p.session)
          return { data: null, error: g };
        s = p.session.access_token;
      }
      const { header: n, payload: i, signature: a, raw: { header: o, payload: l } } = Rt(s);
      t != null && t.allowExpired || wa(i.exp);
      const c = !n.alg || n.alg.startsWith("HS") || !n.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(n.kid, t != null && t.keys ? { keys: t.keys } : t == null ? void 0 : t.jwks);
      if (!c) {
        const { error: p } = await this.getUser(s);
        if (p)
          throw p;
        return {
          data: {
            claims: i,
            header: n,
            signature: a
          },
          error: null
        };
      }
      const u = ka(n.alg), d = await crypto.subtle.importKey("jwk", c, u, !0, [
        "verify"
      ]);
      if (!await crypto.subtle.verify(u, d, a, oa(`${o}.${l}`)))
        throw new es("Invalid JWT signature");
      return {
        data: {
          claims: i,
          header: n,
          signature: a
        },
        error: null
      };
    } catch (s) {
      if (P(s))
        return { data: null, error: s };
      throw s;
    }
  }
}
Qe.nextInstanceID = 0;
const Da = Qe;
class Ma extends Da {
  constructor(e) {
    super(e);
  }
}
var Ba = function(r, e, t, s) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(s.next(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      try {
        c(s.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((s = s.apply(r, e || [])).next());
  });
};
class Fa {
  /**
   * Create a new client for use in the browser.
   * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
   * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
   * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
   * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
   * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
   * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
   * @param options.realtime Options passed along to realtime-js constructor.
   * @param options.storage Options passed along to the storage-js constructor.
   * @param options.global.fetch A custom fetch implementation.
   * @param options.global.headers Any additional headers to send with each network request.
   */
  constructor(e, t, s) {
    var n, i, a;
    if (this.supabaseUrl = e, this.supabaseKey = t, !e)
      throw new Error("supabaseUrl is required.");
    if (!t)
      throw new Error("supabaseKey is required.");
    const o = Vi(e), l = new URL(o);
    this.realtimeUrl = new URL("realtime/v1", l), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", l), this.storageUrl = new URL("storage/v1", l), this.functionsUrl = new URL("functions/v1", l);
    const c = `sb-${l.hostname.split(".")[0]}-auth-token`, u = {
      db: Ui,
      realtime: Mi,
      auth: Object.assign(Object.assign({}, Di), { storageKey: c }),
      global: Li
    }, d = Zi(s ?? {}, u);
    this.storageKey = (n = d.auth.storageKey) !== null && n !== void 0 ? n : "", this.headers = (i = d.global.headers) !== null && i !== void 0 ? i : {}, d.accessToken ? (this.accessToken = d.accessToken, this.auth = new Proxy({}, {
      get: (f, p) => {
        throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(p)} is not possible`);
      }
    })) : this.auth = this._initSupabaseAuthClient((a = d.auth) !== null && a !== void 0 ? a : {}, this.headers, d.global.fetch), this.fetch = zi(t, this._getAccessToken.bind(this), d.global.fetch), this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, d.realtime)), this.rest = new ri(new URL("rest/v1", l).href, {
      headers: this.headers,
      schema: d.db.schema,
      fetch: this.fetch
    }), this.storage = new Pi(this.storageUrl.href, this.headers, this.fetch, s == null ? void 0 : s.storage), d.accessToken || this._listenForAuthEvents();
  }
  /**
   * Supabase Functions allows you to deploy and invoke edge functions.
   */
  get functions() {
    return new In(this.functionsUrl.href, {
      headers: this.headers,
      customFetch: this.fetch
    });
  }
  /**
   * Perform a query on a table or a view.
   *
   * @param relation - The table or view name to query
   */
  from(e) {
    return this.rest.from(e);
  }
  // NOTE: signatures must be kept in sync with PostgrestClient.schema
  /**
   * Select a schema to query or perform an function (rpc) call.
   *
   * The schema needs to be on the list of exposed schemas inside Supabase.
   *
   * @param schema - The schema to query
   */
  schema(e) {
    return this.rest.schema(e);
  }
  // NOTE: signatures must be kept in sync with PostgrestClient.rpc
  /**
   * Perform a function call.
   *
   * @param fn - The function name to call
   * @param args - The arguments to pass to the function call
   * @param options - Named parameters
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   * @param options.get - When set to `true`, the function will be called with
   * read-only access mode.
   * @param options.count - Count algorithm to use to count rows returned by the
   * function. Only applicable for [set-returning
   * functions](https://www.postgresql.org/docs/current/functions-srf.html).
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  rpc(e, t = {}, s = {}) {
    return this.rest.rpc(e, t, s);
  }
  /**
   * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
   *
   * @param {string} name - The name of the Realtime channel.
   * @param {Object} opts - The options to pass to the Realtime channel.
   *
   */
  channel(e, t = { config: {} }) {
    return this.realtime.channel(e, t);
  }
  /**
   * Returns all Realtime channels.
   */
  getChannels() {
    return this.realtime.getChannels();
  }
  /**
   * Unsubscribes and removes Realtime channel from Realtime client.
   *
   * @param {RealtimeChannel} channel - The name of the Realtime channel.
   *
   */
  removeChannel(e) {
    return this.realtime.removeChannel(e);
  }
  /**
   * Unsubscribes and removes all Realtime channels from Realtime client.
   */
  removeAllChannels() {
    return this.realtime.removeAllChannels();
  }
  _getAccessToken() {
    var e, t;
    return Ba(this, void 0, void 0, function* () {
      if (this.accessToken)
        return yield this.accessToken();
      const { data: s } = yield this.auth.getSession();
      return (t = (e = s.session) === null || e === void 0 ? void 0 : e.access_token) !== null && t !== void 0 ? t : this.supabaseKey;
    });
  }
  _initSupabaseAuthClient({ autoRefreshToken: e, persistSession: t, detectSessionInUrl: s, storage: n, storageKey: i, flowType: a, lock: o, debug: l }, c, u) {
    const d = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`
    };
    return new Ma({
      url: this.authUrl.href,
      headers: Object.assign(Object.assign({}, d), c),
      storageKey: i,
      autoRefreshToken: e,
      persistSession: t,
      detectSessionInUrl: s,
      storage: n,
      flowType: a,
      lock: o,
      debug: l,
      fetch: u,
      // auth checks if there is a custom authorizaiton header using this flag
      // so it knows whether to return an error when getUser is called with no session
      hasCustomAuthorizationHeader: "Authorization" in this.headers
    });
  }
  _initRealtimeClient(e) {
    return new bi(this.realtimeUrl.href, Object.assign(Object.assign({}, e), { params: Object.assign({ apikey: this.supabaseKey }, e == null ? void 0 : e.params) }));
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((t, s) => {
      this._handleTokenChanged(t, "CLIENT", s == null ? void 0 : s.access_token);
    });
  }
  _handleTokenChanged(e, t, s) {
    (e === "TOKEN_REFRESHED" || e === "SIGNED_IN") && this.changedAccessToken !== s ? this.changedAccessToken = s : e === "SIGNED_OUT" && (this.realtime.setAuth(), t == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
  }
}
const qa = (r, e, t) => new Fa(r, e, t);
function za() {
  if (typeof window < "u" || typeof process > "u")
    return !1;
  const r = process.version;
  if (r == null)
    return !1;
  const e = r.match(/^v(\d+)\./);
  return e ? parseInt(e[1], 10) <= 18 : !1;
}
za() && console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");
function Oe(r) {
  var s;
  if (typeof process < "u" && typeof process.env < "u" && Object.prototype.hasOwnProperty.call(process.env, r))
    return process.env[r];
  const e = (s = globalThis.import) == null ? void 0 : s.meta, t = (e == null ? void 0 : e.env) ?? globalThis.__env__;
  if (t && Object.prototype.hasOwnProperty.call(t, r)) {
    const n = t[r];
    return typeof n == "string" ? n : n != null ? String(n) : void 0;
  }
}
function Wa(r, e = !0) {
  if (r == null || r === "")
    return e;
  if (typeof r == "boolean")
    return r;
  const t = String(r).toLowerCase().trim();
  return ["1", "true", "yes", "on", "enabled"].includes(t) ? !0 : ["0", "false", "no", "off", "disabled"].includes(t) ? !1 : e;
}
function br() {
  const r = Oe("NEXT_PUBLIC_SUPABASE_URL") || Oe("VITE_SUPABASE_URL") || "", e = Oe("NEXT_PUBLIC_SUPABASE_ANON_KEY") || Oe("VITE_SUPABASE_ANON_KEY") || "", t = Oe("NEXT_PUBLIC_FEATURE_SUPABASE") ?? Oe("VITE_FEATURE_SUPABASE"), s = Wa(t, !0), n = !!(r && e);
  return { url: r, anonKey: e, flagRaw: t, enabledByFlag: s, hasEnv: n, enabled: s && n };
}
function Va() {
  return br().enabled;
}
function wr() {
  return Va();
}
const { url: Za, anonKey: Ka, enabledByFlag: Ha, hasEnv: Ga, enabled: kr } = br();
let zs = !1;
const Ja = process.env.NODE_ENV === "test", Qa = process.env.NODE_ENV === "production", Ya = process.env.CI === "true";
!kr && Ha && !Ga && !Qa && !Ja && !Ya && !zs && (console.warn("[supabase] URL/key missing; storage features are disabled."), zs = !0);
kr && qa(Za, Ka);
var Ws;
(function(r) {
  r.INVALID_JSON = "INVALID_JSON", r.INVALID_SCHEMA = "INVALID_SCHEMA", r.CORRUPTED_DATA = "CORRUPTED_DATA", r.VERSION_INCOMPATIBLE = "VERSION_INCOMPATIBLE", r.FILE_TOO_LARGE = "FILE_TOO_LARGE", r.MISSING_REQUIRED_FIELDS = "MISSING_REQUIRED_FIELDS", r.INVALID_NODE_DATA = "INVALID_NODE_DATA", r.INVALID_EDGE_DATA = "INVALID_EDGE_DATA", r.SECURITY_VIOLATION = "SECURITY_VIOLATION";
})(Ws || (Ws = {}));
const Xa = K({
  id: $(),
  type: $(),
  label: $().optional(),
  data: pt(Je()).optional()
}), eo = K({
  id: $(),
  source: $(),
  target: $(),
  label: $().optional(),
  data: pt(Je()).optional()
}), to = K({
  nodes: Y(Xa),
  edges: Y(eo),
  layout: pt(Je()).optional(),
  settings: pt(Je()).optional()
});
K({
  version: $(),
  kind: rn("graph"),
  meta: K({
    id: $(),
    name: $(),
    description: $().optional(),
    tags: Y($()).optional(),
    createdAt: $(),
    updatedAt: $(),
    author: K({ id: $().optional(), name: $().optional() }).optional()
  }),
  graph: to,
  extras: K({
    previewUrl: $().url().optional(),
    thumbSeed: $().optional()
  }).catchall(Je()).optional()
});
var so = { exports: {} };
(function(r) {
  var e = function() {
    var t = String.fromCharCode, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", i = {};
    function a(l, c) {
      if (!i[l]) {
        i[l] = {};
        for (var u = 0; u < l.length; u++)
          i[l][l.charAt(u)] = u;
      }
      return i[l][c];
    }
    var o = {
      compressToBase64: function(l) {
        if (l == null) return "";
        var c = o._compress(l, 6, function(u) {
          return s.charAt(u);
        });
        switch (c.length % 4) {
          // To produce valid Base64
          default:
          // When could this happen ?
          case 0:
            return c;
          case 1:
            return c + "===";
          case 2:
            return c + "==";
          case 3:
            return c + "=";
        }
      },
      decompressFromBase64: function(l) {
        return l == null ? "" : l == "" ? null : o._decompress(l.length, 32, function(c) {
          return a(s, l.charAt(c));
        });
      },
      compressToUTF16: function(l) {
        return l == null ? "" : o._compress(l, 15, function(c) {
          return t(c + 32);
        }) + " ";
      },
      decompressFromUTF16: function(l) {
        return l == null ? "" : l == "" ? null : o._decompress(l.length, 16384, function(c) {
          return l.charCodeAt(c) - 32;
        });
      },
      //compress into uint8array (UCS-2 big endian format)
      compressToUint8Array: function(l) {
        for (var c = o.compress(l), u = new Uint8Array(c.length * 2), d = 0, f = c.length; d < f; d++) {
          var p = c.charCodeAt(d);
          u[d * 2] = p >>> 8, u[d * 2 + 1] = p % 256;
        }
        return u;
      },
      //decompress from uint8array (UCS-2 big endian format)
      decompressFromUint8Array: function(l) {
        if (l == null)
          return o.decompress(l);
        for (var c = new Array(l.length / 2), u = 0, d = c.length; u < d; u++)
          c[u] = l[u * 2] * 256 + l[u * 2 + 1];
        var f = [];
        return c.forEach(function(p) {
          f.push(t(p));
        }), o.decompress(f.join(""));
      },
      //compress into a string that is already URI encoded
      compressToEncodedURIComponent: function(l) {
        return l == null ? "" : o._compress(l, 6, function(c) {
          return n.charAt(c);
        });
      },
      //decompress from an output of compressToEncodedURIComponent
      decompressFromEncodedURIComponent: function(l) {
        return l == null ? "" : l == "" ? null : (l = l.replace(/ /g, "+"), o._decompress(l.length, 32, function(c) {
          return a(n, l.charAt(c));
        }));
      },
      compress: function(l) {
        return o._compress(l, 16, function(c) {
          return t(c);
        });
      },
      _compress: function(l, c, u) {
        if (l == null) return "";
        var d, f, p = {}, g = {}, w = "", S = "", b = "", C = 2, y = 3, k = 2, j = [], m = 0, v = 0, x;
        for (x = 0; x < l.length; x += 1)
          if (w = l.charAt(x), Object.prototype.hasOwnProperty.call(p, w) || (p[w] = y++, g[w] = !0), S = b + w, Object.prototype.hasOwnProperty.call(p, S))
            b = S;
          else {
            if (Object.prototype.hasOwnProperty.call(g, b)) {
              if (b.charCodeAt(0) < 256) {
                for (d = 0; d < k; d++)
                  m = m << 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++;
                for (f = b.charCodeAt(0), d = 0; d < 8; d++)
                  m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
              } else {
                for (f = 1, d = 0; d < k; d++)
                  m = m << 1 | f, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = 0;
                for (f = b.charCodeAt(0), d = 0; d < 16; d++)
                  m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
              }
              C--, C == 0 && (C = Math.pow(2, k), k++), delete g[b];
            } else
              for (f = p[b], d = 0; d < k; d++)
                m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
            C--, C == 0 && (C = Math.pow(2, k), k++), p[S] = y++, b = String(w);
          }
        if (b !== "") {
          if (Object.prototype.hasOwnProperty.call(g, b)) {
            if (b.charCodeAt(0) < 256) {
              for (d = 0; d < k; d++)
                m = m << 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++;
              for (f = b.charCodeAt(0), d = 0; d < 8; d++)
                m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
            } else {
              for (f = 1, d = 0; d < k; d++)
                m = m << 1 | f, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = 0;
              for (f = b.charCodeAt(0), d = 0; d < 16; d++)
                m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
            }
            C--, C == 0 && (C = Math.pow(2, k), k++), delete g[b];
          } else
            for (f = p[b], d = 0; d < k; d++)
              m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
          C--, C == 0 && (C = Math.pow(2, k), k++);
        }
        for (f = 2, d = 0; d < k; d++)
          m = m << 1 | f & 1, v == c - 1 ? (v = 0, j.push(u(m)), m = 0) : v++, f = f >> 1;
        for (; ; )
          if (m = m << 1, v == c - 1) {
            j.push(u(m));
            break;
          } else v++;
        return j.join("");
      },
      decompress: function(l) {
        return l == null ? "" : l == "" ? null : o._decompress(l.length, 32768, function(c) {
          return l.charCodeAt(c);
        });
      },
      _decompress: function(l, c, u) {
        var d = [], f = 4, p = 4, g = 3, w = "", S = [], b, C, y, k, j, m, v, x = { val: u(0), position: c, index: 1 };
        for (b = 0; b < 3; b += 1)
          d[b] = b;
        for (y = 0, j = Math.pow(2, 2), m = 1; m != j; )
          k = x.val & x.position, x.position >>= 1, x.position == 0 && (x.position = c, x.val = u(x.index++)), y |= (k > 0 ? 1 : 0) * m, m <<= 1;
        switch (y) {
          case 0:
            for (y = 0, j = Math.pow(2, 8), m = 1; m != j; )
              k = x.val & x.position, x.position >>= 1, x.position == 0 && (x.position = c, x.val = u(x.index++)), y |= (k > 0 ? 1 : 0) * m, m <<= 1;
            v = t(y);
            break;
          case 1:
            for (y = 0, j = Math.pow(2, 16), m = 1; m != j; )
              k = x.val & x.position, x.position >>= 1, x.position == 0 && (x.position = c, x.val = u(x.index++)), y |= (k > 0 ? 1 : 0) * m, m <<= 1;
            v = t(y);
            break;
          case 2:
            return "";
        }
        for (d[3] = v, C = v, S.push(v); ; ) {
          if (x.index > l)
            return "";
          for (y = 0, j = Math.pow(2, g), m = 1; m != j; )
            k = x.val & x.position, x.position >>= 1, x.position == 0 && (x.position = c, x.val = u(x.index++)), y |= (k > 0 ? 1 : 0) * m, m <<= 1;
          switch (v = y) {
            case 0:
              for (y = 0, j = Math.pow(2, 8), m = 1; m != j; )
                k = x.val & x.position, x.position >>= 1, x.position == 0 && (x.position = c, x.val = u(x.index++)), y |= (k > 0 ? 1 : 0) * m, m <<= 1;
              d[p++] = t(y), v = p - 1, f--;
              break;
            case 1:
              for (y = 0, j = Math.pow(2, 16), m = 1; m != j; )
                k = x.val & x.position, x.position >>= 1, x.position == 0 && (x.position = c, x.val = u(x.index++)), y |= (k > 0 ? 1 : 0) * m, m <<= 1;
              d[p++] = t(y), v = p - 1, f--;
              break;
            case 2:
              return S.join("");
          }
          if (f == 0 && (f = Math.pow(2, g), g++), d[v])
            w = d[v];
          else if (v === p)
            w = C + C.charAt(0);
          else
            return null;
          S.push(w), d[p++] = C + w.charAt(0), f--, C = w, f == 0 && (f = Math.pow(2, g), g++);
        }
      }
    };
    return o;
  }();
  r != null ? r.exports = e : typeof angular < "u" && angular != null && angular.module("LZString", []).factory("LZString", function() {
    return e;
  });
})(so);
K({
  nodes: Y(Es()),
  // Using any for now, could be more specific
  edges: Y(Es()),
  viewport: K({
    x: at(),
    y: at(),
    zoom: at()
  }).optional(),
  lastModified: $().optional()
});
const Vs = "psg.devUserId";
function ro() {
  const r = (process.env.NEXT_PUBLIC_FEATURE_DEV_USER || process.env.VITE_FEATURE_DEV_USER || "").toLowerCase();
  return r === "1" || r === "true";
}
const Er = h.createContext({ userId: null });
function Ao({ children: r, supabase: e }) {
  const [t, s] = h.useState(null);
  h.useEffect(() => {
    let i;
    async function a() {
      var o, l;
      if (ro() && typeof window < "u")
        try {
          let c = window.localStorage.getItem(Vs);
          c || (c = `dev-${Math.random().toString(36).slice(2, 10)}`, window.localStorage.setItem(Vs, c)), s(c);
          return;
        } catch {
        }
      if (e && e.auth)
        try {
          const { data: c } = await e.auth.getSession(), u = ((l = (o = c.session) == null ? void 0 : o.user) == null ? void 0 : l.id) ?? null;
          if (s(u), typeof e.auth.onAuthStateChange == "function") {
            const d = e.auth.onAuthStateChange((f, p) => {
              var g;
              s(((g = p == null ? void 0 : p.user) == null ? void 0 : g.id) ?? null);
            });
            d && d.data && d.data.subscription && typeof d.data.subscription.unsubscribe == "function" && (i = () => d.data.subscription.unsubscribe());
          }
          return;
        } catch {
          s(null);
          return;
        }
      s(null);
    }
    return a(), () => {
      i && i();
    };
  }, [e]);
  const n = h.useMemo(() => ({ userId: t }), [t]);
  return /* @__PURE__ */ h.createElement(Er.Provider, { value: n }, r);
}
function Sr() {
  return h.useContext(Er);
}
async function no(r) {
  const e = await fetch(r);
  if (!e.ok) throw new Error(`Failed to download graph (${e.status})`);
  return e.json();
}
function xr() {
  return /* @__PURE__ */ h.createElement("span", { "aria-label": "loading", role: "status" }, "Loading…");
}
function Co({ isOpen: r, onClose: e, onOpenGraph: t, userId: s, enableSupabase: n, supabaseList: i, supabaseGet: a }) {
  const [o, l] = h.useState("server"), { userId: c } = Sr(), u = s ?? c ?? null, d = n ?? wr(), f = !!u && !!i && !!a && d;
  return r ? /* @__PURE__ */ h.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": "Open Graph", style: nt.backdrop }, /* @__PURE__ */ h.createElement("div", { style: nt.dialog }, /* @__PURE__ */ h.createElement("header", { style: nt.header }, /* @__PURE__ */ h.createElement("h2", { style: { margin: 0 } }, "Open"), /* @__PURE__ */ h.createElement("button", { type: "button", onClick: e, "aria-label": "Close Open Dialog" }, "✕")), /* @__PURE__ */ h.createElement("nav", { "aria-label": "Open Tabs", style: nt.tabs }, /* @__PURE__ */ h.createElement("button", { type: "button", "aria-selected": o === "server", onClick: () => l("server") }, "Server"), f && /* @__PURE__ */ h.createElement("button", { type: "button", "aria-selected": o === "supabase", onClick: () => l("supabase") }, "Supabase"), /* @__PURE__ */ h.createElement("button", { type: "button", "aria-selected": o === "local", onClick: () => l("local") }, "Local")), /* @__PURE__ */ h.createElement("section", { style: { padding: 12 } }, o === "server" ? /* @__PURE__ */ h.createElement(ao, { onOpenGraph: t }) : o === "local" ? /* @__PURE__ */ h.createElement(oo, { onOpenGraph: t }) : (
    // tab === 'supabase'
    f ? /* @__PURE__ */ h.createElement(
      io,
      {
        userId: u,
        onOpenGraph: t,
        listFn: i,
        getFn: a
      }
    ) : null
  )))) : null;
}
function io({ userId: r, onOpenGraph: e, listFn: t, getFn: s }) {
  const [n, i] = h.useState("idle"), [a, o] = h.useState(null), [l, c] = h.useState([]), [u, d] = h.useState(null), [f, p] = h.useState(0), g = h.useCallback(async () => {
    i("loading"), o(null);
    const b = await t(r);
    if (!b.ok) {
      o(b.error.message || "Failed to list graphs"), i("error");
      return;
    }
    c(b.data), p(0), i("done");
  }, [r, t]);
  h.useEffect(() => {
    g();
  }, [g]);
  async function w(b) {
    d(b);
    const C = await s(r, b);
    if (!C.ok) {
      o(C.error.message || "Failed to open graph"), d(null);
      return;
    }
    try {
      const y = JSON.parse(C.data);
      e(y);
    } catch {
      o("Invalid graph JSON");
    } finally {
      d(null);
    }
  }
  function S(b) {
    if (l.length !== 0) {
      if (b.key === "ArrowDown")
        b.preventDefault(), p((C) => Math.min(C + 1, l.length - 1));
      else if (b.key === "ArrowUp")
        b.preventDefault(), p((C) => Math.max(C - 1, 0));
      else if (b.key === "Enter") {
        b.preventDefault();
        const C = l[f];
        C && w(C.name);
      }
    }
  }
  return /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: g, disabled: n === "loading" }, n === "loading" ? "Loading…" : "Retry"), n === "loading" && /* @__PURE__ */ h.createElement(xr, null)), a && /* @__PURE__ */ h.createElement(yt, { message: a, onRetry: g }), n === "done" && l.length === 0 && /* @__PURE__ */ h.createElement(ns, { message: "No Supabase graphs available." }), n === "done" && l.length > 0 && /* @__PURE__ */ h.createElement(
    "ul",
    {
      "aria-label": "Supabase Graphs",
      role: "listbox",
      tabIndex: 0,
      onKeyDown: S,
      style: { marginTop: 8, outline: "none" }
    },
    l.map((b, C) => /* @__PURE__ */ h.createElement(
      "li",
      {
        key: b.name,
        role: "option",
        "aria-selected": f === C,
        style: { background: f === C ? "#eef" : void 0, padding: 6, borderRadius: 4 },
        onMouseEnter: () => p(C)
      },
      /* @__PURE__ */ h.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ h.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ h.createElement("strong", null, b.name)), /* @__PURE__ */ h.createElement("button", { type: "button", onClick: () => w(b.name), disabled: !!u }, u === b.name ? "Opening…" : "Open"))
    ))
  ));
}
function ao({ onOpenGraph: r }) {
  const [e, t] = h.useState("idle"), [s, n] = h.useState(null), [i, a] = h.useState([]), [o, l] = h.useState(null), [c, u] = h.useState(0), d = h.useCallback(async () => {
    t("loading"), n(null);
    try {
      const g = await zt("");
      a(g), t("done"), u(0);
    } catch (g) {
      const w = g instanceof Error ? g.message : "Failed to load graph manifest";
      /404/.test(String(w)) ? (a([]), t("done")) : (n(w), t("error"));
    }
  }, []);
  h.useEffect(() => {
    d();
  }, [d]);
  async function f(g) {
    l(g);
    try {
      const w = await no(`/graphs/${g}`);
      r(w);
    } catch (w) {
      const S = w instanceof Error ? w.message : "Failed to open graph";
      n(S);
    } finally {
      l(null);
    }
  }
  function p(g) {
    if (i.length !== 0) {
      if (g.key === "ArrowDown")
        g.preventDefault(), u((w) => Math.min(w + 1, i.length - 1));
      else if (g.key === "ArrowUp")
        g.preventDefault(), u((w) => Math.max(w - 1, 0));
      else if (g.key === "Enter") {
        g.preventDefault();
        const w = i[c];
        w && f(w.filename);
      }
    }
  }
  return /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: d, disabled: e === "loading" }, e === "loading" ? "Loading…" : "Retry"), e === "loading" && /* @__PURE__ */ h.createElement(xr, null)), s && /* @__PURE__ */ h.createElement(yt, { message: s, onRetry: d }), e === "done" && i.length === 0 && /* @__PURE__ */ h.createElement(ns, { message: "No server graphs available." }), e === "done" && i.length > 0 && /* @__PURE__ */ h.createElement(
    "ul",
    {
      "aria-label": "Server Graphs",
      role: "listbox",
      tabIndex: 0,
      onKeyDown: p,
      style: { marginTop: 8, outline: "none" }
    },
    i.map((g, w) => /* @__PURE__ */ h.createElement(
      "li",
      {
        key: g.filename,
        role: "option",
        "aria-selected": c === w,
        style: { background: c === w ? "#eef" : void 0, padding: 6, borderRadius: 4 },
        onMouseEnter: () => u(w)
      },
      /* @__PURE__ */ h.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ h.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ h.createElement("strong", null, g.title), /* @__PURE__ */ h.createElement("div", { style: { fontSize: 12, color: "#555" } }, g.filename, " • ", new Date(g.updatedAt).toLocaleString())), /* @__PURE__ */ h.createElement("button", { type: "button", onClick: () => f(g.filename), disabled: !!o }, o === g.filename ? "Opening…" : "Open"))
    ))
  ));
}
function oo({ onOpenGraph: r }) {
  const [e, t] = h.useState(null);
  function s(n) {
    var l;
    t(null);
    const i = (l = n.target.files) == null ? void 0 : l[0];
    if (!i) return;
    const a = i.name.toLowerCase(), o = new FileReader();
    o.onerror = () => t("Failed to read file"), o.onload = () => {
      try {
        const c = String(o.result || ""), u = JSON.parse(c);
        a.endsWith(".graph.json") || a.endsWith(".psg") ? r(u) : t("Unsupported file type");
      } catch {
        t("Invalid file");
      }
    }, o.readAsText(i);
  }
  return /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("label", null, /* @__PURE__ */ h.createElement("span", { style: { display: "block", marginBottom: 4 } }, "Choose a .psg or .graph.json file"), /* @__PURE__ */ h.createElement("input", { "aria-label": "Local Graph File", type: "file", accept: ".psg,.graph.json,application/json", onChange: s })), e && /* @__PURE__ */ h.createElement(yt, { message: e }));
}
const nt = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" },
  dialog: { background: "#fff", width: 560, maxWidth: "95vw", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" },
  header: { display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #eee" },
  tabs: { display: "flex", gap: 8, borderBottom: "1px solid #eee", padding: 8 }
};
function Zs() {
  return /* @__PURE__ */ h.createElement("span", { "aria-label": "saving", role: "status" }, "Saving…");
}
const $t = "graph";
function lo(r) {
  return r.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}
function co(r) {
  return r.toLowerCase().endsWith(".psg") ? r : `${r}.psg`;
}
function Oo({ isOpen: r, onClose: e, graph: t, onSaveBlob: s, enableSupabase: n, userId: i, supabasePut: a, onSupabaseSaved: o }) {
  const { userId: l } = Sr(), [c, u] = h.useState($t), [d, f] = h.useState(null), [p, g] = h.useState(!1), [w, S] = h.useState(!1);
  if (h.useEffect(() => {
    r && (u($t), f(null), g(!1), S(!1));
  }, [r]), !r) return null;
  const C = lo(c).slice(0, 64), y = co(C || $t), k = !!C && !C.startsWith(".") && !C.endsWith("."), j = i ?? l ?? null, v = !!((n ?? wr()) && j && a);
  async function x() {
    if (!k || !v) {
      f("Please enter a valid name");
      return;
    }
    S(!0), f(null);
    try {
      const M = JSON.stringify(t, null, 2), q = await a(j, y, M);
      q.ok ? (o == null || o(y, q.data.path), e()) : f(`Failed to upload: ${q.error.message}`);
    } catch (M) {
      const q = M instanceof Error ? M.message : "Upload failed";
      f(`Failed to upload: ${q}`);
    } finally {
      S(!1);
    }
  }
  function G(M) {
    u(M.target.value), f(null);
  }
  async function T() {
    if (!k) {
      f("Please enter a valid name");
      return;
    }
    g(!0);
    try {
      const M = JSON.stringify(t, null, 2), q = new Blob([M], { type: "application/json" });
      s == null || s(q, y);
      const te = URL.createObjectURL(q), Fe = document.createElement("a");
      Fe.href = te, Fe.download = y, document.body.appendChild(Fe), Fe.click(), Fe.remove(), URL.revokeObjectURL(te), e();
    } catch {
      f("Failed to save file");
    } finally {
      g(!1);
    }
  }
  return /* @__PURE__ */ h.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": "Save Graph", style: it.backdrop }, /* @__PURE__ */ h.createElement("div", { style: it.dialog }, /* @__PURE__ */ h.createElement("header", { style: it.header }, /* @__PURE__ */ h.createElement("h2", { style: { margin: 0 } }, "Save"), /* @__PURE__ */ h.createElement("button", { type: "button", onClick: e, "aria-label": "Close Save Dialog" }, "✕")), /* @__PURE__ */ h.createElement("section", { style: { padding: 12, display: "grid", gap: 8 } }, /* @__PURE__ */ h.createElement("label", { style: { display: "grid", gap: 4 } }, /* @__PURE__ */ h.createElement("span", null, "File name"), /* @__PURE__ */ h.createElement(
    "input",
    {
      "aria-label": "File name",
      type: "text",
      value: c,
      onChange: G,
      placeholder: "graph"
    }
  ), /* @__PURE__ */ h.createElement("div", { "aria-live": "polite", style: { fontSize: 12, color: "#555" } }, "Will save as: ", /* @__PURE__ */ h.createElement("code", null, y))), d && /* @__PURE__ */ h.createElement("div", { role: "alert", "aria-live": "assertive", style: { color: "#b00" } }, d)), /* @__PURE__ */ h.createElement("footer", { style: it.footer }, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: e }, "Cancel"), /* @__PURE__ */ h.createElement("button", { type: "button", disabled: !k || p, onClick: T }, p ? /* @__PURE__ */ h.createElement(Zs, null) : "Save"), v && /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      "aria-label": "Save to Supabase",
      disabled: w,
      onClick: x
    },
    w ? /* @__PURE__ */ h.createElement(Zs, null) : "Save to Supabase"
  ))));
}
const it = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" },
  dialog: { background: "#fff", width: 520, maxWidth: "95vw", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" },
  header: { display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #eee" },
  footer: { display: "flex", gap: 8, justifyContent: "flex-end", padding: 12, borderTop: "1px solid #eee" }
}, jo = Cn;
export {
  go as AssetBrowser,
  mo as AssetBrowserTabs,
  Co as OpenGraphDialog,
  Oo as SaveGraphDialog,
  En as ServerTab,
  Cn as TabbedAssetBrowser,
  Ao as UserProvider,
  jo as default,
  Sr as useUserId
};
//# sourceMappingURL=index.esm.js.map
