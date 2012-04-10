ls.dispatch = (function() {
var exports = {};
var dispatch = {};
var procs = {};
var funcs = {};

var debug = ls.helpers.debug;
var error = ls.helpers.error;
var do_later = ls.helpers.do_later;
var to_json  = ls.helpers.to_json;

(function() {
    var noop = function(){};
    var cb = noop;

    function set_input_callback(c) {
        cb = c;
    }

    function set_input(txt) {
        var c = cb;
        cb = noop;

        var obj = {type: "TEXT", value: txt};
        results.push(obj);
        do_later(c);
    }

    exports.set_input_callback = set_input_callback;
    exports.set_input = set_input;
})();

var clear = function() {
    procs = {};
    funcs = {};

    results.clear();
    call_stack.clear();

    ls.prelude();
};

var define = function(sub) {
    var table = {PROC: procs, FUNC: funcs};
    table[sub.type][sub.name] = sub;
};

var results = (function() {
    var stack = [];

    function push(x) { stack.push(x) }
    function pop() { return stack.pop() }
    function clear() { stack = [] }

    return {push: push, pop: pop, clear: clear};
})();

var call_stack = (function() {
    var stack = [];

    function peek() {
        return stack[stack.length - 1];
    }
    function pop() {
        debug("POPPING THE STACK");
        var call = stack.pop();
        return call;
    }

    function push(x) {
        debug("PUSHING THE STACK");
        stack.push(x);
    }

    function trace() {
        var i = stack.length;
        var stack_trace = [];
        while (i--) {
            var map   = {PROC: "procedure", FUNC: "function"};
            var call  = stack[i];
            var type  = map[call.type] || "<oops>";
            var line  = call.lineno;
            var len   = ("" + line).length;
            var pad   = len === 3? "": len === 2? " ": "  ";

            stack_trace.push({line: line, type: type, name: call.name});
        }

        latte.show_stack_trace(stack_trace);
    }

    function get_var(id) {
        var vars = peek().vars;
        if (id in vars) {
            return vars[id];
        }
        else {
            debug("in:", peek().name);
            debug("current variables:", vars);
            error("Unable to get value of undeclared variable:", id);
        }
    }

    function set_var(id, val) {
        var vars = peek().vars;
        if (id in vars) {
            debug("Setting", id, "to", val);
            vars[id] = val;
        }
        else {
            debug("in:", peek().name);
            debug("current variables:", vars);
            error("Unable to set value of undeclared variable:", id);
        }
    }

    function clear() { stack = [] }

    return {
        get_var: get_var,
        set_var: set_var,
        trace:   trace,
        clear:   clear,
        peek:    peek,
        push:    push,
        pop:     pop
    };
})();

var get_var = call_stack.get_var;
var set_var = call_stack.set_var;

function mutable_list_copy(node, c) {
    debug("attempting to make mutable_list_copy of:", node);

    if (node.type !== "LIST" || !node.immutable) return node;

    var result = {type: "LIST", values: []};

    var src  = node.values;
    var dest = result.values;

    list_copy_helper(src, dest, function() {
        results.push(result);
        do_later(c);
    });
}

function list_copy_helper(src, dest, c) {
    if (src.length > 0) {
        evaluate(src[0], function() {
            var item = results.pop();
            dest.push(item);
            list_copy_helper(src.slice(1), dest, c);
        });
    }
    else {
        do_later(c);
    }
}

var evaluate = function e(node, c) {
    if (node && node.type in e) {
        e[node.type](node, c);
    }
    else {
        results.push(node);
        do_later(c);
    }
}

evaluate.READ = function(node, c) {
    latte.blink_input();
    latte.enable_submit();
    ls.dispatch.set_input_callback(c);
};

evaluate.LIST = function(node, c) {
    if (! node.immutable)
        return node;

    var copy = mutable_list_copy;

    copy(node, function() {
        var list = results.pop();
        results.push(list);
        do_later(c);
    });
};

evaluate.LEN = function(node, c) {
    evaluate(node.arg, function() {
        var val = results.pop();
        if (val.type === "LIST") {
            results.push({type: "NUM", value: val.values.length});
            do_later(c);
        }
        else {
            error("Unable to determine the length of a", val.type);
        }
    });
};

evaluate.NEG = function(node, c) {
    evaluate(node.arg, function() {
        var val = results.pop();
        if (val.type === "NUM") {
            results.push({type: "NUM", value: -val.value});
            do_later(c);
        }
        else {
            error("Cannot negate a", val.type);
        }
    });
};

evaluate.POS = function(node, c) {
    evaluate(node.arg, function() {
        var val = results.pop();
        if (val.type === "NUM") {
            results.push(val);
            do_later(c);
        }
        else {
            error("Cannot apply unary plus to a", val.type);
        }
    });
};

evaluate.OP = function(node, c) {
    ls.ops.apply_op(node.op, node.left, node.right, c);
}

evaluate.FUNC_CALL = function(node, c) {
    run(node, c);
};

evaluate.ID = function(node, c) {
    results.push(get_var(node.value));
    do_later(c);
};

dispatch.BLOCK = function(node, c) {
    debug("RUNNING BLOCK:", to_json(node));
    block_helper(node.body, c);
};

function block_helper(body, c) {
    if (body.length === 0) {
        do_later(c);
    }
    else {
        run(body[0], function() {
            block_helper(body.slice(1), c);
        });
    }
}

dispatch.JS = function(node, c) {
    node.js();
    debug("RAN. JS");
    do_later(c);
}

dispatch.WHILE = function WHILE(node, c) {
    debug("While loop");
    evaluate(node.condition, function() {
        var cond = results.pop();

        if (cond.type !== "BOOL") {
            error("Loop conditional must be true or false");
        }

        if (cond.value) {
            run({type: "BLOCK", body: node.statements}, function() {
                run(node, c);
            });
        }
        else {
            do_later(c);
        }
    });
};

dispatch.UNTIL = function UNTIL(node, c) {
    debug("Until loop");
    evaluate(node.condition, function() {
        var cond = results.pop();

        if (cond.type !== "BOOL") {
            error("Loop conditional must be true or false");
        }

        if (! cond.value) {
            run({type: "BLOCK", body: node.statements}, function() {
                run(node, c);
            });
        }
        else {
            do_later(c);
        }
    });
};

dispatch.FOR_RANGE = function(node, c) {
    evaluate(node.from, function() {
        var begin = results.pop();
        evaluate(node.to, function() {
            var end = results.pop();
            evaluate(node.by, function() {
                var step = results.pop();
                var var_name = node["var"].value;

                if (begin.type !== "NUM"
                ||  end  .type !== "NUM"
                ||  step .type !== "NUM") {
                    error("For-loop indices must be numbers!");
                }

                if (step.value === 0) {
                    error("Step size cannot be 0");
                }

                begin = begin.value;
                end   = end  .value;
                step  = step .value;
                node  = {type: "BLOCK", body: node.statements};
                i     = begin;
                for_range_helper(node, var_name, begin, end, step, i, c);
            });
        });
    });
}

function for_range_helper(node, var_name, begin, end, step, i, c) {
    if ((step > 0 && i <= end) || (step < 0 && i >= end)) {
        set_var(var_name, {type: "NUM", value: i});
        run(node, function() {
            for_range_helper(node, var_name, begin, end, step, i + step, c);
        });
    }
    else {
        do_later(c);
    }
}

dispatch.FOR_EACH = function(node, c) {
    evaluate(node.list, function() {
        var list = results.pop();
        var var_name = node["var"].value;
        var is_string = false;

        if (list.type === "LIST") {
            // Copy the list so we don't loop forever if the loop body modifies the list
            list = list.values.slice(0);
        }
        else if (list.type === "TEXT") {
            list = list.value;
            is_string = true;
        }
        else {
            error("Foreach loop only works on text and lists");
        }

        node = {type: "BLOCK", body: node.statements};
        for_each_helper(node, is_string, var_name, list, 0, c);
    });
}

function for_each_helper(node, is_string, var_name, list, i, c) {
    if (0 <= i && i < list.length) {
        if (is_string) {
            set_var(var_name, {type: "TEXT", value: list[i]});
        }
        else {
            set_var(var_name, list[i]);
        }

        run(node, function() {
            for_each_helper(node, is_string, var_name, list, i + 1, c);
        });
    }
    else {
        do_later(c);
    }
}

dispatch.PROC_CALL = function(node, c) {
    if (procs[node.name]) {
        debug("Calling function:", node.name);
        do_later(function() {
            call_sub("PROC", procs[node.name], node.args, c);
        });
    }
    else {
        error("Procedure", node.name, "is undefined");
    }
};

dispatch.FUNC_CALL = function(node, c) {
    if (funcs[node.name]) {
        debug("Calling function:", node.name);
        do_later(function() {
            call_sub("FUNC", funcs[node.name], node.args, c);
        });
    }
    else {
        error("Function", node.name, "is undefined");
    }
};

function call_sub(sub_type, node, args, c) {
    var bound_sub = {
        lineno: undefined,
        type: sub_type,
        name: node.name,
        body: node.body,
        args: node.args,
        vars: {},
        c: c
    };

    debug("call_sub(node, args) where");
    debug("node.args =", node.args);
    debug("args =", args);
    debug("node.vars =", node.vars);

    if (node.args.length != args.length) {
        error("Incorrect number of arguments to", node.name);
    }

    // Bind the arguments passed in to the procedure call to the names
    // specified in the argument list in the function definition.
    bind_args_to_sub(bound_sub, node, args, 0, function() {
        // Insert the "with" variables into the vars mapping,
        // but leave them "undefind" by mapping them to null.
        for (var i = 0; i < node.vars.length; i++) {
            bound_sub.vars[node.vars[i]] = {type: "NOTHING"};
        }

        call_stack.push(bound_sub);
        debug("PUSHING", node.name, "ONTO CALL STACK");
        if (sub_type === "FUNC") {
            debug("DO_BOUND_FUNC TIME");
            do_bound_func(bound_sub, 0, c);
        }
        else if (sub_type === "PROC") {
            debug("DO_BOUND_PROC TIME");
            do_bound_proc(bound_sub, 0, c);
        }
        else {
            throw new Error("Bad sub_type: " + sub_type);
        }
    });
}

function bind_args_to_sub(bound_sub, node, args, i, c) {
    debug("WANT TO BIND: i =", i);
    debug("WANT TO BIND: len =", node.args.length);
    if (0 <= i && i < node.args.length) {
        debug("BINDING", node.args[i]);
        evaluate(args[i], function() {
            var evald_arg = results.pop();
            bound_sub.vars[node.args[i]] = evald_arg;
            do_later(function() {
                bind_args_to_sub(bound_sub, node, args, i + 1, c);
            });
        });
    }
    else {
        debug("NOT BINDING");
        do_later(c);
    }
}

function do_bound_func(bound_func, i, c) {
    // If we still have instructions to run
    if (0 <= i && i < bound_func.body.length) {
        var node = bound_func.body[i];
        call_stack.peek().lineno = node.lineno;
        run(node, function() {
            do_bound_func(bound_func, i + 1, c);
        });
    }
    // Throw error if the user forgets to return
    else if (! bound_func.has_returned) {
        error("Function ended without returning a value");
    }
    else {
        call_stack.pop();
        do_later(c);
    }
}

function do_bound_proc(bound_proc, i, c) {
    // If we still have instructions to run
    if (0 <= i && i < bound_proc.body.length) {
        var node = bound_proc.body[i];
        call_stack.peek().lineno = node.lineno;
        run(node, function() {
            do_bound_proc(bound_proc, i + 1, c);
        });
    }
    else {
        call_stack.pop();
        do_later(c);
    }
}

dispatch.RETURN = function(node, c) {
    debug("RETURNING", node.value);
    var its_popping_time = function() {
        // Call the continuation for after the current call
        // (i.e. jump out of the current call).
        call_stack.pop();
        do_later(frame.c);
    };
    var frame = call_stack.peek();
    if (frame.type === "FUNC") {
        if (! ("value" in node)) {
            error("You forgot your argument to \"return\"");
        }
        evaluate(node.value, function() {
            var val = results.pop();
            results.push(val);
            its_popping_time();
        });
    }
    else if (frame.type === "PROC") {
        if ("value" in node) {
            error("Can't return a value from a procedure");
        }
        its_popping_time();
    }
    else {
        throw new Error("What kind of call stack frame type is this? "
            + frame.type);
    }
}

dispatch.PROC_DEF = function(node, c) {
    debug("Defining procedure:", node.name);
    procs[node.name] = {
        name: node.name,
        args: node.args,
        vars: node.vars,
        body: node.body
    };

    do_later(c);
};

dispatch.FUNC_DEF = function(node, c) {
    debug("Defining function:", node.name);
    funcs[node.name] = {
        name: node.name,
        args: node.args,
        vars: node.vars,
        body: node.body
    };

    do_later(c);
},

dispatch.SUB_DEFS = function(node, c) {
    sub_defs_helper(node.sub_defs, c);
};

function sub_defs_helper(defs, c) {
    if (defs.length > 0) {
        run(defs[0], function() {
            sub_defs_helper(defs.slice(1), c);
        });
    }
    else {
        do_later(c);
    }
};

dispatch.SET = function(node, c) {
    evaluate(node.left, function() {
        var left = results.pop().values;
        evaluate(node.at, function() {
            var idx = results.pop().value;
            evaluate(node.right, function() {
                var right = results.pop();

                // TODO: Add error checking
                left[idx - 1] = right;

                do_later(c);
            });
        });
    });
}


dispatch.ASSIGN = function(node, c) {
    if (node.left.type === "ID") {
        var name = node.left.value;
        evaluate(node.right, function() {
            var val = results.pop();
            debug("Setting", name, "to", val);
            set_var(name, val);
            do_later(c);
        });
    }
    else {
        error("Unable to assign:", to_json(node));
    }
};

dispatch.IF = function(node, c) {
    evaluate(node.condition, function() {
        var val = results.pop();
        if (val.type === "BOOL") {
            if (val.value) {
                debug("THE IF WAS TRUE");
                run({type: "BLOCK", body: node.body}, c);
            }
            else {
                if ("else" in node) {
                    debug("THE IF WAS ELSE");
                    run(node["else"], c);
                }
                else {
                    debug("THE IF WAS FALSE AND HAD NO ELSE");
                    do_later(c);
                }
            }
        }
        else {
            error("If condition shoud be true or false.");
        }
    });
};

dispatch.NOOP = function(node, c) {
    do_later(c);
};

function run(node, c) {
    //debug("RUN!", node.type);
    if (node && dispatch[node.type]) {
        do_later(function() {
            dispatch[node.type](node, c);
        });
    }
    else {
        error("No rule defined to run:", to_json(node));
    }
}

var noop = function(){};

function main(c) {
    ls.dispatch.run({type: "PROC_CALL", name: "main", args: []}, c);
}

exports.call_stack = call_stack;
exports.evaluate = evaluate;
exports.results = results;
exports.define = define;
exports.clear = clear;
exports.main = main;
exports.run = run;

return exports;
})();
