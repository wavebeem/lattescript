ls.prelude = (function() {
var get_var  = ls.dispatch.call_stack.get_var;
var results  = ls.dispatch.results;
var run      = ls.dispatch.run;
var do_later = ls.helpers.do_later;
var helpers  = ls.helpers;
var debug    = ls.debug;

ls.dispatch.define({
    type: "PROC",
    name: "print",
    args: ["str"],
    vars: {},
    body: [{
        type: "JS",
        js: function(c) {
            var str = get_var("str");
            latte.print(helpers.textify(str));
            do_later(c);
        }
    }]
});

ls.dispatch.define({
    type: "PROC",
    name: "write",
    args: ["str"],
    vars: {},
    body: [{
        type: "JS",
        js: function(c) {
            var str = get_var("str");
            latte.write(helpers.textify(str));
            do_later(c);
        }
    }]
});

ls.dispatch.define({
    type: "PROC",
    name: "append",
    args: ["list", "item"],
    vars: {},
    body: [{
        type: "JS",
        js: function(c) {
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
        }
    }]
});

ls.dispatch.define({
    type: "FUNC",
    name: "not",
    args: ["x"],
    vars: {},
    body: [{
        type: "JS",
        js: function(c) {
            var x = get_var("x");
            if (x.type === "BOOL") {
                var val = {type: "BOOL", value: !x.value};
                var ret = {type: "RETURN", value: val}
                run(ret, c);
            }
            else {
                helpers.error("Can't logically negate a", x.type);
            }
        }
    }]
});
});

ls.prelude();
