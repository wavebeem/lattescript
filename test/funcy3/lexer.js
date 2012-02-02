exports.lexer = (function() {
    var lexer = {};

    function lex() {
        if (lexer.tokens.length > 0) {
            return get_token();
        }

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

        if (lexer.tokens.length > 0) {
            return get_token();
        }
        else {
            return lex();
        }
    }

    function get_token() {
        var token = lexer.tokens.shift();
        lexer.yytext = token.yytext;
        //lexer.token_history.push(token.token);
        lexer.token_history.push(token);
        console.log("TOKENS =", lexer.tokens);
        console.log("TOKEN HISTORY =\n", lexer.token_history);
        return token.token;
    }

    function try_pattern(pattern, func) {
        var matches = lexer.text.match(pattern);

        if (matches === null) {
            return false;
        }
        else {
            //console.log("MATCHED \"" + matches[0] + "\"");
            func(matches);
            consume(matches[0].length);
            return true;
        }
    }

    // Consumes n characters
    function consume(n) {
        for (var i = 0; i < n; i++) {
            if (lexer.text[i] === "\n") {
                inc_line();
                reset_column();
            }
            else {
                inc_column();
            }
        }
        lexer.text = lexer.text.substr(n);
    }

    function set_input(str) {
        lexer.text = str + "\n";
        lexer.tokens = [];
        lexer.indents = [0];
        lexer.token_history = [];

        lexer.line   = 1;
        lexer.column = 1;
    }

    function inc_line(line) {
        lexer.line++;
    }

    function inc_column() {
        lexer.column++;
    }

    function reset_column() {
        lexer.column = 1;
    }

    patterns = [
        // Matches comments
        // (whitespace* comment) LOOKAHEAD(newline)
        {pattern: /^(\s*;.*?)(?=\n)/, func: function(matches) {
        }},

        // Matches newlines and indentation
        // newline whitespace*
        {pattern: /^(\s*\n)([ ]*)/, func: function(matches) {
            lexer.tokens.push({token: "NEWLINE", yytext: "\n"});
            var whole   = matches[0];
            var newline = matches[1];
            var spaces  = matches[2];
            var indent  = spaces.length;
            var last_indent = lexer.indents[lexer.indents.length - 1];
            if (indent > last_indent) {
                lexer.indents.push(indent);
                lexer.tokens.push({token: "INDENT", yytext: spaces});
            }
            else if (indent < last_indent) {
                while (indent < last_indent) {
                    lexer.indents.pop();
                    lexer.tokens.push({token: "DEDENT", yytext: spaces});
                    last_indent = lexer.indents[lexer.indents.length - 1];
                }
            }
        }},

        // Matches ``while''
        {pattern: /^(while)/, func: function(matches) {
            lexer.tokens.push({token: "WHILE", yytext: "while"});
        }},

        // Matches identifiers
        {pattern: /^(\w+)/, func: function(matches) {
            var id = matches[1];
            lexer.tokens.push({token: "ID", yytext: id});
        }},
    ];

    lexer.lex = lex;
    lexer.setInput = set_input;

    return lexer;
})();
