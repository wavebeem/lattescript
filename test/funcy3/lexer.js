exports.lexer = (function() {
    var lexer = {};

    function lex() {
        if (lexer.text === "") {
            console.log("<<EOF>>");
            return 'EOF';
        }

        console.log("TEXT = '''");
        console.log(lexer.text);
        console.log("'''");

        for (var n = 0; n < patterns.length; n++) {
            var p = patterns[n];
            var t = try_pattern(p.pattern, p.func);

            if (t) {
                break;
            }
        }

        if (lexer.tokens[0] !== undefined) {
            console.log("TOKENS =", lexer.tokens);
            lexer.yytext = lexer.tokens[0].yytext;
            return lexer.tokens.shift().token;
        }
        else {
            return lex();
        }
    }

    function try_pattern(pattern, func) {
        var matches = lexer.text.match(pattern);

        if (matches === null) {
            return false;
        }
        else {
            console.log("MATCHED \"" + matches[0] + "\"");
            func(matches);
            lexer.text = lexer.text.substr(matches[0].length);
            return true;
        }
    }

    function set_input(str) {
        lexer.text = str;
        lexer.tokens = [];
        lexer.indents = [-1];

        lexer.first_line   = 1;
        lexer.first_column = 1;
        lexer.last_line    = 1;
        lexer.last_column  = 1;
    }

    function inc_line(line) {
        lexer.first_line++;
        lexer.last_line++;
    }

    function inc_column() {
        lexer.first_column++;
        lexer.last_column++;
    }

    function reset_column() {
        lexer.first_column = 1;
        lexer.last_column  = 1;
    }

    patterns = [
        {pattern: /^(\n)/, func: function(matches) {
            lexer.tokens.push({token: "NEWLINE", yytext: "\n"});
        }},
        {pattern: /^(while)/, func: function(matches) {
            lexer.tokens.push({token: "WHILE", yytext: "while"});
        }},
        {pattern: /^(\w+)/, func: function(matches) {
            var id = matches[1];
            lexer.tokens.push({token: "ID", yytext: id});
        }},
        {pattern: /^(\s*)(?=\S+)/, func: function(matches) {
            var whole   = matches[0];
            var spaces  = matches[1];
            var indent  = spaces.length;
            var last_indent = lexer.indents[lexer.indents.length - 1];
            if (indent > last_indent) {
                lexer.indents.push(indent);
                lexer.tokens.push({token: "INDENT", yytext: spaces});
            }
            else if (indent < last_indent) {
                lexer.indents.pop();
                lexer.tokens.push({token: "DEDENT", yytext: spaces});
            }
        }}
    ];

    lexer.lex = lex;
    lexer.setInput = set_input;

    return lexer;
})();
