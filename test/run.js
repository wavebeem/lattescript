var parser = require("./xl").parser;

var code = (
"twice[twice[hello]]\n"
);

var ast = parser.parse(code);

function run(ast) {
    if (ast === undefined) {
        return;
    }

    if (ast.type === "twice") {
        for (var n = 0; n < 2; n++) {
            run(ast.body);
        }
    }
    else if (ast.type === "hello") {
        console.log("hello");
    }
}

run(ast);
