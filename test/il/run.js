var parser = require("./il").parser;

var code = (
// "twice twice hello"
"twice twice twice hello\n" +
"newline\n" +
"hello"
);

var ast = parser.parse(code);

console.log("[Abstract Syntax Tree]");
console.log(JSON.stringify(ast, null, 4));
console.log();
console.log("[Program Execution]");

function run(ast) {
    if (ast === undefined) {
        return;
    }

    if (ast.type === "block") {
        for (var n = 0; n < ast.statements.length; n++) {
            run(ast.statements[n]);
        }
    }
    else if (ast.type === "twice") {
        for (var n = 0; n < 2; n++) {
            run(ast.body);
        }
    }
    else if (ast.type === "hello") {
        console.log("hello");
    }
    else if (ast.type === "newline") {
        console.log();
    }
}

run(ast);
