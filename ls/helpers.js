ls.helpers = (function() {
h = {};

h.do_later = (function() {
    var DELAY = 0;
    var q = [];
    var done = false;
    var count = 0;
    var max = 10;

    function process() {
        if (done)
            return;

        if (q === []) {
            h.debug(q);
            throw new Error("Tried to overprocess the event queue!");
        }
        else {
            var f = q.shift();

            if (typeof(f) === "function") {
                f();
            }
            else {
                throw new Error("process() cannot execute a non-function");
            }
        }
    }

    function schedule(f) {
        count++;
        q.push(f);

        if (count > max) {
            count = 0;
            setTimeout(process, DELAY);
        }
        else {
            process();
        }
    }

    function quit() {
        count = 0;
        done = true;
        q = [];
    }

    function reset() {
        count = 0;
        done = false;
        q = [];
    }

    function do_later(f) {
        if (done)
            return;

        schedule(f);
    }

    do_later.quit  = quit;
    do_later.reset = reset;

    return do_later;
})();

h.quit  = h.do_later.quit;
h.reset = h.do_later.reset;

var DEBUG = true;
var DEBUG_PREFIX = "DEBUG: ";

h.debug = function() {
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
}

var debug = h.debug;

h.to_json = function(obj) {
    return JSON.stringify(obj, null, 2);
}

h.list_eq = function(a, b) {
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

h.identity = function(x) { return x; };

h.error = function() {
    var msg = [].join.call(arguments, " ");
    latte.print(msg);
    throw new Error(msg);
}

h.textify = function(x, parent_lists) {
    // This variable helps to avoid printing circular lists forever.
    parent_lists = parent_lists === undefined? []: parent_lists;
    try {
        debug("Trying to textify", x);
        var t = x.type;
        if (t === "TEXT"   ) return x.value;
        if (t === "BOOL"   ) return x.value? "true": "false";
        if (t === "NUM"    ) return "" + x.value;
        if (t === "LIST"   ) return h.textify_list(x.values, parent_lists.concat(x));
        if (t === "NOTHING") return "nothing";
        throw "up";
    }
    catch (e) {
        h.error("Couldn't textify the", t);
    }
};

h.textify_list = function(xs, parent_lists) {
    var ts = [];
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        if (x.type === "LIST") {
            if (parent_lists.indexOf(x) >= 0) {
                ts.push("[...]");
            }
            else {
                ts.push(h.textify(x, parent_lists.concat(x)));
            }
        }
        else {
            if (x.type === "TEXT") {
                ts.push('"' + h.unescape(x.value) + '"');
            }
            else {
                ts.push(h.textify(x, parent_lists));
            }
        }
    }

    return "[" + ts.join(", ") + "]";
};

h.unescape = function(str) {
    return (str
        .replace(/\\/, "\\\\")
        .replace(/\n/, "\\n")
        .replace(/\"/, "\\\"")
    );
}

return h;
})();
