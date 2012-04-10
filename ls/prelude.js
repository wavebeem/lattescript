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

ls.dispatch.define("FUNC", "not", ["x"], function(c) {
    var x = get_var("x");
    if (x.type === "BOOL") {
        var val = {type: "BOOL", value: !x.value};
        var ret = {type: "RETURN", value: val}
        run(ret, c);
    }
    else {
        helpers.error("Can't logically negate a", x.type);
    }
});
});

ls.prelude();
