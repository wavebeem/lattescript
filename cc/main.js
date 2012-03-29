var DELAY = 100;

var constant = function(k){return function(){return k}};
var noop = function(){};

var counter = 0;
var ret_stack = [];

var Push = function(x) { ret_stack.push(x) };
var Pop  = function() { return ret_stack.pop() };

var WHILE = function(node, c) {
    node.condition(function() {
        var nextc;
        var cond = Pop();
        if (cond) {
            console.log(counter++);
            nextc = function() {
                WHILE(node, c);
            };
        }
        else {
            nextc = c;
        }

        setTimeout(nextc, DELAY);
    });
}

var FACTORIAL = function(n, c) {
    var nextc;

    if (n < 2) {
        nextc = function() {
            console.log("> 1");
            Push(1);
            c();
        };
    }
    else {
        nextc = function() {
            FACTORIAL(n - 1, function() {
                var m = Pop();
                console.log(">", m, "*", n);
                Push(m * n);
                c();
            });
        };
    }

    setTimeout(nextc, DELAY);
};

var TEST = (function() {
    var n = 0;
    return function(c) {
        FACTORIAL(n++, c);
    };
})();

var browser = function browser() {
    console.log("####################");
    setTimeout(browser, 100);
};

//WHILE(ast, noop);
//browser();

FACTORIAL(5, function() {
    console.log(Pop());
});
