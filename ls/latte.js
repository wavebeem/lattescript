ls.latte = (function(code) {
var debug = ls.helpers.debug;
var main  = ls.dispatch.main;
var run   = ls.dispatch.run;
parser.lexer = ls.lexer;
parser.yy.parseError = function(err, hash) {
    debug("err =", err);
    debug("hash =", hash);
};

var noop = function(){};

function compile(code) {
    var ast = parser.parse(code);
    console.log(ls.helpers.to_json(ast));
    return function(c) {
        run(ast, function() {
            main(c);
        });
    };
};

return {compile: compile};
})();
