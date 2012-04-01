var say = function() {
    var time = new Date().toJSON();
    var msg  = [].join.call(arguments, " ");
    console.log(time + ":", msg);
};

var DELAY = 0;
var do_later = (function() {
    var q = [];

    function nq(x) {
        q.push(x);
    }

    function dq() {
        var x = q[0];
        q.shift();

        return x;
    }

    function process() {
        var f = dq();

        if (f)
            f();
        else
            throw new Error("Tried to overprocess the event queue!");
    }

    function do_later(f) {
        nq(f);
        setTimeout(process, DELAY);
    }

    return do_later;
})();

var done = function(c) {
    say("ALL DONE");
};

var results = (function() {
    var stack = [];

    function push(x) { stack.push(x); }
    function pop() { return stack.pop(); }

    return {push: push, pop: pop};
})();

var counter = 0;

var WHILE = function(node, c) {
    TEST(function() {
        var nextc;
        var cond = results.pop();
        if (cond) {
           say("while>", counter++);
            nextc = function() {
                WHILE(node, c);
            };
        }
        else {
            nextc = c;
        }

        do_later(nextc);
    });
}

var FACTORIAL = function(n, c) {
    var nextc;

    if (n < 2) {
        nextc = function() {
            say("factorial> base case");
            results.push(1);
            c();
        };
    }
    else {
        nextc = function() {
            say("factorial> recursive case");
            FACTORIAL(n - 1, function() {
                var m = results.pop();
                say("factorial>", m, "*", n);
                results.push(m * n);
                c();
            });
        };
    }

    do_later(nextc);
};

var input = (function() {
    var cb;

    function on_input(f) {
        cb = f;
    }

    function set(text) {
        results.push(text);
        if (cb) {
            cb();
            cb = undefined;
        }
    }

    return {on_input: on_input, set: set};
})();

var TEST = (function() {
    var n = 0;

    function always_true(c) {
        results.push(true);
        do_later(c);
    }

    function check_factorial(c) {
        FACTORIAL(n++, function() {
            var ans = results.pop();
            results.push(ans < 8000);
            do_later(c);
        });
    }

    function wait_for_input(c) {
        input.on_input(function() {
            var text = results.pop();
            say("Got input:", text);
            results.push(text !== 'q');
            do_later(c);
        });
    }

    return wait_for_input;
    //return always_true;
    //return check_factorial;
})();

WHILE({}, done);
