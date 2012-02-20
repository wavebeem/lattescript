var fs     = require("fs");
var util   = require("util");
var parser = require("./parser").parser;
var lexer  = require("./lexer").lexer;

var DEBUG = true;

function debug() {
    if (DEBUG) {
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

debug("[Abstract Syntax Tree]");
debug(JSON.stringify(ast, null, 2));

var funcs = {};
var procs = {};

procs.print = {
    type: "PROC",
    name: {type: "ID", value: "print"},
    args: [{type: "ID", value: "str"}],
    vars: [],
    body: [{
        type: "JS",
        js: function() {
            console.log("Hello, World!");
        }
    }]
};

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
        name: node.name,
        body: node.body,
        args: {}
    };

    for (var i = 0; i < args.length; i++) {
        var obj = {};
        obj[node.args[i]] = evaluate(args[i]);

        bound_proc.args[i] = obj;
    }

    for (var i = 0; i < bound_proc.body.length; i++) {
        run(bound_proc.body[i]);
    }
}

function evaluate(node) {
    if (node.type === "OP") {
        // TODO
        return node
    }

    return node;
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
