var fs     = require("fs");
var util   = require("util");
var parser = require("./parser").parser;
var lexer  = require("./lexer").lexer;

var DEBUG = false;
var DEBUG_PREFIX = "DEBUG: ";

var ops     = {};
var helpers = {};

function debug() {
    if (DEBUG) {
        process.stdout.write(DEBUG_PREFIX);
        console.log.apply(console, arguments);
    }
}

var code = fs.readFileSync("test.latte", "utf8");

parser.yy = {
    magic: "MAGIC!"
};

parser.lexer = lexer;
parser.yy.parseError = function(err, hash) {
    debug("err =", err);
    debug("hash =", hash);
};
var ast = parser.parse(code);

function to_json(obj) {
    return JSON.stringify(obj, null, 2);
}

console.log("[Abstract Syntax Tree]");
console.log(to_json(ast));

var funcs = {};
var procs = {};

procs.print = {
    type: "PROC",
    name: "print",
    args: ["str"],
    vars: {},
    body: [{
        type: "JS",
        js: function() {
            var str = get_var("str");
            if (DEBUG) {
                console.log("PRINTPRINTPRINT>>>:", helpers.textify(str));
            }
            else {
                console.log(helpers.textify(str));
            }
        }
    }]
};

procs.append = {
    type: "PROC",
    name: "append",
    args: ["list", "item"],
    vars: {},
    body: [{
        type: "JS",
        js: function() {
            var list = get_var("list");
            var item = get_var("item");
            debug("APPENDING WITH LIST =", list, "ITEM =", item);
            if (list.type === "LIST") {
                list.values.push(item);
            }
            else {
                helpers.error("First argument to append must be a list");
            }
        }
    }]
};

var call_stack = [];

function current_call() {
    return call_stack[call_stack.length - 1];
}

function get_var(id) {
    var vars = current_call().vars;
    //debug("Current vars =", vars);
    if (id in vars) {
        return vars[id];
    }
    else {
        debug("current sub:", current_call().name);
        debug("current variables:", vars);
        helpers.error("Unable to get value of undeclared variable:", id);
    }
}

function set_var(id, val) {
    var vars = current_call().vars;
    if (id in vars) {
        vars[id] = val;
    }
    else {
        debug("current variables:", vars);
        helpers.error("Unable to set value of undeclared variable:", id);
    }
}

var dispatch = {};

dispatch.BLOCK = function(node) {
    for (var n = 0; n < node.body.length; n++) {
        run(node.body[n]);
    }
};

dispatch.JS = function(node) {
    node.js();
}

dispatch.WHILE = function(node) {
    debug("While loop");
    var cond = evaluate(node.condition);
    if (cond.type !== "BOOL") {
        helpers.error("Loop conditional must be true or false");
    }

    while (cond.value) {
        run({type: "BLOCK", body: node.statements});

        cond = evaluate(node.condition);
        if (cond.type !== "BOOL") {
            helpers.error("Loop conditional must be true or false");
        }
    }
};

dispatch.UNTIL = function(node) {
    debug("While loop");
    var cond = evaluate(node.condition);
    if (cond.type !== "BOOL") {
        helpers.error("Loop conditional must be true or false");
    }

    while (! cond.value) {
        run({type: "BLOCK", body: node.statements});

        cond = evaluate(node.condition);
        if (cond.type !== "BOOL") {
            helpers.error("Loop conditional must be true or false");
        }
    }
};

dispatch.PROC_CALL = function(node) {
    if (procs[node.name]) {
        debug("Calling procedure:", node.name);
        call_proc(procs[node.name], node.args);
    }
    else {
        helpers.error("Procedure", node.name, "is undefined");
    }
};

function call_proc(node, args) {
    var bound_proc = {
        type: "PROC",
        name: node.name,
        body: node.body,
        args: node.args,
        vars: {}
    };

    //debug("call_proc(node, args) where args =", node.args);

    if (node.args.length != args.length) {
        helpers.error("Incorrect number of arguments to", node.name);
    }

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    var vars = {};
    for (var i = 0; i < args.length; i++) {
        vars[bound_proc.args[i]] = evaluate(args[i]);
    }
    // Insert the "with" variables into the vars mapping,
    // but leave them "undefind" by mapping them to null.
    for (var i = 0; i < node.vars.length; i++) {
        vars[node.vars[i]] = {type: "NOTHING"};
    }
    bound_proc.vars = vars;

    call_stack.push(bound_proc);
    debug("PUSHING", node.name, "ONTO CALL STACK");
    debug("CURRENT CALL =", current_call().name);
    //debug("call stack =", to_json(call_stack));
    //debug("call args =", to_json(bound_proc.args));
    //debug("current vars =", current_call().vars);
    for (var i = 0; i < bound_proc.body.length; i++) {
        try {
            //debug("<<<RUNNING>>>", to_json(bound_proc.body[i]));
            //debug("<<<RUNNING>>>", pretty_print(bound_proc.body[i]));
            run(bound_proc.body[i]);
        }
        catch (e) {
            if (e.type === "RETURN") {
            }
            else {
                throw e;
            }
        }
    }
    call_stack.pop();
}

dispatch.FUNC_CALL = function(node) {
    if (funcs[node.name]) {
        debug("Calling function:", node.name);
        return call_func(funcs[node.name], node.args);
    }
    else {
        helpers.error("Function", node.name, "is undefined");
    }
};

function call_func(node, args) {
    var bound_func = {
        type: "FUNC",
        name: node.name,
        body: node.body,
        args: node.args,
        vars: {}
    };

    debug("call_proc(node, args) where");
    debug("node.args =", node.args);
    debug("args =", args);
    debug("node.vars =", node.vars);

    if (node.args.length != args.length) {
        helpers.error("Incorrect number of arguments to", node.name);
    }

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    var vars = {};
    for (var i = 0; i < node.args.length; i++) {
        debug("BINDING", node.args[i], "TO",  evaluate(args[i]));
        vars[node.args[i]] = evaluate(args[i]);
    }
    // Insert the "with" variables into the vars mapping,
    // but leave them "undefind" by mapping them to null.
    for (var i = 0; i < node.vars.length; i++) {
        vars[node.vars[i]] = {type: "NOTHING"};
    }
    bound_func.vars = vars;

    call_stack.push(bound_func);
    debug("PUSHING", node.name, "ONTO CALL STACK");
    debug("CURRENT CALL =", current_call().name);
    //debug("call stack =", to_json(call_stack));
    //debug("call args =", to_json(bound_proc.args));
    //debug("current vars =", current_call().vars);
    for (var i = 0; i < bound_func.body.length; i++) {
        try {
            run(bound_func.body[i]);
        }
        catch (e) {
            if (e.type === "RETURN") {
                call_stack.pop();
                return e.value;
            }
            else {
                throw e;
            }
        }
    }

    helpers.error("Function ended without returning a value");
}

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

helpers.list_eq = function(a, b) {
    if (a.values.length !== b.values.length) {
        return false;
    }

    for (var i = 0; i < a.values.length; i++) {
        var eq = ops.EQ(a.values[i], b.values[i]);
        if (! eq) {
            return false;
        }
    }

    return true;
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

helpers.error = function() {
    var msg = [].join.call(arguments, " ");
    throw {type: "ERROR", message: msg};
}

helpers.textify = function(x, parent_lists) {
    // This variable helps to avoid printing circular lists forever.
    parent_lists = parent_lists === undefined? []: parent_lists;
    try {
        debug("Trying to textify", x);
        var t = x.type;
        if (t === "TEXT"   ) return x.value;
        if (t === "BOOL"   ) return x.value? "true": "false";
        if (t === "NUM"    ) return "" + x.value;
        if (t === "LIST"   ) return helpers.textify_list(x.values, parent_lists.concat(x));
        if (t === "NOTHING") return "nothing";
        throw "up";
    }
    catch (e) {
        helpers.error("Couldn't textify the", t);
    }
};

helpers.textify_list = function(xs, parent_lists) {
    var ts = [];
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        if (x.type === "LIST") {
            if (parent_lists.indexOf(x) >= 0) {
                ts.push("[...]");
            }
            else {
                ts.push(helpers.textify(x, parent_lists.concat(x)));
            }
        }
        else {
            if (x.type === "TEXT") {
                ts.push('"' + helpers.unescape(x.value) + '"');
            }
            else {
                ts.push(helpers.textify(x, parent_lists));
            }
        }
    }

    return "[" + ts.join(", ") + "]";
};

helpers.unescape = function(str) {
    return (str
        .replace(/\\/, "\\\\")
        .replace(/\n/, "\\n")
        .replace(/\"/, "\\\"")
    );
}

helpers.mutable_list_copy = function(node) {
    debug("attempting to make mutable_list_copy of:", node);

    if (node.type !== "LIST" || !node.immutable) return node;

    var result = {type: "LIST", values: []};

    for (var i = 0; i < node.values.length; i++) {
        var value = node.values[i];

        result.values[i] = evaluate(value);
    }

    return result;
}

function pretty_expr(node) {
    var ops = {
        CAT: "~",
        EXP: "^",
        ADD: "+",
        SUB: "-",
        MUL: "*",
        DIV: "/",
        AND: "and",
        OR:  "or",
        AT:  "@",
        EQ:  "=",
        LT:  "<",
        GT:  ">",
        LE:  "<=",
        GE:  ">="
    }

    var uops = {
        LEN: "#",
        POS: "+",
        NEG: "-"
    }

    if (node.type === "OP") {
        var l  = pretty_expr(node.left);
        var r  = pretty_expr(node.right);
        var op = ops[node.op];
        return ["(", l, " ", op, " ", r, ")"].join("");
    }
    else if (uops[node.type]) {
        var v = pretty_expr(node.arg);
        return ["(", uops[node.type], v, ")"].join("");
    }
    else if (node.type === "ID") {
        return node.value;
    }
    else if (node.type === "TEXT") {
        return '"' + helpers.textify(node) + '"';
    }
    else if (node.type === "ASSIGN") {
        return [pretty_expr(node.left), ":=", pretty_expr(node.right)].join(" ");
    }
    else {
        return helpers.textify(node);
    }
}

function pretty_print(node) {
    debug(pretty_expr(node));
}

function evaluate(node) {
    var atomic_types = {
        ID:      true,
        BOOL:    true,
        NUM:     true,
        TEXT:    true,
        LIST:    true,
        NOTHING: true
    };

    //pretty_print(node);

    if (node.type === "LIST" && node.immutable) {
        return helpers.mutable_list_copy(node);
    }
    else if (node.type === "LEN") {
        var val = evaluate(node.arg);

        if (val.type === "LIST") {
            return {type: "NUM", value: val.values.length};
        }
        else {
            helpers.error("Unable to determine the length of a", val.type);
        }
    }
    else if (node.type === "NEG") {
        var val = evaluate(node.arg);
        if (val.type === "NUM") {
            return {type: "NUM", value: -val.value};
        }
        else {
            helpers.error("Cannot negate a", val.type);
        }
    }
    else if (node.type === "POS") {
        var val = evaluate(node.arg);
        if (val.type === "NUM") {
            return val;
        }
        else {
            helpers.error("Cannot apply unary plus to a", val.type);
        }
    }
    else if (node.type === "OP") {
        // Apply the operation
        var t = node.op;
        var e = evaluate;

        // Implement short-circuit behavior for AND and OR
        if (t === "AND") { var l = e(node.left); return l && e(node.right) }
        if (t === "OR")  { var l = e(node.left); return l || e(node.right) }

        var l = node.left;
        var r = node.right;
        // FIXME: Fix this later to short circuit AND and OR?
        if (t in ops) return ops[t](e(l), e(r));

        helpers.error("Unsupported operation:", t);
    }
    else if (node.type === "FUNC_CALL") {
        debug("Trying to do FUNC_CALL(node) where node =", node);
        return run(node);
    }
    // If the node's type is atomic
    else if (atomic_types[node.type]) {
        if (node.type === "ID") {
            return get_var(node.value);
        }
        // Not a variable, just return the value
        else {
            return node;
        }
    }

    helpers.error("Couldn't evaluate");
}

dispatch.PROC_DEF = function(node) {
    debug("Defining procedure:", node.name);
    procs[node.name] = {
        name: node.name,
        args: node.args,
        vars: node.vars,
        body: node.body
    };
};

dispatch.RETURN = function(node) {
    debug("RETURNING", node.value);
    throw {type: "RETURN", value: evaluate(node.value)};
}

dispatch.FUNC_DEF = function(node) {
    debug("Defining function:", node.name);
    funcs[node.name] = {
        name: node.name,
        args: node.args,
        vars: node.vars,
        body: node.body
    };
},

dispatch.SUB_DEFS = function(node) {
    for (var n = 0; n < node.sub_defs.length; n++) {
        run(node.sub_defs[n]);
    }
};

dispatch.SET = function(node) {
    var left  = evaluate(node.left).values;
    var idx   = evaluate(node.at).value;
    var right = evaluate(node.right);

    left[idx - 1] = right;
}


dispatch.ASSIGN = function(node) {
    // Simple assignment
    if (node.left.type === "ID") {
        var name = node.left.value;
        var val  = evaluate(node.right);

        debug("Setting", name, "to", val);

        set_var(name, val);
    }
    else {
        helpers.error("Unable to assign:", to_json(node));
    }
};

dispatch.IF = function(node) {
    var val = evaluate(node.condition);
    if (val.type === "BOOL") {
        if (val.value) {
            run({type: "BLOCK", body: node.body});
        }
        else if ("else" in node) {
            run(node["else"]);
        }
    }
    else {
        helpers.error("If condition shoud be true or false.");
    }
}

dispatch.NOOP = function(node) {
};

function run(node) {
    if (node && dispatch[node.type]) {
        return dispatch[node.type](node);
    }
    else {
        helpers.error("No rule defined to run:", to_json(node));
    }
};

run(ast);

function show_stack_trace() {
    for (var i = 0; i < call_stack.length; i++) {
        var map   = {PROC: "procedure", FUNC: "function"};
        var call  = call_stack[i];
        var type  = map[call.type] || "<oops>";
        var line  = call.lineno === undefined? "???": call.lineno;
        console.log("  at line", line, "in", type, call.name);
    }
}

console.log("[Program Execution]");
console.log();
if (procs.main) {
    try {
        run({type: "PROC_CALL", name:"main", args: []});
    }
    catch (e) {
        if (e.type === "ERROR") {
            console.log("Error:", e.message);
            show_stack_trace();
        }
        else {
            throw e;
        }
    }
}
else {
    debug("Please define a main procedure.");
}
