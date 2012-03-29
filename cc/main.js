var DELAY = 30;

var constant = function(k){return function(){return k}};
var noop = function(){};

var counter = 0;
var ret_stack = [];

var Push = function(x) { ret_stack.push(x) };
var Pop  = function() { return ret_stack.pop() };

var WHILE = function(node, c) {
    var nextc;
    var cond = node.condition();

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
}

var FACTORIAL = function(n, c) {
    var nextc;

    if (n < 2) {
        nextc = function() {
            Push(1);
            c();
        };
    }
    else {
        nextc = function() {
            FACTORIAL(n - 1, c);
            Push(Pop() * n);
        };
    }
};

var ast = (function() {
//  var x = 10;
//  return {condition: function() {
//      return x --> 0;
//  }};

//  return {condition: constant(true)};

    var n = 0;
    return {condition: function() {
        FACTORIAL(n++, noop);
        return Pop();
    }};
})();

var browser = function browser() {
    console.log("####################");
    setTimeout(browser, 100);
};

//WHILE(ast, noop);
//browser();

FACTORIAL(5);
console.log(Pop());
