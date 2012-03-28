ls.dispatch.define({
    type: "PROC",
    name: "print",
    args: ["str"],
    vars: {},
    body: [{
        type: "JS",
        js: function() {
            var str = get_var("str");
            if (DEBUG) {
                latte.print("PRINTPRINTPRINT>>>:", helpers.textify(str));
            }
            else {
                latte.print(helpers.textify(str));
            }
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
