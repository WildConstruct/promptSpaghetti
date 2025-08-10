import D, { useEffect as Rt, useRef as $r, useState as Te, useMemo as Gs, createContext as ri } from "react";
import { create as si } from "zustand";
import ni from "fuse.js";
import { FixedSizeGrid as ii } from "react-window";
var ce = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ai(s) {
  if (s.__esModule) return s;
  var e = s.default;
  if (typeof e == "function") {
    var t = function r() {
      return this instanceof r ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(s).forEach(function(r) {
    var n = Object.getOwnPropertyDescriptor(s, r);
    Object.defineProperty(t, r, n.get ? n : {
      enumerable: !0,
      get: function() {
        return s[r];
      }
    });
  }), t;
}
var fr = { exports: {} }, ot = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var us;
function oi() {
  if (us) return ot;
  us = 1;
  var s = D, e = Symbol.for("react.element"), t = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, n = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, i = { key: !0, ref: !0, __self: !0, __source: !0 };
  function a(o, l, c) {
    var u, h = {}, p = null, m = null;
    c !== void 0 && (p = "" + c), l.key !== void 0 && (p = "" + l.key), l.ref !== void 0 && (m = l.ref);
    for (u in l) r.call(l, u) && !i.hasOwnProperty(u) && (h[u] = l[u]);
    if (o && o.defaultProps) for (u in l = o.defaultProps, l) h[u] === void 0 && (h[u] = l[u]);
    return { $$typeof: e, type: o, key: p, ref: m, props: h, _owner: n.current };
  }
  return ot.Fragment = t, ot.jsx = a, ot.jsxs = a, ot;
}
var lt = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ds;
function li() {
  return ds || (ds = 1, process.env.NODE_ENV !== "production" && function() {
    var s = D, e = Symbol.for("react.element"), t = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), n = Symbol.for("react.strict_mode"), i = Symbol.for("react.profiler"), a = Symbol.for("react.provider"), o = Symbol.for("react.context"), l = Symbol.for("react.forward_ref"), c = Symbol.for("react.suspense"), u = Symbol.for("react.suspense_list"), h = Symbol.for("react.memo"), p = Symbol.for("react.lazy"), m = Symbol.for("react.offscreen"), v = Symbol.iterator, x = "@@iterator";
    function T(d) {
      if (d === null || typeof d != "object")
        return null;
      var g = v && d[v] || d[x];
      return typeof g == "function" ? g : null;
    }
    var j = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function E(d) {
      {
        for (var g = arguments.length, w = new Array(g > 1 ? g - 1 : 0), C = 1; C < g; C++)
          w[C - 1] = arguments[C];
        _("error", d, w);
      }
    }
    function _(d, g, w) {
      {
        var C = j.ReactDebugCurrentFrame, q = C.getStackAddendum();
        q !== "" && (g += "%s", w = w.concat([q]));
        var V = w.map(function(B) {
          return String(B);
        });
        V.unshift("Warning: " + g), Function.prototype.apply.call(console[d], console, V);
      }
    }
    var R = !1, K = !1, W = !1, O = !1, Q = !1, re;
    re = Symbol.for("react.module.reference");
    function Me(d) {
      return !!(typeof d == "string" || typeof d == "function" || d === r || d === i || Q || d === n || d === c || d === u || O || d === m || R || K || W || typeof d == "object" && d !== null && (d.$$typeof === p || d.$$typeof === h || d.$$typeof === a || d.$$typeof === o || d.$$typeof === l || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      d.$$typeof === re || d.getModuleId !== void 0));
    }
    function ve(d, g, w) {
      var C = d.displayName;
      if (C)
        return C;
      var q = g.displayName || g.name || "";
      return q !== "" ? w + "(" + q + ")" : w;
    }
    function de(d) {
      return d.displayName || "Context";
    }
    function he(d) {
      if (d == null)
        return null;
      if (typeof d.tag == "number" && E("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof d == "function")
        return d.displayName || d.name || null;
      if (typeof d == "string")
        return d;
      switch (d) {
        case r:
          return "Fragment";
        case t:
          return "Portal";
        case i:
          return "Profiler";
        case n:
          return "StrictMode";
        case c:
          return "Suspense";
        case u:
          return "SuspenseList";
      }
      if (typeof d == "object")
        switch (d.$$typeof) {
          case o:
            var g = d;
            return de(g) + ".Consumer";
          case a:
            var w = d;
            return de(w._context) + ".Provider";
          case l:
            return ve(d, d.render, "ForwardRef");
          case h:
            var C = d.displayName || null;
            return C !== null ? C : he(d.type) || "Memo";
          case p: {
            var q = d, V = q._payload, B = q._init;
            try {
              return he(B(V));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var ae = Object.assign, it = 0, Fr, Wr, qr, Vr, zr, Zr, Kr;
    function Gr() {
    }
    Gr.__reactDisabledLog = !0;
    function Cn() {
      {
        if (it === 0) {
          Fr = console.log, Wr = console.info, qr = console.warn, Vr = console.error, zr = console.group, Zr = console.groupCollapsed, Kr = console.groupEnd;
          var d = {
            configurable: !0,
            enumerable: !0,
            value: Gr,
            writable: !0
          };
          Object.defineProperties(console, {
            info: d,
            log: d,
            warn: d,
            error: d,
            group: d,
            groupCollapsed: d,
            groupEnd: d
          });
        }
        it++;
      }
    }
    function An() {
      {
        if (it--, it === 0) {
          var d = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: ae({}, d, {
              value: Fr
            }),
            info: ae({}, d, {
              value: Wr
            }),
            warn: ae({}, d, {
              value: qr
            }),
            error: ae({}, d, {
              value: Vr
            }),
            group: ae({}, d, {
              value: zr
            }),
            groupCollapsed: ae({}, d, {
              value: Zr
            }),
            groupEnd: ae({}, d, {
              value: Kr
            })
          });
        }
        it < 0 && E("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var Jt = j.ReactCurrentDispatcher, Ht;
    function wt(d, g, w) {
      {
        if (Ht === void 0)
          try {
            throw Error();
          } catch (q) {
            var C = q.stack.trim().match(/\n( *(at )?)/);
            Ht = C && C[1] || "";
          }
        return `
` + Ht + d;
      }
    }
    var Yt = !1, kt;
    {
      var Rn = typeof WeakMap == "function" ? WeakMap : Map;
      kt = new Rn();
    }
    function Jr(d, g) {
      if (!d || Yt)
        return "";
      {
        var w = kt.get(d);
        if (w !== void 0)
          return w;
      }
      var C;
      Yt = !0;
      var q = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var V;
      V = Jt.current, Jt.current = null, Cn();
      try {
        if (g) {
          var B = function() {
            throw Error();
          };
          if (Object.defineProperty(B.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(B, []);
            } catch (se) {
              C = se;
            }
            Reflect.construct(d, [], B);
          } else {
            try {
              B.call();
            } catch (se) {
              C = se;
            }
            d.call(B.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (se) {
            C = se;
          }
          d();
        }
      } catch (se) {
        if (se && C && typeof se.stack == "string") {
          for (var U = se.stack.split(`
`), ee = C.stack.split(`
`), G = U.length - 1, J = ee.length - 1; G >= 1 && J >= 0 && U[G] !== ee[J]; )
            J--;
          for (; G >= 1 && J >= 0; G--, J--)
            if (U[G] !== ee[J]) {
              if (G !== 1 || J !== 1)
                do
                  if (G--, J--, J < 0 || U[G] !== ee[J]) {
                    var le = `
` + U[G].replace(" at new ", " at ");
                    return d.displayName && le.includes("<anonymous>") && (le = le.replace("<anonymous>", d.displayName)), typeof d == "function" && kt.set(d, le), le;
                  }
                while (G >= 1 && J >= 0);
              break;
            }
        }
      } finally {
        Yt = !1, Jt.current = V, An(), Error.prepareStackTrace = q;
      }
      var Fe = d ? d.displayName || d.name : "", Pe = Fe ? wt(Fe) : "";
      return typeof d == "function" && kt.set(d, Pe), Pe;
    }
    function Pn(d, g, w) {
      return Jr(d, !1);
    }
    function $n(d) {
      var g = d.prototype;
      return !!(g && g.isReactComponent);
    }
    function xt(d, g, w) {
      if (d == null)
        return "";
      if (typeof d == "function")
        return Jr(d, $n(d));
      if (typeof d == "string")
        return wt(d);
      switch (d) {
        case c:
          return wt("Suspense");
        case u:
          return wt("SuspenseList");
      }
      if (typeof d == "object")
        switch (d.$$typeof) {
          case l:
            return Pn(d.render);
          case h:
            return xt(d.type, g, w);
          case p: {
            var C = d, q = C._payload, V = C._init;
            try {
              return xt(V(q), g, w);
            } catch {
            }
          }
        }
      return "";
    }
    var at = Object.prototype.hasOwnProperty, Hr = {}, Yr = j.ReactDebugCurrentFrame;
    function St(d) {
      if (d) {
        var g = d._owner, w = xt(d.type, d._source, g ? g.type : null);
        Yr.setExtraStackFrame(w);
      } else
        Yr.setExtraStackFrame(null);
    }
    function In(d, g, w, C, q) {
      {
        var V = Function.call.bind(at);
        for (var B in d)
          if (V(d, B)) {
            var U = void 0;
            try {
              if (typeof d[B] != "function") {
                var ee = Error((C || "React class") + ": " + w + " type `" + B + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof d[B] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw ee.name = "Invariant Violation", ee;
              }
              U = d[B](g, B, C, w, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (G) {
              U = G;
            }
            U && !(U instanceof Error) && (St(q), E("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", C || "React class", w, B, typeof U), St(null)), U instanceof Error && !(U.message in Hr) && (Hr[U.message] = !0, St(q), E("Failed %s type: %s", w, U.message), St(null));
          }
      }
    }
    var Nn = Array.isArray;
    function Qt(d) {
      return Nn(d);
    }
    function Ln(d) {
      {
        var g = typeof Symbol == "function" && Symbol.toStringTag, w = g && d[Symbol.toStringTag] || d.constructor.name || "Object";
        return w;
      }
    }
    function Un(d) {
      try {
        return Qr(d), !1;
      } catch {
        return !0;
      }
    }
    function Qr(d) {
      return "" + d;
    }
    function Xr(d) {
      if (Un(d))
        return E("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ln(d)), Qr(d);
    }
    var es = j.ReactCurrentOwner, Dn = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ts, rs;
    function Mn(d) {
      if (at.call(d, "ref")) {
        var g = Object.getOwnPropertyDescriptor(d, "ref").get;
        if (g && g.isReactWarning)
          return !1;
      }
      return d.ref !== void 0;
    }
    function Bn(d) {
      if (at.call(d, "key")) {
        var g = Object.getOwnPropertyDescriptor(d, "key").get;
        if (g && g.isReactWarning)
          return !1;
      }
      return d.key !== void 0;
    }
    function Fn(d, g) {
      typeof d.ref == "string" && es.current;
    }
    function Wn(d, g) {
      {
        var w = function() {
          ts || (ts = !0, E("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", g));
        };
        w.isReactWarning = !0, Object.defineProperty(d, "key", {
          get: w,
          configurable: !0
        });
      }
    }
    function qn(d, g) {
      {
        var w = function() {
          rs || (rs = !0, E("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", g));
        };
        w.isReactWarning = !0, Object.defineProperty(d, "ref", {
          get: w,
          configurable: !0
        });
      }
    }
    var Vn = function(d, g, w, C, q, V, B) {
      var U = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: e,
        // Built-in properties that belong on the element
        type: d,
        key: g,
        ref: w,
        props: B,
        // Record the component responsible for creating this element.
        _owner: V
      };
      return U._store = {}, Object.defineProperty(U._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(U, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: C
      }), Object.defineProperty(U, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: q
      }), Object.freeze && (Object.freeze(U.props), Object.freeze(U)), U;
    };
    function zn(d, g, w, C, q) {
      {
        var V, B = {}, U = null, ee = null;
        w !== void 0 && (Xr(w), U = "" + w), Bn(g) && (Xr(g.key), U = "" + g.key), Mn(g) && (ee = g.ref, Fn(g, q));
        for (V in g)
          at.call(g, V) && !Dn.hasOwnProperty(V) && (B[V] = g[V]);
        if (d && d.defaultProps) {
          var G = d.defaultProps;
          for (V in G)
            B[V] === void 0 && (B[V] = G[V]);
        }
        if (U || ee) {
          var J = typeof d == "function" ? d.displayName || d.name || "Unknown" : d;
          U && Wn(B, J), ee && qn(B, J);
        }
        return Vn(d, U, ee, q, C, es.current, B);
      }
    }
    var Xt = j.ReactCurrentOwner, ss = j.ReactDebugCurrentFrame;
    function Be(d) {
      if (d) {
        var g = d._owner, w = xt(d.type, d._source, g ? g.type : null);
        ss.setExtraStackFrame(w);
      } else
        ss.setExtraStackFrame(null);
    }
    var er;
    er = !1;
    function tr(d) {
      return typeof d == "object" && d !== null && d.$$typeof === e;
    }
    function ns() {
      {
        if (Xt.current) {
          var d = he(Xt.current.type);
          if (d)
            return `

Check the render method of \`` + d + "`.";
        }
        return "";
      }
    }
    function Zn(d) {
      return "";
    }
    var is = {};
    function Kn(d) {
      {
        var g = ns();
        if (!g) {
          var w = typeof d == "string" ? d : d.displayName || d.name;
          w && (g = `

Check the top-level render call using <` + w + ">.");
        }
        return g;
      }
    }
    function as(d, g) {
      {
        if (!d._store || d._store.validated || d.key != null)
          return;
        d._store.validated = !0;
        var w = Kn(g);
        if (is[w])
          return;
        is[w] = !0;
        var C = "";
        d && d._owner && d._owner !== Xt.current && (C = " It was passed a child from " + he(d._owner.type) + "."), Be(d), E('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', w, C), Be(null);
      }
    }
    function os(d, g) {
      {
        if (typeof d != "object")
          return;
        if (Qt(d))
          for (var w = 0; w < d.length; w++) {
            var C = d[w];
            tr(C) && as(C, g);
          }
        else if (tr(d))
          d._store && (d._store.validated = !0);
        else if (d) {
          var q = T(d);
          if (typeof q == "function" && q !== d.entries)
            for (var V = q.call(d), B; !(B = V.next()).done; )
              tr(B.value) && as(B.value, g);
        }
      }
    }
    function Gn(d) {
      {
        var g = d.type;
        if (g == null || typeof g == "string")
          return;
        var w;
        if (typeof g == "function")
          w = g.propTypes;
        else if (typeof g == "object" && (g.$$typeof === l || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        g.$$typeof === h))
          w = g.propTypes;
        else
          return;
        if (w) {
          var C = he(g);
          In(w, d.props, "prop", C, d);
        } else if (g.PropTypes !== void 0 && !er) {
          er = !0;
          var q = he(g);
          E("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", q || "Unknown");
        }
        typeof g.getDefaultProps == "function" && !g.getDefaultProps.isReactClassApproved && E("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function Jn(d) {
      {
        for (var g = Object.keys(d.props), w = 0; w < g.length; w++) {
          var C = g[w];
          if (C !== "children" && C !== "key") {
            Be(d), E("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", C), Be(null);
            break;
          }
        }
        d.ref !== null && (Be(d), E("Invalid attribute `ref` supplied to `React.Fragment`."), Be(null));
      }
    }
    var ls = {};
    function cs(d, g, w, C, q, V) {
      {
        var B = Me(d);
        if (!B) {
          var U = "";
          (d === void 0 || typeof d == "object" && d !== null && Object.keys(d).length === 0) && (U += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var ee = Zn();
          ee ? U += ee : U += ns();
          var G;
          d === null ? G = "null" : Qt(d) ? G = "array" : d !== void 0 && d.$$typeof === e ? (G = "<" + (he(d.type) || "Unknown") + " />", U = " Did you accidentally export a JSX literal instead of a component?") : G = typeof d, E("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", G, U);
        }
        var J = zn(d, g, w, q, V);
        if (J == null)
          return J;
        if (B) {
          var le = g.children;
          if (le !== void 0)
            if (C)
              if (Qt(le)) {
                for (var Fe = 0; Fe < le.length; Fe++)
                  os(le[Fe], d);
                Object.freeze && Object.freeze(le);
              } else
                E("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              os(le, d);
        }
        if (at.call(g, "key")) {
          var Pe = he(d), se = Object.keys(g).filter(function(ti) {
            return ti !== "key";
          }), rr = se.length > 0 ? "{key: someKey, " + se.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!ls[Pe + rr]) {
            var ei = se.length > 0 ? "{" + se.join(": ..., ") + ": ...}" : "{}";
            E(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, rr, Pe, ei, Pe), ls[Pe + rr] = !0;
          }
        }
        return d === r ? Jn(J) : Gn(J), J;
      }
    }
    function Hn(d, g, w) {
      return cs(d, g, w, !0);
    }
    function Yn(d, g, w) {
      return cs(d, g, w, !1);
    }
    var Qn = Yn, Xn = Hn;
    lt.Fragment = r, lt.jsx = Qn, lt.jsxs = Xn;
  }()), lt;
}
process.env.NODE_ENV === "production" ? fr.exports = oi() : fr.exports = li();
var f = fr.exports, F;
(function(s) {
  s.assertEqual = (n) => {
  };
  function e(n) {
  }
  s.assertIs = e;
  function t(n) {
    throw new Error();
  }
  s.assertNever = t, s.arrayToEnum = (n) => {
    const i = {};
    for (const a of n)
      i[a] = a;
    return i;
  }, s.getValidEnumValues = (n) => {
    const i = s.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), a = {};
    for (const o of i)
      a[o] = n[o];
    return s.objectValues(a);
  }, s.objectValues = (n) => s.objectKeys(n).map(function(i) {
    return n[i];
  }), s.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const i = [];
    for (const a in n)
      Object.prototype.hasOwnProperty.call(n, a) && i.push(a);
    return i;
  }, s.find = (n, i) => {
    for (const a of n)
      if (i(a))
        return a;
  }, s.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function r(n, i = " | ") {
    return n.map((a) => typeof a == "string" ? `'${a}'` : a).join(i);
  }
  s.joinValues = r, s.jsonStringifyReplacer = (n, i) => typeof i == "bigint" ? i.toString() : i;
})(F || (F = {}));
var hs;
(function(s) {
  s.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(hs || (hs = {}));
const k = F.arrayToEnum([
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
]), Ee = (s) => {
  switch (typeof s) {
    case "undefined":
      return k.undefined;
    case "string":
      return k.string;
    case "number":
      return Number.isNaN(s) ? k.nan : k.number;
    case "boolean":
      return k.boolean;
    case "function":
      return k.function;
    case "bigint":
      return k.bigint;
    case "symbol":
      return k.symbol;
    case "object":
      return Array.isArray(s) ? k.array : s === null ? k.null : s.then && typeof s.then == "function" && s.catch && typeof s.catch == "function" ? k.promise : typeof Map < "u" && s instanceof Map ? k.map : typeof Set < "u" && s instanceof Set ? k.set : typeof Date < "u" && s instanceof Date ? k.date : k.object;
    default:
      return k.unknown;
  }
}, y = F.arrayToEnum([
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
class xe extends Error {
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
    const t = e || function(i) {
      return i.message;
    }, r = { _errors: [] }, n = (i) => {
      for (const a of i.issues)
        if (a.code === "invalid_union")
          a.unionErrors.map(n);
        else if (a.code === "invalid_return_type")
          n(a.returnTypeError);
        else if (a.code === "invalid_arguments")
          n(a.argumentsError);
        else if (a.path.length === 0)
          r._errors.push(t(a));
        else {
          let o = r, l = 0;
          for (; l < a.path.length; ) {
            const c = a.path[l];
            l === a.path.length - 1 ? (o[c] = o[c] || { _errors: [] }, o[c]._errors.push(t(a))) : o[c] = o[c] || { _errors: [] }, o = o[c], l++;
          }
        }
    };
    return n(this), r;
  }
  static assert(e) {
    if (!(e instanceof xe))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, F.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, r = [];
    for (const n of this.issues)
      if (n.path.length > 0) {
        const i = n.path[0];
        t[i] = t[i] || [], t[i].push(e(n));
      } else
        r.push(e(n));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
xe.create = (s) => new xe(s);
const pr = (s, e) => {
  let t;
  switch (s.code) {
    case y.invalid_type:
      s.received === k.undefined ? t = "Required" : t = `Expected ${s.expected}, received ${s.received}`;
      break;
    case y.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(s.expected, F.jsonStringifyReplacer)}`;
      break;
    case y.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${F.joinValues(s.keys, ", ")}`;
      break;
    case y.invalid_union:
      t = "Invalid input";
      break;
    case y.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${F.joinValues(s.options)}`;
      break;
    case y.invalid_enum_value:
      t = `Invalid enum value. Expected ${F.joinValues(s.options)}, received '${s.received}'`;
      break;
    case y.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case y.invalid_return_type:
      t = "Invalid function return type";
      break;
    case y.invalid_date:
      t = "Invalid date";
      break;
    case y.invalid_string:
      typeof s.validation == "object" ? "includes" in s.validation ? (t = `Invalid input: must include "${s.validation.includes}"`, typeof s.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${s.validation.position}`)) : "startsWith" in s.validation ? t = `Invalid input: must start with "${s.validation.startsWith}"` : "endsWith" in s.validation ? t = `Invalid input: must end with "${s.validation.endsWith}"` : F.assertNever(s.validation) : s.validation !== "regex" ? t = `Invalid ${s.validation}` : t = "Invalid";
      break;
    case y.too_small:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "more than"} ${s.minimum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "over"} ${s.minimum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "bigint" ? t = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s.minimum))}` : t = "Invalid input";
      break;
    case y.too_big:
      s.type === "array" ? t = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "less than"} ${s.maximum} element(s)` : s.type === "string" ? t = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "under"} ${s.maximum} character(s)` : s.type === "number" ? t = `Number must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "bigint" ? t = `BigInt must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "date" ? t = `Date must be ${s.exact ? "exactly" : s.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s.maximum))}` : t = "Invalid input";
      break;
    case y.custom:
      t = "Invalid input";
      break;
    case y.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case y.not_multiple_of:
      t = `Number must be a multiple of ${s.multipleOf}`;
      break;
    case y.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, F.assertNever(s);
  }
  return { message: t };
};
let ci = pr;
function ui() {
  return ci;
}
const di = (s) => {
  const { data: e, path: t, errorMaps: r, issueData: n } = s, i = [...t, ...n.path || []], a = {
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
  const l = r.filter((c) => !!c).slice().reverse();
  for (const c of l)
    o = c(a, { data: e, defaultError: o }).message;
  return {
    ...n,
    path: i,
    message: o
  };
};
function b(s, e) {
  const t = ui(), r = di({
    issueData: e,
    data: s.data,
    path: s.path,
    errorMaps: [
      s.common.contextualErrorMap,
      // contextual error map is first priority
      s.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === pr ? void 0 : pr
      // then global default map
    ].filter((n) => !!n)
  });
  s.common.issues.push(r);
}
class te {
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
        return P;
      n.status === "dirty" && e.dirty(), r.push(n.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    const r = [];
    for (const n of t) {
      const i = await n.key, a = await n.value;
      r.push({
        key: i,
        value: a
      });
    }
    return te.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    const r = {};
    for (const n of t) {
      const { key: i, value: a } = n;
      if (i.status === "aborted" || a.status === "aborted")
        return P;
      i.status === "dirty" && e.dirty(), a.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof a.value < "u" || n.alwaysSet) && (r[i.value] = a.value);
    }
    return { status: e.value, value: r };
  }
}
const P = Object.freeze({
  status: "aborted"
}), ut = (s) => ({ status: "dirty", value: s }), ue = (s) => ({ status: "valid", value: s }), fs = (s) => s.status === "aborted", ps = (s) => s.status === "dirty", Ye = (s) => s.status === "valid", Pt = (s) => typeof Promise < "u" && s instanceof Promise;
var S;
(function(s) {
  s.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, s.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(S || (S = {}));
class me {
  constructor(e, t, r, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const gs = (s, e) => {
  if (Ye(e))
    return { success: !0, data: e.value };
  if (!s.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new xe(s.common.issues);
      return this._error = t, this._error;
    }
  };
};
function I(s) {
  if (!s)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: r, description: n } = s;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (a, o) => {
    const { message: l } = s;
    return a.code === "invalid_enum_value" ? { message: l ?? o.defaultError } : typeof o.data > "u" ? { message: l ?? r ?? o.defaultError } : a.code !== "invalid_type" ? { message: o.defaultError } : { message: l ?? t ?? o.defaultError };
  }, description: n };
}
class M {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return Ee(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: Ee(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new te(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: Ee(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (Pt(t))
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
      parsedType: Ee(e)
    }, n = this._parseSync({ data: e, path: r.path, parent: r });
    return gs(r, n);
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
      parsedType: Ee(e)
    };
    if (!this["~standard"].async)
      try {
        const i = this._parseSync({ data: e, path: [], parent: t });
        return Ye(i) ? {
          value: i.value
        } : {
          issues: t.common.issues
        };
      } catch (i) {
        (n = (r = i == null ? void 0 : i.message) == null ? void 0 : r.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((i) => Ye(i) ? {
      value: i.value
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
      parsedType: Ee(e)
    }, n = this._parse({ data: e, path: r.path, parent: r }), i = await (Pt(n) ? n : Promise.resolve(n));
    return gs(r, i);
  }
  refine(e, t) {
    const r = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, i) => {
      const a = e(n), o = () => i.addIssue({
        code: y.custom,
        ...r(n)
      });
      return typeof Promise < "u" && a instanceof Promise ? a.then((l) => l ? !0 : (o(), !1)) : a ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((r, n) => e(r) ? !0 : (n.addIssue(typeof t == "function" ? t(r, n) : t), !1));
  }
  _refinement(e) {
    return new et({
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
    return Ce.create(this, this._def);
  }
  nullable() {
    return tt.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ye.create(this);
  }
  promise() {
    return Ut.create(this, this._def);
  }
  or(e) {
    return It.create([this, e], this._def);
  }
  and(e) {
    return Nt.create(this, e, this._def);
  }
  transform(e) {
    return new et({
      ...I(this._def),
      schema: this,
      typeName: A.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new mr({
      ...I(this._def),
      innerType: this,
      defaultValue: t,
      typeName: A.ZodDefault
    });
  }
  brand() {
    return new Ii({
      typeName: A.ZodBranded,
      type: this,
      ...I(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new _r({
      ...I(this._def),
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
    return Ir.create(this, e);
  }
  readonly() {
    return br.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const hi = /^c[^\s-]{8,}$/i, fi = /^[0-9a-z]+$/, pi = /^[0-9A-HJKMNP-TV-Z]{26}$/i, gi = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, vi = /^[a-z0-9_-]{21}$/i, yi = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, mi = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, _i = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, bi = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let sr;
const wi = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ki = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, xi = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Si = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ti = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ji = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Js = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Ei = new RegExp(`^${Js}$`);
function Hs(s) {
  let e = "[0-5]\\d";
  s.precision ? e = `${e}\\.\\d{${s.precision}}` : s.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = s.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Oi(s) {
  return new RegExp(`^${Hs(s)}$`);
}
function Ci(s) {
  let e = `${Js}T${Hs(s)}`;
  const t = [];
  return t.push(s.local ? "Z?" : "Z"), s.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Ai(s, e) {
  return !!((e === "v4" || !e) && wi.test(s) || (e === "v6" || !e) && xi.test(s));
}
function Ri(s, e) {
  if (!yi.test(s))
    return !1;
  try {
    const [t] = s.split(".");
    if (!t)
      return !1;
    const r = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(r));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function Pi(s, e) {
  return !!((e === "v4" || !e) && ki.test(s) || (e === "v6" || !e) && Si.test(s));
}
class ke extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== k.string) {
      const i = this._getOrReturnCtx(e);
      return b(i, {
        code: y.invalid_type,
        expected: k.string,
        received: i.parsedType
      }), P;
    }
    const r = new te();
    let n;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (n = this._getOrReturnCtx(e, n), b(n, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (n = this._getOrReturnCtx(e, n), b(n, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "length") {
        const a = e.data.length > i.value, o = e.data.length < i.value;
        (a || o) && (n = this._getOrReturnCtx(e, n), a ? b(n, {
          code: y.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : o && b(n, {
          code: y.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), r.dirty());
      } else if (i.kind === "email")
        _i.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "email",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "emoji")
        sr || (sr = new RegExp(bi, "u")), sr.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "emoji",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "uuid")
        gi.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "uuid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "nanoid")
        vi.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "nanoid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid")
        hi.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "cuid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid2")
        fi.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "cuid2",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "ulid")
        pi.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
          validation: "ulid",
          code: y.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), b(n, {
            validation: "url",
            code: y.invalid_string,
            message: i.message
          }), r.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "regex",
        code: y.invalid_string,
        message: i.message
      }), r.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), r.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "datetime" ? Ci(i).test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.invalid_string,
        validation: "datetime",
        message: i.message
      }), r.dirty()) : i.kind === "date" ? Ei.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.invalid_string,
        validation: "date",
        message: i.message
      }), r.dirty()) : i.kind === "time" ? Oi(i).test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.invalid_string,
        validation: "time",
        message: i.message
      }), r.dirty()) : i.kind === "duration" ? mi.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "duration",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "ip" ? Ai(e.data, i.version) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "ip",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "jwt" ? Ri(e.data, i.alg) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "jwt",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "cidr" ? Pi(e.data, i.version) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "cidr",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64" ? Ti.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "base64",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64url" ? ji.test(e.data) || (n = this._getOrReturnCtx(e, n), b(n, {
        validation: "base64url",
        code: y.invalid_string,
        message: i.message
      }), r.dirty()) : F.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: y.invalid_string,
      ...S.errToObj(r)
    });
  }
  _addCheck(e) {
    return new ke({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...S.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...S.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...S.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...S.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...S.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...S.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...S.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...S.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...S.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...S.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...S.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...S.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...S.errToObj(e) });
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
      ...S.errToObj(e == null ? void 0 : e.message)
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
      ...S.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...S.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...S.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...S.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...S.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...S.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...S.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...S.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...S.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, S.errToObj(e));
  }
  trim() {
    return new ke({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ke({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ke({
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
ke.create = (s) => new ke({
  checks: [],
  typeName: A.ZodString,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...I(s)
});
function $i(s, e) {
  const t = (s.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, n = t > r ? t : r, i = Number.parseInt(s.toFixed(n).replace(".", "")), a = Number.parseInt(e.toFixed(n).replace(".", ""));
  return i % a / 10 ** n;
}
class Qe extends M {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== k.number) {
      const i = this._getOrReturnCtx(e);
      return b(i, {
        code: y.invalid_type,
        expected: k.number,
        received: i.parsedType
      }), P;
    }
    let r;
    const n = new te();
    for (const i of this._def.checks)
      i.kind === "int" ? F.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), n.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), n.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), n.dirty()) : i.kind === "multipleOf" ? $i(e.data, i.value) !== 0 && (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), n.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.not_finite,
        message: i.message
      }), n.dirty()) : F.assertNever(i);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, S.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, S.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, S.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, S.toString(t));
  }
  setLimit(e, t, r, n) {
    return new Qe({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: S.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Qe({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: S.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: S.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: S.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: S.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: S.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: S.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: S.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: S.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: S.toString(e)
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
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && F.isInteger(e.value));
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
Qe.create = (s) => new Qe({
  checks: [],
  typeName: A.ZodNumber,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...I(s)
});
class gt extends M {
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
    if (this._getType(e) !== k.bigint)
      return this._getInvalidInput(e);
    let r;
    const n = new te();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), n.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), n.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), b(r, {
        code: y.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), n.dirty()) : F.assertNever(i);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return b(t, {
      code: y.invalid_type,
      expected: k.bigint,
      received: t.parsedType
    }), P;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, S.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, S.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, S.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, S.toString(t));
  }
  setLimit(e, t, r, n) {
    return new gt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: r,
          message: S.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new gt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: S.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: S.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: S.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: S.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: S.toString(t)
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
gt.create = (s) => new gt({
  checks: [],
  typeName: A.ZodBigInt,
  coerce: (s == null ? void 0 : s.coerce) ?? !1,
  ...I(s)
});
class vs extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== k.boolean) {
      const r = this._getOrReturnCtx(e);
      return b(r, {
        code: y.invalid_type,
        expected: k.boolean,
        received: r.parsedType
      }), P;
    }
    return ue(e.data);
  }
}
vs.create = (s) => new vs({
  typeName: A.ZodBoolean,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...I(s)
});
class $t extends M {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== k.date) {
      const i = this._getOrReturnCtx(e);
      return b(i, {
        code: y.invalid_type,
        expected: k.date,
        received: i.parsedType
      }), P;
    }
    if (Number.isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return b(i, {
        code: y.invalid_date
      }), P;
    }
    const r = new te();
    let n;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), r.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (n = this._getOrReturnCtx(e, n), b(n, {
        code: y.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), r.dirty()) : F.assertNever(i);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new $t({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: S.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: S.toString(t)
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
$t.create = (s) => new $t({
  checks: [],
  coerce: (s == null ? void 0 : s.coerce) || !1,
  typeName: A.ZodDate,
  ...I(s)
});
class ys extends M {
  _parse(e) {
    if (this._getType(e) !== k.symbol) {
      const r = this._getOrReturnCtx(e);
      return b(r, {
        code: y.invalid_type,
        expected: k.symbol,
        received: r.parsedType
      }), P;
    }
    return ue(e.data);
  }
}
ys.create = (s) => new ys({
  typeName: A.ZodSymbol,
  ...I(s)
});
class ms extends M {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const r = this._getOrReturnCtx(e);
      return b(r, {
        code: y.invalid_type,
        expected: k.undefined,
        received: r.parsedType
      }), P;
    }
    return ue(e.data);
  }
}
ms.create = (s) => new ms({
  typeName: A.ZodUndefined,
  ...I(s)
});
class _s extends M {
  _parse(e) {
    if (this._getType(e) !== k.null) {
      const r = this._getOrReturnCtx(e);
      return b(r, {
        code: y.invalid_type,
        expected: k.null,
        received: r.parsedType
      }), P;
    }
    return ue(e.data);
  }
}
_s.create = (s) => new _s({
  typeName: A.ZodNull,
  ...I(s)
});
class bs extends M {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return ue(e.data);
  }
}
bs.create = (s) => new bs({
  typeName: A.ZodAny,
  ...I(s)
});
class gr extends M {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return ue(e.data);
  }
}
gr.create = (s) => new gr({
  typeName: A.ZodUnknown,
  ...I(s)
});
class Ae extends M {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return b(t, {
      code: y.invalid_type,
      expected: k.never,
      received: t.parsedType
    }), P;
  }
}
Ae.create = (s) => new Ae({
  typeName: A.ZodNever,
  ...I(s)
});
class ws extends M {
  _parse(e) {
    if (this._getType(e) !== k.undefined) {
      const r = this._getOrReturnCtx(e);
      return b(r, {
        code: y.invalid_type,
        expected: k.void,
        received: r.parsedType
      }), P;
    }
    return ue(e.data);
  }
}
ws.create = (s) => new ws({
  typeName: A.ZodVoid,
  ...I(s)
});
class ye extends M {
  _parse(e) {
    const { ctx: t, status: r } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== k.array)
      return b(t, {
        code: y.invalid_type,
        expected: k.array,
        received: t.parsedType
      }), P;
    if (n.exactLength !== null) {
      const a = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (a || o) && (b(t, {
        code: a ? y.too_big : y.too_small,
        minimum: o ? n.exactLength.value : void 0,
        maximum: a ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), r.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (b(t, {
      code: y.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), r.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (b(t, {
      code: y.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((a, o) => n.type._parseAsync(new me(t, a, t.path, o)))).then((a) => te.mergeArray(r, a));
    const i = [...t.data].map((a, o) => n.type._parseSync(new me(t, a, t.path, o)));
    return te.mergeArray(r, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new ye({
      ...this._def,
      minLength: { value: e, message: S.toString(t) }
    });
  }
  max(e, t) {
    return new ye({
      ...this._def,
      maxLength: { value: e, message: S.toString(t) }
    });
  }
  length(e, t) {
    return new ye({
      ...this._def,
      exactLength: { value: e, message: S.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
ye.create = (s, e) => new ye({
  type: s,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: A.ZodArray,
  ...I(e)
});
function Ge(s) {
  if (s instanceof H) {
    const e = {};
    for (const t in s.shape) {
      const r = s.shape[t];
      e[t] = Ce.create(Ge(r));
    }
    return new H({
      ...s._def,
      shape: () => e
    });
  } else return s instanceof ye ? new ye({
    ...s._def,
    type: Ge(s.element)
  }) : s instanceof Ce ? Ce.create(Ge(s.unwrap())) : s instanceof tt ? tt.create(Ge(s.unwrap())) : s instanceof Ue ? Ue.create(s.items.map((e) => Ge(e))) : s;
}
class H extends M {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = F.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== k.object) {
      const c = this._getOrReturnCtx(e);
      return b(c, {
        code: y.invalid_type,
        expected: k.object,
        received: c.parsedType
      }), P;
    }
    const { status: r, ctx: n } = this._processInputParams(e), { shape: i, keys: a } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof Ae && this._def.unknownKeys === "strip"))
      for (const c in n.data)
        a.includes(c) || o.push(c);
    const l = [];
    for (const c of a) {
      const u = i[c], h = n.data[c];
      l.push({
        key: { status: "valid", value: c },
        value: u._parse(new me(n, h, n.path, c)),
        alwaysSet: c in n.data
      });
    }
    if (this._def.catchall instanceof Ae) {
      const c = this._def.unknownKeys;
      if (c === "passthrough")
        for (const u of o)
          l.push({
            key: { status: "valid", value: u },
            value: { status: "valid", value: n.data[u] }
          });
      else if (c === "strict")
        o.length > 0 && (b(n, {
          code: y.unrecognized_keys,
          keys: o
        }), r.dirty());
      else if (c !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const c = this._def.catchall;
      for (const u of o) {
        const h = n.data[u];
        l.push({
          key: { status: "valid", value: u },
          value: c._parse(
            new me(n, h, n.path, u)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: u in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const c = [];
      for (const u of l) {
        const h = await u.key, p = await u.value;
        c.push({
          key: h,
          value: p,
          alwaysSet: u.alwaysSet
        });
      }
      return c;
    }).then((c) => te.mergeObjectSync(r, c)) : te.mergeObjectSync(r, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return S.errToObj, new H({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, r) => {
          var i, a;
          const n = ((a = (i = this._def).errorMap) == null ? void 0 : a.call(i, t, r).message) ?? r.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: S.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new H({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new H({
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
    return new H({
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
    return new H({
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
    return new H({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const r of F.objectKeys(e))
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const r of F.objectKeys(this.shape))
      e[r] || (t[r] = this.shape[r]);
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return Ge(this);
  }
  partial(e) {
    const t = {};
    for (const r of F.objectKeys(this.shape)) {
      const n = this.shape[r];
      e && !e[r] ? t[r] = n : t[r] = n.optional();
    }
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const r of F.objectKeys(this.shape))
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let i = this.shape[r];
        for (; i instanceof Ce; )
          i = i._def.innerType;
        t[r] = i;
      }
    return new H({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Ys(F.objectKeys(this.shape));
  }
}
H.create = (s, e) => new H({
  shape: () => s,
  unknownKeys: "strip",
  catchall: Ae.create(),
  typeName: A.ZodObject,
  ...I(e)
});
H.strictCreate = (s, e) => new H({
  shape: () => s,
  unknownKeys: "strict",
  catchall: Ae.create(),
  typeName: A.ZodObject,
  ...I(e)
});
H.lazycreate = (s, e) => new H({
  shape: s,
  unknownKeys: "strip",
  catchall: Ae.create(),
  typeName: A.ZodObject,
  ...I(e)
});
class It extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), r = this._def.options;
    function n(i) {
      for (const o of i)
        if (o.result.status === "valid")
          return o.result;
      for (const o of i)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const a = i.map((o) => new xe(o.ctx.common.issues));
      return b(t, {
        code: y.invalid_union,
        unionErrors: a
      }), P;
    }
    if (t.common.async)
      return Promise.all(r.map(async (i) => {
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
      for (const l of r) {
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
      const o = a.map((l) => new xe(l));
      return b(t, {
        code: y.invalid_union,
        unionErrors: o
      }), P;
    }
  }
  get options() {
    return this._def.options;
  }
}
It.create = (s, e) => new It({
  options: s,
  typeName: A.ZodUnion,
  ...I(e)
});
function vr(s, e) {
  const t = Ee(s), r = Ee(e);
  if (s === e)
    return { valid: !0, data: s };
  if (t === k.object && r === k.object) {
    const n = F.objectKeys(e), i = F.objectKeys(s).filter((o) => n.indexOf(o) !== -1), a = { ...s, ...e };
    for (const o of i) {
      const l = vr(s[o], e[o]);
      if (!l.valid)
        return { valid: !1 };
      a[o] = l.data;
    }
    return { valid: !0, data: a };
  } else if (t === k.array && r === k.array) {
    if (s.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let i = 0; i < s.length; i++) {
      const a = s[i], o = e[i], l = vr(a, o);
      if (!l.valid)
        return { valid: !1 };
      n.push(l.data);
    }
    return { valid: !0, data: n };
  } else return t === k.date && r === k.date && +s == +e ? { valid: !0, data: s } : { valid: !1 };
}
class Nt extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), n = (i, a) => {
      if (fs(i) || fs(a))
        return P;
      const o = vr(i.value, a.value);
      return o.valid ? ((ps(i) || ps(a)) && t.dirty(), { status: t.value, value: o.data }) : (b(r, {
        code: y.invalid_intersection_types
      }), P);
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
    ]).then(([i, a]) => n(i, a)) : n(this._def.left._parseSync({
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
Nt.create = (s, e, t) => new Nt({
  left: s,
  right: e,
  typeName: A.ZodIntersection,
  ...I(t)
});
class Ue extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== k.array)
      return b(r, {
        code: y.invalid_type,
        expected: k.array,
        received: r.parsedType
      }), P;
    if (r.data.length < this._def.items.length)
      return b(r, {
        code: y.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), P;
    !this._def.rest && r.data.length > this._def.items.length && (b(r, {
      code: y.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const i = [...r.data].map((a, o) => {
      const l = this._def.items[o] || this._def.rest;
      return l ? l._parse(new me(r, a, r.path, o)) : null;
    }).filter((a) => !!a);
    return r.common.async ? Promise.all(i).then((a) => te.mergeArray(t, a)) : te.mergeArray(t, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Ue({
      ...this._def,
      rest: e
    });
  }
}
Ue.create = (s, e) => {
  if (!Array.isArray(s))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ue({
    items: s,
    typeName: A.ZodTuple,
    rest: null,
    ...I(e)
  });
};
class Lt extends M {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== k.object)
      return b(r, {
        code: y.invalid_type,
        expected: k.object,
        received: r.parsedType
      }), P;
    const n = [], i = this._def.keyType, a = this._def.valueType;
    for (const o in r.data)
      n.push({
        key: i._parse(new me(r, o, r.path, o)),
        value: a._parse(new me(r, r.data[o], r.path, o)),
        alwaysSet: o in r.data
      });
    return r.common.async ? te.mergeObjectAsync(t, n) : te.mergeObjectSync(t, n);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, r) {
    return t instanceof M ? new Lt({
      keyType: e,
      valueType: t,
      typeName: A.ZodRecord,
      ...I(r)
    }) : new Lt({
      keyType: ke.create(),
      valueType: e,
      typeName: A.ZodRecord,
      ...I(t)
    });
  }
}
class ks extends M {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== k.map)
      return b(r, {
        code: y.invalid_type,
        expected: k.map,
        received: r.parsedType
      }), P;
    const n = this._def.keyType, i = this._def.valueType, a = [...r.data.entries()].map(([o, l], c) => ({
      key: n._parse(new me(r, o, r.path, [c, "key"])),
      value: i._parse(new me(r, l, r.path, [c, "value"]))
    }));
    if (r.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const l of a) {
          const c = await l.key, u = await l.value;
          if (c.status === "aborted" || u.status === "aborted")
            return P;
          (c.status === "dirty" || u.status === "dirty") && t.dirty(), o.set(c.value, u.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const l of a) {
        const c = l.key, u = l.value;
        if (c.status === "aborted" || u.status === "aborted")
          return P;
        (c.status === "dirty" || u.status === "dirty") && t.dirty(), o.set(c.value, u.value);
      }
      return { status: t.value, value: o };
    }
  }
}
ks.create = (s, e, t) => new ks({
  valueType: e,
  keyType: s,
  typeName: A.ZodMap,
  ...I(t)
});
class vt extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== k.set)
      return b(r, {
        code: y.invalid_type,
        expected: k.set,
        received: r.parsedType
      }), P;
    const n = this._def;
    n.minSize !== null && r.data.size < n.minSize.value && (b(r, {
      code: y.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && r.data.size > n.maxSize.value && (b(r, {
      code: y.too_big,
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
          return P;
        u.status === "dirty" && t.dirty(), c.add(u.value);
      }
      return { status: t.value, value: c };
    }
    const o = [...r.data.values()].map((l, c) => i._parse(new me(r, l, r.path, c)));
    return r.common.async ? Promise.all(o).then((l) => a(l)) : a(o);
  }
  min(e, t) {
    return new vt({
      ...this._def,
      minSize: { value: e, message: S.toString(t) }
    });
  }
  max(e, t) {
    return new vt({
      ...this._def,
      maxSize: { value: e, message: S.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
vt.create = (s, e) => new vt({
  valueType: s,
  minSize: null,
  maxSize: null,
  typeName: A.ZodSet,
  ...I(e)
});
class xs extends M {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
xs.create = (s, e) => new xs({
  getter: s,
  typeName: A.ZodLazy,
  ...I(e)
});
class yr extends M {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return b(t, {
        received: t.data,
        code: y.invalid_literal,
        expected: this._def.value
      }), P;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
yr.create = (s, e) => new yr({
  value: s,
  typeName: A.ZodLiteral,
  ...I(e)
});
function Ys(s, e) {
  return new Xe({
    values: s,
    typeName: A.ZodEnum,
    ...I(e)
  });
}
class Xe extends M {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return b(t, {
        expected: F.joinValues(r),
        received: t.parsedType,
        code: y.invalid_type
      }), P;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), r = this._def.values;
      return b(t, {
        received: t.data,
        code: y.invalid_enum_value,
        options: r
      }), P;
    }
    return ue(e.data);
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
    return Xe.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return Xe.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...t
    });
  }
}
Xe.create = Ys;
class Ss extends M {
  _parse(e) {
    const t = F.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== k.string && r.parsedType !== k.number) {
      const n = F.objectValues(t);
      return b(r, {
        expected: F.joinValues(n),
        received: r.parsedType,
        code: y.invalid_type
      }), P;
    }
    if (this._cache || (this._cache = new Set(F.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = F.objectValues(t);
      return b(r, {
        received: r.data,
        code: y.invalid_enum_value,
        options: n
      }), P;
    }
    return ue(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ss.create = (s, e) => new Ss({
  values: s,
  typeName: A.ZodNativeEnum,
  ...I(e)
});
class Ut extends M {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== k.promise && t.common.async === !1)
      return b(t, {
        code: y.invalid_type,
        expected: k.promise,
        received: t.parsedType
      }), P;
    const r = t.parsedType === k.promise ? t.data : Promise.resolve(t.data);
    return ue(r.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
Ut.create = (s, e) => new Ut({
  type: s,
  typeName: A.ZodPromise,
  ...I(e)
});
class et extends M {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === A.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e), n = this._def.effect || null, i = {
      addIssue: (a) => {
        b(r, a), a.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), n.type === "preprocess") {
      const a = n.transform(r.data, i);
      if (r.common.async)
        return Promise.resolve(a).then(async (o) => {
          if (t.value === "aborted")
            return P;
          const l = await this._def.schema._parseAsync({
            data: o,
            path: r.path,
            parent: r
          });
          return l.status === "aborted" ? P : l.status === "dirty" || t.value === "dirty" ? ut(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return P;
        const o = this._def.schema._parseSync({
          data: a,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? P : o.status === "dirty" || t.value === "dirty" ? ut(o.value) : o;
      }
    }
    if (n.type === "refinement") {
      const a = (o) => {
        const l = n.refinement(o, i);
        if (r.common.async)
          return Promise.resolve(l);
        if (l instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return o.status === "aborted" ? P : (o.status === "dirty" && t.dirty(), a(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => o.status === "aborted" ? P : (o.status === "dirty" && t.dirty(), a(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (n.type === "transform")
      if (r.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!Ye(a))
          return P;
        const o = n.transform(a.value, i);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((a) => Ye(a) ? Promise.resolve(n.transform(a.value, i)).then((o) => ({
          status: t.value,
          value: o
        })) : P);
    F.assertNever(n);
  }
}
et.create = (s, e, t) => new et({
  schema: s,
  typeName: A.ZodEffects,
  effect: e,
  ...I(t)
});
et.createWithPreprocess = (s, e, t) => new et({
  schema: e,
  effect: { type: "preprocess", transform: s },
  typeName: A.ZodEffects,
  ...I(t)
});
class Ce extends M {
  _parse(e) {
    return this._getType(e) === k.undefined ? ue(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ce.create = (s, e) => new Ce({
  innerType: s,
  typeName: A.ZodOptional,
  ...I(e)
});
class tt extends M {
  _parse(e) {
    return this._getType(e) === k.null ? ue(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
tt.create = (s, e) => new tt({
  innerType: s,
  typeName: A.ZodNullable,
  ...I(e)
});
class mr extends M {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let r = t.data;
    return t.parsedType === k.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
mr.create = (s, e) => new mr({
  innerType: s,
  typeName: A.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...I(e)
});
class _r extends M {
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
    return Pt(n) ? n.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new xe(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new xe(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
_r.create = (s, e) => new _r({
  innerType: s,
  typeName: A.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...I(e)
});
class Ts extends M {
  _parse(e) {
    if (this._getType(e) !== k.nan) {
      const r = this._getOrReturnCtx(e);
      return b(r, {
        code: y.invalid_type,
        expected: k.nan,
        received: r.parsedType
      }), P;
    }
    return { status: "valid", value: e.data };
  }
}
Ts.create = (s) => new Ts({
  typeName: A.ZodNaN,
  ...I(s)
});
class Ii extends M {
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
class Ir extends M {
  _parse(e) {
    const { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return i.status === "aborted" ? P : i.status === "dirty" ? (t.dirty(), ut(i.value)) : this._def.out._parseAsync({
          data: i.value,
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
      return n.status === "aborted" ? P : n.status === "dirty" ? (t.dirty(), {
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
    return new Ir({
      in: e,
      out: t,
      typeName: A.ZodPipeline
    });
  }
}
class br extends M {
  _parse(e) {
    const t = this._def.innerType._parse(e), r = (n) => (Ye(n) && (n.value = Object.freeze(n.value)), n);
    return Pt(t) ? t.then((n) => r(n)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
br.create = (s, e) => new br({
  innerType: s,
  typeName: A.ZodReadonly,
  ...I(e)
});
var A;
(function(s) {
  s.ZodString = "ZodString", s.ZodNumber = "ZodNumber", s.ZodNaN = "ZodNaN", s.ZodBigInt = "ZodBigInt", s.ZodBoolean = "ZodBoolean", s.ZodDate = "ZodDate", s.ZodSymbol = "ZodSymbol", s.ZodUndefined = "ZodUndefined", s.ZodNull = "ZodNull", s.ZodAny = "ZodAny", s.ZodUnknown = "ZodUnknown", s.ZodNever = "ZodNever", s.ZodVoid = "ZodVoid", s.ZodArray = "ZodArray", s.ZodObject = "ZodObject", s.ZodUnion = "ZodUnion", s.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s.ZodIntersection = "ZodIntersection", s.ZodTuple = "ZodTuple", s.ZodRecord = "ZodRecord", s.ZodMap = "ZodMap", s.ZodSet = "ZodSet", s.ZodFunction = "ZodFunction", s.ZodLazy = "ZodLazy", s.ZodLiteral = "ZodLiteral", s.ZodEnum = "ZodEnum", s.ZodEffects = "ZodEffects", s.ZodNativeEnum = "ZodNativeEnum", s.ZodOptional = "ZodOptional", s.ZodNullable = "ZodNullable", s.ZodDefault = "ZodDefault", s.ZodCatch = "ZodCatch", s.ZodPromise = "ZodPromise", s.ZodBranded = "ZodBranded", s.ZodPipeline = "ZodPipeline", s.ZodReadonly = "ZodReadonly";
})(A || (A = {}));
const N = ke.create, Ni = Qe.create, yt = gr.create;
Ae.create;
const ge = ye.create, oe = H.create, Li = It.create;
Nt.create;
Ue.create;
const Dt = Lt.create, Ui = yr.create;
Xe.create;
Ut.create;
Ce.create;
tt.create;
oe({
  id: N().min(1),
  name: N().min(1).optional(),
  tags: ge(N()).default([]),
  nodeTypes: ge(N()).default([]),
  engineVersion: N().optional(),
  thumbnail: N().optional(),
  lastModified: Li([N(), Ni()]).optional(),
  author: N().optional(),
  outputType: N().optional()
});
const Di = oe({
  presets: ge(
    oe({
      id: N().min(1),
      path: N().min(1),
      tags: ge(N()).optional(),
      nodeTypes: ge(N()).optional(),
      thumbnail: N().optional()
    })
  )
}), Mi = oe({
  name: N().optional(),
  version: N().optional(),
  presetLibrary: oe({
    presets: ge(
      oe({
        id: N().min(1),
        path: N().min(1),
        tags: ge(N()).optional(),
        nodeTypes: ge(N()).optional(),
        thumbnail: N().optional()
      })
    )
  })
});
function Bi(s) {
  return Di.parse(s);
}
function Fi(s) {
  return Mi.parse(s);
}
function Qs(s) {
  try {
    return {
      type: "minimal",
      presets: Bi(s).presets.map((r) => ({
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
    presets: Fi(s).presetLibrary.presets.map((t) => ({
      id: t.id,
      path: t.path,
      tags: t.tags ?? [],
      nodeTypes: t.nodeTypes ?? [],
      thumbnail: t.thumbnail
    }))
  };
}
const Wi = {
  async listPresets() {
    return [
      { id: "p1", name: "Medieval Castle", tags: ["demo", "medieval"], type: "image" },
      { id: "p2", name: "Forest Path", tags: ["nature"], type: "image" },
      { id: "p3", name: "Ocean Waves", tags: ["nature", "demo"], type: "video" }
    ];
  },
  async scanLibraries(s) {
    const e = [], t = [];
    for (const r of s)
      try {
        const n = Qs(r);
        e.push(...n.presets);
      } catch (n) {
        t.push(n instanceof Error ? n.message : "Unknown manifest error");
      }
    if (t.length)
      throw new Error(`${t.length} error(s) during scan`);
    return e;
  }
}, qi = {
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
}, Z = si((s, e) => ({
  ...qi,
  setDetailsOpen: (t) => s({ detailsOpen: t }),
  selectPreset: (t) => s({ selectedPresetId: t }),
  scan: async (t) => {
    s({ scanStatus: "scanning", error: null });
    const r = [], n = [];
    for (const l of t)
      try {
        const c = Qs(l);
        n.push(...c.presets);
      } catch (c) {
        r.push(c instanceof Error ? c.message : "Unknown manifest error");
      }
    if (r.length) {
      s({ scanStatus: "error", error: `${r.length} error(s) during scan` });
      return;
    }
    const i = n.map((l) => ({
      id: l.id,
      name: l.id,
      tags: l.tags,
      type: "unknown"
    })), a = Array.from(new Set(i.flatMap((l) => l.tags))).sort(), o = nr(i, e().activeTags, e().query);
    s({
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
      focusArea: r,
      focusIndex: n,
      sidebarCount: i,
      gridColumnCount: a,
      gridItemCount: o
    } = e();
    if (r === "sidebar") {
      if (t === "up") return s({ focusIndex: Math.max(0, n - 1) });
      if (t === "down") return s({ focusIndex: Math.min(Math.max(0, i - 1), n + 1) });
      if (t === "right") {
        const l = e().filteredPresets[0];
        return s(l ? { focusArea: "grid", focusIndex: 0, selectedPresetId: l.id } : { focusArea: "grid", focusIndex: 0 });
      }
      return;
    } else {
      const l = Math.max(1, a);
      let c = n;
      if (t === "left") {
        if (n % l === 0) return s({ focusArea: "sidebar", focusIndex: 0 });
        c = Math.max(0, n - 1);
      } else t === "right" ? c = Math.min(o - 1, n + 1) : t === "up" ? c = Math.max(0, n - l) : t === "down" && (c = Math.min(o - 1, n + l));
      s({ focusIndex: c });
      const u = e().filteredPresets[c];
      u && s({ selectedPresetId: u.id });
    }
  },
  toggleTag: (t) => {
    const { activeTags: r } = e(), n = r.includes(t) ? r.filter((a) => a !== t) : [...r, t], i = nr(e().presets, n, e().query);
    s({ activeTags: n, filteredPresets: i });
  },
  setQuery: (t) => {
    const r = nr(e().presets, e().activeTags, t);
    s({ query: t, filteredPresets: r });
  },
  setSidebarCount: (t) => s({ sidebarCount: t, focusIndex: Math.min(e().focusIndex, Math.max(0, t - 1)) }),
  setGridMetrics: ({ columnCount: t, itemCount: r }) => s({ gridColumnCount: t, gridItemCount: r }),
  setFocus: (t, r) => s({ focusArea: t, focusIndex: r })
}));
function nr(s, e, t) {
  let r = s;
  return e.length && (r = r.filter((n) => e.every((i) => n.tags.includes(i)))), t && t.trim().length > 0 ? new ni(r, {
    keys: ["name", "tags"],
    threshold: 0.4,
    ignoreLocation: !0
  }).search(t).map((i) => i.item) : r;
}
(async () => {
  const s = await Wi.listPresets(), e = Array.from(new Set(s.flatMap((t) => t.tags))).sort();
  Z.setState({ presets: s, filteredPresets: s, availableTags: e });
})();
function Vi() {
  const s = Z((h) => h.availableTags), e = Z((h) => h.activeTags), t = Z((h) => h.toggleTag), r = Z((h) => h.query), n = Z((h) => h.setQuery), i = Z((h) => h.scanStatus), a = Z((h) => h.error), o = Z((h) => h.focusArea), l = Z((h) => h.focusIndex), c = Z((h) => h.setSidebarCount), u = Z((h) => h.setFocus);
  return Rt(() => {
    c(s.length);
  }, [s.length, c]), /* @__PURE__ */ f.jsxs("aside", { "aria-label": "Asset Libraries", role: "navigation", style: { borderRight: "1px solid #eee", padding: 8 }, children: [
    /* @__PURE__ */ f.jsxs("div", { "aria-live": "polite", style: { fontSize: 12, color: "#555" }, children: [
      i === "scanning" && /* @__PURE__ */ f.jsx("span", { children: "Scanning…" }),
      i === "error" && /* @__PURE__ */ f.jsxs("span", { role: "alert", style: { color: "#b00" }, children: [
        "Scan error: ",
        a
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("div", { style: { marginBottom: 12 }, children: [
      /* @__PURE__ */ f.jsx("label", { htmlFor: "asset-search", style: { display: "block", fontWeight: 600 }, children: "Search" }),
      /* @__PURE__ */ f.jsx(
        "input",
        {
          id: "asset-search",
          type: "search",
          value: r,
          onChange: (h) => n(h.target.value),
          placeholder: "Search presets",
          "aria-label": "Search presets",
          style: { width: "100%", padding: "6px 8px" }
        }
      )
    ] }),
    /* @__PURE__ */ f.jsx("h3", { id: "tags", children: "Tags" }),
    i === "done" && s.length === 0 ? /* @__PURE__ */ f.jsx("div", { role: "status", "aria-live": "polite", style: { fontSize: 12, color: "#555", padding: "4px 0" }, children: "No tags available." }) : /* @__PURE__ */ f.jsx("ul", { role: "listbox", "aria-labelledby": "tags", children: s.map((h, p) => /* @__PURE__ */ f.jsx("li", { role: "option", "aria-selected": e.includes(h), children: /* @__PURE__ */ f.jsxs(
      "button",
      {
        type: "button",
        onClick: () => t(h),
        "aria-pressed": e.includes(h),
        tabIndex: o === "sidebar" && l === p ? 0 : -1,
        onFocus: () => u("sidebar", p),
        children: [
          e.includes(h) ? "✓ " : "",
          h
        ]
      }
    ) }, h)) })
  ] });
}
function zi({ preset: s, onClick: e, onInsert: t, tabIndex: r, onFocus: n }) {
  const i = (a) => {
    try {
      const o = JSON.stringify({ id: s.id, name: s.name, tags: s.tags, type: s.type });
      a.dataTransfer.setData("application/x-preset", o), a.dataTransfer.effectAllowed = "copy";
    } catch {
    }
  };
  return /* @__PURE__ */ f.jsxs(
    "div",
    {
      role: "button",
      tabIndex: r ?? 0,
      "aria-label": `Preset ${s.name}`,
      onClick: e,
      onFocus: n,
      onKeyDown: (a) => {
        (a.key === "Enter" || a.key === " ") && (e == null || e());
      },
      style: { display: "block", width: 160, height: 140, margin: 8, border: "1px solid #ddd", borderRadius: 6, padding: 8 },
      children: [
        /* @__PURE__ */ f.jsx("div", { style: { fontWeight: 600, marginBottom: 8 }, children: s.name }),
        /* @__PURE__ */ f.jsx("div", { style: { fontSize: 12, color: "#666" }, children: s.tags.join(", ") }),
        /* @__PURE__ */ f.jsxs("div", { style: { marginTop: 8, display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ f.jsx(
            "span",
            {
              role: "button",
              "aria-label": "drag handle",
              draggable: !0,
              onDragStart: i,
              style: { cursor: "grab" },
              "data-testid": "preset-drag-handle",
              children: "⠿"
            }
          ),
          /* @__PURE__ */ f.jsx("button", { type: "button", onClick: (a) => {
            a.stopPropagation(), t == null || t(s);
          }, "aria-label": "Insert preset", style: { marginLeft: 8 }, children: "Insert" })
        ] })
      ]
    }
  );
}
const js = 180, Zi = 160;
function Ki({ onInsert: s }) {
  const e = Z((_) => _.filteredPresets), t = Z((_) => _.scanStatus), r = Z((_) => _.error), n = Z((_) => _.selectPreset), i = Z((_) => _.focusArea), a = Z((_) => _.focusIndex), o = Z((_) => _.setGridMetrics), l = Z((_) => _.setFocus), c = $r(null), [u, h] = Te({ w: 900, h: 600 });
  Rt(() => {
    if (!c.current) return;
    const _ = c.current, R = () => h({ w: _.clientWidth || 900, h: _.clientHeight || 600 });
    if (R(), typeof ResizeObserver == "function") {
      const K = new ResizeObserver(R);
      return K.observe(_), () => K.disconnect();
    }
    return window.addEventListener("resize", R), () => window.removeEventListener("resize", R);
  }, []);
  const p = u.w, m = u.h, v = Math.max(1, Math.floor(p / js)), x = Math.ceil(e.length / v);
  Rt(() => {
    o({ columnCount: v, itemCount: e.length });
  }, [v, e.length, o]);
  const T = Gs(() => {
    function _({ columnIndex: R, rowIndex: K, style: W }) {
      const O = K * v + R, Q = e[O];
      if (!Q) return /* @__PURE__ */ f.jsx("div", { style: W });
      const re = i === "grid" && a === O;
      return /* @__PURE__ */ f.jsx("div", { style: W, "data-grid-index": O, role: "gridcell", "aria-selected": re, children: /* @__PURE__ */ f.jsx(
        zi,
        {
          preset: Q,
          onClick: () => n(Q.id),
          onInsert: s,
          tabIndex: i === "grid" && a === O ? 0 : -1,
          onFocus: () => l("grid", O)
        }
      ) });
    }
    return _.displayName = "GridCell", _;
  }, [e, n, s, v, i, a, l]), j = t === "done" && e.length === 0, E = t === "error";
  return /* @__PURE__ */ f.jsx("div", { "aria-label": "Preset Grid", role: "grid", ref: c, style: { width: "100%", height: "100%", overflow: "hidden" }, children: E ? /* @__PURE__ */ f.jsxs("div", { role: "alert", "aria-live": "assertive", style: { padding: 16, color: "#b00" }, children: [
    "Failed to scan libraries: ",
    r
  ] }) : j ? /* @__PURE__ */ f.jsx("div", { role: "status", "aria-live": "polite", style: { padding: 16, color: "#555" }, children: "No presets found. Adjust your search or filters." }) : /* @__PURE__ */ f.jsx(
    ii,
    {
      height: m,
      width: p,
      columnWidth: js,
      rowHeight: Zi,
      columnCount: v,
      rowCount: x,
      children: T
    }
  ) });
}
function Gi({ data: s }) {
  const r = s.nodes.reduce((n, i, a) => (n[i.id] = { x: 40 + a * 120, y: 60 }, n), {});
  return /* @__PURE__ */ f.jsxs("svg", { width: 320, height: 120, role: "img", "aria-label": "Branch visualization", children: [
    s.edges.map((n, i) => {
      const a = r[n.from], o = r[n.to];
      return !a || !o ? null : /* @__PURE__ */ f.jsx("line", { x1: a.x, y1: a.y, x2: o.x, y2: o.y, stroke: "#999", strokeWidth: 2 }, i);
    }),
    s.nodes.map((n) => {
      const i = r[n.id];
      return /* @__PURE__ */ f.jsxs("g", { children: [
        /* @__PURE__ */ f.jsx("circle", { cx: i.x, cy: i.y, r: 12, fill: "#4a90e2" }),
        /* @__PURE__ */ f.jsx("text", { x: i.x, y: i.y - 16, textAnchor: "middle", fontSize: 10, fill: "#333", children: n.id })
      ] }, n.id);
    })
  ] });
}
const Es = {
  async simulate(s, e) {
    const { seeds: t } = e;
    return t.map((r) => ({ seed: r, text: `Sample for ${s.name} (seed ${r})` }));
  },
  async branchMap(s) {
    const e = s.id.slice(0, 3) || "pre", t = [
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
function Ji() {
  return null;
}
function Hi() {
  const s = Gs(() => Ji(), []);
  return {
    async simulate(e, t) {
      return s ? s.simulate(e, t) : Es.simulate(e, t);
    },
    async branchMap(e) {
      return s ? s.branchMap(e) : Es.branchMap(e);
    }
  };
}
function Yi() {
  const s = $r(/* @__PURE__ */ new Map());
  return {
    get(e) {
      return s.current.get(e);
    },
    set(e, t) {
      s.current.set(e, t);
    },
    has(e) {
      return s.current.has(e);
    }
  };
}
function Qi({ open: s, selectedId: e }) {
  const r = Z((O) => O.filteredPresets).find((O) => O.id === e) || null, [n, i] = Te(!1), [a, o] = Te(null), [l, c] = Te(null), [u, h] = Te(!1), [p, m] = Te(!1), [v, x] = Te(null), [T, j] = Te(null), { simulate: E, branchMap: _ } = Hi(), R = Yi(), K = async () => {
    if (r) {
      o(null), i(!0);
      try {
        const O = `sim:${r.id}`, Q = R.get(O), re = Q || await E(r, { seeds: [0, 1, 2] });
        Q || R.set(O, re), c(re);
      } catch (O) {
        const Q = O instanceof Error ? O.message : "Simulation failed";
        o(Q);
      } finally {
        i(!1);
      }
    }
  }, W = async () => {
    const O = !u;
    if (h(O), O && !T && r) {
      x(null), m(!0);
      try {
        const Q = `branch:${r.id}`, re = R.get(Q), Me = re || await _(r);
        re || R.set(Q, Me), j(Me);
      } catch (Q) {
        const re = Q instanceof Error ? Q.message : "Branch map failed";
        x(re);
      } finally {
        m(!1);
      }
    }
  };
  return /* @__PURE__ */ f.jsx(
    "aside",
    {
      "aria-label": "Details Drawer",
      "aria-hidden": !s,
      style: {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: s ? 360 : 0,
        overflow: "hidden",
        transition: "width 150ms",
        borderLeft: "1px solid #eee",
        background: "#fff",
        padding: s ? 12 : 0
      },
      children: s && /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsxs("h3", { style: { marginTop: 0 }, children: [
          "Details ",
          r ? `— ${r.name}` : ""
        ] }),
        /* @__PURE__ */ f.jsxs("section", { "aria-labelledby": "simulate-title", "aria-busy": n, children: [
          /* @__PURE__ */ f.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ f.jsx("h4", { id: "simulate-title", style: { margin: "8px 0" }, children: "Sample Outputs" }),
            /* @__PURE__ */ f.jsx(
              "button",
              {
                type: "button",
                onClick: K,
                disabled: !r || n,
                "aria-label": "Simulate",
                children: n ? "Simulating…" : "Simulate"
              }
            )
          ] }),
          a && /* @__PURE__ */ f.jsx("div", { role: "status", "aria-live": "polite", style: { color: "crimson" }, children: a }),
          l && /* @__PURE__ */ f.jsx("ul", { children: l.map((O) => /* @__PURE__ */ f.jsxs("li", { children: [
            /* @__PURE__ */ f.jsxs("code", { children: [
              "#",
              O.seed
            ] }),
            " ",
            O.text
          ] }, O.seed)) })
        ] }),
        /* @__PURE__ */ f.jsxs("section", { "aria-labelledby": "branch-title", "aria-busy": p, style: { marginTop: 16 }, children: [
          /* @__PURE__ */ f.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ f.jsx("h4", { id: "branch-title", style: { margin: "8px 0" }, children: "Branch Viz" }),
            /* @__PURE__ */ f.jsx(
              "button",
              {
                type: "button",
                onClick: W,
                "aria-pressed": u,
                "aria-label": "Toggle branch visualization",
                children: u ? "Hide" : "Show"
              }
            )
          ] }),
          v && /* @__PURE__ */ f.jsx("div", { role: "status", "aria-live": "polite", style: { color: "crimson" }, children: v }),
          u && T && /* @__PURE__ */ f.jsx(Gi, { data: T })
        ] })
      ] })
    }
  );
}
const Xi = ri({
  toggleOpen: () => {
  },
  isWithinBounds: () => !1
});
function ea({ children: s }) {
  const e = $r(null), t = Z((o) => o.detailsOpen), r = Z((o) => o.setDetailsOpen), n = Z((o) => o.moveSelection), i = () => r(!t), a = () => {
    if (!e.current) return !1;
    const o = document.activeElement;
    return e.current.contains(o);
  };
  return Rt(() => {
    const o = (l) => {
      if (!a()) return;
      const c = l.target;
      if (c.tagName === "INPUT" || c.tagName === "TEXTAREA" || c.contentEditable === "true")
        return;
      let u = !0;
      ["ArrowUp", "k"].includes(l.key) ? n("up") : ["ArrowDown", "j"].includes(l.key) ? n("down") : ["ArrowLeft", "h"].includes(l.key) ? n("left") : ["ArrowRight", "l"].includes(l.key) ? n("right") : l.key === "Enter" && !l.ctrlKey && !l.metaKey ? r(!0) : l.key === "Escape" ? r(!1) : u = !1, u && (l.preventDefault(), l.stopPropagation());
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [n, r]), /* @__PURE__ */ f.jsx("div", { ref: e, children: /* @__PURE__ */ f.jsx(Xi.Provider, { value: { toggleOpen: i, isWithinBounds: a }, children: s }) });
}
function ta({ onInsert: s }) {
  const e = Z((r) => r.selectedPresetId), t = Z((r) => r.detailsOpen);
  return /* @__PURE__ */ f.jsx(ea, { children: /* @__PURE__ */ f.jsxs("div", { className: "asset-browser", style: { display: "grid", gridTemplateColumns: "280px 1fr" }, children: [
    /* @__PURE__ */ f.jsx(Vi, {}),
    /* @__PURE__ */ f.jsx("div", { children: /* @__PURE__ */ f.jsx(Ki, { onInsert: s }) }),
    /* @__PURE__ */ f.jsx(Qi, { open: t, selectedId: e })
  ] }) });
}
async function wr(s = "") {
  const e = s ? `${s.replace(/\/$/, "")}/graphs/manifest.json` : "/graphs/manifest.json", t = await fetch(e);
  if (!t.ok)
    throw new Error(`Failed to load graph manifest: ${t.status}`);
  const r = await t.json();
  return Array.isArray(r) ? r.filter((n) => typeof (n == null ? void 0 : n.filename) == "string" && typeof (n == null ? void 0 : n.title) == "string") : [];
}
function Nr({ title: s = "Nothing here yet", message: e, helpUrl: t, actionLabel: r, onAction: n }) {
  return /* @__PURE__ */ f.jsxs("div", { role: "status", "aria-live": "polite", style: { padding: 12, color: "#555", border: "1px dashed #ddd", borderRadius: 6, marginTop: 8 }, children: [
    s && /* @__PURE__ */ f.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: s }),
    /* @__PURE__ */ f.jsx("div", { children: e }),
    /* @__PURE__ */ f.jsxs("div", { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" }, children: [
      r && n && /* @__PURE__ */ f.jsx("button", { type: "button", onClick: n, children: r }),
      t && /* @__PURE__ */ f.jsx("a", { href: t, target: "_blank", rel: "noreferrer", children: "Learn more" })
    ] })
  ] });
}
function Ft({ title: s = "Something went wrong", message: e, retryLabel: t = "Retry", onRetry: r }) {
  return /* @__PURE__ */ f.jsxs("div", { role: "alert", "aria-live": "assertive", style: { padding: 12, color: "#b00", border: "1px solid #f3c2c2", background: "#fff6f6", borderRadius: 6, marginTop: 8 }, children: [
    s && /* @__PURE__ */ f.jsx("strong", { style: { display: "block", marginBottom: 4 }, children: s }),
    /* @__PURE__ */ f.jsx("div", { children: e }),
    r && /* @__PURE__ */ f.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ f.jsx("button", { type: "button", onClick: r, children: t }) })
  ] });
}
async function ra(s, e = {}) {
  const {
    retries: t = 2,
    minDelayMs: r = 200,
    maxDelayMs: n = 1500,
    factor: i = 2,
    jitter: a = !0,
    isRetryable: o = () => !0
  } = e;
  let l = 0;
  for (; ; )
    try {
      return await s();
    } catch (c) {
      if (!(l < t && o(c))) throw c;
      const h = Math.min(n, r * Math.pow(i, l)), p = a ? h * (0.5 + Math.random()) : h;
      await new Promise((m) => setTimeout(m, p)), l += 1;
    }
}
function sa() {
  const [s, e] = D.useState("idle"), [t, r] = D.useState(null), [n, i] = D.useState(!1), [a, o] = D.useState([]), l = D.useCallback(async () => {
    e("loading"), r(null), i(!1);
    try {
      const u = await wr("");
      o(u), e("done");
    } catch (u) {
      const h = u instanceof Error ? u.message : String(u ?? "Failed to load graph manifest");
      typeof h == "string" && /404/.test(h) ? (i(!0), o([]), e("done")) : (r(h), e("error"));
    }
  }, []), c = D.useCallback(async () => {
    e("loading"), r(null), i(!1);
    try {
      const u = await ra(() => wr(""), {
        retries: 2,
        isRetryable: (h) => {
          const p = h instanceof Error ? h.message : String(h ?? "");
          return !/404/.test(p);
        }
      });
      o(u), e("done");
    } catch (u) {
      const h = u instanceof Error ? u.message : String(u ?? "Failed to load graph manifest");
      /404/.test(h) ? (i(!0), o([]), e("done")) : (r(h), e("error"));
    }
  }, []);
  return D.useEffect(() => {
    l();
  }, [l]), /* @__PURE__ */ f.jsxs("section", { "aria-label": "Server Graphs", style: { padding: 12 }, children: [
    /* @__PURE__ */ f.jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ f.jsx("h2", { style: { margin: 0 }, children: "Server" }),
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: c, disabled: s === "loading", children: s === "loading" ? "Loading…" : "Retry" })
    ] }),
    s === "error" && /* @__PURE__ */ f.jsx(Ft, { message: t || "Failed to load graph manifest", onRetry: c }),
    s === "done" && a.length === 0 ? /* @__PURE__ */ f.jsx(
      Nr,
      {
        title: n ? "No server manifest found" : "No server graphs",
        message: "No server graphs available. See docs for adding demo assets.",
        helpUrl: n ? "docs/stories/1.15.error-empty-states-and-fallbacks.md" : void 0,
        actionLabel: n ? "Retry" : void 0,
        onAction: n ? c : void 0
      }
    ) : null,
    s === "done" && a.length > 0 && /* @__PURE__ */ f.jsx("ul", { "aria-label": "Server Graph List", style: { marginTop: 8 }, children: a.map((u) => /* @__PURE__ */ f.jsxs("li", { children: [
      /* @__PURE__ */ f.jsx("strong", { children: u.title }),
      /* @__PURE__ */ f.jsxs("div", { style: { fontSize: 12, color: "#555" }, children: [
        u.filename,
        " • ",
        new Date(u.updatedAt).toLocaleString()
      ] })
    ] }, u.filename)) })
  ] });
}
function na({ libraryView: s }) {
  const [e, t] = D.useState("library");
  return /* @__PURE__ */ f.jsxs("section", { "aria-label": "Asset Browser Tabs", children: [
    /* @__PURE__ */ f.jsxs("nav", { "aria-label": "Asset Views", style: { display: "flex", gap: 8, borderBottom: "1px solid #ddd", padding: 8 }, children: [
      /* @__PURE__ */ f.jsx(
        "button",
        {
          type: "button",
          "aria-selected": e === "library",
          onClick: () => t("library"),
          children: "Library"
        }
      ),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          type: "button",
          "aria-selected": e === "server",
          onClick: () => t("server"),
          children: "Server"
        }
      )
    ] }),
    /* @__PURE__ */ f.jsxs("div", { style: { padding: 8 }, children: [
      e === "library" && /* @__PURE__ */ f.jsx("div", { "aria-label": "Library View", children: s ?? /* @__PURE__ */ f.jsx("em", { children: "No library view provided." }) }),
      e === "server" && /* @__PURE__ */ f.jsx(sa, {})
    ] })
  ] });
}
function ia(s) {
  return /* @__PURE__ */ f.jsx(na, { libraryView: /* @__PURE__ */ f.jsx(ta, { ...s }) });
}
const aa = (s) => {
  let e;
  return s ? e = s : typeof fetch > "u" ? e = (...t) => Promise.resolve().then(() => st).then(({ default: r }) => r(...t)) : e = fetch, (...t) => e(...t);
};
class Lr extends Error {
  constructor(e, t = "FunctionsError", r) {
    super(e), this.name = t, this.context = r;
  }
}
class oa extends Lr {
  constructor(e) {
    super("Failed to send a request to the Edge Function", "FunctionsFetchError", e);
  }
}
class Os extends Lr {
  constructor(e) {
    super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
  }
}
class Cs extends Lr {
  constructor(e) {
    super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e);
  }
}
var kr;
(function(s) {
  s.Any = "any", s.ApNortheast1 = "ap-northeast-1", s.ApNortheast2 = "ap-northeast-2", s.ApSouth1 = "ap-south-1", s.ApSoutheast1 = "ap-southeast-1", s.ApSoutheast2 = "ap-southeast-2", s.CaCentral1 = "ca-central-1", s.EuCentral1 = "eu-central-1", s.EuWest1 = "eu-west-1", s.EuWest2 = "eu-west-2", s.EuWest3 = "eu-west-3", s.SaEast1 = "sa-east-1", s.UsEast1 = "us-east-1", s.UsWest1 = "us-west-1", s.UsWest2 = "us-west-2";
})(kr || (kr = {}));
var la = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
class ca {
  constructor(e, { headers: t = {}, customFetch: r, region: n = kr.Any } = {}) {
    this.url = e, this.headers = t, this.region = n, this.fetch = aa(r);
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
    var r;
    return la(this, void 0, void 0, function* () {
      try {
        const { headers: n, method: i, body: a } = t;
        let o = {}, { region: l } = t;
        l || (l = this.region);
        const c = new URL(`${this.url}/${e}`);
        l && l !== "any" && (o["x-region"] = l, c.searchParams.set("forceFunctionRegion", l));
        let u;
        a && (n && !Object.prototype.hasOwnProperty.call(n, "Content-Type") || !n) && (typeof Blob < "u" && a instanceof Blob || a instanceof ArrayBuffer ? (o["Content-Type"] = "application/octet-stream", u = a) : typeof a == "string" ? (o["Content-Type"] = "text/plain", u = a) : typeof FormData < "u" && a instanceof FormData ? u = a : (o["Content-Type"] = "application/json", u = JSON.stringify(a)));
        const h = yield this.fetch(c.toString(), {
          method: i || "POST",
          // headers priority is (high to low):
          // 1. invoke-level headers
          // 2. client-level headers
          // 3. default Content-Type header
          headers: Object.assign(Object.assign(Object.assign({}, o), this.headers), n),
          body: u
        }).catch((x) => {
          throw new oa(x);
        }), p = h.headers.get("x-relay-error");
        if (p && p === "true")
          throw new Os(h);
        if (!h.ok)
          throw new Cs(h);
        let m = ((r = h.headers.get("Content-Type")) !== null && r !== void 0 ? r : "text/plain").split(";")[0].trim(), v;
        return m === "application/json" ? v = yield h.json() : m === "application/octet-stream" ? v = yield h.blob() : m === "text/event-stream" ? v = h : m === "multipart/form-data" ? v = yield h.formData() : v = yield h.text(), { data: v, error: null, response: h };
      } catch (n) {
        return {
          data: null,
          error: n,
          response: n instanceof Cs || n instanceof Os ? n.context : void 0
        };
      }
    });
  }
}
var ie = {}, Ur = {}, Wt = {}, _t = {}, qt = {}, Vt = {}, ua = function() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("unable to locate global object");
}, rt = ua();
const da = rt.fetch, Xs = rt.fetch.bind(rt), en = rt.Headers, ha = rt.Request, fa = rt.Response, st = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Headers: en,
  Request: ha,
  Response: fa,
  default: Xs,
  fetch: da
}, Symbol.toStringTag, { value: "Module" })), pa = /* @__PURE__ */ ai(st);
var zt = {};
Object.defineProperty(zt, "__esModule", { value: !0 });
let ga = class extends Error {
  constructor(e) {
    super(e.message), this.name = "PostgrestError", this.details = e.details, this.hint = e.hint, this.code = e.code;
  }
};
zt.default = ga;
var tn = ce && ce.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(Vt, "__esModule", { value: !0 });
const va = tn(pa), ya = tn(zt);
let ma = class {
  constructor(e) {
    this.shouldThrowOnError = !1, this.method = e.method, this.url = e.url, this.headers = e.headers, this.schema = e.schema, this.body = e.body, this.shouldThrowOnError = e.shouldThrowOnError, this.signal = e.signal, this.isMaybeSingle = e.isMaybeSingle, e.fetch ? this.fetch = e.fetch : typeof fetch > "u" ? this.fetch = va.default : this.fetch = fetch;
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
    const r = this.fetch;
    let n = r(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal
    }).then(async (i) => {
      var a, o, l;
      let c = null, u = null, h = null, p = i.status, m = i.statusText;
      if (i.ok) {
        if (this.method !== "HEAD") {
          const j = await i.text();
          j === "" || (this.headers.Accept === "text/csv" || this.headers.Accept && this.headers.Accept.includes("application/vnd.pgrst.plan+text") ? u = j : u = JSON.parse(j));
        }
        const x = (a = this.headers.Prefer) === null || a === void 0 ? void 0 : a.match(/count=(exact|planned|estimated)/), T = (o = i.headers.get("content-range")) === null || o === void 0 ? void 0 : o.split("/");
        x && T && T.length > 1 && (h = parseInt(T[1])), this.isMaybeSingle && this.method === "GET" && Array.isArray(u) && (u.length > 1 ? (c = {
          // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
          code: "PGRST116",
          details: `Results contain ${u.length} rows, application/vnd.pgrst.object+json requires 1 row`,
          hint: null,
          message: "JSON object requested, multiple (or no) rows returned"
        }, u = null, h = null, p = 406, m = "Not Acceptable") : u.length === 1 ? u = u[0] : u = null);
      } else {
        const x = await i.text();
        try {
          c = JSON.parse(x), Array.isArray(c) && i.status === 404 && (u = [], c = null, p = 200, m = "OK");
        } catch {
          i.status === 404 && x === "" ? (p = 204, m = "No Content") : c = {
            message: x
          };
        }
        if (c && this.isMaybeSingle && (!((l = c == null ? void 0 : c.details) === null || l === void 0) && l.includes("0 rows")) && (c = null, p = 200, m = "OK"), c && this.shouldThrowOnError)
          throw new ya.default(c);
      }
      return {
        error: c,
        data: u,
        count: h,
        status: p,
        statusText: m
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
Vt.default = ma;
var _a = ce && ce.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(qt, "__esModule", { value: !0 });
const ba = _a(Vt);
let wa = class extends ba.default {
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
    const r = (e ?? "*").split("").map((n) => /\s/.test(n) && !t ? "" : (n === '"' && (t = !t), n)).join("");
    return this.url.searchParams.set("select", r), this.headers.Prefer && (this.headers.Prefer += ","), this.headers.Prefer += "return=representation", this;
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
  order(e, { ascending: t = !0, nullsFirst: r, foreignTable: n, referencedTable: i = n } = {}) {
    const a = i ? `${i}.order` : "order", o = this.url.searchParams.get(a);
    return this.url.searchParams.set(a, `${o ? `${o},` : ""}${e}.${t ? "asc" : "desc"}${r === void 0 ? "" : r ? ".nullsfirst" : ".nullslast"}`), this;
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
  limit(e, { foreignTable: t, referencedTable: r = t } = {}) {
    const n = typeof r > "u" ? "limit" : `${r}.limit`;
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
  range(e, t, { foreignTable: r, referencedTable: n = r } = {}) {
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
  explain({ analyze: e = !1, verbose: t = !1, settings: r = !1, buffers: n = !1, wal: i = !1, format: a = "text" } = {}) {
    var o;
    const l = [
      e ? "analyze" : null,
      t ? "verbose" : null,
      r ? "settings" : null,
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
qt.default = wa;
var ka = ce && ce.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(_t, "__esModule", { value: !0 });
const xa = ka(qt);
let Sa = class extends xa.default {
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
    const r = Array.from(new Set(t)).map((n) => typeof n == "string" && new RegExp("[,()]").test(n) ? `"${n}"` : `${n}`).join(",");
    return this.url.searchParams.append(e, `in.(${r})`), this;
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
  textSearch(e, t, { config: r, type: n } = {}) {
    let i = "";
    n === "plain" ? i = "pl" : n === "phrase" ? i = "ph" : n === "websearch" && (i = "w");
    const a = r === void 0 ? "" : `(${r})`;
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
    return Object.entries(e).forEach(([t, r]) => {
      this.url.searchParams.append(t, `eq.${r}`);
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
  not(e, t, r) {
    return this.url.searchParams.append(e, `not.${t}.${r}`), this;
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
  or(e, { foreignTable: t, referencedTable: r = t } = {}) {
    const n = r ? `${r}.or` : "or";
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
  filter(e, t, r) {
    return this.url.searchParams.append(e, `${t}.${r}`), this;
  }
};
_t.default = Sa;
var Ta = ce && ce.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(Wt, "__esModule", { value: !0 });
const ct = Ta(_t);
let ja = class {
  constructor(e, { headers: t = {}, schema: r, fetch: n }) {
    this.url = e, this.headers = t, this.schema = r, this.fetch = n;
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
  select(e, { head: t = !1, count: r } = {}) {
    const n = t ? "HEAD" : "GET";
    let i = !1;
    const a = (e ?? "*").split("").map((o) => /\s/.test(o) && !i ? "" : (o === '"' && (i = !i), o)).join("");
    return this.url.searchParams.set("select", a), r && (this.headers.Prefer = `count=${r}`), new ct.default({
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
  insert(e, { count: t, defaultToNull: r = !0 } = {}) {
    const n = "POST", i = [];
    if (this.headers.Prefer && i.push(this.headers.Prefer), t && i.push(`count=${t}`), r || i.push("missing=default"), this.headers.Prefer = i.join(","), Array.isArray(e)) {
      const a = e.reduce((o, l) => o.concat(Object.keys(l)), []);
      if (a.length > 0) {
        const o = [...new Set(a)].map((l) => `"${l}"`);
        this.url.searchParams.set("columns", o.join(","));
      }
    }
    return new ct.default({
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
  upsert(e, { onConflict: t, ignoreDuplicates: r = !1, count: n, defaultToNull: i = !0 } = {}) {
    const a = "POST", o = [`resolution=${r ? "ignore" : "merge"}-duplicates`];
    if (t !== void 0 && this.url.searchParams.set("on_conflict", t), this.headers.Prefer && o.push(this.headers.Prefer), n && o.push(`count=${n}`), i || o.push("missing=default"), this.headers.Prefer = o.join(","), Array.isArray(e)) {
      const l = e.reduce((c, u) => c.concat(Object.keys(u)), []);
      if (l.length > 0) {
        const c = [...new Set(l)].map((u) => `"${u}"`);
        this.url.searchParams.set("columns", c.join(","));
      }
    }
    return new ct.default({
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
    const r = "PATCH", n = [];
    return this.headers.Prefer && n.push(this.headers.Prefer), t && n.push(`count=${t}`), this.headers.Prefer = n.join(","), new ct.default({
      method: r,
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
    const t = "DELETE", r = [];
    return e && r.push(`count=${e}`), this.headers.Prefer && r.unshift(this.headers.Prefer), this.headers.Prefer = r.join(","), new ct.default({
      method: t,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: this.fetch,
      allowEmpty: !1
    });
  }
};
Wt.default = ja;
var Zt = {}, Kt = {};
Object.defineProperty(Kt, "__esModule", { value: !0 });
Kt.version = void 0;
Kt.version = "0.0.0-automated";
Object.defineProperty(Zt, "__esModule", { value: !0 });
Zt.DEFAULT_HEADERS = void 0;
const Ea = Kt;
Zt.DEFAULT_HEADERS = { "X-Client-Info": `postgrest-js/${Ea.version}` };
var rn = ce && ce.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(Ur, "__esModule", { value: !0 });
const Oa = rn(Wt), Ca = rn(_t), Aa = Zt;
let Ra = class sn {
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
  constructor(e, { headers: t = {}, schema: r, fetch: n } = {}) {
    this.url = e, this.headers = Object.assign(Object.assign({}, Aa.DEFAULT_HEADERS), t), this.schemaName = r, this.fetch = n;
  }
  /**
   * Perform a query on a table or a view.
   *
   * @param relation - The table or view name to query
   */
  from(e) {
    const t = new URL(`${this.url}/${e}`);
    return new Oa.default(t, {
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
    return new sn(this.url, {
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
  rpc(e, t = {}, { head: r = !1, get: n = !1, count: i } = {}) {
    let a;
    const o = new URL(`${this.url}/rpc/${e}`);
    let l;
    r || n ? (a = r ? "HEAD" : "GET", Object.entries(t).filter(([u, h]) => h !== void 0).map(([u, h]) => [u, Array.isArray(h) ? `{${h.join(",")}}` : `${h}`]).forEach(([u, h]) => {
      o.searchParams.append(u, h);
    })) : (a = "POST", l = t);
    const c = Object.assign({}, this.headers);
    return i && (c.Prefer = `count=${i}`), new Ca.default({
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
Ur.default = Ra;
var nt = ce && ce.__importDefault || function(s) {
  return s && s.__esModule ? s : { default: s };
};
Object.defineProperty(ie, "__esModule", { value: !0 });
ie.PostgrestError = ie.PostgrestBuilder = ie.PostgrestTransformBuilder = ie.PostgrestFilterBuilder = ie.PostgrestQueryBuilder = ie.PostgrestClient = void 0;
const nn = nt(Ur);
ie.PostgrestClient = nn.default;
const an = nt(Wt);
ie.PostgrestQueryBuilder = an.default;
const on = nt(_t);
ie.PostgrestFilterBuilder = on.default;
const ln = nt(qt);
ie.PostgrestTransformBuilder = ln.default;
const cn = nt(Vt);
ie.PostgrestBuilder = cn.default;
const un = nt(zt);
ie.PostgrestError = un.default;
var Pa = ie.default = {
  PostgrestClient: nn.default,
  PostgrestQueryBuilder: an.default,
  PostgrestFilterBuilder: on.default,
  PostgrestTransformBuilder: ln.default,
  PostgrestBuilder: cn.default,
  PostgrestError: un.default
};
const {
  PostgrestClient: $a,
  PostgrestQueryBuilder: Jl,
  PostgrestFilterBuilder: Hl,
  PostgrestTransformBuilder: Yl,
  PostgrestBuilder: Ql,
  PostgrestError: Xl
} = Pa;
class Ia {
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
      const r = parseInt(process.versions.node.split(".")[0]);
      if (r >= 22)
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
            error: `Node.js ${r} detected but native WebSocket not found.`,
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
          error: `Node.js ${r} detected without WebSocket support.`,
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
    const r = this.getWebSocketConstructor();
    return new r(e, t);
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
const Na = "2.15.0", La = `realtime-js/${Na}`, Ua = "1.0.0", xr = 1e4, Da = 1e3, Ma = 100;
var ht;
(function(s) {
  s[s.connecting = 0] = "connecting", s[s.open = 1] = "open", s[s.closing = 2] = "closing", s[s.closed = 3] = "closed";
})(ht || (ht = {}));
var Y;
(function(s) {
  s.closed = "closed", s.errored = "errored", s.joined = "joined", s.joining = "joining", s.leaving = "leaving";
})(Y || (Y = {}));
var pe;
(function(s) {
  s.close = "phx_close", s.error = "phx_error", s.join = "phx_join", s.reply = "phx_reply", s.leave = "phx_leave", s.access_token = "access_token";
})(pe || (pe = {}));
var Sr;
(function(s) {
  s.websocket = "websocket";
})(Sr || (Sr = {}));
var Le;
(function(s) {
  s.Connecting = "connecting", s.Open = "open", s.Closing = "closing", s.Closed = "closed";
})(Le || (Le = {}));
class Ba {
  constructor() {
    this.HEADER_LENGTH = 1;
  }
  decode(e, t) {
    return e.constructor === ArrayBuffer ? t(this._binaryDecode(e)) : t(typeof e == "string" ? JSON.parse(e) : {});
  }
  _binaryDecode(e) {
    const t = new DataView(e), r = new TextDecoder();
    return this._decodeBroadcast(e, t, r);
  }
  _decodeBroadcast(e, t, r) {
    const n = t.getUint8(1), i = t.getUint8(2);
    let a = this.HEADER_LENGTH + 2;
    const o = r.decode(e.slice(a, a + n));
    a = a + n;
    const l = r.decode(e.slice(a, a + i));
    a = a + i;
    const c = JSON.parse(r.decode(e.slice(a, e.byteLength)));
    return { ref: null, topic: o, event: l, payload: c };
  }
}
class dn {
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
var z;
(function(s) {
  s.abstime = "abstime", s.bool = "bool", s.date = "date", s.daterange = "daterange", s.float4 = "float4", s.float8 = "float8", s.int2 = "int2", s.int4 = "int4", s.int4range = "int4range", s.int8 = "int8", s.int8range = "int8range", s.json = "json", s.jsonb = "jsonb", s.money = "money", s.numeric = "numeric", s.oid = "oid", s.reltime = "reltime", s.text = "text", s.time = "time", s.timestamp = "timestamp", s.timestamptz = "timestamptz", s.timetz = "timetz", s.tsrange = "tsrange", s.tstzrange = "tstzrange";
})(z || (z = {}));
const As = (s, e, t = {}) => {
  var r;
  const n = (r = t.skipTypes) !== null && r !== void 0 ? r : [];
  return Object.keys(e).reduce((i, a) => (i[a] = Fa(a, s, e, n), i), {});
}, Fa = (s, e, t, r) => {
  const n = e.find((o) => o.name === s), i = n == null ? void 0 : n.type, a = t[s];
  return i && !r.includes(i) ? hn(i, a) : Tr(a);
}, hn = (s, e) => {
  if (s.charAt(0) === "_") {
    const t = s.slice(1, s.length);
    return za(e, t);
  }
  switch (s) {
    case z.bool:
      return Wa(e);
    case z.float4:
    case z.float8:
    case z.int2:
    case z.int4:
    case z.int8:
    case z.numeric:
    case z.oid:
      return qa(e);
    case z.json:
    case z.jsonb:
      return Va(e);
    case z.timestamp:
      return Za(e);
    // Format to be consistent with PostgREST
    case z.abstime:
    // To allow users to cast it based on Timezone
    case z.date:
    // To allow users to cast it based on Timezone
    case z.daterange:
    case z.int4range:
    case z.int8range:
    case z.money:
    case z.reltime:
    // To allow users to cast it based on Timezone
    case z.text:
    case z.time:
    // To allow users to cast it based on Timezone
    case z.timestamptz:
    // To allow users to cast it based on Timezone
    case z.timetz:
    // To allow users to cast it based on Timezone
    case z.tsrange:
    case z.tstzrange:
      return Tr(e);
    default:
      return Tr(e);
  }
}, Tr = (s) => s, Wa = (s) => {
  switch (s) {
    case "t":
      return !0;
    case "f":
      return !1;
    default:
      return s;
  }
}, qa = (s) => {
  if (typeof s == "string") {
    const e = parseFloat(s);
    if (!Number.isNaN(e))
      return e;
  }
  return s;
}, Va = (s) => {
  if (typeof s == "string")
    try {
      return JSON.parse(s);
    } catch (e) {
      return console.log(`JSON parse error: ${e}`), s;
    }
  return s;
}, za = (s, e) => {
  if (typeof s != "string")
    return s;
  const t = s.length - 1, r = s[t];
  if (s[0] === "{" && r === "}") {
    let i;
    const a = s.slice(1, t);
    try {
      i = JSON.parse("[" + a + "]");
    } catch {
      i = a ? a.split(",") : [];
    }
    return i.map((o) => hn(e, o));
  }
  return s;
}, Za = (s) => typeof s == "string" ? s.replace(" ", "T") : s, fn = (s) => {
  let e = s;
  return e = e.replace(/^ws/i, "http"), e = e.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, ""), e.replace(/\/+$/, "") + "/api/broadcast";
};
class ir {
  /**
   * Initializes the Push
   *
   * @param channel The Channel
   * @param event The event, for example `"phx_join"`
   * @param payload The payload, for example `{user_id: 123}`
   * @param timeout The push timeout in milliseconds
   */
  constructor(e, t, r = {}, n = xr) {
    this.channel = e, this.event = t, this.payload = r, this.timeout = n, this.sent = !1, this.timeoutTimer = void 0, this.ref = "", this.receivedResp = null, this.recHooks = [], this.refEvent = null;
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
    var r;
    return this._hasReceived(e) && t((r = this.receivedResp) === null || r === void 0 ? void 0 : r.response), this.recHooks.push({ status: e, callback: t }), this;
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
    this.recHooks.filter((r) => r.status === e).forEach((r) => r.callback(t));
  }
  _hasReceived(e) {
    return this.receivedResp && this.receivedResp.status === e;
  }
}
var Rs;
(function(s) {
  s.SYNC = "sync", s.JOIN = "join", s.LEAVE = "leave";
})(Rs || (Rs = {}));
class ft {
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
    const r = (t == null ? void 0 : t.events) || {
      state: "presence_state",
      diff: "presence_diff"
    };
    this.channel._on(r.state, {}, (n) => {
      const { onJoin: i, onLeave: a, onSync: o } = this.caller;
      this.joinRef = this.channel._joinRef(), this.state = ft.syncState(this.state, n, i, a), this.pendingDiffs.forEach((l) => {
        this.state = ft.syncDiff(this.state, l, i, a);
      }), this.pendingDiffs = [], o();
    }), this.channel._on(r.diff, {}, (n) => {
      const { onJoin: i, onLeave: a, onSync: o } = this.caller;
      this.inPendingSyncState() ? this.pendingDiffs.push(n) : (this.state = ft.syncDiff(this.state, n, i, a), o());
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
  static syncState(e, t, r, n) {
    const i = this.cloneDeep(e), a = this.transformState(t), o = {}, l = {};
    return this.map(i, (c, u) => {
      a[c] || (l[c] = u);
    }), this.map(a, (c, u) => {
      const h = i[c];
      if (h) {
        const p = u.map((T) => T.presence_ref), m = h.map((T) => T.presence_ref), v = u.filter((T) => m.indexOf(T.presence_ref) < 0), x = h.filter((T) => p.indexOf(T.presence_ref) < 0);
        v.length > 0 && (o[c] = v), x.length > 0 && (l[c] = x);
      } else
        o[c] = u;
    }), this.syncDiff(i, { joins: o, leaves: l }, r, n);
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
  static syncDiff(e, t, r, n) {
    const { joins: i, leaves: a } = {
      joins: this.transformState(t.joins),
      leaves: this.transformState(t.leaves)
    };
    return r || (r = () => {
    }), n || (n = () => {
    }), this.map(i, (o, l) => {
      var c;
      const u = (c = e[o]) !== null && c !== void 0 ? c : [];
      if (e[o] = this.cloneDeep(l), u.length > 0) {
        const h = e[o].map((m) => m.presence_ref), p = u.filter((m) => h.indexOf(m.presence_ref) < 0);
        e[o].unshift(...p);
      }
      r(o, u, l);
    }), this.map(a, (o, l) => {
      let c = e[o];
      if (!c)
        return;
      const u = l.map((h) => h.presence_ref);
      c = c.filter((h) => u.indexOf(h.presence_ref) < 0), e[o] = c, n(o, c, l), c.length === 0 && delete e[o];
    }), e;
  }
  /** @internal */
  static map(e, t) {
    return Object.getOwnPropertyNames(e).map((r) => t(r, e[r]));
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
    return e = this.cloneDeep(e), Object.getOwnPropertyNames(e).reduce((t, r) => {
      const n = e[r];
      return "metas" in n ? t[r] = n.metas.map((i) => (i.presence_ref = i.phx_ref, delete i.phx_ref, delete i.phx_ref_prev, i)) : t[r] = n, t;
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
var Ps;
(function(s) {
  s.ALL = "*", s.INSERT = "INSERT", s.UPDATE = "UPDATE", s.DELETE = "DELETE";
})(Ps || (Ps = {}));
var pt;
(function(s) {
  s.BROADCAST = "broadcast", s.PRESENCE = "presence", s.POSTGRES_CHANGES = "postgres_changes", s.SYSTEM = "system";
})(pt || (pt = {}));
var be;
(function(s) {
  s.SUBSCRIBED = "SUBSCRIBED", s.TIMED_OUT = "TIMED_OUT", s.CLOSED = "CLOSED", s.CHANNEL_ERROR = "CHANNEL_ERROR";
})(be || (be = {}));
class Dr {
  constructor(e, t = { config: {} }, r) {
    this.topic = e, this.params = t, this.socket = r, this.bindings = {}, this.state = Y.closed, this.joinedOnce = !1, this.pushBuffer = [], this.subTopic = e.replace(/^realtime:/i, ""), this.params.config = Object.assign({
      broadcast: { ack: !1, self: !1 },
      presence: { key: "", enabled: !1 },
      private: !1
    }, t.config), this.timeout = this.socket.timeout, this.joinPush = new ir(this, pe.join, this.params, this.timeout), this.rejoinTimer = new dn(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs), this.joinPush.receive("ok", () => {
      this.state = Y.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((n) => n.send()), this.pushBuffer = [];
    }), this._onClose(() => {
      this.rejoinTimer.reset(), this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`), this.state = Y.closed, this.socket._remove(this);
    }), this._onError((n) => {
      this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, n), this.state = Y.errored, this.rejoinTimer.scheduleTimeout());
    }), this.joinPush.receive("timeout", () => {
      this._isJoining() && (this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), this.state = Y.errored, this.rejoinTimer.scheduleTimeout());
    }), this.joinPush.receive("error", (n) => {
      this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, n), this.state = Y.errored, this.rejoinTimer.scheduleTimeout());
    }), this._on(pe.reply, {}, (n, i) => {
      this._trigger(this._replyEventName(i), n);
    }), this.presence = new ft(this), this.broadcastEndpointURL = fn(this.socket.endPoint), this.private = this.params.config.private || !1;
  }
  /** Subscribe registers your client with the server */
  subscribe(e, t = this.timeout) {
    var r, n;
    if (this.socket.isConnected() || this.socket.connect(), this.state == Y.closed) {
      const { config: { broadcast: i, presence: a, private: o } } = this.params, l = (n = (r = this.bindings.postgres_changes) === null || r === void 0 ? void 0 : r.map((p) => p.filter)) !== null && n !== void 0 ? n : [], c = !!this.bindings[pt.PRESENCE] && this.bindings[pt.PRESENCE].length > 0, u = {}, h = {
        broadcast: i,
        presence: Object.assign(Object.assign({}, a), { enabled: c }),
        postgres_changes: l,
        private: o
      };
      this.socket.accessTokenValue && (u.access_token = this.socket.accessTokenValue), this._onError((p) => e == null ? void 0 : e(be.CHANNEL_ERROR, p)), this._onClose(() => e == null ? void 0 : e(be.CLOSED)), this.updateJoinPayload(Object.assign({ config: h }, u)), this.joinedOnce = !0, this._rejoin(t), this.joinPush.receive("ok", async ({ postgres_changes: p }) => {
        var m;
        if (this.socket.setAuth(), p === void 0) {
          e == null || e(be.SUBSCRIBED);
          return;
        } else {
          const v = this.bindings.postgres_changes, x = (m = v == null ? void 0 : v.length) !== null && m !== void 0 ? m : 0, T = [];
          for (let j = 0; j < x; j++) {
            const E = v[j], { filter: { event: _, schema: R, table: K, filter: W } } = E, O = p && p[j];
            if (O && O.event === _ && O.schema === R && O.table === K && O.filter === W)
              T.push(Object.assign(Object.assign({}, E), { id: O.id }));
            else {
              this.unsubscribe(), this.state = Y.errored, e == null || e(be.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
              return;
            }
          }
          this.bindings.postgres_changes = T, e && e(be.SUBSCRIBED);
          return;
        }
      }).receive("error", (p) => {
        this.state = Y.errored, e == null || e(be.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(p).join(", ") || "error")));
      }).receive("timeout", () => {
        e == null || e(be.TIMED_OUT);
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
  on(e, t, r) {
    return this.state === Y.joined && e === pt.PRESENCE && (this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`), this.unsubscribe().then(() => this.subscribe())), this._on(e, t, r);
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
    var r, n;
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
        const c = await this._fetchWithTimeout(this.broadcastEndpointURL, l, (r = t.timeout) !== null && r !== void 0 ? r : this.timeout);
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
    this.state = Y.leaving;
    const t = () => {
      this.socket.log("channel", `leave ${this.topic}`), this._trigger(pe.close, "leave", this._joinRef());
    };
    this.joinPush.destroy();
    let r = null;
    return new Promise((n) => {
      r = new ir(this, pe.leave, {}, e), r.receive("ok", () => {
        t(), n("ok");
      }).receive("timeout", () => {
        t(), n("timed out");
      }).receive("error", () => {
        n("error");
      }), r.send(), this._canPush() || r.trigger("ok", {});
    }).finally(() => {
      r == null || r.destroy();
    });
  }
  /**
   * Teardown the channel.
   *
   * Destroys and stops related timers.
   */
  teardown() {
    this.pushBuffer.forEach((e) => e.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = Y.closed, this.bindings = {};
  }
  /** @internal */
  async _fetchWithTimeout(e, t, r) {
    const n = new AbortController(), i = setTimeout(() => n.abort(), r), a = await this.socket.fetch(e, Object.assign(Object.assign({}, t), { signal: n.signal }));
    return clearTimeout(i), a;
  }
  /** @internal */
  _push(e, t, r = this.timeout) {
    if (!this.joinedOnce)
      throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
    let n = new ir(this, e, t, r);
    return this._canPush() ? n.send() : this._addToPushBuffer(n), n;
  }
  /** @internal */
  _addToPushBuffer(e) {
    if (e.startTimeout(), this.pushBuffer.push(e), this.pushBuffer.length > Ma) {
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
  _onMessage(e, t, r) {
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
  _trigger(e, t, r) {
    var n, i;
    const a = e.toLocaleLowerCase(), { close: o, error: l, leave: c, join: u } = pe;
    if (r && [o, l, c, u].indexOf(a) >= 0 && r !== this._joinRef())
      return;
    let p = this._onMessage(a, t, r);
    if (t && !p)
      throw "channel onMessage callbacks must return the payload, modified or unmodified";
    ["insert", "update", "delete"].includes(a) ? (n = this.bindings.postgres_changes) === null || n === void 0 || n.filter((m) => {
      var v, x, T;
      return ((v = m.filter) === null || v === void 0 ? void 0 : v.event) === "*" || ((T = (x = m.filter) === null || x === void 0 ? void 0 : x.event) === null || T === void 0 ? void 0 : T.toLocaleLowerCase()) === a;
    }).map((m) => m.callback(p, r)) : (i = this.bindings[a]) === null || i === void 0 || i.filter((m) => {
      var v, x, T, j, E, _;
      if (["broadcast", "presence", "postgres_changes"].includes(a))
        if ("id" in m) {
          const R = m.id, K = (v = m.filter) === null || v === void 0 ? void 0 : v.event;
          return R && ((x = t.ids) === null || x === void 0 ? void 0 : x.includes(R)) && (K === "*" || (K == null ? void 0 : K.toLocaleLowerCase()) === ((T = t.data) === null || T === void 0 ? void 0 : T.type.toLocaleLowerCase()));
        } else {
          const R = (E = (j = m == null ? void 0 : m.filter) === null || j === void 0 ? void 0 : j.event) === null || E === void 0 ? void 0 : E.toLocaleLowerCase();
          return R === "*" || R === ((_ = t == null ? void 0 : t.event) === null || _ === void 0 ? void 0 : _.toLocaleLowerCase());
        }
      else
        return m.type.toLocaleLowerCase() === a;
    }).map((m) => {
      if (typeof p == "object" && "ids" in p) {
        const v = p.data, { schema: x, table: T, commit_timestamp: j, type: E, errors: _ } = v;
        p = Object.assign(Object.assign({}, {
          schema: x,
          table: T,
          commit_timestamp: j,
          eventType: E,
          new: {},
          old: {},
          errors: _
        }), this._getPayloadRecords(v));
      }
      m.callback(p, r);
    });
  }
  /** @internal */
  _isClosed() {
    return this.state === Y.closed;
  }
  /** @internal */
  _isJoined() {
    return this.state === Y.joined;
  }
  /** @internal */
  _isJoining() {
    return this.state === Y.joining;
  }
  /** @internal */
  _isLeaving() {
    return this.state === Y.leaving;
  }
  /** @internal */
  _replyEventName(e) {
    return `chan_reply_${e}`;
  }
  /** @internal */
  _on(e, t, r) {
    const n = e.toLocaleLowerCase(), i = {
      type: n,
      filter: t,
      callback: r
    };
    return this.bindings[n] ? this.bindings[n].push(i) : this.bindings[n] = [i], this;
  }
  /** @internal */
  _off(e, t) {
    const r = e.toLocaleLowerCase();
    return this.bindings[r] && (this.bindings[r] = this.bindings[r].filter((n) => {
      var i;
      return !(((i = n.type) === null || i === void 0 ? void 0 : i.toLocaleLowerCase()) === r && Dr.isEqual(n.filter, t));
    })), this;
  }
  /** @internal */
  static isEqual(e, t) {
    if (Object.keys(e).length !== Object.keys(t).length)
      return !1;
    for (const r in e)
      if (e[r] !== t[r])
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
    this._on(pe.close, {}, e);
  }
  /**
   * Registers a callback that will be executed when the channel encounteres an error.
   *
   * @internal
   */
  _onError(e) {
    this._on(pe.error, {}, (t) => e(t));
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
    this._isLeaving() || (this.socket._leaveOpenTopic(this.topic), this.state = Y.joining, this.joinPush.resend(e));
  }
  /** @internal */
  _getPayloadRecords(e) {
    const t = {
      new: {},
      old: {}
    };
    return (e.type === "INSERT" || e.type === "UPDATE") && (t.new = As(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (t.old = As(e.columns, e.old_record)), t;
  }
}
const $s = () => {
}, Tt = {
  HEARTBEAT_INTERVAL: 25e3,
  RECONNECT_DELAY: 10,
  HEARTBEAT_TIMEOUT_FALLBACK: 100
}, Ka = [1e3, 2e3, 5e3, 1e4], Ga = 1e4, Ja = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class Ha {
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
    var r;
    if (this.accessTokenValue = null, this.apiKey = null, this.channels = new Array(), this.endPoint = "", this.httpEndpoint = "", this.headers = {}, this.params = {}, this.timeout = xr, this.transport = null, this.heartbeatIntervalMs = Tt.HEARTBEAT_INTERVAL, this.heartbeatTimer = void 0, this.pendingHeartbeatRef = null, this.heartbeatCallback = $s, this.ref = 0, this.reconnectTimer = null, this.logger = $s, this.conn = null, this.sendBuffer = [], this.serializer = new Ba(), this.stateChangeCallbacks = {
      open: [],
      close: [],
      error: [],
      message: []
    }, this.accessToken = null, this._connectionState = "disconnected", this._wasManualDisconnect = !1, this._authPromise = null, this._resolveFetch = (n) => {
      let i;
      return n ? i = n : typeof fetch > "u" ? i = (...a) => Promise.resolve().then(() => st).then(({ default: o }) => o(...a)).catch((o) => {
        throw new Error(`Failed to load @supabase/node-fetch: ${o.message}. This is required for HTTP requests in Node.js environments without native fetch.`);
      }) : i = fetch, (...a) => i(...a);
    }, !(!((r = t == null ? void 0 : t.params) === null || r === void 0) && r.apikey))
      throw new Error("API key is required to connect to Realtime");
    this.apiKey = t.params.apikey, this.endPoint = `${e}/${Sr.websocket}`, this.httpEndpoint = fn(e), this._initializeOptions(t), this._setupReconnectionTimer(), this.fetch = this._resolveFetch(t == null ? void 0 : t.fetch);
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
          this.conn = Ia.createWebSocket(this.endpointURL());
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
    return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: Ua }));
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
        const r = setTimeout(() => {
          this._setConnectionState("disconnected");
        }, 100);
        this.conn.onclose = () => {
          clearTimeout(r), this._setConnectionState("disconnected");
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
  log(e, t, r) {
    this.logger(e, t, r);
  }
  /**
   * Returns the current state of the socket.
   */
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case ht.connecting:
        return Le.Connecting;
      case ht.open:
        return Le.Open;
      case ht.closing:
        return Le.Closing;
      default:
        return Le.Closed;
    }
  }
  /**
   * Returns `true` is the connection is open.
   */
  isConnected() {
    return this.connectionState() === Le.Open;
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
    const r = `realtime:${e}`, n = this.getChannels().find((i) => i.topic === r);
    if (n)
      return n;
    {
      const i = new Dr(`realtime:${e}`, t, this);
      return this.channels.push(i), i;
    }
  }
  /**
   * Push out a message if the socket is connected.
   *
   * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
   */
  push(e) {
    const { topic: t, event: r, payload: n, ref: i } = e, a = () => {
      this.encode(e, (o) => {
        var l;
        (l = this.conn) === null || l === void 0 || l.send(o);
      });
    };
    this.log("push", `${t} ${r} (${i})`, n), this.isConnected() ? a() : this.sendBuffer.push(a);
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
      this.pendingHeartbeatRef = null, this.log("transport", "heartbeat timeout. Attempting to re-establish connection"), this.heartbeatCallback("timeout"), this._wasManualDisconnect = !1, (e = this.conn) === null || e === void 0 || e.close(Da, "heartbeat timeout"), setTimeout(() => {
        var t;
        this.isConnected() || (t = this.reconnectTimer) === null || t === void 0 || t.scheduleTimeout();
      }, Tt.HEARTBEAT_TIMEOUT_FALLBACK);
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
    let t = this.channels.find((r) => r.topic === e && (r._isJoined() || r._isJoining()));
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
      const { topic: r, event: n, payload: i, ref: a } = t, o = a ? `(${a})` : "", l = i.status || "";
      this.log("receive", `${l} ${r} ${n} ${o}`.trim(), i), this.channels.filter((c) => c._isMember(r)).forEach((c) => c._trigger(n, i, a)), this._triggerStateCallbacks("message", t);
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
    this.channels.forEach((e) => e._trigger(pe.error));
  }
  /** @internal */
  _appendParams(e, t) {
    if (Object.keys(t).length === 0)
      return e;
    const r = e.match(/\?/) ? "&" : "?", n = new URLSearchParams(t);
    return `${e}${r}${n}`;
  }
  _workerObjectUrl(e) {
    let t;
    if (e)
      t = e;
    else {
      const r = new Blob([Ja], { type: "application/javascript" });
      t = URL.createObjectURL(r);
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
    e ? t = e : this.accessToken ? t = await this.accessToken() : t = this.accessTokenValue, this.accessTokenValue != t && (this.accessTokenValue = t, this.channels.forEach((r) => {
      const n = {
        access_token: t,
        version: La
      };
      t && r.updateJoinPayload(n), r.joinedOnce && r._isJoined() && r._push(pe.access_token, {
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
      this.stateChangeCallbacks[e].forEach((r) => {
        try {
          r(t);
        } catch (n) {
          this.log("error", `error in ${e} callback`, n);
        }
      });
    } catch (r) {
      this.log("error", `error triggering ${e} callbacks`, r);
    }
  }
  /**
   * Setup reconnection timer with proper configuration
   * @internal
   */
  _setupReconnectionTimer() {
    this.reconnectTimer = new dn(async () => {
      setTimeout(async () => {
        await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
      }, Tt.RECONNECT_DELAY);
    }, this.reconnectAfterMs);
  }
  /**
   * Initialize client options with defaults
   * @internal
   */
  _initializeOptions(e) {
    var t, r, n, i, a, o, l, c;
    if (this.transport = (t = e == null ? void 0 : e.transport) !== null && t !== void 0 ? t : null, this.timeout = (r = e == null ? void 0 : e.timeout) !== null && r !== void 0 ? r : xr, this.heartbeatIntervalMs = (n = e == null ? void 0 : e.heartbeatIntervalMs) !== null && n !== void 0 ? n : Tt.HEARTBEAT_INTERVAL, this.worker = (i = e == null ? void 0 : e.worker) !== null && i !== void 0 ? i : !1, this.accessToken = (a = e == null ? void 0 : e.accessToken) !== null && a !== void 0 ? a : null, e != null && e.params && (this.params = e.params), e != null && e.logger && (this.logger = e.logger), (e != null && e.logLevel || e != null && e.log_level) && (this.logLevel = e.logLevel || e.log_level, this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel })), this.reconnectAfterMs = (o = e == null ? void 0 : e.reconnectAfterMs) !== null && o !== void 0 ? o : (u) => Ka[u - 1] || Ga, this.encode = (l = e == null ? void 0 : e.encode) !== null && l !== void 0 ? l : (u, h) => h(JSON.stringify(u)), this.decode = (c = e == null ? void 0 : e.decode) !== null && c !== void 0 ? c : this.serializer.decode.bind(this.serializer), this.worker) {
      if (typeof window < "u" && !window.Worker)
        throw new Error("Web Worker is not supported");
      this.workerUrl = e == null ? void 0 : e.workerUrl;
    }
  }
}
class Mr extends Error {
  constructor(e) {
    super(e), this.__isStorageError = !0, this.name = "StorageError";
  }
}
function X(s) {
  return typeof s == "object" && s !== null && "__isStorageError" in s;
}
class Ya extends Mr {
  constructor(e, t, r) {
    super(e), this.name = "StorageApiError", this.status = t, this.statusCode = r;
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
class jr extends Mr {
  constructor(e, t) {
    super(e), this.name = "StorageUnknownError", this.originalError = t;
  }
}
var Qa = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
const pn = (s) => {
  let e;
  return s ? e = s : typeof fetch > "u" ? e = (...t) => Promise.resolve().then(() => st).then(({ default: r }) => r(...t)) : e = fetch, (...t) => e(...t);
}, Xa = () => Qa(void 0, void 0, void 0, function* () {
  return typeof Response > "u" ? (yield Promise.resolve().then(() => st)).Response : Response;
}), Er = (s) => {
  if (Array.isArray(s))
    return s.map((t) => Er(t));
  if (typeof s == "function" || s !== Object(s))
    return s;
  const e = {};
  return Object.entries(s).forEach(([t, r]) => {
    const n = t.replace(/([-_][a-z])/gi, (i) => i.toUpperCase().replace(/[-_]/g, ""));
    e[n] = Er(r);
  }), e;
}, eo = (s) => {
  if (typeof s != "object" || s === null)
    return !1;
  const e = Object.getPrototypeOf(s);
  return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(Symbol.toStringTag in s) && !(Symbol.iterator in s);
};
var De = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
const ar = (s) => s.msg || s.message || s.error_description || s.error || JSON.stringify(s), to = (s, e, t) => De(void 0, void 0, void 0, function* () {
  const r = yield Xa();
  s instanceof r && !(t != null && t.noResolveJson) ? s.json().then((n) => {
    const i = s.status || 500, a = (n == null ? void 0 : n.statusCode) || i + "";
    e(new Ya(ar(n), i, a));
  }).catch((n) => {
    e(new jr(ar(n), n));
  }) : e(new jr(ar(s), s));
}), ro = (s, e, t, r) => {
  const n = { method: s, headers: (e == null ? void 0 : e.headers) || {} };
  return s === "GET" || !r ? n : (eo(r) ? (n.headers = Object.assign({ "Content-Type": "application/json" }, e == null ? void 0 : e.headers), n.body = JSON.stringify(r)) : n.body = r, Object.assign(Object.assign({}, n), t));
};
function bt(s, e, t, r, n, i) {
  return De(this, void 0, void 0, function* () {
    return new Promise((a, o) => {
      s(t, ro(e, r, n, i)).then((l) => {
        if (!l.ok)
          throw l;
        return r != null && r.noResolveJson ? l : l.json();
      }).then((l) => a(l)).catch((l) => to(l, o, r));
    });
  });
}
function Mt(s, e, t, r) {
  return De(this, void 0, void 0, function* () {
    return bt(s, "GET", e, t, r);
  });
}
function we(s, e, t, r, n) {
  return De(this, void 0, void 0, function* () {
    return bt(s, "POST", e, r, n, t);
  });
}
function Or(s, e, t, r, n) {
  return De(this, void 0, void 0, function* () {
    return bt(s, "PUT", e, r, n, t);
  });
}
function so(s, e, t, r) {
  return De(this, void 0, void 0, function* () {
    return bt(s, "HEAD", e, Object.assign(Object.assign({}, t), { noResolveJson: !0 }), r);
  });
}
function gn(s, e, t, r, n) {
  return De(this, void 0, void 0, function* () {
    return bt(s, "DELETE", e, r, n, t);
  });
}
var ne = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
const no = {
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
class io {
  constructor(e, t = {}, r, n) {
    this.url = e, this.headers = t, this.bucketId = r, this.fetch = pn(n);
  }
  /**
   * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
   *
   * @param method HTTP method.
   * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param fileBody The body of the file to be stored in the bucket.
   */
  uploadOrUpdate(e, t, r, n) {
    return ne(this, void 0, void 0, function* () {
      try {
        let i;
        const a = Object.assign(Object.assign({}, Is), n);
        let o = Object.assign(Object.assign({}, this.headers), e === "POST" && { "x-upsert": String(a.upsert) });
        const l = a.metadata;
        typeof Blob < "u" && r instanceof Blob ? (i = new FormData(), i.append("cacheControl", a.cacheControl), l && i.append("metadata", this.encodeMetadata(l)), i.append("", r)) : typeof FormData < "u" && r instanceof FormData ? (i = r, i.append("cacheControl", a.cacheControl), l && i.append("metadata", this.encodeMetadata(l))) : (i = r, o["cache-control"] = `max-age=${a.cacheControl}`, o["content-type"] = a.contentType, l && (o["x-metadata"] = this.toBase64(this.encodeMetadata(l)))), n != null && n.headers && (o = Object.assign(Object.assign({}, o), n.headers));
        const c = this._removeEmptyFolders(t), u = this._getFinalPath(c), h = yield (e == "PUT" ? Or : we)(this.fetch, `${this.url}/object/${u}`, i, Object.assign({ headers: o }, a != null && a.duplex ? { duplex: a.duplex } : {}));
        return {
          data: { path: c, id: h.Id, fullPath: h.Key },
          error: null
        };
      } catch (i) {
        if (X(i))
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
  upload(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("POST", e, t, r);
    });
  }
  /**
   * Upload a file with a token generated from `createSignedUploadUrl`.
   * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param token The token generated from `createSignedUploadUrl`
   * @param fileBody The body of the file to be stored in the bucket.
   */
  uploadToSignedUrl(e, t, r, n) {
    return ne(this, void 0, void 0, function* () {
      const i = this._removeEmptyFolders(e), a = this._getFinalPath(i), o = new URL(this.url + `/object/upload/sign/${a}`);
      o.searchParams.set("token", t);
      try {
        let l;
        const c = Object.assign({ upsert: Is.upsert }, n), u = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(c.upsert) });
        typeof Blob < "u" && r instanceof Blob ? (l = new FormData(), l.append("cacheControl", c.cacheControl), l.append("", r)) : typeof FormData < "u" && r instanceof FormData ? (l = r, l.append("cacheControl", c.cacheControl)) : (l = r, u["cache-control"] = `max-age=${c.cacheControl}`, u["content-type"] = c.contentType);
        const h = yield Or(this.fetch, o.toString(), l, { headers: u });
        return {
          data: { path: i, fullPath: h.Key },
          error: null
        };
      } catch (l) {
        if (X(l))
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
    return ne(this, void 0, void 0, function* () {
      try {
        let r = this._getFinalPath(e);
        const n = Object.assign({}, this.headers);
        t != null && t.upsert && (n["x-upsert"] = "true");
        const i = yield we(this.fetch, `${this.url}/object/upload/sign/${r}`, {}, { headers: n }), a = new URL(this.url + i.url), o = a.searchParams.get("token");
        if (!o)
          throw new Mr("No token returned by API");
        return { data: { signedUrl: a.toString(), path: e, token: o }, error: null };
      } catch (r) {
        if (X(r))
          return { data: null, error: r };
        throw r;
      }
    });
  }
  /**
   * Replaces an existing file at the specified path with a new one.
   *
   * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
   * @param fileBody The body of the file to be stored in the bucket.
   */
  update(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("PUT", e, t, r);
    });
  }
  /**
   * Moves an existing file to a new path in the same bucket.
   *
   * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
   * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
   * @param options The destination options.
   */
  move(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      try {
        return { data: yield we(this.fetch, `${this.url}/object/move`, {
          bucketId: this.bucketId,
          sourceKey: e,
          destinationKey: t,
          destinationBucket: r == null ? void 0 : r.destinationBucket
        }, { headers: this.headers }), error: null };
      } catch (n) {
        if (X(n))
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
  copy(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      try {
        return { data: { path: (yield we(this.fetch, `${this.url}/object/copy`, {
          bucketId: this.bucketId,
          sourceKey: e,
          destinationKey: t,
          destinationBucket: r == null ? void 0 : r.destinationBucket
        }, { headers: this.headers })).Key }, error: null };
      } catch (n) {
        if (X(n))
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
  createSignedUrl(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      try {
        let n = this._getFinalPath(e), i = yield we(this.fetch, `${this.url}/object/sign/${n}`, Object.assign({ expiresIn: t }, r != null && r.transform ? { transform: r.transform } : {}), { headers: this.headers });
        const a = r != null && r.download ? `&download=${r.download === !0 ? "" : r.download}` : "";
        return i = { signedUrl: encodeURI(`${this.url}${i.signedURL}${a}`) }, { data: i, error: null };
      } catch (n) {
        if (X(n))
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
  createSignedUrls(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      try {
        const n = yield we(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn: t, paths: e }, { headers: this.headers }), i = r != null && r.download ? `&download=${r.download === !0 ? "" : r.download}` : "";
        return {
          data: n.map((a) => Object.assign(Object.assign({}, a), { signedUrl: a.signedURL ? encodeURI(`${this.url}${a.signedURL}${i}`) : null })),
          error: null
        };
      } catch (n) {
        if (X(n))
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
    return ne(this, void 0, void 0, function* () {
      const n = typeof (t == null ? void 0 : t.transform) < "u" ? "render/image/authenticated" : "object", i = this.transformOptsToQueryString((t == null ? void 0 : t.transform) || {}), a = i ? `?${i}` : "";
      try {
        const o = this._getFinalPath(e);
        return { data: yield (yield Mt(this.fetch, `${this.url}/${n}/${o}${a}`, {
          headers: this.headers,
          noResolveJson: !0
        })).blob(), error: null };
      } catch (o) {
        if (X(o))
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
    return ne(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e);
      try {
        const r = yield Mt(this.fetch, `${this.url}/object/info/${t}`, {
          headers: this.headers
        });
        return { data: Er(r), error: null };
      } catch (r) {
        if (X(r))
          return { data: null, error: r };
        throw r;
      }
    });
  }
  /**
   * Checks the existence of a file.
   * @param path
   */
  exists(e) {
    return ne(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e);
      try {
        return yield so(this.fetch, `${this.url}/object/${t}`, {
          headers: this.headers
        }), { data: !0, error: null };
      } catch (r) {
        if (X(r) && r instanceof jr) {
          const n = r.originalError;
          if ([400, 404].includes(n == null ? void 0 : n.status))
            return { data: !1, error: r };
        }
        throw r;
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
    const r = this._getFinalPath(e), n = [], i = t != null && t.download ? `download=${t.download === !0 ? "" : t.download}` : "";
    i !== "" && n.push(i);
    const o = typeof (t == null ? void 0 : t.transform) < "u" ? "render/image" : "object", l = this.transformOptsToQueryString((t == null ? void 0 : t.transform) || {});
    l !== "" && n.push(l);
    let c = n.join("&");
    return c !== "" && (c = `?${c}`), {
      data: { publicUrl: encodeURI(`${this.url}/${o}/public/${r}${c}`) }
    };
  }
  /**
   * Deletes files within the same bucket
   *
   * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
   */
  remove(e) {
    return ne(this, void 0, void 0, function* () {
      try {
        return { data: yield gn(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: e }, { headers: this.headers }), error: null };
      } catch (t) {
        if (X(t))
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
  list(e, t, r) {
    return ne(this, void 0, void 0, function* () {
      try {
        const n = Object.assign(Object.assign(Object.assign({}, no), t), { prefix: e || "" });
        return { data: yield we(this.fetch, `${this.url}/object/list/${this.bucketId}`, n, { headers: this.headers }, r), error: null };
      } catch (n) {
        if (X(n))
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
const ao = "2.10.4", oo = { "X-Client-Info": `storage-js/${ao}` };
var We = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
class lo {
  constructor(e, t = {}, r, n) {
    const i = new URL(e);
    n != null && n.useNewHostname && /supabase\.(co|in|red)$/.test(i.hostname) && !i.hostname.includes("storage.supabase.") && (i.hostname = i.hostname.replace("supabase.", "storage.supabase.")), this.url = i.href, this.headers = Object.assign(Object.assign({}, oo), t), this.fetch = pn(r);
  }
  /**
   * Retrieves the details of all Storage buckets within an existing project.
   */
  listBuckets() {
    return We(this, void 0, void 0, function* () {
      try {
        return { data: yield Mt(this.fetch, `${this.url}/bucket`, { headers: this.headers }), error: null };
      } catch (e) {
        if (X(e))
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
    return We(this, void 0, void 0, function* () {
      try {
        return { data: yield Mt(this.fetch, `${this.url}/bucket/${e}`, { headers: this.headers }), error: null };
      } catch (t) {
        if (X(t))
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
    return We(this, void 0, void 0, function* () {
      try {
        return { data: yield we(this.fetch, `${this.url}/bucket`, {
          id: e,
          name: e,
          type: t.type,
          public: t.public,
          file_size_limit: t.fileSizeLimit,
          allowed_mime_types: t.allowedMimeTypes
        }, { headers: this.headers }), error: null };
      } catch (r) {
        if (X(r))
          return { data: null, error: r };
        throw r;
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
    return We(this, void 0, void 0, function* () {
      try {
        return { data: yield Or(this.fetch, `${this.url}/bucket/${e}`, {
          id: e,
          name: e,
          public: t.public,
          file_size_limit: t.fileSizeLimit,
          allowed_mime_types: t.allowedMimeTypes
        }, { headers: this.headers }), error: null };
      } catch (r) {
        if (X(r))
          return { data: null, error: r };
        throw r;
      }
    });
  }
  /**
   * Removes all objects inside a single bucket.
   *
   * @param id The unique identifier of the bucket you would like to empty.
   */
  emptyBucket(e) {
    return We(this, void 0, void 0, function* () {
      try {
        return { data: yield we(this.fetch, `${this.url}/bucket/${e}/empty`, {}, { headers: this.headers }), error: null };
      } catch (t) {
        if (X(t))
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
    return We(this, void 0, void 0, function* () {
      try {
        return { data: yield gn(this.fetch, `${this.url}/bucket/${e}`, {}, { headers: this.headers }), error: null };
      } catch (t) {
        if (X(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
}
class co extends lo {
  constructor(e, t = {}, r, n) {
    super(e, t, r, n);
  }
  /**
   * Perform file operation in a bucket.
   *
   * @param id The bucket id to operate on.
   */
  from(e) {
    return new io(this.url, this.headers, e, this.fetch);
  }
}
const uo = "2.54.0";
let dt = "";
typeof Deno < "u" ? dt = "deno" : typeof document < "u" ? dt = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? dt = "react-native" : dt = "node";
const ho = { "X-Client-Info": `supabase-js-${dt}/${uo}` }, fo = {
  headers: ho
}, po = {
  schema: "public"
}, go = {
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  flowType: "implicit"
}, vo = {};
var yo = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
const mo = (s) => {
  let e;
  return s ? e = s : typeof fetch > "u" ? e = Xs : e = fetch, (...t) => e(...t);
}, _o = () => typeof Headers > "u" ? en : Headers, bo = (s, e, t) => {
  const r = mo(t), n = _o();
  return (i, a) => yo(void 0, void 0, void 0, function* () {
    var o;
    const l = (o = yield e()) !== null && o !== void 0 ? o : s;
    let c = new n(a == null ? void 0 : a.headers);
    return c.has("apikey") || c.set("apikey", s), c.has("Authorization") || c.set("Authorization", `Bearer ${l}`), r(i, Object.assign(Object.assign({}, a), { headers: c }));
  });
};
var wo = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
function ko(s) {
  return s.endsWith("/") ? s : s + "/";
}
function xo(s, e) {
  var t, r;
  const { db: n, auth: i, realtime: a, global: o } = s, { db: l, auth: c, realtime: u, global: h } = e, p = {
    db: Object.assign(Object.assign({}, l), n),
    auth: Object.assign(Object.assign({}, c), i),
    realtime: Object.assign(Object.assign({}, u), a),
    storage: {},
    global: Object.assign(Object.assign(Object.assign({}, h), o), { headers: Object.assign(Object.assign({}, (t = h == null ? void 0 : h.headers) !== null && t !== void 0 ? t : {}), (r = o == null ? void 0 : o.headers) !== null && r !== void 0 ? r : {}) }),
    accessToken: () => wo(this, void 0, void 0, function* () {
      return "";
    })
  };
  return s.accessToken ? p.accessToken = s.accessToken : delete p.accessToken, p;
}
const vn = "2.71.1", Je = 30 * 1e3, Cr = 3, or = Cr * Je, So = "http://localhost:9999", To = "supabase.auth.token", jo = { "X-Client-Info": `gotrue-js/${vn}` }, Ar = "X-Supabase-Api-Version", yn = {
  "2024-01-01": {
    timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
    name: "2024-01-01"
  }
}, Eo = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, Oo = 600 * 1e3;
class Br extends Error {
  constructor(e, t, r) {
    super(e), this.__isAuthError = !0, this.name = "AuthError", this.status = t, this.code = r;
  }
}
function $(s) {
  return typeof s == "object" && s !== null && "__isAuthError" in s;
}
class Co extends Br {
  constructor(e, t, r) {
    super(e, t, r), this.name = "AuthApiError", this.status = t, this.code = r;
  }
}
function Ao(s) {
  return $(s) && s.name === "AuthApiError";
}
class mn extends Br {
  constructor(e, t) {
    super(e), this.name = "AuthUnknownError", this.originalError = t;
  }
}
class Re extends Br {
  constructor(e, t, r, n) {
    super(e, r, n), this.name = t, this.status = r;
  }
}
class je extends Re {
  constructor() {
    super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
  }
}
function Ro(s) {
  return $(s) && s.name === "AuthSessionMissingError";
}
class jt extends Re {
  constructor() {
    super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
  }
}
class Et extends Re {
  constructor(e) {
    super(e, "AuthInvalidCredentialsError", 400, void 0);
  }
}
class Ot extends Re {
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
function Po(s) {
  return $(s) && s.name === "AuthImplicitGrantRedirectError";
}
class Ns extends Re {
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
class Rr extends Re {
  constructor(e, t) {
    super(e, "AuthRetryableFetchError", t, void 0);
  }
}
function lr(s) {
  return $(s) && s.name === "AuthRetryableFetchError";
}
class Ls extends Re {
  constructor(e, t, r) {
    super(e, "AuthWeakPasswordError", t, "weak_password"), this.reasons = r;
  }
}
class Pr extends Re {
  constructor(e) {
    super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
  }
}
const Bt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), Us = ` 	
\r=`.split(""), $o = (() => {
  const s = new Array(128);
  for (let e = 0; e < s.length; e += 1)
    s[e] = -1;
  for (let e = 0; e < Us.length; e += 1)
    s[Us[e].charCodeAt(0)] = -2;
  for (let e = 0; e < Bt.length; e += 1)
    s[Bt[e].charCodeAt(0)] = e;
  return s;
})();
function Ds(s, e, t) {
  if (s !== null)
    for (e.queue = e.queue << 8 | s, e.queuedBits += 8; e.queuedBits >= 6; ) {
      const r = e.queue >> e.queuedBits - 6 & 63;
      t(Bt[r]), e.queuedBits -= 6;
    }
  else if (e.queuedBits > 0)
    for (e.queue = e.queue << 6 - e.queuedBits, e.queuedBits = 6; e.queuedBits >= 6; ) {
      const r = e.queue >> e.queuedBits - 6 & 63;
      t(Bt[r]), e.queuedBits -= 6;
    }
}
function _n(s, e, t) {
  const r = $o[s];
  if (r > -1)
    for (e.queue = e.queue << 6 | r, e.queuedBits += 6; e.queuedBits >= 8; )
      t(e.queue >> e.queuedBits - 8 & 255), e.queuedBits -= 8;
  else {
    if (r === -2)
      return;
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(s)}"`);
  }
}
function Ms(s) {
  const e = [], t = (a) => {
    e.push(String.fromCodePoint(a));
  }, r = {
    utf8seq: 0,
    codepoint: 0
  }, n = { queue: 0, queuedBits: 0 }, i = (a) => {
    Lo(a, r, t);
  };
  for (let a = 0; a < s.length; a += 1)
    _n(s.charCodeAt(a), n, i);
  return e.join("");
}
function Io(s, e) {
  if (s <= 127) {
    e(s);
    return;
  } else if (s <= 2047) {
    e(192 | s >> 6), e(128 | s & 63);
    return;
  } else if (s <= 65535) {
    e(224 | s >> 12), e(128 | s >> 6 & 63), e(128 | s & 63);
    return;
  } else if (s <= 1114111) {
    e(240 | s >> 18), e(128 | s >> 12 & 63), e(128 | s >> 6 & 63), e(128 | s & 63);
    return;
  }
  throw new Error(`Unrecognized Unicode codepoint: ${s.toString(16)}`);
}
function No(s, e) {
  for (let t = 0; t < s.length; t += 1) {
    let r = s.charCodeAt(t);
    if (r > 55295 && r <= 56319) {
      const n = (r - 55296) * 1024 & 65535;
      r = (s.charCodeAt(t + 1) - 56320 & 65535 | n) + 65536, t += 1;
    }
    Io(r, e);
  }
}
function Lo(s, e, t) {
  if (e.utf8seq === 0) {
    if (s <= 127) {
      t(s);
      return;
    }
    for (let r = 1; r < 6; r += 1)
      if ((s >> 7 - r & 1) === 0) {
        e.utf8seq = r;
        break;
      }
    if (e.utf8seq === 2)
      e.codepoint = s & 31;
    else if (e.utf8seq === 3)
      e.codepoint = s & 15;
    else if (e.utf8seq === 4)
      e.codepoint = s & 7;
    else
      throw new Error("Invalid UTF-8 sequence");
    e.utf8seq -= 1;
  } else if (e.utf8seq > 0) {
    if (s <= 127)
      throw new Error("Invalid UTF-8 sequence");
    e.codepoint = e.codepoint << 6 | s & 63, e.utf8seq -= 1, e.utf8seq === 0 && t(e.codepoint);
  }
}
function Uo(s) {
  const e = [], t = { queue: 0, queuedBits: 0 }, r = (n) => {
    e.push(n);
  };
  for (let n = 0; n < s.length; n += 1)
    _n(s.charCodeAt(n), t, r);
  return new Uint8Array(e);
}
function Do(s) {
  const e = [];
  return No(s, (t) => e.push(t)), new Uint8Array(e);
}
function Mo(s) {
  const e = [], t = { queue: 0, queuedBits: 0 }, r = (n) => {
    e.push(n);
  };
  return s.forEach((n) => Ds(n, t, r)), Ds(null, t, r), e.join("");
}
function Bo(s) {
  return Math.round(Date.now() / 1e3) + s;
}
function Fo() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(s) {
    const e = Math.random() * 16 | 0;
    return (s == "x" ? e : e & 3 | 8).toString(16);
  });
}
const fe = () => typeof window < "u" && typeof document < "u", $e = {
  tested: !1,
  writable: !1
}, bn = () => {
  if (!fe())
    return !1;
  try {
    if (typeof globalThis.localStorage != "object")
      return !1;
  } catch {
    return !1;
  }
  if ($e.tested)
    return $e.writable;
  const s = `lswt-${Math.random()}${Math.random()}`;
  try {
    globalThis.localStorage.setItem(s, s), globalThis.localStorage.removeItem(s), $e.tested = !0, $e.writable = !0;
  } catch {
    $e.tested = !0, $e.writable = !1;
  }
  return $e.writable;
};
function Wo(s) {
  const e = {}, t = new URL(s);
  if (t.hash && t.hash[0] === "#")
    try {
      new URLSearchParams(t.hash.substring(1)).forEach((n, i) => {
        e[i] = n;
      });
    } catch {
    }
  return t.searchParams.forEach((r, n) => {
    e[n] = r;
  }), e;
}
const wn = (s) => {
  let e;
  return s ? e = s : typeof fetch > "u" ? e = (...t) => Promise.resolve().then(() => st).then(({ default: r }) => r(...t)) : e = fetch, (...t) => e(...t);
}, qo = (s) => typeof s == "object" && s !== null && "status" in s && "ok" in s && "json" in s && typeof s.json == "function", He = async (s, e, t) => {
  await s.setItem(e, JSON.stringify(t));
}, Ie = async (s, e) => {
  const t = await s.getItem(e);
  if (!t)
    return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}, Se = async (s, e) => {
  await s.removeItem(e);
};
class Gt {
  constructor() {
    this.promise = new Gt.promiseConstructor((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
Gt.promiseConstructor = Promise;
function cr(s) {
  const e = s.split(".");
  if (e.length !== 3)
    throw new Pr("Invalid JWT structure");
  for (let r = 0; r < e.length; r++)
    if (!Eo.test(e[r]))
      throw new Pr("JWT not in base64url format");
  return {
    // using base64url lib
    header: JSON.parse(Ms(e[0])),
    payload: JSON.parse(Ms(e[1])),
    signature: Uo(e[2]),
    raw: {
      header: e[0],
      payload: e[1]
    }
  };
}
async function Vo(s) {
  return await new Promise((e) => {
    setTimeout(() => e(null), s);
  });
}
function zo(s, e) {
  return new Promise((r, n) => {
    (async () => {
      for (let i = 0; i < 1 / 0; i++)
        try {
          const a = await s(i);
          if (!e(i, null, a)) {
            r(a);
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
function Zo(s) {
  return ("0" + s.toString(16)).substr(-2);
}
function Ko() {
  const e = new Uint32Array(56);
  if (typeof crypto > "u") {
    const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", r = t.length;
    let n = "";
    for (let i = 0; i < 56; i++)
      n += t.charAt(Math.floor(Math.random() * r));
    return n;
  }
  return crypto.getRandomValues(e), Array.from(e, Zo).join("");
}
async function Go(s) {
  const t = new TextEncoder().encode(s), r = await crypto.subtle.digest("SHA-256", t), n = new Uint8Array(r);
  return Array.from(n).map((i) => String.fromCharCode(i)).join("");
}
async function Jo(s) {
  if (!(typeof crypto < "u" && typeof crypto.subtle < "u" && typeof TextEncoder < "u"))
    return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), s;
  const t = await Go(s);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function qe(s, e, t = !1) {
  const r = Ko();
  let n = r;
  t && (n += "/PASSWORD_RECOVERY"), await He(s, `${e}-code-verifier`, n);
  const i = await Jo(r);
  return [i, r === i ? "plain" : "s256"];
}
const Ho = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function Yo(s) {
  const e = s.headers.get(Ar);
  if (!e || !e.match(Ho))
    return null;
  try {
    return /* @__PURE__ */ new Date(`${e}T00:00:00.0Z`);
  } catch {
    return null;
  }
}
function Qo(s) {
  if (!s)
    throw new Error("Missing exp claim");
  const e = Math.floor(Date.now() / 1e3);
  if (s <= e)
    throw new Error("JWT has expired");
}
function Xo(s) {
  switch (s) {
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
const el = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function Ve(s) {
  if (!el.test(s))
    throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
}
function ur() {
  const s = {};
  return new Proxy(s, {
    get: (e, t) => {
      if (t === "__isUserNotAvailableProxy")
        return !0;
      if (typeof t == "symbol") {
        const r = t.toString();
        if (r === "Symbol(Symbol.toPrimitive)" || r === "Symbol(Symbol.toStringTag)" || r === "Symbol(util.inspect.custom)")
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
function Bs(s) {
  return JSON.parse(JSON.stringify(s));
}
var tl = function(s, e) {
  var t = {};
  for (var r in s) Object.prototype.hasOwnProperty.call(s, r) && e.indexOf(r) < 0 && (t[r] = s[r]);
  if (s != null && typeof Object.getOwnPropertySymbols == "function")
    for (var n = 0, r = Object.getOwnPropertySymbols(s); n < r.length; n++)
      e.indexOf(r[n]) < 0 && Object.prototype.propertyIsEnumerable.call(s, r[n]) && (t[r[n]] = s[r[n]]);
  return t;
};
const Ne = (s) => s.msg || s.message || s.error_description || s.error || JSON.stringify(s), rl = [502, 503, 504];
async function Fs(s) {
  var e;
  if (!qo(s))
    throw new Rr(Ne(s), 0);
  if (rl.includes(s.status))
    throw new Rr(Ne(s), s.status);
  let t;
  try {
    t = await s.json();
  } catch (i) {
    throw new mn(Ne(i), i);
  }
  let r;
  const n = Yo(s);
  if (n && n.getTime() >= yn["2024-01-01"].timestamp && typeof t == "object" && t && typeof t.code == "string" ? r = t.code : typeof t == "object" && t && typeof t.error_code == "string" && (r = t.error_code), r) {
    if (r === "weak_password")
      throw new Ls(Ne(t), s.status, ((e = t.weak_password) === null || e === void 0 ? void 0 : e.reasons) || []);
    if (r === "session_not_found")
      throw new je();
  } else if (typeof t == "object" && t && typeof t.weak_password == "object" && t.weak_password && Array.isArray(t.weak_password.reasons) && t.weak_password.reasons.length && t.weak_password.reasons.reduce((i, a) => i && typeof a == "string", !0))
    throw new Ls(Ne(t), s.status, t.weak_password.reasons);
  throw new Co(Ne(t), s.status || 500, r);
}
const sl = (s, e, t, r) => {
  const n = { method: s, headers: (e == null ? void 0 : e.headers) || {} };
  return s === "GET" ? n : (n.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, e == null ? void 0 : e.headers), n.body = JSON.stringify(r), Object.assign(Object.assign({}, n), t));
};
async function L(s, e, t, r) {
  var n;
  const i = Object.assign({}, r == null ? void 0 : r.headers);
  i[Ar] || (i[Ar] = yn["2024-01-01"].name), r != null && r.jwt && (i.Authorization = `Bearer ${r.jwt}`);
  const a = (n = r == null ? void 0 : r.query) !== null && n !== void 0 ? n : {};
  r != null && r.redirectTo && (a.redirect_to = r.redirectTo);
  const o = Object.keys(a).length ? "?" + new URLSearchParams(a).toString() : "", l = await nl(s, e, t + o, {
    headers: i,
    noResolveJson: r == null ? void 0 : r.noResolveJson
  }, {}, r == null ? void 0 : r.body);
  return r != null && r.xform ? r == null ? void 0 : r.xform(l) : { data: Object.assign({}, l), error: null };
}
async function nl(s, e, t, r, n, i) {
  const a = sl(e, r, n, i);
  let o;
  try {
    o = await s(t, Object.assign({}, a));
  } catch (l) {
    throw console.error(l), new Rr(Ne(l), 0);
  }
  if (o.ok || await Fs(o), r != null && r.noResolveJson)
    return o;
  try {
    return await o.json();
  } catch (l) {
    await Fs(l);
  }
}
function _e(s) {
  var e;
  let t = null;
  ll(s) && (t = Object.assign({}, s), s.expires_at || (t.expires_at = Bo(s.expires_in)));
  const r = (e = s.user) !== null && e !== void 0 ? e : s;
  return { data: { session: t, user: r }, error: null };
}
function Ws(s) {
  const e = _e(s);
  return !e.error && s.weak_password && typeof s.weak_password == "object" && Array.isArray(s.weak_password.reasons) && s.weak_password.reasons.length && s.weak_password.message && typeof s.weak_password.message == "string" && s.weak_password.reasons.reduce((t, r) => t && typeof r == "string", !0) && (e.data.weak_password = s.weak_password), e;
}
function Oe(s) {
  var e;
  return { data: { user: (e = s.user) !== null && e !== void 0 ? e : s }, error: null };
}
function il(s) {
  return { data: s, error: null };
}
function al(s) {
  const { action_link: e, email_otp: t, hashed_token: r, redirect_to: n, verification_type: i } = s, a = tl(s, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]), o = {
    action_link: e,
    email_otp: t,
    hashed_token: r,
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
function ol(s) {
  return s;
}
function ll(s) {
  return s.access_token && s.refresh_token && s.expires_in;
}
const dr = ["global", "local", "others"];
var cl = function(s, e) {
  var t = {};
  for (var r in s) Object.prototype.hasOwnProperty.call(s, r) && e.indexOf(r) < 0 && (t[r] = s[r]);
  if (s != null && typeof Object.getOwnPropertySymbols == "function")
    for (var n = 0, r = Object.getOwnPropertySymbols(s); n < r.length; n++)
      e.indexOf(r[n]) < 0 && Object.prototype.propertyIsEnumerable.call(s, r[n]) && (t[r[n]] = s[r[n]]);
  return t;
};
class ul {
  constructor({ url: e = "", headers: t = {}, fetch: r }) {
    this.url = e, this.headers = t, this.fetch = wn(r), this.mfa = {
      listFactors: this._listFactors.bind(this),
      deleteFactor: this._deleteFactor.bind(this)
    };
  }
  /**
   * Removes a logged-in session.
   * @param jwt A valid, logged-in JWT.
   * @param scope The logout sope.
   */
  async signOut(e, t = dr[0]) {
    if (dr.indexOf(t) < 0)
      throw new Error(`@supabase/auth-js: Parameter scope must be one of ${dr.join(", ")}`);
    try {
      return await L(this.fetch, "POST", `${this.url}/logout?scope=${t}`, {
        headers: this.headers,
        jwt: e,
        noResolveJson: !0
      }), { data: null, error: null };
    } catch (r) {
      if ($(r))
        return { data: null, error: r };
      throw r;
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
        xform: Oe
      });
    } catch (r) {
      if ($(r))
        return { data: { user: null }, error: r };
      throw r;
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
      const { options: t } = e, r = cl(e, ["options"]), n = Object.assign(Object.assign({}, r), t);
      return "newEmail" in r && (n.new_email = r == null ? void 0 : r.newEmail, delete n.newEmail), await L(this.fetch, "POST", `${this.url}/admin/generate_link`, {
        body: n,
        headers: this.headers,
        xform: al,
        redirectTo: t == null ? void 0 : t.redirectTo
      });
    } catch (t) {
      if ($(t))
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
        xform: Oe
      });
    } catch (t) {
      if ($(t))
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
    var t, r, n, i, a, o, l;
    try {
      const c = { nextPage: null, lastPage: 0, total: 0 }, u = await L(this.fetch, "GET", `${this.url}/admin/users`, {
        headers: this.headers,
        noResolveJson: !0,
        query: {
          page: (r = (t = e == null ? void 0 : e.page) === null || t === void 0 ? void 0 : t.toString()) !== null && r !== void 0 ? r : "",
          per_page: (i = (n = e == null ? void 0 : e.perPage) === null || n === void 0 ? void 0 : n.toString()) !== null && i !== void 0 ? i : ""
        },
        xform: ol
      });
      if (u.error)
        throw u.error;
      const h = await u.json(), p = (a = u.headers.get("x-total-count")) !== null && a !== void 0 ? a : 0, m = (l = (o = u.headers.get("link")) === null || o === void 0 ? void 0 : o.split(",")) !== null && l !== void 0 ? l : [];
      return m.length > 0 && (m.forEach((v) => {
        const x = parseInt(v.split(";")[0].split("=")[1].substring(0, 1)), T = JSON.parse(v.split(";")[1].split("=")[1]);
        c[`${T}Page`] = x;
      }), c.total = parseInt(p)), { data: Object.assign(Object.assign({}, h), c), error: null };
    } catch (c) {
      if ($(c))
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
    Ve(e);
    try {
      return await L(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        xform: Oe
      });
    } catch (t) {
      if ($(t))
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
    Ve(e);
    try {
      return await L(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
        body: t,
        headers: this.headers,
        xform: Oe
      });
    } catch (r) {
      if ($(r))
        return { data: { user: null }, error: r };
      throw r;
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
    Ve(e);
    try {
      return await L(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        body: {
          should_soft_delete: t
        },
        xform: Oe
      });
    } catch (r) {
      if ($(r))
        return { data: { user: null }, error: r };
      throw r;
    }
  }
  async _listFactors(e) {
    Ve(e.userId);
    try {
      const { data: t, error: r } = await L(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, {
        headers: this.headers,
        xform: (n) => ({ data: { factors: n }, error: null })
      });
      return { data: t, error: r };
    } catch (t) {
      if ($(t))
        return { data: null, error: t };
      throw t;
    }
  }
  async _deleteFactor(e) {
    Ve(e.userId), Ve(e.id);
    try {
      return { data: await L(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, {
        headers: this.headers
      }), error: null };
    } catch (t) {
      if ($(t))
        return { data: null, error: t };
      throw t;
    }
  }
}
function qs(s = {}) {
  return {
    getItem: (e) => s[e] || null,
    setItem: (e, t) => {
      s[e] = t;
    },
    removeItem: (e) => {
      delete s[e];
    }
  };
}
function dl() {
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
const ze = {
  /**
   * @experimental
   */
  debug: !!(globalThis && bn() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
};
class kn extends Error {
  constructor(e) {
    super(e), this.isAcquireTimeout = !0;
  }
}
class hl extends kn {
}
async function fl(s, e, t) {
  ze.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", s, e);
  const r = new globalThis.AbortController();
  return e > 0 && setTimeout(() => {
    r.abort(), ze.debug && console.log("@supabase/gotrue-js: navigatorLock acquire timed out", s);
  }, e), await Promise.resolve().then(() => globalThis.navigator.locks.request(s, e === 0 ? {
    mode: "exclusive",
    ifAvailable: !0
  } : {
    mode: "exclusive",
    signal: r.signal
  }, async (n) => {
    if (n) {
      ze.debug && console.log("@supabase/gotrue-js: navigatorLock: acquired", s, n.name);
      try {
        return await t();
      } finally {
        ze.debug && console.log("@supabase/gotrue-js: navigatorLock: released", s, n.name);
      }
    } else {
      if (e === 0)
        throw ze.debug && console.log("@supabase/gotrue-js: navigatorLock: not immediately available", s), new hl(`Acquiring an exclusive Navigator LockManager lock "${s}" immediately failed`);
      if (ze.debug)
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
dl();
const pl = {
  url: So,
  storageKey: To,
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  headers: jo,
  flowType: "implicit",
  debug: !1,
  hasCustomAuthorizationHeader: !1
};
async function Vs(s, e, t) {
  return await t();
}
const Ze = {};
class mt {
  /**
   * Create a new client for use in the browser.
   */
  constructor(e) {
    var t, r;
    this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = !0, this.hasCustomAuthorizationHeader = !1, this.suppressGetSessionWarning = !1, this.lockAcquired = !1, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log, this.instanceID = mt.nextInstanceID, mt.nextInstanceID += 1, this.instanceID > 0 && fe() && console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
    const n = Object.assign(Object.assign({}, pl), e);
    if (this.logDebugMessages = !!n.debug, typeof n.debug == "function" && (this.logger = n.debug), this.persistSession = n.persistSession, this.storageKey = n.storageKey, this.autoRefreshToken = n.autoRefreshToken, this.admin = new ul({
      url: n.url,
      headers: n.headers,
      fetch: n.fetch
    }), this.url = n.url, this.headers = n.headers, this.fetch = wn(n.fetch), this.lock = n.lock || Vs, this.detectSessionInUrl = n.detectSessionInUrl, this.flowType = n.flowType, this.hasCustomAuthorizationHeader = n.hasCustomAuthorizationHeader, n.lock ? this.lock = n.lock : fe() && (!((t = globalThis == null ? void 0 : globalThis.navigator) === null || t === void 0) && t.locks) ? this.lock = fl : this.lock = Vs, this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = {
      verify: this._verify.bind(this),
      enroll: this._enroll.bind(this),
      unenroll: this._unenroll.bind(this),
      challenge: this._challenge.bind(this),
      listFactors: this._listFactors.bind(this),
      challengeAndVerify: this._challengeAndVerify.bind(this),
      getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this)
    }, this.persistSession ? (n.storage ? this.storage = n.storage : bn() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = qs(this.memoryStorage)), n.userStorage && (this.userStorage = n.userStorage)) : (this.memoryStorage = {}, this.storage = qs(this.memoryStorage)), fe() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
      try {
        this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
      } catch (i) {
        console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", i);
      }
      (r = this.broadcastChannel) === null || r === void 0 || r.addEventListener("message", async (i) => {
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
    return (t = (e = Ze[this.storageKey]) === null || e === void 0 ? void 0 : e.jwks) !== null && t !== void 0 ? t : { keys: [] };
  }
  set jwks(e) {
    Ze[this.storageKey] = Object.assign(Object.assign({}, Ze[this.storageKey]), { jwks: e });
  }
  get jwks_cached_at() {
    var e, t;
    return (t = (e = Ze[this.storageKey]) === null || e === void 0 ? void 0 : e.cachedAt) !== null && t !== void 0 ? t : Number.MIN_SAFE_INTEGER;
  }
  set jwks_cached_at(e) {
    Ze[this.storageKey] = Object.assign(Object.assign({}, Ze[this.storageKey]), { cachedAt: e });
  }
  _debug(...e) {
    return this.logDebugMessages && this.logger(`GoTrueClient@${this.instanceID} (${vn}) ${(/* @__PURE__ */ new Date()).toISOString()}`, ...e), this;
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
      const t = Wo(window.location.href);
      let r = "none";
      if (this._isImplicitGrantCallback(t) ? r = "implicit" : await this._isPKCECallback(t) && (r = "pkce"), fe() && this.detectSessionInUrl && r !== "none") {
        const { data: n, error: i } = await this._getSessionFromURL(t, r);
        if (i) {
          if (this._debug("#_initialize()", "error detecting session from URL", i), Po(i)) {
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
      return $(t) ? { error: t } : {
        error: new mn("Unexpected error during initialization", t)
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
    var t, r, n;
    try {
      const i = await L(this.fetch, "POST", `${this.url}/signup`, {
        headers: this.headers,
        body: {
          data: (r = (t = e == null ? void 0 : e.options) === null || t === void 0 ? void 0 : t.data) !== null && r !== void 0 ? r : {},
          gotrue_meta_security: { captcha_token: (n = e == null ? void 0 : e.options) === null || n === void 0 ? void 0 : n.captchaToken }
        },
        xform: _e
      }), { data: a, error: o } = i;
      if (o || !a)
        return { data: { user: null, session: null }, error: o };
      const l = a.session, c = a.user;
      return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers("SIGNED_IN", l)), { data: { user: c, session: l }, error: null };
    } catch (i) {
      if ($(i))
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
    var t, r, n;
    try {
      let i;
      if ("email" in e) {
        const { email: u, password: h, options: p } = e;
        let m = null, v = null;
        this.flowType === "pkce" && ([m, v] = await qe(this.storage, this.storageKey)), i = await L(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          redirectTo: p == null ? void 0 : p.emailRedirectTo,
          body: {
            email: u,
            password: h,
            data: (t = p == null ? void 0 : p.data) !== null && t !== void 0 ? t : {},
            gotrue_meta_security: { captcha_token: p == null ? void 0 : p.captchaToken },
            code_challenge: m,
            code_challenge_method: v
          },
          xform: _e
        });
      } else if ("phone" in e) {
        const { phone: u, password: h, options: p } = e;
        i = await L(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            phone: u,
            password: h,
            data: (r = p == null ? void 0 : p.data) !== null && r !== void 0 ? r : {},
            channel: (n = p == null ? void 0 : p.channel) !== null && n !== void 0 ? n : "sms",
            gotrue_meta_security: { captcha_token: p == null ? void 0 : p.captchaToken }
          },
          xform: _e
        });
      } else
        throw new Et("You must provide either an email or phone number and a password");
      const { data: a, error: o } = i;
      if (o || !a)
        return { data: { user: null, session: null }, error: o };
      const l = a.session, c = a.user;
      return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers("SIGNED_IN", l)), { data: { user: c, session: l }, error: null };
    } catch (i) {
      if ($(i))
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
          xform: Ws
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
          xform: Ws
        });
      } else
        throw new Et("You must provide either an email or phone number and a password");
      const { data: r, error: n } = t;
      return n ? { data: { user: null, session: null }, error: n } : !r || !r.session || !r.user ? { data: { user: null, session: null }, error: new jt() } : (r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers("SIGNED_IN", r.session)), {
        data: Object.assign({ user: r.user, session: r.session }, r.weak_password ? { weakPassword: r.weak_password } : null),
        error: n
      });
    } catch (t) {
      if ($(t))
        return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  /**
   * Log in an existing user via a third-party provider.
   * This method supports the PKCE flow.
   */
  async signInWithOAuth(e) {
    var t, r, n, i;
    return await this._handleProviderSignIn(e.provider, {
      redirectTo: (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo,
      scopes: (r = e.options) === null || r === void 0 ? void 0 : r.scopes,
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
    var t, r, n, i, a, o, l, c, u, h, p, m;
    let v, x;
    if ("message" in e)
      v = e.message, x = e.signature;
    else {
      const { chain: T, wallet: j, statement: E, options: _ } = e;
      let R;
      if (fe())
        if (typeof j == "object")
          R = j;
        else {
          const W = window;
          if ("solana" in W && typeof W.solana == "object" && ("signIn" in W.solana && typeof W.solana.signIn == "function" || "signMessage" in W.solana && typeof W.solana.signMessage == "function"))
            R = W.solana;
          else
            throw new Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
        }
      else {
        if (typeof j != "object" || !(_ != null && _.url))
          throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
        R = j;
      }
      const K = new URL((t = _ == null ? void 0 : _.url) !== null && t !== void 0 ? t : window.location.href);
      if ("signIn" in R && R.signIn) {
        const W = await R.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, _ == null ? void 0 : _.signInWithSolana), {
          // non-overridable properties
          version: "1",
          domain: K.host,
          uri: K.href
        }), E ? { statement: E } : null));
        let O;
        if (Array.isArray(W) && W[0] && typeof W[0] == "object")
          O = W[0];
        else if (W && typeof W == "object" && "signedMessage" in W && "signature" in W)
          O = W;
        else
          throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
        if ("signedMessage" in O && "signature" in O && (typeof O.signedMessage == "string" || O.signedMessage instanceof Uint8Array) && O.signature instanceof Uint8Array)
          v = typeof O.signedMessage == "string" ? O.signedMessage : new TextDecoder().decode(O.signedMessage), x = O.signature;
        else
          throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
      } else {
        if (!("signMessage" in R) || typeof R.signMessage != "function" || !("publicKey" in R) || typeof R != "object" || !R.publicKey || !("toBase58" in R.publicKey) || typeof R.publicKey.toBase58 != "function")
          throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
        v = [
          `${K.host} wants you to sign in with your Solana account:`,
          R.publicKey.toBase58(),
          ...E ? ["", E, ""] : [""],
          "Version: 1",
          `URI: ${K.href}`,
          `Issued At: ${(n = (r = _ == null ? void 0 : _.signInWithSolana) === null || r === void 0 ? void 0 : r.issuedAt) !== null && n !== void 0 ? n : (/* @__PURE__ */ new Date()).toISOString()}`,
          ...!((i = _ == null ? void 0 : _.signInWithSolana) === null || i === void 0) && i.notBefore ? [`Not Before: ${_.signInWithSolana.notBefore}`] : [],
          ...!((a = _ == null ? void 0 : _.signInWithSolana) === null || a === void 0) && a.expirationTime ? [`Expiration Time: ${_.signInWithSolana.expirationTime}`] : [],
          ...!((o = _ == null ? void 0 : _.signInWithSolana) === null || o === void 0) && o.chainId ? [`Chain ID: ${_.signInWithSolana.chainId}`] : [],
          ...!((l = _ == null ? void 0 : _.signInWithSolana) === null || l === void 0) && l.nonce ? [`Nonce: ${_.signInWithSolana.nonce}`] : [],
          ...!((c = _ == null ? void 0 : _.signInWithSolana) === null || c === void 0) && c.requestId ? [`Request ID: ${_.signInWithSolana.requestId}`] : [],
          ...!((h = (u = _ == null ? void 0 : _.signInWithSolana) === null || u === void 0 ? void 0 : u.resources) === null || h === void 0) && h.length ? [
            "Resources",
            ..._.signInWithSolana.resources.map((O) => `- ${O}`)
          ] : []
        ].join(`
`);
        const W = await R.signMessage(new TextEncoder().encode(v), "utf8");
        if (!W || !(W instanceof Uint8Array))
          throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
        x = W;
      }
    }
    try {
      const { data: T, error: j } = await L(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
        headers: this.headers,
        body: Object.assign({ chain: "solana", message: v, signature: Mo(x) }, !((p = e.options) === null || p === void 0) && p.captchaToken ? { gotrue_meta_security: { captcha_token: (m = e.options) === null || m === void 0 ? void 0 : m.captchaToken } } : null),
        xform: _e
      });
      if (j)
        throw j;
      return !T || !T.session || !T.user ? {
        data: { user: null, session: null },
        error: new jt()
      } : (T.session && (await this._saveSession(T.session), await this._notifyAllSubscribers("SIGNED_IN", T.session)), { data: Object.assign({}, T), error: j });
    } catch (T) {
      if ($(T))
        return { data: { user: null, session: null }, error: T };
      throw T;
    }
  }
  async _exchangeCodeForSession(e) {
    const t = await Ie(this.storage, `${this.storageKey}-code-verifier`), [r, n] = (t ?? "").split("/");
    try {
      const { data: i, error: a } = await L(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
        headers: this.headers,
        body: {
          auth_code: e,
          code_verifier: r
        },
        xform: _e
      });
      if (await Se(this.storage, `${this.storageKey}-code-verifier`), a)
        throw a;
      return !i || !i.session || !i.user ? {
        data: { user: null, session: null, redirectType: null },
        error: new jt()
      } : (i.session && (await this._saveSession(i.session), await this._notifyAllSubscribers("SIGNED_IN", i.session)), { data: Object.assign(Object.assign({}, i), { redirectType: n ?? null }), error: a });
    } catch (i) {
      if ($(i))
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
      const { options: t, provider: r, token: n, access_token: i, nonce: a } = e, o = await L(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
        headers: this.headers,
        body: {
          provider: r,
          id_token: n,
          access_token: i,
          nonce: a,
          gotrue_meta_security: { captcha_token: t == null ? void 0 : t.captchaToken }
        },
        xform: _e
      }), { data: l, error: c } = o;
      return c ? { data: { user: null, session: null }, error: c } : !l || !l.session || !l.user ? {
        data: { user: null, session: null },
        error: new jt()
      } : (l.session && (await this._saveSession(l.session), await this._notifyAllSubscribers("SIGNED_IN", l.session)), { data: l, error: c });
    } catch (t) {
      if ($(t))
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
    var t, r, n, i, a;
    try {
      if ("email" in e) {
        const { email: o, options: l } = e;
        let c = null, u = null;
        this.flowType === "pkce" && ([c, u] = await qe(this.storage, this.storageKey));
        const { error: h } = await L(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            email: o,
            data: (t = l == null ? void 0 : l.data) !== null && t !== void 0 ? t : {},
            create_user: (r = l == null ? void 0 : l.shouldCreateUser) !== null && r !== void 0 ? r : !0,
            gotrue_meta_security: { captcha_token: l == null ? void 0 : l.captchaToken },
            code_challenge: c,
            code_challenge_method: u
          },
          redirectTo: l == null ? void 0 : l.emailRedirectTo
        });
        return { data: { user: null, session: null }, error: h };
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
      throw new Et("You must provide either an email or phone number.");
    } catch (o) {
      if ($(o))
        return { data: { user: null, session: null }, error: o };
      throw o;
    }
  }
  /**
   * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
   */
  async verifyOtp(e) {
    var t, r;
    try {
      let n, i;
      "options" in e && (n = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo, i = (r = e.options) === null || r === void 0 ? void 0 : r.captchaToken);
      const { data: a, error: o } = await L(this.fetch, "POST", `${this.url}/verify`, {
        headers: this.headers,
        body: Object.assign(Object.assign({}, e), { gotrue_meta_security: { captcha_token: i } }),
        redirectTo: n,
        xform: _e
      });
      if (o)
        throw o;
      if (!a)
        throw new Error("An error occurred on token verification.");
      const l = a.session, c = a.user;
      return l != null && l.access_token && (await this._saveSession(l), await this._notifyAllSubscribers(e.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", l)), { data: { user: c, session: l }, error: null };
    } catch (n) {
      if ($(n))
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
    var t, r, n;
    try {
      let i = null, a = null;
      return this.flowType === "pkce" && ([i, a] = await qe(this.storage, this.storageKey)), await L(this.fetch, "POST", `${this.url}/sso`, {
        body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? { provider_id: e.providerId } : null), "domain" in e ? { domain: e.domain } : null), { redirect_to: (r = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo) !== null && r !== void 0 ? r : void 0 }), !((n = e == null ? void 0 : e.options) === null || n === void 0) && n.captchaToken ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } } : null), { skip_http_redirect: !0, code_challenge: i, code_challenge_method: a }),
        headers: this.headers,
        xform: il
      });
    } catch (i) {
      if ($(i))
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
        const { data: { session: t }, error: r } = e;
        if (r)
          throw r;
        if (!t)
          throw new je();
        const { error: n } = await L(this.fetch, "GET", `${this.url}/reauthenticate`, {
          headers: this.headers,
          jwt: t.access_token
        });
        return { data: { user: null, session: null }, error: n };
      });
    } catch (e) {
      if ($(e))
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
        const { email: r, type: n, options: i } = e, { error: a } = await L(this.fetch, "POST", t, {
          headers: this.headers,
          body: {
            email: r,
            type: n,
            gotrue_meta_security: { captcha_token: i == null ? void 0 : i.captchaToken }
          },
          redirectTo: i == null ? void 0 : i.emailRedirectTo
        });
        return { data: { user: null, session: null }, error: a };
      } else if ("phone" in e) {
        const { phone: r, type: n, options: i } = e, { data: a, error: o } = await L(this.fetch, "POST", t, {
          headers: this.headers,
          body: {
            phone: r,
            type: n,
            gotrue_meta_security: { captcha_token: i == null ? void 0 : i.captchaToken }
          }
        });
        return { data: { user: null, session: null, messageId: a == null ? void 0 : a.message_id }, error: o };
      }
      throw new Et("You must provide either an email or phone number and a type");
    } catch (t) {
      if ($(t))
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
        const r = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), n = (async () => (await r, await t()))();
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
          const r = t();
          for (this.pendingInLock.push((async () => {
            try {
              await r;
            } catch {
            }
          })()), await r; this.pendingInLock.length; ) {
            const n = [...this.pendingInLock];
            await Promise.all(n), this.pendingInLock.splice(0, n.length);
          }
          return await r;
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
      const t = await Ie(this.storage, this.storageKey);
      if (this._debug("#getSession()", "session from storage", t), t !== null && (this._isValidSession(t) ? e = t : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e)
        return { data: { session: null }, error: null };
      const r = e.expires_at ? e.expires_at * 1e3 - Date.now() < or : !1;
      if (this._debug("#__loadSession()", `session has${r ? "" : " not"} expired`, "expires_at", e.expires_at), !r) {
        if (this.userStorage) {
          const a = await Ie(this.userStorage, this.storageKey + "-user");
          a != null && a.user ? e.user = a.user : e.user = ur();
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
        xform: Oe
      }) : await this._useSession(async (t) => {
        var r, n, i;
        const { data: a, error: o } = t;
        if (o)
          throw o;
        return !(!((r = a.session) === null || r === void 0) && r.access_token) && !this.hasCustomAuthorizationHeader ? { data: { user: null }, error: new je() } : await L(this.fetch, "GET", `${this.url}/user`, {
          headers: this.headers,
          jwt: (i = (n = a.session) === null || n === void 0 ? void 0 : n.access_token) !== null && i !== void 0 ? i : void 0,
          xform: Oe
        });
      });
    } catch (t) {
      if ($(t))
        return Ro(t) && (await this._removeSession(), await Se(this.storage, `${this.storageKey}-code-verifier`)), { data: { user: null }, error: t };
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
      return await this._useSession(async (r) => {
        const { data: n, error: i } = r;
        if (i)
          throw i;
        if (!n.session)
          throw new je();
        const a = n.session;
        let o = null, l = null;
        this.flowType === "pkce" && e.email != null && ([o, l] = await qe(this.storage, this.storageKey));
        const { data: c, error: u } = await L(this.fetch, "PUT", `${this.url}/user`, {
          headers: this.headers,
          redirectTo: t == null ? void 0 : t.emailRedirectTo,
          body: Object.assign(Object.assign({}, e), { code_challenge: o, code_challenge_method: l }),
          jwt: a.access_token,
          xform: Oe
        });
        if (u)
          throw u;
        return a.user = c.user, await this._saveSession(a), await this._notifyAllSubscribers("USER_UPDATED", a), { data: { user: a.user }, error: null };
      });
    } catch (r) {
      if ($(r))
        return { data: { user: null }, error: r };
      throw r;
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
        throw new je();
      const t = Date.now() / 1e3;
      let r = t, n = !0, i = null;
      const { payload: a } = cr(e.access_token);
      if (a.exp && (r = a.exp, n = r <= t), n) {
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
          expires_in: r - t,
          expires_at: r
        }, await this._saveSession(i), await this._notifyAllSubscribers("SIGNED_IN", i);
      }
      return { data: { user: i.user, session: i }, error: null };
    } catch (t) {
      if ($(t))
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
        var r;
        if (!e) {
          const { data: a, error: o } = t;
          if (o)
            throw o;
          e = (r = a.session) !== null && r !== void 0 ? r : void 0;
        }
        if (!(e != null && e.refresh_token))
          throw new je();
        const { session: n, error: i } = await this._callRefreshToken(e.refresh_token);
        return i ? { data: { user: null, session: null }, error: i } : n ? { data: { user: n.user, session: n }, error: null } : { data: { user: null, session: null }, error: null };
      });
    } catch (t) {
      if ($(t))
        return { data: { user: null, session: null }, error: t };
      throw t;
    }
  }
  /**
   * Gets the session data from a URL string
   */
  async _getSessionFromURL(e, t) {
    try {
      if (!fe())
        throw new Ot("No browser detected.");
      if (e.error || e.error_description || e.error_code)
        throw new Ot(e.error_description || "Error in URL with unspecified error_description", {
          error: e.error || "unspecified_error",
          code: e.error_code || "unspecified_code"
        });
      switch (t) {
        case "implicit":
          if (this.flowType === "pkce")
            throw new Ns("Not a valid PKCE flow url.");
          break;
        case "pkce":
          if (this.flowType === "implicit")
            throw new Ot("Not a valid implicit grant flow url.");
          break;
        default:
      }
      if (t === "pkce") {
        if (this._debug("#_initialize()", "begin", "is PKCE flow", !0), !e.code)
          throw new Ns("No code detected.");
        const { data: E, error: _ } = await this._exchangeCodeForSession(e.code);
        if (_)
          throw _;
        const R = new URL(window.location.href);
        return R.searchParams.delete("code"), window.history.replaceState(window.history.state, "", R.toString()), { data: { session: E.session, redirectType: null }, error: null };
      }
      const { provider_token: r, provider_refresh_token: n, access_token: i, refresh_token: a, expires_in: o, expires_at: l, token_type: c } = e;
      if (!i || !o || !a || !c)
        throw new Ot("No session defined in URL");
      const u = Math.round(Date.now() / 1e3), h = parseInt(o);
      let p = u + h;
      l && (p = parseInt(l));
      const m = p - u;
      m * 1e3 <= Je && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${m}s, should have been closer to ${h}s`);
      const v = p - h;
      u - v >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", v, p, u) : u - v < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", v, p, u);
      const { data: x, error: T } = await this._getUser(i);
      if (T)
        throw T;
      const j = {
        provider_token: r,
        provider_refresh_token: n,
        access_token: i,
        expires_in: h,
        expires_at: p,
        refresh_token: a,
        token_type: c,
        user: x.user
      };
      return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), { data: { session: j, redirectType: e.type }, error: null };
    } catch (r) {
      if ($(r))
        return { data: { session: null, redirectType: null }, error: r };
      throw r;
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
    const t = await Ie(this.storage, `${this.storageKey}-code-verifier`);
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
      var r;
      const { data: n, error: i } = t;
      if (i)
        return { error: i };
      const a = (r = n.session) === null || r === void 0 ? void 0 : r.access_token;
      if (a) {
        const { error: o } = await this.admin.signOut(a, e);
        if (o && !(Ao(o) && (o.status === 404 || o.status === 401 || o.status === 403)))
          return { error: o };
      }
      return e !== "others" && (await this._removeSession(), await Se(this.storage, `${this.storageKey}-code-verifier`)), { error: null };
    });
  }
  /**
   * Receive a notification every time an auth event happens.
   * @param callback A callback function to be invoked when an auth event happens.
   */
  onAuthStateChange(e) {
    const t = Fo(), r = {
      id: t,
      callback: e,
      unsubscribe: () => {
        this._debug("#unsubscribe()", "state change callback with id removed", t), this.stateChangeEmitters.delete(t);
      }
    };
    return this._debug("#onAuthStateChange()", "registered callback with id", t), this.stateChangeEmitters.set(t, r), (async () => (await this.initializePromise, await this._acquireLock(-1, async () => {
      this._emitInitialSession(t);
    })))(), { data: { subscription: r } };
  }
  async _emitInitialSession(e) {
    return await this._useSession(async (t) => {
      var r, n;
      try {
        const { data: { session: i }, error: a } = t;
        if (a)
          throw a;
        await ((r = this.stateChangeEmitters.get(e)) === null || r === void 0 ? void 0 : r.callback("INITIAL_SESSION", i)), this._debug("INITIAL_SESSION", "callback id", e, "session", i);
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
    let r = null, n = null;
    this.flowType === "pkce" && ([r, n] = await qe(
      this.storage,
      this.storageKey,
      !0
      // isPasswordRecovery
    ));
    try {
      return await L(this.fetch, "POST", `${this.url}/recover`, {
        body: {
          email: e,
          code_challenge: r,
          code_challenge_method: n,
          gotrue_meta_security: { captcha_token: t.captchaToken }
        },
        headers: this.headers,
        redirectTo: t.redirectTo
      });
    } catch (i) {
      if ($(i))
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
      const { data: t, error: r } = await this.getUser();
      if (r)
        throw r;
      return { data: { identities: (e = t.user.identities) !== null && e !== void 0 ? e : [] }, error: null };
    } catch (t) {
      if ($(t))
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
      const { data: r, error: n } = await this._useSession(async (i) => {
        var a, o, l, c, u;
        const { data: h, error: p } = i;
        if (p)
          throw p;
        const m = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, e.provider, {
          redirectTo: (a = e.options) === null || a === void 0 ? void 0 : a.redirectTo,
          scopes: (o = e.options) === null || o === void 0 ? void 0 : o.scopes,
          queryParams: (l = e.options) === null || l === void 0 ? void 0 : l.queryParams,
          skipBrowserRedirect: !0
        });
        return await L(this.fetch, "GET", m, {
          headers: this.headers,
          jwt: (u = (c = h.session) === null || c === void 0 ? void 0 : c.access_token) !== null && u !== void 0 ? u : void 0
        });
      });
      if (n)
        throw n;
      return fe() && !(!((t = e.options) === null || t === void 0) && t.skipBrowserRedirect) && window.location.assign(r == null ? void 0 : r.url), { data: { provider: e.provider, url: r == null ? void 0 : r.url }, error: null };
    } catch (r) {
      if ($(r))
        return { data: { provider: e.provider, url: null }, error: r };
      throw r;
    }
  }
  /**
   * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
   */
  async unlinkIdentity(e) {
    try {
      return await this._useSession(async (t) => {
        var r, n;
        const { data: i, error: a } = t;
        if (a)
          throw a;
        return await L(this.fetch, "DELETE", `${this.url}/user/identities/${e.identity_id}`, {
          headers: this.headers,
          jwt: (n = (r = i.session) === null || r === void 0 ? void 0 : r.access_token) !== null && n !== void 0 ? n : void 0
        });
      });
    } catch (t) {
      if ($(t))
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
      const r = Date.now();
      return await zo(async (n) => (n > 0 && await Vo(200 * Math.pow(2, n - 1)), this._debug(t, "refreshing attempt", n), await L(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
        body: { refresh_token: e },
        headers: this.headers,
        xform: _e
      })), (n, i) => {
        const a = 200 * Math.pow(2, n);
        return i && lr(i) && // retryable only if the request can be sent before the backoff overflows the tick duration
        Date.now() + a - r < Je;
      });
    } catch (r) {
      if (this._debug(t, "error", r), $(r))
        return { data: { session: null, user: null }, error: r };
      throw r;
    } finally {
      this._debug(t, "end");
    }
  }
  _isValidSession(e) {
    return typeof e == "object" && e !== null && "access_token" in e && "refresh_token" in e && "expires_at" in e;
  }
  async _handleProviderSignIn(e, t) {
    const r = await this._getUrlForProvider(`${this.url}/authorize`, e, {
      redirectTo: t.redirectTo,
      scopes: t.scopes,
      queryParams: t.queryParams
    });
    return this._debug("#_handleProviderSignIn()", "provider", e, "options", t, "url", r), fe() && !t.skipBrowserRedirect && window.location.assign(r), { data: { provider: e, url: r }, error: null };
  }
  /**
   * Recovers the session from LocalStorage and refreshes the token
   * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
   */
  async _recoverAndRefresh() {
    var e, t;
    const r = "#_recoverAndRefresh()";
    this._debug(r, "begin");
    try {
      const n = await Ie(this.storage, this.storageKey);
      if (n && this.userStorage) {
        let a = await Ie(this.userStorage, this.storageKey + "-user");
        !this.storage.isServer && Object.is(this.storage, this.userStorage) && !a && (a = { user: n.user }, await He(this.userStorage, this.storageKey + "-user", a)), n.user = (e = a == null ? void 0 : a.user) !== null && e !== void 0 ? e : ur();
      } else if (n && !n.user && !n.user) {
        const a = await Ie(this.storage, this.storageKey + "-user");
        a && (a != null && a.user) ? (n.user = a.user, await Se(this.storage, this.storageKey + "-user"), await He(this.storage, this.storageKey, n)) : n.user = ur();
      }
      if (this._debug(r, "session from storage", n), !this._isValidSession(n)) {
        this._debug(r, "session is not valid"), n !== null && await this._removeSession();
        return;
      }
      const i = ((t = n.expires_at) !== null && t !== void 0 ? t : 1 / 0) * 1e3 - Date.now() < or;
      if (this._debug(r, `session has${i ? "" : " not"} expired with margin of ${or}s`), i) {
        if (this.autoRefreshToken && n.refresh_token) {
          const { error: a } = await this._callRefreshToken(n.refresh_token);
          a && (console.error(a), lr(a) || (this._debug(r, "refresh failed with a non-retryable error, removing the session", a), await this._removeSession()));
        }
      } else if (n.user && n.user.__isUserNotAvailableProxy === !0)
        try {
          const { data: a, error: o } = await this._getUser(n.access_token);
          !o && (a != null && a.user) ? (n.user = a.user, await this._saveSession(n), await this._notifyAllSubscribers("SIGNED_IN", n)) : this._debug(r, "could not get user data, skipping SIGNED_IN notification");
        } catch (a) {
          console.error("Error getting user data:", a), this._debug(r, "error getting user data, skipping SIGNED_IN notification", a);
        }
      else
        await this._notifyAllSubscribers("SIGNED_IN", n);
    } catch (n) {
      this._debug(r, "error", n), console.error(n);
      return;
    } finally {
      this._debug(r, "end");
    }
  }
  async _callRefreshToken(e) {
    var t, r;
    if (!e)
      throw new je();
    if (this.refreshingDeferred)
      return this.refreshingDeferred.promise;
    const n = `#_callRefreshToken(${e.substring(0, 5)}...)`;
    this._debug(n, "begin");
    try {
      this.refreshingDeferred = new Gt();
      const { data: i, error: a } = await this._refreshAccessToken(e);
      if (a)
        throw a;
      if (!i.session)
        throw new je();
      await this._saveSession(i.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", i.session);
      const o = { session: i.session, error: null };
      return this.refreshingDeferred.resolve(o), o;
    } catch (i) {
      if (this._debug(n, "error", i), $(i)) {
        const a = { session: null, error: i };
        return lr(i) || await this._removeSession(), (t = this.refreshingDeferred) === null || t === void 0 || t.resolve(a), a;
      }
      throw (r = this.refreshingDeferred) === null || r === void 0 || r.reject(i), i;
    } finally {
      this.refreshingDeferred = null, this._debug(n, "end");
    }
  }
  async _notifyAllSubscribers(e, t, r = !0) {
    const n = `#_notifyAllSubscribers(${e})`;
    this._debug(n, "begin", t, `broadcast = ${r}`);
    try {
      this.broadcastChannel && r && this.broadcastChannel.postMessage({ event: e, session: t });
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
    const t = Object.assign({}, e), r = t.user && t.user.__isUserNotAvailableProxy === !0;
    if (this.userStorage) {
      !r && t.user && await He(this.userStorage, this.storageKey + "-user", {
        user: t.user
      });
      const n = Object.assign({}, t);
      delete n.user;
      const i = Bs(n);
      await He(this.storage, this.storageKey, i);
    } else {
      const n = Bs(t);
      await He(this.storage, this.storageKey, n);
    }
  }
  async _removeSession() {
    this._debug("#_removeSession()"), await Se(this.storage, this.storageKey), await Se(this.storage, this.storageKey + "-code-verifier"), await Se(this.storage, this.storageKey + "-user"), this.userStorage && await Se(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
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
      e && fe() && (window != null && window.removeEventListener) && window.removeEventListener("visibilitychange", e);
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
    const e = setInterval(() => this._autoRefreshTokenTick(), Je);
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
              const { data: { session: r } } = t;
              if (!r || !r.refresh_token || !r.expires_at) {
                this._debug("#_autoRefreshTokenTick()", "no session");
                return;
              }
              const n = Math.floor((r.expires_at * 1e3 - e) / Je);
              this._debug("#_autoRefreshTokenTick()", `access token expires in ${n} ticks, a tick lasts ${Je}ms, refresh threshold is ${Cr} ticks`), n <= Cr && await this._callRefreshToken(r.refresh_token);
            });
          } catch (t) {
            console.error("Auto refresh tick failed with error. This is likely a transient error.", t);
          }
        } finally {
          this._debug("#_autoRefreshTokenTick()", "end");
        }
      });
    } catch (e) {
      if (e.isAcquireTimeout || e instanceof kn)
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
    if (this._debug("#_handleVisibilityChange()"), !fe() || !(window != null && window.addEventListener))
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
  async _getUrlForProvider(e, t, r) {
    const n = [`provider=${encodeURIComponent(t)}`];
    if (r != null && r.redirectTo && n.push(`redirect_to=${encodeURIComponent(r.redirectTo)}`), r != null && r.scopes && n.push(`scopes=${encodeURIComponent(r.scopes)}`), this.flowType === "pkce") {
      const [i, a] = await qe(this.storage, this.storageKey), o = new URLSearchParams({
        code_challenge: `${encodeURIComponent(i)}`,
        code_challenge_method: `${encodeURIComponent(a)}`
      });
      n.push(o.toString());
    }
    if (r != null && r.queryParams) {
      const i = new URLSearchParams(r.queryParams);
      n.push(i.toString());
    }
    return r != null && r.skipBrowserRedirect && n.push(`skip_http_redirect=${r.skipBrowserRedirect}`), `${e}?${n.join("&")}`;
  }
  async _unenroll(e) {
    try {
      return await this._useSession(async (t) => {
        var r;
        const { data: n, error: i } = t;
        return i ? { data: null, error: i } : await L(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, {
          headers: this.headers,
          jwt: (r = n == null ? void 0 : n.session) === null || r === void 0 ? void 0 : r.access_token
        });
      });
    } catch (t) {
      if ($(t))
        return { data: null, error: t };
      throw t;
    }
  }
  async _enroll(e) {
    try {
      return await this._useSession(async (t) => {
        var r, n;
        const { data: i, error: a } = t;
        if (a)
          return { data: null, error: a };
        const o = Object.assign({ friendly_name: e.friendlyName, factor_type: e.factorType }, e.factorType === "phone" ? { phone: e.phone } : { issuer: e.issuer }), { data: l, error: c } = await L(this.fetch, "POST", `${this.url}/factors`, {
          body: o,
          headers: this.headers,
          jwt: (r = i == null ? void 0 : i.session) === null || r === void 0 ? void 0 : r.access_token
        });
        return c ? { data: null, error: c } : (e.factorType === "totp" && (!((n = l == null ? void 0 : l.totp) === null || n === void 0) && n.qr_code) && (l.totp.qr_code = `data:image/svg+xml;utf-8,${l.totp.qr_code}`), { data: l, error: null });
      });
    } catch (t) {
      if ($(t))
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
          var r;
          const { data: n, error: i } = t;
          if (i)
            return { data: null, error: i };
          const { data: a, error: o } = await L(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, {
            body: { code: e.code, challenge_id: e.challengeId },
            headers: this.headers,
            jwt: (r = n == null ? void 0 : n.session) === null || r === void 0 ? void 0 : r.access_token
          });
          return o ? { data: null, error: o } : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + a.expires_in }, a)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", a), { data: a, error: o });
        });
      } catch (t) {
        if ($(t))
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
          var r;
          const { data: n, error: i } = t;
          return i ? { data: null, error: i } : await L(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, {
            body: { channel: e.channel },
            headers: this.headers,
            jwt: (r = n == null ? void 0 : n.session) === null || r === void 0 ? void 0 : r.access_token
          });
        });
      } catch (t) {
        if ($(t))
          return { data: null, error: t };
        throw t;
      }
    });
  }
  /**
   * {@see GoTrueMFAApi#challengeAndVerify}
   */
  async _challengeAndVerify(e) {
    const { data: t, error: r } = await this._challenge({
      factorId: e.factorId
    });
    return r ? { data: null, error: r } : await this._verify({
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
    const r = (e == null ? void 0 : e.factors) || [], n = r.filter((a) => a.factor_type === "totp" && a.status === "verified"), i = r.filter((a) => a.factor_type === "phone" && a.status === "verified");
    return {
      data: {
        all: r,
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
      var t, r;
      const { data: { session: n }, error: i } = e;
      if (i)
        return { data: null, error: i };
      if (!n)
        return {
          data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
          error: null
        };
      const { payload: a } = cr(n.access_token);
      let o = null;
      a.aal && (o = a.aal);
      let l = o;
      ((r = (t = n.user.factors) === null || t === void 0 ? void 0 : t.filter((h) => h.status === "verified")) !== null && r !== void 0 ? r : []).length > 0 && (l = "aal2");
      const u = a.amr || [];
      return { data: { currentLevel: o, nextLevel: l, currentAuthenticationMethods: u }, error: null };
    }));
  }
  async fetchJwk(e, t = { keys: [] }) {
    let r = t.keys.find((o) => o.kid === e);
    if (r)
      return r;
    const n = Date.now();
    if (r = this.jwks.keys.find((o) => o.kid === e), r && this.jwks_cached_at + Oo > n)
      return r;
    const { data: i, error: a } = await L(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
      headers: this.headers
    });
    if (a)
      throw a;
    return !i.keys || i.keys.length === 0 || (this.jwks = i, this.jwks_cached_at = n, r = i.keys.find((o) => o.kid === e), !r) ? null : r;
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
      let r = e;
      if (!r) {
        const { data: m, error: v } = await this.getSession();
        if (v || !m.session)
          return { data: null, error: v };
        r = m.session.access_token;
      }
      const { header: n, payload: i, signature: a, raw: { header: o, payload: l } } = cr(r);
      t != null && t.allowExpired || Qo(i.exp);
      const c = !n.alg || n.alg.startsWith("HS") || !n.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(n.kid, t != null && t.keys ? { keys: t.keys } : t == null ? void 0 : t.jwks);
      if (!c) {
        const { error: m } = await this.getUser(r);
        if (m)
          throw m;
        return {
          data: {
            claims: i,
            header: n,
            signature: a
          },
          error: null
        };
      }
      const u = Xo(n.alg), h = await crypto.subtle.importKey("jwk", c, u, !0, [
        "verify"
      ]);
      if (!await crypto.subtle.verify(u, h, a, Do(`${o}.${l}`)))
        throw new Pr("Invalid JWT signature");
      return {
        data: {
          claims: i,
          header: n,
          signature: a
        },
        error: null
      };
    } catch (r) {
      if ($(r))
        return { data: null, error: r };
      throw r;
    }
  }
}
mt.nextInstanceID = 0;
const gl = mt;
class vl extends gl {
  constructor(e) {
    super(e);
  }
}
var yl = function(s, e, t, r) {
  function n(i) {
    return i instanceof t ? i : new t(function(a) {
      a(i);
    });
  }
  return new (t || (t = Promise))(function(i, a) {
    function o(u) {
      try {
        c(r.next(u));
      } catch (h) {
        a(h);
      }
    }
    function l(u) {
      try {
        c(r.throw(u));
      } catch (h) {
        a(h);
      }
    }
    function c(u) {
      u.done ? i(u.value) : n(u.value).then(o, l);
    }
    c((r = r.apply(s, e || [])).next());
  });
};
class ml {
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
  constructor(e, t, r) {
    var n, i, a;
    if (this.supabaseUrl = e, this.supabaseKey = t, !e)
      throw new Error("supabaseUrl is required.");
    if (!t)
      throw new Error("supabaseKey is required.");
    const o = ko(e), l = new URL(o);
    this.realtimeUrl = new URL("realtime/v1", l), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", l), this.storageUrl = new URL("storage/v1", l), this.functionsUrl = new URL("functions/v1", l);
    const c = `sb-${l.hostname.split(".")[0]}-auth-token`, u = {
      db: po,
      realtime: vo,
      auth: Object.assign(Object.assign({}, go), { storageKey: c }),
      global: fo
    }, h = xo(r ?? {}, u);
    this.storageKey = (n = h.auth.storageKey) !== null && n !== void 0 ? n : "", this.headers = (i = h.global.headers) !== null && i !== void 0 ? i : {}, h.accessToken ? (this.accessToken = h.accessToken, this.auth = new Proxy({}, {
      get: (p, m) => {
        throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(m)} is not possible`);
      }
    })) : this.auth = this._initSupabaseAuthClient((a = h.auth) !== null && a !== void 0 ? a : {}, this.headers, h.global.fetch), this.fetch = bo(t, this._getAccessToken.bind(this), h.global.fetch), this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, h.realtime)), this.rest = new $a(new URL("rest/v1", l).href, {
      headers: this.headers,
      schema: h.db.schema,
      fetch: this.fetch
    }), this.storage = new co(this.storageUrl.href, this.headers, this.fetch, r == null ? void 0 : r.storage), h.accessToken || this._listenForAuthEvents();
  }
  /**
   * Supabase Functions allows you to deploy and invoke edge functions.
   */
  get functions() {
    return new ca(this.functionsUrl.href, {
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
  rpc(e, t = {}, r = {}) {
    return this.rest.rpc(e, t, r);
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
    return yl(this, void 0, void 0, function* () {
      if (this.accessToken)
        return yield this.accessToken();
      const { data: r } = yield this.auth.getSession();
      return (t = (e = r.session) === null || e === void 0 ? void 0 : e.access_token) !== null && t !== void 0 ? t : this.supabaseKey;
    });
  }
  _initSupabaseAuthClient({ autoRefreshToken: e, persistSession: t, detectSessionInUrl: r, storage: n, storageKey: i, flowType: a, lock: o, debug: l }, c, u) {
    const h = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`
    };
    return new vl({
      url: this.authUrl.href,
      headers: Object.assign(Object.assign({}, h), c),
      storageKey: i,
      autoRefreshToken: e,
      persistSession: t,
      detectSessionInUrl: r,
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
    return new Ha(this.realtimeUrl.href, Object.assign(Object.assign({}, e), { params: Object.assign({ apikey: this.supabaseKey }, e == null ? void 0 : e.params) }));
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((t, r) => {
      this._handleTokenChanged(t, "CLIENT", r == null ? void 0 : r.access_token);
    });
  }
  _handleTokenChanged(e, t, r) {
    (e === "TOKEN_REFRESHED" || e === "SIGNED_IN") && this.changedAccessToken !== r ? this.changedAccessToken = r : e === "SIGNED_OUT" && (this.realtime.setAuth(), t == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
  }
}
const _l = (s, e, t) => new ml(s, e, t);
function bl() {
  if (typeof window < "u" || typeof process > "u")
    return !1;
  const s = process.version;
  if (s == null)
    return !1;
  const e = s.match(/^v(\d+)\./);
  return e ? parseInt(e[1], 10) <= 18 : !1;
}
bl() && console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");
function Ke(s) {
  var r;
  if (typeof process < "u" && typeof process.env < "u" && Object.prototype.hasOwnProperty.call(process.env, s))
    return process.env[s];
  const e = (r = globalThis.import) == null ? void 0 : r.meta, t = (e == null ? void 0 : e.env) ?? globalThis.__env__;
  if (t && Object.prototype.hasOwnProperty.call(t, s)) {
    const n = t[s];
    return typeof n == "string" ? n : n != null ? String(n) : void 0;
  }
}
function wl(s, e = !0) {
  if (s == null || s === "")
    return e;
  if (typeof s == "boolean")
    return s;
  const t = String(s).toLowerCase().trim();
  return ["1", "true", "yes", "on", "enabled"].includes(t) ? !0 : ["0", "false", "no", "off", "disabled"].includes(t) ? !1 : e;
}
function xn() {
  const s = Ke("NEXT_PUBLIC_SUPABASE_URL") || Ke("VITE_SUPABASE_URL") || "", e = Ke("NEXT_PUBLIC_SUPABASE_ANON_KEY") || Ke("VITE_SUPABASE_ANON_KEY") || "", t = Ke("NEXT_PUBLIC_FEATURE_SUPABASE") ?? Ke("VITE_FEATURE_SUPABASE"), r = wl(t, !0), n = !!(s && e);
  return { url: s, anonKey: e, flagRaw: t, enabledByFlag: r, hasEnv: n, enabled: r && n };
}
function kl() {
  return xn().enabled;
}
function Sn() {
  return kl();
}
const { url: xl, anonKey: Sl, enabledByFlag: Tl, hasEnv: jl, enabled: Tn } = xn();
let zs = !1;
const El = process.env.NODE_ENV === "test", Ol = process.env.NODE_ENV === "production", Cl = process.env.CI === "true";
!Tn && Tl && !jl && !Ol && !El && !Cl && !zs && (console.warn("[supabase] URL/key missing; storage features are disabled."), zs = !0);
Tn && _l(xl, Sl);
const Al = oe({
  id: N(),
  type: N(),
  label: N().optional(),
  data: Dt(yt()).optional()
}), Rl = oe({
  id: N(),
  source: N(),
  target: N(),
  label: N().optional(),
  data: Dt(yt()).optional()
}), Pl = oe({
  nodes: ge(Al),
  edges: ge(Rl),
  layout: Dt(yt()).optional(),
  settings: Dt(yt()).optional()
});
oe({
  version: N(),
  kind: Ui("graph"),
  meta: oe({
    id: N(),
    name: N(),
    description: N().optional(),
    tags: ge(N()).optional(),
    createdAt: N(),
    updatedAt: N(),
    author: oe({ id: N().optional(), name: N().optional() }).optional()
  }),
  graph: Pl,
  extras: oe({
    previewUrl: N().url().optional(),
    thumbSeed: N().optional()
  }).catchall(yt()).optional()
});
const Zs = "psg.devUserId";
function $l() {
  const s = (process.env.NEXT_PUBLIC_FEATURE_DEV_USER || process.env.VITE_FEATURE_DEV_USER || "").toLowerCase();
  return s === "1" || s === "true";
}
const jn = D.createContext({ userId: null });
function ec({ children: s, supabase: e }) {
  const [t, r] = D.useState(null);
  D.useEffect(() => {
    let i;
    async function a() {
      var o, l;
      if ($l() && typeof window < "u")
        try {
          let c = window.localStorage.getItem(Zs);
          c || (c = `dev-${Math.random().toString(36).slice(2, 10)}`, window.localStorage.setItem(Zs, c)), r(c);
          return;
        } catch {
        }
      if (e && e.auth)
        try {
          const { data: c } = await e.auth.getSession(), u = ((l = (o = c.session) == null ? void 0 : o.user) == null ? void 0 : l.id) ?? null;
          if (r(u), typeof e.auth.onAuthStateChange == "function") {
            const h = e.auth.onAuthStateChange((p, m) => {
              var v;
              r(((v = m == null ? void 0 : m.user) == null ? void 0 : v.id) ?? null);
            });
            h && h.data && h.data.subscription && typeof h.data.subscription.unsubscribe == "function" && (i = () => h.data.subscription.unsubscribe());
          }
          return;
        } catch {
          r(null);
          return;
        }
      r(null);
    }
    return a(), () => {
      i && i();
    };
  }, [e]);
  const n = D.useMemo(() => ({ userId: t }), [t]);
  return /* @__PURE__ */ f.jsx(jn.Provider, { value: n, children: s });
}
function En() {
  return D.useContext(jn);
}
async function Il(s) {
  const e = await fetch(s);
  if (!e.ok) throw new Error(`Failed to download graph (${e.status})`);
  return e.json();
}
function On() {
  return /* @__PURE__ */ f.jsx("span", { "aria-label": "loading", role: "status", children: "Loading…" });
}
function tc({ isOpen: s, onClose: e, onOpenGraph: t, userId: r, enableSupabase: n, supabaseList: i, supabaseGet: a }) {
  const [o, l] = D.useState("server"), { userId: c } = En(), u = r ?? c ?? null, h = n ?? Sn(), p = !!u && !!i && !!a && h;
  return s ? /* @__PURE__ */ f.jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Open Graph", style: Ct.backdrop, children: /* @__PURE__ */ f.jsxs("div", { style: Ct.dialog, children: [
    /* @__PURE__ */ f.jsxs("header", { style: Ct.header, children: [
      /* @__PURE__ */ f.jsx("h2", { style: { margin: 0 }, children: "Open" }),
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: e, "aria-label": "Close Open Dialog", children: "✕" })
    ] }),
    /* @__PURE__ */ f.jsxs("nav", { "aria-label": "Open Tabs", style: Ct.tabs, children: [
      /* @__PURE__ */ f.jsx("button", { type: "button", "aria-selected": o === "server", onClick: () => l("server"), children: "Server" }),
      p && /* @__PURE__ */ f.jsx("button", { type: "button", "aria-selected": o === "supabase", onClick: () => l("supabase"), children: "Supabase" }),
      /* @__PURE__ */ f.jsx("button", { type: "button", "aria-selected": o === "local", onClick: () => l("local"), children: "Local" })
    ] }),
    /* @__PURE__ */ f.jsx("section", { style: { padding: 12 }, children: o === "server" ? /* @__PURE__ */ f.jsx(Ll, { onOpenGraph: t }) : o === "local" ? /* @__PURE__ */ f.jsx(Ul, { onOpenGraph: t }) : (
      // tab === 'supabase'
      p ? /* @__PURE__ */ f.jsx(
        Nl,
        {
          userId: u,
          onOpenGraph: t,
          listFn: i,
          getFn: a
        }
      ) : null
    ) })
  ] }) }) : null;
}
function Nl({ userId: s, onOpenGraph: e, listFn: t, getFn: r }) {
  const [n, i] = D.useState("idle"), [a, o] = D.useState(null), [l, c] = D.useState([]), [u, h] = D.useState(null), [p, m] = D.useState(0), v = D.useCallback(async () => {
    i("loading"), o(null);
    const j = await t(s);
    if (!j.ok) {
      o(j.error.message || "Failed to list graphs"), i("error");
      return;
    }
    c(j.data), m(0), i("done");
  }, [s, t]);
  D.useEffect(() => {
    v();
  }, [v]);
  async function x(j) {
    h(j);
    const E = await r(s, j);
    if (!E.ok) {
      o(E.error.message || "Failed to open graph"), h(null);
      return;
    }
    try {
      const _ = JSON.parse(E.data);
      e(_);
    } catch {
      o("Invalid graph JSON");
    } finally {
      h(null);
    }
  }
  function T(j) {
    if (l.length !== 0) {
      if (j.key === "ArrowDown")
        j.preventDefault(), m((E) => Math.min(E + 1, l.length - 1));
      else if (j.key === "ArrowUp")
        j.preventDefault(), m((E) => Math.max(E - 1, 0));
      else if (j.key === "Enter") {
        j.preventDefault();
        const E = l[p];
        E && x(E.name);
      }
    }
  }
  return /* @__PURE__ */ f.jsxs("div", { children: [
    /* @__PURE__ */ f.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: v, disabled: n === "loading", children: n === "loading" ? "Loading…" : "Retry" }),
      n === "loading" && /* @__PURE__ */ f.jsx(On, {})
    ] }),
    a && /* @__PURE__ */ f.jsx(Ft, { message: a, onRetry: v }),
    n === "done" && l.length === 0 && /* @__PURE__ */ f.jsx(Nr, { message: "No Supabase graphs available." }),
    n === "done" && l.length > 0 && /* @__PURE__ */ f.jsx(
      "ul",
      {
        "aria-label": "Supabase Graphs",
        role: "listbox",
        tabIndex: 0,
        onKeyDown: T,
        style: { marginTop: 8, outline: "none" },
        children: l.map((j, E) => /* @__PURE__ */ f.jsx(
          "li",
          {
            role: "option",
            "aria-selected": p === E,
            style: { background: p === E ? "#eef" : void 0, padding: 6, borderRadius: 4 },
            onMouseEnter: () => m(E),
            children: /* @__PURE__ */ f.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
              /* @__PURE__ */ f.jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ f.jsx("strong", { children: j.name }) }),
              /* @__PURE__ */ f.jsx("button", { type: "button", onClick: () => x(j.name), disabled: !!u, children: u === j.name ? "Opening…" : "Open" })
            ] })
          },
          j.name
        ))
      }
    )
  ] });
}
function Ll({ onOpenGraph: s }) {
  const [e, t] = D.useState("idle"), [r, n] = D.useState(null), [i, a] = D.useState([]), [o, l] = D.useState(null), [c, u] = D.useState(0), h = D.useCallback(async () => {
    t("loading"), n(null);
    try {
      const v = await wr("");
      a(v), t("done"), u(0);
    } catch (v) {
      const x = v instanceof Error ? v.message : "Failed to load graph manifest";
      /404/.test(String(x)) ? (a([]), t("done")) : (n(x), t("error"));
    }
  }, []);
  D.useEffect(() => {
    h();
  }, [h]);
  async function p(v) {
    l(v);
    try {
      const x = await Il(`/graphs/${v}`);
      s(x);
    } catch (x) {
      const T = x instanceof Error ? x.message : "Failed to open graph";
      n(T);
    } finally {
      l(null);
    }
  }
  function m(v) {
    if (i.length !== 0) {
      if (v.key === "ArrowDown")
        v.preventDefault(), u((x) => Math.min(x + 1, i.length - 1));
      else if (v.key === "ArrowUp")
        v.preventDefault(), u((x) => Math.max(x - 1, 0));
      else if (v.key === "Enter") {
        v.preventDefault();
        const x = i[c];
        x && p(x.filename);
      }
    }
  }
  return /* @__PURE__ */ f.jsxs("div", { children: [
    /* @__PURE__ */ f.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: h, disabled: e === "loading", children: e === "loading" ? "Loading…" : "Retry" }),
      e === "loading" && /* @__PURE__ */ f.jsx(On, {})
    ] }),
    r && /* @__PURE__ */ f.jsx(Ft, { message: r, onRetry: h }),
    e === "done" && i.length === 0 && /* @__PURE__ */ f.jsx(Nr, { message: "No server graphs available." }),
    e === "done" && i.length > 0 && /* @__PURE__ */ f.jsx(
      "ul",
      {
        "aria-label": "Server Graphs",
        role: "listbox",
        tabIndex: 0,
        onKeyDown: m,
        style: { marginTop: 8, outline: "none" },
        children: i.map((v, x) => /* @__PURE__ */ f.jsx(
          "li",
          {
            role: "option",
            "aria-selected": c === x,
            style: { background: c === x ? "#eef" : void 0, padding: 6, borderRadius: 4 },
            onMouseEnter: () => u(x),
            children: /* @__PURE__ */ f.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
              /* @__PURE__ */ f.jsxs("div", { style: { flex: 1 }, children: [
                /* @__PURE__ */ f.jsx("strong", { children: v.title }),
                /* @__PURE__ */ f.jsxs("div", { style: { fontSize: 12, color: "#555" }, children: [
                  v.filename,
                  " • ",
                  new Date(v.updatedAt).toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ f.jsx("button", { type: "button", onClick: () => p(v.filename), disabled: !!o, children: o === v.filename ? "Opening…" : "Open" })
            ] })
          },
          v.filename
        ))
      }
    )
  ] });
}
function Ul({ onOpenGraph: s }) {
  const [e, t] = D.useState(null);
  function r(n) {
    var l;
    t(null);
    const i = (l = n.target.files) == null ? void 0 : l[0];
    if (!i) return;
    const a = i.name.toLowerCase(), o = new FileReader();
    o.onerror = () => t("Failed to read file"), o.onload = () => {
      try {
        const c = String(o.result || ""), u = JSON.parse(c);
        a.endsWith(".graph.json") || a.endsWith(".psg") ? s(u) : t("Unsupported file type");
      } catch {
        t("Invalid file");
      }
    }, o.readAsText(i);
  }
  return /* @__PURE__ */ f.jsxs("div", { children: [
    /* @__PURE__ */ f.jsxs("label", { children: [
      /* @__PURE__ */ f.jsx("span", { style: { display: "block", marginBottom: 4 }, children: "Choose a .psg or .graph.json file" }),
      /* @__PURE__ */ f.jsx("input", { "aria-label": "Local Graph File", type: "file", accept: ".psg,.graph.json,application/json", onChange: r })
    ] }),
    e && /* @__PURE__ */ f.jsx(Ft, { message: e })
  ] });
}
const Ct = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" },
  dialog: { background: "#fff", width: 560, maxWidth: "95vw", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" },
  header: { display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #eee" },
  tabs: { display: "flex", gap: 8, borderBottom: "1px solid #eee", padding: 8 }
};
function Ks() {
  return /* @__PURE__ */ f.jsx("span", { "aria-label": "saving", role: "status", children: "Saving…" });
}
const hr = "graph";
function Dl(s) {
  return s.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}
function Ml(s) {
  return s.toLowerCase().endsWith(".psg") ? s : `${s}.psg`;
}
function rc({ isOpen: s, onClose: e, graph: t, onSaveBlob: r, enableSupabase: n, userId: i, supabasePut: a, onSupabaseSaved: o }) {
  const { userId: l } = En(), [c, u] = D.useState(hr), [h, p] = D.useState(null), [m, v] = D.useState(!1), [x, T] = D.useState(!1);
  if (D.useEffect(() => {
    s && (u(hr), p(null), v(!1), T(!1));
  }, [s]), !s) return null;
  const E = Dl(c).slice(0, 64), _ = Ml(E || hr), R = !!E && !E.startsWith(".") && !E.endsWith("."), K = i ?? l ?? null, O = !!((n ?? Sn()) && K && a);
  async function Q() {
    if (!R || !O) {
      p("Please enter a valid name");
      return;
    }
    T(!0), p(null);
    try {
      const ve = JSON.stringify(t, null, 2), de = await a(K, _, ve);
      de.ok ? (o == null || o(_, de.data.path), e()) : p(`Failed to upload: ${de.error.message}`);
    } catch (ve) {
      const de = ve instanceof Error ? ve.message : "Upload failed";
      p(`Failed to upload: ${de}`);
    } finally {
      T(!1);
    }
  }
  function re(ve) {
    u(ve.target.value), p(null);
  }
  async function Me() {
    if (!R) {
      p("Please enter a valid name");
      return;
    }
    v(!0);
    try {
      const ve = JSON.stringify(t, null, 2), de = new Blob([ve], { type: "application/json" });
      r == null || r(de, _);
      const he = URL.createObjectURL(de), ae = document.createElement("a");
      ae.href = he, ae.download = _, document.body.appendChild(ae), ae.click(), ae.remove(), URL.revokeObjectURL(he), e();
    } catch {
      p("Failed to save file");
    } finally {
      v(!1);
    }
  }
  return /* @__PURE__ */ f.jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Save Graph", style: At.backdrop, children: /* @__PURE__ */ f.jsxs("div", { style: At.dialog, children: [
    /* @__PURE__ */ f.jsxs("header", { style: At.header, children: [
      /* @__PURE__ */ f.jsx("h2", { style: { margin: 0 }, children: "Save" }),
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: e, "aria-label": "Close Save Dialog", children: "✕" })
    ] }),
    /* @__PURE__ */ f.jsxs("section", { style: { padding: 12, display: "grid", gap: 8 }, children: [
      /* @__PURE__ */ f.jsxs("label", { style: { display: "grid", gap: 4 }, children: [
        /* @__PURE__ */ f.jsx("span", { children: "File name" }),
        /* @__PURE__ */ f.jsx(
          "input",
          {
            "aria-label": "File name",
            type: "text",
            value: c,
            onChange: re,
            placeholder: "graph"
          }
        ),
        /* @__PURE__ */ f.jsxs("div", { "aria-live": "polite", style: { fontSize: 12, color: "#555" }, children: [
          "Will save as: ",
          /* @__PURE__ */ f.jsx("code", { children: _ })
        ] })
      ] }),
      h && /* @__PURE__ */ f.jsx("div", { role: "alert", "aria-live": "assertive", style: { color: "#b00" }, children: h })
    ] }),
    /* @__PURE__ */ f.jsxs("footer", { style: At.footer, children: [
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: e, children: "Cancel" }),
      /* @__PURE__ */ f.jsx("button", { type: "button", disabled: !R || m, onClick: Me, children: m ? /* @__PURE__ */ f.jsx(Ks, {}) : "Save" }),
      O && /* @__PURE__ */ f.jsx(
        "button",
        {
          type: "button",
          "aria-label": "Save to Supabase",
          disabled: x,
          onClick: Q,
          children: x ? /* @__PURE__ */ f.jsx(Ks, {}) : "Save to Supabase"
        }
      )
    ] })
  ] }) });
}
const At = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" },
  dialog: { background: "#fff", width: 520, maxWidth: "95vw", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.3)" },
  header: { display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #eee" },
  footer: { display: "flex", gap: 8, justifyContent: "flex-end", padding: 12, borderTop: "1px solid #eee" }
};
function sc(s) {
  return /* @__PURE__ */ f.jsx(ia, { ...s });
}
export {
  ta as AssetBrowser,
  na as AssetBrowserTabs,
  tc as OpenGraphDialog,
  rc as SaveGraphDialog,
  sa as ServerTab,
  ia as TabbedAssetBrowser,
  ec as UserProvider,
  sc as default,
  En as useUserId
};
//# sourceMappingURL=index.esm.js.map
