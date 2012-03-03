var ops = {};

ops.CAT = function(a, b) {
    return {type: "TEXT", value: (helpers.textify(a) + helpers.textify(b))};
};

var math_op_maker = function(word, f) { return function(a, b) {
    if (a.type === "NUM" && b.type === "NUM") {
        debug("DOING>>>", a.value, word, b.value);
        return {type: "NUM", value: f(a.value, b.value)};
    }
    else {
        helpers.error("Cannot", word, "arguments: incorrect types");
    }
}};

var exp = Math.pow;
ops.ADD = math_op_maker("add",          function(a, b) { return a + b });
ops.SUB = math_op_maker("subtract",     function(a, b) { return a - b });
ops.MUL = math_op_maker("multiply",     function(a, b) { return a * b });
ops.DIV = math_op_maker("divide",       function(a, b) { return a / b });
ops.EXP = math_op_maker("exponentiate", function(a, b) { return exp(a, b) });

var bool_op_maker = function(word, f) { return function(a, b) {
    if (a.type === "BOOL" && b.type === "BOOL") {
        debug("DOING>>>", a.value, word, b.value);
        return {type: "BOOL", value: f(a.value, b.value)};
    }
    else {
        helpers.error("Cannot", word, "arguments: incorrect types");
    }
}};

ops.AND = bool_op_maker("and", function(a, b) { return a && b; });
ops.OR  = bool_op_maker("or",  function(a, b) { return a || b; });

var cmp_op_maker = function(word, f) { return function(a, b) {
    if (a.type === b.type) {
        var t = a.type;
        var type_ok = t === "TEXT" || t === "NUM";

        if (! type_ok) {
            helpers.error(word, "not supported for type", t);
        }

        var result = f(a.value, b.value);

        return {type: "BOOL", value: result};
    }
    else {
        helpers.error("Cannot", word, "arguments: incorrect types");
    }
}};

ops.LT = cmp_op_maker("<", function(a, b) { return a <  b; });
ops.GT = cmp_op_maker(">", function(a, b) { return a >  b; });
ops.LE = cmp_op_maker("≤", function(a, b) { return a <= b; });
ops.GE = cmp_op_maker("≥", function(a, b) { return a >= b; });

ops.EQ = function(a, b) {
    if (a.type === b.type) {
        var result;
        if (a.type === "LIST") {
            result = a === b || helpers.list_eq(a, b);
        }
        else {
            result = a.value === b.value;
        }

        return {type: "BOOL", value: result};
    }
    else if (a.type === "NOTHING") {
        return {type: "BOOL", value: b.type === "NOTHING"};
    }
    else if (b.type === "NOTHING") {
        return {type: "BOOL", value: a.type === "NOTHING"};
    }
    else {
        helpers.error("Cannot compare equality for arguments: incorrect types");
    }
};

ops.AT = function(a, b) {
    if (a.type === "LIST" && b.type === "NUM") {
        var n = a.values.length;
        var i = b.value;

        if (1 <= i && i <= n) {
            return a.values[i - 1];
        }
        else {
            helpers.error("Index out of range");
        }
    }
    else {
        helpers.error("Cannot index argument: incorrect types");
    }
};
