(function() {
var get_var = ls.dispatch.call_stack.get_var;
var helpers = ls.helpers;

ls.dispatch.define({
    type: "PROC",
    name: "print",
    args: ["str"],
    vars: {},
    body: [{
        type: "JS",
        js: function() {
            var str = get_var("str");
            latte.print(helpers.textify(str));
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
        js: function() {
            var list = get_var("list");
            var item = get_var("item");
            debug("APPENDING WITH LIST =", list, "ITEM =", item);
            if (list.type === "LIST") {
                list.values.push(item);
            }
            else {
                helpers.error("First argument to append must be a list");
            }
        }
    }]
});
})();
