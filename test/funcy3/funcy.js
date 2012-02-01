var fs     = require("fs");
var util   = require("util");
var parser = require("./parser").parser;

var code = fs.readFileSync("test.funcy", "utf8");

parser.yy = {
    magic: "MAGIC!"
};

parser.lexer = {
    lex: function() {
        var matches = this.text.match(this.pattern);
        var indent  = matches[1];
        var id      = matches[2];
        var last_indent = this.indent[this.indent.length - 1];
        if (indent.length > last_indent) {
            this.indent.push(indent.length);
            this.tokens.push({token: 'INDENT', yytext: indent});
        }
        else if (indent.length < last_indent) {
            this.indent.pop();
            this.tokens.push({token: 'DEDENT', yytext: indent});
            this.tokens.push('DEDENT');
        }
        this.yytext = this.tokens[this.i].yytext;
        var next_token = this.tokens[this.i].token;
        console.log(">>> NEXT TOKEN IS", next_token);
        this.i++;
        return next_token;
    },

    setInput: function(str) {
        this.pattern = /(\s*)(\w+)/;
        this.yytext = "";
        this.text   = code;
        this.tokens = [];
        this.indent = [0];
        this.i      = 0;
    }
};
var ast = parser.parse(code);

console.log("[Abstract Syntax Tree]");
console.log(JSON.stringify(ast, null, 2));

var funcs = {};
var procs = {};

var dispatch = {
    BLOCK: function(node) {
        for (var n = 0; n < node.statements.length; n++) {
            run(node.statements[n]);
        }
    },

    PROC_CALL: function(node) {
        console.log("Calling procedure:", node.name);
        run(procs[node.name]);
    },

    PROC_DEF: function(node) {
        console.log("Defining procedure:", node.name);
        procs[node.name] = node.body;
    },

    FUNC_DEF: function(node) {
        console.log("Defining function:", node.name);
        funcs[node.name] = node.body;
    },

    SUB_DEFS: function(node) {
        for (var n = 0; n < node.sub_defs.length; n++) {
            run(node.sub_defs[n]);
        }
    },

    NOOP: function(node) {
    }
};

function run(node) {
    if (node && dispatch[node.type]) {
        dispatch[node.type](node);
    }
    else {
        console.log("No rule defined to run:", node);
    }
}

run(ast);

//console.log("[Functions]");
//console.log(funcs);

//console.log("[Procedures]");
//console.log(procs);

console.log("[Program Execution]");
if (procs.main) {
    run(procs.main);
}
else {
    console.log("Please define a main procedure.");
}
