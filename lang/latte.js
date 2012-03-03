compile = (function(code) {
//var fs     = require("fs");
//var util   = require("util");
//var parser = require("./parser").parser;
//var lexer  = require("./lexer").lexer;

DEBUG = false;
DEBUG_PREFIX = "DEBUG: ";

debug = function() {
    if (DEBUG) {
        process.stdout.write(DEBUG_PREFIX);
        console.log.apply(console, arguments);
    }
}

//var code = fs.readFileSync("test.latte", "utf8");

parser.yy = {
    magic: "MAGIC!"
};

parser.lexer = lexer;
parser.yy.parseError = function(err, hash) {
    debug("err =", err);
    debug("hash =", hash);
};

to_json = function(obj) {
    return JSON.stringify(obj, null, 2);
}

call_stack = [];

current_call = function() {
    return call_stack[call_stack.length - 1];
}

get_var = function(id) {
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

set_var = function(id, val) {
    var vars = current_call().vars;
    if (id in vars) {
        vars[id] = val;
    }
    else {
        debug("current variables:", vars);
        helpers.error("Unable to set value of undeclared variable:", id);
    }
}

pretty_expr = function(node) {
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

pretty_print = function(node) {
    debug(pretty_expr(node));
}

evaluate = function(node) {
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

function show_stack_trace() {
    for (var i = 0; i < call_stack.length; i++) {
        var map   = {PROC: "procedure", FUNC: "function"};
        var call  = call_stack[i];
        var type  = map[call.type] || "<oops>";
        var line  = call.lineno === undefined? "???": call.lineno;
        console.log("  at line", line, "in", type, call.name);
    }
}

main = function() {
    var ast = parser.parse(code);

    console.log("[Abstract Syntax Tree]");
    console.log(to_json(ast));

    run(ast);

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
}

return main;
})
