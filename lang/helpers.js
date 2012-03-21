helpers = {};

helpers.list_eq = function(a, b) {
    if (a.values.length !== b.values.length) {
        return false;
    }

    for (var i = 0; i < a.values.length; i++) {
        var eq = ops.EQ(a.values[i], b.values[i]);
        if (! eq) {
            return false;
        }
    }

    return true;
};

helpers.identity = function(x) { return x; };

helpers.error = function() {
    var msg = [].join.call(arguments, " ");
    latte.print(msg);
    throw {type: "ERROR", message: msg};
}

helpers.textify = function(x, parent_lists) {
    // This variable helps to avoid printing circular lists forever.
    parent_lists = parent_lists === undefined? []: parent_lists;
    try {
        debug("Trying to textify", x);
        var t = x.type;
        if (t === "TEXT"   ) return x.value;
        if (t === "BOOL"   ) return x.value? "true": "false";
        if (t === "NUM"    ) return "" + x.value;
        if (t === "LIST"   ) return helpers.textify_list(x.values, parent_lists.concat(x));
        if (t === "NOTHING") return "nothing";
        throw "up";
    }
    catch (e) {
        helpers.error("Couldn't textify the", t);
    }
};

helpers.textify_list = function(xs, parent_lists) {
    var ts = [];
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        if (x.type === "LIST") {
            if (parent_lists.indexOf(x) >= 0) {
                ts.push("[...]");
            }
            else {
                ts.push(helpers.textify(x, parent_lists.concat(x)));
            }
        }
        else {
            if (x.type === "TEXT") {
                ts.push('"' + helpers.unescape(x.value) + '"');
            }
            else {
                ts.push(helpers.textify(x, parent_lists));
            }
        }
    }

    return "[" + ts.join(", ") + "]";
};

helpers.unescape = function(str) {
    return (str
        .replace(/\\/, "\\\\")
        .replace(/\n/, "\\n")
        .replace(/\"/, "\\\"")
    );
}

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
