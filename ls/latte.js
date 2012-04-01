ls.latte = (function(code) {
var error = ls.helpers.error;
parser.lexer = ls.lexer;
parser.yy.parseError = function(err, hash) {
    debug("err =", err);
    debug("hash =", hash);
};

var call_stack = [];

var current_call = function() {
    return call_stack[call_stack.length - 1];
}

var get_var = function(id) {
    var vars = current_call().vars;
    if (id in vars)
        return vars[id];

    debug("current sub:", current_call().name);
    debug("current variables:", vars);
    error("Unable to get value of undeclared variable:", id);
}

var set_var = function(id, val) {
    var vars = current_call().vars;
    if (id in vars)
        vars[id] = val;

    debug("current variables:", vars);
    error("Unable to set value of undeclared variable:", id);
}

var evaluate = function eval(node) {
    var atomic_types = {
        ID:      true,
        BOOL:    true,
        NUM:     true,
        TEXT:    true,
        LIST:    true,
        NOTHING: true
    };

    if (node && node.type in eval)
        return eval[node.type](node);

    return node;
}

evaluate.LIST = function(node) {
    var copy = ls.helpers.mutable_list_copy;

    return node.immutable? copy(node): node;
};

evaluate.LEN = function(node) {
    var val = evaluate(node.arg);

    if (val.type === "LIST")
        return {type: "NUM", value: val.values.length};

    error("Unable to determine the length of a", val.type);
};

evaluate.NEG = function(node) {
    var val = evaluate(node.arg);

    if (val.type === "NUM")
        return {type: "NUM", value: -val.value};

    error("Cannot negate a", val.type);
};

evaluate.POS = function(node) {
    var val = evaluate(node.arg);

    if (val.type === "NUM")
        return val;

    error("Cannot apply unary plus to a", val.type);
};

evaluate.OP = function(node) {
    return ls.ops.apply(node.op, node.left, node.right);
}

evaluate.FUNC_CALL = function(node) {
    return run(node);
};

evaluate.ID = function(node) {
    return get_var(node.value);
};

var show_stack_trace = function() {
    var i = call_stack.length;
    console.log("Call Stack [");
    while (i--) {
        var map   = {PROC: "procedure", FUNC: "function "};
        var call  = call_stack[i];
        var type  = map[call.type] || "<oops>";
        var line  = call.lineno === undefined? "???": call.lineno;
        //console.log("  at line", line, "in", type, call.name);
        console.log("  in", type, call.name);
    }
    console.log("]");
};

compile = function(code) {
    var ast = parser.parse(code);
    console.log(ls.helpers.to_json(ast));
    COOL_AST = ast;
    ls.dispatch.run(ast);
    ls.dispatch.run({type: "PROC_CALL", name:"main", args: []});
};

return {evaluate: evaluate, compile: compile};
})();
