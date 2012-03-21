compile = (function(code) {
//var fs     = require("fs");
//var util   = require("util");
//var parser = require("./parser").parser;
//var lexer  = require("./lexer").lexer;

DEBUG = true;
DEBUG_PREFIX = "DEBUG: ";

debug = function() {
    if (DEBUG) {
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

evaluate = function(node) {
    var atomic_types = {
        ID:      true,
        BOOL:    true,
        NUM:     true,
        TEXT:    true,
        LIST:    true,
        NOTHING: true
    };

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
        var l = node.left;
        var r = node.right;

        if (t in ops) {
            // Pass unevaluated nodes so AND and OR can short-circuit.
            if (t === "AND" || t === "OR")
                e = helpers.identity;

            return ops[t](e(l), e(r));
        }

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

show_stack_trace = function() {
    var i = call_stack.length;
    console.log("Call Stack [");
    while (i--) {
        var map   = {PROC: "procedure", FUNC: "function "};
        var call  = call_stack[i];
        var type  = map[call.type] || "<oops>";
        var line  = call.lineno === undefined? "???": call.lineno;
        console.log("  at line", line, "in", type, call.name);
    }
    console.log("]");
};

main = function() {
    var ast = parser.parse(code);
    console.log(to_json(ast));
    run(ast);
    run({type: "PROC_CALL", name:"main", args: []});
};

return main;
})
