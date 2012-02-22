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
            var str = get_var("str");
            console.log("PRINT:", helpers.textify(str));
        }
    }]
};

procs.append = {
    type: "PROC",
    name: {type: "ID", value: "append"},
    args: [{type: "ID", value: "list"}, {type: "ID", value: "item"}],
    vars: {},
    body: [{
        type: "JS",
        js: function() {
            var list = get_var("list");
            var item = get_var("item");
            list.values.push(item);
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
        throw "Unable to get value of undeclared variable";
    }
}

function set_var(id, val) {
    var vars = current_call().vars;
    if (id in vars) {
        vars[id] = val;
    }
    else {
        throw "Unable to set value of undeclared variable";
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

    //debug("call_proc(node, args) where args =", node.args);

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    var vars = {};
    for (var i = 0; i < args.length; i++) {
        vars[bound_proc.args[i].value] = evaluate(args[i]);
    }
    // Insert the "with" variables into the vars mapping,
    // but leave them "undefind" by mapping them to null.
    for (var i = 0; i < node.vars.length; i++) {
        vars[node.vars[i].value] = null;
    }
    bound_proc.vars = vars;

    call_stack.push(bound_proc);
    //debug("call stack =", to_json(call_stack));
    //debug("call args =", to_json(bound_proc.args));
    //debug("current vars =", current_call().vars);
    for (var i = 0; i < bound_proc.body.length; i++) {
        run(bound_proc.body[i]);
    }
    call_stack.pop();
}

dispatch.FUNC_CALL = function(node) {
    debug("Calling function:", node);
    debug("Calling function:", node.name.value);
    if (procs[node.name.value]) {
        return call_func(procs[node.name.value], node.args);
    }
    else {
        debug("Throwing up");
        throw "up";
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

    //debug("call_proc(node, args) where args =", node.args);

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    var vars = {};
    for (var i = 0; i < args.length; i++) {
        vars[bound_func.args[i].value] = evaluate(args[i]);
    }
    // Insert the "with" variables into the vars mapping,
    // but leave them "undefind" by mapping them to null.
    for (var i = 0; i < node.vars.length; i++) {
        vars[node.vars[i].value] = null;
    }
    bound_func.vars = vars;

    call_stack.push(bound_func);
    //debug("call stack =", to_json(call_stack));
    //debug("call args =", to_json(bound_proc.args));
    //debug("current vars =", current_call().vars);
    for (var i = 0; i < bound_func.body.length; i++) {
        var result = undefined;
        try {
            run(bound_func.body[i]);
        }
        catch (e) {
            if (e.type === "RETURN") {
                result = evaluate(e.value);
            }
            else {
                throw "Reached the end of a function without returning a value.";
            }
        }
    }
    call_stack.pop();

    return result;
}

var ops = {};

ops.CAT = function(a, b) {
    return {type: "TEXT", value: (helpers.textify(a) + helpers.textify(b))};
};

ops.ADD = function(a, b) {
    if (a.type === "NUM" && b.type === "NUM") {
        return {type: "NUM", value: a.value + b.value};
    }
    else {
        throw "Cannot add arguments: incorrect types";
    }
};

var helpers = {};
helpers.textify = function(x) {
    debug("Trying to textify", x);
    var t = x.type;
    if (t === "TEXT") return x.value;
    if (t === "BOOL") return x.value? "true": "false";
    if (t === "NUM")  return "" + x.value;
    if (t === "LIST") return helpers.textify_list(x.values);
    if (t === "NOTHING") return "nothing";

    throw "Couldn't stringify";
};

helpers.textify_list = function(xs) {
    var ts = [];
    for (var i = 0; i < xs.length; i++) {
        ts.push(helpers.textify(xs[i]));
    }

    return "[" + ts.join(", ") + "]";
};

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

function evaluate(node) {
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
    else if (node.type.type === "OP") {
        // Apply the operation
        var t = node.type.value;
        var l = node.left;
        var r = node.right;
        var e = evaluate;
        if (t === "CAT") return ops.CAT(e(l), e(r));
        if (t === "ADD") return ops.ADD(e(l), e(r));

        throw "Unsupported operation";
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

dispatch.RETURN = function(node) {
    throw node;
}

dispatch.FUNC_DEF = function(node) {
    debug("Defining function:", node.name.value);
    procs[node.name.value] = {
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


dispatch.ASSIGN = function(node) {
    // Simple assignment
    if (node.left.type === "ID") {
        var name = node.left.value;
        var val  = evaluate(node.right);

        set_var(name, val);
    }
    else if (node.left.type === "LIST") {
        throw "Need to implement list assignment";
    }
    else {
        throw "Unable to assign";
    }
};
dispatch.NOOP = function(node) {
};

function run(node) {
    if (node && dispatch[node.type]) {
        return dispatch[node.type](node);
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
