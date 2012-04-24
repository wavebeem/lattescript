ls.ops = (function() {
var ops = {};

var evaluate = ls.dispatch.evaluate;
var debug    = ls.helpers.debug;
var helpers  = ls.helpers;
var results  = ls.dispatch.results;
var do_later = ls.helpers.do_later;

ops.CAT = function(a, b, c) {
    results.push({type: "TEXT", value: (helpers.textify(a) + helpers.textify(b))});
    do_later(c);
};

var math_op_maker = function(word, f) {
    return function(a, b, c) {
        if (a.type === "NUM" && b.type === "NUM") {
            debug("DOING>>>", a.value, word, b.value);
            results.push({type: "NUM", value: f(a.value, b.value)});
            do_later(c);
        }
        else {
            helpers.error("Cannot", word, "arguments: incorrect types");
        }
    };
};

var exp = Math.pow;
var div = function(a, b) { return Math.floor(a / b); };
var mod = function(a, b) { return ((a % b) + b) % b; };
ops.ADD  = math_op_maker("add",            function(a, b) { return a + b });
ops.SUB  = math_op_maker("subtract",       function(a, b) { return a - b });
ops.MUL  = math_op_maker("multiply",       function(a, b) { return a * b });
ops.DIV  = math_op_maker("divide",         function(a, b) { return a / b });
ops.EXP  = math_op_maker("exponentiate",   function(a, b) { return exp(a, b) });
ops.IDIV = math_op_maker("integer divide", function(a, b) { return div(a, b) });
ops.MOD  = math_op_maker("modulo",         function(a, b) { return mod(a, b) });

var and_or_maker = function(type) {
    var cond;
    if (type === "AND")
        cond = function(x) { return !x };
    else if (type === "OR")
        cond = function(x) { return  x };
    else
        throw new Error("Wrong argument to and_or_maker: " + type);

    return function(a, b, c) {
        evaluate(a, function() {
            var va = results.pop();

            if (va.type !== "BOOL")
                helpers.error("Cannot", type, "arguments: incorrect types");

            if (cond(va.value)) {
                results.push(va);
                do_later(c);
            }
            else {
                evaluate(b, function() {
                    var vb = results.pop();
                    if (vb.type !== "BOOL") {
                        helpers.error("Cannot", type, "arguments: incorrect types");
                    }
                    else {
                        results.push(vb);
                        do_later(c);
                    }
                });
            }
        });
    };
};

ops.AND = and_or_maker("AND");
ops.OR  = and_or_maker("OR");

var cmp_op_maker = function(word, f) {
    return function(a, b, c) {
        if (a.type === b.type) {
            var t = a.type;
            var type_ok = t === "TEXT" || t === "NUM";

            if (! type_ok)
                helpers.error(word, "not supported for type", t);

            var result = f(a.value, b.value);

            results.push({type: "BOOL", value: result});
            do_later(c);
        }
        else {
            helpers.error("Cannot", word, "arguments: incorrect types");
        }
    };
};

ops.LT = cmp_op_maker("<",  function(a, b) { return a <  b; });
ops.GT = cmp_op_maker(">",  function(a, b) { return a >  b; });
ops.LE = cmp_op_maker("<=", function(a, b) { return a <= b; });
ops.GE = cmp_op_maker(">=", function(a, b) { return a >= b; });

ops.EQ = (function() {
    var list_eq = function(a, b, c) {
        if (a.values.length !== b.values.length) {
            results.push({type: "BOOL", value: false});
            do_later(c);
        }
        else {
            list_eq_helper(a.values, b.values, c);
        }
    };

    var list_eq_helper = function list_eq_helper(as, bs, c) {
        if (as.length === 0 && bs.length === 0) {
            results.push({type: "BOOL", value: true});
            do_later(c);
        }
        else {
            EQ(as[0], bs[0], function() {
                var eq = results.pop().value; // this is a wrapped bool...

                if (! eq) {
                    results.push({type: "BOOL", value: false});
                    do_later(c);
                }
                else {
                    list_eq_helper(as.slice(1), bs.slice(1), c);
                }
            });
        }
    };

    var EQ = function(a, b, c) {
        debug("a = b where...");
        debug("a is", a);
        debug("b is", b);
        if (a.type === b.type) {
            var result;
            if (a.type === "LIST") {
                if (a === b) {
                    results.push({type: "BOOL", value: true});
                    do_later(c);
                }
                else {
                    list_eq(a, b, c);
                }
            }
            else {
                result = a.value === b.value;
                results.push({type: "BOOL", value: result});
                do_later(c);
            }
        }
        else if (a.type === "NOTHING") {
            results.push({type: "BOOL", value: b.type === "NOTHING"});
            do_later(c);
        }
        else if (b.type === "NOTHING") {
            results.push({type: "BOOL", value: a.type === "NOTHING"});
            do_later(c);
        }
        else {
            helpers.error("Cannot compare equality for arguments: incorrect types");
        }
    };

    return EQ;
})();

ops.AT = function(a, b, c) {
    if (a.type === "LIST" && b.type === "NUM") {
        var n = a.values.length;
        var i = b.value;

        if (isNaN(i)) {
            helpers.error("Cannot index argument with NaN");
            return;
        }

        if (Math.abs(i) === Infinity) {
            helpers.error("Cannot index argument with infinity");
            return;
        }

        if (1 <= i && i <= n) {
            var val = a.values[i - 1];

            if (val === undefined) {
                helpers.error("Cannot index argument with", i);
            }
            else {
                results.push(val);
                do_later(c);
            }
        }
        else {
            helpers.error("Index out of range");
        }
    }
    else {
        helpers.error("Cannot index argument: incorrect types");
    }
};

var apply_op = function(op, l, r, c) {
    if (op in ops) {
        debug("Trying to apply", op);
        // Pass unevaluated nodes so AND and OR can short-circuit.
        if (op === "AND" || op === "OR") {
            ops[op](l, r, c);
        }
        else {
            evaluate(l, function() {
                var el = results.pop();
                evaluate(r, function() {
                    var er = results.pop();
                    ops[op](el, er, c);
                });
            });
        }
    }
    else {
        helpers.error("Unsupported operation:", t);
    }
}

return {apply_op: apply_op};
})();
