import i, { useEffect as X, useRef as ce, useState as $, useMemo as fe, createContext as Ut, useCallback as re } from "react";
import { create as ua } from "zustand";
import ma from "fuse.js";
import { FixedSizeGrid as Vt } from "react-window";
var j;
(function(a) {
  a.assertEqual = (n) => {
  };
  function e(n) {
  }
  a.assertIs = e;
  function t(n) {
    throw new Error();
  }
  a.assertNever = t, a.arrayToEnum = (n) => {
    const s = {};
    for (const o of n)
      s[o] = o;
    return s;
  }, a.getValidEnumValues = (n) => {
    const s = a.objectKeys(n).filter((l) => typeof n[n[l]] != "number"), o = {};
    for (const l of s)
      o[l] = n[l];
    return a.objectValues(o);
  }, a.objectValues = (n) => a.objectKeys(n).map(function(s) {
    return n[s];
  }), a.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const s = [];
    for (const o in n)
      Object.prototype.hasOwnProperty.call(n, o) && s.push(o);
    return s;
  }, a.find = (n, s) => {
    for (const o of n)
      if (s(o))
        return o;
  }, a.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function r(n, s = " | ") {
    return n.map((o) => typeof o == "string" ? `'${o}'` : o).join(s);
  }
  a.joinValues = r, a.jsonStringifyReplacer = (n, s) => typeof s == "bigint" ? s.toString() : s;
})(j || (j = {}));
var xt;
(function(a) {
  a.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(xt || (xt = {}));
const x = j.arrayToEnum([
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
]), ue = (a) => {
  switch (typeof a) {
    case "undefined":
      return x.undefined;
    case "string":
      return x.string;
    case "number":
      return Number.isNaN(a) ? x.nan : x.number;
    case "boolean":
      return x.boolean;
    case "function":
      return x.function;
    case "bigint":
      return x.bigint;
    case "symbol":
      return x.symbol;
    case "object":
      return Array.isArray(a) ? x.array : a === null ? x.null : a.then && typeof a.then == "function" && a.catch && typeof a.catch == "function" ? x.promise : typeof Map < "u" && a instanceof Map ? x.map : typeof Set < "u" && a instanceof Set ? x.set : typeof Date < "u" && a instanceof Date ? x.date : x.object;
    default:
      return x.unknown;
  }
}, p = j.arrayToEnum([
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
class de extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (r) => {
      this.issues = [...this.issues, r];
    }, this.addIssues = (r = []) => {
      this.issues = [...this.issues, ...r];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(s) {
      return s.message;
    }, r = { _errors: [] }, n = (s) => {
      for (const o of s.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(n);
        else if (o.code === "invalid_return_type")
          n(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          n(o.argumentsError);
        else if (o.path.length === 0)
          r._errors.push(t(o));
        else {
          let l = r, c = 0;
          for (; c < o.path.length; ) {
            const u = o.path[c];
            c === o.path.length - 1 ? (l[u] = l[u] || { _errors: [] }, l[u]._errors.push(t(o))) : l[u] = l[u] || { _errors: [] }, l = l[u], c++;
          }
        }
    };
    return n(this), r;
  }
  static assert(e) {
    if (!(e instanceof de))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, j.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, r = [];
    for (const n of this.issues)
      if (n.path.length > 0) {
        const s = n.path[0];
        t[s] = t[s] || [], t[s].push(e(n));
      } else
        r.push(e(n));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
de.create = (a) => new de(a);
const nt = (a, e) => {
  let t;
  switch (a.code) {
    case p.invalid_type:
      a.received === x.undefined ? t = "Required" : t = `Expected ${a.expected}, received ${a.received}`;
      break;
    case p.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(a.expected, j.jsonStringifyReplacer)}`;
      break;
    case p.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${j.joinValues(a.keys, ", ")}`;
      break;
    case p.invalid_union:
      t = "Invalid input";
      break;
    case p.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${j.joinValues(a.options)}`;
      break;
    case p.invalid_enum_value:
      t = `Invalid enum value. Expected ${j.joinValues(a.options)}, received '${a.received}'`;
      break;
    case p.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case p.invalid_return_type:
      t = "Invalid function return type";
      break;
    case p.invalid_date:
      t = "Invalid date";
      break;
    case p.invalid_string:
      typeof a.validation == "object" ? "includes" in a.validation ? (t = `Invalid input: must include "${a.validation.includes}"`, typeof a.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${a.validation.position}`)) : "startsWith" in a.validation ? t = `Invalid input: must start with "${a.validation.startsWith}"` : "endsWith" in a.validation ? t = `Invalid input: must end with "${a.validation.endsWith}"` : j.assertNever(a.validation) : a.validation !== "regex" ? t = `Invalid ${a.validation}` : t = "Invalid";
      break;
    case p.too_small:
      a.type === "array" ? t = `Array must contain ${a.exact ? "exactly" : a.inclusive ? "at least" : "more than"} ${a.minimum} element(s)` : a.type === "string" ? t = `String must contain ${a.exact ? "exactly" : a.inclusive ? "at least" : "over"} ${a.minimum} character(s)` : a.type === "number" ? t = `Number must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${a.minimum}` : a.type === "bigint" ? t = `Number must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${a.minimum}` : a.type === "date" ? t = `Date must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(a.minimum))}` : t = "Invalid input";
      break;
    case p.too_big:
      a.type === "array" ? t = `Array must contain ${a.exact ? "exactly" : a.inclusive ? "at most" : "less than"} ${a.maximum} element(s)` : a.type === "string" ? t = `String must contain ${a.exact ? "exactly" : a.inclusive ? "at most" : "under"} ${a.maximum} character(s)` : a.type === "number" ? t = `Number must be ${a.exact ? "exactly" : a.inclusive ? "less than or equal to" : "less than"} ${a.maximum}` : a.type === "bigint" ? t = `BigInt must be ${a.exact ? "exactly" : a.inclusive ? "less than or equal to" : "less than"} ${a.maximum}` : a.type === "date" ? t = `Date must be ${a.exact ? "exactly" : a.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(a.maximum))}` : t = "Invalid input";
      break;
    case p.custom:
      t = "Invalid input";
      break;
    case p.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case p.not_multiple_of:
      t = `Number must be a multiple of ${a.multipleOf}`;
      break;
    case p.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, j.assertNever(a);
  }
  return { message: t };
};
let fa = nt;
function ha() {
  return fa;
}
const pa = (a) => {
  const { data: e, path: t, errorMaps: r, issueData: n } = a, s = [...t, ...n.path || []], o = {
    ...n,
    path: s
  };
  if (n.message !== void 0)
    return {
      ...n,
      path: s,
      message: n.message
    };
  let l = "";
  const c = r.filter((u) => !!u).slice().reverse();
  for (const u of c)
    l = u(o, { data: e, defaultError: l }).message;
  return {
    ...n,
    path: s,
    message: l
  };
};
function y(a, e) {
  const t = ha(), r = pa({
    issueData: e,
    data: a.data,
    path: a.path,
    errorMaps: [
      a.common.contextualErrorMap,
      // contextual error map is first priority
      a.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === nt ? void 0 : nt
      // then global default map
    ].filter((n) => !!n)
  });
  a.common.issues.push(r);
}
class Q {
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
    const r = [];
    for (const n of t) {
      if (n.status === "aborted")
        return N;
      n.status === "dirty" && e.dirty(), r.push(n.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    const r = [];
    for (const n of t) {
      const s = await n.key, o = await n.value;
      r.push({
        key: s,
        value: o
      });
    }
    return Q.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const n of t) {
      const { key: s, value: o } = n;
      if (s.status === "aborted" || o.status === "aborted")
        return N;
      s.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), s.value !== "__proto__" && (typeof o.value < "u" || n.alwaysSet) && (r[s.value] = o.value);
    }
    return { status: e.value, value: r };
  }
}
const N = Object.freeze({
  status: "aborted"
}), $e = (a) => ({ status: "dirty", value: a }), ae = (a) => ({ status: "valid", value: a }), Et = (a) => a.status === "aborted", wt = (a) => a.status === "dirty", Ce = (a) => a.status === "valid", Ve = (a) => typeof Promise < "u" && a instanceof Promise;
var E;
(function(a) {
  a.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, a.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(E || (E = {}));
class ge {
  constructor(e, t, r, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const kt = (a, e) => {
  if (Ce(e))
    return { success: !0, data: e.value };
  if (!a.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new de(a.common.issues);
      return this._error = t, this._error;
    }
  };
};
function D(a) {
  if (!a)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: n } = a;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (o, l) => {
    const { message: c } = a;
    return o.code === "invalid_enum_value" ? { message: c ?? l.defaultError } : typeof l.data > "u" ? { message: c ?? r ?? l.defaultError } : o.code !== "invalid_type" ? { message: l.defaultError } : { message: c ?? t ?? l.defaultError };
  }, description: n };
}
class M {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return ue(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: ue(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Q(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: ue(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Ve(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const r = this.safeParse(e, t);
    if (r.success)
      return r.data;
    throw r.error;
  }
  safeParse(e, t) {
    const r = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ue(e)
    }, n = this._parseSync({ data: e, path: r.path, parent: r });
    return kt(r, n);
  }
  "~validate"(e) {
    var r, n;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ue(e)
    };
    if (!this["~standard"].async)
      try {
        const s = this._parseSync({ data: e, path: [], parent: t });
        return Ce(s) ? {
          value: s.value
        } : {
          issues: t.common.issues
        };
      } catch (s) {
        (n = (r = s == null ? void 0 : s.message) == null ? void 0 : r.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((s) => Ce(s) ? {
      value: s.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const r = await this.safeParseAsync(e, t);
    if (r.success)
      return r.data;
    throw r.error;
  }
  async safeParseAsync(e, t) {
    const r = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: ue(e)
    }, n = this._parse({ data: e, path: r.path, parent: r }), s = await (Ve(n) ? n : Promise.resolve(n));
    return kt(r, s);
  }
  refine(e, t) {
    const r = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, s) => {
      const o = e(n), l = () => s.addIssue({
        code: p.custom,
        ...r(n)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((c) => c ? !0 : (l(), !1)) : o ? !0 : (l(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, n) => e(r) ? !0 : (n.addIssue(typeof t == "function" ? t(r, n) : t), !1));
  }
  _refinement(e) {
    return new Ae({
      schema: this,
      typeName: A.ZodEffects,
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
    return he.create(this, this._def);
  }
  nullable() {
    return Oe.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return oe.create(this);
  }
  promise() {
    return qe.create(this, this._def);
  }
  or(e) {
    return He.create([this, e], this._def);
  }
  and(e) {
    return Ge.create(this, e, this._def);
  }
  transform(e) {
    return new Ae({
      ...D(this._def),
      schema: this,
      typeName: A.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new it({
      ...D(this._def),
      innerType: this,
      defaultValue: t,
      typeName: A.ZodDefault
    });
  }
  brand() {
    return new La({
      typeName: A.ZodBranded,
      type: this,
      ...D(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ot({
      ...D(this._def),
      innerType: this,
      catchValue: t,
      typeName: A.ZodCatch
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
    return dt.create(this, e);
  }
  readonly() {
    return lt.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const ga = /^c[^\s-]{8,}$/i, ya = /^[0-9a-z]+$/, va = /^[0-9A-HJKMNP-TV-Z]{26}$/i, ba = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, _a = /^[a-z0-9_-]{21}$/i, xa = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Ea = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, wa = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, ka = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let et;
const Sa = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ca = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Ta = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Na = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Aa = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Oa = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Wt = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Ra = new RegExp(`^${Wt}$`);
function Ht(a) {
  let e = "[0-5]\\d";
  a.precision ? e = `${e}\\.\\d{${a.precision}}` : a.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = a.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Ia(a) {
  return new RegExp(`^${Ht(a)}$`);
}
function $a(a) {
  let e = `${Wt}T${Ht(a)}`;
  const t = [];
  return t.push(a.local ? "Z?" : "Z"), a.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Pa(a, e) {
  return !!((e === "v4" || !e) && Sa.test(a) || (e === "v6" || !e) && Ta.test(a));
}
function Da(a, e) {
  if (!xa.test(a))
    return !1;
  try {
    const [t] = a.split(".");
    if (!t)
      return !1;
    const r = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(r));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function Ma(a, e) {
  return !!((e === "v4" || !e) && Ca.test(a) || (e === "v6" || !e) && Na.test(a));
}
class me extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== x.string) {
      const s = this._getOrReturnCtx(e);
      return y(s, {
        code: p.invalid_type,
        expected: x.string,
        received: s.parsedType
      }), N;
    }
    const r = new Q();
    let n;
    for (const s of this._def.checks)
      if (s.kind === "min")
        e.data.length < s.value && (n = this._getOrReturnCtx(e, n), y(n, {
          code: p.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), r.dirty());
      else if (s.kind === "max")
        e.data.length > s.value && (n = this._getOrReturnCtx(e, n), y(n, {
          code: p.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: s.message
        }), r.dirty());
      else if (s.kind === "length") {
        const o = e.data.length > s.value, l = e.data.length < s.value;
        (o || l) && (n = this._getOrReturnCtx(e, n), o ? y(n, {
          code: p.too_big,
          maximum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }) : l && y(n, {
          code: p.too_small,
          minimum: s.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: s.message
        }), r.dirty());
      } else if (s.kind === "email")
        wa.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "email",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "emoji")
        et || (et = new RegExp(ka, "u")), et.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "emoji",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "uuid")
        ba.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "uuid",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "nanoid")
        _a.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "nanoid",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "cuid")
        ga.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "cuid",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "cuid2")
        ya.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "cuid2",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "ulid")
        va.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
          validation: "ulid",
          code: p.invalid_string,
          message: s.message
        }), r.dirty());
      else if (s.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), y(n, {
            validation: "url",
            code: p.invalid_string,
            message: s.message
          }), r.dirty();
        }
      else s.kind === "regex" ? (s.regex.lastIndex = 0, s.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "regex",
        code: p.invalid_string,
        message: s.message
      }), r.dirty())) : s.kind === "trim" ? e.data = e.data.trim() : s.kind === "includes" ? e.data.includes(s.value, s.position) || (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.invalid_string,
        validation: { includes: s.value, position: s.position },
        message: s.message
      }), r.dirty()) : s.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : s.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : s.kind === "startsWith" ? e.data.startsWith(s.value) || (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.invalid_string,
        validation: { startsWith: s.value },
        message: s.message
      }), r.dirty()) : s.kind === "endsWith" ? e.data.endsWith(s.value) || (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.invalid_string,
        validation: { endsWith: s.value },
        message: s.message
      }), r.dirty()) : s.kind === "datetime" ? $a(s).test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.invalid_string,
        validation: "datetime",
        message: s.message
      }), r.dirty()) : s.kind === "date" ? Ra.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.invalid_string,
        validation: "date",
        message: s.message
      }), r.dirty()) : s.kind === "time" ? Ia(s).test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.invalid_string,
        validation: "time",
        message: s.message
      }), r.dirty()) : s.kind === "duration" ? Ea.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "duration",
        code: p.invalid_string,
        message: s.message
      }), r.dirty()) : s.kind === "ip" ? Pa(e.data, s.version) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "ip",
        code: p.invalid_string,
        message: s.message
      }), r.dirty()) : s.kind === "jwt" ? Da(e.data, s.alg) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "jwt",
        code: p.invalid_string,
        message: s.message
      }), r.dirty()) : s.kind === "cidr" ? Ma(e.data, s.version) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "cidr",
        code: p.invalid_string,
        message: s.message
      }), r.dirty()) : s.kind === "base64" ? Aa.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "base64",
        code: p.invalid_string,
        message: s.message
      }), r.dirty()) : s.kind === "base64url" ? Oa.test(e.data) || (n = this._getOrReturnCtx(e, n), y(n, {
        validation: "base64url",
        code: p.invalid_string,
        message: s.message
      }), r.dirty()) : j.assertNever(s);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: p.invalid_string,
      ...E.errToObj(r)
    });
  }
  _addCheck(e) {
    return new me({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...E.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...E.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...E.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...E.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...E.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...E.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...E.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...E.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...E.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...E.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...E.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...E.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...E.errToObj(e) });
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
      ...E.errToObj(e == null ? void 0 : e.message)
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
      ...E.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...E.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...E.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...E.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...E.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...E.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...E.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...E.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...E.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, E.errToObj(e));
  }
  trim() {
    return new me({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new me({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new me({
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
me.create = (a) => new me({
  checks: [],
  typeName: A.ZodString,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...D(a)
});
function ja(a, e) {
  const t = (a.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, n = t > r ? t : r, s = Number.parseInt(a.toFixed(n).replace(".", "")), o = Number.parseInt(e.toFixed(n).replace(".", ""));
  return s % o / 10 ** n;
}
class Te extends M {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== x.number) {
      const s = this._getOrReturnCtx(e);
      return y(s, {
        code: p.invalid_type,
        expected: x.number,
        received: s.parsedType
      }), N;
    }
    let r;
    const n = new Q();
    for (const s of this._def.checks)
      s.kind === "int" ? j.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.invalid_type,
        expected: "integer",
        received: "float",
        message: s.message
      }), n.dirty()) : s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.too_small,
        minimum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), n.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.too_big,
        maximum: s.value,
        type: "number",
        inclusive: s.inclusive,
        exact: !1,
        message: s.message
      }), n.dirty()) : s.kind === "multipleOf" ? ja(e.data, s.value) !== 0 && (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), n.dirty()) : s.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.not_finite,
        message: s.message
      }), n.dirty()) : j.assertNever(s);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, E.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, E.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, E.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, E.toString(t));
  }
  setLimit(e, t, r, n) {
    return new Te({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: E.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Te({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: E.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: E.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: E.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: E.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: E.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: E.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: E.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: E.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: E.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && j.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const r of this._def.checks) {
      if (r.kind === "finite" || r.kind === "int" || r.kind === "multipleOf")
        return !0;
      r.kind === "min" ? (t === null || r.value > t) && (t = r.value) : r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
Te.create = (a) => new Te({
  checks: [],
  typeName: A.ZodNumber,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...D(a)
});
class Pe extends M {
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
    if (this._getType(e) !== x.bigint)
      return this._getInvalidInput(e);
    let r;
    const n = new Q();
    for (const s of this._def.checks)
      s.kind === "min" ? (s.inclusive ? e.data < s.value : e.data <= s.value) && (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.too_small,
        type: "bigint",
        minimum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), n.dirty()) : s.kind === "max" ? (s.inclusive ? e.data > s.value : e.data >= s.value) && (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.too_big,
        type: "bigint",
        maximum: s.value,
        inclusive: s.inclusive,
        message: s.message
      }), n.dirty()) : s.kind === "multipleOf" ? e.data % s.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), y(r, {
        code: p.not_multiple_of,
        multipleOf: s.value,
        message: s.message
      }), n.dirty()) : j.assertNever(s);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return y(t, {
      code: p.invalid_type,
      expected: x.bigint,
      received: t.parsedType
    }), N;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, E.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, E.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, E.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, E.toString(t));
  }
  setLimit(e, t, r, n) {
    return new Pe({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: E.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Pe({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: E.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: E.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: E.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: E.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: E.toString(t)
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
Pe.create = (a) => new Pe({
  checks: [],
  typeName: A.ZodBigInt,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...D(a)
});
class St extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== x.boolean) {
      const r = this._getOrReturnCtx(e);
      return y(r, {
        code: p.invalid_type,
        expected: x.boolean,
        received: r.parsedType
      }), N;
    }
    return ae(e.data);
  }
}
St.create = (a) => new St({
  typeName: A.ZodBoolean,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...D(a)
});
class We extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== x.date) {
      const s = this._getOrReturnCtx(e);
      return y(s, {
        code: p.invalid_type,
        expected: x.date,
        received: s.parsedType
      }), N;
    }
    if (Number.isNaN(e.data.getTime())) {
      const s = this._getOrReturnCtx(e);
      return y(s, {
        code: p.invalid_date
      }), N;
    }
    const r = new Q();
    let n;
    for (const s of this._def.checks)
      s.kind === "min" ? e.data.getTime() < s.value && (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.too_small,
        message: s.message,
        inclusive: !0,
        exact: !1,
        minimum: s.value,
        type: "date"
      }), r.dirty()) : s.kind === "max" ? e.data.getTime() > s.value && (n = this._getOrReturnCtx(e, n), y(n, {
        code: p.too_big,
        message: s.message,
        inclusive: !0,
        exact: !1,
        maximum: s.value,
        type: "date"
      }), r.dirty()) : j.assertNever(s);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new We({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: E.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: E.toString(t)
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
We.create = (a) => new We({
  checks: [],
  coerce: (a == null ? void 0 : a.coerce) || !1,
  typeName: A.ZodDate,
  ...D(a)
});
class Ct extends M {
  _parse(e) {
    if (this._getType(e) !== x.symbol) {
      const r = this._getOrReturnCtx(e);
      return y(r, {
        code: p.invalid_type,
        expected: x.symbol,
        received: r.parsedType
      }), N;
    }
    return ae(e.data);
  }
}
Ct.create = (a) => new Ct({
  typeName: A.ZodSymbol,
  ...D(a)
});
class Tt extends M {
  _parse(e) {
    if (this._getType(e) !== x.undefined) {
      const r = this._getOrReturnCtx(e);
      return y(r, {
        code: p.invalid_type,
        expected: x.undefined,
        received: r.parsedType
      }), N;
    }
    return ae(e.data);
  }
}
Tt.create = (a) => new Tt({
  typeName: A.ZodUndefined,
  ...D(a)
});
class Nt extends M {
  _parse(e) {
    if (this._getType(e) !== x.null) {
      const r = this._getOrReturnCtx(e);
      return y(r, {
        code: p.invalid_type,
        expected: x.null,
        received: r.parsedType
      }), N;
    }
    return ae(e.data);
  }
}
Nt.create = (a) => new Nt({
  typeName: A.ZodNull,
  ...D(a)
});
class At extends M {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return ae(e.data);
  }
}
At.create = (a) => new At({
  typeName: A.ZodAny,
  ...D(a)
});
class Ot extends M {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return ae(e.data);
  }
}
Ot.create = (a) => new Ot({
  typeName: A.ZodUnknown,
  ...D(a)
});
class ye extends M {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return y(t, {
      code: p.invalid_type,
      expected: x.never,
      received: t.parsedType
    }), N;
  }
}
ye.create = (a) => new ye({
  typeName: A.ZodNever,
  ...D(a)
});
class Rt extends M {
  _parse(e) {
    if (this._getType(e) !== x.undefined) {
      const r = this._getOrReturnCtx(e);
      return y(r, {
        code: p.invalid_type,
        expected: x.void,
        received: r.parsedType
      }), N;
    }
    return ae(e.data);
  }
}
Rt.create = (a) => new Rt({
  typeName: A.ZodVoid,
  ...D(a)
});
class oe extends M {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== x.array)
      return y(t, {
        code: p.invalid_type,
        expected: x.array,
        received: t.parsedType
      }), N;
    if (n.exactLength !== null) {
      const o = t.data.length > n.exactLength.value, l = t.data.length < n.exactLength.value;
      (o || l) && (y(t, {
        code: o ? p.too_big : p.too_small,
        minimum: l ? n.exactLength.value : void 0,
        maximum: o ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), r.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (y(t, {
      code: p.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), r.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (y(t, {
      code: p.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((o, l) => n.type._parseAsync(new ge(t, o, t.path, l)))).then((o) => Q.mergeArray(r, o));
    const s = [...t.data].map((o, l) => n.type._parseSync(new ge(t, o, t.path, l)));
    return Q.mergeArray(r, s);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new oe({
      ...this._def,
      minLength: { value: e, message: E.toString(t) }
    });
  }
  max(e, t) {
    return new oe({
      ...this._def,
      maxLength: { value: e, message: E.toString(t) }
    });
  }
  length(e, t) {
    return new oe({
      ...this._def,
      exactLength: { value: e, message: E.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
oe.create = (a, e) => new oe({
  type: a,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: A.ZodArray,
  ...D(e)
});
function ke(a) {
  if (a instanceof G) {
    const e = {};
    for (const t in a.shape) {
      const r = a.shape[t];
      e[t] = he.create(ke(r));
    }
    return new G({
      ...a._def,
      shape: () => e
    });
  } else return a instanceof oe ? new oe({
    ...a._def,
    type: ke(a.element)
  }) : a instanceof he ? he.create(ke(a.unwrap())) : a instanceof Oe ? Oe.create(ke(a.unwrap())) : a instanceof ve ? ve.create(a.items.map((e) => ke(e))) : a;
}
class G extends M {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = j.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== x.object) {
      const u = this._getOrReturnCtx(e);
      return y(u, {
        code: p.invalid_type,
        expected: x.object,
        received: u.parsedType
      }), N;
    }
    const { status: r, ctx: n } = this._processInputParams(e), { shape: s, keys: o } = this._getCached(), l = [];
    if (!(this._def.catchall instanceof ye && this._def.unknownKeys === "strip"))
      for (const u in n.data)
        o.includes(u) || l.push(u);
    const c = [];
    for (const u of o) {
      const h = s[u], f = n.data[u];
      c.push({
        key: { status: "valid", value: u },
        value: h._parse(new ge(n, f, n.path, u)),
        alwaysSet: u in n.data
      });
    }
    if (this._def.catchall instanceof ye) {
      const u = this._def.unknownKeys;
      if (u === "passthrough")
        for (const h of l)
          c.push({
            key: { status: "valid", value: h },
            value: { status: "valid", value: n.data[h] }
          });
      else if (u === "strict")
        l.length > 0 && (y(n, {
          code: p.unrecognized_keys,
          keys: l
        }), r.dirty());
      else if (u !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const u = this._def.catchall;
      for (const h of l) {
        const f = n.data[h];
        c.push({
          key: { status: "valid", value: h },
          value: u._parse(
            new ge(n, f, n.path, h)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: h in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const u = [];
      for (const h of c) {
        const f = await h.key, S = await h.value;
        u.push({
          key: f,
          value: S,
          alwaysSet: h.alwaysSet
        });
      }
      return u;
    }).then((u) => Q.mergeObjectSync(r, u)) : Q.mergeObjectSync(r, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return E.errToObj, new G({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, r) => {
          var s, o;
          const n = ((o = (s = this._def).errorMap) == null ? void 0 : o.call(s, t, r).message) ?? r.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: E.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new G({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new G({
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
    return new G({
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
    return new G({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: A.ZodObject
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
    return new G({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of j.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new G({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of j.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new G({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return ke(this);
  }
  partial(e) {
    const t = {};
    for (const r of j.objectKeys(this.shape)) {
      const n = this.shape[r];
      e && !e[r] ? t[r] = n : t[r] = n.optional();
    }
    return new G({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const r of j.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let s = this.shape[r];
        for (; s instanceof he; )
          s = s._def.innerType;
        t[r] = s;
      }
    return new G({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Gt(j.objectKeys(this.shape));
  }
}
G.create = (a, e) => new G({
  shape: () => a,
  unknownKeys: "strip",
  catchall: ye.create(),
  typeName: A.ZodObject,
  ...D(e)
});
G.strictCreate = (a, e) => new G({
  shape: () => a,
  unknownKeys: "strict",
  catchall: ye.create(),
  typeName: A.ZodObject,
  ...D(e)
});
G.lazycreate = (a, e) => new G({
  shape: a,
  unknownKeys: "strip",
  catchall: ye.create(),
  typeName: A.ZodObject,
  ...D(e)
});
class He extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function n(s) {
      for (const l of s)
        if (l.result.status === "valid")
          return l.result;
      for (const l of s)
        if (l.result.status === "dirty")
          return t.common.issues.push(...l.ctx.common.issues), l.result;
      const o = s.map((l) => new de(l.ctx.common.issues));
      return y(t, {
        code: p.invalid_union,
        unionErrors: o
      }), N;
    }
    if (t.common.async)
      return Promise.all(r.map(async (s) => {
        const o = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await s._parseAsync({
            data: t.data,
            path: t.path,
            parent: o
          }),
          ctx: o
        };
      })).then(n);
    {
      let s;
      const o = [];
      for (const c of r) {
        const u = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, h = c._parseSync({
          data: t.data,
          path: t.path,
          parent: u
        });
        if (h.status === "valid")
          return h;
        h.status === "dirty" && !s && (s = { result: h, ctx: u }), u.common.issues.length && o.push(u.common.issues);
      }
      if (s)
        return t.common.issues.push(...s.ctx.common.issues), s.result;
      const l = o.map((c) => new de(c));
      return y(t, {
        code: p.invalid_union,
        unionErrors: l
      }), N;
    }
  }
  get options() {
    return this._def.options;
  }
}
He.create = (a, e) => new He({
  options: a,
  typeName: A.ZodUnion,
  ...D(e)
});
function st(a, e) {
  const t = ue(a), r = ue(e);
  if (a === e)
    return { valid: !0, data: a };
  if (t === x.object && r === x.object) {
    const n = j.objectKeys(e), s = j.objectKeys(a).filter((l) => n.indexOf(l) !== -1), o = { ...a, ...e };
    for (const l of s) {
      const c = st(a[l], e[l]);
      if (!c.valid)
        return { valid: !1 };
      o[l] = c.data;
    }
    return { valid: !0, data: o };
  } else if (t === x.array && r === x.array) {
    if (a.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let s = 0; s < a.length; s++) {
      const o = a[s], l = e[s], c = st(o, l);
      if (!c.valid)
        return { valid: !1 };
      n.push(c.data);
    }
    return { valid: !0, data: n };
  } else return t === x.date && r === x.date && +a == +e ? { valid: !0, data: a } : { valid: !1 };
}
class Ge extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), n = (s, o) => {
      if (Et(s) || Et(o))
        return N;
      const l = st(s.value, o.value);
      return l.valid ? ((wt(s) || wt(o)) && t.dirty(), { status: t.value, value: l.data }) : (y(r, {
        code: p.invalid_intersection_types
      }), N);
    };
    return r.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      }),
      this._def.right._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      })
    ]).then(([s, o]) => n(s, o)) : n(this._def.left._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }), this._def.right._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }));
  }
}
Ge.create = (a, e, t) => new Ge({
  left: a,
  right: e,
  typeName: A.ZodIntersection,
  ...D(t)
});
class ve extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== x.array)
      return y(r, {
        code: p.invalid_type,
        expected: x.array,
        received: r.parsedType
      }), N;
    if (r.data.length < this._def.items.length)
      return y(r, {
        code: p.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), N;
    !this._def.rest && r.data.length > this._def.items.length && (y(r, {
      code: p.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const s = [...r.data].map((o, l) => {
      const c = this._def.items[l] || this._def.rest;
      return c ? c._parse(new ge(r, o, r.path, l)) : null;
    }).filter((o) => !!o);
    return r.common.async ? Promise.all(s).then((o) => Q.mergeArray(t, o)) : Q.mergeArray(t, s);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new ve({
      ...this._def,
      rest: e
    });
  }
}
ve.create = (a, e) => {
  if (!Array.isArray(a))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new ve({
    items: a,
    typeName: A.ZodTuple,
    rest: null,
    ...D(e)
  });
};
class It extends M {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== x.map)
      return y(r, {
        code: p.invalid_type,
        expected: x.map,
        received: r.parsedType
      }), N;
    const n = this._def.keyType, s = this._def.valueType, o = [...r.data.entries()].map(([l, c], u) => ({
      key: n._parse(new ge(r, l, r.path, [u, "key"])),
      value: s._parse(new ge(r, c, r.path, [u, "value"]))
    }));
    if (r.common.async) {
      const l = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of o) {
          const u = await c.key, h = await c.value;
          if (u.status === "aborted" || h.status === "aborted")
            return N;
          (u.status === "dirty" || h.status === "dirty") && t.dirty(), l.set(u.value, h.value);
        }
        return { status: t.value, value: l };
      });
    } else {
      const l = /* @__PURE__ */ new Map();
      for (const c of o) {
        const u = c.key, h = c.value;
        if (u.status === "aborted" || h.status === "aborted")
          return N;
        (u.status === "dirty" || h.status === "dirty") && t.dirty(), l.set(u.value, h.value);
      }
      return { status: t.value, value: l };
    }
  }
}
It.create = (a, e, t) => new It({
  valueType: e,
  keyType: a,
  typeName: A.ZodMap,
  ...D(t)
});
class De extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== x.set)
      return y(r, {
        code: p.invalid_type,
        expected: x.set,
        received: r.parsedType
      }), N;
    const n = this._def;
    n.minSize !== null && r.data.size < n.minSize.value && (y(r, {
      code: p.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && r.data.size > n.maxSize.value && (y(r, {
      code: p.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const s = this._def.valueType;
    function o(c) {
      const u = /* @__PURE__ */ new Set();
      for (const h of c) {
        if (h.status === "aborted")
          return N;
        h.status === "dirty" && t.dirty(), u.add(h.value);
      }
      return { status: t.value, value: u };
    }
    const l = [...r.data.values()].map((c, u) => s._parse(new ge(r, c, r.path, u)));
    return r.common.async ? Promise.all(l).then((c) => o(c)) : o(l);
  }
  min(e, t) {
    return new De({
      ...this._def,
      minSize: { value: e, message: E.toString(t) }
    });
  }
  max(e, t) {
    return new De({
      ...this._def,
      maxSize: { value: e, message: E.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
De.create = (a, e) => new De({
  valueType: a,
  minSize: null,
  maxSize: null,
  typeName: A.ZodSet,
  ...D(e)
});
class $t extends M {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
$t.create = (a, e) => new $t({
  getter: a,
  typeName: A.ZodLazy,
  ...D(e)
});
class Pt extends M {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return y(t, {
        received: t.data,
        code: p.invalid_literal,
        expected: this._def.value
      }), N;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Pt.create = (a, e) => new Pt({
  value: a,
  typeName: A.ZodLiteral,
  ...D(e)
});
function Gt(a, e) {
  return new Ne({
    values: a,
    typeName: A.ZodEnum,
    ...D(e)
  });
}
class Ne extends M {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return y(t, {
        expected: j.joinValues(r),
        received: t.parsedType,
        code: p.invalid_type
      }), N;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return y(t, {
        received: t.data,
        code: p.invalid_enum_value,
        options: r
      }), N;
    }
    return ae(e.data);
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
    return Ne.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
Ne.create = Gt;
class Dt extends M {
  _parse(e) {
    const t = j.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== x.string && r.parsedType !== x.number) {
      const n = j.objectValues(t);
      return y(r, {
        expected: j.joinValues(n),
        received: r.parsedType,
        code: p.invalid_type
      }), N;
    }
    if (this._cache || (this._cache = new Set(j.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = j.objectValues(t);
      return y(r, {
        received: r.data,
        code: p.invalid_enum_value,
        options: n
      }), N;
    }
    return ae(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Dt.create = (a, e) => new Dt({
  values: a,
  typeName: A.ZodNativeEnum,
  ...D(e)
});
class qe extends M {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== x.promise && t.common.async === !1)
      return y(t, {
        code: p.invalid_type,
        expected: x.promise,
        received: t.parsedType
      }), N;
    const r = t.parsedType === x.promise ? t.data : Promise.resolve(t.data);
    return ae(r.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
qe.create = (a, e) => new qe({
  type: a,
  typeName: A.ZodPromise,
  ...D(e)
});
class Ae extends M {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === A.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), n = this._def.effect || null, s = {
      addIssue: (o) => {
        y(r, o), o.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (s.addIssue = s.addIssue.bind(s), n.type === "preprocess") {
      const o = n.transform(r.data, s);
      if (r.common.async)
        return Promise.resolve(o).then(async (l) => {
          if (t.value === "aborted")
            return N;
          const c = await this._def.schema._parseAsync({
            data: l,
            path: r.path,
            parent: r
          });
          return c.status === "aborted" ? N : c.status === "dirty" || t.value === "dirty" ? $e(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return N;
        const l = this._def.schema._parseSync({
          data: o,
          path: r.path,
          parent: r
        });
        return l.status === "aborted" ? N : l.status === "dirty" || t.value === "dirty" ? $e(l.value) : l;
      }
    }
    if (n.type === "refinement") {
      const o = (l) => {
        const c = n.refinement(l, s);
        if (r.common.async)
          return Promise.resolve(c);
        if (c instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return l;
      };
      if (r.common.async === !1) {
        const l = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return l.status === "aborted" ? N : (l.status === "dirty" && t.dirty(), o(l.value), { status: t.value, value: l.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((l) => l.status === "aborted" ? N : (l.status === "dirty" && t.dirty(), o(l.value).then(() => ({ status: t.value, value: l.value }))));
    }
    if (n.type === "transform")
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!Ce(o))
          return N;
        const l = n.transform(o.value, s);
        if (l instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: l };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => Ce(o) ? Promise.resolve(n.transform(o.value, s)).then((l) => ({
          status: t.value,
          value: l
        })) : N);
    j.assertNever(n);
  }
}
Ae.create = (a, e, t) => new Ae({
  schema: a,
  typeName: A.ZodEffects,
  effect: e,
  ...D(t)
});
Ae.createWithPreprocess = (a, e, t) => new Ae({
  schema: e,
  effect: { type: "preprocess", transform: a },
  typeName: A.ZodEffects,
  ...D(t)
});
class he extends M {
  _parse(e) {
    return this._getType(e) === x.undefined ? ae(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
he.create = (a, e) => new he({
  innerType: a,
  typeName: A.ZodOptional,
  ...D(e)
});
class Oe extends M {
  _parse(e) {
    return this._getType(e) === x.null ? ae(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Oe.create = (a, e) => new Oe({
  innerType: a,
  typeName: A.ZodNullable,
  ...D(e)
});
class it extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let r = t.data;
    return t.parsedType === x.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
it.create = (a, e) => new it({
  innerType: a,
  typeName: A.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...D(e)
});
class ot extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: r.data,
      path: r.path,
      parent: {
        ...r
      }
    });
    return Ve(n) ? n.then((s) => ({
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new de(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new de(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ot.create = (a, e) => new ot({
  innerType: a,
  typeName: A.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...D(e)
});
class Mt extends M {
  _parse(e) {
    if (this._getType(e) !== x.nan) {
      const r = this._getOrReturnCtx(e);
      return y(r, {
        code: p.invalid_type,
        expected: x.nan,
        received: r.parsedType
      }), N;
    }
    return { status: "valid", value: e.data };
  }
}
Mt.create = (a) => new Mt({
  typeName: A.ZodNaN,
  ...D(a)
});
class La extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = t.data;
    return this._def.type._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class dt extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const s = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return s.status === "aborted" ? N : s.status === "dirty" ? (t.dirty(), $e(s.value)) : this._def.out._parseAsync({
          data: s.value,
          path: r.path,
          parent: r
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: r.data,
        path: r.path,
        parent: r
      });
      return n.status === "aborted" ? N : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: r.path,
        parent: r
      });
    }
  }
  static create(e, t) {
    return new dt({
      in: e,
      out: t,
      typeName: A.ZodPipeline
    });
  }
}
class lt extends M {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (n) => (Ce(n) && (n.value = Object.freeze(n.value)), n);
    return Ve(t) ? t.then((n) => r(n)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
lt.create = (a, e) => new lt({
  innerType: a,
  typeName: A.ZodReadonly,
  ...D(e)
});
var A;
(function(a) {
  a.ZodString = "ZodString", a.ZodNumber = "ZodNumber", a.ZodNaN = "ZodNaN", a.ZodBigInt = "ZodBigInt", a.ZodBoolean = "ZodBoolean", a.ZodDate = "ZodDate", a.ZodSymbol = "ZodSymbol", a.ZodUndefined = "ZodUndefined", a.ZodNull = "ZodNull", a.ZodAny = "ZodAny", a.ZodUnknown = "ZodUnknown", a.ZodNever = "ZodNever", a.ZodVoid = "ZodVoid", a.ZodArray = "ZodArray", a.ZodObject = "ZodObject", a.ZodUnion = "ZodUnion", a.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", a.ZodIntersection = "ZodIntersection", a.ZodTuple = "ZodTuple", a.ZodRecord = "ZodRecord", a.ZodMap = "ZodMap", a.ZodSet = "ZodSet", a.ZodFunction = "ZodFunction", a.ZodLazy = "ZodLazy", a.ZodLiteral = "ZodLiteral", a.ZodEnum = "ZodEnum", a.ZodEffects = "ZodEffects", a.ZodNativeEnum = "ZodNativeEnum", a.ZodOptional = "ZodOptional", a.ZodNullable = "ZodNullable", a.ZodDefault = "ZodDefault", a.ZodCatch = "ZodCatch", a.ZodPromise = "ZodPromise", a.ZodBranded = "ZodBranded", a.ZodPipeline = "ZodPipeline", a.ZodReadonly = "ZodReadonly";
})(A || (A = {}));
const V = me.create, za = Te.create;
ye.create;
const pe = oe.create, Se = G.create, Za = He.create;
Ge.create;
ve.create;
Ne.create;
qe.create;
he.create;
Oe.create;
Se({
  id: V().min(1),
  name: V().min(1).optional(),
  tags: pe(V()).default([]),
  nodeTypes: pe(V()).default([]),
  engineVersion: V().optional(),
  thumbnail: V().optional(),
  lastModified: Za([V(), za()]).optional(),
  author: V().optional(),
  outputType: V().optional()
});
const Ba = Se({
  presets: pe(
    Se({
      id: V().min(1),
      path: V().min(1),
      tags: pe(V()).optional(),
      nodeTypes: pe(V()).optional(),
      thumbnail: V().optional()
    })
  )
}), Fa = Se({
  name: V().optional(),
  version: V().optional(),
  presetLibrary: Se({
    presets: pe(
      Se({
        id: V().min(1),
        path: V().min(1),
        tags: pe(V()).optional(),
        nodeTypes: pe(V()).optional(),
        thumbnail: V().optional()
      })
    )
  })
});
function Ua(a) {
  return Ba.parse(a);
}
function Va(a) {
  return Fa.parse(a);
}
function qt(a) {
  try {
    return {
      type: "minimal",
      presets: Ua(a).presets.map((r) => ({
        id: r.id,
        path: r.path,
        tags: r.tags ?? [],
        nodeTypes: r.nodeTypes ?? [],
        thumbnail: r.thumbnail
      }))
    };
  } catch {
  }
  return {
    type: "npm-style",
    presets: Va(a).presetLibrary.presets.map((t) => ({
      id: t.id,
      path: t.path,
      tags: t.tags ?? [],
      nodeTypes: t.nodeTypes ?? [],
      thumbnail: t.thumbnail
    }))
  };
}
const Yt = {
  async listPresets() {
    return [
      {
        id: "p1",
        name: "Medieval Castle",
        tags: ["demo", "medieval"],
        type: "image"
      },
      { id: "p2", name: "Forest Path", tags: ["nature"], type: "image" },
      { id: "p3", name: "Ocean Waves", tags: ["nature", "demo"], type: "video" }
    ];
  },
  async scanLibraries(a) {
    const e = [], t = [];
    for (const r of a)
      try {
        const n = await Promise.resolve(qt(r));
        e.push(...n.presets);
      } catch (n) {
        t.push(n instanceof Error ? n.message : "Unknown manifest error");
      }
    if (t.length)
      throw new Error(`${t.length} error(s) during scan`);
    return e;
  }
}, Wa = {
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
}, P = ua((a, e) => ({
  ...Wa,
  setDetailsOpen: (t) => a({ detailsOpen: t }),
  selectPreset: (t) => a({ selectedPresetId: t }),
  scan: async (t) => {
    a({ scanStatus: "scanning", error: null });
    const r = [], n = [];
    for (const c of t)
      try {
        const u = qt(c);
        n.push(...u.presets);
      } catch (u) {
        r.push(u instanceof Error ? u.message : "Unknown manifest error");
      }
    if (r.length) {
      a({
        scanStatus: "error",
        error: `${r.length} error(s) during scan`
      });
      return;
    }
    const s = n.map((c) => ({
      id: c.id,
      name: c.id,
      tags: c.tags,
      type: "unknown"
    })), o = Array.from(new Set(s.flatMap((c) => c.tags))).sort(), l = tt(s, e().activeTags, e().query);
    a({
      libraryIndex: n,
      presets: s,
      filteredPresets: l,
      availableTags: o,
      scanStatus: "done",
      error: null,
      gridItemCount: l.length
    });
  },
  moveSelection: (t) => {
    const {
      focusArea: r,
      focusIndex: n,
      sidebarCount: s,
      gridColumnCount: o,
      gridItemCount: l
    } = e();
    if (r === "sidebar") {
      if (t === "up") return a({ focusIndex: Math.max(0, n - 1) });
      if (t === "down")
        return a({
          focusIndex: Math.min(Math.max(0, s - 1), n + 1)
        });
      if (t === "right") {
        const c = e().filteredPresets[0];
        return a(c ? {
          focusArea: "grid",
          focusIndex: 0,
          selectedPresetId: c.id
        } : { focusArea: "grid", focusIndex: 0 });
      }
      return;
    } else {
      const c = Math.max(1, o);
      let u = n;
      if (t === "left") {
        if (n % c === 0)
          return a({ focusArea: "sidebar", focusIndex: 0 });
        u = Math.max(0, n - 1);
      } else t === "right" ? u = Math.min(l - 1, n + 1) : t === "up" ? u = Math.max(0, n - c) : t === "down" && (u = Math.min(l - 1, n + c));
      a({ focusIndex: u });
      const h = e().filteredPresets[u];
      h && a({ selectedPresetId: h.id });
    }
  },
  toggleTag: (t) => {
    const { activeTags: r } = e(), n = r.includes(t) ? r.filter((o) => o !== t) : [...r, t], s = tt(e().presets, n, e().query);
    a({ activeTags: n, filteredPresets: s });
  },
  setQuery: (t) => {
    const r = tt(e().presets, e().activeTags, t);
    a({ query: t, filteredPresets: r });
  },
  setSidebarCount: (t) => a({
    sidebarCount: t,
    focusIndex: Math.min(e().focusIndex, Math.max(0, t - 1))
  }),
  setGridMetrics: ({ columnCount: t, itemCount: r }) => a({ gridColumnCount: t, gridItemCount: r }),
  setFocus: (t, r) => a({ focusArea: t, focusIndex: r })
}));
function tt(a, e, t) {
  let r = a;
  return e.length && (r = r.filter((n) => e.every((s) => n.tags.includes(s)))), t && t.trim().length > 0 ? new ma(r, {
    keys: ["name", "tags"],
    threshold: 0.4,
    ignoreLocation: !0
  }).search(t).map((s) => s.item) : r;
}
(async () => {
  const a = await Yt.listPresets(), e = Array.from(new Set(a.flatMap((t) => t.tags))).sort();
  P.setState({
    presets: a,
    filteredPresets: a,
    availableTags: e
  });
})();
function Jt() {
  const a = P((f) => f.availableTags), e = P((f) => f.activeTags), t = P((f) => f.toggleTag), r = P((f) => f.query), n = P((f) => f.setQuery), s = P((f) => f.scanStatus), o = P((f) => f.error), l = P((f) => f.focusArea), c = P((f) => f.focusIndex), u = P((f) => f.setSidebarCount), h = P((f) => f.setFocus);
  return X(() => {
    u(a.length);
  }, [a.length, u]), /* @__PURE__ */ i.createElement(
    "aside",
    {
      "aria-label": "Asset Libraries",
      role: "navigation",
      style: { borderRight: "1px solid #eee", padding: 8 }
    },
    /* @__PURE__ */ i.createElement("div", { "aria-live": "polite", style: { fontSize: 12, color: "#555" } }, s === "scanning" && /* @__PURE__ */ i.createElement("span", null, "Scanning…"), s === "error" && /* @__PURE__ */ i.createElement("span", { role: "alert", style: { color: "#b00" } }, "Scan error: ", o)),
    /* @__PURE__ */ i.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ i.createElement(
      "label",
      {
        htmlFor: "asset-search",
        style: { display: "block", fontWeight: 600 }
      },
      "Search"
    ), /* @__PURE__ */ i.createElement(
      "input",
      {
        id: "asset-search",
        type: "search",
        value: r,
        onChange: (f) => n(f.target.value),
        placeholder: "Search presets",
        "aria-label": "Search presets",
        style: { width: "100%", padding: "6px 8px" }
      }
    )),
    /* @__PURE__ */ i.createElement("h3", { id: "tags" }, "Tags"),
    s === "done" && a.length === 0 ? /* @__PURE__ */ i.createElement(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        style: { fontSize: 12, color: "#555", padding: "4px 0" }
      },
      "No tags available."
    ) : /* @__PURE__ */ i.createElement("ul", { role: "listbox", "aria-labelledby": "tags" }, a.map((f, S) => /* @__PURE__ */ i.createElement("li", { key: f, role: "option", "aria-selected": e.includes(f) }, /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        onClick: () => t(f),
        "aria-pressed": e.includes(f),
        tabIndex: l === "sidebar" && c === S ? 0 : -1,
        onFocus: () => h("sidebar", S)
      },
      e.includes(f) ? "✓ " : "",
      f
    ))))
  );
}
function Ha({
  preset: a,
  onClick: e,
  onInsert: t,
  tabIndex: r,
  onFocus: n
}) {
  const s = (o) => {
    try {
      const l = JSON.stringify({
        id: a.id,
        name: a.name,
        tags: a.tags,
        type: a.type
      });
      o.dataTransfer.setData("application/x-preset", l), o.dataTransfer.effectAllowed = "copy";
    } catch {
    }
  };
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      role: "button",
      tabIndex: r ?? 0,
      "aria-label": `Preset ${a.name}`,
      onClick: e,
      onFocus: n,
      onKeyDown: (o) => {
        (o.key === "Enter" || o.key === " ") && (e == null || e());
      },
      style: {
        display: "block",
        width: 160,
        height: 140,
        margin: 8,
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: 8
      }
    },
    /* @__PURE__ */ i.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, a.name),
    /* @__PURE__ */ i.createElement("div", { style: { fontSize: 12, color: "#666" } }, a.tags.join(", ")),
    /* @__PURE__ */ i.createElement("div", { style: { marginTop: 8, display: "flex", alignItems: "center" } }, /* @__PURE__ */ i.createElement(
      "span",
      {
        role: "button",
        "aria-label": "drag handle",
        draggable: !0,
        onDragStart: s,
        style: { cursor: "grab" },
        "data-testid": "preset-drag-handle"
      },
      "⠿"
    ), /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        onClick: (o) => {
          o.stopPropagation(), t == null || t(a);
        },
        "aria-label": "Insert preset",
        style: { marginLeft: 8 }
      },
      "Insert"
    ))
  );
}
const jt = 180, Ga = 160;
function qa({ onInsert: a }) {
  const e = P((w) => w.filteredPresets), t = P((w) => w.scanStatus), r = P((w) => w.error), n = P((w) => w.selectPreset), s = P((w) => w.focusArea), o = P((w) => w.focusIndex), l = P((w) => w.setGridMetrics), c = P((w) => w.setFocus), u = ce(null), [h, f] = $({ w: 900, h: 600 });
  X(() => {
    if (!u.current) return;
    const w = u.current, Z = () => f({ w: w.clientWidth || 900, h: w.clientHeight || 600 });
    if (Z(), typeof ResizeObserver == "function") {
      const W = new ResizeObserver(Z);
      return W.observe(w), () => W.disconnect();
    }
    return window.addEventListener("resize", Z), () => window.removeEventListener("resize", Z);
  }, []);
  const S = h.w, R = h.h, m = Math.max(1, Math.floor(S / jt)), g = Math.ceil(e.length / m);
  X(() => {
    l({ columnCount: m, itemCount: e.length });
  }, [m, e.length, l]);
  const v = fe(() => {
    function w({
      columnIndex: Z,
      rowIndex: W,
      style: I
    }) {
      const b = W * m + Z, T = e[b];
      if (!T) return /* @__PURE__ */ i.createElement("div", { style: I });
      const B = s === "grid" && o === b;
      return /* @__PURE__ */ i.createElement(
        "div",
        {
          style: I,
          "data-grid-index": b,
          role: "gridcell",
          "aria-selected": B
        },
        /* @__PURE__ */ i.createElement(
          Ha,
          {
            preset: T,
            onClick: () => n(T.id),
            onInsert: a,
            tabIndex: s === "grid" && o === b ? 0 : -1,
            onFocus: () => c("grid", b)
          }
        )
      );
    }
    return w.displayName = "GridCell", w;
  }, [e, n, a, m, s, o, c]), C = t === "done" && e.length === 0, O = t === "error";
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      "aria-label": "Preset Grid",
      role: "grid",
      ref: u,
      style: { width: "100%", height: "100%", overflow: "hidden" }
    },
    O ? /* @__PURE__ */ i.createElement(
      "div",
      {
        role: "alert",
        "aria-live": "assertive",
        style: { padding: 16, color: "#b00" }
      },
      "Failed to scan libraries: ",
      r
    ) : C ? /* @__PURE__ */ i.createElement(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        style: { padding: 16, color: "#555" }
      },
      "No presets found. Adjust your search or filters."
    ) : /* @__PURE__ */ i.createElement(
      Vt,
      {
        height: R,
        width: S,
        columnWidth: jt,
        rowHeight: Ga,
        columnCount: m,
        rowCount: g
      },
      v
    )
  );
}
function Ya({ data: a }) {
  const r = a.nodes.reduce(
    (n, s, o) => (n[s.id] = { x: 40 + o * 120, y: 60 }, n),
    {}
  );
  return /* @__PURE__ */ i.createElement(
    "svg",
    {
      width: 320,
      height: 120,
      role: "img",
      "aria-label": "Branch visualization"
    },
    a.edges.map((n, s) => {
      const o = r[n.from], l = r[n.to];
      return !o || !l ? null : /* @__PURE__ */ i.createElement(
        "line",
        {
          key: s,
          x1: o.x,
          y1: o.y,
          x2: l.x,
          y2: l.y,
          stroke: "#999",
          strokeWidth: 2
        }
      );
    }),
    a.nodes.map((n) => {
      const s = r[n.id];
      return /* @__PURE__ */ i.createElement("g", { key: n.id }, /* @__PURE__ */ i.createElement("circle", { cx: s.x, cy: s.y, r: 12, fill: "#4a90e2" }), /* @__PURE__ */ i.createElement(
        "text",
        {
          x: s.x,
          y: s.y - 16,
          textAnchor: "middle",
          fontSize: 10,
          fill: "#333"
        },
        n.id
      ));
    })
  );
}
const Lt = {
  async simulate(a, e) {
    const { seeds: t } = e;
    return t.map((r) => ({
      seed: r,
      text: `Sample for ${a.name} (seed ${r})`
    }));
  },
  async branchMap(a) {
    const e = a.id.slice(0, 3) || "pre", t = [
      { id: `${e}-A` },
      { id: `${e}-B` },
      { id: `${e}-C` }
    ], r = [
      { from: t[0].id, to: t[1].id, weight: 1 },
      { from: t[1].id, to: t[2].id, weight: 2 }
    ];
    return { nodes: t, edges: r };
  }
};
function Ja() {
  return null;
}
function Ka() {
  const a = fe(
    () => Ja(),
    []
  );
  return {
    async simulate(e, t) {
      return a ? a.simulate(e, t) : Lt.simulate(e, t);
    },
    async branchMap(e) {
      return a ? a.branchMap(e) : Lt.branchMap(e);
    }
  };
}
function Xa() {
  const a = ce(/* @__PURE__ */ new Map());
  return {
    get(e) {
      return a.current.get(e);
    },
    set(e, t) {
      a.current.set(e, t);
    },
    has(e) {
      return a.current.has(e);
    }
  };
}
function Kt({
  open: a,
  selectedId: e
}) {
  const r = P((b) => b.filteredPresets).find((b) => b.id === e) || null, [n, s] = $(!1), [o, l] = $(null), [c, u] = $(null), [h, f] = $(!1), [S, R] = $(!1), [m, g] = $(null), [v, C] = $(null), { simulate: O, branchMap: w } = Ka(), Z = Xa(), W = async () => {
    if (r) {
      l(null), s(!0);
      try {
        const b = `sim:${r.id}`, T = Z.get(b), B = T || await O(r, { seeds: [0, 1, 2] });
        T || Z.set(b, B), u(B);
      } catch (b) {
        const T = b instanceof Error ? b.message : "Simulation failed";
        l(T);
      } finally {
        s(!1);
      }
    }
  }, I = async () => {
    const b = !h;
    if (f(b), b && !v && r) {
      g(null), R(!0);
      try {
        const T = `branch:${r.id}`, B = Z.get(T), J = B || await w(r);
        B || Z.set(T, J), C(J);
      } catch (T) {
        const B = T instanceof Error ? T.message : "Branch map failed";
        g(B);
      } finally {
        R(!1);
      }
    }
  };
  return /* @__PURE__ */ i.createElement(
    "aside",
    {
      "aria-label": "Details Drawer",
      "aria-hidden": !a,
      style: {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: a ? 360 : 0,
        overflow: "hidden",
        transition: "width 150ms",
        borderLeft: "1px solid #eee",
        background: "#fff",
        padding: a ? 12 : 0
      }
    },
    a && /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement("h3", { style: { marginTop: 0 } }, "Details ", r ? `— ${r.name}` : ""), /* @__PURE__ */ i.createElement("section", { "aria-labelledby": "simulate-title", "aria-busy": n }, /* @__PURE__ */ i.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      /* @__PURE__ */ i.createElement("h4", { id: "simulate-title", style: { margin: "8px 0" } }, "Sample Outputs"),
      /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          onClick: W,
          disabled: !r || n,
          "aria-label": "Simulate"
        },
        n ? "Simulating…" : "Simulate"
      )
    ), o && /* @__PURE__ */ i.createElement(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        style: { color: "crimson" }
      },
      o
    ), c && /* @__PURE__ */ i.createElement("ul", null, c.map((b) => /* @__PURE__ */ i.createElement("li", { key: b.seed }, /* @__PURE__ */ i.createElement("code", null, "#", b.seed), " ", b.text)))), /* @__PURE__ */ i.createElement(
      "section",
      {
        "aria-labelledby": "branch-title",
        "aria-busy": S,
        style: { marginTop: 16 }
      },
      /* @__PURE__ */ i.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        /* @__PURE__ */ i.createElement("h4", { id: "branch-title", style: { margin: "8px 0" } }, "Branch Viz"),
        /* @__PURE__ */ i.createElement(
          "button",
          {
            type: "button",
            onClick: I,
            "aria-pressed": h,
            "aria-label": "Toggle branch visualization"
          },
          h ? "Hide" : "Show"
        )
      ),
      m && /* @__PURE__ */ i.createElement(
        "div",
        {
          role: "status",
          "aria-live": "polite",
          style: { color: "crimson" }
        },
        m
      ),
      h && v && /* @__PURE__ */ i.createElement(Ya, { data: v })
    ))
  );
}
const Qa = Ut({
  toggleOpen: () => {
  },
  isWithinBounds: () => !1
});
function Xt({
  children: a
}) {
  const e = ce(null), t = P((l) => l.detailsOpen), r = P((l) => l.setDetailsOpen), n = P((l) => l.moveSelection), s = () => r(!t), o = () => {
    if (!e.current) return !1;
    const l = document.activeElement;
    return e.current.contains(l);
  };
  return X(() => {
    const l = (c) => {
      if (!o()) return;
      const u = c.target;
      if (u.tagName === "INPUT" || u.tagName === "TEXTAREA" || u.contentEditable === "true")
        return;
      let h = !0;
      ["ArrowUp", "k"].includes(c.key) ? n("up") : ["ArrowDown", "j"].includes(c.key) ? n("down") : ["ArrowLeft", "h"].includes(c.key) ? n("left") : ["ArrowRight", "l"].includes(c.key) ? n("right") : c.key === "Enter" && !c.ctrlKey && !c.metaKey ? r(!0) : c.key === "Escape" ? r(!1) : h = !1, h && (c.preventDefault(), c.stopPropagation());
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [n, r]), /* @__PURE__ */ i.createElement("div", { ref: e }, /* @__PURE__ */ i.createElement(Qa.Provider, { value: { toggleOpen: s, isWithinBounds: o } }, a));
}
function Ir({ onInsert: a }) {
  const e = P((r) => r.selectedPresetId), t = P((r) => r.detailsOpen);
  return /* @__PURE__ */ i.createElement(Xt, null, /* @__PURE__ */ i.createElement(
    "div",
    {
      className: "asset-browser",
      style: { display: "grid", gridTemplateColumns: "280px 1fr" }
    },
    /* @__PURE__ */ i.createElement(Jt, null),
    /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement(qa, { onInsert: a })),
    /* @__PURE__ */ i.createElement(Kt, { open: t, selectedId: e })
  ));
}
async function ct(a = "") {
  const e = a ? `${a.replace(/\/$/, "")}/graphs/manifest.json` : "/graphs/manifest.json", t = await fetch(e);
  if (!t.ok)
    throw new Error(`Failed to load graph manifest: ${t.status}`);
  const r = await t.json();
  return Array.isArray(r) ? r.filter(
    (n) => typeof (n == null ? void 0 : n.filename) == "string" && typeof (n == null ? void 0 : n.title) == "string"
  ) : [];
}
function Je({
  title: a = "Nothing here yet",
  message: e,
  helpUrl: t,
  actionLabel: r,
  onAction: n
}) {
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      style: {
        padding: 12,
        color: "#555",
        border: "1px dashed #ddd",
        borderRadius: 6,
        marginTop: 8
      }
    },
    a && /* @__PURE__ */ i.createElement("strong", { style: { display: "block", marginBottom: 4 } }, a),
    /* @__PURE__ */ i.createElement("div", null, e),
    /* @__PURE__ */ i.createElement(
      "div",
      {
        style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" }
      },
      r && n && /* @__PURE__ */ i.createElement("button", { type: "button", onClick: n }, r),
      t && /* @__PURE__ */ i.createElement("a", { href: t, target: "_blank", rel: "noreferrer" }, "Learn more")
    )
  );
}
function Me({
  title: a = "Something went wrong",
  message: e,
  retryLabel: t = "Retry",
  onRetry: r
}) {
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      role: "alert",
      "aria-live": "assertive",
      style: {
        padding: 12,
        color: "#b00",
        border: "1px solid #f3c2c2",
        background: "#fff6f6",
        borderRadius: 6,
        marginTop: 8
      }
    },
    a && /* @__PURE__ */ i.createElement("strong", { style: { display: "block", marginBottom: 4 } }, a),
    /* @__PURE__ */ i.createElement("div", null, e),
    r && /* @__PURE__ */ i.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ i.createElement("button", { type: "button", onClick: r }, t))
  );
}
async function er(a, e = {}) {
  const {
    retries: t = 2,
    minDelayMs: r = 200,
    maxDelayMs: n = 1500,
    factor: s = 2,
    jitter: o = !0,
    isRetryable: l = () => !0
  } = e;
  let c = 0;
  for (; ; )
    try {
      return await a();
    } catch (u) {
      if (!(c < t && l(u))) throw u;
      const f = Math.min(n, r * Math.pow(s, c)), S = o ? f * (0.5 + Math.random()) : f;
      await new Promise((R) => setTimeout(R, S)), c += 1;
    }
}
function tr() {
  const [a, e] = i.useState("idle"), [t, r] = i.useState(null), [n, s] = i.useState(!1), [o, l] = i.useState([]), c = i.useCallback(async () => {
    e("loading"), r(null), s(!1);
    try {
      const h = await ct("");
      l(h), e("done");
    } catch (h) {
      const f = h instanceof Error ? h.message : String(h ?? "Failed to load graph manifest");
      typeof f == "string" && /404/.test(f) ? (s(!0), l([]), e("done")) : (r(f), e("error"));
    }
  }, []), u = i.useCallback(async () => {
    e("loading"), r(null), s(!1);
    try {
      const h = await er(() => ct(""), {
        retries: 2,
        isRetryable: (f) => {
          const S = f instanceof Error ? f.message : String(f ?? "");
          return !/404/.test(S);
        }
      });
      l(h), e("done");
    } catch (h) {
      const f = h instanceof Error ? h.message : String(h ?? "Failed to load graph manifest");
      /404/.test(f) ? (s(!0), l([]), e("done")) : (r(f), e("error"));
    }
  }, []);
  return i.useEffect(() => {
    c();
  }, [c]), /* @__PURE__ */ i.createElement("section", { "aria-label": "Server Graphs", style: { padding: 12 } }, /* @__PURE__ */ i.createElement(
    "header",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ i.createElement("h2", { style: { margin: 0 } }, "Server"),
    /* @__PURE__ */ i.createElement("button", { type: "button", onClick: u, disabled: a === "loading" }, a === "loading" ? "Loading…" : "Retry")
  ), a === "error" && /* @__PURE__ */ i.createElement(
    Me,
    {
      message: t || "Failed to load graph manifest",
      onRetry: u
    }
  ), a === "done" && o.length === 0 ? /* @__PURE__ */ i.createElement(
    Je,
    {
      title: n ? "No server manifest found" : "No server graphs",
      message: "No server graphs available. See docs for adding demo assets.",
      helpUrl: n ? "docs/stories/1.15.error-empty-states-and-fallbacks.md" : void 0,
      actionLabel: n ? "Retry" : void 0,
      onAction: n ? u : void 0
    }
  ) : null, a === "done" && o.length > 0 && /* @__PURE__ */ i.createElement("ul", { "aria-label": "Server Graph List", style: { marginTop: 8 } }, o.map((h) => /* @__PURE__ */ i.createElement("li", { key: h.filename }, /* @__PURE__ */ i.createElement("strong", null, h.title), /* @__PURE__ */ i.createElement("div", { style: { fontSize: 12, color: "#555" } }, h.filename, " • ", new Date(h.updatedAt).toLocaleString())))));
}
async function ar(a = "") {
  const e = [
    "/assets/library/asset-fragments-manifest.json",
    `${a}/assets/library/asset-fragments-manifest.json`,
    "/asset-fragments-manifest.json"
  ];
  for (const t of e)
    try {
      const r = await fetch(t);
      if (!r.ok) continue;
      const n = await r.json();
      if ((n == null ? void 0 : n.type) !== "asset-fragments") continue;
      return n;
    } catch (r) {
      console.warn(`Failed to load asset fragments from ${t}:`, r);
      continue;
    }
  return null;
}
function rr() {
  const [a, e] = $(
    "idle"
  ), [t, r] = $(null), [n, s] = $(null), [o, l] = $("all"), [c, u] = $(""), h = i.useCallback(async () => {
    e("loading"), r(null);
    try {
      const m = await ar();
      m ? (s(m), e("done")) : (r("No asset fragments manifest found"), e("error"));
    } catch (m) {
      const g = m instanceof Error ? m.message : "Failed to load asset fragments";
      r(g), e("error");
    }
  }, []);
  X(() => {
    h();
  }, [h]);
  const f = fe(() => {
    if (!n) return [];
    const m = [];
    return Object.entries(n.categories).forEach(([g, v]) => {
      v.fragments.forEach((C) => {
        m.push({
          ...C,
          category: g,
          categoryName: v.name
        });
      });
    }), m;
  }, [n]), S = fe(() => {
    let m = f;
    if (o !== "all" && (m = m.filter((g) => g.category === o)), c) {
      const g = c.toLowerCase();
      m = m.filter(
        (v) => v.name.toLowerCase().includes(g) || v.type.toLowerCase().includes(g) || v.categoryName.toLowerCase().includes(g)
      );
    }
    return m;
  }, [f, o, c]), R = (m, g, v) => {
    const C = n == null ? void 0 : n.categories[v];
    if (!C) return;
    const O = {
      type: "asset-fragment",
      id: g.id,
      name: g.name,
      path: `${C.path}${g.file}`,
      fragmentType: g.type,
      nodes: g.nodes
    };
    m.dataTransfer.setData("application/json", JSON.stringify(O)), m.dataTransfer.effectAllowed = "copy";
  };
  return a === "loading" ? /* @__PURE__ */ i.createElement("div", { style: { padding: 20 } }, "Loading asset fragments...") : a === "error" ? /* @__PURE__ */ i.createElement(Me, { message: t || "Failed to load", onRetry: h }) : !n || f.length === 0 ? /* @__PURE__ */ i.createElement(
    Je,
    {
      title: "No Asset Fragments",
      message: "No asset fragments found. Generate some using the /asset command.",
      helpUrl: "/docs/asset-fragment-manifest-system.md"
    }
  ) : /* @__PURE__ */ i.createElement("section", { "aria-label": "Asset Fragments", style: { padding: 12 } }, /* @__PURE__ */ i.createElement("header", { style: { marginBottom: 16 } }, /* @__PURE__ */ i.createElement("h3", { style: { margin: "0 0 12px 0" } }, "Asset Fragments"), /* @__PURE__ */ i.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search fragments...",
      value: c,
      onChange: (m) => u(m.target.value),
      style: {
        width: "100%",
        padding: "6px 10px",
        marginBottom: 8,
        border: "1px solid #ddd",
        borderRadius: 4
      }
    }
  ), /* @__PURE__ */ i.createElement(
    "select",
    {
      value: o,
      onChange: (m) => l(m.target.value),
      style: {
        width: "100%",
        padding: "6px 10px",
        border: "1px solid #ddd",
        borderRadius: 4
      }
    },
    /* @__PURE__ */ i.createElement("option", { value: "all" }, "All Categories (", f.length, ")"),
    Object.entries(n.categories).map(([m, g]) => /* @__PURE__ */ i.createElement("option", { key: m, value: m }, g.icon, " ", g.name, " (", g.fragments.length, ")"))
  )), /* @__PURE__ */ i.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
        marginTop: 16
      }
    },
    S.map((m) => {
      const g = n.categories[m.category];
      return /* @__PURE__ */ i.createElement(
        "div",
        {
          key: m.id,
          draggable: !0,
          onDragStart: (v) => R(v, m, m.category),
          style: {
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 6,
            cursor: "grab",
            backgroundColor: "#f9f9f9",
            transition: "all 0.2s"
          },
          onMouseEnter: (v) => {
            v.currentTarget.style.backgroundColor = "#f0f0f0", v.currentTarget.style.transform = "translateY(-2px)", v.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
          },
          onMouseLeave: (v) => {
            v.currentTarget.style.backgroundColor = "#f9f9f9", v.currentTarget.style.transform = "translateY(0)", v.currentTarget.style.boxShadow = "none";
          }
        },
        /* @__PURE__ */ i.createElement("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 4 } }, m.name),
        /* @__PURE__ */ i.createElement("div", { style: { fontSize: 11, color: "#666", marginBottom: 8 } }, g == null ? void 0 : g.icon, " ", m.categoryName),
        /* @__PURE__ */ i.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ i.createElement(
          "span",
          {
            style: {
              fontSize: 10,
              padding: "2px 6px",
              backgroundColor: m.type === "SIMPLE" ? "#e8f5e9" : m.type === "CONTEXTUAL" ? "#fff3e0" : "#f3e5f5",
              borderRadius: 3,
              color: "#333"
            }
          },
          m.type
        ), /* @__PURE__ */ i.createElement(
          "span",
          {
            style: {
              fontSize: 10,
              padding: "2px 6px",
              backgroundColor: "#e3f2fd",
              borderRadius: 3,
              color: "#333"
            }
          },
          m.nodes,
          " nodes"
        ), m.options && /* @__PURE__ */ i.createElement(
          "span",
          {
            style: {
              fontSize: 10,
              padding: "2px 6px",
              backgroundColor: "#fce4ec",
              borderRadius: 3,
              color: "#333"
            }
          },
          m.options,
          " opts"
        ))
      );
    })
  ), n.statistics && /* @__PURE__ */ i.createElement(
    "footer",
    {
      style: {
        marginTop: 24,
        padding: 12,
        backgroundColor: "#f5f5f5",
        borderRadius: 6,
        fontSize: 12,
        color: "#666"
      }
    },
    /* @__PURE__ */ i.createElement("strong", null, "Library Stats:"),
    " ",
    n.statistics.total_fragments,
    " ",
    "fragments • ",
    n.statistics.total_nodes,
    " nodes •",
    " ",
    n.statistics.total_options,
    " options"
  ));
}
function nr({
  libraryView: a
}) {
  const [e, t] = i.useState(
    "library"
  );
  return /* @__PURE__ */ i.createElement(
    "section",
    {
      "aria-label": "Asset Browser Tabs",
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }
    },
    /* @__PURE__ */ i.createElement(
      "nav",
      {
        "aria-label": "Asset Views",
        style: {
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #333",
          padding: 8,
          flexShrink: 0
        }
      },
      /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          "aria-selected": e === "library",
          onClick: () => t("library")
        },
        "Library"
      ),
      /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          "aria-selected": e === "server",
          onClick: () => t("server")
        },
        "Server"
      ),
      /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          "aria-selected": e === "fragments",
          onClick: () => t("fragments")
        },
        "Fragments"
      )
    ),
    /* @__PURE__ */ i.createElement(
      "div",
      {
        style: {
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }
      },
      e === "library" && /* @__PURE__ */ i.createElement(
        "div",
        {
          "aria-label": "Library View",
          style: { height: "100%", display: "flex", flexDirection: "column" }
        },
        a ?? /* @__PURE__ */ i.createElement("em", null, "No library view provided.")
      ),
      e === "server" && /* @__PURE__ */ i.createElement(tr, null),
      e === "fragments" && /* @__PURE__ */ i.createElement(rr, null)
    )
  );
}
const Ye = class Ye {
  /**
   * Load the fragment manifest from the assets directory
   */
  static async loadManifest() {
    if (this.cachedManifest)
      return this.cachedManifest;
    try {
      const e = await fetch(this.manifestPath);
      if (!e.ok)
        throw new Error(`Failed to load manifest: ${e.statusText}`);
      const t = await e.json();
      return this.cachedManifest = t, t;
    } catch (e) {
      throw console.error("Error loading fragment manifest:", e), e;
    }
  }
  /**
   * Convert fragment manifest to preset format for the asset browser
   */
  static convertToPresets(e) {
    const t = [];
    return e.fragments && Array.isArray(e.fragments) && e.fragments.forEach((r) => {
      t.push({
        id: r.id,
        name: r.name,
        tags: r.tags || [],
        type: "graph",
        category: r.category,
        metadata: {
          nodes: r.nodeCount,
          file: r.path
        }
      });
    }), e.categories && Object.entries(e.categories).forEach(([r, n]) => {
      n.fragments.forEach((s) => {
        t.push({
          id: s.id,
          name: s.name,
          tags: [
            r,
            s.type.toLowerCase(),
            ...s.tags || []
          ],
          type: "graph",
          // Fragment manifests are always graph type
          category: n.name,
          metadata: {
            nodes: s.nodes,
            options: s.options,
            combinations: s.combinations,
            region: s.region,
            file: `${n.path}${s.file}`
          }
        });
      });
    }), t;
  }
  /**
   * Generate example output for a fragment based on its type
   */
  static generateExampleOutput(e) {
    const r = {
      SIMPLE: [
        "warm smile",
        "gentle grin",
        "subtle smirk",
        "bright beam"
      ],
      CONTEXTUAL: [
        "nervous smile with downcast eyes",
        "confident grin with raised chin",
        "tired smile with heavy lids",
        "surprised smile with wide eyes"
      ],
      "MULTI-ASPECT": [
        "bright emerald eyes with gold flecks",
        "deep brown eyes with warm undertones",
        "piercing blue eyes with silver rings",
        "hazel eyes shifting green to amber"
      ],
      PATTERN: [
        "dawn → midday → dusk → midnight",
        "spring → summer → autumn → winter",
        "calm → tense → explosive → resolution"
      ]
    }[e.type] || [
      `Example output for ${e.name}`
    ], s = e.id.split("").reduce((o, l) => o + l.charCodeAt(0), 0) % r.length;
    return r[s];
  }
  /**
   * Clear cached manifest
   */
  static clearCache() {
    this.cachedManifest = null;
  }
};
Ye.manifestPath = "/assets/library/asset-fragments-manifest.json", Ye.cachedManifest = null;
let Re = Ye;
function sr(a, e) {
  let t = 0, r = null;
  return (...n) => {
    const s = Date.now();
    s - t >= e ? (t = s, a(...n)) : (r && clearTimeout(r), r = setTimeout(
      () => {
        t = Date.now(), a(...n);
      },
      e - (s - t)
    ));
  };
}
function ir({
  sections: a,
  storageKey: e = "assetBrowser.sectionHeights",
  onHeightChange: t
}) {
  const r = () => {
    if (typeof window > "u") return {};
    const I = localStorage.getItem(e);
    if (I)
      try {
        return JSON.parse(I);
      } catch {
      }
    const b = {};
    return a.forEach((T) => {
      b[T.id] = {
        height: T.defaultHeight,
        collapsed: T.collapsed || !1
      };
    }), b;
  }, [n, s] = $(r), [o, l] = $(null), [c, u] = $(null), h = ce(0), f = ce(0), S = ce(""), R = ce(), m = re(
    (I) => {
      typeof window < "u" && localStorage.setItem(e, JSON.stringify(I));
    },
    [e]
  ), g = re(
    (I, b) => {
      var T;
      I.preventDefault(), I.stopPropagation(), l(b), h.current = I.clientY, f.current = ((T = n[b]) == null ? void 0 : T.height) || 200, S.current = b, u(f.current), document.body.style.cursor = "ns-resize", document.body.style.userSelect = "none", document.body.style.webkitUserSelect = "none", document.body.style.msUserSelect = "none";
    },
    [n]
  ), v = re(
    sr((I, b) => {
      u(b);
    }, 16),
    // ~60fps
    []
  ), C = re(
    (I) => {
      o && (R.current && cancelAnimationFrame(R.current), R.current = requestAnimationFrame(() => {
        const b = a.find((J) => J.id === o);
        if (!b) return;
        const T = I.clientY - h.current, B = Math.max(
          f.current + T,
          b.minHeight
        );
        v(o, B);
      }));
    },
    [o, a, v]
  ), O = re(() => {
    !o || c === null || (R.current && cancelAnimationFrame(R.current), s((I) => {
      const b = {
        ...I,
        [o]: {
          ...I[o],
          height: c
        }
      };
      return m(b), b;
    }), t == null || t(o, c), l(null), u(null), document.body.style.cursor = "", document.body.style.userSelect = "", document.body.style.webkitUserSelect = "", document.body.style.msUserSelect = "");
  }, [o, c, m, t]), w = re(
    (I) => {
      s((b) => {
        var B;
        const T = {
          ...b,
          [I]: {
            ...b[I],
            collapsed: !((B = b[I]) != null && B.collapsed)
          }
        };
        return m(T), T;
      });
    },
    [m]
  ), Z = re(
    (I) => {
      var T;
      const b = n[I];
      return b != null && b.collapsed ? 30 : o === I && c !== null ? c : (b == null ? void 0 : b.height) || ((T = a.find((B) => B.id === I)) == null ? void 0 : T.defaultHeight) || 200;
    },
    [n, a, o, c]
  ), W = re(
    (I) => {
      var b;
      return ((b = n[I]) == null ? void 0 : b.collapsed) || !1;
    },
    [n]
  );
  return X(() => {
    if (o) {
      const I = { passive: !1, capture: !0 }, b = { passive: !0, capture: !0 };
      return document.addEventListener("mousemove", C, I), document.addEventListener("mouseup", O, b), () => {
        document.removeEventListener("mousemove", C, I), document.removeEventListener("mouseup", O, b), R.current && cancelAnimationFrame(R.current);
      };
    }
  }, [o, C, O]), X(() => {
    const I = Object.keys(n), b = a.filter((T) => !I.includes(T.id));
    b.length > 0 && s((T) => {
      const B = { ...T };
      return b.forEach((J) => {
        B[J.id] = {
          height: J.defaultHeight,
          collapsed: J.collapsed || !1
        };
      }), B;
    });
  }, [a]), {
    getSectionHeight: Z,
    isSectionCollapsed: W,
    handleResizeStart: g,
    toggleCollapse: w,
    isResizing: o !== null,
    resizingSection: o
  };
}
const or = () => /* @__PURE__ */ i.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ i.createElement("rect", { x: "4", y: "6", width: "16", height: "2", rx: "1", fill: "currentColor" }), /* @__PURE__ */ i.createElement("rect", { x: "4", y: "11", width: "16", height: "2", rx: "1", fill: "currentColor" }), /* @__PURE__ */ i.createElement("rect", { x: "4", y: "16", width: "16", height: "2", rx: "1", fill: "currentColor" })), lr = () => /* @__PURE__ */ i.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ i.createElement("rect", { x: "4", y: "4", width: "7", height: "7", rx: "1", fill: "currentColor" }), /* @__PURE__ */ i.createElement("rect", { x: "13", y: "4", width: "7", height: "7", rx: "1", fill: "currentColor" }), /* @__PURE__ */ i.createElement("rect", { x: "4", y: "13", width: "7", height: "7", rx: "1", fill: "currentColor" }), /* @__PURE__ */ i.createElement("rect", { x: "13", y: "13", width: "7", height: "7", rx: "1", fill: "currentColor" })), cr = () => /* @__PURE__ */ i.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ i.createElement(
  "circle",
  {
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "2",
    fill: "none"
  }
), /* @__PURE__ */ i.createElement("rect", { x: "11", y: "10", width: "2", height: "7", rx: "1", fill: "currentColor" }), /* @__PURE__ */ i.createElement("rect", { x: "11", y: "6", width: "2", height: "2", rx: "1", fill: "currentColor" })), dr = () => /* @__PURE__ */ i.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ i.createElement(
  "path",
  {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    fill: "currentColor",
    opacity: "0.2"
  }
), /* @__PURE__ */ i.createElement("path", { d: "M14 2v6h6", fill: "none", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ i.createElement(
  "line",
  {
    x1: "8",
    y1: "13",
    x2: "16",
    y2: "13",
    stroke: "currentColor",
    strokeWidth: "2"
  }
), /* @__PURE__ */ i.createElement(
  "line",
  {
    x1: "8",
    y1: "17",
    x2: "16",
    y2: "17",
    stroke: "currentColor",
    strokeWidth: "2"
  }
)), zt = (a) => Array.from(new Set(a));
function ur({ onInsert: a }) {
  const [e, t] = $("list"), [r, n] = $("All"), [s, o] = $([]), [l, c] = $(""), [u, h] = $(null), [f, S] = $("1234"), [R, m] = $([
    "1234",
    "5678",
    "9012"
  ]), [g, v] = $("name"), [C, O] = $("asc"), [w, Z] = $(!1), [W, I] = $([]), {
    getSectionHeight: b,
    isSectionCollapsed: T,
    handleResizeStart: B,
    toggleCollapse: J
  } = ir({
    sections: [{ id: "tags", minHeight: 50, defaultHeight: 150 }],
    storageKey: "assetBrowser.sectionHeights"
  });
  X(() => {
    try {
      const d = localStorage.getItem("assetBrowser.previewSeeds");
      if (d) {
        const _ = JSON.parse(d);
        Array.isArray(_) && m(_);
      }
    } catch {
    }
  }, []);
  const [k, L] = $(!1), [H, Y] = $(null), [ee, ne] = $(0), [Ke, be] = $(!1), [je, Xe] = $("/presets"), ra = () => {
    n("All"), o([]), c("");
  }, na = fe(() => {
    const d = W.map((_) => _.category).filter((_) => !!_);
    return ["All", ...zt(d)];
  }, [W]), sa = fe(() => {
    const d = W.flatMap((_) => Array.isArray(_.tags) ? _.tags : []);
    return zt(d);
  }, [W]), Le = ce({ loadStartTime: 0, fragmentLoadTime: 0, renderTime: 0 });
  X(() => {
    let d = !1;
    async function _() {
      var F, z;
      Le.current.loadStartTime = performance.now(), L(!0), Y(null);
      try {
        const te = ((z = (F = import.meta) == null ? void 0 : F.env) == null ? void 0 : z.BASE_URL) || "/", le = [
          `${String(te).replace(/\/$/, "")}/presets/manifest.json`,
          "/presets/manifest.json",
          "/asset-browser/presets/manifest.json"
        ];
        let K = null, U = "/presets";
        for (const q of le)
          try {
            const Ze = await fetch(q, { cache: "no-cache" });
            if (!Ze.ok) continue;
            const Ee = (await Ze.text()).trim();
            if (Ee.startsWith("<!doctype") || Ee.startsWith("<html"))
              continue;
            K = JSON.parse(Ee), q.includes("/asset-browser/") ? U = "/asset-browser/presets" : U = "/presets";
            break;
          } catch {
          }
        if (!K) throw new Error("Manifest not found");
        const se = Array.isArray(K == null ? void 0 : K.presets) ? K.presets.map((q) => ({
          id: String(q.id),
          name: String(q.name ?? q.id),
          tags: Array.isArray(q.tags) ? q.tags : [],
          type: "graph",
          path: q.path,
          nodeTypes: Array.isArray(q.nodeTypes) ? q.nodeTypes : [],
          category: q.category ?? void 0,
          description: q.description ?? void 0,
          thumbnail: q.thumbnail ?? void 0
        })) : [];
        try {
          const q = performance.now(), Ze = await Re.loadManifest(), gt = Re.convertToPresets(Ze), Ee = [], Be = [];
          for (const ie of gt)
            Ee.push(ie);
          const da = Ee.map((ie) => {
            var bt, _t;
            return {
              id: ie.id,
              name: ie.name,
              tags: ie.tags,
              type: ie.type || "graph",
              category: ie.category,
              // Add metadata fields if they exist
              nodes: (bt = ie.metadata) == null ? void 0 : bt.nodes,
              path: ie.path || ((_t = ie.metadata) == null ? void 0 : _t.file)
            };
          }), yt = [...se, ...da];
          Le.current.fragmentLoadTime = performance.now() - q;
          const vt = performance.now() - Le.current.loadStartTime;
          process.env.NODE_ENV === "development" && (Be.length > 0 && console.warn(
            `Fragment validation: ${Be.length} fragments had issues`,
            Be
          ), vt > 100 && (console.warn(
            `Asset browser load time: ${vt.toFixed(2)}ms (target: <100ms)`
          ), console.log(
            `  - Fragments: ${Le.current.fragmentLoadTime.toFixed(2)}ms`
          ), console.log(`  - Total items: ${yt.length}`))), d || (I(yt), be(!1), Xe(U));
        } catch (q) {
          process.env.NODE_ENV === "development" && console.error("Failed to load fragments:", q), d || (I(se), be(!1), Xe(U));
        }
      } catch (te) {
        if (!d) {
          const le = te instanceof Error ? te.message : "Failed to load presets";
          Y(le);
          try {
            const K = await Yt.listPresets();
            I(K), be(!0), Xe("/presets");
          } catch {
          }
        }
      } finally {
        d || L(!1);
      }
    }
    return _(), () => {
      d = !0;
    };
  }, [ee]);
  const _e = fe(() => {
    let d = [...W];
    if (r !== "All" && (d = d.filter((_) => _.category === r)), s.length > 0 && (d = d.filter(
      (_) => s.some((F) => _.tags.includes(F))
    )), l) {
      const _ = l.toLowerCase();
      d = d.filter(
        (F) => F.name.toLowerCase().includes(_) || (F.category || "").toLowerCase().includes(_) || F.tags.some((z) => z.toLowerCase().includes(_))
      );
    }
    return d.sort((_, F) => {
      let z = 0;
      switch (g) {
        case "name":
          z = _.name.localeCompare(F.name);
          break;
        case "category":
          z = (_.category || "").localeCompare(F.category || "");
          break;
        case "complexity":
          z = (_.complexity || "").localeCompare(F.complexity || "");
          break;
        case "nodes":
          z = (_.nodes || 0) - (F.nodes || 0);
          break;
      }
      return C === "asc" ? z : -z;
    }), d;
  }, [
    r,
    s,
    l,
    g,
    C,
    W
  ]), ze = (d) => {
    d === g ? O(C === "asc" ? "desc" : "asc") : (v(d), O("asc"));
  }, ia = (d) => {
    o(
      (_) => _.includes(d) ? _.filter((F) => F !== d) : [..._, d]
    );
  }, xe = (d) => {
    a == null || a(d);
  }, Qe = (d) => {
    if (d)
      return /^https?:\/\//i.test(d) || d.startsWith("/") ? d : d.startsWith("./") ? d.includes("facial-features") || d.includes("hair") || d.includes("body-silhouette") || d.includes("emotion-mood") || d.includes("action-dynamics") || d.includes("setting-environment") ? `/assets/library/${d.slice(2)}` : `${je}/${d.slice(2)}` : `${je}/${d}`;
  }, oa = (d) => {
    var _, F;
    try {
      const z = d.data;
      if (z != null && z.nodes) {
        const le = z.nodes.filter(
          (U) => {
            var se;
            return U.type === "Output" || U.type === "output" || ((se = U.data) == null ? void 0 : se.type) === "Output";
          }
        );
        if (le.length > 0) {
          const U = ((_ = le[0].data) == null ? void 0 : _.template) || le[0].template;
          if (U)
            return U.length > 80 ? U.substring(0, 77) + "..." : U;
        }
        const K = z.nodes.filter(
          (U) => {
            var se;
            return U.type === "WeightedChoice" || U.type === "weightedChoice" || ((se = U.data) == null ? void 0 : se.type) === "WeightedChoice";
          }
        );
        if (K.length > 0) {
          const U = ((F = K[0].data) == null ? void 0 : F.options) || [];
          if (U.length > 0)
            return (typeof U[0] == "object" ? U[0].text : U[0]) || "[Weighted choice output]";
        }
      }
      return {
        "emotion-mood": "softly creased with worry",
        "body-silhouette": "weathered and lean",
        "facial-features": "crow's-footed eyes",
        "setting-environment": "sun-dappled clearing",
        character: "Marcus the Bold",
        narrative: "Once upon a midnight dreary...",
        dialogue: '"I never expected to see you here," she said.',
        items: "a worn leather satchel",
        "action-dynamics": "lunged forward with desperate energy"
      }[d.category || ""] || "[Preview not available]";
    } catch (z) {
      return console.error("Error generating sample output:", z), "[Error generating preview]";
    }
  }, ut = (d, _) => {
    try {
      const F = Qe(_.path), z = JSON.stringify({
        id: _.id,
        name: _.name,
        tags: _.tags,
        type: _.type ?? "graph",
        path: F || _.path,
        nodeTypes: _.nodeTypes
      });
      d.dataTransfer.setData("application/x-preset", z), d.dataTransfer.setData("preset", z), d.dataTransfer.setData("text/plain", _.name), d.dataTransfer.effectAllowed = "copy";
    } catch {
    }
  }, [Ie, la] = $(() => {
    const d = localStorage.getItem("assetBrowser.detailsPanelHeight");
    return d ? parseInt(d, 10) : 120;
  }), [mt, ft] = $(!1), ht = i.useRef(0), pt = i.useRef(0), ca = (d) => {
    d.preventDefault(), ft(!0), ht.current = d.clientY, pt.current = Ie, document.body.style.cursor = "ns-resize", document.body.style.userSelect = "none";
  };
  return X(() => {
    if (!mt) return;
    const d = (F) => {
      const z = ht.current - F.clientY, te = Math.min(
        200,
        Math.max(100, pt.current + z)
      );
      la(te);
    }, _ = () => {
      ft(!1), document.body.style.cursor = "", document.body.style.userSelect = "", localStorage.setItem(
        "assetBrowser.detailsPanelHeight",
        Ie.toString()
      );
    };
    return document.addEventListener("mousemove", d), document.addEventListener("mouseup", _), () => {
      document.removeEventListener("mousemove", d), document.removeEventListener("mouseup", _);
    };
  }, [mt, Ie]), /* @__PURE__ */ i.createElement("div", { className: "asset-browser-pro-horizontal" }, /* @__PURE__ */ i.createElement("div", { className: "browser-search-bar" }, /* @__PURE__ */ i.createElement("div", { className: "view-controls-section" }, /* @__PURE__ */ i.createElement("div", { className: "segmented-icon-group" }, /* @__PURE__ */ i.createElement(
    "button",
    {
      className: `view-toggle-btn ${e === "list" ? "active" : ""}`,
      onClick: () => t("list"),
      title: "List View",
      "aria-pressed": e === "list"
    },
    /* @__PURE__ */ i.createElement(or, null)
  ), /* @__PURE__ */ i.createElement(
    "button",
    {
      className: `view-toggle-btn ${e === "grid" ? "active" : ""}`,
      onClick: () => t("grid"),
      title: "Grid View",
      "aria-pressed": e === "grid"
    },
    /* @__PURE__ */ i.createElement(lr, null)
  ), /* @__PURE__ */ i.createElement(
    "button",
    {
      className: `view-toggle-btn ${w ? "active" : ""}`,
      onClick: () => Z(!w),
      title: "Show Details",
      "aria-pressed": w
    },
    /* @__PURE__ */ i.createElement(cr, null)
  ))), /* @__PURE__ */ i.createElement("div", { className: "browser-search-field" }, /* @__PURE__ */ i.createElement("span", { className: "browser-search-icon" }, "🔍"), /* @__PURE__ */ i.createElement(
    "input",
    {
      type: "text",
      className: "browser-search-input",
      placeholder: "Search presets...",
      "aria-label": "Search presets",
      value: l,
      onChange: (d) => c(d.target.value)
    }
  ), l && /* @__PURE__ */ i.createElement(
    "button",
    {
      className: "search-clear-btn",
      "aria-label": "Clear search",
      onClick: () => c("")
    },
    "×"
  )), (r !== "All" || s.length > 0 || l) && /* @__PURE__ */ i.createElement(
    "button",
    {
      className: "clear-filters-btn",
      onClick: ra,
      title: "Clear all filters"
    },
    "Clear Filters"
  )), /* @__PURE__ */ i.createElement(
    "div",
    {
      className: `ae-section-full-width ${T("categories") ? "collapsed" : ""}`
    },
    /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "ae-section-header-full",
        onClick: () => J("categories")
      },
      /* @__PURE__ */ i.createElement("span", { className: "ae-section-arrow" }, T("categories") ? "▶" : "▼"),
      /* @__PURE__ */ i.createElement("span", null, "Categories")
    ),
    /* @__PURE__ */ i.createElement("div", { className: "ae-section-content-full" }, /* @__PURE__ */ i.createElement("div", { className: "keyword-row" }, /* @__PURE__ */ i.createElement(
      "button",
      {
        className: `keyword-btn category ${r === "All" ? "active" : ""}`,
        onClick: () => n("All")
      },
      "All"
    ), na.slice(1).map((d) => /* @__PURE__ */ i.createElement(
      "button",
      {
        key: d,
        className: `keyword-btn category ${r === d ? "active" : ""}`,
        onClick: () => n(d)
      },
      d
    ))))
  ), /* @__PURE__ */ i.createElement(
    "div",
    {
      className: `ae-section-full-width ${T("tags") ? "collapsed" : ""}`
    },
    /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "ae-section-header-full",
        onClick: () => J("tags")
      },
      /* @__PURE__ */ i.createElement("span", { className: "ae-section-arrow" }, T("tags") ? "▶" : "▼"),
      /* @__PURE__ */ i.createElement("span", null, "Tags")
    ),
    /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "ae-section-content-full",
        style: {
          height: T("tags") ? 0 : `${b("tags")}px`,
          minHeight: T("tags") ? 0 : "50px",
          maxHeight: T("tags") ? 0 : "400px",
          overflowY: "auto"
        }
      },
      /* @__PURE__ */ i.createElement("div", { className: "keyword-row" }, sa.map((d) => /* @__PURE__ */ i.createElement(
        "button",
        {
          key: d,
          className: `keyword-btn tag ${s.includes(d) ? "active" : ""}`,
          onClick: () => ia(d),
          "aria-pressed": s.includes(d)
        },
        d
      )))
    ),
    !T("tags") && /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "ae-resize-handle-section",
        onMouseDown: (d) => B(d, "tags")
      }
    )
  ), /* @__PURE__ */ i.createElement("div", { className: "browser-main-content", style: { position: "relative" } }, /* @__PURE__ */ i.createElement(
    "div",
    {
      className: "content-wrapper",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: w ? `${Ie}px` : 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    },
    k && /* @__PURE__ */ i.createElement("div", { style: { padding: 8, color: "#9ca3af" } }, "Loading presets…"),
    H && !k && /* @__PURE__ */ i.createElement(
      "div",
      {
        style: {
          padding: 8,
          color: "#ef4444",
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      /* @__PURE__ */ i.createElement("span", null, "Failed to load presets: ", H),
      /* @__PURE__ */ i.createElement(
        "button",
        {
          className: "retry-btn",
          onClick: () => ne((d) => d + 1)
        },
        "Retry"
      )
    ),
    Ke && !k && /* @__PURE__ */ i.createElement("div", { style: { padding: 8, color: "#b45309" } }, "Using fallback presets (manifest not available)."),
    e === "list" ? /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "preset-list-container",
        style: {
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }
      },
      /* @__PURE__ */ i.createElement("div", { className: "preset-list-header" }, /* @__PURE__ */ i.createElement("div", { className: "column-header icon-col" }), /* @__PURE__ */ i.createElement(
        "div",
        {
          className: `column-header sortable ${g === "name" ? `sorted-${C}` : ""}`,
          onClick: () => ze("name")
        },
        "Name"
      ), /* @__PURE__ */ i.createElement(
        "div",
        {
          className: `column-header sortable ${g === "category" ? `sorted-${C}` : ""}`,
          onClick: () => ze("category")
        },
        "Category"
      ), /* @__PURE__ */ i.createElement(
        "div",
        {
          className: `column-header sortable ${g === "complexity" ? `sorted-${C}` : ""}`,
          onClick: () => ze("complexity")
        },
        "Level"
      ), /* @__PURE__ */ i.createElement(
        "div",
        {
          className: `column-header sortable ${g === "nodes" ? `sorted-${C}` : ""}`,
          onClick: () => ze("nodes")
        },
        "Nodes"
      ), /* @__PURE__ */ i.createElement("div", { className: "column-header action-col" }, "Action")),
      /* @__PURE__ */ i.createElement("div", { className: "preset-list-body" }, !k && !H && _e.length === 0 && /* @__PURE__ */ i.createElement("div", { style: { padding: 12, color: "#9ca3af" } }, "No presets match your filters."), _e.map((d) => /* @__PURE__ */ i.createElement(
        "div",
        {
          key: d.id,
          className: `preset-list-item ${u === d.id ? "selected" : ""}`,
          onClick: () => {
            h(d.id), w || Z(!0);
          },
          onDoubleClick: () => xe(d),
          draggable: !0,
          onDragStart: (_) => ut(_, d),
          role: "button",
          tabIndex: 0,
          onKeyDown: (_) => {
            _.key === "Enter" ? (_.preventDefault(), xe(d)) : _.key === " " && (_.preventDefault(), h(d.id), Z(!0));
          }
        },
        /* @__PURE__ */ i.createElement("div", { className: "preset-icon" }, d.thumbnail ? /* @__PURE__ */ i.createElement(
          "img",
          {
            src: Qe(d.thumbnail),
            alt: `Thumbnail for ${d.name}`,
            style: {
              width: 16,
              height: 16,
              objectFit: "cover",
              borderRadius: 2
            }
          }
        ) : /* @__PURE__ */ i.createElement(dr, null)),
        /* @__PURE__ */ i.createElement("div", { className: "preset-name" }, d.name),
        /* @__PURE__ */ i.createElement("div", { className: "preset-category" }, d.category || ""),
        /* @__PURE__ */ i.createElement("div", { className: "preset-meta" }, d.complexity || ""),
        /* @__PURE__ */ i.createElement("div", { className: "preset-meta" }, d.nodes || 0),
        /* @__PURE__ */ i.createElement("div", { className: "preset-action" }, /* @__PURE__ */ i.createElement(
          "button",
          {
            className: "insert-btn",
            onClick: (_) => {
              _.stopPropagation(), xe(d);
            },
            "aria-label": `Insert ${d.name}`
          },
          "+"
        ))
      )))
    ) : /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "preset-grid-container",
        style: { height: "100%", overflow: "auto" }
      },
      !k && !H && _e.length === 0 && /* @__PURE__ */ i.createElement("div", { style: { padding: 12, color: "#9ca3af" } }, "No presets match your filters."),
      _e.map((d) => /* @__PURE__ */ i.createElement(
        "div",
        {
          key: d.id,
          className: `preset-card-compact ${u === d.id ? "selected" : ""}`,
          onClick: () => {
            h(d.id), w || Z(!0);
          },
          onDoubleClick: () => xe(d),
          draggable: !0,
          onDragStart: (_) => ut(_, d),
          role: "button",
          tabIndex: 0,
          onKeyDown: (_) => {
            _.key === "Enter" ? (_.preventDefault(), xe(d)) : _.key === " " && (_.preventDefault(), h(d.id), w || Z(!0));
          }
        },
        /* @__PURE__ */ i.createElement(
          "button",
          {
            className: "preset-insert-btn",
            onClick: (_) => {
              _.stopPropagation(), xe(d);
            },
            "aria-label": `Insert ${d.name}`
          },
          "+"
        ),
        /* @__PURE__ */ i.createElement("div", { className: "preset-card-header" }, /* @__PURE__ */ i.createElement("div", { className: "preset-card-icon" }, d.thumbnail ? /* @__PURE__ */ i.createElement(
          "img",
          {
            src: Qe(d.thumbnail),
            alt: "",
            style: {
              width: 20,
              height: 20,
              objectFit: "cover",
              borderRadius: 2
            }
          }
        ) : /* @__PURE__ */ i.createElement(i.Fragment, null, "📄")), /* @__PURE__ */ i.createElement("div", { className: "preset-card-title" }, d.name)),
        /* @__PURE__ */ i.createElement("div", { className: "preset-card-meta" }, /* @__PURE__ */ i.createElement("span", { className: "preset-card-tag" }, d.category || "Uncategorized"), /* @__PURE__ */ i.createElement("span", { className: "preset-card-tag" }, d.nodes || 0, " nodes"))
      ))
    )
  ), w && u && (() => {
    var _, F, z;
    const d = _e.find((te) => te.id === u);
    return d ? /* @__PURE__ */ i.createElement(
      "div",
      {
        className: "details-panel-bottom",
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${Ie}px`,
          minHeight: "120px",
          maxHeight: "200px",
          overflow: "hidden",
          zIndex: 20,
          display: "flex",
          flexDirection: "column"
        }
      },
      /* @__PURE__ */ i.createElement(
        "div",
        {
          className: "resize-handle-horizontal",
          onMouseDown: ca,
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            cursor: "ns-resize",
            background: "transparent",
            zIndex: 10
          }
        }
      ),
      /* @__PURE__ */ i.createElement(
        "div",
        {
          style: {
            padding: "6px 12px 4px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start"
          }
        },
        /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement("div", { style: { fontSize: "12px", fontWeight: 600 } }, d.name), /* @__PURE__ */ i.createElement("div", { style: { fontSize: "10px", color: "#888" } }, d.category || "uncategorized")),
        /* @__PURE__ */ i.createElement("div", { style: { textAlign: "right", fontSize: "10px" } }, /* @__PURE__ */ i.createElement("div", { style: { color: "#888" } }, "CATEGORY:", " ", /* @__PURE__ */ i.createElement("span", { style: { color: "#ccc" } }, d.category || "uncategorized")), /* @__PURE__ */ i.createElement("div", { style: { color: "#888" } }, "COMPLEXITY:", " ", /* @__PURE__ */ i.createElement("span", { style: { color: "#ccc" } }, d.complexity || "N/A"), " ", "• NODES:", " ", /* @__PURE__ */ i.createElement("span", { style: { color: "#ccc" } }, d.nodes || 0)))
      ),
      /* @__PURE__ */ i.createElement(
        "div",
        {
          style: {
            flex: 1,
            overflowY: "auto",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }
        },
        /* @__PURE__ */ i.createElement(
          "div",
          {
            style: {
              fontSize: "11px",
              color: "#ccc",
              lineHeight: "1.4",
              marginBottom: "4px"
            }
          },
          d.description || `A ${d.category || "graph"} fragment with ${d.nodes || 0} nodes. ${(_ = d.nodeTypes) != null && _.includes("WeightedChoice") ? "Uses weighted random selection to generate variations." : "Generates consistent output based on the graph structure."}`
        ),
        /* @__PURE__ */ i.createElement(
          "div",
          {
            style: {
              marginBottom: "8px",
              paddingBottom: "8px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
            }
          },
          /* @__PURE__ */ i.createElement(
            "div",
            {
              style: {
                fontSize: "10px",
                color: "#888",
                marginBottom: "4px"
              }
            },
            "SAMPLE OUTPUT"
          ),
          /* @__PURE__ */ i.createElement(
            "div",
            {
              style: {
                fontSize: "11px",
                color: "#ccc",
                fontStyle: "italic",
                paddingLeft: "8px"
              }
            },
            '"',
            oa(d),
            '"'
          )
        ),
        /* @__PURE__ */ i.createElement(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              fontSize: "11px",
              color: "#888"
            }
          },
          /* @__PURE__ */ i.createElement("div", { style: { fontWeight: 600, color: "#ccc" } }, "GRAPH STRUCTURE"),
          /* @__PURE__ */ i.createElement("div", { style: { paddingLeft: "8px" } }, "• ", d.nodes || 0, " nodes"),
          ((F = d.data) == null ? void 0 : F.nodes) && /* @__PURE__ */ i.createElement(i.Fragment, null, (z = d.data.nodes) == null ? void 0 : z.slice(0, 2).map((te, le) => {
            var K;
            return /* @__PURE__ */ i.createElement(
              "div",
              {
                key: le,
                style: { paddingLeft: "16px", fontSize: "10px" }
              },
              "- ",
              te.type || ((K = te.data) == null ? void 0 : K.type) || "Node"
            );
          }))
        )
      )
    ) : null;
  })()), /* @__PURE__ */ i.createElement("div", { className: "browser-statusbar", "aria-live": "polite" }, /* @__PURE__ */ i.createElement("div", { className: "status-left" }, _e.length, " results", r !== "All" ? ` • Category: ${r}` : "", s.length ? ` • Tags: ${s.join(", ")}` : "", l ? ` • Search: "${l}"` : ""), /* @__PURE__ */ i.createElement("div", { className: "status-right" }, "Enter: Insert • Space: Preview")));
}
const mr = ({
  onInsert: a
}) => /* @__PURE__ */ i.createElement(nr, { libraryView: /* @__PURE__ */ i.createElement(ur, { onInsert: a }) });
function we(a) {
  var r;
  if (typeof process < "u" && typeof process.env < "u" && Object.prototype.hasOwnProperty.call(process.env, a))
    return process.env[a];
  const e = (r = globalThis.import) == null ? void 0 : r.meta, t = (e == null ? void 0 : e.env) ?? globalThis.__env__;
  if (t && Object.prototype.hasOwnProperty.call(t, a)) {
    const n = t[a];
    return typeof n == "string" ? n : n !== null ? String(n) : void 0;
  }
}
function fr(a, e = !0) {
  if (a == null || a === "")
    return e;
  if (typeof a == "boolean")
    return a;
  const t = String(a).toLowerCase().trim();
  return ["1", "true", "yes", "on", "enabled"].includes(t) ? !0 : ["0", "false", "no", "off", "disabled"].includes(t) ? !1 : e;
}
function hr() {
  const a = we("NEXT_PUBLIC_SUPABASE_URL") || we("VITE_SUPABASE_URL") || "", e = we("NEXT_PUBLIC_SUPABASE_ANON_KEY") || we("VITE_SUPABASE_ANON_KEY") || "", t = we("NEXT_PUBLIC_FEATURE_SUPABASE") ?? we("VITE_FEATURE_SUPABASE"), r = fr(t, !0), n = !!(a && e);
  return { url: a, anonKey: e, flagRaw: t, enabledByFlag: r, hasEnv: n, enabled: r && n };
}
function pr() {
  return hr().enabled;
}
function Qt() {
  return pr();
}
const Zt = "psg.devUserId";
function gr() {
  const a = (process.env.NEXT_PUBLIC_FEATURE_DEV_USER || process.env.VITE_FEATURE_DEV_USER || "").toLowerCase();
  return a === "1" || a === "true";
}
const ea = i.createContext({ userId: null });
function $r({ children: a, supabase: e }) {
  const [t, r] = i.useState(null);
  i.useEffect(() => {
    let s;
    async function o() {
      var l, c;
      if (gr() && typeof window < "u")
        try {
          let u = window.localStorage.getItem(Zt);
          u || (u = `dev-${Math.random().toString(36).slice(2, 10)}`, window.localStorage.setItem(Zt, u)), r(u);
          return;
        } catch {
        }
      if (e && e.auth)
        try {
          const { data: u } = await e.auth.getSession(), h = ((c = (l = u.session) == null ? void 0 : l.user) == null ? void 0 : c.id) ?? null;
          if (r(h), typeof e.auth.onAuthStateChange == "function") {
            const f = e.auth.onAuthStateChange((S, R) => {
              var m;
              r(((m = R == null ? void 0 : R.user) == null ? void 0 : m.id) ?? null);
            });
            f && f.data && f.data.subscription && typeof f.data.subscription.unsubscribe == "function" && (s = () => f.data.subscription.unsubscribe());
          }
          return;
        } catch {
          r(null);
          return;
        }
      r(null);
    }
    return o(), () => {
      s && s();
    };
  }, [e]);
  const n = i.useMemo(() => ({ userId: t }), [t]);
  return /* @__PURE__ */ i.createElement(ea.Provider, { value: n }, a);
}
function ta() {
  return i.useContext(ea);
}
async function yr(a) {
  const e = await fetch(a);
  if (!e.ok) throw new Error(`Failed to download graph (${e.status})`);
  return e.json();
}
function aa() {
  return /* @__PURE__ */ i.createElement("span", { "aria-label": "loading", role: "status" }, "Loading…");
}
function Pr({
  isOpen: a,
  onClose: e,
  onOpenGraph: t,
  userId: r,
  enableSupabase: n,
  supabaseList: s,
  supabaseGet: o
}) {
  const [l, c] = i.useState(
    "server"
  ), { userId: u } = ta(), h = r ?? u ?? null, f = n ?? Qt(), S = !!h && !!s && !!o && f;
  return a ? /* @__PURE__ */ i.createElement(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Open Graph",
      style: Fe.backdrop
    },
    /* @__PURE__ */ i.createElement("div", { style: Fe.dialog }, /* @__PURE__ */ i.createElement("header", { style: Fe.header }, /* @__PURE__ */ i.createElement("h2", { style: { margin: 0 } }, "Open"), /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        onClick: e,
        "aria-label": "Close Open Dialog"
      },
      "✕"
    )), /* @__PURE__ */ i.createElement("nav", { "aria-label": "Open Tabs", style: Fe.tabs }, /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        "aria-selected": l === "server",
        onClick: () => c("server")
      },
      "Server"
    ), S && /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        "aria-selected": l === "supabase",
        onClick: () => c("supabase")
      },
      "Supabase"
    ), /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        "aria-selected": l === "local",
        onClick: () => c("local")
      },
      "Local"
    )), /* @__PURE__ */ i.createElement("section", { style: { padding: 12 } }, l === "server" ? /* @__PURE__ */ i.createElement(br, { onOpenGraph: t }) : l === "local" ? /* @__PURE__ */ i.createElement(_r, { onOpenGraph: t }) : (
      // tab === 'supabase'
      S ? /* @__PURE__ */ i.createElement(
        vr,
        {
          userId: h,
          onOpenGraph: t,
          listFn: s,
          getFn: o
        }
      ) : null
    )))
  ) : null;
}
function vr({
  userId: a,
  onOpenGraph: e,
  listFn: t,
  getFn: r
}) {
  const [n, s] = i.useState("idle"), [o, l] = i.useState(null), [c, u] = i.useState([]), [h, f] = i.useState(null), [S, R] = i.useState(0), m = i.useCallback(async () => {
    s("loading"), l(null);
    const C = await t(a);
    if (!C.ok) {
      l(C.error.message || "Failed to list graphs"), s("error");
      return;
    }
    u(C.data), R(0), s("done");
  }, [a, t]);
  i.useEffect(() => {
    m();
  }, [m]);
  async function g(C) {
    f(C);
    const O = await r(a, C);
    if (!O.ok) {
      l(O.error.message || "Failed to open graph"), f(null);
      return;
    }
    try {
      const w = JSON.parse(O.data);
      e(w);
    } catch {
      l("Invalid graph JSON");
    } finally {
      f(null);
    }
  }
  function v(C) {
    if (c.length !== 0) {
      if (C.key === "ArrowDown")
        C.preventDefault(), R((O) => Math.min(O + 1, c.length - 1));
      else if (C.key === "ArrowUp")
        C.preventDefault(), R((O) => Math.max(O - 1, 0));
      else if (C.key === "Enter") {
        C.preventDefault();
        const O = c[S];
        O && g(O.name);
      }
    }
  }
  return /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ i.createElement("button", { type: "button", onClick: m, disabled: n === "loading" }, n === "loading" ? "Loading…" : "Retry"), n === "loading" && /* @__PURE__ */ i.createElement(aa, null)), o && /* @__PURE__ */ i.createElement(Me, { message: o, onRetry: m }), n === "done" && c.length === 0 && /* @__PURE__ */ i.createElement(Je, { message: "No Supabase graphs available." }), n === "done" && c.length > 0 && /* @__PURE__ */ i.createElement(
    "ul",
    {
      "aria-label": "Supabase Graphs",
      role: "listbox",
      tabIndex: 0,
      onKeyDown: v,
      style: { marginTop: 8, outline: "none" }
    },
    c.map((C, O) => /* @__PURE__ */ i.createElement(
      "li",
      {
        key: C.name,
        role: "option",
        "aria-selected": S === O,
        style: {
          background: S === O ? "#eef" : void 0,
          padding: 6,
          borderRadius: 4
        },
        onMouseEnter: () => R(O)
      },
      /* @__PURE__ */ i.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ i.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ i.createElement("strong", null, C.name)), /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          onClick: () => g(C.name),
          disabled: !!h
        },
        h === C.name ? "Opening…" : "Open"
      ))
    ))
  ));
}
function br({ onOpenGraph: a }) {
  const [e, t] = i.useState("idle"), [r, n] = i.useState(null), [s, o] = i.useState([]), [l, c] = i.useState(null), [u, h] = i.useState(0), f = i.useCallback(async () => {
    t("loading"), n(null);
    try {
      const m = await ct("");
      o(m), t("done"), h(0);
    } catch (m) {
      const g = m instanceof Error ? m.message : "Failed to load graph manifest";
      /404/.test(String(g)) ? (o([]), t("done")) : (n(g), t("error"));
    }
  }, []);
  i.useEffect(() => {
    f();
  }, [f]);
  async function S(m) {
    c(m);
    try {
      const g = await yr(`/graphs/${m}`);
      a(g);
    } catch (g) {
      const v = g instanceof Error ? g.message : "Failed to open graph";
      n(v);
    } finally {
      c(null);
    }
  }
  function R(m) {
    if (s.length !== 0) {
      if (m.key === "ArrowDown")
        m.preventDefault(), h((g) => Math.min(g + 1, s.length - 1));
      else if (m.key === "ArrowUp")
        m.preventDefault(), h((g) => Math.max(g - 1, 0));
      else if (m.key === "Enter") {
        m.preventDefault();
        const g = s[u];
        g && S(g.filename);
      }
    }
  }
  return /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ i.createElement("button", { type: "button", onClick: f, disabled: e === "loading" }, e === "loading" ? "Loading…" : "Retry"), e === "loading" && /* @__PURE__ */ i.createElement(aa, null)), r && /* @__PURE__ */ i.createElement(Me, { message: r, onRetry: f }), e === "done" && s.length === 0 && /* @__PURE__ */ i.createElement(Je, { message: "No server graphs available." }), e === "done" && s.length > 0 && /* @__PURE__ */ i.createElement(
    "ul",
    {
      "aria-label": "Server Graphs",
      role: "listbox",
      tabIndex: 0,
      onKeyDown: R,
      style: { marginTop: 8, outline: "none" }
    },
    s.map((m, g) => /* @__PURE__ */ i.createElement(
      "li",
      {
        key: m.filename,
        role: "option",
        "aria-selected": u === g,
        style: {
          background: u === g ? "#eef" : void 0,
          padding: 6,
          borderRadius: 4
        },
        onMouseEnter: () => h(g)
      },
      /* @__PURE__ */ i.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ i.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ i.createElement("strong", null, m.title), /* @__PURE__ */ i.createElement("div", { style: { fontSize: 12, color: "#555" } }, m.filename, " • ", new Date(m.updatedAt).toLocaleString())), /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          onClick: () => S(m.filename),
          disabled: !!l
        },
        l === m.filename ? "Opening…" : "Open"
      ))
    ))
  ));
}
function _r({ onOpenGraph: a }) {
  const [e, t] = i.useState(null);
  function r(n) {
    var c;
    t(null);
    const s = (c = n.target.files) == null ? void 0 : c[0];
    if (!s) return;
    const o = s.name.toLowerCase(), l = new FileReader();
    l.onerror = () => t("Failed to read file"), l.onload = () => {
      try {
        const u = String(l.result || ""), h = JSON.parse(u);
        o.endsWith(".graph.json") || o.endsWith(".psg") ? a(h) : t("Unsupported file type");
      } catch {
        t("Invalid file");
      }
    }, l.readAsText(s);
  }
  return /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement("label", null, /* @__PURE__ */ i.createElement("span", { style: { display: "block", marginBottom: 4 } }, "Choose a .psg or .graph.json file"), /* @__PURE__ */ i.createElement(
    "input",
    {
      "aria-label": "Local Graph File",
      type: "file",
      accept: ".psg,.graph.json,application/json",
      onChange: r
    }
  )), e && /* @__PURE__ */ i.createElement(Me, { message: e }));
}
const Fe = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dialog: {
    background: "#fff",
    width: 560,
    maxWidth: "95vw",
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    borderBottom: "1px solid #eee"
  },
  tabs: { display: "flex", gap: 8, borderBottom: "1px solid #eee", padding: 8 }
};
function Bt() {
  return /* @__PURE__ */ i.createElement("span", { "aria-label": "saving", role: "status" }, "Saving…");
}
const at = "graph";
function xr(a) {
  return a.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}
function Er(a) {
  return a.toLowerCase().endsWith(".psg") ? a : `${a}.psg`;
}
function Dr({
  isOpen: a,
  onClose: e,
  graph: t,
  onSaveBlob: r,
  enableSupabase: n,
  userId: s,
  supabasePut: o,
  onSupabaseSaved: l
}) {
  const { userId: c } = ta(), [u, h] = i.useState(at), [f, S] = i.useState(null), [R, m] = i.useState(!1), [g, v] = i.useState(!1);
  if (i.useEffect(() => {
    a && (h(at), S(null), m(!1), v(!1));
  }, [a]), !a) return null;
  const O = xr(u).slice(0, 64), w = Er(O || at), Z = !!O && !O.startsWith(".") && !O.endsWith("."), W = s ?? c ?? null, b = !!((n ?? Qt()) && W && o);
  async function T() {
    if (!Z || !b) {
      S("Please enter a valid name");
      return;
    }
    v(!0), S(null);
    try {
      const k = JSON.stringify(t, null, 2), L = await o(W, w, k);
      L.ok ? (l == null || l(w, L.data.path), e()) : S(`Failed to upload: ${L.error.message}`);
    } catch (k) {
      const L = k instanceof Error ? k.message : "Upload failed";
      S(`Failed to upload: ${L}`);
    } finally {
      v(!1);
    }
  }
  function B(k) {
    h(k.target.value), S(null);
  }
  async function J() {
    if (!Z) {
      S("Please enter a valid name");
      return;
    }
    m(!0);
    try {
      const k = JSON.stringify(t, null, 2), L = new Blob([k], { type: "application/json" });
      r == null || r(L, w);
      const H = URL.createObjectURL(L), Y = document.createElement("a");
      Y.href = H, Y.download = w, document.body.appendChild(Y), Y.click(), Y.remove(), URL.revokeObjectURL(H), e();
    } catch {
      S("Failed to save file");
    } finally {
      m(!1);
    }
  }
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Save Graph",
      style: Ue.backdrop
    },
    /* @__PURE__ */ i.createElement("div", { style: Ue.dialog }, /* @__PURE__ */ i.createElement("header", { style: Ue.header }, /* @__PURE__ */ i.createElement("h2", { style: { margin: 0 } }, "Save"), /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        onClick: e,
        "aria-label": "Close Save Dialog"
      },
      "✕"
    )), /* @__PURE__ */ i.createElement("section", { style: { padding: 12, display: "grid", gap: 8 } }, /* @__PURE__ */ i.createElement("label", { style: { display: "grid", gap: 4 } }, /* @__PURE__ */ i.createElement("span", null, "File name"), /* @__PURE__ */ i.createElement(
      "input",
      {
        "aria-label": "File name",
        type: "text",
        value: u,
        onChange: B,
        placeholder: "graph"
      }
    ), /* @__PURE__ */ i.createElement("div", { "aria-live": "polite", style: { fontSize: 12, color: "#555" } }, "Will save as: ", /* @__PURE__ */ i.createElement("code", null, w))), f && /* @__PURE__ */ i.createElement("div", { role: "alert", "aria-live": "assertive", style: { color: "#b00" } }, f)), /* @__PURE__ */ i.createElement("footer", { style: Ue.footer }, /* @__PURE__ */ i.createElement("button", { type: "button", onClick: e }, "Cancel"), /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        disabled: !Z || R,
        onClick: J
      },
      R ? /* @__PURE__ */ i.createElement(Bt, null) : "Save"
    ), b && /* @__PURE__ */ i.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Save to Supabase",
        disabled: g,
        onClick: T
      },
      g ? /* @__PURE__ */ i.createElement(Bt, null) : "Save to Supabase"
    )))
  );
}
const Ue = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dialog: {
    background: "#fff",
    width: 520,
    maxWidth: "95vw",
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    borderBottom: "1px solid #eee"
  },
  footer: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    padding: 12,
    borderTop: "1px solid #eee"
  }
};
function Ft({
  preset: a,
  preview: e,
  isSelected: t,
  onClick: r,
  onInsert: n,
  tabIndex: s,
  onFocus: o
}) {
  const [l, c] = $(!1), [u, h] = $(!1);
  X(() => {
    if (t && e) {
      const v = setTimeout(() => h(!0), 300);
      return () => clearTimeout(v);
    } else
      h(!1);
  }, [t, e]);
  const f = (v) => {
    try {
      const C = JSON.stringify({
        id: a.id,
        name: a.name,
        tags: a.tags,
        type: a.type,
        metadata: a.metadata
      });
      v.dataTransfer.setData("application/x-preset", C), v.dataTransfer.effectAllowed = "copy", c(!0);
      const O = v.currentTarget.cloneNode(!0);
      O.style.opacity = "0.8", O.style.transform = "rotate(2deg)", O.style.position = "absolute", O.style.top = "-9999px", document.body.appendChild(O), v.dataTransfer.setDragImage(
        O,
        v.nativeEvent.offsetX,
        v.nativeEvent.offsetY
      ), setTimeout(() => {
        document.body.contains(O) && document.body.removeChild(O);
      }, 0);
    } catch (C) {
      console.error("Drag start error:", C);
    }
  }, S = () => {
    c(!1);
  }, R = (v) => {
    v.key === "Enter" || v.key === " " ? (v.preventDefault(), r == null || r()) : v.key === "i" && v.ctrlKey && (v.preventDefault(), n == null || n(a));
  }, m = a.metadata, g = m && (m.options || m.combinations || m.nodes);
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      className: `preset-card ${t ? "preset-card-selected" : ""} ${l ? "asset-dragging" : ""}`,
      role: "button",
      tabIndex: s ?? 0,
      "aria-label": `Preset ${a.name}`,
      "aria-selected": t,
      onClick: r,
      onFocus: o,
      onKeyDown: R,
      draggable: !0,
      onDragStart: f,
      onDragEnd: S,
      style: {
        display: "flex",
        flexDirection: "column",
        width: wr - 16,
        height: kr - 16,
        margin: "0.5em",
        border: t ? "2px solid var(--accent-color, #2563eb)" : "1px solid #ddd",
        borderRadius: "0.5em",
        padding: "0.75em",
        background: t ? "var(--bg-selected, #f0f7ff)" : "white",
        cursor: l ? "grabbing" : "pointer",
        transition: "all 0.2s ease"
      }
    },
    /* @__PURE__ */ i.createElement("div", { className: "preset-card-title" }, a.name),
    /* @__PURE__ */ i.createElement("div", { className: "preset-card-tags" }, a.tags.slice(0, 3).join(" • "), a.tags.length > 3 && ` +${a.tags.length - 3}`),
    g && /* @__PURE__ */ i.createElement(
      "div",
      {
        style: {
          fontSize: "0.85em",
          color: "var(--text-tertiary, #888)",
          marginTop: "0.25em"
        }
      },
      m.combinations && `${m.combinations} combinations`,
      m.options && !m.combinations && `${m.options} options`,
      m.nodes && ` • ${m.nodes} nodes`
    ),
    u && e && /* @__PURE__ */ i.createElement("div", { className: "preset-card-preview" }, e.split(`
`).map((v, C) => /* @__PURE__ */ i.createElement("div", { key: C }, v))),
    /* @__PURE__ */ i.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
          paddingTop: "0.5em"
        }
      },
      /* @__PURE__ */ i.createElement(
        "span",
        {
          role: "img",
          "aria-label": "drag indicator",
          style: {
            cursor: "grab",
            fontSize: "1.2em",
            opacity: 0.5
          }
        },
        "⋮⋮"
      ),
      n && /* @__PURE__ */ i.createElement(
        "button",
        {
          type: "button",
          onClick: (v) => {
            v.stopPropagation(), n(a);
          },
          "aria-label": "Insert preset",
          style: {
            marginLeft: "auto",
            padding: "0.3em 0.8em",
            fontSize: "0.9em",
            background: "var(--button-bg, #2563eb)",
            color: "white",
            border: "none",
            borderRadius: "0.25em",
            cursor: "pointer"
          }
        },
        "Insert"
      )
    )
  );
}
const wr = 200, kr = 180, rt = 200, Sr = 180;
function Cr({
  onInsert: a,
  onNodeReplace: e
}) {
  const t = P((k) => k.filteredPresets), r = P((k) => k.scanStatus), n = P((k) => k.error), s = P((k) => k.selectPreset), o = P((k) => k.selectedPresetId), l = P((k) => k.focusArea), c = P((k) => k.focusIndex), u = P((k) => k.setGridMetrics), h = P((k) => k.setFocus), f = ce(null), [S, R] = $({ w: 900, h: 600 }), [m, g] = $(
    /* @__PURE__ */ new Map()
  ), v = re(
    (k) => {
      if (m.has(k.id))
        return m.get(k.id);
      let L = "";
      const H = k.metadata;
      if (H) {
        H.combinations ? L = `${H.combinations} unique combinations` : H.options && (L = `${H.options} variations available`);
        const ee = [
          "warm smile with gentle eyes",
          "confident stance, arms crossed",
          "flowing auburn hair in morning light",
          "weathered hands tell stories"
        ], ne = ee[Math.floor(Math.random() * ee.length)];
        L = L ? `${L}
Example: "${ne}"` : `"${ne}"`;
      } else
        L = `Preview for ${k.name}`;
      const Y = new Map(m);
      return Y.set(k.id, L), g(Y), L;
    },
    [m]
  );
  X(() => {
    if (!f.current) return;
    const k = f.current, L = () => R({ w: k.clientWidth || 900, h: k.clientHeight || 600 });
    if (L(), typeof ResizeObserver == "function") {
      const H = new ResizeObserver(L);
      return H.observe(k), () => H.disconnect();
    }
    return window.addEventListener("resize", L), () => window.removeEventListener("resize", L);
  }, []);
  const C = S.w, O = S.h, w = Math.max(1, Math.floor(C / rt)), Z = Math.ceil(t.length / w);
  X(() => {
    u({ columnCount: w, itemCount: t.length });
  }, [w, t.length, u]);
  const W = t.length > 100, I = fe(() => {
    function k({
      columnIndex: L,
      rowIndex: H,
      style: Y
    }) {
      const ee = H * w + L, ne = t[ee];
      if (!ne) return /* @__PURE__ */ i.createElement("div", { style: Y });
      const Ke = l === "grid" && c === ee, be = o === ne.id, je = be ? v(ne) : null;
      return /* @__PURE__ */ i.createElement(
        "div",
        {
          style: Y,
          "data-grid-index": ee,
          role: "gridcell",
          "aria-selected": Ke,
          className: "asset-grid-virtual-item"
        },
        /* @__PURE__ */ i.createElement(
          Ft,
          {
            preset: ne,
            preview: je,
            isSelected: be,
            onClick: () => s(ne.id),
            onInsert: a,
            tabIndex: l === "grid" && c === ee ? 0 : -1,
            onFocus: () => h("grid", ee)
          }
        )
      );
    }
    return k.displayName = "GridCell", k;
  }, [
    t,
    s,
    a,
    w,
    l,
    c,
    h,
    o,
    v
  ]), b = r === "done" && t.length === 0, T = r === "error", B = r === "scanning", J = () => /* @__PURE__ */ i.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${w}, ${rt}px)`,
        gap: "0.5em",
        padding: "0.5em"
      }
    },
    t.map((k, L) => {
      const H = l === "grid" && c === L, Y = o === k.id, ee = Y ? v(k) : null;
      return /* @__PURE__ */ i.createElement(
        Ft,
        {
          key: k.id,
          preset: k,
          preview: ee,
          isSelected: Y,
          onClick: () => s(k.id),
          onInsert: a,
          tabIndex: H ? 0 : -1,
          onFocus: () => h("grid", L)
        }
      );
    })
  );
  return /* @__PURE__ */ i.createElement(
    "div",
    {
      "aria-label": "Preset Grid",
      role: "grid",
      ref: f,
      style: { width: "100%", height: "100%", overflow: "auto" }
    },
    B ? /* @__PURE__ */ i.createElement("div", { className: "preview-loading", role: "status", "aria-live": "polite" }, /* @__PURE__ */ i.createElement("div", { className: "preview-loading-spinner" }), /* @__PURE__ */ i.createElement("span", null, "Loading assets...")) : T ? /* @__PURE__ */ i.createElement(
      "div",
      {
        role: "alert",
        "aria-live": "assertive",
        style: {
          padding: "1em",
          color: "var(--text-error, #b00)",
          fontSize: "1em"
        }
      },
      "Failed to scan libraries: ",
      n
    ) : b ? /* @__PURE__ */ i.createElement(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        style: {
          padding: "1em",
          color: "var(--text-secondary, #555)",
          fontSize: "1em"
        }
      },
      "No presets found. Adjust your search or filters."
    ) : W ? /* @__PURE__ */ i.createElement(
      Vt,
      {
        className: "asset-grid-virtual",
        height: O,
        width: C,
        columnWidth: rt,
        rowHeight: Sr,
        columnCount: w,
        rowCount: Z
      },
      I
    ) : J()
  );
}
function Mr({
  onInsert: a,
  onNodeReplace: e,
  enableFragmentManifest: t = !0
  // Enabled to load fragment assets
}) {
  const r = P((f) => f.selectedPresetId), n = P((f) => f.detailsOpen);
  P((f) => f.scan);
  const [s, o] = $(!1), [l, c] = $(null);
  X(() => {
    if (!t) return;
    let f = !0;
    return (async () => {
      try {
        console.log("Loading fragment manifest...");
        const R = await Re.loadManifest();
        if (!f) return;
        const m = Re.convertToPresets(R), g = Array.from(new Set(m.flatMap((v) => v.tags))).sort();
        P.setState({
          presets: m,
          filteredPresets: m,
          availableTags: g,
          scanStatus: "done",
          error: null
        }), f && (o(!0), console.log(`Fragment manifest loaded: ${m.length} fragments`));
      } catch (R) {
        if (f) {
          const m = R instanceof Error ? R.message : "Unknown error";
          console.error("Failed to load fragment manifest:", m), c(m), P.setState({
            scanStatus: "error",
            error: m
          });
        }
      }
    })(), () => {
      f = !1;
    };
  }, [t]);
  const u = re((f) => {
    f.preventDefault(), f.dataTransfer.dropEffect = "copy";
  }, []), h = re(
    (f) => {
      f.preventDefault();
      try {
        const S = f.dataTransfer.getData("application/x-preset");
        if (!S) return;
        const R = JSON.parse(S), g = f.target.closest(".react-flow__node");
        if (g && e) {
          const v = g.getAttribute("data-id");
          v && (g.classList.add("node-replacement-success"), setTimeout(() => {
            g.classList.remove("node-replacement-success");
          }, 500), e(v, R));
        }
      } catch (S) {
        console.error("Error handling drop:", S);
      }
    },
    [e]
  );
  return /* @__PURE__ */ i.createElement(Xt, null, /* @__PURE__ */ i.createElement(
    "div",
    {
      className: "asset-browser enhanced-asset-browser",
      style: { display: "grid", gridTemplateColumns: "280px 1fr" },
      onDragOver: u,
      onDrop: h
    },
    /* @__PURE__ */ i.createElement(Jt, null),
    /* @__PURE__ */ i.createElement("div", null, /* @__PURE__ */ i.createElement(
      Cr,
      {
        onInsert: a,
        onNodeReplace: e
      }
    )),
    /* @__PURE__ */ i.createElement(Kt, { open: n, selectedId: r })
  ));
}
const Tr = Ut(void 0), jr = ({
  children: a
}) => {
  const [e, t] = $(null);
  return /* @__PURE__ */ i.createElement(Tr.Provider, { value: { user: e, setUser: t } }, a);
}, Lr = mr;
export {
  Ir as AssetBrowser,
  nr as AssetBrowserTabs,
  Mr as EnhancedAssetBrowser,
  Ft as EnhancedPresetCard,
  Cr as EnhancedPresetGrid,
  Re as FragmentManifestLoader,
  Pr as OpenGraphDialog,
  $r as OriginalUserProvider,
  ur as ProAssetBrowser,
  Dr as SaveGraphDialog,
  tr as ServerTab,
  mr as TabbedAssetBrowser,
  jr as UserProvider,
  Lr as default,
  P as useAssetBrowserStore,
  ta as useUserId
};
//# sourceMappingURL=index.esm.js.map
