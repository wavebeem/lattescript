ls.latte = (function(code) {
var debug = ls.helpers.debug;
parser.lexer = ls.lexer;
parser.yy.parseError = function(err, hash) {
    debug("err =", err);
    debug("hash =", hash);
};

function compile(code) {
    var ast = parser.parse(code);
    console.log(ls.helpers.to_json(ast));
    ls.dispatch.run(ast);
    return function() {
        ls.dispatch.run({type: "PROC_CALL", name:"main", args: []});
    };
};

return {compile: compile};
})();
