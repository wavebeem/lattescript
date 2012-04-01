ls.dispatch = (function() {
var dispatch = {};
var procs = {};
var funcs = {};

var debug = ls.helpers.debug;
var error = ls.helpers.error;

var clear = function() {
    procs = {};
    funcs = {};
};

var define = function(sub) {
    var table = {PROC: procs, FUNC: funcs};
    table[sub.type][sub.name] = sub;
};

var call_stack = (function() {
    var stack = [];

    function peek() { return stack[stack.length - 1] }
    function pop()  { return stack.pop() }

    function push(x) { stack.push(x) }

    function trace() {
        var i = stack.length;
        console.log("Call Stack [");
        while (i--) {
            var map   = {PROC: "procedure", FUNC: "function "};
            var call  = stack[i];
            var type  = map[call.type] || "<oops>";
            var line  = call.lineno === undefined? "???": call.lineno;
            //console.log("  at line", line, "in", type, call.name);
            console.log("  in", type, call.name);
        }
        console.log("]");
    }

    function get_var(id) {
        var vars = peek().vars;
        if (id in vars)
            return vars[id];

        debug("current variables:", vars);
        error("Unable to get value of undeclared variable:", id);
    }

    function set_var(id, val) {
        var vars = peek().vars;
        if (id in vars)
            vars[id] = val;

        debug("current variables:", vars);
        error("Unable to set value of undeclared variable:", id);
    }

    return {
        get_var: get_var,
        set_var: set_var,
        trace:   trace,
        peek:    peek,
        push:    push,
        pop:     pop
    };
})();

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
        error("Loop conditional must be true or false");
    }

    while (cond.value) {
        run({type: "BLOCK", body: node.statements});

        cond = evaluate(node.condition);
        if (cond.type !== "BOOL") {
            error("Loop conditional must be true or false");
        }
    }
};

dispatch.UNTIL = function(node) {
    debug("While loop");
    var cond = evaluate(node.condition);
    if (cond.type !== "BOOL") {
        error("Loop conditional must be true or false");
    }

    while (! cond.value) {
        run({type: "BLOCK", body: node.statements});

        cond = evaluate(node.condition);
        if (cond.type !== "BOOL") {
            error("Loop conditional must be true or false");
        }
    }
};

dispatch.FOR_RANGE = function(node) {
    var begin = evaluate(node.from);
    var end   = evaluate(node.to);
    var step  = evaluate(node.by);

    if (begin.type !== "NUM"
    ||  end  .type !== "NUM"
    ||  step .type !== "NUM") {
        error("For-loop indices must be numbers!");
    }

    var var_name = node["var"].value;

    if (step.value === 0) {
        error("Step size cannot be 0");
    }

    if (step.value > 0) {
        for (var i = begin.value; i <= end.value; i += step.value) {
            set_var(var_name, {type: "NUM", value: i});
            run({type: "BLOCK", body: node.statements});
        }
    }
    else {
        for (var i = begin.value; i >= end.value; i += step.value) {
            set_var(var_name, {type: "NUM", value: i});
            run({type: "BLOCK", body: node.statements});
        }
    }
}

dispatch.FOR_EACH = function(node) {
    var list = evaluate(node.list);

    var var_name = node["var"].value;

    if (list.type === "LIST") {
        // Copy the list so we don't loop forever if the loop body modifies the list
        list = list.values.slice(0);

        for (var n = 0; n < list.length; n++) {
            set_var(var_name, list[n]);
            run({type: "BLOCK", body: node.statements});
        }
    }
    else if (list.type === "TEXT") {
        var text = list;
        for (var n = 0; n < text.value.length; n++) {
            set_var(var_name, {type: "TEXT", value: text.value[n]});
            run({type: "BLOCK", body: node.statements});
        }
    }
    else {
        error("Foreach loop only works on text and lists");
    }
}

dispatch.PROC_CALL = function(node) {
    if (procs[node.name]) {
        debug("Calling procedure:", node.name);
        call_proc(procs[node.name], node.args);
    }
    else {
        error("Procedure", node.name, "is undefined");
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
        error("Incorrect number of arguments to", node.name);
    }

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    var vars = {};
    for (var i = 0; i < args.length; i++) {
        vars[bound_proc.args[i]] = evaluate(args[i]);
    }
    // Insert the "with" variables into the vars mapping,
    // but leave them "undefined" by mapping them to null.
    for (var i = 0; i < node.vars.length; i++) {
        vars[node.vars[i]] = {type: "NOTHING"};
    }
    bound_proc.vars = vars;

    debug("PUSHING", node.name, "ONTO CALL STACK");
    call_stack.push(bound_proc);
    for (var i = 0; i < bound_proc.body.length; i++) {
        try {
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
    debug("POPPING THE CALL STACK");
    call_stack.pop();
}

dispatch.FUNC_CALL = function(node) {
    if (funcs[node.name]) {
        debug("Calling function:", node.name);
        return call_func(funcs[node.name], node.args);
    }
    else {
        error("Function", node.name, "is undefined");
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
        error("Incorrect number of arguments to", node.name);
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

    error("Function ended without returning a value");
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
    if (node.left.type === "ID") {
        var name = node.left.value;
        var val  = evaluate(node.right);

        debug("Setting", name, "to", val);

        set_var(name, val);
    }
    else {
        error("Unable to assign:", to_json(node));
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
        error("If condition shoud be true or false.");
    }
};

dispatch.NOOP = function(node) {};

function run(node) {
    if (node && dispatch[node.type])
        return dispatch[node.type](node);

    error("No rule defined to run:", to_json(node));
}

return {
    call_stack: call_stack,
    evaluate: evaluate,
    define: define,
    clear: clear,
    run: run
};
})();
