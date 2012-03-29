var say = function() {
    var time = new Date().toJSON();
    var msg  = [].join.call(arguments, " ");
    console.log(time + ":", msg);
};

var DELAY = 500;

var results = (function() {
    var stack = [];

    function push(x) { stack.push(x); }
    function pop() { return stack.pop(); }

    return {push: push, pop: pop};
})();

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

    setTimeout(nextc, DELAY);
};

FACTORIAL(7, function() {
    say("result>", results.pop());
});
