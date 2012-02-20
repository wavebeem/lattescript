var fs     = require("fs");
var util   = require("util");
var parser = require("./parser").parser;
var lexer  = require("./lexer").lexer;

var DEBUG = true;
var DEBUG_PREFIX = "DEBUG: ";

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

debug("[Abstract Syntax Tree]");
debug(to_json(ast));

var funcs = {};
var procs = {};

procs.print = {
    type: "PROC",
    name: {type: "ID", value: "print"},
    args: [{type: "ID", value: "str"}],
    vars: {},
    body: [{
        type: "JS",
        js: function() {
            console.log("PRINT:", helpers.textify(get_var("str")));
        }
    }]
};

var call_stack = [];

function current_call() {
    return call_stack[call_stack.length - 1];
}

function get_var(id) {
    var vars = current_call().vars;
    if (id in vars) {
        return vars[id];
    }
    else {
        throw "up";
    }
}

var dispatch = {};

dispatch.BLOCK = function(node) {
    for (var n = 0; n < node.length; n++) {
        run(node[n]);
    }
};

dispatch.JS = function(node) {
    node.js();
}

dispatch.WHILE = function(node) {
    debug("While loop");
    for (var n = 0; n < node.statements.length; n++) {
        run(node.statements[n]);
    }
};

dispatch.PROC_CALL = function(node) {
    debug("Calling procedure:", node.name.value);
    if (procs[node.name.value]) {
        call_proc(procs[node.name.value], node.args);
    }
    else {
        debug("Throwing up");
        throw "up";
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

    debug("call_proc(node, args) where args =", node.args);

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    var vars = {};
    for (var i = 0; i < args.length; i++) {
        vars[bound_proc.args[i].value] = evaluate(args[i]);
    }
    bound_proc.vars = vars;

    call_stack.push(bound_proc);
    //debug("call stack =", to_json(call_stack));
    //debug("call args =", to_json(bound_proc.args));
    for (var i = 0; i < bound_proc.body.length; i++) {
        run(bound_proc.body[i]);
    }
    call_stack.pop();
}

var ops = {};

ops.CAT = function(a, b) {
    return {type: "TEXT", value: ("" + helpers.textify(a) + helpers.textify(b))};
};

var helpers = {};
helpers.textify = function(x) {
    // XXXYYYZZZ
    var t = x.type;
    if (t === "TEXT") return x.value;
    if (t === "BOOL") return x.value? "true": "false";
    if (t === "NUM")  return "" + x.value;
    if (t === "NOTHING") return "nothing";

    throw "Couldn't stringify";
};

function evaluate(node) {
    var atomic_types = {
        ID:      true,
        BOOL:    true,
        NUM:     true,
        TEXT:    true,
        LIST:    true,
        NOTHING: true
    };

    if (node.type.type === "OP") {
        // Apply the operation
        var t = node.type.value;
        if (t === "CAT") return ops.CAT(evaluate(node.left), evaluate(node.right));

        throw "Unsupported operation";
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

    throw "Couldn't evaluate";
}

dispatch.PROC_DEF = function(node) {
    debug("Defining procedure:", node.name.value);
    procs[node.name.value] = {
        name: node.name,
        args: node.args,
        vars: node.vars,
        body: node.body
    };
};

dispatch.FUNC_DEF = function(node) {
    debug("Defining function:", node.name.value);
    var no_return_error = {
        type: "PROC_CALL",
        name: {type: "ID", value: "error"},
        args: ["Reached the end of a function without returning a value."]
    };
    procs[node.name.value] = {
        name: node.name,
        args: node.args,
        vars: node.vars,
        body: node.body.concat(no_return_error)
    };
},

dispatch.SUB_DEFS = function(node) {
    for (var n = 0; n < node.sub_defs.length; n++) {
        run(node.sub_defs[n]);
    }
};

dispatch.NOOP = function(node) {
};

function run(node) {
    if (node && dispatch[node.type]) {
        dispatch[node.type](node);
    }
    else {
        debug("No rule defined to run:", node);
    }
};

run(ast);

debug("[Program Execution]");
if (procs.main) {
    run({type: "PROC_CALL", name: {type: "ID", value: "main"}, args: []});
}
else {
    debug("Please define a main procedure.");
}
