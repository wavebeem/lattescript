ls.latte = (function(code) {
var debug = ls.helpers.debug;
var main  = ls.dispatch.main;
var run   = ls.dispatch.run;

function error(err, lineno) {
    var msg = "Error: " + err;
    latte.print(msg);
    latte.show_stack_trace([{line: lineno}]);
    latte.finish();
    throw new Error(msg);
}

parser.lexer = ls.lexer;
parser.yy.parseError = function(err, hash) {
    var lineno = hash.line + 1;
    console.log("err =", err);
    console.log("lineno =", lineno);
    error(err, lineno);
};

var noop = function(){};

function compile(code) {
    var ast = parser.parse(code);
    debug(ls.helpers.to_json(ast));
    return function(c) {
        run(ast, c);
    };
};

return {compile: compile};
})();
