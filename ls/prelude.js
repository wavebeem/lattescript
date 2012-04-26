ls.prelude = (function() {
var get_var  = ls.dispatch.call_stack.get_var;
var results  = ls.dispatch.results;
var run      = ls.dispatch.run;
var do_later = ls.helpers.do_later;
var helpers  = ls.helpers;
var debug    = ls.helpers.debug;

ls.dispatch.define("PROC", "print", ["str"], function(c) {
    var str = get_var("str");
    latte.print(helpers.textify(str));
    do_later(c);
});

ls.dispatch.define("PROC", "write", ["str"], function (c) {
    var str = get_var("str");
    latte.write(helpers.textify(str));
    do_later(c);
});

ls.dispatch.define("PROC", "append", ["list", "item"], function (c) {
    var list = get_var("list");
    var item = get_var("item");
    debug("APPENDING WITH LIST =", list, "ITEM =", item);
    if (list.type === "LIST") {
        list.values.push(item);
        do_later(c);
    }
    else {
        helpers.error("First argument to append must be a list");
    }
});

var func_maker = function(args) {
    ls.dispatch.define("FUNC", args.name, ["x"], function(c) {
        var x = get_var("x");
        if (x.type === args.in_type) {
            var val = {type: args.out_type, value: args.func(x.value)};
            var ret = {type: "RETURN", value: val}
            run(ret, c);
        }
        else {
            helpers.error("Can't apply", args.name, "to a", x.type);
        }
    });
};

func_maker({name: "not",
    in_type:  "BOOL",
    out_type: "BOOL",
    func: function(x) {
        return !x;
    }
});

func_maker({name: "even",
    in_type:  "NUM",
    out_type: "BOOL",
    func: function(x) {
        return x % 2 === 0;
    }
});

func_maker({name: "odd",
    in_type:  "NUM",
    out_type: "BOOL",
    func: function(x) {
        return x % 2 === 1;
    }
});

func_maker({name: "round",
    in_type:  "NUM",
    out_type: "NUM",
    func: function(x) {
        return Math.round(x);
    }
});

func_maker({name: "number",
    in_type:  "TEXT",
    out_type: "NUM",
    func: function(x) {
        return parseFloat(x);
    }
});

func_maker({name: "numeric",
    in_type:  "NUM",
    out_type: "BOOL",
    func: function(x) {
        return !isNaN(x);
    }
});
});

ls.prelude();
