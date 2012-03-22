dispatch = {};

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

    ///// XXX TRANSFORM THIS INTO SET_INTERVAL CALL
    ///// XXX AND CLEAR_TIMEOUT LATER
    ///// XXX OTHERWISE IT'S INFINITE RECURSION LOL

    if (cond.value) {
        add_to_thing_q(function() {
            run(node);
        });
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

dispatch.FORRANGE = function(node) {
    var begin = evaluate(node.from);
    var end   = evaluate(node.to);
    var step  = evaluate(node.by);

    if (begin.type !== "NUM"
    ||  end  .type !== "NUM"
    ||  step .type !== "NUM") {
        helpers.error("For-loop indices must be numbers!");
    }

    var var_name = node["var"].value;

    if (step.value === 0) {
        helpers.error("Step size cannot be 0");
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

dispatch.FOREACH = function(node) {
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
        helpers.error("Foreach loop only works on text and lists");
    }
}

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
    // but leave them "undefined" by mapping them to null.
    for (var i = 0; i < node.vars.length; i++) {
        vars[node.vars[i]] = {type: "NOTHING"};
    }
    bound_proc.vars = vars;

    show_stack_trace();
    debug("PUSHING", node.name, "ONTO CALL STACK");
    call_stack.push(bound_proc);
    debug("CURRENT CALL =", current_call().name);
    show_stack_trace();
    add_to_thing_q(function() {
        for (var i = 0; i < bound_proc.body.length; i++) {
            try {
                //// XXX THIS USED TO "BLOCK"
                //// BUT NOW IT DOESN'T
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
        //// XXX SO IT GETS HERE BEFORE IT'S ACTUALLY DONE
        debug("POPPING THE CALL STACK");
        call_stack.pop();
    });
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
};

dispatch.NOOP = function(node) {};

thing_q = [];

var run = function run_later(node) {
    var t = node.type;
    if (t === "SUB_DEFS" || t === "PROC_DEF" || t === "FUNC_DEF") {
        run_now(node);
    }
    else {
        add_to_thing_q(function() { run_now(node); });
    }
};

var add_to_thing_q = function(fun) {
    thing_q.push(fun);
    setTimeout(function() {
        debug("CALL STACK =", to_json(call_stack));
        debug("THING Q =", thing_q);

        thing_q[0]();
        thing_q.shift();
    }, 10);
}

function run_now(node) {
    if (node && dispatch[node.type]) {
        return dispatch[node.type](node);
    }
    else {
        helpers.error("No rule defined to run:", to_json(node));
    }
}
