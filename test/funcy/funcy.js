var fs     = require("fs");
var util   = require("util");
var parser = require("./parser").parser;

var code = fs.readFileSync("test.funcy", "utf8");

parser.yy = {
    magic: "MAGIC!"
};

var ast = parser.parse(code);

console.log("[Abstract Syntax Tree]");
console.log(JSON.stringify(ast, null, 4));
console.log();
console.log("[Program Execution]");

var funcs = {};
var procs = {};

var dispatch = {
    BLOCK: function(node) {
        for (var n = 0; n < node.statements.length; n++) {
            run(node.statements[n]);
        }
    },

    PROC_CALL: function(node) {
        console.log("Calling", node.name);
    },

    PROC_DEF: function(node) {
        procs[node.name] = node.body;
    },

    FUNC_DEF: function(node) {
        funcs[node.name] = node.body;
    },

    SUB_DEFS: function(node) {
        for (var n = 0; n < node.sub_defs.length; n++) {
            run(node.sub_defs[n]);
        }
    },

    PROC_CALL: function(node) {
        console.log("Calling", node.name);
    }
};

function run(node) {
    if (dispatch[node.type]) {
        dispatch[node.type](node);
    }
    else {
        console.log("No rule defined to run", node);
    }
}

run(ast);
if (procs.main) {
    run(procs.main);
}
else {
    console.log("Please define a main procedure.");
}
