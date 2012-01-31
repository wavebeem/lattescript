var fs     = require("fs");
var parser = require("./parser").parser;

var code = fs.readFileSync("test.begin", "utf8");

parser.yy = {
    magic: "MAGIC!"
};

var ast = parser.parse(code);

console.log("[Abstract Syntax Tree]");
console.log(JSON.stringify(ast, null, 4));
console.log();
console.log("[Program Execution]");

var count = 0;
function run(ast) {
    if (ast === undefined) {
        return;
    }

    if (ast.type === "BLOCK") {
        for (var n = 0; n < ast.statements.length; n++) {
            run(ast.statements[n]);
        }
    }
    else if (ast.type === "TWICE") {
        for (var n = 0; n < 2; n++) {
            run(ast.body);
        }
    }
    else if (ast.type === "COUNT") {
        console.log(count++);
    }
    else if (ast.type === "SKIP") {
        console.log();
    }
}

run(ast);
